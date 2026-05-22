export type Modality = 'text' | 'image' | 'video' | 'audio' | 'multimodal';
export type PriceUnit = 'token' | 'image' | 'second' | 'minute' | 'request';

export type Model = {
  slug: string;
  name: string;
  vendor: string;
  vendorSlug: string;
  category: string;
  modalities: Modality[];
  tags: string[];
  description: string;
  releaseDate: string;
  contextWindow?: number;
  pricing: {
    input?: { amount: number; unit: PriceUnit };
    output?: { amount: number; unit: PriceUnit };
    perRun?: { amount: number; unit: PriceUnit };
  };
  capabilities: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  demoMedia?: { type: 'video' | 'image'; src: string; poster?: string };
  sampleMedia?: { type: 'video' | 'image'; src: string };
  atlasKey?: string;
  accent: string;
};

import { REAL_MODELS } from './models-real';

const v = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const mk = (m: Omit<Model, 'slug' | 'vendorSlug'>): Model => ({
  ...m,
  slug: v(`${m.vendor}-${m.name}`),
  vendorSlug: v(m.vendor),
});

// Sample/demo models (kept as fallback examples — used only if REAL_MODELS empty)
const SAMPLE_MODELS: Model[] = [
  mk({
    name: 'Aurora Chat Pro', vendor: 'Lumen Labs',
    category: 'agents', modalities: ['text', 'multimodal'],
    tags: ['LLM', 'Lý luận', 'Code'],
    description: 'Mô hình ngôn ngữ đa năng tối ưu cho hội thoại dài và lý luận từng bước. Hỗ trợ tệp đính kèm, công cụ và xuất tài liệu định dạng.',
    releaseDate: '2026-04-12', contextWindow: 200000,
    pricing: { input: { amount: 3, unit: 'token' }, output: { amount: 12, unit: 'token' } },
    capabilities: ['Tool use', 'Vision', 'PDF input', 'Streaming'],
    isFeatured: true, accent: 'from-violet-500 to-fuchsia-500',
  }),
  mk({
    name: 'Velvet Reasoner', vendor: 'Helix AI',
    category: 'agents', modalities: ['text'],
    tags: ['LLM', 'Lý luận sâu', 'Toán'],
    description: 'Tối ưu cho bài toán logic, toán cao cấp và lập kế hoạch nhiều bước. Trả lời chậm hơn nhưng chính xác hơn cho task khó.',
    releaseDate: '2026-05-01', contextWindow: 128000,
    pricing: { input: { amount: 5, unit: 'token' }, output: { amount: 20, unit: 'token' } },
    capabilities: ['Chain-of-thought', 'Code exec', 'Math'],
    isNew: true, accent: 'from-blue-500 to-indigo-500',
  }),
  mk({
    name: 'NovaText 4', vendor: 'Cascade Labs',
    category: 'agents', modalities: ['text'],
    tags: ['LLM', 'Nhanh', 'Rẻ'],
    description: 'Mô hình ngôn ngữ cân bằng giữa tốc độ và chất lượng. Phù hợp cho ứng dụng có lưu lượng cao như chatbot CSKH.',
    releaseDate: '2026-03-22', contextWindow: 64000,
    pricing: { input: { amount: 0.5, unit: 'token' }, output: { amount: 1.5, unit: 'token' } },
    capabilities: ['Function calling', 'JSON mode', 'Streaming'],
    isFeatured: true, accent: 'from-emerald-500 to-teal-500',
  }),
  mk({
    name: 'Glyph Image 2', vendor: 'Pixel Forge',
    category: 'image', modalities: ['image'],
    tags: ['Text-to-Image', 'Sản phẩm', 'Photoreal'],
    description: 'Tạo ảnh chân thực từ mô tả văn bản. Hỗ trợ tỉ lệ tùy chỉnh, hint màu hex và phong cách thương hiệu.',
    releaseDate: '2026-04-30',
    pricing: { perRun: { amount: 0.17, unit: 'image' } },
    capabilities: ['Custom aspect', 'Negative prompt', 'Seed control'],
    isFeatured: true, isNew: true,
    demoMedia: { type: 'image', src: '/icons/preview-image.svg' },
    accent: 'from-pink-500 to-rose-500',
  }),
  mk({
    name: 'Glyph Edit', vendor: 'Pixel Forge',
    category: 'image', modalities: ['image'],
    tags: ['Image-Image', 'Sửa ảnh'],
    description: 'Chỉnh sửa ảnh có sẵn theo hướng dẫn văn bản: thay nền, đổi tư thế, thêm vật thể, giữ nguyên nhân vật.',
    releaseDate: '2026-02-18',
    pricing: { perRun: { amount: 0.09, unit: 'image' } },
    capabilities: ['Inpaint', 'Identity preserve', 'Multi-image'],
    accent: 'from-fuchsia-500 to-pink-500',
  }),
  mk({
    name: 'Mirage Video 1.0', vendor: 'Drift Studio',
    category: 'video', modalities: ['video'],
    tags: ['Text-Video', '1080p'],
    description: 'Sinh video từ văn bản, độ dài 5-10 giây, 720P hoặc 1080P. Phong cách điện ảnh, chuyển động mượt.',
    releaseDate: '2026-05-08',
    pricing: { perRun: { amount: 0.14, unit: 'second' } },
    capabilities: ['Cinematic', 'Camera control', 'Negative prompt'],
    isNew: true,
    demoMedia: { type: 'video', src: '/icons/preview-video.svg' },
    accent: 'from-amber-500 to-orange-500',
  }),
  mk({
    name: 'Mirage Image-to-Video', vendor: 'Drift Studio',
    category: 'video', modalities: ['video'],
    tags: ['Image-Video', 'Animate'],
    description: 'Hoạt hình hóa một ảnh tĩnh thành video 5 giây với gợi ý hướng chuyển động.',
    releaseDate: '2026-04-15',
    pricing: { perRun: { amount: 0.16, unit: 'second' } },
    capabilities: ['Motion brush', 'Frame interpolation'],
    isNew: true,
    accent: 'from-orange-500 to-amber-500',
  }),
  mk({
    name: 'Mirage Reference-Video', vendor: 'Drift Studio',
    category: 'video', modalities: ['video'],
    tags: ['Reference-Video', 'Nhân vật'],
    description: 'Sinh video từ 1-9 ảnh tham chiếu và mô tả văn bản. Giữ nhất quán nhân vật và phong cách.',
    releaseDate: '2026-05-12',
    pricing: { perRun: { amount: 0.14, unit: 'second' } },
    capabilities: ['Identity ref', 'Style ref', 'Pose ref'],
    isNew: true,
    accent: 'from-red-500 to-rose-600',
  }),
  mk({
    name: 'Mirage Video Edit', vendor: 'Drift Studio',
    category: 'video', modalities: ['video'],
    tags: ['Video-Video', 'Restyle'],
    description: 'Sửa video gốc bằng hướng dẫn văn bản: đổi phong cách, đổi cảnh nền, đổi thời tiết.',
    releaseDate: '2026-04-28',
    pricing: { perRun: { amount: 0.18, unit: 'second' } },
    capabilities: ['Style transfer', 'Object edit', 'Temporal consistency'],
    isNew: true,
    accent: 'from-rose-500 to-red-500',
  }),
  mk({
    name: 'Echo Voice HD', vendor: 'SoundCraft',
    category: 'audio', modalities: ['audio'],
    tags: ['TTS', 'Voice clone'],
    description: 'Tổng hợp giọng đọc tự nhiên, hỗ trợ tiếng Việt, tiếng Anh và 30 ngôn ngữ. Cho phép sao chép giọng từ 30 giây mẫu.',
    releaseDate: '2026-03-08',
    pricing: { perRun: { amount: 0.012, unit: 'minute' } },
    capabilities: ['Voice clone', 'SSML', 'Emotion control'],
    accent: 'from-emerald-500 to-teal-500',
  }),
  mk({
    name: 'Echo Transcribe', vendor: 'SoundCraft',
    category: 'audio', modalities: ['audio'],
    tags: ['ASR', 'Phiên âm'],
    description: 'Phiên âm âm thanh sang văn bản, hỗ trợ 50+ ngôn ngữ, có timestamps và phân biệt người nói.',
    releaseDate: '2026-02-02',
    pricing: { perRun: { amount: 0.006, unit: 'minute' } },
    capabilities: ['Diarization', 'Timestamps', 'Multi-language'],
    accent: 'from-teal-500 to-cyan-500',
  }),
  mk({
    name: 'Helio Code 7B', vendor: 'Cascade Labs',
    category: 'code', modalities: ['text'],
    tags: ['Code', 'FIM'],
    description: 'Mô hình mã nhỏ gọn 7B tham số, chuyên cho hoàn thiện mã (fill-in-middle) và sửa lỗi.',
    releaseDate: '2026-01-25', contextWindow: 32000,
    pricing: { input: { amount: 0.2, unit: 'token' }, output: { amount: 0.4, unit: 'token' } },
    capabilities: ['FIM', '40+ ngôn ngữ', 'Repository context'],
    accent: 'from-blue-500 to-indigo-500',
  }),
];

// Active catalog: real factual data (names, vendors, pricing only — descriptions blank, TODO viết riêng).
// Fallback to SAMPLE_MODELS nếu REAL_MODELS rỗng.
export const MODELS: Model[] = REAL_MODELS.length > 0 ? REAL_MODELS : SAMPLE_MODELS;

export function getModel(slug: string) {
  return MODELS.find((m) => m.slug === slug);
}

export function modelsByCategory(cat?: string | null) {
  if (!cat) return MODELS;
  return MODELS.filter((m) => m.category === cat);
}

export const VENDORS = Array.from(new Set(MODELS.map((m) => m.vendor))).map((v) => ({
  name: v,
  slug: MODELS.find((m) => m.vendor === v)!.vendorSlug,
  count: MODELS.filter((m) => m.vendor === v).length,
}));
