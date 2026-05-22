# 🎯 STUDIO V3 — LOGIC ĐÚNG NHƯ TOPVIEW AGENT V2 + HIGGSFIELD

> Anh CHỈ RA ĐIỂM SAI: template KHÔNG nên cho user chọn, AI tự pick từ analysis.
> Em đã redesign theo CHUẨN logic của Topview/Higgsfield.

---

## ⚠️ TRƯỚC (SAI) vs SAU (ĐÚNG)

### ❌ TRƯỚC — Em design sai
```
STEP 1: Sản phẩm
STEP 2: Chọn 1 trong 30 templates  ← USER PHẢI CHỌN
STEP 3: Nhân vật
STEP 4: Settings
STEP 5: Generate
```
→ User confuse vì phải scroll qua 30 cards.
→ KHÔNG đúng cách Topview/Higgsfield làm.

### ✅ SAU — Logic ĐÚNG (như Topview Agent V2)

```
STEP 1: Sản phẩm + Ý tưởng (text + link Shopee + mô tả)
STEP 2: Upload ảnh tham chiếu (số lượng TÙY MODEL chọn)
STEP 3: CHỌN MODEL TRƯỚC ← cốt lõi
STEP 4: Audio mode + Duration + Aspect ratio
STEP 5: Generate
   ↓
AI Backend TỰ:
- Phân tích sản phẩm + ảnh ref
- TỰ chọn template phù hợp nhất
- Generate prompt theo CHUẨN SYNTAX của model đã chọn
```

→ User KHÔNG cần biết template gì. AI tự pick.
→ Mỗi model có **cấu trúc prompt riêng**, em build 4 system prompts riêng.

---

## 📐 4 MODEL — 4 CẤU TRÚC PROMPT KHÁC NHAU

### 1️⃣ Seedance 2.0 — Multi-shot Time-coded

```
Max files: 12 (9 images + 3 videos + 3 audio)
Max duration: 15s/gen
Syntax: S1/S2/S3 time-coded
```

**Cấu trúc:**
```
[Style]
Shot 1 [0-5s]: Camera... Subject... Action... Lighting...
Shot 2 [5-10s]: ...
Shot 3 [10-15s]: ...
@Image1: product
@Image2: outfit
@Character1: face lock
```

### 2️⃣ Wan 2.7 — Audio-Driven Continuous

```
Max images: 9 (3×3 grid synthesis)
Max duration: 8s/gen
Syntax: Continuous narrative + audio-driven
```

**Cấu trúc:**
```
[Style]
Scene description: <continuous flow all events>
Camera: <single dominant move>
Audio-driven mode: ACTIVE
Audio sync: <VN dialogue audio.wav>
Reference grid 9 images: angles + lighting + positions
```

### 3️⃣ Vidu Q3 — Reference-to-Video

```
Max images: 1-4 (BẮT BUỘC ít nhất 1)
Max duration: 16s/gen
Syntax: Detailed scene description (NO @Image syntax)
```

**Cấu trúc:**
```
[Detailed scene description với specific everything]
Camera: <movement>
Lighting: <atmosphere>
Atmosphere: <emotional tone>
```
→ Vidu Q3 đọc ảnh upload làm anchor, prompt KHÔNG dùng @Image.

### 4️⃣ Seedance 1.5 Pro — Silent Multi-Ref

```
Max images: 9
Max duration: 15s/gen
Syntax: Shot list SILENT ONLY (no audio gen)
```

**Cấu trúc:**
```
[Style]
Silent video, no dialogue.
- Shot 1 [0-4s]: ...
- Shot 2 [4-8s]: ...
- Shot 3 [8-12s]: ...
Reference images: <how 1-9 map to scenes>
```

---

## 🔄 FLOW MỚI (LOGIC ĐÚNG)

```
USER INPUT
   ├─ Ý tưởng/text + Link Shopee
   ├─ Upload ảnh tham chiếu (1-12 ảnh tùy model)
   ├─ Chọn MODEL ← quyết định max_refs + syntax
   ├─ Chọn audio_mode
   └─ Chọn duration + aspect
           ↓
   ┌────────────────────────────────────┐
   │ STEP A: ANALYZER AGENT (Claude)    │
   │ - Phân tích sản phẩm                │
   │ - Phân tích từng ảnh upload         │
   │ - Suggest emotion arc + setting     │
   │ → Output JSON insight               │
   └────────────────────────────────────┘
           ↓
   ┌────────────────────────────────────┐
   │ STEP B: TEMPLATE AUTO-PICKER        │
   │ AI tự match insight với:            │
   │ - Product category                  │
   │ - Audio mode                        │
   │ - Model selected                    │
   │ → Tự chọn template SKELETON         │
   │   (user KHÔNG cần biết)             │
   └────────────────────────────────────┘
           ↓
   ┌────────────────────────────────────┐
   │ STEP C: MODEL-SPECIFIC GENERATOR    │
   │ Route theo model:                   │
   │ - Seedance 2.0 → S1/S2/S3 syntax    │
   │ - Wan 2.7 → continuous + audio-drv  │
   │ - Vidu Q3 → reference-to-video      │
   │ - Seedance 1.5 Pro → silent shots   │
   │ → Output prompt CUỐI                │
   └────────────────────────────────────┘
           ↓
   ┌────────────────────────────────────┐
   │ STEP D: RENDER PIPELINE             │
   │ AtlasCloud → MP4                     │
   └────────────────────────────────────┘
```

