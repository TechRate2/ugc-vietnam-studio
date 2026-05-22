"""Persona 3: Director — cinematic vision orchestrator.

Đọc ProductPositioning + ViralDNA (optional) + Trends + UserBrief + TechConfig
→ Output CinematicBrief (visual style + camera + pacing + scene direction).

Model: deepseek-v4-flash qua llm_router (task=analyzer, $0.14/$0.28 per 1M tok).
Lý do dùng flash:
    - Pro model có deep-reasoning mode có thể hang >5min trên prompt phức tạp
    - Flash đủ creativity cho cinematic JSON (verified live: ranker phần này pro chỉ
      cần cho judgment giữa N variants — Director gen 1 brief nên flash đủ)
    - Cost giảm 12×, speed ~3× nhanh hơn
"""

import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from core.llm_redact import safe_dumps as _safe_dumps
from vendors.llm_router import llm

_PROMPT_PATH = Path(__file__).parent / "prompts" / "director_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


def envision(
    product_positioning: dict,
    user_brief: str,
    tech_config: dict,
    viral_dna: Optional[dict] = None,
    trends_vn: Optional[list[dict]] = None,
    visual_plan: Optional[dict] = None,
) -> dict:
    """Run Director persona → CinematicBrief JSON.

    Args:
        product_positioning: output từ Product Strategist persona (analyzer).
        user_brief: free-text user mô tả ý tưởng/tone.
        tech_config: {duration_s, aspect_ratio, audio_mode, model}.
        viral_dna: optional, từ video_ref_analyzer (Qwen3-VL).
        trends_vn: optional, list từ trend_watcher cache.
        visual_plan: optional, từ visual_planner (Stage A0). Khi có anchor, Director
            BẮT BUỘC copy face_descriptor + outfit + face_lock_url sang character_sheet
            thay vì tự gen — fix character drift bug.

    Returns:
        CinematicBrief dict (xem schema trong director_system.md).
    """
    user_msg = _build_user_message(
        product_positioning, user_brief, tech_config, viral_dna, trends_vn, visual_plan
    )

    has_anchor = bool(
        ((visual_plan or {}).get("primary_character_anchor") or {}).get("anchor_url")
    )
    logger.info(
        f"[Director] envision: product={product_positioning.get('product', {}).get('name')}, "
        f"has_viral_dna={viral_dna is not None}, trends_count={len(trends_vn) if trends_vn else 0}, "
        f"has_character_anchor={has_anchor}"
    )

    response_text = llm.complete(
        system_prompt=SYSTEM_PROMPT,
        user_message=user_msg,
        task="analyzer",  # → deepseek-v4-flash (fail-fast, đủ creativity)
        max_tokens=4500,  # ↑ từ 2048 — output v2 nặng (character_sheet + shots[] MCSLA 6-7 cảnh)
        temperature=0.8,  # creative
    )

    cinematic = _parse_cinematic_brief(response_text)

    # FIX #3 (CRITICAL): Enforce anchor copy — Director có thể không follow system prompt
    # dù đã hướng dẫn TUYỆT ĐỐI copy. Backend ENFORCE assertion + auto-overwrite nếu sai.
    # Tác động: 100% giữ identity giữa proposal ↔ Phase 3 keyframer.
    if visual_plan:
        anchor = (visual_plan.get("primary_character_anchor") or {})
        if anchor.get("anchor_url"):
            cinematic = _enforce_anchor_copy(cinematic, anchor)

    return cinematic


