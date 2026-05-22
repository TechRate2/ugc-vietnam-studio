# ✅ STUDIO V3 BUILD HOÀN TẤT — Logic đúng như Topview Agent V2

> Anh đã confirm logic V3. Em build xong frontend redesign + backend Analyzer V2 vision.

---

## 🎯 LOGIC MỚI (chính xác như Topview/Higgsfield)

```
USER INPUT
  ├─ STEP 1: Ý tưởng + sản phẩm (link/text/ảnh)
  ├─ STEP 2: CHỌN MODEL ← quyết định max_refs + syntax prompt
  ├─ STEP 3: UPLOAD ẢNH THAM CHIẾU (count tùy model)
  └─ STEP 4: Settings (audio/duration/aspect)
        ↓
  ┌──────────────────────────────────────┐
  │ ANALYZER V2 (Claude Vision)          │
  │ - Phân tích product info             │
  │ - Phân tích TỪNG ảnh ref (vision)   │
  │ - Suggest role cho mỗi ảnh           │
  │ - TỰ pick template phù hợp           │
  │ - Output JSON insight phong phú      │
  └──────────────────────────────────────┘
        ↓
  ┌──────────────────────────────────────┐
  │ GENERATOR ROUTER theo model:         │
  │ - Seedance 2.0 → S1/S2/S3 syntax    │
  │ - Wan 2.7 → continuous + audio-drv  │
  │ - Vidu Q3 → reference-to-video      │
  │ - Seedance 1.5 Pro → silent shots   │
  └──────────────────────────────────────┘
        ↓
   RENDER → MP4
```

---

## 📦 FILES MỚI

### Frontend

| File | Mục đích |
|---|---|
| `components/studio/ModelSelector.tsx` | **MỚI** — 4 model cards với max_refs/cost/best_for hiển thị rõ |
| `components/studio/ReferenceImagesUploader.tsx` | **MỚI** — Upload dynamic count slots (4/9/9/12) theo model |
| `components/studio/StudioMain.tsx` | **REDESIGN** — 4 STEP flow: Idea → Model → Refs → Settings |
| `lib/types/backend.ts` | **UPDATE** — Add `reference_images[]` vào CreateJobRequest |

### Backend

| File | Mục đích |
|---|---|
| `prompts/analyzer_system.md` | **REWRITE V2** — Vision + auto-pick template |
| `agent/analyzer.py` | **REWRITE V2** — Multi-image vision API call |
| `api/schemas.py` | **UPDATE** — `reference_images` array, `template_id` optional |
| `prompts/generators/seedance_2_0_system.md` | Đã build (S1/S2/S3 syntax) |
| `prompts/generators/wan_2_7_system.md` | Đã build (audio-driven continuous) |
| `prompts/generators/vidu_q3_system.md` | Đã build (reference-to-video, max 4) |
| `prompts/generators/seedance_1_5_pro_system.md` | Đã build (silent shots) |
| `agent/generator.py` | Đã build (router theo model) |

---

## 🎨 UI FLOW MỚI

```
┌─ STEP 1: Ý TƯỞNG + SẢN PHẨM ────────────────────┐
│ [Paste link Shopee/Lazada]                       │
│ [💡 Mô tả ý tưởng + sản phẩm text]              │
│ [Upload ảnh sản phẩm 96x96]                     │
└──────────────────────────────────────────────────┘

┌─ STEP 2: CHỌN MODEL AI ─────────────────────────┐
│ ⚡ Vidu Q3        Max 4 ảnh | 16s | 25k/10s      │
│   Reference-to-video, multi-entity              │
│   👍 RECOMMENDED                                 │
│                                                  │
│ ✨ Wan 2.7        Max 9 ảnh | 8s | 50k/10s       │
│   Audio-driven lip-sync VN                      │
│                                                  │
│ 🖼️ Seedance 1.5  Max 9 ảnh | 15s | 30k/10s      │
│   Silent only, b-roll ASMR                      │
│                                                  │
│ 💎 Seedance 2.0   Max 12 files | 15s | 70k/10s  │
│   Multi-shot cao cấp S1/S2/S3                   │
└──────────────────────────────────────────────────┘

┌─ STEP 3: ẢNH THAM CHIẾU (3 / 4 vd Vidu) ────────┐
│ ℹ️ Vidu Q3: Upload 1-4 ảnh subject+product+...   │
│                                                  │
│ [📤 Upload nhiều ảnh cùng lúc]                   │
│                                                  │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐                    │
│ │ ✓  │ │ ✓  │ │ ✓  │ │ +  │                    │
│ │SUB │ │PROD│ │SET │ │ADD │                    │
│ └────┘ └────┘ └────┘ └────┘                    │
└──────────────────────────────────────────────────┘

┌─ STEP 4: SETTINGS (expandable) ─────────────────┐
│ ▼ Audio: Câm/VO/ASMR                            │
│   Duration: 5-16s (slider tùy model max)        │
│   Aspect: 9:16 / 16:9 / 1:1                    │
│   Voice persona (nếu VO)                        │
│                          Cost: 28.000đ          │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│   ✨ TẠO VIDEO · 28.000đ · ~2-4 phút            │
│   AI sẽ tự pick template phù hợp với Vidu Q3    │
└──────────────────────────────────────────────────┘
```

---

## 🧠 ANALYZER V2 — VISION API

Em đã build Analyzer V2 dùng Claude Vision:

