# CineForge AI V3 — UGC Vietnam Studio

Hệ thống AI dựng video UGC / cinematic / quảng cáo cho thị trường Việt Nam — paste link Shopee/Lazada hoặc mô tả tự do, AI **Director Agent V3** tự dựng **Continuity Bible + Shot List + Storyboard**, user duyệt rồi render MP4 9:16 / 16:9 / 1:1 trong 2–4 phút.

> Monorepo: Next.js 14 frontend + FastAPI backend trong cùng 1 source.
>
> **Triết lý V3:** zero template hardcoded — mọi script được Director sinh động theo brief, refs, niche, duration. Continuity Bible giữ identity (nhân vật / style / audio) xuyên suốt video dài. Reference Chaining (last-frame i2v) khoá identity giữa các shot.

---

## ⚡ TL;DR

```bash
npm install && npm run backend:install
cp .env.example .env.local   # paste API keys
npm run dev:all              # FE :3000 + BE :8000 (Swagger /docs)
```

Frontend Studio V4 hiện ở `http://localhost:3000` — Studio Main card → click *Generate* → modal **CineForge Director V3** mở:

```
[ Bible ][ Shot List ][ Storyboard ][ Eval ]   →   Approve · Render
```

---

## 🧠 Kiến trúc Director V3 (3 Layer)

```
                ┌──────────────────────────────────────────────────────┐
LAYER 1         │  Director Agent V3  (1 LLM call)                     │
PLANNING        │    in: brief + refs + product + tech_config          │
                │   out: ContinuityBible + Shot List (8-15) + Storyb.  │
                │   + Self-Evaluation (consistency / viral / pacing …) │
                └──────────────────────────────────────────────────────┘
                                       ↓
                  Human-in-the-Loop  (DirectorPlanModal — Approve)
                                       ↓
                ┌──────────────────────────────────────────────────────┐
LAYER 2         │  Scene Generation Agent   (1 LLM call per shot —    │
PROMPT BUILD    │     hoặc deterministic mode no-LLM)                  │
                │  Embed Bible.character.face_signature + visual_style │
                │  Decide render_mode: ref_to_video / i2v_chain / t2v  │
                └──────────────────────────────────────────────────────┘
                                       ↓
                ┌──────────────────────────────────────────────────────┐
LAYER 3         │  Video Worker V3  (Reference Chaining loop)          │
RENDER + ASSEM. │   shot 0 → ref_to_video                              │
                │   shot N → i2v with previous shot's last_frame_url   │
                │   → AssembleWorker FFmpeg concat                     │
                │   → Color consistency pass (Bible-driven)            │
                │   → Upload R2 → MP4 ready                            │
                └──────────────────────────────────────────────────────┘
```

3 nguyên lý cốt lõi:

1. **Continuity Bible** = trạng thái toàn cục (character face_signature, products, visual_style, audio_design, setting, constraints, reference_assets[role+apply_to_shots]). Mọi shot prompt đều derive từ đây → identity bền vững video dài.
2. **Universal Reference** = mọi ảnh user upload được Director tag `role` (character_anchor / product_hero / style_reference / environment / brand_asset…) + `apply_to_shots` (shot_ids dùng ref đó). Scene Gen Agent gọi `continuity_manager.references_for_shot()` để bind đúng ảnh đúng shot.
3. **Reference Chaining** = mỗi shot có thể set `continuity.previous_shot_id`. Render loop tự swap sang i2v variant + pass last frame trước → identity 100% qua nhiều shot, không drift.

---

## 📁 Folder

