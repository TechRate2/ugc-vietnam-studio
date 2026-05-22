"""Persona 0 (NEW — Pre-analysis): Visual Asset Planner.

Học pattern TopView V2 + ViMax + Huobao `extractor`: TRƯỚC khi gọi Director,
phân tích từng reference image bằng vision LLM để:
    1. Detect ROLE chính xác (primary_subject / product_hero / style_ref / environment...)
    2. Extract FACE DESCRIPTOR cho character consistency anchor (Higgsfield Soul.0 style)
    3. Recommend USAGE per asset (keyframe_anchor / i2v_input / style_only / skip)
    4. Flag missing critical refs để frontend prompt user upload thêm

Output `primary_character_anchor` cực kỳ quan trọng — Phase 3 storyboard_keyframer
sẽ inject `face_descriptor` + `face_lock_url` vào mỗi keyframe gen để giữ identity
xuyên 6-8 shots (giải pháp 2026 chuẩn — KHÔNG train LoRA, dùng multi-turn anchor).

Model: qwen3-vl-30b-instruct ($0.15/$0.60) — vision LLM rẻ + đủ smart cho task này.
Cost: ~$0.005-0.012/proposal tuỳ số lượng refs (1 LLM call multi-image).

Tại sao chạy TRƯỚC Strategist + Director:
    - Strategist hiện chỉ biết "N ảnh attachments" → KHÔNG biết role
    - Director invent character_sheet độc lập với ảnh user → drift face
    - Reference Analyzer cũ chạy SAU Director → quá muộn để Director dùng anchor
    - Pattern top agents: pre-analysis luôn là stage đầu tiên
"""

import base64
import io
import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm

_PROMPT_PATH = Path(__file__).parent / "prompts" / "visual_planner_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


# Resize aggressive — fix vision LLM 400/413 khi base64 payload quá lớn.
# 768px là sweet spot cho vision LLM (đủ detail face + outfit, payload chỉ ~80KB/ảnh).
# JPEG 75 giảm size 50% so với 85 mà chất lượng vẫn OK cho LLM analysis.
MAX_IMAGE_DIMENSION = 768  # giảm từ 1024 → 768 (FIX 4)
JPEG_QUALITY = 75  # giảm từ 80 → 75 (FIX 4)


