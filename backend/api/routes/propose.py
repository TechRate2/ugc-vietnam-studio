"""Propose endpoint — Phase 2 của Director Agent.

Hai endpoint:
    POST /api/v1/jobs/propose         — JSON response sync (legacy)
    POST /api/v1/jobs/propose/stream  — SSE stream với progress events (UX tốt hơn)

Pipeline:
    User submit form → director_brain.propose() — 7 personas
        ↓ emit progress event mỗi stage (init/strategist/niche/trends/director/copywriter/critic/assemble)
    Return ProposalJSON (final event "complete")
        ↓
    Frontend modal "Director's Proposal" với progress bar realtime + 3 variants + reference mapping
        ↓
    User pick + approve → POST /api/v1/jobs/ugc render thật

Tổng cost ~$0.04-0.09 + time 60-180s. KHÔNG render video.
"""

import asyncio
import json
from typing import Optional, Literal

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from loguru import logger
from pydantic import BaseModel, Field

from agent.director_brain import brain
from api.schemas import ProductInput, VideoSettings


router = APIRouter()


# ============================================
# Request schema
# ============================================

class ContextInjection(BaseModel):
    """Real context user paste để video TỰ NHIÊN, không AI-slop.

    Mọi field optional — user skip được, AI sẽ tự bịa (chất lượng AI-slop cao hơn).
    Điền vào → quality output +30-50%.
    """
    pain_points: Optional[str] = Field(
        None,
        description="Pain points THẬT từ reviews/feedback (paste free-text)",
        max_length=2000,
    )
    real_reviews: Optional[str] = Field(
        None,
        description="3-5 reviews thật từ khách (paste raw)",
        max_length=3000,
    )
    usps: Optional[str] = Field(
        None,
        description="USP riêng brand cần highlight (paste từ brief)",
        max_length=1500,
    )
    forbidden_to_say: Optional[str] = Field(
        None,
        description="Claim/từ ngữ TRÁNH (vd: tên competitor, claim vi phạm luật)",
        max_length=1000,
    )
    mood_hint: Optional[str] = Field(
        None,
        description="Tone hint free-text (vd: 'girl-next-door, không lộ ad')",
        max_length=500,
    )


RefRoleLiteral = Literal[
    "primary_subject",
    "secondary_subject",
    "product_hero",
    "product_detail",
    "style_reference",
    "environment",
    "brand_asset",
]


class ProposeRequest(BaseModel):
    """Request cho POST /api/v1/jobs/propose.

    Khác CreateJobRequest (render thật) ở chỗ:
        - Thêm reference_videos cho Video Ref Analyzer (Qwen3-VL clone DNA)
        - Thêm reference_role_hints (NEW) — user tag role mỗi ảnh ở UI
        - Thêm user_brief free-text + context_injection
        - Thêm niche_hint optional (user override niche auto-detect)
        - KHÔNG cần template_id (Director Brain tự gen)
    """
    product_input: ProductInput
    reference_images: list[str] = Field(default_factory=list, max_length=12)
    reference_role_hints: list[Optional[RefRoleLiteral]] = Field(
        default_factory=list,
        max_length=12,
        description=(
            "Optional — user tag role mỗi ảnh khi upload (TopView V2 UI pattern). "
            "Cùng độ dài reference_images. Mỗi item: 'primary_subject' / 'product_hero' / "
            "'style_reference' / 'environment' / 'brand_asset' / null (AI tự detect). "
            "VisualPlanner sẽ VERIFY tag user thay vì đoán mò."
        ),
    )
    reference_videos: list[str] = Field(
        default_factory=list,
        max_length=1,
        description="Tối đa 1 video viral mẫu cho Qwen3-VL clone DNA",
    )
    user_brief: str = Field(
        "",
        max_length=3000,
        description="Free-text user mô tả ý tưởng + tone",
    )
    context_injection: ContextInjection = Field(default_factory=ContextInjection)
    settings: VideoSettings
    niche_hint: Optional[
        Literal[
            "auto",
            "beauty_skincare",
            "shopee_general",
            "supplement_health",
            "tech_gadget",
            "fashion_apparel",
            "food_beverage",
            "custom",
        ]
    ] = Field("auto", description="Auto-detect hoặc user pick niche")


