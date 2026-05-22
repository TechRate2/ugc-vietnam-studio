"""Job CRUD endpoints — tạo UGC video job."""

import asyncio
from uuid import UUID, uuid4
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, Header
from loguru import logger

from api.schemas import (
    CreateJobRequest,
    JobCreatedResponse,
    JobStatus,
)
from agent.model_adapter import (
    estimate_cost,
    estimate_total_job_cost,
    get_model_info,
    MAX_COST_PER_VIDEO_USD,
)
from workers import render_pipeline

# BUG-H1 fix: file-based SQLite persistence thay in-memory dict
# JOBS giờ persist qua backend restart.
from core.jobs_store import JOBS, create as _create_job, update as _update_job_store

# Sprint 0: Idempotency-Key middleware (chống double-submit)
from core.idempotency import hash_body as _hash_body, lookup as _idem_lookup, store as _idem_store


router = APIRouter()


# ============================================
# Background task — render in same event loop (Dramatiq production sẽ thay)
# ============================================

async def _run_render_background(job_id: UUID, request_dump: dict):
    """Background runner — chạy render_pipeline async sau khi return job_id.

    Priority dispatch (V3 era):
        1. approved_scenes[] → render_scenes (TopView V2 Multi-Scene queue)
        2. approved_script   → render_approved (V3 strategy.build_prompt)
        3. ❌ Legacy auto-pick path REMOVED — phải /propose trước.
    """
    job_id_str = str(job_id)
    try:
        if request_dump.get("approved_scenes"):
            await render_pipeline.render_scenes(job_id_str, request_dump, JOBS)
        elif request_dump.get("approved_script"):
            await render_pipeline.render_approved(job_id_str, request_dump, JOBS)
        else:
            await render_pipeline.render_auto(job_id_str, request_dump, JOBS)  # raises
    except Exception as e:
        logger.exception(f"[BackgroundRender] Job {job_id} failed: {e}")


