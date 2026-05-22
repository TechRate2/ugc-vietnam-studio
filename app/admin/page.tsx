'use client';

/**
 * /admin — Admin Panel (V3 §4.7).
 *
 * 4 section qua left sidebar:
 *   1. Style Presets — Library reusable visual_style + audio + setting bundles
 *   2. Prompt Library — Edit director.md / scene.md / evaluation.md / revise.md
 *   3. Credits — Vendor wallet balances (view-only, real APIs not yet wired)
 *   4. Config — Read current LLM routing / cost gate / model availability
 */

import { useState } from 'react';
import Link from 'next/link';
import {
  Palette, FileText, CreditCard, Settings, ArrowLeft,
} from 'lucide-react';
import { StylePresetsPanel } from './_panels/StylePresetsPanel';
import { PromptLibraryPanel } from './_panels/PromptLibraryPanel';
import { CreditsPanel } from './_panels/CreditsPanel';
import { ConfigPanel } from './_panels/ConfigPanel';

type Section = 'presets' | 'prompts' | 'credits' | 'config';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; hint: string }[] = [
  { id: 'presets', label: 'Style Presets', icon: <Palette className="w-4 h-4" />, hint: 'Reusable visual + audio + setting bundles' },
  { id: 'prompts', label: 'Prompt Library', icon: <FileText className="w-4 h-4" />, hint: 'Director / Scene / Eval / Revise system prompts' },
  { id: 'credits', label: 'Credits', icon: <CreditCard className="w-4 h-4" />, hint: 'Vendor wallet status' },
  { id: 'config', label: 'Config', icon: <Settings className="w-4 h-4" />, hint: 'LLM routing + cost gate' },
];

export default function AdminPage() {
  const [section, setSection] = useState<Section>('presets');

  return (
    <main className="min-h-screen flex bg-bg">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-bg-card">
        <div className="px-4 py-4 border-b border-border">
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-brand-300 transition">
            <ArrowLeft className="w-3 h-3" /> Quay lại Studio
          </Link>
          <div className="mt-3">
            <div className="text-[10px] uppercase tracking-widest text-brand-300 font-medium">CineForge</div>
            <div className="text-sm font-semibold text-text">Admin Panel</div>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md transition ${
                section === s.id
                  ? 'bg-brand-500/15 border border-brand-500/30 text-brand-200'
                  : 'text-text-muted hover:text-text hover:bg-bg-soft border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                {s.icon} <span>{s.label}</span>
              </div>
              <div className="text-[10px] text-text-subtle mt-0.5 ml-6">{s.hint}</div>
            </button>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-border text-[10px] text-text-subtle">
          CineForge AI V3 · spec compliance ~95%
        </div>
      </aside>

      {/* Main */}
      <section className="flex-1 overflow-y-auto">
        {section === 'presets' && <StylePresetsPanel />}
        {section === 'prompts' && <PromptLibraryPanel />}
        {section === 'credits' && <CreditsPanel />}
        {section === 'config' && <ConfigPanel />}
      </section>
    </main>
  );
}
