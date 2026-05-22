"""Director V3 routes — Layer 1 planning + Human-in-the-Loop + Layer 3 generate.

Endpoints:
    POST   /api/v1/director/plan              — sync JSON, returns DirectorPlan
    POST   /api/v1/director/plan/stream       — SSE stream with stage progress
    POST   /api/v1/director/storyboard        — gen storyboard images for approved plan
    POST   /api/v1/director/generate          — fire render queue from approved plan
    GET    /api/v1/director/jobs/{job_id}     — poll job status
    POST   /api/v1/director/jobs/{job_id}/cancel

DirectorPlan flow (replaces old /jobs/propose):
    1. User submits brief + refs → /plan or /plan/stream
    2. Frontend shows Continuity Bible + Shot List + Evaluation in "Director Plan" tab
    3. User reviews / edits / approves (Human-in-the-Loop)
    4. (optional) /storyboard fires Seedream image gen for each storyboard_grid entry
    5. /generate kicks off video_worker.render_plan() → MP4

We keep the existing /jobs/* render path untouched (for backwards compat with the
legacy linear pipeline), but the canonical V3 flow is /director/*.
"""
from __future__ import annotations

import asyncio
import json
import uuid
from typing import Optional, Any
from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from pydantic import BaseModel, Field

from agent.director_agent import director
from agent.schemas import DirectorPlan, ContinuityBible, Shot, StoryboardFrame
from agent import continuity_manager
from api.schemas import ProductInput, VideoSettings
from workers import video_worker
from core import director_history


router = APIRouter()


# ============================================================
# Request schemas
# ============================================================
class ContextInjection(BaseModel):
    pain_points: Optional[str] = Field(None, max_length=2000)
    real_reviews: Optional[str] = Field(None, max_length=3000)
    usps: Optional[str] = Field(None, max_length=1500)
    forbidden_to_say: Optional[str] = Field(None, max_length=1000)
    mood_hint: Optional[str] = Field(None, max_length=500)


class PlanRequest(BaseModel):
    product_input: ProductInput
    reference_images: list[str] = Field(default_factory=list, max_length=12)
    reference_role_hints: list[Optional[str]] = Field(
        default_factory=list,
        max_length=12,
        description=(
            "Per-image role hints (same length as reference_images, null = AI "
            "auto-detect). Allowed roles match agent/schemas.ReferenceAsset.role: "
            "primary_subject | secondary_subject | product_hero | product_detail | "
            "style_reference | environment | brand_asset. When supplied, Director "
            "skips the vision-pass for these refs."
        ),
    )
    reference_videos: list[str] = Field(default_factory=list, max_length=1)
    user_brief: str = Field("", max_length=3000)
    context_injection: ContextInjection = Field(default_factory=ContextInjection)
    settings: VideoSettings
    niche_hint: Optional[str] = Field(
        None,
        description="Free string — Director Agent xử lý dynamic, không enum cứng",
    )


class StoryboardRequest(BaseModel):
    plan: DirectorPlan
    image_model: str = Field(
        "bytedance/seedream-v4.5",
        description="AtlasCloud image model — Seedream v4.5 default",
    )


class GenerateRequest(BaseModel):
    """Render an approved DirectorPlan (canonical Human-in-the-Loop path).

    Use this when the user has reviewed (and optionally edited) the plan in the
    DirectorPlanModal. Pass the plan back verbatim — the server will
    re-validate continuity, sanitize, then dispatch render.

    For the rare case of "just plan and render in one shot" (skip review), use
    POST /api/v1/director/plan-and-render instead.
    """
    plan: DirectorPlan
    reference_images: list[str] = Field(default_factory=list, max_length=12)
    settings: VideoSettings
    audio_plan: Optional[dict] = Field(
        None,
        description="{mode, voice_audio_url, sfx_audio_url, caption_text_vn, bgm_path}",
    )
    use_llm_scene_gen: bool = Field(
        True,
        description="True = 1 LLM call per shot for adaptive prompt (slow, best). "
                    "False = deterministic build (fast, cheap).",
    )
    cost_gate_mode: str = Field(
        "off",
        description="`off` (default) → render full plan immediately. "
                    "`draft_first` → render shot[0] using Fast tier, evaluate, "
                    "then continue only if score ≥ cost_gate_threshold. "
                    "Saves 80-90% credits when a plan would fail.",
    )
    cost_gate_threshold: float = Field(
        7.0, ge=0, le=10,
        description="Pass threshold for cost_gate_mode='draft_first' (default 7.0/10).",
    )


