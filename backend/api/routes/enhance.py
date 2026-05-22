"""Enhance Prompt endpoint — Phase 2.5 utility.

POST /api/v1/enhance/single  — enhance 1 prompt
POST /api/v1/enhance/batch   — enhance N scenes parallel

Pattern: TopView V2 "Enhance" button + "Enhance All" trên Multi-Scene Editor.
"""

import asyncio
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException
from loguru import logger
from pydantic import BaseModel, Field

from agent.personas import enhance_prompt as enhance_persona


router = APIRouter()


# ============================================
# Cost estimate (re-compute Phase 2 cost với enhanced/keyframe count)
# ============================================

class CostEstimateRequest(BaseModel):
    """FIX #7: Frontend gọi sau khi user click Enhance / Gen Keyframes
    để cost estimate trên UI khớp actual bill.
    """
    has_video_ref: bool = False
    enhanced_scene_count: int = Field(0, ge=0, le=20)
    keyframe_count: int = Field(0, ge=0, le=20)


class CostEstimateResponse(BaseModel):
    phase2_cost_usd: float
    breakdown: dict = Field(default_factory=dict)


@router.post("/cost-estimate", response_model=CostEstimateResponse)
async def cost_estimate(request: CostEstimateRequest):
    """Re-compute Phase 2 cost với optional Enhance + Keyframe counts.

    Cost formula:
        base $0.030 + ($0.055 if video_ref) + ($0.001 × enhanced) + ($0.036 × keyframes)
    """
    from agent.proposal_builder import _estimate_phase2_cost_so_far

    total = _estimate_phase2_cost_so_far(
        has_video_ref=request.has_video_ref,
        enhanced_scene_count=request.enhanced_scene_count,
        keyframe_count=request.keyframe_count,
    )
    breakdown = {
        "base": 0.030,
        "video_ref_analyzer": 0.055 if request.has_video_ref else 0,
        "enhance_batch": round(0.001 * request.enhanced_scene_count, 4),
        "storyboard_keyframer": round(0.036 * request.keyframe_count, 4),
    }
    return CostEstimateResponse(phase2_cost_usd=total, breakdown=breakdown)


# ============================================
# Schemas
# ============================================

class CharacterAnchor(BaseModel):
    face_descriptor: Optional[str] = None
    outfit_top: Optional[str] = None
    outfit_bottom: Optional[str] = None
    age_apparent: Optional[int] = None
    gender: Optional[Literal["F", "M"]] = None


class EnhanceSingleRequest(BaseModel):
    raw_prompt: str = Field(..., min_length=3, max_length=2000)
    aspect_ratio: Literal["9:16", "16:9", "1:1"] = "9:16"
    duration_s: int = Field(5, ge=2, le=20)
    character_anchor: Optional[CharacterAnchor] = None
    image_refs: Optional[list[int]] = Field(
        default_factory=list,
        description="1-based indices vào reference_images[] (giữ [Image N] tokens)",
    )
    purpose: Optional[str] = Field(
        None, description="hook / problem / solution / proof / cta"
    )


class EnhanceSingleResponse(BaseModel):
    enhanced_prompt: str
    summary: str = ""
    warnings: list[str] = Field(default_factory=list)


class EnhanceBatchScene(BaseModel):
    scene_id: str
    raw_prompt: str
    duration_s: int = 5
    image_refs: list[int] = Field(default_factory=list)
    purpose: Optional[str] = None


class EnhanceBatchRequest(BaseModel):
    scenes: list[EnhanceBatchScene] = Field(..., min_length=1, max_length=12)
    aspect_ratio: Literal["9:16", "16:9", "1:1"] = "9:16"
    character_anchor: Optional[CharacterAnchor] = None


class EnhanceBatchSceneResult(BaseModel):
    scene_id: str
    enhanced_prompt: str
    summary: str = ""
    status: Literal["completed", "failed"] = "completed"
    error: Optional[str] = None


class EnhanceBatchResponse(BaseModel):
    results: list[EnhanceBatchSceneResult]
    success_count: int
    fail_count: int
    elapsed_s: float


# ============================================
# Endpoints
# ============================================

@router.post("/single", response_model=EnhanceSingleResponse)
async def enhance_single(request: EnhanceSingleRequest):
    """Enhance 1 scene prompt ngắn → MCSLA detail."""
    anchor_dict = request.character_anchor.model_dump() if request.character_anchor else None

    try:
        result = await asyncio.to_thread(
            enhance_persona.enhance,
            raw_prompt=request.raw_prompt,
            aspect_ratio=request.aspect_ratio,
            duration_s=request.duration_s,
            character_anchor=anchor_dict,
            image_refs=request.image_refs,
            purpose=request.purpose,
        )
    except Exception as e:
        logger.exception("[/enhance/single] persona fail")
        raise HTTPException(status_code=500, detail=f"Enhance error: {str(e)[:200]}") from e

    return result


@router.post("/batch", response_model=EnhanceBatchResponse)
async def enhance_batch(request: EnhanceBatchRequest):
    """Enhance N scenes PARALLEL (asyncio.gather).

    1 LLM call / scene. Cost: ~$0.001 × N.
    Time: ~2-5s tổng (parallel cap concurrency 4 via semaphore trong llm_router).
    """
    import time
    t_start = time.time()
    anchor_dict = request.character_anchor.model_dump() if request.character_anchor else None

    async def _enhance_one(scene: EnhanceBatchScene) -> EnhanceBatchSceneResult:
        try:
            r = await asyncio.to_thread(
                enhance_persona.enhance,
                raw_prompt=scene.raw_prompt,
                aspect_ratio=request.aspect_ratio,
                duration_s=scene.duration_s,
                character_anchor=anchor_dict,
                image_refs=scene.image_refs,
                purpose=scene.purpose,
            )
            return EnhanceBatchSceneResult(
                scene_id=scene.scene_id,
                enhanced_prompt=r.get("enhanced_prompt", scene.raw_prompt),
                summary=r.get("summary", ""),
                status="completed",
            )
        except Exception as e:
            logger.warning(f"[/enhance/batch] scene {scene.scene_id} fail: {e}")
            return EnhanceBatchSceneResult(
                scene_id=scene.scene_id,
                enhanced_prompt=scene.raw_prompt,
                summary="",
                status="failed",
                error=str(e)[:200],
            )

    results = await asyncio.gather(*[_enhance_one(s) for s in request.scenes])
    success = sum(1 for r in results if r.status == "completed")
    fail = len(results) - success
    elapsed = round(time.time() - t_start, 2)

    logger.info(
        f"[/enhance/batch] done: {success}/{len(results)} success in {elapsed}s"
    )

    return EnhanceBatchResponse(
        results=results,
        success_count=success,
        fail_count=fail,
        elapsed_s=elapsed,
    )
