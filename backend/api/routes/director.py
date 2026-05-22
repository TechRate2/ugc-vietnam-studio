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
    """Dual-mode request — pass exactly ONE of `plan` or `plan_request`.

    MODE A (Human-in-the-Loop, recommended):
        plan = the full DirectorPlan the user reviewed & approved (possibly edited).

    MODE B (Auto plan-then-render, skip review):
        plan_request = the same payload shape as POST /api/v1/director/plan.
        The server will call `director.plan()` first, then immediately render.

    Mutual exclusion is enforced — passing both → 400.
    """
    plan: Optional[DirectorPlan] = None
    plan_request: Optional[PlanRequest] = Field(
        None,
        description="If set (and plan=null), server calls director.plan() then renders.",
    )
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
# POST /generate — kick off video render
# ============================================================
@router.post("/generate")
async def generate_video(request: GenerateRequest):
    """Layer 3 — render an approved DirectorPlan (Mode A) OR plan-then-render (Mode B).

    Validates inputs, runs Continuity Manager checks against the plan to fail fast
    on tampered data, then dispatches `video_worker.render_plan()` in the background.
    """
    # ---- Mutual-exclusion + presence check ----
    if request.plan is None and request.plan_request is None:
        raise HTTPException(
            400,
            "Provide either `plan` (approved DirectorPlan) or `plan_request` (build then render).",
        )
    if request.plan is not None and request.plan_request is not None:
        raise HTTPException(
            400,
            "Pass exactly ONE of `plan` or `plan_request`, not both.",
        )

    job_id = f"job_{uuid.uuid4().hex[:12]}"
    _JOBS_STORE[job_id] = {
        "status": "pending",
        "progress": 0,
        "current_step": "queued",
        "plan_id": request.plan.plan_id if request.plan else None,
        "mode": "approved" if request.plan else "auto_plan",
        "created_at": datetime.utcnow().isoformat() + "Z",
    }

    # ---- MODE B preflight (synchronous plan() call) ----
    # We run Mode B's plan() inside the background task to keep response snappy,
    # but Mode A can validate the supplied plan upfront for instant 4xx feedback.
    if request.plan is not None:
        try:
            warnings = continuity_manager.validate_plan(
                request.plan,
                target_duration_s=request.settings.duration_s,
                tolerance_s=2,
            )
            if warnings:
                logger.warning(
                    f"[/director/generate] {job_id} plan validation warnings: {warnings[:5]}"
                )
                _JOBS_STORE[job_id]["validation_warnings"] = warnings
        except continuity_manager.ContinuityError as e:
            del _JOBS_STORE[job_id]
            raise HTTPException(400, f"Plan rejected by Continuity Manager: {e}") from e

    async def _run():
        try:
            plan_to_render = request.plan
            # MODE B — build the plan first, then render
            if plan_to_render is None:
                assert request.plan_request is not None
                _JOBS_STORE[job_id].update(status="planning", current_step="director_agent")
                tech_config = {
                    "duration_s": request.plan_request.settings.duration_s,
                    "aspect_ratio": request.plan_request.settings.aspect_ratio,
                    "audio_mode": request.plan_request.settings.audio_mode,
                    "model": request.plan_request.settings.model,
                    "resolution": request.plan_request.settings.resolution,
                    "num_shots": request.plan_request.settings.num_shots,
                }
                plan_to_render = await director.plan(
                    product_input=request.plan_request.product_input.model_dump(exclude_none=True),
                    reference_images=request.plan_request.reference_images,
                    reference_videos=request.plan_request.reference_videos,
                    user_brief=request.plan_request.user_brief,
                    context_injection=request.plan_request.context_injection.model_dump(exclude_none=True),
                    tech_config=tech_config,
                    niche_hint=request.plan_request.niche_hint,
                )
                _JOBS_STORE[job_id]["plan_id"] = plan_to_render.plan_id

                # Re-validate the freshly built plan
                warnings = continuity_manager.validate_plan(
                    plan_to_render,
                    target_duration_s=request.settings.duration_s,
                    tolerance_s=2,
                )
                if warnings:
                    _JOBS_STORE[job_id]["validation_warnings"] = warnings

            await video_worker.render_plan(
                job_id=job_id,
                plan=plan_to_render,
                reference_images=request.reference_images,
                user_model=request.settings.model,
                resolution=request.settings.resolution,
                audio_plan=request.audio_plan,
                jobs_store=_JOBS_STORE,
                use_llm_scene_gen=request.use_llm_scene_gen,
            )
        except Exception as e:
            logger.exception(f"[/director/generate] job {job_id} failed")
            _JOBS_STORE[job_id].update(status="failed", error_message=str(e)[:300])

    asyncio.create_task(_run())

    # For Mode A, estimated_* uses the supplied plan. For Mode B we don't know
    # shot count / cost yet — fall back to the settings.duration_s as a hint.
    if request.plan is not None:
        est_dur = sum(s.duration_s for s in request.plan.shot_list)
        est_cost = request.plan.cost_estimate.total_cost_usd
    else:
        est_dur = request.settings.duration_s
        est_cost = 0.0

    return {
        "job_id": job_id,
        "polling_url": f"/api/v1/director/jobs/{job_id}",
        "estimated_duration_s": est_dur,
        "estimated_cost_usd": est_cost,
        "plan_id": _JOBS_STORE[job_id].get("plan_id"),
        "mode": _JOBS_STORE[job_id].get("mode"),
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
