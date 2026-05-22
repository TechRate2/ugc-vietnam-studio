# 🎯 STUDIO V4 — Compact Topview-Style Card

> Anh chỉ ra: Topview Agent V2 gọn 1 card duy nhất, KHÔNG expand 4 step như em làm.
> Em redesign theo đúng UX của Topview.

---

## ⚖️ TRƯỚC vs SAU

### ❌ V3 (em làm trước)
- 4 step expand panels từ trên xuống dưới
- Cao nhiều, scroll dài
- Mỗi panel 1 card riêng

### ✅ V4 (chuẩn Topview Agent V2)
- **1 compact card duy nhất**
- Reference slot left (96x96)
- Prompt textarea right (chiếm hầu hết diện tích)
- Bottom row 5 mini dropdowns + Try Unlimited + Cost + Submit
- Progress bar inline khi generating
- Footer info (cost VND + model + max refs)

---

## 📐 LAYOUT CHÍNH XÁC (theo screenshot Topview)

```
┌─────────────────────────────────────────────────────────────┐
│ Video Agent V2▼                                              │
│ ────────────────────────────────────────────────────────── │
│                                                              │
│ ┌────┐   Plan any-length videos with AI assistant.          │
│ │ +  │   Upload up to 1-5 reference images or videos and    │
│ │Ref │   @mention to create interactions. Example: Use      │
│ │    │   @Image 1 as first frame, @Image 2 as last frame... │
│ └────┘                                                       │
│                                                              │
│ [Seedance 2.0▼] [▭ 16:9▼] [480p▼] [⏱ 15s▼] [🔇▼]          │
│                              [∞ Try Unlimited]  ◆ 7.5  [↑] │
│ ─────────────────────────────────────────────────────────── │
│ Seedance 2.0 · Max 12 refs       ~30.000đ · ~2-4 phút      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 COMPONENT MỚI

### `VideoAgentCard.tsx`

1 component duy nhất chứa toàn bộ control:

```typescript
<VideoAgentCard
  prompt={prompt}
  onPromptChange={setPrompt}
  referenceImages={refs}                 // 1-5 ảnh (UI cap)
  onReferenceImagesChange={setRefs}
  model={model}                          // Seedance 2.0 / Wan 2.7 / Vidu Q3 / Seedance 1.5
  onModelChange={handleModelChange}
  aspectRatio="16:9"                     // 9:16 / 16:9 / 1:1
  resolution="480p"                       // 480p / 720p / 1080p
  durationS={15}                          // 5/10/15/16s tùy model
  audioMode="silent_native"               // 🔇 Câm / 🎤 VO / 🔉 ASMR
  costVnd={30000}
  costCredits={7.5}
  isGenerating={false}
  canSubmit={true}
  onSubmit={handleSubmit}
/>
```

---

## 🎛️ 5 MINI DROPDOWNS (compact bottom row)

| Dropdown | Options | Default |
|---|---|---|
| **Model** | Seedance 2.0 / Wan 2.7 / Seedance 1.5 Pro / Vidu Q3 | Seedance 2.0 |
| **Aspect** | 9:16 / 16:9 / 1:1 | 16:9 |
| **Resolution** | 480p / 720p / 1080p | 480p |
| **Duration** | 5s / 10s / 15s / 16s (tùy model max) | 15s |
| **Audio Mode** | 🔇 Câm / 🎤 VO / 🔉 ASMR | 🔇 Silent |

Mỗi dropdown:
- Click → mở popup phía dưới (anchored)
- Selected option highlighted rose
- Click outside → close
- Compact bg-white/5, hover hover bg-white/10

---

## 📤 REFERENCE UPLOADER

### Compact mode (default)
- 1 slot 96x96 left của card
- Click → file picker (multi-select)
- Show count "3/5 refs" overlay nếu có ảnh

### Expanded mode
- Click slot lần 2 → expand inline thumbnails grid
- Mỗi thumb 56x56 với badge "@1", "@2", ...
- Hover hiện remove X button
- Last slot "+" để add thêm

### Multi-upload bulk
- File picker accept multiple
- Auto fill các slot còn trống
- Truncate nếu quá max

---

## 🚀 FLOW USER (super gọn)

```
1. User TYPE ý tưởng/sản phẩm vào textarea lớn
2. (Optional) PASTE link Shopee ở ô trên
3. (Optional) Click REFERENCE → upload 1-5 ảnh
4. (Optional) Adjust 5 dropdowns
5. Click ↑ SUBMIT
   ↓