```
ai-studio-hub/
├── app/                  Next.js 14 App Router (UI + proxy /api/v1/* → FastAPI)
├── components/
│   └── studio/           Studio V4 + DirectorPlanModal/Tab (V3 review UI)
├── lib/studio/           TS hooks (use-director-plan SSE client, …)
│
├── backend/
│   ├── agent/
│   │   ├── schemas.py             ContinuityBible / Shot / DirectorPlan / EvalReport (Pydantic)
│   │   ├── director_agent.py      ⭐ Layer 1 — single LLM call → DirectorPlan
│   │   ├── continuity_manager.py  Validate + auto-chain + inject Bible into prompt
│   │   ├── scene_generation_agent.py  Layer 2 — per-shot SceneRenderJob
│   │   ├── evaluation_layer.py    Self-critique (1 LLM call → EvaluationReport)
│   │   ├── trend_cache.py         SQLite VN-TikTok trend store (optional context)
│   │   ├── model_specs.py         AtlasCloud per-model payload spec
│   │   ├── model_adapter.py       Cost / model metadata helpers
│   │   ├── image_specs.py         Image-gen payload spec (Seedream/Flux)
│   │   └── strategies/            Per-model prompt strategy (legacy + reused)
│   │
│   ├── system_prompts/            ⭐ Markdown system prompts (zero hardcode in .py)
│   │   ├── director.md
│   │   ├── scene.md
│   │   └── evaluation.md
│   │
│   ├── api/
│   │   ├── main.py                FastAPI bootstrap + router mount
│   │   ├── schemas.py
│   │   └── routes/
│   │       ├── director.py        ⭐ V3 canonical — /plan, /plan/stream, /storyboard, /generate
│   │       ├── jobs.py            ⚠️ LEGACY render queue (kept for back-compat, scheduled removal)
│   │       ├── video_direct.py    Playground direct AtlasCloud call
│   │       ├── image_direct.py    Playground direct image gen
│   │       ├── audio_direct.py    TTS / SFX direct
│   │       ├── media_upload.py    File → atlas-hosted URL
│   │       ├── llm_direct.py      Raw LLM passthrough
│   │       └── avatars.py
│   │
│   ├── workers/
│   │   ├── video_worker.py        ⭐ V3 render orchestrator (Reference Chaining loop)
│   │   ├── assemble_worker.py     FFmpeg concat + color consistency pass
│   │   ├── render_pipeline.py     ⚠️ LEGACY (used only by /api/v1/jobs/* route)
│   │   └── trend_scanner.py       Cron scraper → trend_cache.db
│   │
│   ├── vendors/
│   │   ├── atlascloud.py          Image + video gen + media upload + chain helper
│   │   ├── atlascloud_llm.py      Claude / DeepSeek / Qwen3-VL via AtlasCloud
│   │   ├── llm_router.py          Provider routing (AtlasCloud primary + Anthropic fallback)
│   │   ├── genmax.py              Vietnamese TTS (primary)
│   │   ├── elevenlabs_sfx.py
│   │   └── anthropic_client.py
│   │
│   └── core/
│       ├── config.py / jobs_store.py / idempotency.py / llm_cache.py / sanitize.py
│       └── llm_redact.py
│
├── archive/              Docs V1-V4 + audit scripts (reference only)
└── .env.example
```

---

## 🔌 API V3 — canonical surface

| Method | Path | Mục đích |
|---|---|---|
| POST | `/api/v1/director/plan` | Layer 1 sync — input brief + refs → trả `DirectorPlan` |
| POST | `/api/v1/director/plan/stream` | Cùng, **SSE stream** stages `init → vision → director → evaluation → complete` |
| POST | `/api/v1/director/storyboard` | Gen Seedream image cho mỗi `storyboard_grid` frame của plan đã approved |
| POST | `/api/v1/director/generate` | **Approved-plan render** (Layer 3) HOẶC auto plan-then-render |
| GET | `/api/v1/director/jobs/{id}` | Poll status (status / progress / current_step / output_path) |
| POST | `/api/v1/director/jobs/{id}/cancel` | Cancel |

### Direct vendor (playground / Studio Direct mode)

| Method | Path | Mục đích |
|---|---|---|
| POST | `/api/v1/video/direct` | Single-call AtlasCloud video |
| POST | `/api/v1/image/direct` | Image gen (Seedream/Flux) |
| POST | `/api/v1/audio/direct` | TTS + SFX |
| POST | `/api/v1/upload` | Local file → atlas-hosted URL |
| POST | `/api/v1/llm/*` | Raw LLM passthrough |

### Legacy (đang giữ tạm để không vỡ tích hợp cũ)

