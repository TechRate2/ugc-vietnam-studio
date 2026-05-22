"""Scene Generation Agent — Layer 2.

Takes ONE (ContinuityBible, Shot) pair and produces a model-ready
`SceneRenderJob` that can be fed straight into `atlascloud.generate_video()`.

Two modes:
    - **llm_mode (default)**: 1 LLM call per shot using `system_prompts/scene.md`.
      The LLM returns a JSON `SceneLLMOutput` (see _SceneLLMOutput below) which
      the agent validates, sanitizes, and merges with the deterministic baseline.
    - **deterministic mode** (`llm_mode=False`): pure-function build directly
      from Bible + Shot — no LLM, no network. Useful for cost-sensitive batches.

Reference Chaining is honored on both paths: if the shot has
`continuity.previous_shot_id` set AND the caller supplies a `last_frame_url`,
the job is upgraded to `render_mode="i2v_chain"` and character refs are dropped
(the chain frame already carries identity).

Universal Reference binding is resolved through
`continuity_manager.references_for_shot()` so the same ref pool is shared by
every shot (no need to duplicate bindings per shot).
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Optional, Literal

from loguru import logger
from pydantic import BaseModel, Field, ValidationError

from agent.schemas import ContinuityBible, Shot
from agent import continuity_manager
from system_prompts import load as load_system_prompt
from vendors.llm_router import llm


RenderMode = Literal["ref_to_video", "i2v_chain", "t2v"]


# ============================================================
# Model-key → prompt format hint
# ============================================================
MODEL_FORMAT_HINTS: dict[str, str] = {
    "seedance_2_0_ref": "multi_shot_inline",
    "seedance_2_0_fast_ref": "multi_shot_inline",
    "seedance_2_0_i2v": "i2v_motion",
    "seedance_2_0_fast_i2v": "i2v_motion",
    "seedance_v15_pro_i2v": "time_coded",
    "vidu_q3_ref": "single_descriptive",
    "vidu_q3_mix_ref": "single_descriptive",
    "wan_2_7_i2v": "i2v_motion",
}

_PROMPT_MAX_LEN = {
    "multi_shot_inline": 1200,
    "time_coded": 800,
    "i2v_motion": 600,
    "single_descriptive": 600,
}


# ============================================================
# Output dataclass — what Layer 3 (video_worker) consumes
# ============================================================
@dataclass
class SceneRenderJob:
    """Output for ONE shot — feed directly into `atlascloud.generate_video()`."""

    shot_id: str
    prompt: str
    negative_prompt: str
    reference_image_urls: list[str] = field(default_factory=list)
    render_mode: RenderMode = "ref_to_video"
    chain_input_url: Optional[str] = None
    duration_s: int = 5
    resolution: str = "720p"
    aspect_ratio: str = "9:16"
    generate_audio: bool = False
    movement_amplitude: str = "auto"
    return_last_frame: bool = True
    model_key: str = "seedance_2_0_ref"

    def to_atlas_kwargs(self) -> dict:
        """Convert to kwargs for `atlas_client.generate_video()`."""
        kwargs: dict = {
            "model_key": self.model_key,
            "prompt": self.prompt,
            "duration_s": self.duration_s,
            "resolution": self.resolution,
            "aspect_ratio": self.aspect_ratio,
            "negative_prompt": self.negative_prompt or None,
            "return_last_frame": self.return_last_frame,
            "generate_audio": self.generate_audio,
            "movement_amplitude": self.movement_amplitude,
        }
        if self.render_mode == "i2v_chain" and self.chain_input_url:
            kwargs["image"] = self.chain_input_url
        elif self.reference_image_urls:
            if len(self.reference_image_urls) == 1:
                kwargs["image"] = self.reference_image_urls[0]
                kwargs["images"] = self.reference_image_urls
            else:
                kwargs["images"] = self.reference_image_urls
        return {k: v for k, v in kwargs.items() if v is not None}


# ============================================================
# LLM response schema — what scene.md is contracted to return
# ============================================================
class _SceneLLMOutput(BaseModel):
    """Strict Pydantic gate for the Layer 2 LLM JSON response."""

    prompt: str
    negative_prompt: str = ""
    reference_image_indices: list[int] = Field(default_factory=list)
    render_mode: Optional[RenderMode] = None
    chain_input_url: Optional[str] = None
    model_params: dict = Field(default_factory=dict)


_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _safe_parse_json(raw: str) -> dict:
    cleaned = _FENCE_RE.sub("", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        s, e = cleaned.find("{"), cleaned.rfind("}")
        if s >= 0 and e > s:
            return json.loads(cleaned[s:e + 1])
        raise


# ============================================================
# Reference filtering — chain frame carries identity, drop char refs
# ============================================================
def _filter_refs_for_chain(
    bible: ContinuityBible,
    refs: list,
) -> list:
    """When a shot chains from a previous shot's last frame, character +
    product anchors are already baked in. Keep only style/environment refs to
    avoid the model double-binding identity (which causes drift).
    """
    keep_roles = {"style_reference", "environment", "brand_asset"}
    return [r for r in refs if r.role in keep_roles]


# ============================================================
# Public entry — single shot
# ============================================================
def generate_scene(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
    reference_images: list[str],
    last_frame_url: Optional[str] = None,
    *,
    llm_mode: bool = True,
    resolution: str = "720p",
    is_last_shot: bool = False,
) -> SceneRenderJob:
    """Build a `SceneRenderJob` for one shot.

    Args:
        bible:              ContinuityBible (global state).
        shot:               One `Shot` entry.
        model_key:          AtlasCloud model key (e.g. `seedance_2_0_ref`).
        reference_images:   Full ordered list of uploaded refs (indexed by
                            `Bible.reference_assets[].index`).
        last_frame_url:     Optional — caller passes the previous shot's last
                            frame URL when this shot is chained.
        llm_mode:           True (default) = 1 LLM call. False = deterministic.
        resolution:         Output resolution (e.g. `720p`).
        is_last_shot:       If True, `return_last_frame=False` (no chain after).
    """
    # ---- Resolve render_mode -------------------------------------------------
    is_chain = bool(shot.continuity.previous_shot_id) and bool(last_frame_url)
    bound_refs = continuity_manager.references_for_shot(bible, shot)
    if is_chain:
        bound_refs = _filter_refs_for_chain(bible, bound_refs)
    ref_urls = [
        reference_images[r.index]
        for r in bound_refs
        if 0 <= r.index < len(reference_images)
    ]
    render_mode: RenderMode = (
        "i2v_chain" if is_chain
        else ("ref_to_video" if ref_urls else "t2v")
    )

    # ---- Audio decision (from Bible.audio_design) ---------------------------
    dialogue_style = (bible.audio_design.dialogue_style or "silent").lower()
    generate_audio = dialogue_style not in ("silent", "")

    # ---- Negative prompt baseline (deterministic) ----------------------------
    negative = continuity_manager.build_negative_prompt(bible)

    # ---- Prompt build -------------------------------------------------------
    prompt: str
    llm_negative: Optional[str] = None
    llm_render_mode: Optional[RenderMode] = None
    llm_model_params: dict = {}

    if llm_mode:
        try:
            llm_out = _llm_build(
                bible=bible, shot=shot, model_key=model_key,
                ref_urls=ref_urls,
                last_frame_url=last_frame_url if is_chain else None,
            )
            prompt = llm_out.prompt.strip()
            if llm_out.negative_prompt:
                llm_negative = llm_out.negative_prompt.strip()
            llm_render_mode = llm_out.render_mode
            llm_model_params = llm_out.model_params or {}

            # Allow LLM to narrow render_mode (e.g. ref→t2v if it sees nothing
            # usable), but never let it FALSELY claim "i2v_chain" when no chain
            # input is available.
            if llm_render_mode == "i2v_chain" and not last_frame_url:
                llm_render_mode = None
            if llm_render_mode in ("ref_to_video", "i2v_chain", "t2v"):
                render_mode = llm_render_mode
        except Exception as e:
            logger.warning(
                f"[SceneGen] LLM build fail for {shot.shot_id} "
                f"({type(e).__name__}: {e}) → deterministic fallback"
            )
            prompt = _deterministic_build_prompt(bible, shot, model_key)
    else:
        prompt = _deterministic_build_prompt(bible, shot, model_key)

    # ---- Clamp prompt length per model ---------------------------------------
    hint = MODEL_FORMAT_HINTS.get(model_key, "single_descriptive")
    cap = _PROMPT_MAX_LEN.get(hint, 600)
    if len(prompt) > cap:
        prompt = prompt[:cap - 1].rstrip() + "…"

    # ---- Merge LLM model_params (only known/safe keys) ----------------------
    movement_amplitude = "auto"
    if isinstance(llm_model_params.get("movement_amplitude"), str):
        movement_amplitude = llm_model_params["movement_amplitude"]
    if isinstance(llm_model_params.get("generate_audio"), bool):
        generate_audio = llm_model_params["generate_audio"]

    return SceneRenderJob(
        shot_id=shot.shot_id,
        prompt=prompt,
        negative_prompt=(llm_negative or negative),
        reference_image_urls=ref_urls if render_mode != "i2v_chain" else [],
        render_mode=render_mode,
        chain_input_url=last_frame_url if render_mode == "i2v_chain" else None,
        duration_s=shot.duration_s,
        resolution=resolution,
        aspect_ratio=bible.aspect_ratio,
        generate_audio=generate_audio,
        movement_amplitude=movement_amplitude,
        return_last_frame=not is_last_shot,
        model_key=model_key,
    )


# ============================================================
# LLM build — with one retry on parse failure
# ============================================================
def _llm_build(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
    ref_urls: list[str],
    last_frame_url: Optional[str],
    *,
    max_attempts: int = 2,
) -> _SceneLLMOutput:
    """Run the Layer 2 LLM call. Retry once on JSON or schema validation error.

    The system prompt is `system_prompts/scene.md` which dictates the strict
    JSON contract. We never tolerate fences or prose.
    """
    system = load_system_prompt("scene")
    payload = {
        "bible": bible.model_dump(),
        "shot": shot.model_dump(),
        "model_key": model_key,
        "model_format_hint": MODEL_FORMAT_HINTS.get(model_key, "single_descriptive"),
        "last_frame_url": last_frame_url,
        "reference_images": ref_urls,
    }
    user_msg = json.dumps(payload, ensure_ascii=False)

    last_err: Optional[Exception] = None
    for attempt in range(1, max_attempts + 1):
        try:
            raw = llm.complete(
                system_prompt=system,
                user_message=user_msg,
                task="generator",
                max_tokens=1500,
                temperature=0.55 if attempt == 1 else 0.35,  # tighten on retry
            )
            data = _safe_parse_json(raw)
            out = _SceneLLMOutput(**data)
            if not out.prompt.strip():
                raise ValueError("empty prompt")
            return out
        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            last_err = e
            logger.warning(
                f"[SceneGen] LLM parse fail attempt {attempt}/{max_attempts} "
                f"for {shot.shot_id}: {type(e).__name__}: {str(e)[:120]}"
            )
            continue
    assert last_err is not None
    raise last_err


# ============================================================
# Deterministic build — pure function, no LLM
# ============================================================
def _deterministic_build_prompt(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
) -> str:
    """Pure-function fallback. Model-aware formatting via `MODEL_FORMAT_HINTS`.

    - `multi_shot_inline` (Seedance 2.0):    `[Shot N — Xs] subject. action. style.`
    - `time_coded`        (Seedance 1.5 Pro): `[0-Xs] subject. action.`
    - `i2v_motion`        (Wan / *_i2v):      motion-only phrasing.
    - `single_descriptive`(Vidu):             1 long descriptive sentence.
    """
    hint = MODEL_FORMAT_HINTS.get(model_key, "single_descriptive")

    base = (
        f"{shot.visual.subject}. {shot.visual.action}. "
        f"{shot.visual.camera_shot} {shot.visual.camera_movement}. "
        f"{shot.visual.composition}. {shot.visual.background}."
    )
    base = continuity_manager.inject_bible_context_into_prompt(bible, shot, base)

    lighting = (shot.visual.lighting_override or bible.visual_style.lighting_design or "").strip()
    if lighting:
        base += f" Lighting: {lighting}."

    if shot.audio.dialogue_vn:
        base += f' Character speaks: "{shot.audio.dialogue_vn}".'

    if hint == "multi_shot_inline":
        return f"[Shot {shot.index + 1} — {shot.duration_s}s] {base}"
    if hint == "time_coded":
        return f"[{shot.start_s:.0f}-{shot.end_s:.0f}s] {base}"
    if hint == "i2v_motion":
        return (
            f"Motion: {shot.visual.action}. {shot.visual.camera_movement}. "
            f"{shot.continuity.style_anchor or bible.visual_style.camera_language}."
        ).strip()
    return base


# ============================================================
# Batch — all shots in a plan
# ============================================================
def generate_all_scenes(
    bible: ContinuityBible,
    shots: list[Shot],
    reference_images: list[str],
    model_key_per_shot: dict[str, str],
    last_frame_urls: Optional[dict[str, str]] = None,
    *,
    resolution: str = "720p",
    llm_mode: bool = True,
) -> list[SceneRenderJob]:
    """Build a `SceneRenderJob` for every shot in `shots`.

    NOTE on Reference Chaining:
        At plan-build time the caller usually does NOT know the previous shot's
        `last_frame_url` (it only exists after the previous render call). So
        `last_frame_urls` will typically be empty during planning. The render
        loop in `workers/video_worker.py` therefore re-invokes
        `generate_scene()` per shot as it walks the chain — supplying the live
        `last_frame_url` at that moment.

        This batch entry is still useful for:
          • cost/length preview before render
          • offline export of all per-shot prompts (eg. for human review)
          • running with `llm_mode=False` to get deterministic baselines.

    Args:
        bible:                Continuity Bible.
        shots:                Shot list (post-validate).
        reference_images:     Full ordered ref pool.
        model_key_per_shot:   Map `shot_id → AtlasCloud model_key`.
        last_frame_urls:      Optional map `shot_id → URL`. Empty if not chained yet.
        resolution:           Render resolution.
        llm_mode:             True = LLM per shot. False = deterministic.
    """
    last_frame_urls = last_frame_urls or {}
    jobs: list[SceneRenderJob] = []
    n = len(shots)
    for i, s in enumerate(shots):
        model_key = model_key_per_shot.get(s.shot_id, "seedance_2_0_ref")
        lfu = last_frame_urls.get(s.shot_id)
        jobs.append(generate_scene(
            bible=bible,
            shot=s,
            model_key=model_key,
            reference_images=reference_images,
            last_frame_url=lfu,
            llm_mode=llm_mode,
            resolution=resolution,
            is_last_shot=(i == n - 1),
        ))
    return jobs


__all__ = [
    "SceneRenderJob",
    "RenderMode",
    "MODEL_FORMAT_HINTS",
    "generate_scene",
    "generate_all_scenes",
]
