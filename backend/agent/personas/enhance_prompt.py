"""Persona 9 (Utility): Enhance Prompt — polish 1 scene prompt ngắn → MCSLA detail.

Pattern: TopView V2 "Enhance All" button — user paste prompt ngắn ("girl reviewing
blush"), agent expand thành prompt dài đủ Camera/Subject/Lighting/Action detail
cho i2v model gen tốt.

Model: deepseek-v4-flash (task=analyzer, $0.14/$0.28) — task ngắn, fast + cheap.
Cost: ~$0.001/call.
"""

import json
import re
from pathlib import Path
from typing import Optional

from loguru import logger

from vendors.llm_router import llm

_PROMPT_PATH = Path(__file__).parent / "prompts" / "enhance_prompt_system.md"
SYSTEM_PROMPT = _PROMPT_PATH.read_text(encoding="utf-8")


def enhance(
    raw_prompt: str,
    aspect_ratio: str = "9:16",
    duration_s: int = 5,
    character_anchor: Optional[dict] = None,
    image_refs: Optional[list[int]] = None,
    purpose: Optional[str] = None,
) -> dict:
    """Polish 1 prompt → MCSLA detailed prompt.

    Args:
        raw_prompt: prompt ngắn từ user (10-200 chars).
        aspect_ratio: 9:16 / 16:9 / 1:1.
        duration_s: scene duration để LLM căn pacing.
        character_anchor: optional, từ VisualPlanner — inject face descriptor.
        image_refs: optional, list 1-based indices vào reference_images[].
        purpose: optional, hook / problem / solution / proof / cta.

    Returns:
        dict {
            "enhanced_prompt": str (full MCSLA prompt with [Image N] preserved),
            "summary": str (1 dòng tóm tắt change),
            "warnings": list[str]
        }
    """
    if not raw_prompt or len(raw_prompt.strip()) < 3:
        return {
            "enhanced_prompt": raw_prompt or "",
            "summary": "Prompt rỗng, không enhance được",
            "warnings": ["Empty input"],
        }

    user_msg = _build_user_message(
        raw_prompt, aspect_ratio, duration_s, character_anchor, image_refs, purpose
    )

    logger.info(
        f"[EnhancePrompt] raw_len={len(raw_prompt)}, purpose={purpose}, "
        f"duration={duration_s}s, has_anchor={bool(character_anchor)}"
    )

    try:
        response_text = llm.complete(
            system_prompt=SYSTEM_PROMPT,
            user_message=user_msg,
            task="analyzer",  # → deepseek-v4-flash
            max_tokens=1500,
            temperature=0.6,  # creative enough for prompt expansion
        )
    except Exception as e:
        logger.warning(f"[EnhancePrompt] LLM fail: {e}")
        return {
            "enhanced_prompt": raw_prompt,  # fallback: trả nguyên
            "summary": f"LLM fail, giữ nguyên prompt: {str(e)[:120]}",
            "warnings": [f"llm_error: {str(e)[:120]}"],
        }

    try:
        result = _parse_response(response_text)
    except ValueError as e:
        logger.warning(f"[EnhancePrompt] parse fail: {e}")
        return {
            "enhanced_prompt": raw_prompt,
            "summary": f"Parse fail: {str(e)[:120]}",
            "warnings": [f"parse_error: {str(e)[:120]}"],
        }

    # Defensive: nếu LLM strip [Image N] tokens → restore từ image_refs
    enhanced = result.get("enhanced_prompt") or raw_prompt
    if image_refs:
        for idx in image_refs:
            token = f"[Image {idx}]"
            if token not in enhanced:
                # Append token cuối nếu LLM xóa — KHÔNG để mất mention
                enhanced = enhanced.rstrip(".") + f" {token}."

    return {
        "enhanced_prompt": enhanced,
        "summary": result.get("summary", ""),
        "warnings": result.get("warnings", []),
    }


def _build_user_message(
    raw: str,
    aspect: str,
    duration: int,
    anchor: Optional[dict],
    image_refs: Optional[list[int]],
    purpose: Optional[str],
) -> str:
    parts = [
        "[RAW PROMPT — user nhập ngắn]",
        raw,
        "",
        "[CONTEXT]",
        f"aspect_ratio: {aspect}",
        f"duration_s: {duration}",
    ]
    if purpose:
        parts.append(f"scene_purpose: {purpose}")
    if image_refs:
        parts.append(f"image_refs: {image_refs} (GIỮ NGUYÊN [Image N] tokens trong output)")
    parts.append("")

    if anchor and anchor.get("face_descriptor"):
        parts += [
            "[CHARACTER ANCHOR — Inject vào prompt nếu prompt nhắc tới character]",
            json.dumps(
                {
                    "face_descriptor": anchor.get("face_descriptor"),
                    "outfit_top": anchor.get("outfit_top"),
                    "outfit_bottom": anchor.get("outfit_bottom"),
                    "age_apparent": anchor.get("age_apparent"),
                    "gender": anchor.get("gender"),
                },
                ensure_ascii=False, indent=2,
            ),
            "",
        ]

    parts += [
        "[YOUR TASK]",
        "Expand raw prompt thành MCSLA prompt detail (Camera + Subject + Lighting + Action).",
        "BẮT BUỘC giữ nguyên mọi [Image N] tokens trong output. Output JSON như schema.",
    ]
    return "\n".join(parts)


def _parse_response(response_text: str) -> dict:
    """Tolerant JSON parse — markdown wrapper + plain text fallback."""
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```\s*$", "", cleaned)

    try:
        return json.loads(cleaned, strict=False)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        try:
            return json.loads(match.group(), strict=False)
        except json.JSONDecodeError:
            pass

    # Last resort: treat full response as enhanced_prompt (no JSON wrapper)
    return {
        "enhanced_prompt": cleaned[:2000],
        "summary": "LLM trả plain text — em wrap nguyên làm enhanced_prompt",
        "warnings": ["non_json_response"],
    }
