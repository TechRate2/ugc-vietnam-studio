'use client';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { ArrowRight, ChevronRight, Play } from 'lucide-react';

type Family = {
  name: string;
  desc: string;
  bigImg: string;
  bigVideo?: string;
  variants: { name: string; price: string; slug: string; img: string }[];
};

const FAMILIES: Family[] = [
  {
    name: 'Happy Horse 1.0',
    desc: 'HappyHorse-1.0 is a unified multimodal AI video generation model that climbed to the top of the Artificial Analysis Video Arena blind-test leaderboard for both text-to-video and image-to-video.',
    bigImg: '/models-media/covers/alibaba-happyhorse-1.0-text-to-video.jpg',
    bigVideo: '/models-media/samples/alibaba-happyhorse-1-0-text-to-video.mp4',
    variants: [
      { name: 'HappyHorse-1.0 Text-to-video', price: '$0.14/SEC', slug: 'alibaba-happyhorse-1-0-text-to-video', img: '/models-media/covers/alibaba-happyhorse-1.0-text-to-video.jpg' },
      { name: 'HappyHorse-1.0 Image-to-video', price: '$0.14/SEC', slug: 'alibaba-happyhorse-1-0-image-to-video', img: '/models-media/covers/alibaba-happyhorse-1.0-image-to-video.jpg' },
      { name: 'HappyHorse-1.0 Reference-to-video', price: '$0.14/SEC', slug: 'alibaba-happyhorse-1-0-reference-to-video', img: '/models-media/covers/alibaba-happyhorse-1.0-reference-to-video.jpg' },
    ],
  },
  {
    name: 'Seedance 2.0',
    desc: 'ByteDance Seedance 2.0 — generation video chuyên nghiệp với điều khiển camera nâng cao, motion smooth và độ chân thực cao cho cảnh điện ảnh.',
    bigImg: '/models-media/covers/bytedance-seedance-2.0-text-to-video.jpg',
    bigVideo: '/models-media/samples/bytedance-seedance-2-0-text-to-video.mp4',
    variants: [
      { name: 'Seedance 2.0 Text-to-Video', price: '$0.18/SEC', slug: 'bytedance-seedance-2-0-text-to-video', img: '/models-media/covers/bytedance-seedance-2.0-text-to-video.jpg' },
      { name: 'Seedance 2.0 Image-to-Video', price: '$0.18/SEC', slug: 'bytedance-seedance-2-0-image-to-video', img: '/models-media/covers/bytedance-seedance-2.0-image-to-video.jpg' },
      { name: 'Seedance 2.0 Fast Text-to-Video', price: '$0.096/SEC', slug: 'bytedance-seedance-2-0-fast-text-to-video', img: '/models-media/covers/bytedance-seedance-2.0-fast-text-to-video.jpg' },
    ],
  },
  {
    name: 'GPT Image 2',
    desc: 'OpenAI GPT-Image-2 — sinh ảnh chất lượng cao từ prompt văn bản, latency thấp, chi phí thấp và hỗ trợ edit ảnh có sẵn với độ trung thực cao.',
    bigImg: '/models-media/covers/openai-gpt-image-2-text-to-image.jpg',
    variants: [
      { name: 'GPT Image 2 Text-to-Image', price: '$0.009/IMG', slug: 'openai-gpt-image-2-text-to-image', img: '/models-media/covers/openai-gpt-image-2-text-to-image.jpg' },
      { name: 'GPT Image 2 Edit', price: '$0.01/IMG', slug: 'openai-gpt-image-2-edit', img: '/models-media/covers/openai-gpt-image-2-edit.jpg' },
    ],
  },
  {
    name: 'Veo 3.1 Lite',
    desc: 'Google Veo 3.1 Lite — sinh video tiên tiến nhất từ Google DeepMind, photorealistic với chuyển động mượt và hiểu prompt sâu. Tier Lite tối ưu cho chi phí.',
    bigImg: '/models-media/covers/google-veo3.1-lite-text-to-video.jpg',
    bigVideo: '/models-media/samples/google-veo3-1-lite-text-to-video.f4v',
    variants: [
      { name: 'Veo 3.1 Lite Text-to-Video', price: '$0.20/SEC', slug: 'google-veo3-1-lite-text-to-video', img: '/models-media/covers/google-veo3.1-lite-text-to-video.jpg' },
      { name: 'Veo 3.1 Lite Image-to-Video', price: '$0.20/SEC', slug: 'google-veo3-1-lite-image-to-video', img: '/models-media/covers/google-veo3.1-lite-image-to-video.jpg' },
      { name: 'Veo 3.1 Lite Start-End-Frame', price: '$0.20/SEC', slug: 'google-veo3-1-lite-start-end-frame-to-video', img: '/models-media/covers/google-veo3.1-lite-start-end-frame-to-video.jpg' },
    ],
  },
  {
    name: 'Qwen Image 2.0',
    desc: 'Alibaba Qwen Image 2.0 — mô hình ảnh đa năng từ Tongyi team. Hỗ trợ text-to-image và edit ảnh có sẵn với độ trung thực cao, tiết kiệm chi phí.',
    bigImg: '/models-media/covers/qwen-qwen-image-2.0-text-to-image.jpg',
    variants: [
      { name: 'Qwen Image 2.0 Text-to-Image', price: '$0.025/IMG', slug: 'qwen-qwen-image-2-0-text-to-image', img: '/models-media/covers/qwen-qwen-image-2.0-text-to-image.jpg' },
      { name: 'Qwen Image 2.0 Edit', price: '$0.025/IMG', slug: 'qwen-qwen-image-2-0-edit', img: '/models-media/covers/qwen-qwen-image-2.0-edit.jpg' },
      { name: 'Qwen Image 2.0 Pro Text-to-Image', price: '$0.039/IMG', slug: 'qwen-qwen-image-2-0-pro-text-to-image', img: '/models-media/covers/qwen-qwen-image-2.0-pro-text-to-image.jpg' },
    ],
  },
  {
    name: 'Atlas Wan 2.2',
    desc: 'Atlas Cloud Wan 2.2 — image-to-video sản xuất tại Atlas private cloud, tối ưu cho creator workflow.',
    bigImg: '/models-media/covers/atlascloud-wan-2.2-image-to-video.jpg',
    bigVideo: '/models-media/samples/atlascloud-wan-2-2-image-to-video.mp4',
    variants: [
      { name: 'Atlas Wan 2.2 Image-to-Video', price: '$0.112/SEC', slug: 'atlascloud-wan-2-2-image-to-video', img: '/models-media/covers/atlascloud-wan-2.2-image-to-video.jpg' },
      { name: 'Atlas Wan 2.2 Image-to-Video LoRA', price: '$0.112/SEC', slug: 'atlascloud-wan-2-2-image-to-video-lora', img: '/models-media/covers/atlascloud-wan-2.2-image-to-video-lora.jpg' },
    ],
  },
];