class PlanAndRenderRequest(BaseModel):
    """One-shot: build plan + render immediately, no Human-in-the-Loop pause.

    Same input shape as POST /api/v1/director/plan, plus render settings +
    optional audio_plan. Returns the same response shape as POST /generate so
    clients can use a single polling path.
    """
    plan_request: PlanRequest
    audio_plan: Optional[dict] = None
    use_llm_scene_gen: bool = True


class ReviseRequest(BaseModel):
    """Mutate an existing DirectorPlan with a free-form user instruction.

    Use case: user is reviewing a plan in `DirectorPlanModal`, types
    "đổi shot 3 sang ban đêm" — server runs Layer 1.5 LLM call against
    `system_prompts/revise.md` which produces a minimally-edited plan that
    the FE swaps in (and the editor preserves dirty tracking).
    """
    plan: DirectorPlan
    instruction: str = Field(..., min_length=1, max_length=2000)
    settings: VideoSettings


class RefineRequest(BaseModel):
    """Re-render ONE shot from an existing plan.

    Trigger: Evaluation Layer flagged a shot (low score / red_flag), OR user
    eyeballed the final video and wants to redo a specific shot only — without
    burning credits on the whole video.

    Optionally pass `previous_last_frame_url` from the original render's chain
    metadata to keep identity continuity with the prior shot. If omitted and
    the shot has `previous_shot_id`, refine falls back to ref-mode (slight
    drift possible).

    Optional `shot_overrides` lets the user nudge the shot before re-render
    (e.g. tweak `visual.action`, change `duration_s`). The override is shallow-
    merged into the plan's shot before generation; the rest of the plan stays
    intact.
    """
    plan: DirectorPlan
    shot_id: str
    reference_images: list[str] = Field(default_factory=list, max_length=12)
    settings: VideoSettings
    previous_last_frame_url: Optional[str] = None
    shot_overrides: Optional[dict] = Field(
        None,
        description="Shallow-merge overrides for the target shot (e.g. {'visual': {'action': 'now smiles'}}).",
    )
    use_llm_scene_gen: bool = True


# ============================================================
# In-memory job store for Director V3 (replace with Dramatiq queue later)
# ============================================================
_JOBS_STORE: dict[str, dict[str, Any]] = {}


# ============================================================
# POST /plan — sync
# ============================================================
@router.post("/plan", response_model=DirectorPlan)
async def create_plan(request: PlanRequest):
    """Layer 1 — Director Agent V3 builds DirectorPlan from brief + refs."""
    if not (request.product_input.url or request.product_input.text_description or request.user_brief):
        raise HTTPException(400, "Provide at least one of: product_input.url, product_input.text_description, or user_brief")

    tech_config = {
        "duration_s": request.settings.duration_s,
        "aspect_ratio": request.settings.aspect_ratio,
        "audio_mode": request.settings.audio_mode,
        "model": request.settings.model,
        "resolution": request.settings.resolution,
        "num_shots": request.settings.num_shots,
    }

    try:
        plan = await director.plan(
            product_input=request.product_input.model_dump(exclude_none=True),
            reference_images=request.reference_images,
            reference_videos=request.reference_videos,
            user_brief=request.user_brief,
            context_injection=request.context_injection.model_dump(exclude_none=True),
            tech_config=tech_config,
            niche_hint=request.niche_hint,
            reference_role_hints=request.reference_role_hints or None,
        )
    except Exception as e:
        logger.exception("[/director/plan] failed")
        raise HTTPException(500, f"Director Agent failed: {str(e)[:240]}") from e

    return plan


