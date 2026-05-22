"""Director Brain — orchestrator của 7 personas → Proposal cho user duyệt.

Phase 2 trong pipeline (xem README + flowchart):
    User submit form
        ↓
    POST /api/v1/jobs/propose
        ↓
    director_brain.propose() — chạy 7 personas + parallel sub-tasks
        ↓
    Return ProposalJSON → frontend modal
        ↓
    User pick variant + approve → POST /api/v1/jobs (existing endpoint, render thật)

Stage này CHỈ LLM call, KHÔNG render video/image — tiết kiệm chi phí khi user reject.
Tổng cost Phase 2: ~$0.04-0.10 / proposal (with video ref: +$0.05).

ASYNC pattern:
    Vendors sync (llm_router.llm.complete) wrap qua asyncio.to_thread → run parallel
    trong cùng event loop FastAPI mà không phải refactor vendors.
"""

import asyncio
from pathlib import Path
from typing import Optional

import yaml
from loguru import logger

from agent.personas import (
    product_strategist,
    trend_watcher,
    director,
    copywriter,
    reference_analyzer,
    editor,
    critic,
    visual_planner,
)
from agent.video_ref_analyzer import analyze_video_ref
from agent.proposal_builder import build_proposal


_SKILL_PACKS_DIR = Path(__file__).parent.parent / "skill_packs"


