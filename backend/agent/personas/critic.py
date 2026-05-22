"""Persona 7: Critic — viral score 1-10 + brutal suggestions.

Đọc 3 script variants (từ Copywriter+Ranker) + CinematicBrief + context
→ Output ViralReport với điểm + critique + recommended variant + forbidden claim flags.

Model: deepseek-v4-flash qua llm_router (task=analyzer, low temp 0.3).
Lý do dùng flash:
    - Pro model hangs trên JSON-heavy prompt (verified live 5min hang)
    - Flash + temp 0.3 đủ consistency cho rubric scoring
    - Cost giảm 12×, speed 3× nhanh hơn
"""

import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm
from core.llm_redact import safe_dumps

_PROMPT_PATH = Path(__file__).parent / "prompts" / "critic_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


def evaluate(
    script_variants: list[dict],
    cinematic_brief: dict,
    context: dict,
    viral_dna: Optional[dict] = None,
) -> dict:
    """Run Critic persona → ViralReport JSON.

    Args:
        script_variants: list 3 variants, mỗi cái {variant_id, hook, body, cta}.
        cinematic_brief: output từ Director persona.
        context: {niche, audience, product_name, trends_applied}.
        viral_dna: optional, nếu user upload video ref.

    Returns:
        ViralReport dict (xem schema trong critic_system.md).
    """
    if len(script_variants) == 0:
        raise ValueError("[Critic] script_variants empty — nothing to evaluate")

    user_msg = _build_user_message(script_variants, cinematic_brief, context, viral_dna)

    logger.info(
        f"[Critic] evaluating {len(script_variants)} variants for "
        f"niche={context.get('niche')}, product={context.get('product_name')}"
    )

    response_text = llm.complete(
        system_prompt=SYSTEM_PROMPT,
        user_message=user_msg,
        task="analyzer",  # → deepseek-v4-flash (fail-fast, đủ judgment)
        max_tokens=6000,  # ↑ 3k→6k để tránh truncate (3 variants × strengths/weaknesses/fixes)
        temperature=0.3,
    )

    # Graceful: Critic parse fail KHÔNG crash toàn proposal — user vẫn có script_variants để pick
    try:
        report = _parse_viral_report(response_text)
    except ValueError as e:
        logger.warning(
            f"[Critic] parse fail — fallback empty report. Reason: {str(e)[:200]}"
        )
        report = _fallback_empty_report(script_variants)

    _log_summary(report)
    return report


def _fallback_empty_report(script_variants: list[dict]) -> dict:
    """Fallback khi Critic LLM output JSON malformed.

    Trả report tối thiểu: gán viral_score=7.0 cho mọi variant, recommend variant đầu.
    User vẫn pick được variant, chỉ thiếu chi tiết Critic — proposal không crash.
    """
    variants_basic = [
        {
            "variant_id": v.get("variant_id"),
            "viral_score": 7.0,  # neutral score
            "scores_breakdown": {},
            "strengths": [],
            "weaknesses": ["Critic chấm fail — score tạm thời"],
            "fix_suggestions": [],
            "predicted_views_range": "N/A",
            "best_post_time_vn": "N/A",
        }
        for v in (script_variants or [])
        if isinstance(v, dict) and v.get("variant_id")
    ]
    return {
        "variants": variants_basic,
        "recommended_variant": variants_basic[0]["variant_id"] if variants_basic else "",
        "recommended_reason": "Critic không trả JSON parsable — chọn variant đầu mặc định",
        "global_red_flags": [],
        "global_improvement_ideas": [],
    }


def _build_user_message(
    script_variants: list[dict],
    cinematic_brief: dict,
    context: dict,
    viral_dna: Optional[dict],
) -> str:
    """Compose structured input cho Critic."""
    parts = [
        "[CONTEXT]",
        safe_dumps(context),
        "",
        "[CINEMATIC BRIEF — từ Director]",
        safe_dumps(cinematic_brief),
        "",
        f"[SCRIPT VARIANTS — {len(script_variants)} variants]",
        safe_dumps(script_variants),
        "",
    ]

    if viral_dna:
        parts += [
            "[VIRAL DNA REFERENCE — pattern user muốn clone]",
            safe_dumps(viral_dna),
            "",
            "→ Đánh giá variants có clone ĐÚNG pattern không. Nếu sai → trừ điểm `trend_alignment`.",
            "",
        ]

    parts.append("[YOUR TASK]")
    parts.append(
        "Output JSON ViralReport theo schema. CHẤM brutal honest, NO nịnh. "
        "PHẢI rank 1 variant + flag forbidden claims nếu có."
    )
    return "\n".join(parts)


def _parse_viral_report(response_text: str) -> dict:
    """Extract JSON tolerant markdown + control + truncation salvage."""
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
            f"[Critic] LLM không trả JSON valid. Response head: {response_text[:300]}"
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
                raise ValueError(f"[Critic] parse fail sau salvage: {e}. Head: {raw[:200]}") from e
        raise ValueError(f"[Critic] parse fail không salvage. Head: {raw[:200]}")


def _log_summary(report: dict) -> None:
    """Log key signals — viral scores + red flags."""
    variants = report.get("variants", [])
    recommended = report.get("recommended_variant")
    red_flags = report.get("global_red_flags", [])

    score_summary = ", ".join(
        f"{v['variant_id']}={v.get('viral_score', '?')}"
        for v in variants
    )
    logger.info(
        f"[Critic] scores: {score_summary} | recommended={recommended} | "
        f"red_flags={len(red_flags)}"
    )

    for flag in red_flags:
        if "FORBIDDEN" in str(flag):
            logger.warning(f"[Critic] {flag}")
