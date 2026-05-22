'use client';

/**
 * Credits Panel — Admin §3. View-only wallet status per vendor.
 */

import { CreditCard, ExternalLink, CheckCircle2, XCircle, RotateCw } from 'lucide-react';
import { useAdminConfig } from '@/lib/studio/use-admin';

const VENDOR_LINKS: Record<string, { label: string; topup_url: string }> = {
  atlascloud: { label: 'AtlasCloud (image/video)', topup_url: 'https://www.atlascloud.ai/dashboard' },
  atlascloud_llm: { label: 'AtlasCloud LLM (Coding Plan)', topup_url: 'https://www.atlascloud.ai/dashboard' },
  genmax: { label: 'GenMax (VN TTS)', topup_url: 'https://genmax.io' },
  anthropic: { label: 'Anthropic (Claude fallback)', topup_url: 'https://console.anthropic.com' },
};

export function CreditsPanel() {
  const cfg = useAdminConfig();

  return (
    <div className="px-8 py-6 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-brand-300" />
          <h1 className="text-lg font-semibold text-text">Wallet Status</h1>
        </div>
        <button
          onClick={cfg.refresh}
          disabled={cfg.loading}
          className="text-xs px-3 py-1.5 rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted inline-flex items-center gap-1"
        >
          <RotateCw className={`w-3 h-3 ${cfg.loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {cfg.error && (
        <div className="mb-4 px-3 py-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
          {cfg.error}
        </div>
      )}

      {cfg.credits && (
        <div className="space-y-3">
          {(['atlascloud', 'atlascloud_llm', 'genmax', 'anthropic'] as const).map((key) => {
            const c = cfg.credits![key];
            const meta = VENDOR_LINKS[key];
            const ok = c.key_set;
            return (
              <div key={key} className="rounded-lg border border-border bg-bg-soft px-4 py-3">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-text">{meta.label}</div>
                      <div className="text-[10px] text-text-subtle font-mono">{c.key_masked || '(không set)'}</div>
                    </div>
                  </div>
                  <a
                    href={meta.topup_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-brand-300 hover:underline inline-flex items-center gap-1"
                  >
                    Top-up <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-[11px] text-text-muted ml-6">
                  {c.balance_source}
                </div>
              </div>
            );
          })}

          {/* R2 separate */}
          <div className="rounded-lg border border-border bg-bg-soft px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                {cfg.credits.r2.configured ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <div>
                  <div className="text-sm font-medium text-text">Cloudflare R2 (output storage)</div>
                  <div className="text-[10px] text-text-subtle font-mono">
                    bucket: {cfg.credits.r2.bucket}
                    {cfg.credits.r2.public_url && ` · public: ${cfg.credits.r2.public_url}`}
                  </div>
                </div>
              </div>
              <a
                href="https://dash.cloudflare.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand-300 hover:underline inline-flex items-center gap-1"
              >
                Dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-[11px] text-text-muted ml-6">
              {cfg.credits.r2.configured
                ? 'Wired — final MP4 + refined clips upload tự động.'
                : 'Chưa cấu hình — render output sẽ fallback về file:// local.'}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 px-4 py-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-100 text-xs leading-relaxed">
        <strong>Lưu ý:</strong> Backend chưa wire real balance API (AtlasCloud / GenMax không expose
        public balance endpoint qua API key thông thường). Track balance ở dashboard từng vendor.
      </div>
    </div>
  );
}
