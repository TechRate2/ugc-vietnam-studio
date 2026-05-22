# 🎨 STUDIO REDESIGN GUIDE — Anh hiểu app hoạt động như nào

> Em vừa redesign toàn diện phần Studio. File này giải thích từng phần để anh hiểu rõ.

---

## 🆚 SO SÁNH TRƯỚC VÀ SAU

### ❌ TRƯỚC (rối loạn)

- 24 video cards bên dưới Hero có button "Dùng template này" → user click thì fill prompt
- Khi user click "Generate", BACKEND không biết template nào để dùng → phải GUESS qua label string mapping
- KHÔNG có nơi xem 30 templates BACKEND em đã train
- KHÔNG có settings rõ ràng cho audio_mode / model / duration
- User không biết video sẽ tốn bao nhiêu, dài bao nhiêu, dùng AI nào

### ✅ SAU (rõ ràng)

- 24 video cards → **Inspiration Gallery** (chỉ hover xem, KHÔNG còn button)
- Form 5 STEP từ trên xuống dưới — user theo thứ tự là xong:
  - **Bước 1:** Nhập sản phẩm (link/text/ảnh)
  - **Bước 2:** Click button mở Modal chọn 1 trong 30 templates BACKEND
  - **Bước 3:** Chọn nhân vật (50 avatar VN preset hoặc upload)
  - **Bước 4:** Setting nâng cao (4 thứ: audio mode, model, duration, aspect)
  - **Bước 5:** Tinh chỉnh prompt (optional)
- Button **TẠO VIDEO NGAY** to ở dưới + cost VND realtime + thời gian ước

---

## 📐 STUDIO FLOW MỚI (cấu trúc visual)

