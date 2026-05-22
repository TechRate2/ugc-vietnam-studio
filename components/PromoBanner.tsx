'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Zap, Gift, Flame } from 'lucide-react';
import { useState } from 'react';

const PROMOS = [
  { icon: Gift, text: 'Đăng ký mới', highlight: 'tặng $5 credit', desc: 'đủ tạo 50 video 5s · không cần thẻ' },
  { icon: Zap, text: 'Black Friday', highlight: 'giảm 50%', desc: 'mọi gói Pro trong tháng này' },
  { icon: Flame, text: 'Mô hình mới', highlight: 'Veo 3.1 + Nano Banana 2', desc: 'đã có trên catalog' },
  { icon: Sparkles, text: 'Day-0 launch', highlight: 'mô hình SOTA mới ra mắt', desc: 'tích hợp ngay trong giờ đầu tiên' },
];

export function PromoBanner() {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
  if (!open) return null;
  if (pathname?.startsWith('/studio') || pathname?.startsWith('/video') || pathname?.startsWith('/image')) return null;

  // Single duplicated track for seamless marquee
  const items = [...PROMOS, ...PROMOS];

  return (
    <div className="relative overflow-hidden border-b border-brand-700/40 bg-gradient-to-r from-brand-900/40 via-fuchsia-900/30 to-brand-900/40 backdrop-blur-xl">
      <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      <div className="relative flex items-center">
        <div className="flex-1 overflow-hidden py-2">
          <div className="flex items-center gap-10 whitespace-nowrap animate-marquee">
            {items.map((p, i) => {
              const Icon = p.icon;
              return (
                <Link key={i} href="/pricing" className="flex items-center gap-2.5 text-xs text-text-muted hover:text-text transition group shrink-0">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-brand-600/30 text-brand-200">
                    <Icon className="w-3 h-3" />
                  </span>
                  <span>{p.text}</span>
                  <span className="text-promo-gradient font-bold">{p.highlight}</span>
                  <span className="text-text-subtle hidden md:inline">— {p.desc}</span>
                  <span className="opacity-30 ml-4">·</span>
                </Link>
              );
            })}
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-2 text-text-subtle hover:text-text shrink-0 mr-2"
          aria-label="Đóng"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