# ============================================
# Response schema (loose — frontend đọc field, không strict typing)
# ============================================

class ProposeResponse(BaseModel):
    """Response từ /propose — full ProposalJSON.

    Schema loose vì proposal builder output rất giàu (xem proposal_builder.py).
    Frontend đọc các field chính: script_variants[], avatar_candidates[],
    storyboard_preview[], viral_scores, recommended_variant_id.
    """
    proposal_id: str
    created_at: str
    tech_config: dict

    product_summary: dict
    niche_detected: str
    niche_confidence: float
    viral_dna_applied: Optional[dict] = None
    trends_applied: list[dict] = Field(default_factory=list)
    director_concept_summary: str
    cinematic_brief: dict

    # NEW v2 — Higgsfield-style MCSLA + character consistency anchor
    character_sheet: dict = Field(default_factory=dict)
    shots: list[dict] = Field(default_factory=list)

    # NEW v3 — Visual Asset Plan (TopView V2 + ViMax pre-analysis pattern)
    # Frontend hiển thị "AI đã hiểu refs anh thế này" — show asset role table +
    # primary_character_anchor (giúp user confirm AI detect đúng trước khi approve).
    visual_plan: dict = Field(default_factory=dict)

    # NEW v3 — Model-Aware Strategy picker output (Topview pattern).
    # Show user "Vì sao Agent pick model này" + ranking 6 strategies.
    # Structure: {picked_model, picked_display_name, picked_reasoning,
    #             storyboard_format, needs_keyframe_gen, needs_tts_first, ranking[]}
    model_strategy: Optional[dict] = Field(None, description="V3 Model-Aware Strategy")

    script_variants: list[dict]
    reference_mapping: dict = Field(default_factory=dict)
    storyboard_preview: list[dict]

    recommended_variant_id: str
    recommended_reason: str = ""
    global_red_flags: list = Field(default_factory=list)
    global_improvement_ideas: list = Field(default_factory=list)

    cost_so_far_phase2_usd: float
    estimated_render_cost_usd: float
    estimated_render_time_s: int
    estimated_total_cost_usd: float


# ============================================
# Endpoint
# ============================================

@router.post("/propose", response_model=ProposeResponse)
async def propose_video(request: ProposeRequest):
    """Phase 2 — Director Agent đề xuất 3 script variants + avatars cho user pick.

    KHÔNG render video. User pick + approve → call POST /api/v1/jobs/ugc render.
    """
    logger.info(
        f"[/propose] niche_hint={request.niche_hint}, "
        f"model={request.settings.model}, duration={request.settings.duration_s}s, "
        f"refs_img={len(request.reference_images)}, "
        f"refs_vid={len(request.reference_videos)}, "
        f"has_context={any([request.context_injection.pain_points, request.context_injection.real_reviews, request.context_injection.usps])}"
    )

    # Validate at least 1 input source
    has_product = bool(
        request.product_input.url or request.product_input.text_description
    )
    if not has_product:
        raise HTTPException(
            status_code=400,
            detail="Phải cung cấp ít nhất 1: product_input.url hoặc product_input.text_description",
        )

    # Tech config dict — pass to brain
    tech_config = {
        "duration_s": request.settings.duration_s,
        "aspect_ratio": request.settings.aspect_ratio,
        "audio_mode": request.settings.audio_mode,
        "model": request.settings.model,
        "resolution": request.settings.resolution,
        "voice_id": request.settings.voice_persona,
        "num_shots": request.settings.num_shots,  # V3.1 multi-shot override
    }

    # Context injection dict — BUG-B6 + B12: sanitize prompt injection + strip PII
    from core.sanitize import sanitize_context_injection
    raw_ctx = request.context_injection.model_dump(exclude_none=True)
    ctx, sanitize_report = sanitize_context_injection(raw_ctx)
    if sanitize_report["flagged_injections"]:
        logger.warning(
            f"[/propose] prompt injection neutralized: {sanitize_report['flagged_injections'][:3]}"
        )
    if sanitize_report["pii_counts"]:
        logger.info(
            f"[/propose] PII redacted: {sanitize_report['pii_counts']}"
        )

    # BUG-B6 also: sanitize user_brief (free-text)
    from core.sanitize import sanitize_prompt_injection, strip_pii
    clean_brief, brief_flagged = sanitize_prompt_injection(request.user_brief or "")
    clean_brief, _ = strip_pii(clean_brief)
    if brief_flagged:
        logger.warning(f"[/propose] user_brief injection neutralized: {brief_flagged[:3]}")

    try:
        proposal = await brain.propose(
            product_input=request.product_input.model_dump(exclude_none=True),
            reference_images=request.reference_images,
            reference_videos=request.reference_videos,
            user_brief=clean_brief,
            context_injection=ctx,
            tech_config=tech_config,
            niche_hint=(
                None
                if request.niche_hint == "auto"
                else request.niche_hint
            ),
            reference_role_hints=request.reference_role_hints or None,
        )
    except Exception as e:
        logger.exception("[/propose] director_brain failed")
        raise HTTPException(
            status_code=500,
            detail=f"Director Brain error: {str(e)[:200]}",
        ) from e

    return proposal