# ============================================================
# POST /plan/stream — SSE
# ============================================================
@router.post("/plan/stream")
async def create_plan_stream(request: PlanRequest, raw_request: Request):
    """SSE-streamed Director planning. Stages: init → vision → director → evaluation → done."""
    if not (request.product_input.url or request.product_input.text_description or request.user_brief):
        raise HTTPException(400, "Provide brief or product_input")

    tech_config = {
        "duration_s": request.settings.duration_s,
        "aspect_ratio": request.settings.aspect_ratio,
        "audio_mode": request.settings.audio_mode,
        "model": request.settings.model,
        "resolution": request.settings.resolution,
        "num_shots": request.settings.num_shots,
    }

    event_queue: asyncio.Queue = asyncio.Queue(maxsize=100)

    async def _cb(event: dict):
        try:
            event_queue.put_nowait(("stage", event))
        except asyncio.QueueFull:
            try:
                event_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            await event_queue.put(("stage", event))

    async def _run():
        try:
            plan = await director.plan(
                product_input=request.product_input.model_dump(exclude_none=True),
                reference_images=request.reference_images,
                reference_videos=request.reference_videos,
                user_brief=request.user_brief,
                context_injection=request.context_injection.model_dump(exclude_none=True),
                tech_config=tech_config,
                niche_hint=request.niche_hint,
                reference_role_hints=request.reference_role_hints or None,
                progress_callback=_cb,
            )
            await event_queue.put(("complete", plan.model_dump()))
        except Exception as e:
            logger.exception("[/director/plan/stream] failed")
            await event_queue.put(("error", {"error": str(e)[:300]}))
        finally:
            await event_queue.put(("__end__", None))

    async def _gen():
        yield 'event: open\ndata: {"message":"Director V3 starting"}\n\n'
        task = asyncio.create_task(_run())
        try:
            while True:
                if await raw_request.is_disconnected():
                    task.cancel()
                    break
                try:
                    et, payload = await asyncio.wait_for(event_queue.get(), timeout=30.0)
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
                    continue
                if et == "__end__":
                    break
                yield f"event: {et}\ndata: {json.dumps(payload, ensure_ascii=False)}\n\n"
                if et in ("complete", "error"):
                    break
        finally:
            if not task.done():
                task.cancel()

    return StreamingResponse(
        _gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


# ============================================================
# POST /storyboard — gen storyboard images for an approved plan
# ============================================================
@router.post("/storyboard")
async def gen_storyboard(request: StoryboardRequest):
    """Fire Seedream/Flux image gen for each frame in storyboard_grid.

    Returns updated DirectorPlan with `generated_url` filled per frame.
    Cost: ~$0.04 / frame × N shots. User can skip and upload manually instead.
    """
    from vendors.atlascloud import atlas_client
    if atlas_client is None:
        raise HTTPException(503, "AtlasCloud not configured")

    plan = request.plan
    if not plan.storyboard_grid:
        plan = continuity_manager.ensure_storyboard_complete(plan)

    async def _gen_one(frame: StoryboardFrame) -> StoryboardFrame:
        if frame.user_uploaded_url:
            frame.generated_url = frame.user_uploaded_url
            return frame
        try:
            res = await asyncio.to_thread(
                atlas_client.generate_image,
                prompt=frame.prompt,
                model=request.image_model,
                size=frame.image_size,
                n=1,
            )
            frame.generated_url = res.get("url")
        except Exception as e:
            logger.warning(f"[storyboard] frame {frame.shot_id} fail: {e}")
        return frame

    # Parallel batch — 4 concurrent
    sem = asyncio.Semaphore(4)

    async def _bounded(f: StoryboardFrame) -> StoryboardFrame:
        async with sem:
            return await _gen_one(f)

    plan.storyboard_grid = await asyncio.gather(*(_bounded(f) for f in plan.storyboard_grid))
    plan.cost_estimate.storyboard_gen_cost_usd = round(0.04 * len(plan.storyboard_grid), 3)
    plan.cost_estimate.total_cost_usd = round(
        plan.cost_estimate.plan_cost_usd
        + plan.cost_estimate.storyboard_gen_cost_usd
        + plan.cost_estimate.render_cost_usd
        + plan.cost_estimate.audio_cost_usd,
        3,
    )
    return plan


# ============================================================
# POST /generate — render an approved DirectorPlan (canonical path)
# ============================================================
@router.post("/generate")
async def generate_video(request: GenerateRequest):
    """Layer 3 — render an approved DirectorPlan.

    Canonical Human-in-the-Loop entry: the frontend POSTs back the plan the user
    just reviewed (or edited) in `DirectorPlanModal`. The server re-validates
    continuity, sanitizes soft issues, then dispatches the render in the
    background. Returns a `job_id` for polling at `/director/jobs/{id}`.
    """
    # Validate continuity upfront → fail-fast 400 for tampered plans
    try:
        warnings = continuity_manager.validate_plan(
            request.plan,
            target_duration_s=request.settings.duration_s,
            tolerance_s=2,
        )
    except continuity_manager.ContinuityError as e:
        raise HTTPException(400, f"Plan rejected by Continuity Manager: {e}") from e

    # V3.1 — also validate the plan against the chosen model's hard limits
    # (max refs, discrete durations, etc.). Treat as warnings, but surface them
    # to the user so they can hit "Refine" before burning credits.
    model_violations = continuity_manager.validate_plan_against_model(
        request.plan, user_model=request.settings.model,
    )
    if model_violations:
        warnings.extend(model_violations)
        logger.warning(
            f"[/director/generate] {request.plan.plan_id} model-fit violations: "
            f"{model_violations[:5]}"
        )

    job_id = f"job_{uuid.uuid4().hex[:12]}"
    _JOBS_STORE[job_id] = {
        "status": "pending",
        "progress": 0,
        "current_step": "queued",
        "plan_id": request.plan.plan_id,
        "mode": "approved",
        "validation_warnings": warnings or [],
        "created_at": datetime.utcnow().isoformat() + "Z",
    }
    if warnings:
        logger.warning(
            f"[/director/generate] {job_id} plan warnings (will sanitize): {warnings[:5]}"
        )

    sanitized_plan = continuity_manager.sanitize_plan(request.plan)

    async def _run():
        try:
            await video_worker.render_plan(
                job_id=job_id,
                plan=sanitized_plan,
                reference_images=request.reference_images,
                user_model=request.settings.model,
                resolution=request.settings.resolution,
                audio_plan=request.audio_plan,
                jobs_store=_JOBS_STORE,
                use_llm_scene_gen=request.use_llm_scene_gen,
                cost_gate_mode=request.cost_gate_mode,
                cost_gate_threshold=request.cost_gate_threshold,
            )
        except Exception as e:
            logger.exception(f"[/director/generate] job {job_id} failed")
            _JOBS_STORE[job_id].update(status="failed", error_message=str(e)[:300])

    asyncio.create_task(_run())

    return {
        "job_id": job_id,
        "polling_url": f"/api/v1/director/jobs/{job_id}",
        "estimated_duration_s": sum(s.duration_s for s in sanitized_plan.shot_list),
        "estimated_cost_usd": sanitized_plan.cost_estimate.total_cost_usd,
        "plan_id": sanitized_plan.plan_id,
        "mode": "approved",
        "cost_gate_mode": request.cost_gate_mode,
    }


# ============================================================
# POST /plan-and-render — one-shot escape hatch (no Human-in-the-Loop)
# ============================================================
@router.post("/plan-and-render")
async def plan_and_render(request: PlanAndRenderRequest):
    """Build a plan then render it immediately. Skips Human-in-the-Loop review.

    Use cases:
        - Automated batch jobs (CI / cron).
        - CLI / scripted tools where there is no human reviewer.

    The job state goes `pending → planning → rendering → assembling → done`.
    Plan/eval cost is still incurred; clients that want savings should batch via
    `/plan` + caching the DirectorPlan client-side instead.
    """
    pr = request.plan_request

    if not (pr.product_input.url or pr.product_input.text_description or pr.user_brief):
        raise HTTPException(400, "Provide brief or product_input on plan_request")

    job_id = f"job_{uuid.uuid4().hex[:12]}"
    _JOBS_STORE[job_id] = {
        "status": "pending",
        "progress": 0,
        "current_step": "queued",
        "plan_id": None,
        "mode": "plan_and_render",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    async def _run():
        try:
            _JOBS_STORE[job_id].update(status="planning", current_step="director_agent")
            tech_config = {
                "duration_s": pr.settings.duration_s,
                "aspect_ratio": pr.settings.aspect_ratio,
                "audio_mode": pr.settings.audio_mode,
                "model": pr.settings.model,
                "resolution": pr.settings.resolution,
                "num_shots": pr.settings.num_shots,
            }
            plan_built = await director.plan(
                product_input=pr.product_input.model_dump(exclude_none=True),
                reference_images=pr.reference_images,
                reference_videos=pr.reference_videos,
                user_brief=pr.user_brief,
                context_injection=pr.context_injection.model_dump(exclude_none=True),
                tech_config=tech_config,
                niche_hint=pr.niche_hint,
                reference_role_hints=pr.reference_role_hints or None,
            )
            _JOBS_STORE[job_id]["plan_id"] = plan_built.plan_id

            warnings = continuity_manager.validate_plan(
                plan_built,
                target_duration_s=pr.settings.duration_s,
                tolerance_s=2,
            )
            if warnings:
                _JOBS_STORE[job_id]["validation_warnings"] = warnings
                logger.warning(
                    f"[/director/plan-and-render] {job_id} warnings: {warnings[:5]}"
                )
            plan_built = continuity_manager.sanitize_plan(plan_built)

            await video_worker.render_plan(
                job_id=job_id,
                plan=plan_built,
                reference_images=pr.reference_images,
                user_model=pr.settings.model,
                resolution=pr.settings.resolution,
                audio_plan=request.audio_plan,
                jobs_store=_JOBS_STORE,
                use_llm_scene_gen=request.use_llm_scene_gen,
            )
        except Exception as e:
            logger.exception(f"[/director/plan-and-render] job {job_id} failed")
            _JOBS_STORE[job_id].update(status="failed", error_message=str(e)[:300])

    asyncio.create_task(_run())

    return {
        "job_id": job_id,
        "polling_url": f"/api/v1/director/jobs/{job_id}",
        "estimated_duration_s": pr.settings.duration_s,
        "estimated_cost_usd": 0.0,  # unknown until plan() returns
        "plan_id": None,
        "mode": "plan_and_render",
    }


# ============================================================
# POST /revise — Layer 1.5 LLM revise current plan via instruction
# ============================================================
@router.post("/revise", response_model=DirectorPlan)
async def revise_plan(request: ReviseRequest):
    """Mutate the provided plan based on `instruction` and return revised plan.

    Implementation: single LLM call against `system_prompts/revise.md`.
    Server then re-validates continuity + sanitizes — frontend can swap the
    revised plan into the editor directly.
    """
    from system_prompts import load as load_system_prompt
    from vendors.llm_router import llm
    from agent.model_capabilities import summary_for_director_prompt
    from agent.director_agent import _safe_parse_json  # reuse fence-stripping parser
    from pydantic import ValidationError as _PVE
    import json as _json

    tech_config = {
        "duration_s": request.settings.duration_s,
        "aspect_ratio": request.settings.aspect_ratio,
        "audio_mode": request.settings.audio_mode,
        "model": request.settings.model,
        "resolution": request.settings.resolution,
        "num_shots": request.settings.num_shots,
        "model_capability_notes": summary_for_director_prompt(request.settings.model),
    }
    payload = {
        "current_plan": request.plan.model_dump(),
        "user_instruction": request.instruction,
        "tech_config": tech_config,
    }
    try:
        raw = await asyncio.to_thread(
            llm.complete,
            system_prompt=load_system_prompt("revise"),
            user_message=_json.dumps(payload, ensure_ascii=False, default=str),
            task="generator",
            max_tokens=8000,
            temperature=0.4,
        )
    except Exception as e:
        logger.exception("[/director/revise] LLM call failed")
        raise HTTPException(500, f"Revise LLM call failed: {str(e)[:240]}") from e

    try:
        raw_dict = _safe_parse_json(raw)
    except Exception as e:
        logger.error(f"[/director/revise] JSON parse fail. Head: {raw[:300]}")
        raise HTTPException(500, f"Revise output is not valid JSON: {e}") from e

    # Pydantic validate — re-use DirectorPlan schema (raises 422 on shape drift)
    try:
        revised = DirectorPlan(**raw_dict)
    except _PVE as e:
        logger.error(f"[/director/revise] schema invalid: {e}")
        raise HTTPException(500, f"Revised plan schema invalid: {e}") from e

    # Re-validate continuity + sanitize before returning
    warnings = continuity_manager.validate_plan(
        revised, target_duration_s=request.settings.duration_s, tolerance_s=2,
    )
    if warnings:
        logger.warning(f"[/director/revise] revised plan warnings: {warnings[:5]}")
    revised = continuity_manager.sanitize_plan(revised)
    return revised


# ============================================================
# POST /refine — re-render ONE shot
# ============================================================
@router.post("/refine")
async def refine_shot(request: RefineRequest):
    """Re-render a single shot from an approved plan (Evaluation-driven flow).

    Cost: 1 shot × per-second model price (vs. full plan re-render). Typical
    use: Evaluation flagged `S3` as `consistency_score=5.2` → user clicks
    "Refine S3" → this endpoint regenerates just that clip.
    """
    # Validate shot exists
    target = next((s for s in request.plan.shot_list if s.shot_id == request.shot_id), None)
    if target is None:
        raise HTTPException(404, f"shot_id '{request.shot_id}' not in plan")

    # Apply shot overrides (shallow merge into the target shot)
    plan_for_refine = request.plan
    if request.shot_overrides:
        plan_copy = request.plan.model_copy(deep=True)
        target_copy = next(s for s in plan_copy.shot_list if s.shot_id == request.shot_id)
        # Shallow merge — for nested visual/audio/continuity dicts, take user override entirely
        for k, v in request.shot_overrides.items():
            if hasattr(target_copy, k):
                if isinstance(v, dict) and hasattr(getattr(target_copy, k), "model_fields"):
                    sub = getattr(target_copy, k)
                    for sk, sv in v.items():
                        if hasattr(sub, sk):
                            setattr(sub, sk, sv)
                else:
                    setattr(target_copy, k, v)
        plan_for_refine = plan_copy

    job_id = f"refine_{uuid.uuid4().hex[:12]}"
    _JOBS_STORE[job_id] = {
        "status": "pending",
        "progress": 0,
        "current_step": "queued",
        "plan_id": request.plan.plan_id,
        "shot_id": request.shot_id,
        "mode": "refine",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    async def _run():
        try:
            result = await video_worker.render_single_shot(
                job_id=job_id,
                plan=plan_for_refine,
                shot_id=request.shot_id,
                reference_images=request.reference_images,
                user_model=request.settings.model,
                resolution=request.settings.resolution,
                previous_last_frame_url=request.previous_last_frame_url,
                jobs_store=_JOBS_STORE,
                use_llm_scene_gen=request.use_llm_scene_gen,
            )
            _JOBS_STORE[job_id].update(refine_result=result)
        except Exception as e:
            logger.exception(f"[/director/refine] {job_id} failed")
            _JOBS_STORE[job_id].update(status="failed", error_message=str(e)[:300])

    asyncio.create_task(_run())
    return {
        "job_id": job_id,
        "polling_url": f"/api/v1/director/jobs/{job_id}",
        "shot_id": request.shot_id,
        "estimated_duration_s": target.duration_s,
        "mode": "refine",
    }


# ============================================================
# GET /jobs/{job_id}
# ============================================================
@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    if job_id not in _JOBS_STORE:
        raise HTTPException(404, "job not found")
    return {"job_id": job_id, **_JOBS_STORE[job_id]}


@router.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    if job_id not in _JOBS_STORE:
        raise HTTPException(404, "job not found")
    _JOBS_STORE[job_id].update(status="cancelled")
    return {"job_id": job_id, "status": "cancelled"}


# ============================================================
# Project History — list / detail / delete persisted jobs
# ============================================================
@router.get("/history")
async def list_history(limit: int = 50, status: Optional[str] = None):
    """List recent Director V3 jobs (persisted to data/director_history.db).

    Sorted by `finished_at` desc. Each item is a thin summary; full plan +
    chain meta available via GET /history/{job_id}.
    """
    return {"items": director_history.list_jobs(limit=limit, status_filter=status)}


@router.get("/history/{job_id}")
async def get_history(job_id: str):
    """Full snapshot incl. plan + chain — used by Fork / Replay."""
    item = director_history.get_job(job_id, include_plan=True)
    if not item:
        raise HTTPException(404, f"history job '{job_id}' not found")
    return item


@router.delete("/history/{job_id}")
async def delete_history(job_id: str):
    if not director_history.delete_job(job_id):
        raise HTTPException(404, f"history job '{job_id}' not found")
    return {"ok": True, "job_id": job_id}
