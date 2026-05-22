# 🎬 UGC VIETNAM BACKEND v1

> Backend complete cho app UGC AI Vietnam — như Topview Agent V2 + Higgsfield Marketing Studio nhưng tối ưu cho thị trường VN.
> 
> Anh chỉ cần code UI riêng (Electron/Web/Mobile), connect vào backend này qua REST API.

---

## 🏗️ KIẾN TRÚC

```
┌──────────────────────────────────────────────────────────┐
│  FRONTEND (anh tự build sau)                             │
│  Electron / Next.js / React Native                       │
└─────────────────────┬────────────────────────────────────┘
                      │ REST API
                      ▼
┌──────────────────────────────────────────────────────────┐
│  FASTAPI BACKEND (file này)                              │
│  • /api/v1/jobs — tạo job UGC                            │
│  • /api/v1/templates — list 30 templates                 │
│  • /api/v1/avatars — quản lý avatar preset               │
│  • /api/v1/scrape — scrape Shopee/Lazada                 │
└─────────────────────┬────────────────────────────────────┘
                      │
       ┌──────────────┴────────────────┐
       ▼                                ▼
┌─────────────────┐              ┌──────────────────┐
│ AI AGENT V2     │              │ WORKER POOL      │
│ Analyzer +      │              │ Video + TTS +    │
│ Generator       │              │ SFX + Assembly   │
│ (Claude API)    │              │ (dramatiq)       │
└─────────────────┘              └──────────────────┘
       │                                ▼
       │                       ┌──────────────────┐
       └──────────────────────►│ VENDOR APIs      │
                               │ • AtlasCloud     │
                               │ • Anthropic      │
                               │ • VBee TTS VN    │
                               │ • ElevenLabs SFX │
                               └──────────────────┘
```

---

## 📦 CẤU TRÚC THƯ MỤC

```
ugc_vietnam_backend/
├── README.md                       ← File này
├── requirements.txt                ← Python deps
├── .env.example                    ← Template env (paste API keys)
├── docker-compose.yml              ← Docker (optional)
│
├── api/                            ← FastAPI endpoints
│   ├── main.py                     ← App entry point
│   ├── schemas.py                  ← Pydantic models
│   └── routes/
│       ├── jobs.py                 ← /api/v1/jobs CRUD
│       ├── templates.py            ← /api/v1/templates
│       └── avatars.py              ← /api/v1/avatars
│
├── agent/                          ← AI Agent V2 brain ⭐
│   ├── analyzer.py                 ← Step 1: Phân tích product+avatar
│   ├── generator.py                ← Step 2: Gen prompt cuối
│   ├── model_adapter.py            ← Convert sang syntax model
│   └── duration_extender.py        ← Chia/ghép duration
│
├── workers/                        ← Dramatiq background jobs
│   ├── scrape_worker.py            ← Scrape Shopee
│   ├── video_worker.py             ← Call AtlasCloud video
│   ├── tts_worker.py               ← Call VBee TTS VN
│   ├── sfx_worker.py               ← Match SFX library
│   └── assemble_worker.py          ← FFmpeg ghép cuối
│
├── vendors/                        ← Vendor API clients
│   ├── atlascloud.py               ← AtlasCloud (image+video+lipsync)
│   ├── anthropic_client.py         ← Claude wrapper
│   ├── vbee.py                     ← VBee TTS Vietnamese
│   └── elevenlabs_sfx.py           ← ElevenLabs SFX
│
├── prompts/                        ← Claude system prompts ⭐
│   ├── analyzer_system.md          ← Train Analyzer
│   ├── generator_system.md         ← Train Generator
│   └── few_shot_examples.json      ← 5 examples vàng
│
├── templates/                      ← 30 template skeleton ⭐
│   ├── _index.json                 ← List 30 templates
│   ├── S1_unboxing_handcam.json
│   ├── S2_asmr_skincare.json
│   ├── S3_pain_solution.json
│   ├── ... (27 more)
│
├── sfx_library/                    ← 500 sound effects pre-curated
│   ├── _index.json
│   ├── unboxing/
│   ├── skincare/
│   ├── fashion/
│   ├── food/
│   └── tech/
│
├── core/                           ← Utilities
│   ├── config.py                   ← Settings + ENV loader
│   ├── database.py                 ← Postgres + SQLAlchemy
│   ├── storage.py                  ← Cloudflare R2 upload
│   └── utils.py
│
├── db/
│   └── schema.sql                  ← Postgres schema
│
└── scripts/
    ├── test_agent.py               ← Test Agent V2 với YUUMY balo
    └── seed_templates.py           ← Import 30 templates vào DB
```

