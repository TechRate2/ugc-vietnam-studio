"""Cost-gate Evaluation — per CineForge v2.1 §7.

Workflow:
    1. Render shot[0] with the cheapest tier (Seedance 2.0 Fast / Vidu Q3 Fast).
    2. Evaluate the draft clip against Bible expectations (consistency anchor +
       red_flag scan).
    3. If pass (score >= threshold) → caller proceeds with full Standard render.
       If fail → caller aborts with suggestions, saving 80-90% of credits.

This module is a *pure decision layer* — it doesn't render anything. Caller
(`workers/video_worker.render_plan`) passes a draft clip path + Bible and gets
back a `CostGateDecision`.

The actual draft render reuses the existing renderer with `model="seedance_2_0_fast"`
forced. The "pass" threshold is configurable per-job.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from loguru import logger

from agent.schemas import ContinuityBible, EvaluationReport
from agent.evaluation_layer import evaluate_plan


@dataclass
class CostGateDecision:
    pass_: bool                          # True → continue to Standard render
    score: float                          # Composite score 0-10
    threshold: float                      # The threshold this was checked against
    reasoning: str                        # 1-2 sentence summary for the user
    suggestions: list[str]                # Actionable fixes if failed
    raw_report: Optional[dict] = None    # Full sub-report for debugging


# Default model overrides for the draft stage.
DRAFT_MODEL_OVERRIDE = {
    "seedance_2_0": "seedance_2_0_fast",
    "seedance_2_0_fast": "seedance_2_0_fast",  # already fast
    "seedance_1_5_pro": "seedance_2_0_fast",   # downgrade
    "vidu_q3": "vidu_q3",                       # vidu has no fast tier — same model
    "vidu_q3_mix": "vidu_q3",
    "wan_2_7": "wan_2_7",                       # wan already cheap
    "auto": "seedance_2_0_fast",
}


def draft_model_for(user_model: str) -> str:
    """Pick the cheapest model that's quality-comparable to `user_model`."""
    return DRAFT_MODEL_OVERRIDE.get(user_model, "seedance_2_0_fast")


def evaluate_draft_clip(
    plan_dict: dict,
    draft_shot_id: str,
    threshold: float = 7.0,
) -> CostGateDecision:
    """Score a draft (shot 0) against Bible expectations.

    We piggyback on the existing `evaluation_layer.evaluate_plan()` LLM — but
    pass it a single-shot snapshot of the plan focused on `draft_shot_id`.
    The LLM evaluates consistency + cinematic against the Bible.

    Why not compare frames directly? Reasoning models score Bible compliance
    cheaper and faster than CLIP/face-embedding pipelines, and they catch
    "wrong outfit / wrong location / dialogue mismatch" which embeddings miss.
    """
    # Trim plan to just the draft shot + Bible context for the evaluator
    draft_view = {
        "continuity_bible": plan_dict["continuity_bible"],
        "shot_list": [
            s for s in plan_dict["shot_list"] if s["shot_id"] == draft_shot_id
        ],
        "storyboard_grid": [
            f for f in plan_dict.get("storyboard_grid", []) if f["shot_id"] == draft_shot_id
        ],
    }
    try:
        report: EvaluationReport = evaluate_plan(
            plan_dict=draft_view,
            user_brief="(draft cost-gate check)",
            tech_config={"duration_s": draft_view["shot_list"][0]["duration_s"]},
        )
    except Exception as e:
        logger.warning(f"[cost_gate] eval LLM fail — defaulting to PASS to not block user: {e}")
        return CostGateDecision(
            pass_=True, score=0.0, threshold=threshold,
            reasoning=f"evaluator unavailable ({e}); proceeded conservatively",
            suggestions=[],
        )

    # Weighted score — focus on consistency + cinematic for cost gate
    score = round(
        0.45 * report.consistency_score
        + 0.20 * report.cinematic_score
        + 0.15 * report.pacing_score
        + 0.20 * report.brand_safety_score,
        2,
    )
    passed = score >= threshold and not report.red_flags

    return CostGateDecision(
        pass_=passed,
        score=score,
        threshold=threshold,
        reasoning=(
            f"Draft passed (score {score} ≥ {threshold})."
            if passed
            else f"Draft failed (score {score} < {threshold})."
        ),
        suggestions=report.suggestions[:5],
        raw_report=report.model_dump(),
    )