AI tự pick template + render
   ↓
Modal hiện progress + MP4 cuối
```

→ User KHÔNG cần biết template, KHÔNG cần expand panels. Mọi thứ 1 card.

---

## 💰 COST DISPLAY

3 chỗ hiển thị cost:
1. **◆ 7.5 credits** ngay cạnh submit button (giống Topview)
2. **~30.000đ · ~2-4 phút** trong footer card
3. **Update REALTIME** khi đổi model/duration/audio

---

## 🎯 PROGRESS BAR INLINE

Khi generating:
- Submit button → spinning loader icon
- 1px progress bar gradient rose ngay dưới bottom row
- Width = jobStatus.progress %

---

## 📝 PLACEHOLDER TEXT

```
Plan any-length videos with AI assistant and references.
Upload up to 1-5 reference images or videos and @mention to create 
interactions. Example: Use @Image 1 as the first frame, @Image 2 as 
the last frame, and have them dance like the moves in @Video 1.
```

→ Y CHANG Topview Agent V2 placeholder.

---

## ✅ CHECKLIST V4 COMPACT

| Tính năng | Status |
|---|---|
| 1 compact card duy nhất | ✅ |
| Reference slot left + textarea right | ✅ |
| 5 mini dropdowns bottom row | ✅ |
| Try Unlimited badge | ✅ |
| Cost credits cạnh submit | ✅ |
| Submit button arrow up | ✅ |
| Progress bar inline khi gen | ✅ |
| Footer info (model + cost VND) | ✅ |
| Reference thumbnails expand inline | ✅ |
| Multi-upload bulk | ✅ |
| Model change → auto adjust limits | ✅ |
| Validation (need prompt OR product) | ✅ |

---

## 🚀 CHẠY THỬ

```bash
cd C:\Users\Admin\Desktop\ai-studio-hub
npm run dev
```

Mở `http://localhost:3000/studio` — sẽ thấy giao diện compact giống Topview screenshot anh gửi.

---

## 🆚 So sánh trực tiếp với Topview screenshot anh gửi

| Topview Agent V2 (ảnh) | App của anh (V4) |
|---|---|
| `Video Agent V2▼` header | ✅ Same |
| `+ Reference` slot left 96x96 | ✅ Same |
| Placeholder text dài giải thích | ✅ Same |
| `Seedance 2.0▼` dropdown | ✅ Same |
| `▭ 16:9▼` aspect | ✅ Same |
| `480p▼` resolution | ✅ Same |
| `⏱ 15s▼` duration | ✅ Same |
| `∞ Try Unlimited` link | ✅ Same |
| `◆ 7.5` cost credits | ✅ Same |
| `↑` submit arrow button | ✅ Same |

**Bonus thêm vs Topview:**
- Audio Mode dropdown (em thêm cho VN: Câm/VO/ASMR)
- Cost VND realtime ở footer
- Validation message tiếng Việt
- Reference role hints (@1, @2, @3...)

---

## 🔧 FILES UPDATED

```
ai-studio-hub/
├── components/studio/
│   ├── VideoAgentCard.tsx        ← NEW: compact 1-card layout
│   └── StudioMain.tsx            ← REWRITE: dùng VideoAgentCard thay 4 steps
└── STUDIO_V4_COMPACT.md          ← Doc này
```

→ ModelSelector + ReferenceImagesUploader + SettingsPanel **CHƯA XOÁ** — giữ làm component dự phòng, có thể dùng cho advanced mode sau.

---

## 🚀 NEXT STEP

**🅰️** Build 30 template skeleton JSON đầy đủ (3-4h)
**🅱️** Build worker chain hoàn chỉnh + DB Postgres (4-6h)
**🅲️** Test E2E thực tế (cần API key, 1h)
**🅳** Polish thêm: drag-drop refs, @mention autocomplete, prompt suggestions

Anh fire?
