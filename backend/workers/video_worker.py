"""Video Worker V3 — Director Plan render orchestrator.

Replaces the linear render_pipeline path for Director Agent V3.

Pipeline:
    1. Receive DirectorPlan (Continuity Bible + Shot List + storyboard)
    2. Scene Generation Agent → N SceneRenderJobs (1 per shot)
    3. Reference Chaining loop:
        - shot[0]: ref_to_video using bound references
        - shot[i] (i>0, has previous_shot_id): i2v using shot[i-1].last_frame_url
        - shot[i] (i>0, no chain — intentional cut): ref_to_video with fresh refs
    4. Download all clips → temp dir
    5. AssembleWorker FFmpeg concat + color consistency pass + (optional) audio
    6. Upload R2 → public URL

Universal Reference: every bible.reference_assets[].url is part of a pool. Scene Gen
binds per-shot refs via continuity_manager.references_for_shot().

Reference Chaining: when a shot's continuity.previous_shot_id is set AND the previous
render returned a last_frame_url, this worker switches the model to i2v variant and
passes the prior last frame as image input — identity stays 100% across the chain.
"""
from __future__ import annotations

import asyncio
import os
import tempfile
import uuid
from pathlib import Path
from typing import Optional, Any

import httpx
from loguru import logger

from agent.schemas import DirectorPlan, Shot
from agent import continuity_manager, scene_generation_agent
from vendors.atlascloud import atlas_client
from workers.assemble_worker import AssembleWorker


# ============================================================
# Model routing — user model choice → AtlasCloud keys for ref / i2v
# ============================================================
USER_MODEL_TO_ATLAS_REF: dict[str, str] = {
    "vidu_q3": "vidu_q3_ref",
    "vidu_q3_mix": "vidu_q3_mix_ref",
    "wan_2_7": "wan_2_7_i2v",                  # wan only i2v
    "seedance_1_5_pro": "seedance_v15_pro_i2v",
    "seedance_2_0": "seedance_2_0_ref",
    "seedance_2_0_fast": "seedance_2_0_fast_ref",
}
USER_MODEL_TO_ATLAS_I2V: dict[str, str] = {
    "vidu_q3": "wan_2_7_i2v",                  # vidu has no native i2v — fallback wan
    "vidu_q3_mix": "wan_2_7_i2v",
    "wan_2_7": "wan_2_7_i2v",
    "seedance_1_5_pro": "seedance_v15_pro_i2v",
    "seedance_2_0": "seedance_2_0_i2v",
    "seedance_2_0_fast": "seedance_2_0_fast_i2v",
}


def _resolve_models(user_model: str) -> tuple[str, str]:
    """Return (ref_key, i2v_key) for a user model choice."""
    if user_model == "auto":
        user_model = "seedance_2_0"
    return (
        USER_MODEL_TO_ATLAS_REF.get(user_model, "seedance_2_0_ref"),
        USER_MODEL_TO_ATLAS_I2V.get(user_model, "seedance_2_0_i2v"),
    )