class DirectorBrain:
    """Orchestrate 7 personas + Video Ref Analyzer → Proposal."""

    async def propose(
        self,
        product_input: dict,
        reference_images: list[str],
        reference_videos: list[str],
        user_brief: str,
        context_injection: dict,
        tech_config: dict,
        niche_hint: Optional[str] = None,
        reference_role_hints: Optional[list[Optional[str]]] = None,
        progress_callback: Optional[callable] = None,
    ) -> dict:
        """Phase 2 main entry — gen Proposal.

        Args:
            product_input: {url, text_description, image_urls}.
            reference_images: list ảnh tham chiếu user upload (0-12).
            reference_videos: list video tham chiếu (cho Qwen3-VL clone DNA, 0-1).
            user_brief: free-text ý tưởng/tone user.
            context_injection: {pain_points, reviews, usps, forbidden, mood_hint}.
            tech_config: {duration_s, aspect_ratio, audio_mode, model, voice_id}.
            niche_hint: optional, override auto-detect.
            reference_role_hints: optional list cùng len reference_images. Mỗi item là
                role tag user chọn ở UI (primary_subject / product_hero / style_reference /
                environment / brand_asset / None). VisualPlanner sẽ VERIFY tag user thay
                vì đoán mò. None mỗi item = AI tự detect.
            progress_callback: optional async callable(stage_name, status, extra={})
                emit progress event mỗi stage start/done. Dùng cho SSE streaming.

        Returns:
            ProposalJSON (xem proposal_builder.build_proposal).
        """
        import time as _time

        async def _emit(stage: str, status: str, **extra):
            """Helper emit progress event nếu có callback."""
            if progress_callback:
                event = {"stage": stage, "status": status, **extra}
                try:
                    if asyncio.iscoroutinefunction(progress_callback):
                        await progress_callback(event)
                    else:
                        progress_callback(event)
                except Exception as e:
                    logger.warning(f"[DirectorBrain] progress_callback fail: {e}")

        t_start = _time.time()
        logger.info(
            f"[DirectorBrain] propose start: niche_hint={niche_hint}, "
            f"refs_img={len(reference_images)}, refs_vid={len(reference_videos)}, "
            f"model={tech_config.get('model')}"
        )
        await _emit("init", "running", message=f"Khởi động Director Agent — model={tech_config.get('model')}")

        # ===== STAGE A0: Visual Planner CHẠY ĐẦU TIÊN =====
        # FIX A (post-incident "phân tích sản phẩm sai"): refactor SEQUENCE thay vì parallel.
        # Trước: VisualPlanner + Strategist + VideoRef chạy đồng thời → Strategist KHÔNG biết
        # ảnh nào là product, đoán mò → mô tả sai.
        # Sau: VisualPlanner xong TRƯỚC → output role tags → Strategist nhận filter ảnh, chỉ
        # phân tích product_hero + product_detail. Video Ref vẫn parallel (không phụ thuộc).
        await _emit("strategist", "running",
                    message="Phân tích role ảnh (Visual Planner)...")
        t0 = _time.time()

        # Run VisualPlanner + VideoRef parallel (independent), Strategist sau khi có visual_plan
        visual_plan_task = asyncio.to_thread(
            visual_planner.plan,
            reference_images=reference_images,
            product_input=product_input,
            user_brief=user_brief,
            tech_config=tech_config,
            role_hints=reference_role_hints,
        )
        if reference_videos:
            viral_dna_task = analyze_video_ref(reference_videos)
            visual_plan_result, viral_dna_result = await asyncio.gather(
                visual_plan_task, viral_dna_task,
                return_exceptions=True,
            )
            visual_plan = visual_plan_result if not isinstance(visual_plan_result, Exception) else None
            viral_dna = viral_dna_result if not isinstance(viral_dna_result, Exception) else None
            if isinstance(visual_plan_result, Exception):
                logger.warning(f"[DirectorBrain] VisualPlanner failed: {visual_plan_result}")
            if isinstance(viral_dna_result, Exception):
                logger.warning(f"[DirectorBrain] VideoRefAnalyzer failed: {viral_dna_result}")
        else:
            visual_plan_result = await asyncio.gather(visual_plan_task, return_exceptions=True)
            visual_plan = visual_plan_result[0] if not isinstance(visual_plan_result[0], Exception) else None
            viral_dna = None

        # Visual plan fallback nếu fail
        if visual_plan is None:
            from agent.personas.visual_planner import _empty_plan
            visual_plan = _empty_plan(reason="stage_a_exception")

        await _emit("strategist", "running",
                    message="Phân tích sản phẩm (chỉ ảnh product được tag)...")

        # FIX A: Strategist GIỜ nhận visual_plan → chỉ phân tích product_hero + product_detail
        # Filter ảnh dựa role tag từ VisualPlanner — Strategist KHÔNG còn đoán mò ảnh nhân vật.
        product_pos = await self._run_product_strategist_with_plan(
            product_input, reference_images, tech_config, visual_plan,
        )

        await _emit("strategist", "done", elapsed_s=round(_time.time() - t0, 1))

        # ===== STAGE B: Detect niche + Load skill pack =====
        await _emit("niche", "running", message="Xác định niche + skill pack")
        t0 = _time.time()
        niche_id = self._resolve_niche(product_pos, niche_hint)
        skill_pack = self._load_skill_pack(niche_id)
        await _emit("niche", "done", elapsed_s=round(_time.time() - t0, 1), niche_id=niche_id)

        # ===== STAGE C: Trend Watcher (fast, no LLM) =====
        await _emit("trends", "running", message="Tải TikTok VN trends")
        t0 = _time.time()
        trends_vn = self._run_trend_watcher(niche_id, product_pos)
        await _emit("trends", "done", elapsed_s=round(_time.time() - t0, 1), count=len(trends_vn))

        # ===== STAGE D: Director (cinematic vision) — DEPENDS on A + C =====
        # Director GIỜ đọc visual_plan để inject primary_character_anchor vào
        # character_sheet thay vì invent face mới (fix Bug #1 — character drift).
        await _emit("director", "running", message="Đạo diễn dựng tầm nhìn cinematic")
        t0 = _time.time()
        cinematic = await asyncio.to_thread(
            director.envision,
            product_positioning=product_pos,
            user_brief=user_brief,
            tech_config=tech_config,
            viral_dna=viral_dna,
            trends_vn=trends_vn,
            visual_plan=visual_plan,
        )
        await _emit("director", "done", elapsed_s=round(_time.time() - t0, 1))

        # ===== STAGE E: Parallel — Copywriter pipeline + Reference Analyzer =====
        await _emit("copywriter", "running", message="Viết 3 variants Hook + Body + CTA + Ranker")
        t0 = _time.time()
        script_variants_task = copywriter.write_script_variants(
            cinematic_brief=cinematic,
            product_positioning=product_pos,
            context_injection=context_injection,
            trends_vn=trends_vn,
            skill_pack=skill_pack,
            tech_config=tech_config,
        )
        # ReferenceAnalyzer GIỜ chỉ làm shot-level assignment (role detection đã xong
        # ở VisualPlanner Stage A). Pass visual_plan để skip redundant analysis.
        reference_task = asyncio.to_thread(
            reference_analyzer.analyze_references,
            cinematic_brief=cinematic,
            product_positioning=product_pos,
            reference_images=reference_images,
            tech_config=tech_config,
            visual_plan=visual_plan,
        )

        script_variants, reference_mapping = await asyncio.gather(
            script_variants_task, reference_task
        )
        await _emit("copywriter", "done", elapsed_s=round(_time.time() - t0, 1),
                    variants=len(script_variants),
                    refs_mapped=len(reference_mapping.get("mapped_references", [])))

        # ===== STAGE F: Critic scores variants =====
        await _emit("critic", "running", message="Critic chấm viral score 1-10")
        t0 = _time.time()
        critic_context = {
            "niche": niche_id,
            "audience": product_pos.get("product", {}).get("target_persona"),
            "product_name": product_pos.get("product", {}).get("name"),
            "trends_applied": cinematic.get("trend_alignment"),
        }
        viral_report = await asyncio.to_thread(
            critic.evaluate,
            script_variants=script_variants,
            cinematic_brief=cinematic,
            context=critic_context,
            viral_dna=viral_dna,
        )
        await _emit("critic", "done", elapsed_s=round(_time.time() - t0, 1))

        # ===== STAGE G: Storyboard preview (Phase 2 — text only) =====
        storyboard_preview = editor.storyboard_preview(cinematic)

        # ===== STAGE H: Assemble ProposalJSON =====
        proposal = build_proposal(
            product_positioning=product_pos,
            viral_dna=viral_dna,
            trends_applied=trends_vn,
            cinematic_brief=cinematic,
            script_variants=script_variants,
            reference_mapping=reference_mapping,
            storyboard_preview=storyboard_preview,
            viral_report=viral_report,
            tech_config=tech_config,
            visual_plan=visual_plan,
        )

        # ===== STAGE I: Model-Aware Picker (V3 — strategy dispatch) =====
        # Score 6 strategies dựa script properties → suggest model fit nhất.
        # KHÔNG override user choice nếu user đã chọn model explicit.
        try:
            await _emit("model_picker", "running", message="Picking best video model strategy")
            picker_result = await asyncio.to_thread(
                self._run_model_picker,
                product_pos=product_pos,
                cinematic=cinematic,
                script_variants=script_variants,
                tech_config=tech_config,
            )
            proposal["model_strategy"] = picker_result
            logger.info(
                f"[DirectorBrain] model_picker OK: {picker_result.get('picked_model')} "
                f"({picker_result.get('picked_display_name')})"
            )
            await _emit(
                "model_picker", "done",
                picked=picker_result.get("picked_model"),
                reasoning=picker_result.get("picked_reasoning", ""),
            )
        except Exception as e:
            logger.exception(f"[DirectorBrain] model_picker FAIL — full trace below")
            proposal["model_strategy"] = None

        total_elapsed = round(_time.time() - t_start, 1)
        logger.info(
            f"[DirectorBrain] proposal done in {total_elapsed}s: "
            f"variants={len(script_variants)}, "
            f"refs_mapped={len(reference_mapping.get('mapped_references', []))}, "
            f"recommended={proposal.get('recommended_variant_id')}, "
            f"phase2_cost=${proposal.get('cost_so_far_phase2_usd')}"
        )
        await _emit("assemble", "done", elapsed_s_total=total_elapsed)

        return proposal

    def _run_model_picker(
        self,
        product_pos: dict,
        cinematic: dict,
        script_variants: list[dict],
        tech_config: dict,
    ) -> dict:
        """V3 — convert proposal outputs → Script obj → picker → ranking."""
        from agent.strategies.base import Script, Scene, Character
        from agent.strategies.picker import pick_strategy

        # Build Script from Director outputs
        char_sheet = cinematic.get("character_sheet") or {}
        characters: list[Character] = []
        if char_sheet:
            try:
                characters.append(Character(
                    id=char_sheet.get("id") or "main_character",
                    name_vn=char_sheet.get("name_vn") or "Main",
                    age_apparent=char_sheet.get("age_apparent"),
                    gender=char_sheet.get("gender"),
                    face=char_sheet.get("face") or "",
                    outfit_top=char_sheet.get("outfit_top"),
                    outfit_bottom=char_sheet.get("outfit_bottom"),
                    personality_traits=char_sheet.get("personality_traits") or [],
                ))
            except Exception as e:
                logger.warning(f"[picker] char sheet parse fail: {e}")

        scenes: list[Scene] = []
        for s in cinematic.get("shots") or []:
            try:
                scenes.append(Scene(
                    shot_id=s.get("shot_id") or f"S{len(scenes)+1}",
                    duration_s=float(s.get("duration_s") or 3),
                    purpose=s.get("purpose") or "shot",
                    camera=s.get("C_camera") or "",
                    subject=s.get("S_subject") or "",
                    lighting=s.get("L_lighting") or "",
                    action=s.get("A_action") or "",
                    dialogue_vn=s.get("dialogue_vn"),
                    caption_on_screen=s.get("caption_on_screen"),
                ))
            except Exception as e:
                logger.warning(f"[picker] scene parse fail: {e}")

        audio_mode = tech_config.get("audio_mode", "silent_native")
        needs_lipsync = audio_mode == "dialogue_vo" and any(
            s.dialogue_vn for s in scenes
        )
        needs_native_audio = audio_mode in ("dialogue_vo", "asmr_macro")

        script_obj = Script(
            title=product_pos.get("product", {}).get("name", "")[:80],
            product_name=product_pos.get("product", {}).get("name", ""),
            audience_desc=str(product_pos.get("product", {}).get("target_persona", "")),
            scenes=scenes,
            characters=characters,
            target_duration_s=int(tech_config.get("duration_s") or 15),
            aspect_ratio=tech_config.get("aspect_ratio") or "9:16",
            resolution_hint=tech_config.get("resolution") or "720p",
            needs_lipsync=needs_lipsync,
            needs_native_audio=needs_native_audio,
            style=tech_config.get("style", "ugc"),
        )

        # Pick — respect user explicit choice (tech_config.model)
        chosen, ranking = pick_strategy(
            script=script_obj,
            user_preference=tech_config.get("model"),  # user pick model ở UI
            budget_tier=tech_config.get("budget_tier", "balanced"),
        )

        return {
            "picked_model": chosen.user_model,
            "picked_atlas_key": chosen.atlas_model_key,
            "picked_display_name": chosen.display_name_vn,
            "picked_reasoning": chosen.reasoning_for_script(script_obj),
            "storyboard_format": chosen.storyboard_format_label(),
            "needs_keyframe_gen": chosen.needs_keyframe_gen(),
            "needs_tts_first": chosen.needs_tts_first(),
            "max_refs": chosen.max_refs(),
            "ranking": ranking,
        }

    # ============================================================
    # Stage runners (delegate sang personas/)
    # ============================================================

    async def _run_product_strategist(
        self,
        product_input: dict,
        reference_images: list[str],
        tech_config: dict,
    ) -> dict:
        """Persona 1 — wrap sync product_strategist.analyze() async (legacy)."""
        return await asyncio.to_thread(
            product_strategist.analyze,
            product_input=product_input,
            reference_images=reference_images,
            tech_config=tech_config,
        )

    async def _run_product_strategist_with_plan(
        self,
        product_input: dict,
        reference_images: list[str],
        tech_config: dict,
        visual_plan: dict,
    ) -> dict:
        """Persona 1 (FIX A) — Strategist filter ảnh theo role tag từ VisualPlanner.

        Trước: nhận tất cả refs → đoán product mò khắp nơi → ảnh KOL có thể bị
        mô tả thành product.
        Sau: chỉ pass ảnh role=product_hero / product_detail → Strategist focus
        đúng ảnh sản phẩm. Cost giảm (ít token vision input), accuracy tăng.

        Nếu visual_plan rỗng (no refs hoặc planner fail) → fallback pass full list.
        """
        if visual_plan and visual_plan.get("assets"):
            assets = visual_plan["assets"]
            product_roles = {"product_hero", "product_detail", "brand_asset"}
            # Pick index của ảnh role=product*
            product_indices = [
                a.get("index") for a in assets
                if isinstance(a, dict)
                and a.get("detected_role") in product_roles
                and a.get("recommended_usage") != "skip"
            ]
            if product_indices:
                filtered_refs = [
                    reference_images[i] for i in product_indices
                    if isinstance(i, int) and 0 <= i < len(reference_images)
                ]
                logger.info(
                    f"[DirectorBrain] Strategist filtered refs: "
                    f"{len(reference_images)} → {len(filtered_refs)} "
                    f"(product images only: indices={product_indices})"
                )
                if filtered_refs:
                    return await asyncio.to_thread(
                        product_strategist.analyze,
                        product_input=product_input,
                        reference_images=filtered_refs,
                        tech_config=tech_config,
                    )
            else:
                logger.warning(
                    "[DirectorBrain] VisualPlanner KHÔNG detect được product image — "
                    "Strategist sẽ phân tích text-only (không có ảnh product để xem)"
                )
                # Vẫn run với reference_images rỗng — Strategist xử lý text mô tả
                return await asyncio.to_thread(
                    product_strategist.analyze,
                    product_input=product_input,
                    reference_images=[],
                    tech_config=tech_config,
                )

        # Fallback: no visual_plan → legacy behavior
        return await asyncio.to_thread(
            product_strategist.analyze,
            product_input=product_input,
            reference_images=reference_images,
            tech_config=tech_config,
        )

    def _run_trend_watcher(
        self,
        niche_id: str,
        product_pos: dict,
    ) -> list[dict]:
        """Persona 2 — no LLM, DB query (fast, sync OK)."""
        target_persona = product_pos.get("product", {}).get("target_persona", {})
        age_str = target_persona.get("age_range", "")
        try:
            parts = age_str.replace(" ", "").split("-")
            age_range = (int(parts[0]), int(parts[1]))
        except (ValueError, IndexError):
            age_range = None

        return trend_watcher.fetch_relevant_trends(
            niche=niche_id,
            audience_age=age_range,
            limit=5,
            min_score=6,
        )

    # ============================================================
    # Niche resolution + Skill pack loading
    # ============================================================

    def _resolve_niche(
        self,
        product_pos: dict,
        niche_hint: Optional[str],
    ) -> str:
        """Niche router — rule-based + product category matching.

        Priority:
            1. niche_hint user explicitly chose
            2. product.category từ Strategist (rule-based map)
            3. fallback "custom"
        """
        if niche_hint and niche_hint != "auto":
            return niche_hint

        category = product_pos.get("product", {}).get("category", "")
        # Map category → skill_pack id
        # vd: "beauty.skincare" → "beauty_skincare", "beauty.makeup" → "beauty_skincare"
        if category.startswith("beauty"):
            return "beauty_skincare"
        if category.startswith("supplement") or category.startswith("health"):
            return "supplement_health"
        if category.startswith("tech"):
            return "tech_gadget"
        if category.startswith("fashion"):
            return "fashion_apparel"
        if category.startswith("food"):
            return "food_beverage"
        if category.startswith("mom_baby") or category.startswith("baby"):
            return "shopee_general"  # mom_baby chưa có pack riêng — Week 3

        # Default fallback
        return "shopee_general"

    def _load_skill_pack(self, niche_id: str) -> dict:
        """Load skill pack YAML files (SKILL + hooks).

        Returns merged dict với cả metadata + hooks library.
        """
        pack_dir = _SKILL_PACKS_DIR / niche_id

        if not pack_dir.exists():
            logger.warning(
                f"[DirectorBrain] skill_pack '{niche_id}' not found — "
                f"falling back to 'beauty_skincare'"
            )
            pack_dir = _SKILL_PACKS_DIR / "beauty_skincare"

        skill_file = pack_dir / "SKILL.yaml"
        hooks_file = pack_dir / "hooks.yaml"

        if not skill_file.exists():
            logger.error(f"[DirectorBrain] SKILL.yaml missing in {pack_dir}")
            return {"id": niche_id}

        with open(skill_file, encoding="utf-8") as f:
            skill_data = yaml.safe_load(f) or {}

        # Merge hooks if present
        if hooks_file.exists():
            with open(hooks_file, encoding="utf-8") as f:
                hooks_data = yaml.safe_load(f) or {}
            skill_data["hooks"] = hooks_data.get("hooks", [])
            skill_data["scoring_weights"] = hooks_data.get("scoring_weights", {})
            skill_data["ranker_strategy"] = hooks_data.get("ranker_strategy", {})

        logger.info(
            f"[DirectorBrain] loaded skill_pack: {niche_id} "
            f"(hooks={len(skill_data.get('hooks', []))}, "
            f"frameworks={len(skill_data.get('recommended_frameworks', []))})"
        )
        return skill_data


# Singleton
brain = DirectorBrain()