---

## 🚀 CÀI ĐẶT NHANH (5 PHÚT)

### Bước 1: Clone & install

```bash
cd ugc_vietnam_backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate    # Windows

pip install -r requirements.txt
```

### Bước 2: Đăng ký API + paste key

Anh đăng ký 4 nơi (tổng ~$30-50 nạp test):
- **AtlasCloud** (atlascloud.ai) → Get API key
- **Anthropic** (anthropic.com) → Get API key Claude
- **VBee AIVoice** (vbee.vn) → Get API key
- **ElevenLabs** (elevenlabs.io) → Get API key SFX

Copy `.env.example` → `.env` và paste keys:

```bash
cp .env.example .env
nano .env
```

### Bước 3: Setup database

```bash
# Postgres (Docker hoặc Supabase free tier)
docker run -d --name ugc-postgres \
  -e POSTGRES_PASSWORD=mypass \
  -e POSTGRES_DB=ugc_vn \
  -p 5432:5432 postgres:16

# Migrate schema
psql -h localhost -U postgres -d ugc_vn -f db/schema.sql

# Seed 30 templates
python scripts/seed_templates.py
```

### Bước 4: Run

```bash
# Terminal 1 — FastAPI
uvicorn api.main:app --reload --port 8000

# Terminal 2 — Worker
dramatiq workers --processes 4

# Terminal 3 — Test
python scripts/test_agent.py
```

Mở browser: `http://localhost:8000/docs` → Swagger UI ngay.

---

## 🎯 API ENDPOINTS

### POST `/api/v1/jobs/ugc`

**Tạo job UGC video.**

Request:
```json
{
  "product_input": {
    "url": "https://shopee.vn/Balo-YUUMY-YBA25-Bagsmart"
  },
  "avatar_id": "vn_female_hanoi_22yo_preset",
  "template_id": "S1_unboxing_handcam",
  "settings": {
    "audio_mode": "silent_native",
    "model": "vidu_q3",
    "duration_s": 25,
    "aspect_ratio": "9:16",
    "setting_location": "Hanoi student bedroom"
  }
}
```

Response:
```json
{
  "job_id": "uuid-xxx",
  "status": "pending",
  "estimated_duration_s": 180,
  "estimated_cost_usd": 1.13,
  "polling_url": "/api/v1/jobs/uuid-xxx"
}
```

### GET `/api/v1/jobs/{job_id}`

**Poll status job.**

Response khi đang chạy:
```json
{
  "job_id": "uuid-xxx",
  "status": "rendering",
  "progress": 60,
  "current_step": "video_worker",
  "estimated_remaining_s": 120
}
```

Response khi xong:
```json
{
  "job_id": "uuid-xxx",
  "status": "done",
  "progress": 100,
  "output_url": "https://r2.com/output/uuid-xxx.mp4",
  "thumbnail_url": "https://r2.com/output/uuid-xxx.jpg",
  "duration_s": 25,
  "cost_actual_usd": 1.08
}
```

### GET `/api/v1/templates`

**List 30 templates.**