# ============================================================
# Public entry
# ============================================================
async def render_plan(
    job_id: str,
    plan: DirectorPlan,
    reference_images: list[str],
    user_model: str,
    resolution: str,
    audio_plan: Optional[dict] = None,
    jobs_store: Optional[dict] = None,
    use_llm_scene_gen: bool = True,
) -> dict:
    """Render a full DirectorPlan → final MP4.

    Args:
        job_id: UUID for tracking
        plan: validated DirectorPlan from Director Agent V3
        reference_images: full ordered list of uploaded refs (universal pool)
        user_model: vidu_q3 / wan_2_7 / seedance_2_0 / auto / ...
        resolution: 720p / 1080p / ...
        audio_plan: optional {mode, voice_audio_url, sfx_audio_url, caption_text_vn}
        jobs_store: optional in-memory job state dict
        use_llm_scene_gen: True = Scene Generation Agent LLM call per shot
                           False = deterministic prompt build (no LLM, faster)

    Returns:
        {output_path, scene_count, total_duration_s, last_frames_used}
    """
    bible = plan.continuity_bible
    shots = plan.shot_list
    ref_key, i2v_key = _resolve_models(user_model)

    _update_job(jobs_store, job_id, status="rendering", progress=10,
                current_step="scene_gen", scene_count=len(shots))

    # Stage 1 — Scene Generation (build all N prompts)
    # For shot[0] use ref-mode. For chained shots we will switch to i2v at runtime
    # once we have the prior shot's last_frame_url.
    model_keys: dict[str, str] = {}
    for s in shots:
        # if user picked specific model per shot
        per_shot_user_model = s.model_routing.preferred_model
        if per_shot_user_model and per_shot_user_model != "auto":
            mk_ref, mk_i2v = _resolve_models(per_shot_user_model)
        else:
            mk_ref, mk_i2v = ref_key, i2v_key
        # default to ref — will swap to i2v in chain loop
        model_keys[s.shot_id] = mk_ref

    scene_jobs = scene_generation_agent.generate_all_scenes(
        bible=bible,
        shots=shots,
        reference_images=reference_images,
        model_key_per_shot=model_keys,
        last_frame_urls=None,  # filled at runtime
        llm_mode=use_llm_scene_gen,
    )
    scene_jobs_by_id = {j.shot_id: j for j in scene_jobs}

    # Stage 2 — Chain render
    work_dir = Path(tempfile.gettempdir()) / f"cineforge_{job_id}"
    work_dir.mkdir(parents=True, exist_ok=True)

    last_frame_url: Optional[str] = None
    clip_paths: list[Path] = []
    chain_meta: list[dict] = []

    for i, shot in enumerate(shots):
        _update_job(
            jobs_store, job_id,
            status="rendering",
            progress=15 + int(70 * (i / max(1, len(shots)))),
            current_step=f"shot_{i + 1}/{len(shots)}",
        )
        job = scene_jobs_by_id[shot.shot_id]

        # Decide chain on the fly: if Bible+Shot says chain AND we actually have last_frame_url
        should_chain = (
            shot.continuity.previous_shot_id is not None
            and last_frame_url is not None
            and i > 0
        )
        if should_chain:
            # swap to i2v variant
            user_m = (shot.model_routing.preferred_model
                      if shot.model_routing.preferred_model and shot.model_routing.preferred_model != "auto"
                      else user_model)
            _, i2v_model_key = _resolve_models(user_m)
            job.model_key = i2v_model_key
            job.render_mode = "i2v_chain"
            job.chain_input_url = last_frame_url
            job.reference_image_urls = []  # chain frame already carries identity

        # Resolution from caller / per-shot override
        job.resolution = resolution

        # not last → request last_frame
        job.return_last_frame = (i < len(shots) - 1)

        kwargs = job.to_atlas_kwargs()
        kwargs["poll_interval_s"] = 5
        kwargs["timeout_s"] = 600

        logger.info(
            f"[VideoWorker V3] {job_id} shot {shot.shot_id} ({i + 1}/{len(shots)}) "
            f"mode={job.render_mode} model={job.model_key} dur={job.duration_s}s "
            f"refs={len(job.reference_image_urls)}"
        )

        result = await asyncio.to_thread(atlas_client.generate_video, **kwargs)
        clip_url = result.get("video_url")
        if not clip_url:
            raise RuntimeError(f"shot {shot.shot_id}: AtlasCloud returned no video_url. {result}")

        clip_path = work_dir / f"shot_{i:02d}_{shot.shot_id}.mp4"
        await _download_file(clip_url, clip_path)
        clip_paths.append(clip_path)

        last_frame_url = result.get("last_frame_url")
        chain_meta.append({
            "shot_id": shot.shot_id,
            "model_key": job.model_key,
            "render_mode": job.render_mode,
            "video_url": clip_url,
            "last_frame_url": last_frame_url,
            "duration_s": job.duration_s,
        })

    # Stage 3 — Assemble
    _update_job(jobs_store, job_id, status="assembling", progress=88, current_step="ffmpeg_assemble")

    final_mp4 = work_dir / "final.mp4"
    assembler = AssembleWorker(work_dir=str(work_dir))

    target_resolution = _resolution_for_aspect(bible.aspect_ratio, resolution)
    audio_plan = audio_plan or {"mode": "silent_native"}

    await asyncio.to_thread(
        assembler.assemble,
        video_paths=[str(p) for p in clip_paths],
        audio_plan=audio_plan,
        output_path=str(final_mp4),
        bgm_path=audio_plan.get("bgm_path"),
        target_resolution=target_resolution,
    )

    # Stage 4 — Color consistency pass (Bible-driven)
    color_pass_mp4 = work_dir / "final_graded.mp4"
    await asyncio.to_thread(
        _apply_color_consistency,
        str(final_mp4), str(color_pass_mp4),
        bible_color_grading=bible.visual_style.color_grading,
    )

    _update_job(
        jobs_store, job_id,
        status="done", progress=100, current_step="done",
        output_path=str(color_pass_mp4),
        duration_s=sum(s.duration_s for s in shots),
    )

    logger.info(
        f"[VideoWorker V3] {job_id} DONE — {len(shots)} shots, "
        f"{sum(s.duration_s for s in shots)}s total → {color_pass_mp4}"
    )

    return {
        "output_path": str(color_pass_mp4),
        "scene_count": len(shots),
        "total_duration_s": sum(s.duration_s for s in shots),
        "chain": chain_meta,
    }


