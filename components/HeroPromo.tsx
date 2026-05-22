'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Promo = {
  id: string;
  thumb: string;
  hero: string;
  badge?: string;
  titleA: string;
  titleB: string;
  desc: string;
  href: string;
};

const PROMOS: Promo[] = [
  {
    id: 'wan27',
    thumb: '/images/banner/wan2.7-v2.png',
    hero: '/images/banner/wan2.7-v2.png',
    badge: 'Wan 2.7',
    titleA: 'Wan 2.7 is Now Live!',
    titleB: 'Image + Video Full-Modal AI',
    desc: "Alibaba's full-modal AI series — image generation & editing, plus 1080p video with built-in audio. First/last frame control, character consistency, and video editing in one unified platform.",
    href: '/models?vendor=qwen',
  },
  {
    id: 'lowest',
    thumb: '/images/banner/lowest-price-guarantee-hero.webp',
    hero: '/images/banner/lowest-price-guarantee-hero.webp',
    badge: 'Cam kết',
    titleA: 'Đảm bảo giá thấp nhất',
    titleB: 'Tiết kiệm đến 90% so với gọi trực tiếp',
    desc: 'Vidhyper cam kết giá API thấp nhất thị trường. Nếu tìm thấy giá thấp hơn ở bất kỳ đối thủ nào, chúng tôi sẽ match hoặc beat giá đó.',
    href: '/pricing',
  },
  {
    id: 'topup',
    thumb: '/images/banner/topup-promotion-banner.webp',
    hero: '/images/banner/topup-promotion-banner.webp',
    badge: 'Khuyến mãi',
    titleA: 'Top-Up Promotion',
    titleB: 'Nạp $50 tặng thêm $10 credit',
    desc: 'Khuyến mãi giới hạn — nạp credit từ $50 trở lên nhận ngay 20% bonus. Áp dụng cho tài khoản Pro tier.',
    href: '/pricing',
  },
  {
    id: 'seedance',
    thumb: '/models-media/covers/bytedance-seedance-2.0-text-to-video.jpg',
    hero: '/models-media/covers/bytedance-seedance-2.0-text-to-video.jpg',
    badge: 'Seedance 2.0',
    titleA: 'Seedance 2.0',
    titleB: 'Cinematic video generation đỉnh cao',
    desc: 'ByteDance Seedance 2.0 — sinh video chuyên nghiệp với điều khiển camera nâng cao, motion smooth và độ chân thực cao cho cảnh điện ảnh.',
    href: '/models/bytedance-seedance-2-0-text-to-video',
  },
  {
    id: 'deepseek',
    thumb: '/images/banner/deepseek-v4-banner-v2.png',
    hero: '/images/banner/deepseek-v4-banner-v2.png',
    badge: 'DeepSeek V4',
    titleA: 'DeepSeek V4',
    titleB: 'LLM reasoning đỉnh cao',
    desc: 'DeepSeek V4 — mô hình ngôn ngữ thế hệ mới, reasoning sâu, code generation chính xác, multilingual fluency cao.',
    href: '/models',
  },
  {
    id: 'nano',
    thumb: '/images/banner/nano-banana-2-banner.webp',
    hero: '/images/banner/nano-banana-2-banner.webp',
    badge: 'Nano Banana 2',
    titleA: 'Nano Banana 2',
    titleB: 'Image generation đột phá',
    desc: 'Google Nano Banana Pro — chất lượng photorealistic, hỗ trợ edit thông minh và phong cách đa dạng, latency thấp.',
    href: '/models?vendor=google',
  },
];

export function HeroPromo() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % PROMOS.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Big hero card with crossfade */}
      <div className="relative aspect-[21/9] lg:aspect-[16/7] rounded-3xl overflow-hidden border border-border bg-black">
        {PROMOS.map((p, i) => (
          <div key={p.id} className={`absolute inset-0 carousel-slide ${i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'}`}>
            <img src={p.hero} alt={p.titleA} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            <div className="relative h-full flex flex-col justify-center px-6 lg:px-14 max-w-4xl">
              {p.badge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur border border-white/20 text-xs text-white font-medium w-fit mb-5 animate-fade-in">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
                    <span className="relative w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </span>
                  {p.badge}
                </div>
              )}
              <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-2">{p.titleA}</h2>
              <h3 className="text-2xl lg:text-4xl font-bold text-white/95 tracking-tight leading-[1.1] mb-5">{p.titleB}</h3>
              <p className="text-sm lg:text-base text-white/75 leading-relaxed max-w-2xl mb-7">{p.desc}</p>
              <Link href={p.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/15 backdrop-blur border border-white/30 text-white hover:bg-white/25 hover:scale-105 transition w-fit text-sm font-medium">
                Khám phá ngay
              </Link>
            </div>
          </div>
        ))}

        {/* Bouncing scroll-down hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-float">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PROMOS.map((p, i) => (
          <button
            key={p.id}
            onClick={() => setActive(i)}
            className={`relative aspect-[21/9] rounded-lg overflow-hidden border transition group ${
              i === active ? 'border-brand-500 shadow-lg shadow-brand-600/30' : 'border-border opacity-70 hover:opacity-100 hover:border-brand-500/40'
            }`}
          >
            <img src={p.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className={`absolute inset-0 ${i === active ? 'bg-black/20' : 'bg-black/50 group-hover:bg-black/30'} transition`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs text-white font-semibold text-center px-2 drop-shadow-lg">{p.badge}</span>
            </div>
            {i === active && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
