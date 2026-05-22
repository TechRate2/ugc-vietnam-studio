"""Storyboard Keyframer — Phase 2.5: gen 1 ảnh tĩnh cho mỗi shot trong proposal.

Pattern: Higgsfield Soul.0 / Topview / Nano Banana Pro 2 — user duyệt ẢNH trước,
video gen từ keyframe i2v (thay vì text-only). Lift quality 30-50% + character
consistency 100% qua MULTI-TURN ANCHOR (re-inject ảnh user mỗi keyframe gen).

Pipeline:
    1. Read character_sheet.face_lock_url (từ VisualPlanner anchor)
    2. Nếu có anchor → switch sang model EDIT (seedream_v45_edit) với images=[anchor]
       → mỗi shot gen mới CARRY identity từ anchor (Soul.0 pattern)
    3. Nếu không → fallback model T2I (seedream_v45 text-only) — identity drift risk
    4. Build prompt từ MCSLA shot + character_sheet text desc
    5. Parallel gen N shots qua asyncio.gather (concurrency 4)

Cost typical: 7 shots × $0.036 = $0.25 / storyboard
Time typical: 8-15s parallel (vs sequential 60s+)
"""

import asyncio
import time
from typing import Any, Optional

from loguru import logger

from agent.image_specs import build_image_payload, estimate_image_cost, get_image_spec


# Default models — auto-switch dựa face_lock_url:
KEYFRAME_MODEL_T2I = "seedream_v45"        # text-only (no anchor)
KEYFRAME_MODEL_ANCHOR = "seedream_v45_edit"  # anchor mode (face ref)

# Concurrency limit để tránh rate-limit AtlasCloud
MAX_PARALLEL_GEN = 4


def _parse_age_safely(value) -> Optional[int]:
    """Parse age_apparent tolerant với range string ('25-30'), float, int, None.

    Fix bug #12: int(age) crash khi LLM trả range string.
    """
    if value is None:
        return None
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    if isinstance(value, str):
        s = value.strip()
        if "-" in s:
            try:
                lo, hi = s.split("-", 1)
                return (int(lo.strip()) + int(hi.strip())) // 2
            except ValueError:
                pass
        digits = "".join(c for c in s if c.isdigit())
        if digits:
            try:
                return int(digits[:3])
            except ValueError:
                return None
    return None


def build_keyframe_prompt(
    shot: dict,
    character_sheet: dict,
    aspect_ratio: str = "9:16",
) -> str:
    """Convert MCSLA shot + character_sheet → image gen prompt.

    Pattern: structured prompt với 6 lớp (subject, look, action, lighting, framing, aspect).
    Inject character_sheet details khi shot có @main_character reference.
    """
    # Resolve @main_character → inject face/outfit/age details
    subject = shot.get("S_subject", "")
    if "@main_character" in subject and character_sheet:
        char_descr = _format_character_descr(character_sheet)
        subject = subject.replace("@main_character", char_descr)

    framing = shot.get("C_camera", "")
    lighting = shot.get("L_lighting", "")
    action = shot.get("A_action", "")
    purpose = shot.get("purpose", "shot")

    # Compose final prompt — Higgsfield-style 6-layer prompt
    parts = [
        # Subject + action (combined cho image)
        f"{subject}. {action}." if action else subject,
        # Lighting block
        f"Lighting: {lighting}." if lighting else "",
        # Framing/Camera
        f"Camera: {framing}." if framing else "",
        # Style anchor — UGC native, KHÔNG cinematic AI-slop
        "Style: UGC authentic Vietnamese lifestyle, natural skin texture, "
        "candid moment, NOT polished studio, NOT plastic perfect.",
        # Quality anchor
        "High detail, sharp focus on subject, natural color grading.",
    ]
    prompt = " ".join(p for p in parts if p)

    logger.debug(f"[Keyframer] {shot.get('shot_id')} prompt={prompt[:200]}")
    return prompt


def _format_character_descr(cs: dict) -> str:
    """Format character_sheet → 1 câu descr inject vào prompt.

    Tolerant với age_apparent dạng range string (LLM hay output "25-30").
    """
    age = _parse_age_safely(cs.get("age_apparent"))
    gender_code = cs.get("gender")
    gender = "woman" if gender_code == "F" else "man" if gender_code == "M" else "person"
    face = cs.get("face", "")
    outfit_top = cs.get("outfit_top", "")
    outfit_bottom = cs.get("outfit_bottom", "")

    age_desc = f"a {age}-year-old Vietnamese {gender}" if age else f"a Vietnamese {gender}"
    parts = [age_desc]
    if face:
        parts.append(face)
    if outfit_top or outfit_bottom:
        outfit = " ".join(filter(None, [outfit_top, outfit_bottom]))
        parts.append(f"wearing {outfit}")
    return ", ".join(parts)