```
┌──────────────────────────────────────────────────────┐
│  HERO: "Biến mọi sản phẩm thành video ad"           │
│  "5 bước đơn giản. AI tự làm hết trong 2-4 phút."   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ Bước 1: Sản phẩm ──────────────────────────┐   │
│  │ [Paste link Shopee]                          │   │
│  │ [Hoặc mô tả text]                            │   │
│  │ [Hoặc upload ảnh] ──→ 96x96 thumbnail        │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Bước 2: Chọn template ─────────────────────┐   │
│  │ Đã chọn: 🎯 ASMR Unboxing (Tier S - ASMR)   │   │
│  │ [📋 Chọn từ 30 templates →]                  │   │
│  │ ── click mở MODAL với 30 cards có filter ── │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Bước 3: Nhân vật ──────────────────────────┐   │
│  │ [80x80 Upload]   [Hoặc dropdown 50 preset]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Bước 4: Setting (expandable) ──────────────┐   │
│  │ ▼ Audio: Câm + ASMR / Lồng tiếng / ASMR      │   │
│  │   Model: Vidu Q3 / Wan 2.7 / Seedance 1.5/2 │   │
│  │   Duration: 15 / 25 / 30 / 45 / 60s          │   │
│  │   Aspect: 9:16 / 16:9 / 1:1                 │   │
│  │   Voice (nếu Mode VO): 5 giọng VN dropdown  │   │
│  │ ────────────────────────  Cost: 28.000đ     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─ Bước 5: Prompt (optional) ─────────────────┐   │
│  │ [Rich prompt editor — bỏ trống AI tự viết]  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │   ✨ TẠO VIDEO NGAY · 28.000đ · ~2-4 phút   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
├──────────────────────────────────────────────────────┤
│  👁️ CẢM HỨNG TỪ VIDEO MẪU (chỉ xem, KHÔNG action)   │
│  [24 video cards hover play — KHÔNG button]         │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 PHẦN 1 — TEMPLATE PICKER MODAL (cốt lõi nhất)

Khi click button **"Bước 2: Chọn template"**, modal mở ra:

```
┌────────────────────────────────────────────────────────────┐
│ Bước 2 / Step 2                                       [X]  │
│ Chọn template video                                        │
│ 30 templates AI đã train — chọn cái phù hợp nhất          │
├────────────────────────────────────────────────────────────┤
│ 🔍 [Tìm template...]  [Tất cả] [Tier S] [Tier A] [Tier B] │
│                       [Câm ASMR] [Lồng tiếng] [ASMR Macro]│
├────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─ Tier S · Must-have UGC VN     25s ──┐                  │
│ │ Mở hộp sản phẩm POV                  │                  │
│ │ Hand-cam Unboxing                    │                  │
│ │ 🔇 Câm + ASMR    9:16                │                  │
│ │ #Affiliate Shopee #PR haul #Aesthetic│                  │
│ └──────────────────────────────────────┘                  │
│                                                             │
│ ┌─ Tier S · Must-have UGC VN     15s ──┐                  │
│ │ ASMR Skincare Macro                  │                  │
│ │ 🔉 ASMR Macro    9:16                │                  │
│ │ #Mỹ phẩm #Beauty premium             │                  │
│ └──────────────────────────────────────┘                  │
│                                                             │
│ ┌─ Tier S · Must-have UGC VN     12s ──┐                  │
│ │ Phản ứng nếm thử bếp                 │                  │
│ │ 🎤 Lồng tiếng VN    9:16             │                  │
│ │ #Đồ ăn #F&B review                   │                  │
│ └──────────────────────────────────────┘                  │
│                                                             │
│ ... (30 templates tổng)                                    │
└────────────────────────────────────────────────────────────┘
```

**Mỗi card hiển thị:**
- Tier (S/A/B) với màu khác nhau (vàng/đỏ/tím)
- Tên VN + EN
- Duration mặc định
- Audio mode (🔇 Câm / 🎤 VO / 🔉 ASMR)
- Use cases VN

**Filter:**
- Tìm theo tên
- Lọc theo Tier (S=must-have, A=viral, B=cinematic)
- Lọc theo Audio mode

**Khi click 1 template:**
- Tự động set audio_mode, duration, aspect_ratio match template default
- Modal đóng
- Button Bước 2 hiện tên template đã chọn

---

## 🎛️ PHẦN 2 — SETTINGS PANEL (4 settings expandable)

Khi click vào "Bước 4: Setting nâng cao", panel mở ra:

### 🎙️ Audio Mode (3 lựa chọn)

| Mode | Mô tả | When |
|---|---|---|
| **🔇 Câm + ASMR** ⭐ recommend | Không voice — tiếng môi trường + nhạc nền | Unboxing, lifestyle aesthetic, viral #NoTalkingASMR |
| **🎤 Lồng tiếng Việt** | Giọng MC tiếng Việt đè lên video | Tutorial, review pain solution, comparison |
| **🔉 ASMR Macro** | Cận cảnh + tiếng sản phẩm chi tiết | Mỹ phẩm, đồ ăn, beauty premium |

### 🎥 Model AI (4 lựa chọn)

| Model | Mô tả | Giá |
|---|---|---|
| **Vidu Q3** | Rẻ nhất, intelligent camera | $0.042/s |
| **Wan 2.7** | Audio-driven khớp môi tiếng Việt | $0.10/s |
| **Seedance 1.5 Pro** | Silent only, multi-ref 9 ảnh | $0.047/s |
| **Seedance 2.0** | Cao cấp nhất, multi-shot native | $0.096/s |

### ⏱️ Duration: 15s / 25s / 30s / 45s / 60s

Note: nếu duration > max của model, app **tự chia + ghép liền mạch** (continuity ref).

### 📐 Aspect Ratio: 9:16 (TikTok) / 16:9 (YouTube) / 1:1 (IG)

### 🎤 Voice Persona (chỉ hiện khi Mode = Lồng tiếng)

Dropdown 5 giọng VBee VN preset:
- Nữ Hà Nội 22 - Trẻ trung
- Nữ Hà Nội 28 - Ấm áp
- Nữ Sài Gòn 25 - Ngọt ngào
- Nam Hà Nội 30 - Chuyên gia
- Nam Sài Gòn 28 - Casual

---

## 🖼️ PHẦN 3 — INSPIRATION GALLERY (đã bỏ button)

24 video cards bên dưới đã được redesign:

**Trước:**
- Có button "Dùng template này" → click thì auto fill prompt → confused user

**Sau:**
- Chỉ là **video preview** hover play
- Top right có badge `👁️ Demo` (không phải template thật)
- Không button, không action
- Mục đích: cho user thấy **các phong cách video AI có thể tạo ra** để inspire

---

## 🧠 EM ĐÃ TÍCH HỢP GÌ — TÓM TẮT

### Backend Python (`C:\Users\Admin\Downloads\ugc_vietnam_backend\`)

1. **Analyzer Agent** (Claude) — phân tích sản phẩm + nhân vật → JSON insight
2. **Generator Agent** (Claude) — fill template skeleton với insight → prompt cuối
3. **30 Template Skeleton** (JSON files) — sườn cấu trúc cho mỗi loại video
4. **Model Adapter** — convert prompt sang syntax từng model (Vidu/Wan/Seedance)
5. **Duration Extender** — chia + ghép nếu duration > model max
6. **API Endpoints** FastAPI:
   - POST `/api/v1/jobs/ugc` — tạo job
   - GET `/api/v1/jobs/{id}` — poll status
   - GET `/api/v1/templates` — list 30 templates
   - GET `/api/v1/avatars` — list 50 avatars

### Frontend Next.js (`C:\Users\Admin\Desktop\ai-studio-hub\`)

1. **Backend Client** (`lib/backend-client.ts`) — fetch Python backend
2. **TypeScript Types** (`lib/types/backend.ts`) — match Pydantic schemas
3. **React Hook** (`lib/studio/use-generate-job.ts`) — tạo job + polling 3s/lần
4. **Next.js API Proxies** (`app/api/v1/*`) — forward request đến Python
5. **TemplatePickerModal** ⭐ — UI chọn 30 templates với filter
6. **SettingsPanel** ⭐ — UI 4 settings expandable
7. **JobResultModal** — modal hiện progress + video MP4 cuối
8. **StudioMain redesigned** ⭐ — 5 STEP flow rõ ràng
9. **GenerateFormats refactored** — inspiration gallery (bỏ button)

---

## 🔄 FLOW THỰC SỰ XẢY RA KHI USER CLICK "TẠO VIDEO"

```
1. User click button TẠO VIDEO NGAY
   ↓
2. Frontend StudioMain.handleGenerate gọi POST /api/v1/jobs
   Payload: {
     product_input: { url, text, image_urls },
     avatar_id: "vn_female_hanoi_22yo_casual",
     template_id: "S1_unboxing_handcam",
     settings: { audio_mode, model, duration_s, aspect_ratio }
   }
   ↓
3. Next.js API route /api/v1/jobs proxy đến Python backend
   ↓
4. Python backend tạo job_id, return ngay
   ↓
5. Frontend nhận job_id, bắt đầu polling /api/v1/jobs/{id} mỗi 3s
   ↓
6. Backend chạy background:
   a. Analyzer Claude phân tích product + avatar → JSON insight
   b. Load template skeleton (S1_unboxing_handcam.json)
   c. Generator Claude fill skeleton + apply SLCT + 6 Ingredients
   d. Model Adapter convert sang syntax model (Vidu Q3)
   e. Duration Extender chia 25s thành 3 gen × 8.3s
   f. Gọi AtlasCloud Vidu Q3 3 lần liên tiếp với continuity ref
   g. (Mode VO) Gọi VBee TTS Vietnamese
   h. (Mode ASMR) Gọi ElevenLabs SFX
   i. FFmpeg ghép videos + audio + caption ASS burn
   j. Upload MP4 lên Cloudflare R2
   ↓
7. Khi status=done, Frontend hiện JobResultModal với MP4 + download
```

---

## 📊 COST REALTIME (tính trong SettingsPanel)

```typescript
const videoCost = modelInfo.cost_per_s * settings.duration_s;
const claudeCost = 0.087;       // Analyzer + Generator (cached 90%)
const audioCost = settings.audio_mode === 'dialogue_vo' ? 0.01 : 0.1;
const totalUsd = videoCost + claudeCost + audioCost;
const totalVnd = Math.round(totalUsd * 24500);
```

Ví dụ:
- Vidu Q3 + 25s + Câm ASMR = $0.042 × 25 + $0.087 + $0.10 = $1.237 ≈ **30.300đ**
- Wan 2.7 + 15s + Lồng tiếng = $0.10 × 15 + $0.087 + $0.01 = $1.597 ≈ **39.100đ**
- Seedance 2.0 + 30s + ASMR = $0.096 × 30 + $0.087 + $0.10 = $3.067 ≈ **75.100đ**

---

## ✅ CHECKLIST AN TÂM

| Tính năng | Status |
|---|---|
| Form 5 STEP rõ ràng | ✅ |
| Template Picker Modal với filter Tier/Audio | ✅ |
| Settings Panel expandable + cost VND realtime | ✅ |
| 24 inspiration cards (bỏ button "Dùng template") | ✅ |
| Avatar dropdown 5 preset + upload custom | ✅ |
| Voice persona picker khi Mode VO | ✅ |
| Backend integration (POST jobs, GET poll) | ✅ |
| Job progress modal với cancel + download | ✅ |
| Error handling tiếng Việt | ✅ |
| Mobile responsive cơ bản | ✅ |
| 30 template skeleton fallback (nếu API chưa response) | ✅ |

---

## 🚀 CHẠY THỬ NGAY

```bash
# Terminal 1 — Backend
cd C:\Users\Admin\Downloads\ugc_vietnam_backend
venv\Scripts\activate
uvicorn api.main:app --reload --port 8000

# Terminal 2 — Frontend
cd C:\Users\Admin\Desktop\ai-studio-hub
npm run dev

# Browser
http://localhost:3000/studio
```

→ Anh sẽ thấy form 5 STEP rõ ràng + button "Chọn từ 30 templates" + cost VND realtime.

---

## ❓ ANH CÒN CHƯA HIỂU PHẦN NÀO?

Nói cho em phần cụ thể nào còn rối, em giải thích/sửa tiếp.