def _enforce_anchor_copy(cinematic: dict, anchor: dict) -> dict:
    """Validate + force-overwrite character_sheet khớp với anchor.

    Director LLM được dặn copy nguyên anchor sang character_sheet (face/outfit/age/gender),
    NHƯNG LLM có thể bịa face mới hoặc partial copy. Backend kiểm tra + sửa.

    Logic:
        1. Nếu character_sheet chưa có → tạo từ anchor
        2. Nếu face_lock_url khác anchor_url → log warning + overwrite
        3. Nếu face descriptor có nhưng KHÁC anchor.face_descriptor → log + overwrite
        4. Nếu outfit / age / gender thiếu → fill từ anchor
        5. Force set locked_from_user_upload=True
    """
    cs = cinematic.get("character_sheet")
    if not isinstance(cs, dict):
        cs = {}
        cinematic["character_sheet"] = cs

    anchor_url = anchor.get("anchor_url")
    anchor_face = anchor.get("face_descriptor") or ""

    # 1. face_lock_url MUST match anchor — đây là field PHASE 3 dùng cho image gen ref
    cur_lock = cs.get("face_lock_url")
    if cur_lock != anchor_url:
        if cur_lock:
            logger.warning(
                f"[Director] anchor MISMATCH — Director set face_lock_url={cur_lock[:60]}... "
                f"nhưng anchor.anchor_url={anchor_url[:60]}... → backend FORCE overwrite"
            )
        cs["face_lock_url"] = anchor_url

    # 2. Force face descriptor khớp (so sánh substring 30 char đầu để tolerant minor diff)
    cur_face = (cs.get("face") or "").strip()
    if anchor_face and (
        not cur_face
        or (len(anchor_face) >= 30 and anchor_face[:30] not in cur_face)
    ):
        if cur_face:
            logger.warning(
                f"[Director] face descriptor DIVERGED — anchor='{anchor_face[:60]}...' "
                f"vs Director='{cur_face[:60]}...' → backend FORCE overwrite"
            )
        cs["face"] = anchor_face

    # 3. Fill missing fields từ anchor (không overwrite nếu Director đã đặt — chỉ fill empty)
    field_map = {
        "outfit_top": anchor.get("outfit_top"),
        "outfit_bottom": anchor.get("outfit_bottom"),
        "age_apparent": anchor.get("age_apparent"),
        "gender": anchor.get("gender"),
        "name_vn": anchor.get("name_vn"),
    }
    for k, v in field_map.items():
        if v and not cs.get(k):
            cs[k] = v

    # 4. Always lock flag
    cs["locked_from_user_upload"] = True

    # 5. Đảm bảo consistency_lock có text dù Director quên
    if not cs.get("consistency_lock"):
        cs["consistency_lock"] = (
            "GIỮ NGUYÊN khuôn mặt + outfit + tóc xuyên 100% các shots — anchor identity"
        )

    logger.info(
        f"[Director] anchor enforced: face_lock_url set, "
        f"face={'YES' if cs.get('face') else 'NO'}, "
        f"outfit={'YES' if cs.get('outfit_top') else 'NO'}"
    )
    return cinematic


