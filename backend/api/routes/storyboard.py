"""Storyboard Keyframe gen routes — Phase 2.5.

POST /api/v1/jobs/storyboard/gen        — gen all keyframes từ proposal (shots + char_sheet)
POST /api/v1/jobs/storyboard/regen      — regen 1 keyframe (shot_id)

User flow:
    1. Phase 2 /propose → user pick variant
    2. /storyboard/gen — gen N ảnh keyframe ($0.25 typical)
    3. User xem grid 7 ảnh → reject ảnh nào → /storyboard/regen ảnh đó
    4. User OK all → Phase 3 /jobs/ugc render i2v dùng keyframes làm reference
"""

from typing import Optional
from fastapi import APIRouter, HTTPException
from loguru import logger
from pydantic import BaseModel, Field

from agent.storyboard_keyframer import (
    gen_keyframes,
    regen_one_keyframe,
    KEYFRAME_MODEL_T2I as KEYFRAME_MODEL,  # backward-compat alias — gen_keyframes() auto-switches T2I/ANCHOR
)


router = APIRouter()


class StoryboardGenRequest(BaseModel):
    """Gen all keyframes cho 1 proposal."""
    proposal_id: Optional[str] = Field(None, description="Tracking (optional)")
    shots: list[dict] = Field(..., description="MCSLA shots[] từ proposal.shots")
    character_sheet: dict = Field(default_factory=dict, description="Character anchor")
    aspect_ratio: str = Field("9:16", description="Aspect ratio cho ảnh")
    model_key: str = Field(KEYFRAME_MODEL, description="Image model — default seedream_v45")


class RegenKeyframeRequest(BaseModel):
    """Regen 1 keyframe — user reject ảnh nào → gen lại."""
    shot: dict = Field(..., description="1 MCSLA shot object")
    character_sheet: dict = Field(default_factory=dict)
    aspect_ratio: str = Field("9:16")
    model_key: str = Field(KEYFRAME_MODEL)
    prompt_override: Optional[str] = Field(
        None, description="Tweak prompt thủ công nếu user muốn",
    )


@router.post("/gen")
async def gen_storyboard(request: StoryboardGenRequest):
    """Gen all keyframes parallel — typical 7 ảnh × $0.036 = $0.25, time ~10-15s."""
    if not request.shots:
        raise HTTPException(400, "shots[] empty — cần proposal.shots từ /propose")

    logger.info(
        f"[/storyboard/gen] proposal={request.proposal_id}, shots={len(request.shots)}, "
        f"model={request.model_key}, aspect={request.aspect_ratio}"
    )

    try:
        result = await gen_keyframes(
            shots=request.shots,
            character_sheet=request.character_sheet,
            aspect_ratio=request.aspect_ratio,
            model_key=request.model_key,
        )
    except Exception as e:
        logger.exception("[/storyboard/gen] gen_keyframes failed")
        raise HTTPException(502, detail=f"Keyframer error: {str(e)[:200]}") from e

    result["proposal_id"] = request.proposal_id
    return result


@router.post("/regen")
async def regen_keyframe(request: RegenKeyframeRequest):
    """Regen 1 keyframe — user reject → gen lại ảnh đó. Cost $0.036."""
    if not request.shot or not request.shot.get("shot_id"):
        raise HTTPException(400, "shot.shot_id required")

    try:
        result = await regen_one_keyframe(
            shot=request.shot,
            character_sheet=request.character_sheet,
            aspect_ratio=request.aspect_ratio,
            model_key=request.model_key,
            prompt_override=request.prompt_override,
        )
    except Exception as e:
        logger.exception("[/storyboard/regen] failed")
        raise HTTPException(502, detail=f"Regen error: {str(e)[:200]}") from e

    return result
