"""Proposal Builder — gom output 7 personas → ProposalJSON cho frontend modal.

Đây là LAYER cuối của Phase 2 (proposal).

Input: outputs từ Director Brain orchestrator.
Output: ProposalJSON sạch, ready để frontend render modal "Director's Proposal".

Trách nhiệm:
    1. Compose tất cả persona outputs vào 1 JSON gọn
    2. Add metadata: estimated_render_cost_usd, estimated_render_time_s
    3. Validate top variants có đủ trường cần thiết cho UI
    4. Generate proposal_id (UUID) để tracking khi user approve
"""

import uuid
from datetime import datetime
from typing import Optional

from loguru import logger


def build_proposal(
    product_positioning: dict,
    viral_dna: Optional[dict],
    trends_applied: list[dict],
    cinematic_brief: dict,
    script_variants: list[dict],
    reference_mapping: dict,
    storyboard_preview: list[dict],
    viral_report: dict,
    tech_config: dict,
    visual_plan: Optional[dict] = None,
) -> dict:
    """Assemble ProposalJSON for frontend modal.

    Returns dict matching frontend ProposalSchema:
        {
            proposal_id, created_at, tech_config,
            product_summary, niche_detected, niche_confidence,
            director_concept_summary, viral_dna_applied, trends_applied,
            script_variants[],          # 3 variants với viral scores
            reference_mapping{},        # mapping ảnh user upload → role + shots
            storyboard_preview[],       # text outline frames
            recommended_variant_id,
            global_red_flags[],
            estimated_render_cost_usd,
            estimated_render_time_s,
            cost_so_far_phase2_usd,
        }
    """
    proposal_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat() + "Z"

    # === Extract product summary ===
    product = product_positioning.get("product", {})
    product_summary = {
        "name": product.get("name"),
        "brand": product.get("brand"),
        "category": product.get("category"),
        "price_vnd": product.get("price_vnd"),
        "target_audience": product.get("target_persona"),
    }

    # === Niche detection meta ===
    niche_detected = product.get("category", "unknown")
    # Confidence — basic heuristic, có thể improve với LLM classifier sau
    niche_confidence = 0.9 if "." in niche_detected else 0.7

    # === Director concept ===
    director_concept = cinematic_brief.get("concept_summary", "")

    # === Script variants enriched với viral scores ===
    variants_with_scores = _merge_variants_with_scores(script_variants, viral_report)

    # === Recommended variant ===
    recommended = viral_report.get("recommended_variant", "")
    if not recommended and variants_with_scores:
        recommended = variants_with_scores[0].get("variant_id", "")

    # === Storyboard preview (Phase 2 — text only, KHÔNG gen ảnh thật) ===
    if not storyboard_preview:
        storyboard_preview = _extract_storyboard_from_cinematic(cinematic_brief)

    # === Cost estimates ===
    phase2_cost = _estimate_phase2_cost_so_far(has_video_ref=viral_dna is not None)
    render_cost = _estimate_render_cost(tech_config)
    render_time = _estimate_render_time(tech_config, len(storyboard_preview))

    # Extract NEW fields từ Director output: character_sheet + structured shots[]
    # (Director system prompt v2 — MCSLA + character_sheet)
    character_sheet = cinematic_brief.get("character_sheet") or {}
    structured_shots = cinematic_brief.get("shots") or []

    # Safety net: nếu Director LLM không copy anchor (despite system prompt), backend
    # tự inject anchor data sang character_sheet — fix character drift dù LLM dở.
    if visual_plan:
        anchor = visual_plan.get("primary_character_anchor") or {}
        if anchor and anchor.get("anchor_url"):
            character_sheet.setdefault("face_lock_url", anchor.get("anchor_url"))
            character_sheet.setdefault("locked_from_user_upload", True)
            # Nếu Director quên copy face descriptor → fallback từ anchor
            if not character_sheet.get("face"):
                character_sheet["face"] = anchor.get("face_descriptor", "")
            if not character_sheet.get("outfit_top"):
                character_sheet["outfit_top"] = anchor.get("outfit_top", "")
            if not character_sheet.get("outfit_bottom"):
                character_sheet["outfit_bottom"] = anchor.get("outfit_bottom", "")
            if not character_sheet.get("age_apparent"):
                character_sheet["age_apparent"] = anchor.get("age_apparent")
            if not character_sheet.get("gender"):
                character_sheet["gender"] = anchor.get("gender")
            logger.info(
                f"[ProposalBuilder] character_sheet anchored to user upload: "
                f"url={anchor.get('anchor_url', '')[:60]}..."
            )
        else:
            character_sheet.setdefault("face_lock_url", None)
            character_sheet.setdefault("locked_from_user_upload", False)

    proposal = {
        "proposal_id": proposal_id,
        "created_at": now,
        "tech_config": tech_config,

        # Analysis layer
        "product_summary": product_summary,
        "niche_detected": niche_detected,
        "niche_confidence": niche_confidence,
        "viral_dna_applied": viral_dna,
        "trends_applied": trends_applied,
        "director_concept_summary": director_concept,
        "cinematic_brief": cinematic_brief,  # full brief để frontend show "advanced" panel

        # NEW — Higgsfield-style MCSLA + character consistency anchor
        # Expose top-level cho Phase 3 (image keyframe gen + i2v render) đọc thuận tiện
        "character_sheet": character_sheet,
        "shots": structured_shots,

        # NEW — Visual Plan (TopView V2 + ViMax pattern) — Pre-analysis của refs
        # Frontend đọc để hiển thị "AI đã hiểu refs anh" + Phase 3 đọc anchor URL
        "visual_plan": visual_plan or {},

        # User picks
        "script_variants": variants_with_scores,
        "reference_mapping": reference_mapping,
        "storyboard_preview": storyboard_preview,

        # Critic
        "recommended_variant_id": recommended,
        "recommended_reason": viral_report.get("recommended_reason", ""),
        "global_red_flags": viral_report.get("global_red_flags", []),
        "global_improvement_ideas": viral_report.get("global_improvement_ideas", []),

        # Cost & time
        "cost_so_far_phase2_usd": phase2_cost,
        "estimated_render_cost_usd": render_cost,
        "estimated_render_time_s": render_time,
        "estimated_total_cost_usd": round(phase2_cost + render_cost, 4),
    }

    logger.info(
        f"[ProposalBuilder] built proposal {proposal_id[:8]}: "
        f"variants={len(variants_with_scores)}, "
        f"refs_mapped={len(reference_mapping.get('mapped_references', []))}, "
        f"recommended={recommended}, "
        f"phase2_cost=${phase2_cost}, render_cost=${render_cost}"
    )

    return proposal