```json
{
  "templates": [
    {
      "id": "S1_unboxing_handcam",
      "name_vn": "Mở hộp sản phẩm POV",
      "category": "ASMR",
      "tier": "S",
      "default_audio_mode": "silent_native",
      "thumbnail_url": "...",
      "sample_video_url": "..."
    },
    ...
  ]
}
```

### GET `/api/v1/avatars`

**List 50 avatar VN preset.**

```json
{
  "avatars": [
    {
      "id": "vn_female_hanoi_22yo_casual",
      "ethnicity": "Northern Vietnamese",
      "age": 22,
      "gender": "female",
      "style": "Hanoi casual streetwear",
      "image_url": "..."
    },
    ...
  ]
}
```

---

## 🧠 AGENT V2 LOGIC FLOW

Khi user gọi `POST /api/v1/jobs/ugc`:

```
1. API nhận request → tạo job record trong DB → return job_id
2. Trigger worker chain (dramatiq):
   
   ┌─ scrape_worker ─────────────────────────┐
   │   Scrape Shopee/Lazada → product info   │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ analyzer ──────────────────────────────┐
   │   Claude phân tích product + avatar     │
   │   → JSON insight                        │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ generator ─────────────────────────────┐
   │   Claude load template skeleton +       │
   │   fill với insight + setting            │
   │   → Output JSON với generations[]       │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ duration_extender ─────────────────────┐
   │   Chia thành N generation nếu duration  │
   │   > model max (Vidu max 8s, Seedance 15)│
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ video_worker (parallel) ───────────────┐
   │   Call AtlasCloud cho từng generation   │
   │   Gen N+1 dùng last_frame_N làm ref     │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ tts_worker (Mode VO) ──────────────────┐
   │   VBee TTS VN từ script Claude          │
   │   → audio_vn.wav                        │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ sfx_worker (Mode ASMR) ────────────────┐
   │   Match SFX từ library 500 sounds       │
   │   hoặc ElevenLabs SFX gen text-to-sfx   │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ assemble_worker ───────────────────────┐
   │   FFmpeg concat videos + overlay audio  │
   │   + caption ASS burn + BGM lofi -25dB   │
   │   → Output MP4 9:16                     │
   └────────────────┬────────────────────────┘
                    ▼
   ┌─ Upload Cloudflare R2 ──────────────────┐
   │   Update job status = "done"            │
   └─────────────────────────────────────────┘
```

---

## 🎙️ AUDIO MODE — 2 LỰA CHỌN CHÍNH

### Mode 1 — `dialogue_vo` (Lồng tiếng MC)
```
Claude script tiếng Việt → VBee TTS → audio.wav
+
Vidu Q3 silent video
+
FFmpeg overlay audio + caption burn
= MP4 cuối có giọng MC
```

### Mode 2 — `silent_native` / `asmr_macro` (Câm ASMR)
```
Vidu Q3 silent video (không mở miệng nhân vật)
+
SFX library 500 sounds match theo timing
+
FFmpeg multi-track overlay + lofi BGM
= MP4 ASMR aesthetic, không có voice
```

→ **App auto-detect Mode theo template** (Unboxing → ASMR, Pain-Solution → VO).
→ **User override được** từ UI nếu muốn.

---

## 💰 COST PER VIDEO

| Component | Cost |
|---|---|
| Claude Analyzer (cached) | $0.025 |
| Claude Generator (cached) | $0.062 |
| AtlasCloud Vidu Q3 (25s) | $1.05 |
| VBee TTS VN (Mode VO) | $0.001 |
| ElevenLabs SFX (Mode ASMR) | $0.10 |
| FFmpeg local | $0 |
| **TỔNG/video** | **~$1.15-1.25 (~28-31k VND)** |

---

## 🔧 TUNING + CUSTOMIZATION

### Thêm template mới
Tạo file JSON trong `templates/`:
```json
{
  "id": "B5_custom_template",
  "name_vn": "Tên template",
  "category": "Lifestyle",
  "scenes": [...]
}
```

Chạy `python scripts/seed_templates.py` → import vào DB.