def _maybe_resize_data_url(url: str) -> str:
    """Resize data URL base64 ảnh xuống MAX_IMAGE_DIMENSION + JPEG 80%."""
    if not url or not url.startswith("data:image"):
        return url
    try:
        from PIL import Image
    except ImportError:
        return url
    try:
        _, payload = url.split(",", 1)
        raw = base64.b64decode(payload)
        img = Image.open(io.BytesIO(raw))
        if max(img.size) <= MAX_IMAGE_DIMENSION:
            return url
        img.thumbnail((MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION), Image.Resampling.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        b64 = base64.b64encode(out.getvalue()).decode("ascii")
        return f"data:image/jpeg;base64,{b64}"
    except Exception as e:
        logger.warning(f"[VisualPlanner] resize fail (non-fatal): {e}")
        return url


def plan(
    reference_images: list[str],
    product_input: dict,
    user_brief: str,
    tech_config: dict,
    role_hints: Optional[list[Optional[str]]] = None,
) -> dict:
    """Pre-analyze reference images → VisualPlan JSON.

    Args:
        reference_images: list URL/base64 (0-12).
        product_input: {url, text_description, image_urls} — để LLM biết sản phẩm là gì.
        user_brief: free-text ý tưởng user — hint role detection (vd user nói "cô gái...")
        tech_config: {model, duration_s, aspect_ratio} — để limit anchor số lượng.
        role_hints: optional list cùng độ dài reference_images. Mỗi item là 1 trong
            ['primary_subject', 'product_hero', 'style_reference', 'environment',
             'brand_asset', None]. Khi user tag UI thì pass vào để LLM verify thay vì
            đoán. None = AI tự detect.

    Returns:
        VisualPlan dict (xem schema trong visual_planner_system.md).
    """
    # Empty input → trả empty plan với cảnh báo
    if not reference_images:
        return _empty_plan(reason="user_no_refs")

    # Resize + filter empty
    pairs = []
    for idx, url in enumerate(reference_images[:12]):
        if not url:
            continue
        resized = _maybe_resize_data_url(url)
        hint = (role_hints[idx] if role_hints and idx < len(role_hints) else None)
        pairs.append((idx, resized, hint))

    if not pairs:
        return _empty_plan(reason="all_refs_invalid")

    indices = [p[0] for p in pairs]
    valid_urls = [p[1] for p in pairs]
    hints = [p[2] for p in pairs]

    logger.info(
        f"[VisualPlanner] analyzing {len(valid_urls)} refs "
        f"(user_tagged={sum(1 for h in hints if h)}/{len(hints)}), "
        f"model={tech_config.get('model')}"
    )

    user_msg = _build_user_message(indices, hints, product_input, user_brief, tech_config)

    try:
        response_text = llm.complete_with_image(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            image_urls=valid_urls,
            task="vision",  # → qwen3-vl-30b-instruct
            max_tokens=3500,
        )
    except Exception as e:
        logger.warning(f"[VisualPlanner] vision LLM fail — fallback empty plan: {e}")
        return _empty_plan(reason=f"vision_llm_fail: {str(e)[:120]}")

    try:
        plan_data = _parse_plan(response_text)
    except ValueError as e:
        logger.warning(f"[VisualPlanner] parse fail — fallback empty: {e}")
        return _empty_plan(reason=f"parse_fail: {str(e)[:120]}")

    # Inject runtime data — URL POINTERS thay vì copy URL (save tokens downstream)
    plan_data = _enrich_with_url_pointers(plan_data, reference_images)
    _log_summary(plan_data)
    return plan_data


def _build_user_message(
    indices: list[int],
    role_hints: list[Optional[str]],
    product_input: dict,
    user_brief: str,
    tech_config: dict,
) -> str:
    """Compose structured input cho Visual Planner.

    Mỗi ảnh đính kèm đã có index. Build text mô tả product context +
    user-tagged role hints (nếu có) để LLM verify thay vì đoán.
    """
    # Build role hints table — LLM sees: image idx 0 → user_tagged "primary_subject"
    hint_rows = []
    for i, (idx, hint) in enumerate(zip(indices, role_hints)):
        row = f"  - Ảnh #{i} (idx={idx}): "
        if hint:
            row += f"user đã tag → **{hint}** (XÁC NHẬN hoặc REJECT nếu sai)"
        else:
            row += "user CHƯA tag → bạn tự detect role"
        hint_rows.append(row)

    parts = [
        "[PRODUCT CONTEXT — để biết refs này phục vụ sản phẩm gì]",
        json.dumps(
            {
                "url": product_input.get("url"),
                "text_description": (product_input.get("text_description") or "")[:500],
            },
            ensure_ascii=False,
        ),
        "",
        "[USER BRIEF]",
        (user_brief or "(user không paste brief)")[:800],
        "",
        "[REFERENCE IMAGES MAPPING]",
        f"Tổng {len(indices)} ảnh đính kèm theo thứ tự dưới đây:",
        *hint_rows,
        "",
        "[TECH CONFIG]",
        json.dumps(
            {
                "model": tech_config.get("model"),
                "duration_s": tech_config.get("duration_s"),
                "aspect_ratio": tech_config.get("aspect_ratio"),
            },
            ensure_ascii=False,
        ),
        "",
        "[YOUR TASK]",
        "Output JSON VisualPlan theo schema. PHẢI:",
        "  1. Phân tích MỖI ảnh — detect role + extract features",
        "  2. Pick 1 ảnh làm `primary_character_anchor` (nếu có người) — face descriptor CHI TIẾT",
        "  3. Liệt kê `missing_critical` nếu thiếu role quan trọng",
        "  4. Recommend `phase3_keyframer_strategy` (multi_turn_anchor / grid_pattern / text_only_fallback)",
        "  5. KHÔNG dùng từ mơ hồ — face descriptor phải đặc trưng nhận diện được",
    ]
    return "\n".join(parts)


def _enrich_with_url_pointers(plan_data: dict, original_urls: list[str]) -> dict:
    """Inject url thật vào primary_character_anchor + assets.

    LLM trả pointer kiểu `"asset_index": 0`. Backend resolve sang URL thật để
    Phase 3 storyboard_keyframer gen image với reference param trực tiếp.
    """
    # Anchor: resolve asset_index → url
    anchor = plan_data.get("primary_character_anchor") or {}
    if anchor and anchor.get("asset_index") is not None:
        idx = anchor["asset_index"]
        if isinstance(idx, int) and 0 <= idx < len(original_urls):
            anchor["anchor_url"] = original_urls[idx]
    plan_data["primary_character_anchor"] = anchor

    # Assets: enrich each with original url
    assets = plan_data.get("assets") or []
    for a in assets:
        if not isinstance(a, dict):
            continue
        idx = a.get("index")
        if isinstance(idx, int) and 0 <= idx < len(original_urls):
            a["url"] = original_urls[idx]
    plan_data["assets"] = assets

    return plan_data


def _empty_plan(reason: str) -> dict:
    """No refs hoặc analysis fail → safe empty plan để Director fallback text-only."""
    return {
        "summary": f"(no visual plan — {reason})",
        "asset_count": 0,
        "assets": [],
        "primary_character_anchor": None,
        "product_assets": [],
        "style_assets": [],
        "missing_critical": [
            {
                "role": "primary_subject",
                "reason": "Không có ref nhân vật — Director sẽ gen face mới, identity drift risk cao giữa shots",
                "suggestion": "Upload 1-3 ảnh nhân vật chính (đủ góc khác nhau) để Phase 3 anchor face",
            },
            {
                "role": "product_hero",
                "reason": "Không có ref sản phẩm — AI có thể render sai màu/form/logo",
                "suggestion": "Upload 1 ảnh sản phẩm clean shot trên nền đơn giản",
            },
        ],
        "grid_recommendation": {
            "should_use_grid": False,
            "grid_layout": None,
            "reason": "No refs",
        },
        "warnings": [],
        "downstream_hints": {
            "director_should_anchor": False,
            "phase3_keyframer_strategy": "text_only_fallback",
        },
        "fail_reason": reason,
    }


def _parse_plan(response_text: str) -> dict:
    """Tolerant JSON parse — markdown wrapper + truncation salvage."""
    from agent.personas.copywriter import _salvage_truncated_json

    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)

    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if not match:
        raise ValueError(
            f"[VisualPlanner] LLM không trả JSON. Head: {response_text[:300]}"
        )
    raw = match.group()
    try:
        return json.loads(raw, strict=False)
    except json.JSONDecodeError:
        salvaged = _salvage_truncated_json(raw)
        if salvaged:
            try:
                return json.loads(salvaged, strict=False)
            except json.JSONDecodeError as e:
                raise ValueError(f"[VisualPlanner] parse fail sau salvage: {e}") from e
        raise ValueError(f"[VisualPlanner] parse fail không salvage. Head: {raw[:200]}")


def _log_summary(plan_data: dict) -> None:
    """Log key signals — roles detected + anchor present + missing critical."""
    assets = plan_data.get("assets", [])
    role_counts: dict[str, int] = {}
    for a in assets:
        role = a.get("detected_role", "unknown")
        role_counts[role] = role_counts.get(role, 0) + 1

    has_anchor = bool(
        (plan_data.get("primary_character_anchor") or {}).get("anchor_url")
    )
    missing = len(plan_data.get("missing_critical", []))
    strategy = (plan_data.get("downstream_hints") or {}).get(
        "phase3_keyframer_strategy", "?"
    )
    role_summary = ", ".join(f"{k}={v}" for k, v in role_counts.items()) or "(none)"
    logger.info(
        f"[VisualPlanner] done: roles={{{role_summary}}}, "
        f"anchor={'YES' if has_anchor else 'NO'}, "
        f"missing={missing}, strategy={strategy}"
    )