# ============================================
# Helpers
# ============================================

def _merge_variants_with_scores(
    script_variants: list[dict], viral_report: dict
) -> list[dict]:
    """Merge script variants với viral scores từ Critic.

    Defensive: skip critic items missing variant_id (LLM có thể không follow schema).
    """
    scored_variants = viral_report.get("variants", []) or []
    scores_by_id = {
        sv["variant_id"]: sv
        for sv in scored_variants
        if isinstance(sv, dict) and sv.get("variant_id")
    }

    enriched = []
    for variant in script_variants or []:
        if not isinstance(variant, dict):
            continue
        variant_id = variant.get("variant_id")
        critic_data = scores_by_id.get(variant_id, {}) if variant_id else {}
        enriched.append({
            **variant,
            "viral_score": critic_data.get("viral_score"),
            "scores_breakdown": critic_data.get("scores_breakdown"),
            "strengths": critic_data.get("strengths", []),
            "weaknesses": critic_data.get("weaknesses", []),
            "fix_suggestions": critic_data.get("fix_suggestions", []),
            "predicted_views_range": critic_data.get("predicted_views_range"),
            "best_post_time_vn": critic_data.get("best_post_time_vn"),
        })
    return enriched


def _extract_storyboard_from_cinematic(cinematic_brief: dict) -> list[dict]:
    """Fallback storyboard preview từ Director's scene_direction."""
    scenes = cinematic_brief.get("scene_direction", [])
    return [
        {
            "shot_id": s.get("shot_id"),
            "purpose": s.get("purpose"),
            "duration_s": s.get("duration_s"),
            "framing": s.get("framing"),
            "action_vn": s.get("action"),
        }
        for s in scenes
    ]