# ============================================
# SSE streaming endpoint — progress events realtime
# ============================================

# Tổng N stages emit để frontend tính % progress.
# Order khớp với DirectorBrain.propose() emit sequence:
PROGRESS_STAGES_ORDER = [
    "init",          # 0
    "strategist",    # 1 — Product Strategist
    "niche",         # 2 — Niche router + load skill_pack
    "trends",        # 3 — TrendWatcher
    "director",      # 4 — Director envision
    "copywriter",    # 5 — Hook+Body+CTA + Ranker + RefAnalyzer (parallel)
    "critic",        # 6 — Viral score
    "assemble",      # 7 — Build proposal final
]
TOTAL_STAGES = len(PROGRESS_STAGES_ORDER) - 1  # init is stage 0


@router.post("/propose/stream")
async def propose_video_stream(request: ProposeRequest, raw_request: Request):
    """SSE stream version of /propose — emit progress events realtime.

    Format SSE (Server-Sent Events):
        event: stage
        data: {"stage":"strategist","status":"running","message":"Phân tích sản phẩm"}

        event: stage
        data: {"stage":"strategist","status":"done","elapsed_s":28}

        ...

        event: complete
        data: {full ProposalJSON}

        event: error
        data: {"error":"..."}

    Frontend consume bằng fetch + ReadableStream (vì EventSource KHÔNG support POST body).
    """
    logger.info(
        f"[/propose/stream] niche_hint={request.niche_hint}, model={request.settings.model}, "
        f"refs_img={len(request.reference_images)}, refs_vid={len(request.reference_videos)}"
    )

    # Validate at least 1 input source (same as JSON endpoint)
    has_product = bool(
        request.product_input.url or request.product_input.text_description
    )
    if not has_product:
        raise HTTPException(
            status_code=400,
            detail="Phải cung cấp ít nhất 1: product_input.url hoặc product_input.text_description",
        )

    # Build tech_config + sanitize (same as JSON endpoint)
    tech_config = {
        "duration_s": request.settings.duration_s,
        "aspect_ratio": request.settings.aspect_ratio,
        "audio_mode": request.settings.audio_mode,
        "model": request.settings.model,
        "resolution": request.settings.resolution,
        "voice_id": request.settings.voice_persona,
        "num_shots": request.settings.num_shots,  # V3.1 multi-shot override
    }
    ctx = request.context_injection.model_dump(exclude_none=True)

    from core.sanitize import sanitize_prompt_injection, strip_pii
    clean_brief, _ = sanitize_prompt_injection(request.user_brief or "")
    clean_brief, _ = strip_pii(clean_brief)

    # Event queue — DirectorBrain push event, generator pop ra stream.
    # FIX #5 (HIGH): bound queue maxsize=100 + drop-oldest fallback. Trước đây unbounded
    # → nếu client disconnect mà callback vẫn fire → OOM khi proposal job dài. Bounded
    # queue + non-blocking put_nowait + drop oldest event khi đầy = backpressure safe.
    _QUEUE_MAX = 100
    event_queue: asyncio.Queue = asyncio.Queue(maxsize=_QUEUE_MAX)

    async def _progress_cb(event: dict):
        """Push progress event vào queue cho generator stream (drop-oldest khi đầy)."""
        # Tính progress % dựa stage order
        stage = event.get("stage", "")
        if stage in PROGRESS_STAGES_ORDER:
            idx = PROGRESS_STAGES_ORDER.index(stage)
            done = event.get("status") == "done"
            progress = round((idx if done else max(0, idx - 0.5)) / TOTAL_STAGES * 100)
            event["progress_pct"] = min(99, progress)

        # FIX #5: try put_nowait; nếu full → drop oldest "stage" event (giữ event mới nhất).
        # KHÔNG drop "complete"/"error" — đó là terminal event critical, dùng blocking put.
        payload = ("stage", event)
        try:
            event_queue.put_nowait(payload)
        except asyncio.QueueFull:
            # Drop oldest item để có chỗ — newest progress quan trọng hơn cũ
            try:
                _dropped = event_queue.get_nowait()
                logger.warning(
                    f"[/propose/stream] event_queue full (max={_QUEUE_MAX}), "
                    f"dropped oldest stage event to make room for {stage}"
                )
            except asyncio.QueueEmpty:
                pass
            # Retry — nếu vẫn full (race) thì blocking put với timeout ngắn
            try:
                await asyncio.wait_for(event_queue.put(payload), timeout=1.0)
            except asyncio.TimeoutError:
                logger.error(
                    f"[/propose/stream] event_queue stuck — drop {stage} event entirely"
                )

    async def _put_terminal(event_type: str, payload):
        """Force put terminal event (complete/error/__end__) — drain queue if full.

        Terminal event TUYỆT ĐỐI không được drop — drain hết stage events nếu cần.
        """
        try:
            await asyncio.wait_for(event_queue.put((event_type, payload)), timeout=5.0)
        except asyncio.TimeoutError:
            # Drain bằng cách get tất cả (drop hết stage events) rồi put lại
            try:
                while True:
                    event_queue.get_nowait()
            except asyncio.QueueEmpty:
                pass
            await event_queue.put((event_type, payload))

    async def _run_propose():
        """Background task — chạy brain.propose() + push final event."""
        try:
            proposal = await brain.propose(
                product_input=request.product_input.model_dump(exclude_none=True),
                reference_images=request.reference_images,
                reference_videos=request.reference_videos,
                user_brief=clean_brief,
                context_injection=ctx,
                tech_config=tech_config,
                niche_hint=None if request.niche_hint == "auto" else request.niche_hint,
                reference_role_hints=request.reference_role_hints or None,
                progress_callback=_progress_cb,
            )
            await _put_terminal("complete", proposal)
        except Exception as e:
            logger.exception("[/propose/stream] brain.propose failed")
            await _put_terminal("error", {"error": str(e)[:300]})
        finally:
            await _put_terminal("__end__", None)

    async def _sse_generator():
        """SSE generator — consume queue, format SSE protocol."""
        # Initial event
        yield 'event: open\ndata: {"message":"Director Agent starting"}\n\n'

        # Kick off background propose task
        propose_task = asyncio.create_task(_run_propose())

        try:
            while True:
                # Client disconnect detect
                if await raw_request.is_disconnected():
                    logger.info("[/propose/stream] client disconnected, cancelling")
                    propose_task.cancel()
                    break

                try:
                    event_type, payload = await asyncio.wait_for(
                        event_queue.get(), timeout=30.0
                    )
                except asyncio.TimeoutError:
                    # Heartbeat to keep connection alive
                    yield ": heartbeat\n\n"
                    continue

                if event_type == "__end__":
                    break

                # Format SSE
                payload_json = json.dumps(payload, ensure_ascii=False)
                yield f"event: {event_type}\ndata: {payload_json}\n\n"

                if event_type in ("complete", "error"):
                    break
        finally:
            if not propose_task.done():
                propose_task.cancel()

    return StreamingResponse(
        _sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering nếu sau này deploy
            "Connection": "keep-alive",
        },
    )