---

## 🎨 UI STUDIO V3 — STEP STRUCTURE MỚI

```
┌──────────────────────────────────────────────┐
│ STEP 1: Ý TƯỞNG + SẢN PHẨM                  │
│ [Paste link Shopee]                          │
│ [Mô tả ý tưởng/sản phẩm text]                │
│ [Upload ảnh sản phẩm]                        │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ STEP 2: MODEL AI                             │
│ ⦿ Vidu Q3 (rẻ nhất, 1-4 ảnh ref)            │
│ ○ Wan 2.7 (lip-sync VN, max 9 ảnh)          │
│ ○ Seedance 1.5 Pro (silent, max 9 ảnh)      │
│ ○ Seedance 2.0 (cao cấp, max 12 files)      │
│                                              │
│ Mỗi model có syntax + max refs khác nhau    │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ STEP 3: ẢNH THAM CHIẾU (max thay đổi tùy model) │
│                                              │
│ Đã chọn Vidu Q3 → max 4 ảnh                  │
│ [Upload 1] [Upload 2] [Upload 3] [Upload 4]  │
│                                              │
│ Đã chọn Seedance 2.0 → max 12 files          │
│ [Upload 1..9 images] [Video 1..3] [Audio]   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ STEP 4: SETTINGS                             │
│ Audio mode: Câm/Lồng tiếng/ASMR              │
│ Duration: 5-16s (tùy model max)              │
│ Aspect: 9:16 / 16:9 / 1:1                   │
│                          Cost: 28.000đ       │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│       ✨ TẠO VIDEO (AI tự pick template)    │
└──────────────────────────────────────────────┘
```

---

## 📦 FILES MỚI EM TẠO

### Backend (Python)

| File | Mục đích |
|---|---|
| `prompts/generators/seedance_2_0_system.md` | System prompt RIÊNG Seedance 2.0 (S1/S2/S3 syntax) |
| `prompts/generators/wan_2_7_system.md` | System prompt RIÊNG Wan 2.7 (audio-driven continuous) |
| `prompts/generators/vidu_q3_system.md` | System prompt RIÊNG Vidu Q3 (reference-to-video) |
| `prompts/generators/seedance_1_5_pro_system.md` | System prompt RIÊNG Seedance 1.5 Pro (silent shots) |
| `agent/generator.py` | **UPDATED**: route theo model |
| `agent/model_adapter.py` | **UPDATED**: max_refs chuẩn (Vidu=4, Wan=9, S1.5=9, S2.0=12) |

### Frontend (TypeScript)

| File | Mục đích |
|---|---|
| `lib/studio/model-config.ts` | Config max_refs + features per model (sync backend) |

→ Em chưa rebuild Studio UI vì task lớn. Sẽ làm tiếp khi anh confirm logic ĐÚNG.

---

## 🚀 NEXT — ANH CONFIRM

Em đã build:
- ✅ 4 model-specific system prompts theo CHUẨN OFFICIAL từng model
- ✅ Generator router theo model
- ✅ Model adapter với max_refs đúng (Vidu=4, Wan=9, S1.5=9, S2.0=12)
- ✅ Frontend model-config types

**Cần làm tiếp (sau khi anh OK logic):**

🅰️ **Redesign Studio UI** theo logic mới — bỏ template picker, thêm model selector + reference uploader dynamic count. **2-3 giờ.**

🅱️ **Build Analyzer V2** — phân tích thêm ẢNH tham chiếu (vision API) thay vì chỉ text. **1-2 giờ.**

🅲️ **Test E2E** với 4 model — gen 4 video YUUMY balo, mỗi model 1 video, verify prompt structure đúng chuẩn. **1 giờ + API key.**

🅳️ **Documentation chi tiết** — write full guide cho user hiểu vì sao mỗi model cần input khác nhau. **30 phút.**

Em recommend **🅰️ trước** (redesign UI) → **🅒** (test e2e verify quality). Anh confirm?
