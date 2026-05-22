'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { Play, Image as ImgIcon, Type, Video, Mic } from 'lucide-react';
import type { Model } from '@/lib/models';

const modalityIcon = { text: Type, image: ImgIcon, video: Video, audio: Mic, multimodal: Type };

const VN_CATEGORY = {
  text: 'Văn bản', image: 'Hình ảnh', video: 'Video', audio: 'Âm thanh', multimodal: 'Đa phương thức',
} as const;

export default function ModelCard({ m, variant = 'grid' }: { m: Model; variant?: 'grid' | 'compact' }) {
  const main = m.modalities[0];
  const Icon = modalityIcon[main] || Type;
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample media: hover preview (video) or static (image)
  const sampleVideoSrc = m.sampleMedia?.type === 'video' ? m.sampleMedia.src : null;
  const sampleImageSrc = m.sampleMedia?.type === 'image' ? m.sampleMedia.src : null;
  const cover = sampleImageSrc || (m.demoMedia?.type === 'image' ? m.demoMedia.src : null);

  const priceLine = (() => {
    if (m.pricing.perRun) {
      const u = m.pricing.perRun.unit;
      const unitVn = u === 'second' ? 'giây' : u === 'minute' ? 'phút' : u === 'image' ? 'ảnh' : 'lần';
      return `$${m.pricing.perRun.amount}/${unitVn}`;
    }
    if (m.pricing.input && m.pricing.output) return `$${m.pricing.input.amount} / $${m.pricing.output.amount}`;
    return 'Liên hệ';
  })();

  return (
    <Link
      href={`/models/${m.slug}`}
      className="group block rounded-2xl overflow-hidden bg-bg-card border border-border hover:border-brand-500/60 transition-all duration-300 hover:shadow-glow"
      onMouseEnter={() => { videoRef.current?.play().catch(() => {}); }}
      onMouseLeave={() => { videoRef.current?.pause(); if (videoRef.current) videoRef.current.currentTime = 0; }}
    >
      <div className={`aspect-[16/10] relative overflow-hidden bg-gradient-to-br ${m.accent}`}>
        {cover && (
          <img
            src={cover}
            alt={m.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {sampleVideoSrc && (
          <video
            ref={videoRef}
            src={sampleVideoSrc}
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
        )}
        {/* dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {m.isNew && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/95 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">● Mới</span>
          )}
          {m.isFeatured && !m.isNew && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-sm">★ Nổi bật</span>
          )}
        </div>

        {/* Modality icon */}
        <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between gap-2">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur text-white/95 text-[10px] uppercase tracking-wider font-medium border border-white/10">
            {VN_CATEGORY[main] || main}
          </span>
          <span className="text-white/80 text-xs font-medium drop-shadow-md">{m.vendor}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-semibold text-text group-hover:text-brand-200 transition leading-tight">{m.name}</h3>
        </div>
        <p className="text-xs text-text-muted line-clamp-2 mb-3 min-h-[2.5rem]">{m.description}</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {m.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-md bg-bg-soft border border-border text-[10px] text-text-muted">{t}</span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <div className="text-[10px] text-text-subtle uppercase tracking-wider">Giá</div>
            <div className="text-sm font-semibold text-brand-200">{priceLine}</div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium flex items-center gap-1 group-hover:bg-brand-500 transition shadow-md shadow-brand-600/30">
            <Play className="w-3 h-3 fill-current" /> Thử ngay
          </span>
        </div>
      </div>
    </Link>
  );
}