def _build_user_message(
    product_positioning: dict,
    user_brief: str,
    tech_config: dict,
    viral_dna: Optional[dict],
    trends_vn: Optional[list[dict]],
    visual_plan: Optional[dict] = None,
) -> str:
    """Compose user message với context structured.

    VisualPlan inject TRÊN CÙNG (cao priority) — Director PHẢI đọc anchor trước
    rồi mới quyết định character_sheet để tránh drift.
    """
    parts = []

    # Inject VisualPlan SỚM NHẤT — anchor instructions cao priority
    if visual_plan:
        anchor = visual_plan.get("primary_character_anchor") or {}
        if anchor and anchor.get("anchor_url"):
            parts += [
                "[VISUAL PLAN — PRIMARY CHARACTER ANCHOR — TUYỆT ĐỐI TUÂN THỦ]",
                "User ĐÃ UPLOAD ảnh nhân vật. BẮT BUỘC copy nguyên anchor sang character_sheet:",
                _safe_dumps(anchor),
                "",
                "→ character_sheet.face = anchor.face_descriptor (KHÔNG đổi)",
                "→ character_sheet.outfit_top/bottom = anchor.outfit_top/bottom",
                "→ character_sheet.face_lock_url = anchor.anchor_url",
                "→ character_sheet.locked_from_user_upload = true",
                "",
            ]
        else:
            parts += [
                "[VISUAL PLAN — KHÔNG CÓ CHARACTER ANCHOR]",
                "User KHÔNG upload ref nhân vật. Tự gen character_sheet theo audience.",
                "→ character_sheet.face_lock_url = null",
                "→ character_sheet.locked_from_user_upload = false",
                "→ Concept_summary phải có warning '(no anchor — identity có thể drift Phase 3)'",
                "",
            ]
        # Thêm product/style assets context
        product_assets = visual_plan.get("product_assets") or []
        style_assets = visual_plan.get("style_assets") or []
        if product_assets or style_assets:
            parts += [
                "[VISUAL PLAN — PRODUCT + STYLE ASSETS]",
                _safe_dumps({"product_assets": product_assets, "style_assets": style_assets}),
                "",
            ]

    parts += [
        "[PRODUCT POSITIONING]",
        _safe_dumps(product_positioning),
        "",
        "[USER BRIEF — ý tưởng/tone user mô tả tự do]",
        user_brief or "(user không paste brief cụ thể — bạn tự suggest)",
        "",
        "[TECH CONFIG — user đã chọn, BẮT BUỘC theo]",
        f"duration_s: {tech_config.get('duration_s')}",
        f"aspect_ratio: {tech_config.get('aspect_ratio')}",
        f"audio_mode: {tech_config.get('audio_mode')}",
        f"model: {tech_config.get('model')}",
    ]

    # V3.1 — user num_shots override (Seedance 2.0/Fast multi-shot pattern)
    if tech_config.get("num_shots"):
        n_shots = tech_config["num_shots"]
        parts += [
            f"num_shots: {n_shots}",
            f"→ BẮT BUỘC output đúng {n_shots} shot trong shots[] (user ép override).",
            "",
        ]
    else:
        parts += [
            "num_shots: auto (bạn tự quyết theo duration + style)",
            "",
        ]

    # V3.2 — inject MIN duration per shot từ model spec (chặn Director gen shot < spec min)
    # Vidu Q3 min=3s, Seedance 2.0 min=4s, Wan 2.7 min=2s
    try:
        from agent.model_specs import VIDEO_MODEL_SPECS
        _user_model = tech_config.get("model") or "vidu_q3"
        _model_to_atlas = {
            "vidu_q3": "vidu_q3_ref", "vidu_q3_mix": "vidu_q3_mix_ref",
            "wan_2_7": "wan_2_7_i2v",
            "seedance_1_5_pro": "seedance_v15_pro_i2v",
            "seedance_2_0": "seedance_2_0_ref",
            "seedance_2_0_fast": "seedance_2_0_fast_ref",
            "auto": "vidu_q3_ref",
        }
        _atlas_key = _model_to_atlas.get(_user_model, "vidu_q3_ref")
        _shot_min = VIDEO_MODEL_SPECS.get(_atlas_key, {}).get("duration", {}).get("min", 3)
        parts += [
            f"min_shot_duration_s: {_shot_min}",
            f"→ BẮT BUỘC mỗi shot.duration_s ≥ {_shot_min}s (model {_user_model} spec min).",
            f"→ Nếu cần num_shots cao + total duration thấp → reduce num_shots để mỗi shot ≥ {_shot_min}s.",
            "",
        ]
    except Exception:
        pass  # defensive

    if viral_dna:
        parts += [
            "[VIRAL DNA — pattern từ video reference user upload]",
            _safe_dumps(viral_dna),
            "",
            "→ CLONE structure pattern này (pacing, framing, transition) nhưng KHÔNG copy content.",
            "→ Field `viral_dna_applied` trong output PHẢI giải thích cụ thể clone gì.",
            "",
        ]

    if trends_vn:
        parts += [
            "[TRENDS VN — TikTok đang viral tuần này]",
            _safe_dumps(trends_vn),
            "",
            "→ NẾU 1 trend nào fit niche → áp dụng. Field `trend_alignment` PHẢI nói rõ trend nào.",
            "→ NẾU không fit → leave `trend_alignment: 'none — niche này không có trend phù hợp tuần này'`.",
            "",
        ]

    parts.append("[YOUR TASK]")
    parts.append(
        "Output JSON CinematicBrief theo schema trong system prompt. KHÔNG markdown, JSON thuần."
    )
    return "\n".join(parts)


def _parse_cinematic_brief(response_text: str) -> dict:
    """Extract JSON tolerant markdown + control chars + truncation salvage."""
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
            f"[Director] LLM không trả JSON valid. Response head: {response_text[:300]}"
        )

    raw = match.group()
    try:
        return json.loads(raw, strict=False)
    except json.JSONDecodeError:
        # Salvage: LLM truncate JSON (max_tokens hit) → cut tail tới `}` cân bằng
        salvaged = _salvage_truncated_json(raw)
        if salvaged:
            try:
                return json.loads(salvaged, strict=False)
            except json.JSONDecodeError as e:
                raise ValueError(
                    f"[Director] parse fail sau salvage: {e}. Head: {raw[:200]}"
                ) from e
        raise ValueError(f"[Director] parse fail không salvage. Head: {raw[:200]}")
