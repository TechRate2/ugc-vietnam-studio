"""Persona 5 (REPLACES Casting Director): Reference Analyzer.

Phân tích `referenceImages` user upload (KHÔNG phải pick từ preset avatar).
Output ReferenceMapping cho:
    - Editor (shot nào dùng ảnh nào)
    - Generator (pass đúng ref vào Vidu Q3 / Wan 2.7 / Seedance i2v)
    - Frontend hiển thị "AI hiểu refs của anh"

Model: deepseek-v4-flash (analyzer task, $0.14/$0.28) — task không cần reasoning sâu.
Cost: ~$0.003/proposal.

Note: Product Strategist đã có field `reference_analysis[]` (Phase 1) phân tích ảnh
sơ bộ. Reference Analyzer ENRICH thêm: role mapping precise + shot assignment +
missing refs suggestion + warnings.
"""

import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm
from core.llm_redact import safe_dumps

_PROMPT_PATH = Path(__file__).parent / "prompts" / "reference_analyzer_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


# Model max refs — FIX N2: sync chính xác với VIDEO_MODEL_SPECS.
# Trước đây bị drift: Wan 2.7=9 (sai, thực=1 vì i2v dùng image singular),
# Seedance 1.5 Pro=9 (sai, thực=1), Seedance 2.0=12 (sai, thực=9 ref variant).
# Verified từ backend/agent/model_specs.py 2026-05-20.
MODEL_MAX_REFS = {
    # Vidu Q3 (reference-to-video, images plural)
    "vidu_q3": 4,
    "vidu_q3_mix": 4,
    # Wan 2.7 (image-to-video, image singular)
    "wan_2_7": 1,
    # Seedance 1.5 Pro (image-to-video, image singular)
    "seedance_1_5_pro": 1,
    # Seedance 2.0 (ref variant, max 9 images)
    "seedance_2_0": 9,
    "seedance_2_0_fast": 9,
    # Models KHÔNG có trong project hiện tại (giữ để UI fallback an toàn)
    "veo_3_1": 3,
    "veo_3_1_lite": 3,
    "veo_3_1_fast": 3,
    "happyhorse_1_0": 5,
}


def analyze_references(
    cinematic_brief: dict,
    product_positioning: dict,
    reference_images: list[str],
    tech_config: dict,
    visual_plan: Optional[dict] = None,
) -> dict:
    """Run Reference Analyzer → ReferenceMapping JSON.

    NEW SCOPE (post-VisualPlanner): chỉ làm SHOT-LEVEL ASSIGNMENT thôi.
    Role detection + face anchor đã xong ở VisualPlanner Stage A0.
    Reference Analyzer giờ chỉ trả lời "ref này dùng cho shot nào trong cinematic_brief".

    Args:
        cinematic_brief: từ Director (visual_style, scene_direction, shots[]).
        product_positioning: từ Strategist (đã có reference_analysis sơ bộ).
        reference_images: list ảnh URLs/base64 user upload.
        tech_config: {model, duration_s, aspect_ratio, ...}.
        visual_plan: từ VisualPlanner (Stage A0). Có assets[] với detected_role +
            best_for_shots. Khi có, ReferenceAnalyzer REUSE thay vì detect lại.

    Returns:
        ReferenceMapping dict (xem schema trong reference_analyzer_system.md).
    """
    # No refs → return empty mapping (don't waste LLM call)
    if not reference_images:
        return _empty_mapping(tech_config)

    model = tech_config.get("model", "vidu_q3")
    max_refs = MODEL_MAX_REFS.get(model, 5)

    # Shortcut: nếu visual_plan có assets[] đầy đủ → build mapping từ đó (no LLM call)
    if visual_plan and visual_plan.get("assets"):
        mapping = _build_mapping_from_visual_plan(
            visual_plan, cinematic_brief, max_refs, len(reference_images)
        )
        logger.info(
            f"[ReferenceAnalyzer] derived from visual_plan (no LLM): "
            f"refs={len(mapping.get('mapped_references', []))}, "
            f"strategy={mapping.get('rendering_hint', {}).get('strategy')}"
        )
        return mapping

    logger.info(
        f"[ReferenceAnalyzer] analyzing {len(reference_images)} refs (no visual_plan fallback), "
        f"model={model} (max {max_refs})"
    )

    # Already-analyzed refs từ Product Strategist Phase 1
    prior_analysis = product_positioning.get("reference_analysis", [])

    user_msg = safe_dumps({
        "cinematic_brief": {
            "visual_style": cinematic_brief.get("visual_style", {}),
            "scene_direction": cinematic_brief.get("scene_direction", []),
            "camera_language": cinematic_brief.get("camera_language", {}),
        },
        "product_positioning": {
            "product": product_positioning.get("product", {}),
        },
        "prior_reference_analysis_from_strategist": prior_analysis,
        "reference_images_count": len(reference_images),
        "tech_config": {
            "model": model,
            "max_refs_supported": max_refs,
            "duration_s": tech_config.get("duration_s"),
            "aspect_ratio": tech_config.get("aspect_ratio"),
        },
    })

    response_text = llm.complete(
        system_prompt=SYSTEM_PROMPT,
        user_message=user_msg,
        task="analyzer",
        max_tokens=2500,
        temperature=0.3,  # low — consistency hơn creativity
    )

    mapping = _parse_mapping(response_text)
    # Inject runtime constraint
    if "rendering_hint" not in mapping:
        mapping["rendering_hint"] = {}
    mapping["rendering_hint"]["max_refs_for_chosen_model"] = max_refs
    mapping["rendering_hint"]["refs_used"] = len(reference_images)
    mapping["rendering_hint"]["refs_slot_remaining"] = max(0, max_refs - len(reference_images))

    logger.info(
        f"[ReferenceAnalyzer] done: refs_mapped={len(mapping.get('mapped_references', []))}, "
        f"warnings={len(mapping.get('warnings', []))}, "
        f"missing={len(mapping.get('missing_references', []))}"
    )

    return mapping