```python
# agent/analyzer.py
def analyze(
    product_input: dict,
    reference_images: list[str],    # 1-12 ảnh (base64 hoặc URL)
    model: str,
    audio_mode: str,
    duration_s: int,
):
    """Multi-image vision analysis."""
    content_blocks = [{"type": "text", "text": user_text}]
    
    for img_url in reference_images:
        if img_url.startswith("data:image"):
            # base64 data URL
            content_blocks.append({
                "type": "image",
                "source": {"type": "base64", ...},
            })
        else:
            # External URL
            content_blocks.append({
                "type": "image",
                "source": {"type": "url", "url": img_url},
            })
    
    # Call Claude vision với multi-image
    response = claude_client.messages.create(
        model="claude-sonnet-4-6",
        messages=[{"role": "user", "content": content_blocks}],
        system=[{"text": ANALYZER_V2_SYSTEM, "cache_control": ...}],
    )
```

**Output bao gồm:**
- `product` insight (giống V1)
- `reference_analysis[]` — TỪNG ảnh phân tích role + content + VN context
- `auto_picked_template` — AI tự chọn template phù hợp + giải thích lý do
- `creative_recommendations` — emotion arc + setting + camera + key message

---

## 🎯 ĐIỂM NỔI BẬT

### 1. Reference Uploader DYNAMIC theo model

User chọn model trước → uploader hiện đúng số slot:
- Vidu Q3 → 4 slots với hint "Subject chính / Sản phẩm / Setting / Detail"
- Wan 2.7 → 9 slots với hint "Avatar 3 angles / Setting 2 / Lighting 2 / Product / Outfit"
- Seedance 1.5 Pro → 9 slots silent context
- Seedance 2.0 → 12 slots với @Image1/@Character1/@Video1 hints

### 2. Bulk upload + drag-drop

User có thể upload 1 lần nhiều ảnh, app tự fill các slot.

### 3. Cost VND realtime

Mỗi khi đổi model/duration → cost VND update ngay trên ModelSelector cards + Settings panel.

### 4. Validation rõ

- Phải có >= 1 ảnh ref
- Phải có 1 trong 3 (link/text/ảnh sản phẩm)
- Nếu không pass → warning vàng + button disable

### 5. AI tự pick template

User KHÔNG cần biết template nào. Backend Analyzer V2 tự pick + return:
- `template_id` để Generator dùng
- `reason_vn` giải thích lý do (có thể hiện cho user xem)

---

## 🚀 CHẠY THỬ

```bash
# Terminal 1 — Backend
cd C:\Users\Admin\Downloads\ugc_vietnam_backend
venv\Scripts\activate
uvicorn api.main:app --reload --port 8000

# Terminal 2 — Frontend
cd C:\Users\Admin\Desktop\ai-studio-hub
npm run dev

# Mở http://localhost:3000/studio
```

Flow test:
1. Paste link Shopee balo YUUMY
2. Chọn model **Vidu Q3** (recommended) → uploader hiện 4 slot
3. Upload 3 ảnh (avatar VN + sản phẩm + setting cafe)
4. Đổi sang **Seedance 2.0** → uploader expand thành 12 slots
5. Settings: silent_native + 10s + 9:16
6. Click TẠO VIDEO → AI tự pick template + generate

---

## ✅ CHECKLIST COMPLETE

| Tính năng | Status |
|---|---|
| 4-STEP flow rõ ràng (bỏ template picker) | ✅ |
| ModelSelector 4 cards với max_refs hiển thị | ✅ |
| ReferenceImagesUploader dynamic count theo model | ✅ |
| Bulk upload nhiều ảnh cùng lúc | ✅ |
| Validation + warning message tiếng Việt | ✅ |
| Cost VND realtime trên ModelSelector cards | ✅ |
| Settings panel với audio mode/duration/aspect/voice | ✅ |
| Analyzer V2 với Claude Vision multi-image | ✅ |
| Auto-pick template (AI tự chọn) | ✅ |
| 4 Generator model-specific (Seedance 2.0/Wan/Vidu/Seedance 1.5) | ✅ |
| API schema updated với reference_images[] | ✅ |
| Backward compat (template_id optional) | ✅ |

---

## 🔧 CÒN CẦN BUILD (production)

1. **Worker chain hoàn chỉnh** — scrape_worker, video_worker, tts_worker, sfx_worker, assemble_worker
2. **30 template skeleton JSON** đầy đủ (hiện chỉ có 1 demo S1_unboxing_handcam)
3. **API integration** — connect /api/v1/jobs/ugc dispatch tasks
4. **Cloudflare R2** upload + presigned URLs
5. **Postgres DB** schema + persist jobs

Em sẵn sàng build tiếp khi anh confirm direction.

---

## 🚀 NEXT — ANH FIRE GÌ?

**🅰️** Build worker chain hoàn chỉnh + DB Postgres (4-6 giờ) → production-ready backend

**🅱️** Build 30 template skeleton JSON đầy đủ (3-4 giờ) → AI có đủ template để auto-pick

**🅲️** Test E2E thực tế với YUUMY balo + API keys (1 giờ) → verify quality từ Studio → MP4

**🅳** Polish UI mobile responsive + dark mode + animations (2-3 giờ)

Em recommend **🅑 → 🅐 → 🅒 → 🅓** theo thứ tự production prep.

Anh chọn?