@router.post("/ugc", response_model=JobCreatedResponse)
async def create_ugc_job(
    request: CreateJobRequest,
    background_tasks: BackgroundTasks,
    idempotency_key: str = Header(None, alias="Idempotency-Key"),
):
    """Tạo UGC video job.

    Pipeline:
        1. Validate input
        2. Estimate cost
        3. Create job record
        4. Trigger worker chain (scrape → analyze → generate → render → assemble)
        5. Return job_id cho frontend poll
    """
    # Sprint 0: Idempotency check — chống double-submit (Stripe pattern)
    if idempotency_key:
        body_hash = _hash_body(request.model_dump())
        cached = _idem_lookup(idempotency_key, body_hash)
        if cached:
            if not cached["body_match"]:
                raise HTTPException(
                    status_code=409,
                    detail=(
                        f"Idempotency-Key đã dùng với body khác. "
                        f"Đổi key hoặc đợi 24h."
                    ),
                )
            logger.info(
                f"[/jobs/ugc] Idempotency cache HIT key={idempotency_key[:16]}... — replay response"
            )
            return cached["response_json"]

    job_id = uuid4()
    has_approved_script = request.approved_script is not None
    logger.info(
        f"Creating job {job_id}: template={request.template_id}, model={request.settings.model}, "
        f"approved_proposal={request.proposal_id}, has_approved_script={has_approved_script}, "
        f"idempotency_key={'set' if idempotency_key else 'none'}"
    )
    if has_approved_script:
        logger.info(
            f"  → approved variant={request.approved_script.variant_id}, "
            f"framework={request.approved_script.framework}, "
            f"avatar={request.avatar_id}"
        )

    # 1. Validate model availability (raises nếu unknown/unavailable)
    model_info = get_model_info(request.settings.model)

    # 2. Validate duration vs model max
    if request.settings.duration_s > model_info["max_duration_s"]:
        # Long-form sẽ chia bằng duration_extender — KHÔNG chặn ở đây
        # nhưng note cost sẽ scale theo n_gens
        pass

    # 3. Validate refs vs model max
    if len(request.reference_images) > model_info["max_references"]:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Model {request.settings.model} chỉ support tối đa "
                f"{model_info['max_references']} reference, nhận {len(request.reference_images)}."
            ),
        )

    # 3.1. V3.3 — Validate MIN refs per-spec (chặn Vidu Q3 ref-to-video không có ảnh → 400)
    try:
        from agent.model_specs import VIDEO_MODEL_SPECS
        _model_to_atlas = {
            "vidu_q3": "vidu_q3_ref", "vidu_q3_mix": "vidu_q3_mix_ref",
            "wan_2_7": "wan_2_7_i2v",
            "seedance_1_5_pro": "seedance_v15_pro_i2v",
            "seedance_2_0": "seedance_2_0_ref",
            "seedance_2_0_fast": "seedance_2_0_fast_ref",
            "auto": "vidu_q3_ref",
        }
        _atlas_k = _model_to_atlas.get(request.settings.model, "vidu_q3_ref")
        _spec = VIDEO_MODEL_SPECS.get(_atlas_k, {})
        _min_refs = _spec.get("min_references", 0)
        if _min_refs > 0 and len(request.reference_images) < _min_refs:
            # Suggest fallback dựa model spec
            _fallback_hint = {
                "vidu_q3": "Upload ít nhất 1 ảnh, HOẶC đổi sang Seedance 2.0 Fast (text-to-video, không cần ảnh)",
                "vidu_q3_mix": "Upload ít nhất 1 ảnh product/character",
                "wan_2_7": "Upload 1 ảnh portrait (mặt nhìn camera) — Wan 2.7 cần để tạo talking head",
                "seedance_1_5_pro": "Upload ít nhất 1 ảnh (silent moodboard), HOẶC đổi sang Seedance 2.0 t2v",
                "seedance_2_0": "Upload ít nhất 1 ảnh, HOẶC đổi sang Seedance 2.0 Fast text-to-video",
                "seedance_2_0_fast": "Upload ít nhất 1 ảnh",
            }.get(request.settings.model, f"Upload ít nhất {_min_refs} ảnh")
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Model {request.settings.model} CẦN tối thiểu {_min_refs} ảnh reference, "
                    f"nhận {len(request.reference_images)}. → {_fallback_hint}."
                ),
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"[/jobs/ugc] min_refs validate failed (non-fatal): {e}")

    # 4. Validate audio mode + model compat
    if request.settings.audio_mode == "dialogue_vo" and model_info.get("supports_silent_only"):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Model {request.settings.model} silent-only — không thể inject voice trực tiếp. "
                f"Đổi sang vidu_q3 / wan_2_7, hoặc giữ silent_native + overlay TTS post-prod."
            ),
        )

    # 5. Cost pre-flight — REJECT nếu vượt budget hard cap
    cost = estimate_total_job_cost(
        request.settings.model,
        request.settings.duration_s,
        request.settings.audio_mode,
    )
    if cost["exceeds_budget"]:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Job ước tính ${cost['total_usd']} > giới hạn ${MAX_COST_PER_VIDEO_USD}. "
                f"Giảm duration hoặc đổi model rẻ hơn."
            ),
        )

    # 6. Create job record (file-based SQLite persist — BUG-H1 fix)
    # BUG-M5: validate voice_persona trước khi vào pipeline để fail fast
    voice_persona = request.settings.voice_persona
    if voice_persona:
        from vendors.genmax import VIETNAMESE_VOICE_PRESETS
        if voice_persona not in VIETNAMESE_VOICE_PRESETS and not _looks_like_voice_id(voice_persona):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"voice_persona '{voice_persona}' không hợp lệ. "
                    f"Preset alias: {list(VIETNAMESE_VOICE_PRESETS.keys())} hoặc UUID GenMax voice_id."
                ),
            )

    _create_job(job_id, {
        "request": request.model_dump(),
        "status": "pending",
        "progress": 0,
        "current_step": None,
        "cost_estimate_usd": cost["total_usd"],
        "cost_breakdown": cost,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    })

    # 7. Dispatch render pipeline async (BackgroundTasks chạy sau khi response trả)
    #    Path A (approved): có approved_script → render_pipeline.render_approved()
    #    Path B (legacy):   no approved_script → render_pipeline.render_auto()
    if has_approved_script:
        logger.info(
            f"Job {job_id} → APPROVED PATH (Phase 2 Director Agent), "
            f"cost ~${cost['total_usd']}, variant={request.approved_script.variant_id}"
        )
    else:
        logger.info(
            f"Job {job_id} → LEGACY PATH (AI auto-pick), cost ~${cost['total_usd']}"
        )

    # Background render — dùng asyncio.create_task để không block response
    background_tasks.add_task(_run_render_background, job_id, request.model_dump())

    response = JobCreatedResponse(
        job_id=job_id,
        status="pending",
        estimated_duration_s=180,
        estimated_cost_usd=cost["total_usd"],
        polling_url=f"/api/v1/jobs/{job_id}",
    )

    # Sprint 0: Store response cho Idempotency key replay sau (TTL 24h)
    if idempotency_key:
        body_hash = _hash_body(request.model_dump())
        _idem_store(idempotency_key, body_hash, response.model_dump(), status_code=201)

    return response