export function FeaturedCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Auto-rotate every 6s when not paused
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % FAMILIES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  // Scroll active tab into view
  useEffect(() => {
    const el = tabBarRef.current?.querySelector(`[data-idx="${active}"]`) as HTMLElement | null;
    if (el && tabBarRef.current) {
      const barRect = tabBarRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const offset = elRect.left - barRect.left - (barRect.width / 2) + (elRect.width / 2);
      tabBarRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [active]);

  const fam = FAMILIES[active];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Tab bar */}
      <div ref={tabBarRef} className="-mx-1 overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2 px-1 min-w-max">
          {FAMILIES.map((f, i) => (
            <button
              key={f.name}
              data-idx={i}
              onClick={() => setActive(i)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm transition-all border relative ${
                i === active
                  ? 'bg-bg-card text-text border-brand-500 shadow-lg shadow-brand-600/20'
                  : 'border-border text-text-muted hover:text-text hover:border-brand-500/40 bg-bg-soft/50'
              }`}
            >
              {f.name}
              {i === active && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand-400 animate-pulse" />
              )}
            </button>
          ))}
          <Link href="/models" className="whitespace-nowrap px-4 py-2 rounded-full text-sm text-brand-300 hover:text-brand-200 transition border border-brand-500/30 bg-brand-700/10">
            Xem Tất cả →
          </Link>
        </div>
      </div>

      {/* Carousel content */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Big featured card with smooth crossfade */}
        <div className="lg:col-span-7 relative aspect-[16/10] rounded-2xl overflow-hidden border border-border bg-bg-card group">
          {FAMILIES.map((f, i) => (
            <div
              key={f.name}
              className={`absolute inset-0 carousel-slide ${
                i === active ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
              }`}
            >
              {f.bigVideo ? (
                <video src={f.bigVideo} poster={f.bigImg} autoPlay loop muted playsInline
                  className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <img src={f.bigImg} alt={f.name} className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-end">
                <div className="text-xs text-white/70 uppercase tracking-widest mb-2 animate-fade-in">Dòng Mô hình</div>
                <h3 className="text-2xl lg:text-4xl font-bold text-white mb-3">{f.name}</h3>
                <p className="text-sm text-white/85 leading-relaxed max-w-xl mb-5 line-clamp-3">{f.desc}</p>
                <Link href={`/models/${f.variants[0].slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/15 backdrop-blur border border-white/25 text-white hover:bg-white/25 hover:scale-105 transition w-fit text-sm font-medium">
                  <Play className="w-3.5 h-3.5 fill-current" /> Khám phá <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}

          {/* Progress dots */}
          <div className="absolute bottom-4 right-4 flex gap-1 z-10">
            {FAMILIES.map((_, i) => (
              <button key={i} onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                aria-label={`Tab ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right side: variants */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-3">
          <div className="text-xs text-text-subtle uppercase tracking-widest mb-1 px-1">Phân loại Mô hình</div>
          {fam.variants.map((v, i) => (
            <Link key={v.slug} href={`/models/${v.slug}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-hover hover:border-brand-500/50 transition group animate-slide-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-20 h-14 rounded-md overflow-hidden bg-black shrink-0">
                <img src={v.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-text truncate group-hover:text-brand-200 transition">{v.name}</div>
                <div className="text-xs text-emerald-300 mt-1 font-semibold">{v.price}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-subtle group-hover:text-brand-300 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}

          {fam.variants.length < 3 && (
            <div className="rounded-xl border border-dashed border-border bg-bg-soft/30 p-4 text-center text-xs text-text-subtle">
              + Còn nhiều biến thể khác trong catalog
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