# ============================================================
# Helpers
# ============================================================
def _update_job(store: Optional[dict], job_id: str, **fields: Any) -> None:
    if store is None:
        return
    if job_id not in store:
        store[job_id] = {}
    store[job_id].update(fields)


async def _download_file(url: str, dest: Path, timeout_s: float = 120.0) -> None:
    async with httpx.AsyncClient(timeout=timeout_s) as c:
        async with c.stream("GET", url) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                async for chunk in r.aiter_bytes(chunk_size=64 * 1024):
                    f.write(chunk)


def _resolution_for_aspect(aspect: str, resolution: str) -> tuple[int, int]:
    """Map 'resolution' + aspect → (w, h) for FFmpeg scale.

    Loose mapping — production should read per-model spec.
    """
    short_side = {
        "480p": 480, "540p": 540, "720p": 720, "720P": 720,
        "1080p": 1080, "1080P": 1080,
    }.get(resolution, 720)

    if aspect == "9:16":
        return (short_side * 9 // 16, short_side)  # portrait
    if aspect == "16:9":
        return (short_side * 16 // 9, short_side)
    if aspect == "1:1":
        return (short_side, short_side)
    return (1080, 1920)


def _apply_color_consistency(input_path: str, output_path: str, bible_color_grading: str) -> None:
    """Single FFmpeg pass that enforces a consistent color grade across the whole video.

    Maps the bible's color_grading string to a deterministic FFmpeg `eq` / `curves` chain.
    Anything not matched → identity (saturation slightly up to keep "real UGC" feel).
    """
    import subprocess

    grade = (bible_color_grading or "").lower()
    # Heuristic mapping — extend over time
    if any(k in grade for k in ["teal", "orange"]):
        vf = "curves=preset=increase_contrast,eq=saturation=1.10:contrast=1.05"
    elif any(k in grade for k in ["warm", "filmic", "golden"]):
        vf = "eq=gamma_r=1.06:gamma_b=0.95:saturation=1.05,curves=preset=lighter"
    elif any(k in grade for k in ["pastel", "airy", "soft"]):
        vf = "eq=brightness=0.02:saturation=0.90:contrast=0.95"
    elif any(k in grade for k in ["noir", "desaturated", "moody"]):
        vf = "eq=saturation=0.55:contrast=1.10"
    elif any(k in grade for k in ["cinematic", "35mm"]):
        vf = "curves=preset=increase_contrast,eq=saturation=1.05"
    else:
        vf = "eq=saturation=1.03"

    cmd = [
        "ffmpeg", "-i", input_path,
        "-vf", vf,
        "-c:v", "libx264", "-preset", "fast", "-crf", "20",
        "-c:a", "copy",
        "-y", output_path,
    ]
    try:
        subprocess.run(cmd, check=True, capture_output=True, timeout=300)
    except Exception as e:
        logger.warning(f"[VideoWorker V3] color pass fail (using ungraded): {e}")
        import shutil
        shutil.copy(input_path, output_path)
