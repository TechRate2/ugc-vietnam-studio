'use client';

/**
 * Prompt Library Panel — Admin §2.
 *
 * List 4 system prompts (director / scene / evaluation / revise). Click → open
 * monospace textarea editor. Save → PUT /admin/prompts/{name} → backend writes
 * .md.bak backup + clears lru_cache so next LLM call uses new content.
 */

import { useEffect, useState } from 'react';
import { FileText, Save, RotateCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { usePromptLibrary } from '@/lib/studio/use-admin';

const PROMPT_LABELS: Record<string, string> = {
  director: 'Director (Layer 1) — generate Continuity Bible + Shot List',
  scene: 'Scene Generation (Layer 2) — per-shot model-ready prompt',
  evaluation: 'Evaluation — self-critique scoring',
  revise: 'Revise — Workspace Chat mutation',
};

export function PromptLibraryPanel() {
  const lib = usePromptLibrary();
  const [active, setActive] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [original, setOriginal] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'ok' | 'fail'; msg: string } | null>(null);

  // Auto-load first prompt
  useEffect(() => {
    if (!active && lib.items.length > 0) {
      void handleSelect(lib.items[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lib.items.length]);

  const handleSelect = async (name: string) => {
    setActive(name);
    setStatus(null);
    setLoading(true);
    try {
      const body = await lib.load(name);
      setContent(body.content);
      setOriginal(body.content);
    } catch (e) {
      setStatus({ type: 'fail', msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!active) return;
    setSaving(true);
    setStatus(null);
    try {
      await lib.save(active, content);
      setOriginal(content);
      setStatus({ type: 'ok', msg: 'Đã lưu — backend lru_cache cleared, lần LLM call tiếp sẽ dùng prompt mới.' });
    } catch (e) {
      setStatus({ type: 'fail', msg: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setContent(original);
    setStatus(null);
  };

  const isDirty = content !== original;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-300" />
          <h1 className="text-sm font-semibold text-text">System Prompts</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {lib.loading ? (
            <div className="px-3 py-2 text-text-subtle text-xs">Đang tải…</div>
          ) : (
            lib.items.map((it) => (
              <button
                key={it.name}
                onClick={() => handleSelect(it.name)}
                className={`w-full text-left px-3 py-2 rounded-md transition ${
                  active === it.name
                    ? 'bg-brand-500/15 border border-brand-500/30 text-brand-200'
                    : 'text-text-muted hover:text-text hover:bg-bg-soft border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-sm">{it.name}.md</span>
                  <span className="text-[10px] text-text-subtle">{Math.round(it.size / 1024)}K</span>
                </div>
                <div className="text-[10px] text-text-subtle mt-0.5 line-clamp-2">{PROMPT_LABELS[it.name] ?? ''}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text">{active ? `${active}.md` : 'Chọn prompt'}</h2>
            {active && (
              <div className="text-[11px] text-text-subtle mt-0.5">
                {PROMPT_LABELS[active] ?? ''} · {content.length} chars
              </div>
            )}
          </div>
          {active && (
            <div className="flex items-center gap-2">
              {isDirty && (
                <button
                  onClick={handleRevert}
                  className="text-xs px-3 py-1.5 rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted inline-flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" /> Revert
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="text-xs px-4 py-1.5 rounded-md bg-gradient-to-r from-brand-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 text-white inline-flex items-center gap-1.5"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                Save
              </button>
            </div>
          )}
        </div>
        {status && (
          <div className={`mx-5 mt-3 px-3 py-2 rounded-md text-xs flex items-start gap-2 ${
            status.type === 'ok'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-200'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-200'
          }`}>
            {status.type === 'ok' ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
            <span>{status.msg}</span>
          </div>
        )}
        <div className="flex-1 px-5 py-3">
          {loading ? (
            <div className="text-text-subtle text-sm">Đang tải prompt…</div>
          ) : active ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
              className="w-full h-full bg-bg-soft border border-border rounded-md px-3 py-2.5 text-xs text-text font-mono leading-relaxed focus:outline-none focus:border-brand-500 resize-none"
            />
          ) : (
            <div className="text-text-subtle text-sm">Chọn 1 prompt bên trái để edit.</div>
          )}
        </div>
      </div>
    </div>
  );
}