| Method | Path | Trạng thái |
|---|---|---|
| POST | `/api/v1/jobs/ugc` | ⚠️ LEGACY — chỉ chấp nhận Director-approved input (approved_shots + approved_character_sheet). Sẽ xóa sau khi tất cả client move sang `/api/v1/director/generate`. |
| GET / DELETE | `/api/v1/jobs/{id}` | ⚠️ LEGACY status / cancel |

---

## 🎬 Model matrix (AtlasCloud)

| Model | Max refs | Max duration | Native audio | Cost/s | Best for |
|---|---|---|---|---|---|
| Vidu Q3 | 4 | 16s | ❌ | $0.042 | Reference-to-video, product spotlight |
| Vidu Q3 Mix | 4 | 16s | ❌ | $0.046 | Composite scene |
| Wan 2.7 (i2v) | 1 | 8s | ✅ VN lip-sync | $0.060 | Talking head / lip sync |
| Seedance 1.5 Pro | 9 | 15s | ❌ | $0.047 | Time-coded silent shots |
| Seedance 2.0 | 12 | 15s | ✅ | $0.096 | Multi-shot cinematic, premium |
| Seedance 2.0 Fast | 12 | 12s | ✅ | $0.076 | Multi-shot draft / iterate |

User pick model ở `VideoSettings.model`. Director có thể override per-shot qua `Shot.model_routing.preferred_model`.

---

## 🧪 Quickstart — gọi V3 từ curl

```bash
# 1. Lập plan (sync)
curl -X POST http://localhost:8000/api/v1/director/plan \
  -H "Content-Type: application/json" \
  -d '{
    "product_input": { "text_description": "Son lì matte 89k bảng màu nâu đất" },
    "reference_images": [],
    "reference_videos": [],
    "user_brief": "Video TikTok 15s — nữ Gen Z thử son ở bàn make-up, 2 shot showcase + 1 shot review",
    "context_injection": { "pain_points": "son lì dễ bị nẻ môi", "usps": "tinh chất Aloe Vera dưỡng môi" },
    "settings": {
      "audio_mode": "dialogue_vo", "model": "seedance_2_0",
      "duration_s": 15, "aspect_ratio": "9:16", "resolution": "720p"
    },
    "niche_hint": "beauty"
  }' | jq

# 2. Render (truyền full plan đã review hoặc đã edit)
curl -X POST http://localhost:8000/api/v1/director/generate \
  -H "Content-Type: application/json" \
  -d '{
    "plan": { ...full DirectorPlan từ step 1... },
    "reference_images": [],
    "settings": { "audio_mode": "dialogue_vo", "model": "seedance_2_0", "duration_s": 15, "aspect_ratio": "9:16", "resolution": "720p" }
  }' | jq
# → { "job_id": "job_xxxxx", "polling_url": "/api/v1/director/jobs/job_xxxxx", ... }

# 3. Poll
curl http://localhost:8000/api/v1/director/jobs/job_xxxxx | jq
```

---

## 📊 Trạng thái V3

- [x] Director Agent V3 — 1 LLM call → ContinuityBible + Shot List + Storyboard + Eval
- [x] Continuity Manager — validate / normalize / auto-chain / inject Bible into prompts
- [x] Scene Generation Agent — LLM mode + deterministic mode, model-aware format
- [x] Universal Reference binding (role + apply_to_shots)
- [x] Reference Chaining (i2v ← previous last_frame)
- [x] Color consistency FFmpeg pass (Bible-driven)
- [x] Frontend Studio V4 + Director Plan tab review
- [x] SSE streaming `/director/plan/stream`
- [ ] Dramatiq + Redis production queue (hiện inline asyncio.create_task)
- [ ] Postgres + Alembic migrations
- [ ] Cloudflare R2 upload integration (hiện local path)
- [ ] Casso VietQR + Supabase auth
- [ ] E2E test golden flow

---

## Tham khảo

- [`backend/README.md`](backend/README.md) — chi tiết backend, deploy, troubleshooting
- [`backend/system_prompts/director.md`](backend/system_prompts/director.md) — Director system prompt (zero hardcode design)
- [`archive/`](archive/) — docs V1-V4 cũ (read-only)