@router.get("/{job_id}", response_model=JobStatus)
async def get_job_status(job_id: UUID):
    """Poll job status."""
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} không tồn tại")

    # V3.4 — convert file:// URL sang HTTP /download endpoint (dev mode khi R2 chưa setup)
    output_url = job.get("output_url")
    if output_url and output_url.startswith("file://"):
        # Replace local file path with HTTP endpoint browser có thể access
        output_url = f"/api/v1/jobs/{job_id}/download"

    return JobStatus(
        job_id=job["job_id"],
        status=job["status"],
        progress=job["progress"],
        current_step=job.get("current_step"),
        estimated_remaining_s=job.get("estimated_remaining_s"),
        output_url=output_url,
        thumbnail_url=job.get("thumbnail_url"),
        duration_s=job.get("duration_s"),
        cost_actual_usd=job.get("cost_actual_usd"),
        error_message=job.get("error_message"),
        created_at=job["created_at"],
        updated_at=job["updated_at"],
    )


@router.get("/{job_id}/download")
async def download_job_output(job_id: UUID):
    """Serve final MP4 từ local temp dir (dev mode khi R2 chưa setup).

    V3.4 — Fallback để browser có thể preview/download khi file:// URL bị block.
    Production cần setup R2 + return public URL trực tiếp.
    """
    from fastapi.responses import FileResponse
    from pathlib import Path as _P

    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} không tồn tại")

    raw_url = job.get("output_url") or ""
    if not raw_url.startswith("file://"):
        raise HTTPException(
            status_code=400,
            detail="Output đã upload R2 — dùng output_url trực tiếp, không cần download endpoint."
        )

    # Parse file:// URL → local path
    local_path = raw_url[len("file://"):].lstrip("/").replace("/", "\\") if "\\" in raw_url else raw_url[len("file://"):]
    p = _P(local_path)
    # Try fallback path formats
    if not p.exists():
        # On Windows, file://C:\path may need C:\path direct
        alt = _P(raw_url.replace("file://", ""))
        if alt.exists():
            p = alt
    if not p.exists():
        raise HTTPException(status_code=404, detail=f"File không tồn tại: {p}")

    return FileResponse(
        path=str(p),
        media_type="video/mp4",
        filename=f"ugc_video_{job_id}.mp4",
        headers={"Cache-Control": "public, max-age=300"},
    )


@router.delete("/{job_id}")
async def cancel_job(job_id: UUID):
    """Cancel job đang chạy.

    BUG-H3 fix: propagate cancel sang AtlasCloud video gen để KHÔNG bị charge tiếp.
    """
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} không tồn tại")

    if job["status"] in ["done", "failed"]:
        raise HTTPException(status_code=400, detail=f"Job đã ở status terminal: {job['status']}")

    # BUG-H3: cancel AtlasCloud prediction nếu đang running
    atlas_prediction_id = job.get("atlas_prediction_id")
    if atlas_prediction_id:
        try:
            from vendors.atlascloud import atlas_client
            if atlas_client:
                await asyncio.to_thread(atlas_client.cancel_prediction, atlas_prediction_id)
                logger.info(
                    f"[/jobs/cancel] AtlasCloud prediction {atlas_prediction_id} cancelled"
                )
        except Exception as e:
            logger.warning(
                f"[/jobs/cancel] AtlasCloud cancel fail: {e} — user vẫn có thể bị charge"
            )

    _update_job_store(
        job_id,
        status="failed",
        error_message="Cancelled by user",
    )

    return {"status": "cancelled", "job_id": str(job_id)}


def _looks_like_voice_id(s: str) -> bool:
    """Heuristic — UUID format hoặc 20+ char alphanumeric."""
    if not s:
        return False
    return len(s) >= 16 and all(c.isalnum() or c == "-" for c in s)
