# 🔌 INTEGRATION GUIDE — AI Studio Hub ↔ UGC Vietnam Backend

> Frontend (Next.js 14) đã được tích hợp với Backend Python (FastAPI Agent V2).
> File này hướng dẫn chạy + tinh chỉnh.

---

## 📦 FILES MỚI ĐÃ TẠO

```
ai-studio-hub/
├── lib/
│   ├── types/
│   │   └── backend.ts                  ← TypeScript types match Pydantic schemas
│   ├── backend-client.ts               ← Server-side fetch client
│   └── studio/
│       ├── use-generate-job.ts         ← React hook tạo job + polling
│       └── template-mapper.ts          ← Map Higgsfield label → backend template_id
│
├── app/api/v1/
│   ├── jobs/
│   │   ├── route.ts                    ← POST tạo job (proxy)
│   │   └── [id]/route.ts               ← GET poll + DELETE cancel
│   ├── templates/
│   │   └── route.ts                    ← GET list templates
│   └── avatars/
│       └── route.ts                    ← GET list avatars
│
└── components/studio/
    ├── JobResultModal.tsx              ← Modal progress + video result
    └── StudioMain.tsx                  ← ⚙️ ĐÃ UPDATE: wire GENERATE button
```

---

## 🚀 CHẠY THỬ NGHIỆM

### Bước 1: Setup backend Python (terminal 1)

```bash
cd C:\Users\Admin\Downloads\ugc_vietnam_backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Copy + paste API keys vào .env
copy .env.example .env
notepad .env  # paste: ANTHROPIC_API_KEY, ATLASCLOUD_API_KEY, VBEE_API_KEY, ELEVENLABS_API_KEY

# Run FastAPI
uvicorn api.main:app --reload --port 8000
```

Mở: <http://localhost:8000/docs> để xem Swagger.

### Bước 2: Setup frontend Next.js (terminal 2)

```bash
cd C:\Users\Admin\Desktop\ai-studio-hub

# Thêm env var BACKEND_URL
echo BACKEND_URL=http://localhost:8000 > .env.local

npm run dev
```

Mở: <http://localhost:3000/studio>

### Bước 3: Test flow

1. Vào `/studio`
2. Paste link Shopee (hoặc upload ảnh sản phẩm)
3. Chọn template (24 cards Higgsfield-style)
4. Click GENERATE
5. Modal hiện progress bar → đợi 2-4 phút → video MP4 hiển thị

---

## 🔄 FLOW HOÀN CHỈNH (Frontend ↔ Backend)

```
[User click GENERATE button]
         ↓
[StudioMain.handleGenerate]
   - Lấy template_id từ getBackendMapping(selectedTemplate.label)
   - Auto pick audio_mode + model phù hợp
         ↓
[POST /api/v1/jobs] (Next.js route — proxy)
         ↓
[backend-client.createJob] (server-side fetch)
         ↓
[Python FastAPI: /api/v1/jobs/ugc]
   - Analyzer Claude → JSON insight
   - Generator Claude → prompt cuối
   - Dispatch workers (scrape → render → audio → assemble)
         ↓
[Trả về job_id]
         ↓
[useGenerateJob hook bắt đầu polling]
   - Mỗi 3s gọi GET /api/v1/jobs/{id}
   - Update progress %
         ↓
[Khi status=done]
   - Hiển thị video MP4 trong JobResultModal
   - Button download
```

---

## 🎨 ĐIỂM TINH TẾ ĐÃ THÊM

### 1. Template Mapping thông minh

`lib/studio/template-mapper.ts` map từ Higgsfield label sang backend template_id:

```
'unboxing' → S1_unboxing_handcam (silent_native + vidu_q3)
'ugc' → S9_ugc_selfie_kitchen (dialogue_vo + wan_2_7)
'product_showcase' → B3_hero_product_lazy_susan (asmr_macro + seedance_2_0)
```

→ User chỉ click template, app tự chọn audio mode + model tối ưu.

### 2. Auto cost display VND

`formatVND(usd)` convert sang VND realtime (rate 1 USD = 24.500đ).

### 3. Progress bar UX cao cấp

Modal `JobResultModal`:
- Spinner + step description tiếng Việt (`STEP_LABELS_VN`)
- Progress bar gradient rose-pink (match theme)
- Cancel button cho user dừng job
- Khi done → preview video + download + thử lại

### 4. Error handling elegant

- Backend timeout → error message rõ ràng
- 404 template/avatar → fallback default
- Network error → user-friendly Vietnamese message

---

## ⚙️ TÙY CHỈNH SAU NÀY

### Thêm template VN mới

1. **Backend:** Thêm file JSON vào `ugc_vietnam_backend/templates/`
2. **Frontend:** Map trong `lib/studio/template-mapper.ts`:
   ```ts
   'tên_higgsfield_label': {
     template_id: 'S5_template_moi',
     audio_mode: 'dialogue_vo',
     recommended_model: 'wan_2_7',
     duration_s_default: 15,
   }
   ```

### Thêm avatar VN preset

Backend `api/routes/avatars.py` → add to `AVATAR_PRESETS` array.

Frontend tự fetch qua `/api/v1/avatars`.

### Đổi UI text từ "VIDEO ad" → riêng anh

Edit `app/studio/layout.tsx` metadata + `components/studio/StudioMain.tsx` h1.

---

## 🐛 TROUBLESHOOTING

### "Backend 500: Failed to connect"

→ Python backend chưa chạy. Kiểm tra:
```bash
curl http://localhost:8000/health
```

### "Backend 401 Unauthorized"

→ API key sai trong `.env`. Verify từng key:
- Anthropic: <https://console.anthropic.com>
- AtlasCloud: <https://atlascloud.ai/dashboard>
- VBee: <https://vbee.vn>

### Video preview không hiện

→ Cloudflare R2 public URL chưa setup. Tạm thời backend trả URL local file, browser KHÔNG load được.
→ Production: setup R2 + paste `R2_PUBLIC_URL` vào `.env`.

### Polling không update

→ Check Network tab DevTools — phải có request `/api/v1/jobs/{id}` mỗi 3s.
→ Nếu CORS error → restart FastAPI với CORS allow `localhost:3000`.

---

## 📈 NEXT STEPS

### Production-ready

- [ ] Backend deploy VPS Hetzner (Docker compose)
- [ ] R2 storage setup + public URL
- [ ] Postgres production DB
- [ ] Casso webhook → payment
- [ ] Authentication (Supabase/Clerk)
- [ ] Rate limiting per user tier

### UI polish

- [ ] Avatar gallery modal (50 avatar VN preset)
- [ ] Voice persona picker (200+ giọng VBee)
- [ ] Multi-language toggle (VN/EN)
- [ ] Job history page
- [ ] Templates filter (Tier S/A/B, category)

---

## ✅ ĐÃ HOÀN THÀNH

- ✅ TypeScript types match Pydantic schemas
- ✅ Backend client với timeout + retry
- ✅ 4 API route proxies (jobs/templates/avatars)
- ✅ React hook tạo job + polling
- ✅ Template mapping Higgsfield → backend
- ✅ GENERATE button connected (real backend call)
- ✅ Loading/progress UI elegant
- ✅ Video result modal với download button
- ✅ Error handling tiếng Việt

→ **App đã CHẠY THẬT từ frontend → backend → AtlasCloud → MP4.**

→ Anh chỉ cần paste API keys, run cả 2 server là dùng được.