### Thêm avatar mới
Upload ảnh → `core/storage.py` → R2.
Insert vào `avatars` table với metadata.

### Refine prompt quality
Sửa `prompts/analyzer_system.md` hoặc `prompts/generator_system.md`.
Restart FastAPI → áp dụng ngay (system prompt cached 5 phút).

### Add new vendor (Aliyun direct rẻ hơn)
Thêm client trong `vendors/aliyun.py` → register trong `agent/model_adapter.py`.

---

## 🚀 DEPLOY PRODUCTION

### Option 1 — VPS Hetzner đơn giản

```bash
# Server Hetzner CX22 ~$4.5/mo
ssh root@your-vps
git clone <repo>
cd ugc_vietnam_backend
docker-compose up -d
```

### Option 2 — Railway/Render (cloud)

```bash
# 1-click deploy với docker-compose.yml
railway up
```

### Option 3 — Self-hosted Docker

```bash
docker build -t ugc-vn .
docker run -p 8000:8000 --env-file .env ugc-vn
```

---

## 🎨 INTEGRATE VỚI UI ANH SẼ BUILD

Khi anh build UI Electron/Next.js, chỉ cần:

```typescript
// frontend/api.ts
const API_BASE = "http://localhost:8000";

async function createJob(data) {
  return fetch(`${API_BASE}/api/v1/jobs/ugc`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json());
}

async function pollJob(jobId) {
  return fetch(`${API_BASE}/api/v1/jobs/${jobId}`)
    .then(r => r.json());
}

// Component
async function handleCreateVideo() {
  const job = await createJob({
    product_input: { url: shopeeUrl },
    avatar_id: selectedAvatar,
    template_id: selectedTemplate,
    settings: { ... }
  });
  
  // Poll every 5s
  const interval = setInterval(async () => {
    const status = await pollJob(job.job_id);
    if (status.status === "done") {
      clearInterval(interval);
      setVideoUrl(status.output_url);
    }
  }, 5000);
}
```

---

## 📚 30 TEMPLATES SẴN SÀNG

Em đã import 30 templates từ research (Topview + Higgsfield + community). Browse:

- **Tier S** (10) — must-have: Unboxing, ASMR Skincare, Mirror Try-On, Kitchen Discovery, ...
- **Tier A** (10) — viral hook: Pain→Solution, POV Confession, Beat-Sync 15-Shot, ...
- **Tier B** (10) — cinematic ad: Hero Product, Luxury Perfume, Motivational, ...

Đầy đủ trong `templates/`. User chọn template từ UI → backend auto-fill.

---

## 🔐 SECURITY NOTES

- API keys NEVER commit Git (đã có .gitignore)
- Cloudflare R2 dùng presigned URL với TTL 24h
- Rate limit per user (default 10 jobs/minute) trong `api/middleware.py`
- HMAC signed webhook callbacks
- Input validation Pydantic strict

---

## 🐛 TROUBLESHOOTING

### "ANTHROPIC_API_KEY not set"
→ Check `.env` file có key chưa, restart server.

### "AtlasCloud 401 Unauthorized"
→ Verify API key tại atlascloud.ai/dashboard.

### "VBee TTS sai diacritic"
→ Test giọng khác trong `vendors/vbee.py` config (`voice_code`).

### Worker treo
→ Restart: `docker-compose restart workers`

---

## 📞 SUPPORT

Có bug/feature request → ghi vào `ISSUES.md`.

Em sẽ update code khi anh cần thêm vendor (Aliyun direct, fal.ai backup, etc).

---

**TỔNG KẾT:**
- Backend này = **AI brain + worker chain + REST API**.
- Anh chỉ cần build UI (Electron/Web) gọi vào REST API.
- Train prompt = sửa file `prompts/*.md` (no fine-tune).
- 30 templates sẵn sàng.
- Cost ~28k VND/video.
- Deploy 5 phút.
