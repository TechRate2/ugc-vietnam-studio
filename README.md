# UGC Vietnam — AI Video Studio

App AI video UGC tối ưu thị trường Việt Nam. Paste link Shopee/Lazada hoặc mô tả sản phẩm → ra video TikTok 9:16 tiếng Việt trong 2-4 phút.

> Monorepo: Next.js frontend + FastAPI backend trong cùng 1 source.

---

## Kiến trúc

```
ai-studio-hub/
├── app/                Next.js 14 App Router (UI + proxy API routes)
├── components/         React components (studio, atlas-form, …)
├── lib/                TS shared (backend-client, types, hooks, model-config)
├── public/             Static assets
│
├── backend/            FastAPI Python (Agent V2 + workers + vendors)
│   ├── api/            Routes + Pydantic schemas
│   ├── agent/          Analyzer (Claude Vision) + Generator router 4 model
│   ├── prompts/        System prompts per model
│   ├── templates/      30 template skeletons
│   ├── vendors/        AtlasCloud, GenMax (TTS), VBee (fallback), ElevenLabs, Anthropic clients
│   │                   + tts_router.py route theo TTS_PROVIDER
│   ├── workers/        Dramatiq tasks (scrape, render, audio, assemble)
│   └── scripts/        test_agent.py
│
├── archive/            Docs V1-V4 + legacy audit scripts (reference only)
└── .env.example        Unified env template
```

---

## Setup nhanh

### 1. Cài deps

```bash
# Node
npm install

# Python
npm run backend:install
# hoặc: cd backend && pip install -r requirements.txt
```

### 2. Env

```bash
cp .env.example .env.local
# Paste API keys: ANTHROPIC_API_KEY, ATLASCLOUD_API_KEY, GENMAX_API_KEY, ELEVENLABS_API_KEY
# (VBEE_API_KEY optional — chỉ cần nếu đặt TTS_PROVIDER=vbee)
```

> `.env.local` được cả Next.js (auto) và FastAPI đọc (qua python-dotenv với `env_file=".env.local"`).

### 3. Chạy

```bash
# Chạy cả 2 song song
npm run dev:all

# Hoặc tách riêng 2 terminal
npm run dev:frontend   # → http://localhost:3000
npm run dev:backend    # → http://localhost:8000  (Swagger: /docs)
```

---

## Flow Agent V2

```
User input (link Shopee + ý tưởng + refs + model + audio mode)
        ↓
Analyzer (Claude Vision) — phân tích product + ref → JSON insight + AI tự pick template
        ↓
Generator Router — system prompt riêng theo model:
  ├─ Seedance 2.0 → S1/S2/S3 time-coded
  ├─ Wan 2.7 → continuous + audio-driven VN lip-sync
  ├─ Vidu Q3 → reference-to-video detailed
  └─ Seedance 1.5 Pro → silent shots
        ↓
Render Pipeline — AtlasCloud video + GenMax TTS (VBee fallback) / ElevenLabs SFX + FFmpeg assemble
        ↓
MP4 9:16 upload R2
```

---

## Endpoint chính

Frontend Next.js proxy → Backend Python (cùng path):

| Endpoint | Method | Mục đích |
|---|---|---|
| `/api/v1/jobs` | POST | Tạo UGC job |
| `/api/v1/jobs/{id}` | GET | Poll status |
| `/api/v1/jobs/{id}` | DELETE | Cancel |
| `/api/v1/templates` | GET | List 30 templates |
| `/api/v1/avatars` | GET | List 50 avatar VN |

Schema source of truth: [`backend/api/schemas.py`](backend/api/schemas.py). Mirror TS: [`lib/types/backend.ts`](lib/types/backend.ts).

---

## Model matrix

| Model | Max refs | Max duration | Cost/s | Syntax |
|---|---|---|---|---|
| Vidu Q3 | 4 | 16s | $0.042 | Reference-to-video |
| Wan 2.7 | 9 (3×3 grid) | 8s | $0.10 | Audio-driven VN |
| Seedance 1.5 Pro | 9 | 15s | $0.047 | Silent shots only |
| Seedance 2.0 | 12 | 15s | $0.096 | S1/S2/S3 time-coded |

Config sync: [`lib/studio/model-config.ts`](lib/studio/model-config.ts) ↔ [`backend/agent/model_adapter.py`](backend/agent/model_adapter.py).

---

## Trạng thái

- [x] Frontend Studio V4 compact (1-card kiểu Topview Agent V2)
- [x] Backend FastAPI Agent V2 (Analyzer + 4 Generator router)
- [x] Schema TS ↔ Pydantic sync
- [x] Proxy `/api/v1/*` Next.js → FastAPI
- [ ] 29 template skeleton JSON còn lại (hiện 1/30: S1_unboxing_handcam)
- [ ] Worker chain hoàn chỉnh (scrape/video/tts/sfx) — hiện chỉ có assemble
- [ ] Postgres persist + Alembic migrations
- [ ] Cloudflare R2 upload integration
- [ ] Dramatiq task dispatch
- [ ] Docker Compose 1-click
- [ ] Casso VietQR payment + Supabase auth
- [ ] Test E2E thực tế (YUUMY balo + API key thật)

---

## Tham khảo

- [`backend/README.md`](backend/README.md) — chi tiết backend (deploy, troubleshooting)
- [`archive/`](archive/) — docs V1-V4 + script audit cũ (đừng dùng, giữ lịch sử)
