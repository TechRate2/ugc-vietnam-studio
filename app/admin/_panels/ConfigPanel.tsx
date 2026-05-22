'use client';

/**
 * Config Panel — Admin §4. Read-only view of LLM routing + cost gate + video
 * models. Edit via env reload (chưa wire UI write — would need admin auth).
 */

import { Settings, RotateCw, Info } from 'lucide-react';
import { useAdminConfig } from '@/lib/studio/use-admin';

export function ConfigPanel() {
  const cfg = useAdminConfig();

  return (
    <div className="px-8 py-6 max-w-5xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-brand-300" />
          <h1 className="text-lg font-semibold text-text">Routing &amp; Config</h1>
        </div>
        <button
          onClick={cfg.refresh}
          disabled={cfg.loading}
          className="text-xs px-3 py-1.5 rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted inline-flex items-center gap-1"
        >
          <RotateCw className={`w-3 h-3 ${cfg.loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-100 text-xs mb-5 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Read-only view. Để thay đổi LLM routing hoặc env config, sửa <code className="font-mono">.env.local</code> rồi restart backend.
        </span>
      </div>

      {cfg.config && (
        <div className="space-y-5">
          {/* LLM */}
          <Section title="LLM Routing">
            <KV label="Provider" value={cfg.config.llm.provider} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-subtle mb-1.5">Per-task models</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(cfg.config.llm.models).map(([task, model]) => (
                  <div key={task} className="px-3 py-1.5 rounded bg-bg-card border border-border">
                    <div className="text-[10px] text-text-subtle uppercase tracking-wider">{task}</div>
                    <div className="text-xs text-text font-mono mt-0.5 break-all">{model}</div>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Cost Gate */}
          <Section title="Cost Gate (Evaluation-driven render)">
            <div className="grid grid-cols-2 gap-3">
              <KV label="Default mode" value={cfg.config.cost_gate.default_mode} />
              <KV label="Default threshold" value={String(cfg.config.cost_gate.default_threshold)} />
            </div>
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-text-subtle mb-1.5">
                Draft model mapping (per-user-model)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {Object.entries(cfg.config.cost_gate.draft_model_map).map(([user, draft]) => (
                  <div key={user} className="px-3 py-1.5 rounded bg-bg-card border border-border flex items-center justify-between text-xs">
                    <span className="font-mono text-text">{user}</span>
                    <span className="text-text-subtle">→</span>
                    <span className="font-mono text-brand-300">{draft}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Video Models */}
          <Section title="Video Models">
            <KV label="Auto picker default" value={cfg.config.video_models.auto_picker_default} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-text-subtle mb-1.5">Available models</div>
              <div className="flex flex-wrap gap-1.5">
                {cfg.config.video_models.available_user_models.map((m) => (
                  <span key={m} className="px-2 py-1 rounded text-xs bg-bg-card border border-border font-mono text-text-muted">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Section>

          {/* App */}
          <Section title="App Runtime">
            <div className="grid grid-cols-3 gap-3">
              <KV label="Environment" value={cfg.config.app.env} />
              <KV label="Port" value={String(cfg.config.app.port)} />
              <KV label="Worker concurrency" value={String(cfg.config.app.worker_concurrency)} />
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-bg-soft px-4 py-3 space-y-2.5">
      <div className="text-[11px] uppercase tracking-widest text-brand-300 font-medium">{title}</div>
      {children}
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-text-subtle uppercase tracking-wider">{label}</div>
      <div className="text-sm text-text font-mono">{value}</div>
    </div>
  );
}