async def gen_keyframes(
    shots: list[dict],
    character_sheet: dict,
    aspect_ratio: str = "9:16",
    model_key: Optional[str] = None,
) -> dict:
    """Parallel gen N keyframes — 1 ảnh cho mỗi shot.

    Auto-switch model:
        - character_sheet.face_lock_url tồn tại → seedream_v45_edit + images=[anchor]
          (Higgsfield Soul.0 pattern — identity preserved across shots)
        - face_lock_url null → seedream_v45 (text-only fallback)

    Returns:
        dict {
            "keyframes": [...],
            "total_cost_usd": float,
            "elapsed_s": float,
            "model_key": str,
            "anchor_used": bool,
            "success_count": int,
            "fail_count": int,
        }
    """
    if not shots:
        return {
            "keyframes": [],
            "total_cost_usd": 0,
            "elapsed_s": 0,
            "model_key": model_key or KEYFRAME_MODEL_T2I,
            "anchor_used": False,
            "success_count": 0,
            "fail_count": 0,
        }

    # Auto-detect strategy: anchor mode hay text-only
    face_lock_url = (character_sheet or {}).get("face_lock_url")
    if model_key is None:
        if face_lock_url:
            model_key = KEYFRAME_MODEL_ANCHOR
            anchor_images = [face_lock_url]
        else:
            model_key = KEYFRAME_MODEL_T2I
            anchor_images = None
    else:
        # User override model_key — vẫn pass anchor nếu có (model có thể là edit variant)
        anchor_images = [face_lock_url] if face_lock_url else None

    logger.info(
        f"[Keyframer] gen {len(shots)} keyframes — model={model_key}, "
        f"aspect={aspect_ratio}, anchor={'YES' if anchor_images else 'NO'}, "
        f"parallel={MAX_PARALLEL_GEN}"
    )
    t_start = time.time()

    sem = asyncio.Semaphore(MAX_PARALLEL_GEN)

    async def _gen_one(shot: dict) -> dict:
        async with sem:
            prompt = build_keyframe_prompt(shot, character_sheet, aspect_ratio)
            shot_id = shot.get("shot_id", "?")
            try:
                image_url = await asyncio.to_thread(
                    _submit_and_poll_image,
                    model_key, prompt, aspect_ratio,
                    anchor_images,
                )
                return {
                    "shot_id": shot_id,
                    "image_url": image_url,
                    "prompt": prompt,
                    "status": "completed",
                    "anchor_used": bool(anchor_images),
                    "purpose": shot.get("purpose"),
                    "duration_s": shot.get("duration_s"),
                    "dialogue_vn": shot.get("dialogue_vn"),
                    "caption_on_screen": shot.get("caption_on_screen"),
                }
            except Exception as e:
                logger.exception(f"[Keyframer] {shot_id} gen fail: {e}")
                return {
                    "shot_id": shot_id,
                    "image_url": None,
                    "prompt": prompt,
                    "status": "failed",
                    "error": str(e)[:200],
                    "purpose": shot.get("purpose"),
                    "duration_s": shot.get("duration_s"),
                }

    results = await asyncio.gather(*[_gen_one(s) for s in shots])
    elapsed = round(time.time() - t_start, 1)

    success = sum(1 for r in results if r["status"] == "completed")
    fail = len(results) - success
    total_cost = estimate_image_cost(model_key, n=success)

    logger.info(
        f"[Keyframer] done in {elapsed}s: {success}/{len(shots)} success, "
        f"cost ~${total_cost:.3f}, anchor_used={bool(anchor_images)}"
    )

    return {
        "keyframes": results,
        "total_cost_usd": round(total_cost, 4),
        "elapsed_s": elapsed,
        "model_key": model_key,
        "anchor_used": bool(anchor_images),
        "success_count": success,
        "fail_count": fail,
    }


