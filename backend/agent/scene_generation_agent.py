"""Scene Generation Agent — Layer 2.

Đầu vào: ContinuityBible + 1 Shot + model_key + last_frame_url (optional)
Đầu ra: SceneRenderJob (prompt + negative + ref_indices + render_mode)

2 modes:
    - **llm_mode**: 1 LLM call → JSON từ scene system prompt (default — flexible nhất).
    - **deterministic_mode**: pure-function build từ Bible + Shot (fallback khi không có LLM
      hoặc khi muốn deterministic). Dùng `continuity_manager.inject_bible_context_into_prompt`.

Caller (render pipeline) gọi function này N lần (1/shot) → list SceneRenderJob → dispatch
vào AtlasCloud video gen với Reference Chaining (i2v khi previous_shot_id set).
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Optional, Literal

from loguru import logger

from agent.schemas import ContinuityBible, Shot
from agent import continuity_manager
from system_prompts import load as load_system_prompt
from vendors.llm_router import llm


RenderMode = Literal["ref_to_video", "i2v_chain", "t2v"]


@dataclass
class SceneRenderJob:
    """Output cho 1 shot — feed thẳng vào atlascloud.generate_video()."""
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
        """Convert sang kwargs cho atlas_client.generate_video()."""
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


_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.MULTILINE)


def _parse(raw: str) -> dict:
    cleaned = _FENCE_RE.sub("", raw).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        s, e = cleaned.find("{"), cleaned.rfind("}")
        if s >= 0 and e > s:
            return json.loads(cleaned[s:e + 1])
        raise


# Map model_key → format hint (Scene Gen Agent reads this)
MODEL_FORMAT_HINTS = {
    "seedance_2_0_ref": "multi_shot_inline",
    "seedance_2_0_fast_ref": "multi_shot_inline",
    "seedance_2_0_i2v": "i2v_motion",
    "seedance_2_0_fast_i2v": "i2v_motion",
    "seedance_v15_pro_i2v": "time_coded",
    "vidu_q3_ref": "single_descriptive",
    "vidu_q3_mix_ref": "single_descriptive",
    "wan_2_7_i2v": "i2v_motion",
}


def generate_scene(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
    reference_images: list[str],
    last_frame_url: Optional[str] = None,
    *,
    llm_mode: bool = True,
) -> SceneRenderJob:
    """Build SceneRenderJob cho 1 shot.

    Args:
        bible: Continuity Bible (global state)
        shot: Shot data
        model_key: AtlasCloud model key (vd: seedance_2_0_ref)
        reference_images: full original list (indexed by Bible.reference_assets.index)
        last_frame_url: nếu shot.continuity.previous_shot_id set + caller có URL last frame
        llm_mode: True = LLM call (flexible), False = deterministic build
    """
    duration_s = shot.duration_s
    aspect_ratio = bible.aspect_ratio
    resolution = "720p"  # caller override sau

    # Resolve refs từ shot + bible (universal binding)
    bound_refs = continuity_manager.references_for_shot(bible, shot)
    ref_urls = [
        reference_images[r.index]
        for r in bound_refs
        if 0 <= r.index < len(reference_images)
    ]

    # Decide render mode
    is_chain = shot.continuity.previous_shot_id is not None and last_frame_url
    render_mode: RenderMode = (
        "i2v_chain" if is_chain
        else ("ref_to_video" if ref_urls else "t2v")
    )

    # Audio
    audio_mode = bible.audio_design.dialogue_style or "silent"
    generate_audio = audio_mode not in ("silent", "")

    negative = continuity_manager.build_negative_prompt(bible)

    if llm_mode:
        try:
            prompt = _llm_build_prompt(
                bible=bible, shot=shot, model_key=model_key,
                ref_urls=ref_urls, last_frame_url=last_frame_url if is_chain else None,
            )
        except Exception as e:
            logger.warning(f"[SceneGen] LLM build fail for {shot.shot_id} → fallback deterministic: {e}")
            prompt = _deterministic_build_prompt(bible, shot, model_key)
    else:
        prompt = _deterministic_build_prompt(bible, shot, model_key)

    return SceneRenderJob(
        shot_id=shot.shot_id,
        prompt=prompt,
        negative_prompt=negative,
        reference_image_urls=ref_urls if render_mode != "i2v_chain" else [],
        render_mode=render_mode,
        chain_input_url=last_frame_url if is_chain else None,
        duration_s=duration_s,
        resolution=resolution,
        aspect_ratio=aspect_ratio,
        generate_audio=generate_audio,
        movement_amplitude="auto",
        return_last_frame=True,
        model_key=model_key,
    )


def _llm_build_prompt(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
    ref_urls: list[str],
    last_frame_url: Optional[str],
) -> str:
    system = load_system_prompt("scene")
    payload = {
        "bible": bible.model_dump(),
        "shot": shot.model_dump(),
        "model_key": model_key,
        "model_format_hint": MODEL_FORMAT_HINTS.get(model_key, "single_descriptive"),
        "last_frame_url": last_frame_url,
        "reference_images": ref_urls,
    }
    raw = llm.complete(
        system_prompt=system,
        user_message=json.dumps(payload, ensure_ascii=False),
        task="generator",
        max_tokens=1500,
        temperature=0.55,
    )
    data = _parse(raw)
    prompt = (data.get("prompt") or "").strip()
    if not prompt:
        raise ValueError("LLM returned empty prompt")
    return prompt


def _deterministic_build_prompt(
    bible: ContinuityBible,
    shot: Shot,
    model_key: str,
) -> str:
    """Pure-function fallback — no LLM.

    Format adaptive theo model:
        - multi_shot_inline (seedance 2.0): [Shot N — Xs] character anchor. action. style.
        - time_coded (seedance 1.5 pro):   [0-Xs] action ...
        - i2v_motion (wan/i2v variants):   focus on motion verbs.
        - single_descriptive (vidu):       1 long descriptive sentence.
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
        # Emphasize motion only — chain frame already has identity/style
        return (
            f"Motion: {shot.visual.action}. {shot.visual.camera_movement}. "
            f"{shot.continuity.style_anchor or bible.visual_style.camera_language}."
        )
    return base


# ============================================================
# Batch — build N SceneRenderJobs for the whole shot_list
# ============================================================
def generate_all_scenes(
    bible: ContinuityBible,
    shots: list[Shot],
    reference_images: list[str],
    model_key_per_shot: dict[str, str],
    last_frame_urls: Optional[dict[str, str]] = None,
    llm_mode: bool = True,
) -> list[SceneRenderJob]:
    """Build all SceneRenderJobs.

    Args:
        model_key_per_shot: map shot_id → AtlasCloud model_key.
        last_frame_urls:    map shot_id → URL of previous shot's last frame
                             (caller maintains this dict while rendering serially).
    """
    last_frame_urls = last_frame_urls or {}
    jobs: list[SceneRenderJob] = []
    for s in shots:
        mk = model_key_per_shot.get(s.shot_id, "seedance_2_0_ref")
        lfu = last_frame_urls.get(s.shot_id)
        jobs.append(generate_scene(
            bible=bible, shot=s, model_key=mk,
            reference_images=reference_images, last_frame_url=lfu,
            llm_mode=llm_mode,
        ))
    return jobs
