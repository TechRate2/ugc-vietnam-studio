"""Persona 6: Editor — chia variant đã pick thành ShotList chi tiết.

Output sẵn sàng pass cho:
    - Image gen (Nano Banana Pro) → storyboard frames
    - Video gen (Seedance/Vidu/Wan/Veo) → animate

Model: deepseek-v4-flash (task=analyzer, $0.14/$0.28) — đủ smart, cost-efficient.

Note: Editor chỉ chạy SAU khi user pick variant (Phase 3 start) — KHÔNG chạy trong
Phase 2 (Proposal). Vì:
    - Phase 2 chỉ show preview storyboard (text only) từ Director's scene_direction
    - Phase 3 mới gen image+video, lúc đó cần ShotList chi tiết

Hiện tại em vẫn ship file này để chunk 3 wire vào pipeline render.
"""

import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm
from core.llm_redact import safe_dumps

_PROMPT_PATH = Path(__file__).parent / "prompts" / "editor_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


def cut_shots(
    cinematic_brief: dict,
    selected_variant: dict,
    selected_avatar: dict,
    tech_config: dict,
    references: Optional[list[str]] = None,
) -> dict:
    """Editor chia variant thành ShotList.

    Args:
        cinematic_brief: từ Director.
        selected_variant: 1 variant đã pick từ Copywriter Ranker.
        selected_avatar: avatar user đã pick từ Casting.
        tech_config: {duration_s, aspect_ratio, audio_mode, model}.
        references: optional list reference image URLs.

    Returns:
        dict {shots: [...], summary: {...}, rendering_hints: {...}}.
    """
    user_msg = safe_dumps({
        "cinematic_brief": cinematic_brief,
        "selected_variant": selected_variant,
        "selected_avatar": {
            "id": selected_avatar.get("id"),
            "name_vn": selected_avatar.get("name_vn"),
            "gender": selected_avatar.get("gender"),
            "features": selected_avatar.get("features"),
            "skin_tone": selected_avatar.get("skin_tone"),
            "voice_label": selected_avatar.get("voice_label"),
        },
        "tech_config": tech_config,
        "references_count": len(references or []),
    })

    logger.info(
        f"[Editor] cutting shots: variant={selected_variant.get('variant_id')}, "
        f"avatar={selected_avatar.get('id')}, duration={tech_config.get('duration_s')}s"
    )

    response_text = llm.complete(
        system_prompt=SYSTEM_PROMPT,
        user_message=user_msg,
        task="analyzer",
        max_tokens=4000,
        temperature=0.5,  # balanced — creative shots but consistent
    )

    shotlist = _parse_shotlist(response_text)

    logger.info(
        f"[Editor] done: shots={shotlist.get('summary', {}).get('total_shots')}, "
        f"total_duration={shotlist.get('summary', {}).get('total_duration_s')}s"
    )

    return shotlist


def storyboard_preview(cinematic_brief: dict) -> list[dict]:
    """Phase 2 helper — lấy preview storyboard từ Director's shots[] hoặc scene_direction[].

    KHÔNG gọi LLM (cheap), chỉ format lại data Director đã có cho UI hiển thị.

    Tolerant với 2 schema variants:
        - NEW (MCSLA structured): shots[] với C_camera, S_subject, L_lighting, A_action
        - OLD (free-form): scene_direction[] với framing, action, emotion
    """
    # Prefer new structured shots[] over legacy scene_direction[]
    shots = cinematic_brief.get("shots") or cinematic_brief.get("scene_direction") or []
    preview = []
    for idx, scene in enumerate(shots):
        if not isinstance(scene, dict):
            continue
        # Normalize cả 2 schema thành UI-friendly format
        framing = scene.get("C_camera") or scene.get("framing") or ""
        action = (
            scene.get("A_action")
            or scene.get("action")
            or scene.get("action_vn")
            or ""
        )
        # Compose 1 dòng human-readable: subject + action
        subject = scene.get("S_subject", "")
        action_vn = f"{subject} — {action}" if subject and action else (action or subject)

        preview.append({
            "shot_id": scene.get("shot_id") or scene.get("id") or f"S{idx + 1}",
            "purpose": scene.get("purpose") or "shot",
            "duration_s": scene.get("duration_s") or 0,
            "framing": framing,
            "action_vn": action_vn,
            "lighting": scene.get("L_lighting") or scene.get("lighting") or "",
            "dialogue_vn": scene.get("dialogue_vn") or "",
            "caption_on_screen": scene.get("caption_on_screen") or "",
            "model_hint": scene.get("M_model_hint") or "",
            # legacy field cho frontend cũ vẫn xài
            "emotion": scene.get("emotion") or "",
        })
    return preview


def _parse_shotlist(response_text: str) -> dict:
    try:
        return json.loads(response_text.strip())
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", response_text)
    if not match:
        raise ValueError(
            f"[Editor] LLM không trả JSON valid. Head: {response_text[:300]}"
        )
    try:
        return json.loads(match.group())
    except json.JSONDecodeError as e:
        raise ValueError(f"[Editor] JSON parse fail: {e}") from e