def _submit_and_poll_image(
    model_key: str,
    prompt: str,
    aspect_ratio: str,
    anchor_images: Optional[list[str]] = None,
) -> str:
    """Sync helper: submit AtlasCloud image gen + poll until completed → URL.

    Re-use logic giống image_direct.py routes.

    Khi anchor_images không None → pass vào payload `images` (edit variant).
    Phù hợp cho model EDIT (seedream_v45_edit, nano_banana_2_edit, wan_2_7_edit).
    """
    from vendors.atlascloud import atlas_client, _unwrap
    if atlas_client is None:
        raise RuntimeError("ATLASCLOUD_API_KEY chưa set")

    spec = get_image_spec(model_key)
    submit_path = spec.get("submit_path", "/model/generateImage")
    poll_path = spec.get("poll_path", "/model/prediction")

    # Build payload — auto branch: edit variant cần size, t2i variant cần aspect
    # Seedream dùng `size` thay vì aspect_ratio
    use_size = bool(spec.get("size"))
    use_aspect = bool(spec.get("aspect_ratio"))
    size_arg = _aspect_to_seedream_size(aspect_ratio) if use_size else None
    aspect_arg = aspect_ratio if use_aspect else None

    payload = build_image_payload(
        model_key=model_key,
        prompt=prompt,
        images=anchor_images,
        size=size_arg,
        aspect_ratio=aspect_arg,
    )

    # Submit
    response = atlas_client.client.post(
        f"{atlas_client.base_url}{submit_path}",
        json=payload,
    )
    response.raise_for_status()
    body = _unwrap(response.json())
    prediction_id = body.get("id") or body.get("prediction_id") or body.get("request_id")
    if not prediction_id:
        raise RuntimeError(f"No prediction_id from submit. Body: {body}")

    # Poll up to 60s
    poll_url = f"{atlas_client.base_url}{poll_path}/{prediction_id}"
    deadline = time.time() + 60
    while time.time() < deadline:
        time.sleep(2)
        r = atlas_client.client.get(poll_url)
        r.raise_for_status()
        data = _unwrap(r.json())
        status = data.get("status", "pending")
        if status in ("completed", "succeeded"):
            outputs = data.get("outputs") or []
            if outputs:
                return outputs[0]
            url = data.get("output_url") or data.get("image_url")
            if url:
                return url
            raise RuntimeError(f"Completed but no output URL. Data: {data}")
        if status == "failed":
            raise RuntimeError(f"Prediction failed: {data.get('error')}")

    raise TimeoutError(f"Keyframe gen timeout 60s — prediction {prediction_id}")


def _aspect_to_seedream_size(aspect_ratio: str) -> str:
    """Map aspect_ratio (9:16/16:9/1:1) → Seedream `size` preset.

    Seedream KHÔNG nhận aspect_ratio, chỉ nhận `size` WxH explicit.
    Pick preset gần nhất với UGC standard (default 2048x2048 / 1728x2304 cho 9:16).
    """
    mapping = {
        "9:16": "1728*2304",   # portrait Tiktok/Reel native
        "16:9": "2304*1728",   # landscape YouTube
        "1:1": "2048*2048",    # square Instagram feed
        "3:4": "1728*2304",    # close to 9:16
        "4:3": "2304*1728",    # close to 16:9
    }
    return mapping.get(aspect_ratio, "2048*2048")


async def regen_one_keyframe(
    shot: dict,
    character_sheet: dict,
    aspect_ratio: str = "9:16",
    model_key: Optional[str] = None,
    prompt_override: Optional[str] = None,
) -> dict:
    """Regen 1 keyframe (user reject ảnh nào → gen lại ảnh đó).

    Có thể nhận `prompt_override` để user tweak prompt thủ công.
    Auto-pickup face_lock_url giống gen_keyframes (Soul.0 anchor pattern).
    """
    prompt = prompt_override or build_keyframe_prompt(shot, character_sheet, aspect_ratio)
    shot_id = shot.get("shot_id", "?")

    face_lock_url = (character_sheet or {}).get("face_lock_url")
    if model_key is None:
        model_key = KEYFRAME_MODEL_ANCHOR if face_lock_url else KEYFRAME_MODEL_T2I
    anchor_images = [face_lock_url] if face_lock_url else None

    logger.info(
        f"[Keyframer] regen {shot_id} — model={model_key}, "
        f"anchor={'YES' if anchor_images else 'NO'}, prompt={prompt[:80]}"
    )

    try:
        image_url = await asyncio.to_thread(
            _submit_and_poll_image, model_key, prompt, aspect_ratio, anchor_images
        )
        return {
            "shot_id": shot_id,
            "image_url": image_url,
            "prompt": prompt,
            "status": "completed",
            "anchor_used": bool(anchor_images),
            "purpose": shot.get("purpose"),
            "duration_s": shot.get("duration_s"),
            "dialogue_vn": shot.get("dialogue_vn"),
            "caption_on_screen": shot.get("caption_on_screen"),
        }
    except Exception as e:
        logger.exception(f"[Keyframer] regen {shot_id} fail: {e}")
        return {
            "shot_id": shot_id,
            "image_url": None,
            "prompt": prompt,
            "status": "failed",
            "error": str(e)[:200],
        }