def _build_mapping_from_visual_plan(
    visual_plan: dict,
    cinematic_brief: dict,
    max_refs: int,
    refs_count: int,
) -> dict:
    """Derive ReferenceMapping từ VisualPlan — zero LLM call.

    VisualPlanner đã làm role detection + features extraction ở Stage A0.
    Ở đây chỉ remap sang ReferenceMapping schema cũ cho backward compat với
    Phase 3 generator + frontend.
    """
    assets = visual_plan.get("assets") or []
    anchor = visual_plan.get("primary_character_anchor") or {}

    mapped: list[dict] = []
    for a in assets:
        if not isinstance(a, dict):
            continue
        if a.get("recommended_usage") == "skip":
            continue
        idx = a.get("index")
        if idx is None or not isinstance(idx, int):
            continue

        mapped.append({
            "index": idx,
            "filename_hint": a.get("url", "")[:60] if a.get("url") else None,
            "role": a.get("detected_role", "unknown"),
            "subject_type": a.get("subject_type", "unknown"),
            "subject_attributes": {
                "face_descriptor_vn": a.get("face_descriptor_vn"),
                "outfit_observed": a.get("outfit_observed"),
                "dominant_features": a.get("dominant_features", []),
                "color_palette_hex": a.get("color_palette_hex", []),
            },
            "best_for_shots": a.get("best_for_shots", []),
            "image_gen_usage": a.get("recommended_usage", "keyframe_anchor"),
            "video_gen_usage": (
                "i2v_input"
                if a.get("recommended_usage") in ("keyframe_anchor", "i2v_input_only")
                else "style_only"
            ),
            "confidence": a.get("confidence", 0.85),
            "user_tag_verdict": a.get("user_tag_verdict", "not_tagged"),
        })

    return {
        "reference_count": refs_count,
        "primary_persona_summary": anchor.get("name_vn", visual_plan.get("summary", "")),
        "mapped_references": mapped,
        "missing_references": [
            {
                "missing_role": m.get("role"),
                "why_useful": m.get("reason"),
                "suggestion_to_user": m.get("suggestion"),
            }
            for m in (visual_plan.get("missing_critical") or [])
        ],
        "warnings": visual_plan.get("warnings", []),
        "rendering_hint": {
            "max_refs_for_chosen_model": max_refs,
            "refs_used": min(refs_count, max_refs),
            "refs_slot_remaining": max(0, max_refs - refs_count),
            "strategy": (visual_plan.get("downstream_hints") or {}).get(
                "phase3_keyframer_strategy", "multi_turn_anchor"
            ),
            "anchor_url": anchor.get("anchor_url"),
        },
    }


def _empty_mapping(tech_config: dict) -> dict:
    """User KHÔNG upload ref nào → return empty mapping với hint upload thêm."""
    model = tech_config.get("model", "vidu_q3")
    max_refs = MODEL_MAX_REFS.get(model, 5)
    return {
        "reference_count": 0,
        "primary_persona_summary": "(No references uploaded — AI sẽ gen all visuals from prompt only)",
        "mapped_references": [],
        "missing_references": [
            {
                "missing_role": "primary_subject",
                "why_useful": "Không có ref nhân vật → AI tự gen, có thể không giữ consistency giữa shots",
                "suggestion_to_user": "Upload ít nhất 1 ảnh nhân vật (creator hoặc model) để giữ identity",
            },
            {
                "missing_role": "product",
                "why_useful": "Không có ref sản phẩm → product có thể bị render không đúng (sai màu/form)",
                "suggestion_to_user": "Upload 1-2 ảnh sản phẩm clean shot",
            },
        ],
        "warnings": [],
        "rendering_hint": {
            "max_refs_for_chosen_model": max_refs,
            "refs_used": 0,
            "refs_slot_remaining": max_refs,
            "recommendation": f"Upload thêm tới {max_refs} ảnh để gen quality cao nhất",
        },
    }


def _parse_mapping(response_text: str) -> dict:
    """Tolerant parse — markdown wrapper + control chars."""
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
            f"[ReferenceAnalyzer] LLM không trả JSON valid. Head: {response_text[:300]}"
        )
    try:
        return json.loads(match.group(), strict=False)
    except json.JSONDecodeError as e:
        raise ValueError(f"[ReferenceAnalyzer] JSON parse fail: {e}") from e
