'use client';

import { useState } from 'react';
import { Sparkles, Check, X, User, Copy, ChevronDown, ExternalLink, Star } from 'lucide-react';
import type { ModelGuide } from '@/lib/image/model-types';

const NICHE_EMOJI: Record<string, string> = {
  UGC: '📱',
  'Talking Head': '🗣️',
  ASMR: '🫧',
  Cinematic: '🎬',
  Anime: '🎌',
  Faceless: '🫥',
  Storyboard: '🗂️',
  'Product Showcase': '🛍️',
  Lifestyle: '☕',
  'Multi-Character': '👥',
  Budget: '💰',
  'Premium 1080p': '💎',
  'Realistic Photo': '📷',
  Artistic: '🎨',
};

const NICHE_ACCENT: Record<string, string> = {
  UGC: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  'Talking Head': 'bg-sky-500/15 text-sky-200 border-sky-500/30',
  ASMR: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
  Cinematic: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  Anime: 'bg-pink-500/15 text-pink-200 border-pink-500/30',
  Faceless: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
  Storyboard: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30',
  'Product Showcase': 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  Lifestyle: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  'Multi-Character': 'bg-violet-500/15 text-violet-200 border-violet-500/30',
  Budget: 'bg-lime-500/15 text-lime-200 border-lime-500/30',
  'Premium 1080p': 'bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-500/30',
  'Realistic Photo': 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  Artistic: 'bg-yellow-500/15 text-yellow-200 border-yellow-500/30',
};

export function ModelInfoPanel({
  guide,
  modelName,
  onUseSamplePrompt,
  accent = 'amber',
}: {
  guide?: ModelGuide | null;
  modelName: string;
  onUseSamplePrompt?: (prompt: string) => void;
  accent?: 'amber' | 'brand' | 'emerald';
}) {
  const [openSources, setOpenSources] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!guide || !guide.best_for) {
    return (
      <div className="rounded-2xl border border-border bg-bg-card/50 px-4 py-5 text-center">
        <Sparkles className="w-5 h-5 text-text-subtle mx-auto mb-2 opacity-50" />
        <div className="text-[12px] text-text-subtle">
          Chưa có guide cho model này.
        </div>
      </div>
    );
  }

  const accentBtn =
    accent === 'amber'
      ? 'border-amber-500/40 text-amber-200 bg-amber-500/10 hover:bg-amber-500/20'
      : accent === 'emerald'
        ? 'border-emerald-500/40 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20'
        : 'border-brand-500/40 text-brand-200 bg-brand-700/15 hover:bg-brand-700/30';

  const handleCopy = () => {
    if (!guide.sample_prompt) return;
    navigator.clipboard.writeText(guide.sample_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-bg-card/60 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-bg-soft/40 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
            <Sparkles className="w-3 h-3" /> Phù hợp làm
          </div>
          <div className="text-[12.5px] text-text font-medium mt-0.5 leading-snug">
            {modelName}
          </div>
        </div>
        {guide.rating && (
          <div className="flex items-center gap-1 text-amber-300 text-[11px] font-semibold whitespace-nowrap shrink-0">
            <Star className="w-3 h-3 fill-current" /> {guide.rating.split(/[·\|]/)[0].trim()}
          </div>
        )}
      </div>

      {/* Niche tags */}
      {guide.niche_tags && guide.niche_tags.length > 0 && (
        <div className="px-4 pt-3.5 flex flex-wrap gap-1.5">
          {guide.niche_tags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10.5px] font-medium ${
                NICHE_ACCENT[tag] || 'bg-bg-card text-text-muted border-border'
              }`}
            >
              <span>{NICHE_EMOJI[tag] || '•'}</span>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="px-4 py-3.5 space-y-3.5">
        {/* Best for */}
        {guide.best_for.length > 0 && (
          <Block
            title="Mạnh nhất ở"
            icon={<Check className="w-3 h-3 text-emerald-400" />}
            items={guide.best_for.slice(0, 4)}
            tone="emerald"
          />
        )}

        {/* Strengths */}
        {guide.strengths && guide.strengths.length > 0 && (
          <Block
            title="Điểm mạnh"
            icon={<Check className="w-3 h-3 text-sky-400" />}
            items={guide.strengths.slice(0, 4)}
            tone="sky"
          />
        )}

        {/* Weaknesses */}
        {guide.weaknesses && guide.weaknesses.length > 0 && (
          <Block
            title="Hạn chế"
            icon={<X className="w-3 h-3 text-rose-400" />}
            items={guide.weaknesses.slice(0, 3)}
            tone="rose"
          />
        )}

        {/* Ideal user */}
        {guide.ideal_user && (
          <div className="rounded-xl bg-bg-soft/60 border border-border px-3 py-2.5">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-text-subtle flex items-center gap-1.5 mb-1">
              <User className="w-3 h-3" /> Ai nên dùng
            </div>
            <div className="text-[12px] text-text-muted leading-relaxed">
              {guide.ideal_user}
            </div>
          </div>
        )}

        {/* Sample prompt */}
        {guide.sample_prompt && (
          <div className="rounded-xl bg-bg-soft/60 border border-border overflow-hidden">
            <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2">
              <div className="text-[10.5px] font-semibold uppercase tracking-wider text-text-subtle flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" /> Prompt mẫu
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-medium border border-border bg-bg-card hover:bg-bg-hover text-text-muted hover:text-text transition"
                >
                  <Copy className="w-3 h-3" /> {copied ? 'Đã chép' : 'Copy'}
                </button>
                {onUseSamplePrompt && (
                  <button
                    onClick={() => onUseSamplePrompt(guide.sample_prompt)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-semibold border transition ${accentBtn}`}
                  >
                    Dùng
                  </button>
                )}
              </div>
            </div>
            <div className="px-3 py-2.5 text-[11.5px] text-text-muted leading-relaxed italic">
              "{guide.sample_prompt}"
            </div>
          </div>
        )}

        {/* Sources collapse */}
        {guide.sources && guide.sources.length > 0 && (
          <button
            onClick={() => setOpenSources(!openSources)}
            className="w-full flex items-center justify-between text-[10.5px] text-text-subtle hover:text-text-muted transition pt-1"
          >
            <span className="font-semibold uppercase tracking-wider">
              Nguồn tham khảo ({guide.sources.length})
            </span>
            <ChevronDown className={`w-3 h-3 transition ${openSources ? 'rotate-180' : ''}`} />
          </button>
        )}
        {openSources && guide.sources && (
          <div className="space-y-1 -mt-1.5">
            {guide.sources.map((s, i) => (
              <a
                key={i}
                href={s}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[11px] text-text-subtle hover:text-brand-300 transition truncate"
              >
                <ExternalLink className="w-3 h-3 shrink-0" />
                <span className="truncate">{s.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Block({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  items: string[];
  tone: 'emerald' | 'sky' | 'rose';
}) {
  const dot =
    tone === 'emerald' ? 'bg-emerald-400' : tone === 'sky' ? 'bg-sky-400' : 'bg-rose-400';
  return (
    <div>
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-text-subtle flex items-center gap-1.5 mb-1.5">
        {icon} {title}
      </div>
      <ul className="space-y-1">
        {items.map((s, i) => (
          <li key={i} className="flex items-start gap-2 text-[11.5px] text-text-muted leading-relaxed">
            <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${dot}`} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