def _estimate_phase2_cost_so_far(
    has_video_ref: bool = False,
    enhanced_scene_count: int = 0,
    keyframe_count: int = 0,
) -> float:
    """Phase 2 cost estimate (LLM calls only).

    FIX #7 (HIGH): chấp nhận `enhanced_scene_count` (sau khi user click Enhance All)
    và `keyframe_count` (sau khi user gen storyboard keyframes Phase 2.5) để cost
    estimate KHỚP với actual bill thay vì underestimate.

    Snapshot từ AtlasCloud pricing 2026-05-20:
        Base (always run):
        - Visual Planner (qwen3-vl-30b-instruct $0.15/$0.60):        $0.008
        - Product Strategist (qwen3-vl-30b-instruct):                 $0.005
        - Trend Watcher (SQLite cached):                              $0.000
        - Director (DeepSeek V4 Flash):                               $0.003
        - Hook Writer (V4 Flash):                                     $0.002
        - Body Writer (V4 Flash):                                     $0.003
        - CTA Writer (V4 Flash):                                      $0.001
        - Ranker (V4 Flash):                                          $0.002
        - Reference Analyzer (no LLM khi visual_plan có):             $0.001
        - Critic (V4 Flash):                                          $0.005
        ──────────────────────────────────────────────────────────────────
        Base total:                                                   $0.030

        Conditional:
        - Video Ref Analyzer (Qwen Thinking 2.5× output cost):       +$0.055
        - Enhance Prompt batch (V4 Flash $0.001/scene):              +$0.001 × N
        - Storyboard Keyframer (Seedream v45 edit $0.036/keyframe):  +$0.036 × N

    Args:
        has_video_ref: user upload reference video → Qwen Thinking phân tích.
        enhanced_scene_count: số scene user đã click Enhance trong Multi-Scene Editor.
        keyframe_count: số keyframe đã gen (Phase 2.5 storyboard image).

    Returns:
        Cost USD rounded 4 decimals.
    """
    base_cost = 0.030
    if has_video_ref:
        base_cost += 0.055
    if enhanced_scene_count > 0:
        base_cost += 0.001 * enhanced_scene_count
    if keyframe_count > 0:
        base_cost += 0.036 * keyframe_count
    return round(base_cost, 4)


def _estimate_render_cost(tech_config: dict) -> float:
    """Render cost USD — AUDIT-D1 fix: chỉ 6 model user-facing.

    Sync với api/schemas.py VideoSettings.model Literal + agent/model_adapter.MODEL_REGISTRY.
    """
    rates = {
        "vidu_q3": 0.042,
        "vidu_q3_mix": 0.106,
        "wan_2_7": 0.10,
        "seedance_1_5_pro": 0.047,
        "seedance_2_0": 0.096,
        "seedance_2_0_fast": 0.076,
    }
    model = tech_config.get("model", "vidu_q3")
    duration = tech_config.get("duration_s", 15)
    video_cost = rates.get(model, 0.05) * duration
    # + storyboard images $0.05 (Phase 3 future) + voice $0.02 + bgm $0.01 + infra $0.01
    return round(video_cost + 0.09, 4)


def _estimate_render_time(tech_config: dict, shot_count: int) -> int:
    """Estimate render time in seconds."""
    # Rough estimate: parallel render of shots
    image_gen_s = 15  # parallel ~6 shots
    video_gen_s = 30 + (shot_count * 8)  # ~8s per shot, partial parallel
    voice_tts_s = 8
    compose_s = 30
    upload_s = 8
    return image_gen_s + video_gen_s + voice_tts_s + compose_s + upload_s
