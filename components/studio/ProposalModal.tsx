'use client';

/**
 * ProposalModal — Modal hiện kết quả Phase 2 (Director's Proposal).
 *
 * Hiển thị:
 *   1. Product summary + niche detected
 *   2. Director concept summary
 *   3. 3 script variants với viral scores (user pick 1)
 *   4. Reference Analysis — mapping ảnh user upload sang vai trò + shots (KHÔNG còn avatar preset)
 *   5. Storyboard preview (text)
 *   6. Global red flags + improvement ideas
 *   7. Cost & time estimate
 *   8. Actions: Reject / ✅ Render
 *
 * Flow:
 *   propose() → proposal data → user pick variant → onApprove(variant, reference_mapping)
 *   onApprove sẽ call POST /api/v1/jobs/ugc với payload đã chosen.
 */

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Clock,
  DollarSign,
  Check,
} from 'lucide-react';
import type {
  Proposal,
  ScriptVariant,
  ReferenceMapping,
  MappedReference,
  ProgressEvent,
  Shot,
  ModelStrategy,
} from '@/lib/studio/use-propose-job';
import { STAGE_LABELS_VN } from '@/lib/studio/use-propose-job';
import { useStoryboardGen, type Keyframe } from '@/lib/studio/use-storyboard-gen';

interface Props {
  proposal: Proposal | null;
  isLoading: boolean;
  progress?: ProgressEvent | null;
  error: string | null;
  onClose: () => void;
  onApprove: (
    selectedVariant: ScriptVariant,
    referenceMapping: ReferenceMapping,
    keyframes?: Keyframe[],
  ) => void;
  onReject?: () => void;
}

export function ProposalModal({
  proposal,
  isLoading,
  progress,
  error,
  onClose,
  onApprove,
  onReject,
}: Props) {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  // Auto-select recommended on proposal load (proper React pattern)
  useEffect(() => {
    if (proposal?.recommended_variant_id && !selectedVariantId) {
      setSelectedVariantId(proposal.recommended_variant_id);
    }
  }, [proposal, selectedVariantId]);

  // Reset selection when modal closes/proposal cleared
  useEffect(() => {
    if (!proposal) {
      setSelectedVariantId(null);
    }
  }, [proposal]);

  const selectedVariant = proposal?.script_variants.find(
    (v) => v.variant_id === selectedVariantId,
  );

  // Storyboard keyframes — Phase 2.5
  const storyboard = useStoryboardGen();
  const hasStructuredShots = !!(proposal?.shots && proposal.shots.length > 0);
  const hasGeneratedKeyframes = storyboard.keyframes.length > 0;

  const handleGenStoryboard = async () => {
    if (!proposal?.shots || !proposal.shots.length) return;
    try {
      await storyboard.genStoryboard({
        proposal_id: proposal.proposal_id,
        shots: proposal.shots,
        character_sheet: proposal.character_sheet || {},
        aspect_ratio: proposal.tech_config?.aspect_ratio || '9:16',
      });
    } catch {
      // error đã set trong hook
    }
  };

  const handleRegenKeyframe = async (shot: Shot) => {
    try {
      await storyboard.regenKeyframe({
        shot,
        character_sheet: proposal?.character_sheet || {},
        aspect_ratio: proposal?.tech_config?.aspect_ratio || '9:16',
      });
    } catch {
      // ignore — UI hiện error per-card
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-bg border border-border rounded-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-bg-soft">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-text">🎬 Director's Proposal</h2>
              <p className="text-xs text-text-muted">
                Phase 2 — Chọn 1 kịch bản + duyệt mapping ảnh tham chiếu, sau đó render
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-hover transition"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isLoading && <LoadingState progress={progress} />}
          {error && <ErrorState error={error} onClose={onClose} />}

          {proposal && !isLoading && !error && (
            <>
              {/* Section 1: Director analysis */}
              <DirectorAnalysis proposal={proposal} />

              {/* Section 2: Script variants */}
              <ScriptVariantsList
                variants={proposal.script_variants}
                selectedId={selectedVariantId}
                recommendedId={proposal.recommended_variant_id}
                onSelect={setSelectedVariantId}
              />

              {/* Section 2.5: V3 Model-Aware Strategy badge */}
              {proposal.model_strategy && (
                <ModelStrategyBadge strategy={proposal.model_strategy} />
              )}

              {/* Section 3: Reference Analysis (replaces Avatar candidates) */}
              <ReferenceAnalysisSection mapping={proposal.reference_mapping} />

              {/* Section 3.5: Storyboard Keyframe gen — Phase 2.5 */}
              {hasStructuredShots && (
                <StoryboardKeyframeSection
                  shots={proposal.shots!}
                  keyframes={storyboard.keyframes}
                  isGenAll={storyboard.isLoading}
                  regenLoadingIds={storyboard.regenLoadingIds}
                  error={storyboard.error}
                  meta={storyboard.meta}
                  onGenAll={handleGenStoryboard}
                  onRegen={handleRegenKeyframe}
                />
              )}

              {/* Section 4: Storyboard preview */}
              <StoryboardPreview frames={proposal.storyboard_preview} />

              {/* Section 5: Red flags + improvements */}
              {(proposal.global_red_flags?.length || 0) > 0 && (
                <RedFlagsList flags={proposal.global_red_flags || []} />
              )}
              {(proposal.global_improvement_ideas?.length || 0) > 0 && (
                <ImprovementIdeas ideas={proposal.global_improvement_ideas || []} />
              )}
            </>
          )}
        </div>

        {/* Footer — actions */}
        {proposal && !isLoading && (
          <div className="px-6 py-4 border-t border-border bg-bg-soft">
            <CostSummary proposal={proposal} />
            <div className="flex items-center justify-end gap-3 mt-3">
              <button
                onClick={onReject || onClose}
                className="px-4 py-2 rounded-lg border border-border hover:border-rose-500 hover:text-rose-400 text-sm text-text-muted transition"
              >
                ❌ Reject, làm lại
              </button>
              <button
                onClick={() => {
                  if (selectedVariant && proposal) {
                    const approvedKeyframes = hasGeneratedKeyframes
                      ? storyboard.keyframes
                      : undefined;
                    onApprove(selectedVariant, proposal.reference_mapping, approvedKeyframes);
                  }
                }}
                disabled={!selectedVariant}
                className="px-6 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Render Variant {selectedVariantId}
                {hasGeneratedKeyframes && (
                  <span className="text-[10px] bg-amber-500/30 px-1.5 py-0.5 rounded">
                    + {storyboard.keyframes.filter((k) => k.image_url).length} keyframes
                  </span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// Inner components
// ============================================

function LoadingState({ progress }: { progress?: ProgressEvent | null }) {
  const pct = progress?.progress_pct ?? 0;
  const stage = progress?.stage || 'init';
  const stageLabel = STAGE_LABELS_VN[stage] || stage;
  const isDone = progress?.status === 'done';
  const elapsed = progress?.elapsed_s;

  const stages = [
    { key: 'strategist', label: 'Phân tích sản phẩm' },
    { key: 'niche', label: 'Xác định niche' },
    { key: 'trends', label: 'Tải trends TikTok VN' },
    { key: 'director', label: 'Đạo diễn cinematic' },
    { key: 'copywriter', label: 'Viết kịch bản + map ảnh' },
    { key: 'critic', label: 'Chấm viral score' },
    { key: 'assemble', label: 'Hoàn tất' },
  ];
  const currentIdx = stages.findIndex((s) => s.key === stage);

  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 gap-5">
      {/* Spinner + current stage */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <p className="text-sm font-semibold text-text">🎬 {stageLabel}</p>
          {progress?.message && (
            <p className="text-xs text-text-subtle mt-1">{progress.message}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted font-medium">
            {pct}% — Bước {Math.max(1, currentIdx + 1)}/{stages.length}
          </span>
          <span className="text-xs text-text-subtle">
            {isDone && elapsed ? `${elapsed}s` : 'đang chạy...'}
          </span>
        </div>
        <div className="h-2 bg-bg-soft rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Stage checklist */}
      <div className="w-full max-w-md grid grid-cols-1 gap-1.5">
        {stages.map((s, idx) => {
          const isCurrent = s.key === stage;
          const isPast = currentIdx > idx || (currentIdx === idx && isDone);
          return (
            <div
              key={s.key}
              className={`flex items-center gap-2 text-xs ${
                isCurrent
                  ? 'text-amber-300 font-medium'
                  : isPast
                  ? 'text-emerald-400/70'
                  : 'text-text-subtle/60'
              }`}
            >
              <span className="w-4 inline-flex justify-center">
                {isPast ? '✓' : isCurrent ? '●' : '○'}
              </span>
              <span>{s.label}</span>
              {isCurrent && isDone === false && (
                <span className="ml-auto text-[10px] text-text-subtle">đang chạy</span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-text-subtle text-center mt-2">
        Tổng ~60-180 giây · cost ~$0.04-0.09
      </p>
    </div>
  );
}

function ErrorState({ error, onClose }: { error: string; onClose: () => void }) {
  return (
    <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-6 text-center">
      <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
      <p className="text-sm text-rose-200 font-medium">Director Agent gặp lỗi</p>
      <p className="text-xs text-text-muted mt-2 break-words">{error}</p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 text-xs border border-border rounded-lg hover:bg-bg-hover"
      >
        Đóng
      </button>
    </div>
  );
}

function DirectorAnalysis({ proposal }: { proposal: Proposal }) {
  const niche = proposal.niche_detected || 'unknown';
  const conf = Math.round((proposal.niche_confidence || 0) * 100);

  return (
    <div className="bg-bg-soft border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🤖</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text">Phân tích</h3>
          <p className="text-sm text-text-muted mt-1">
            <strong>{proposal.product_summary?.name || 'Sản phẩm'}</strong>
            {proposal.product_summary?.price_vnd && (
              <> — {(proposal.product_summary.price_vnd / 1000).toFixed(0)}k VND</>
            )}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-brand-700/20 text-brand-200 border border-brand-700/40">
              Niche: {niche}
            </span>
            <span className="text-text-muted">Confidence: {conf}%</span>
          </div>
          {proposal.director_concept_summary && (
            <p className="text-xs text-text-muted mt-3 leading-relaxed border-l-2 border-amber-400/40 pl-3">
              <strong className="text-amber-400">🎬 Concept:</strong>{' '}
              {proposal.director_concept_summary}
            </p>
          )}
          {proposal.trends_applied && proposal.trends_applied.length > 0 && (
            <div className="mt-2 text-xs text-text-muted">
              <strong>🔥 Trends áp dụng:</strong>{' '}
              {proposal.trends_applied
                .slice(0, 3)
                .map((t: any) => t.title)
                .join(', ')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScriptVariantsList({
  variants,
  selectedId,
  recommendedId,
  onSelect,
}: {
  variants: ScriptVariant[];
  selectedId: string | null;
  recommendedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">
        📜 Chọn 1 trong {variants.length} kịch bản
      </h3>
      <div className="space-y-3">
        {variants.map((v) => (
          <VariantCard
            key={v.variant_id}
            variant={v}
            isSelected={v.variant_id === selectedId}
            isRecommended={v.variant_id === recommendedId}
            onSelect={() => onSelect(v.variant_id)}
          />
        ))}
      </div>
    </div>
  );
}

function VariantCard({
  variant,
  isSelected,
  isRecommended,
  onSelect,
}: {
  variant: ScriptVariant;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  const score = variant.viral_score;
  const scoreColor =
    score && score >= 8
      ? 'text-emerald-400 border-emerald-500/40'
      : score && score >= 6
      ? 'text-amber-400 border-amber-500/40'
      : 'text-rose-400 border-rose-500/40';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left border rounded-xl p-4 transition ${
        isSelected
          ? 'border-brand-500 bg-brand-700/10'
          : 'border-border hover:border-border-strong bg-bg-soft/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text">Variant {variant.variant_id}</span>
          {variant.diversity_tag && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg border border-border text-text-muted">
              {variant.diversity_tag}
            </span>
          )}
          {isRecommended && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
              ⭐ Recommended
            </span>
          )}
        </div>
        {typeof score === 'number' && (
          <div
            className={`text-xs font-bold border rounded-full px-2 py-0.5 ${scoreColor}`}
          >
            Viral {score.toFixed(1)}/10
          </div>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <ScriptLine label="HOOK" text={variant.hook?.text_vn} />
        {variant.body?.segments?.length > 0 && (
          <ScriptLine
            label="BODY"
            text={variant.body.segments.map((s) => s.text_vn).join(' / ')}
            muted
          />
        )}
        <ScriptLine label="CTA" text={variant.cta?.text_vn} />
      </div>

      {(variant.strengths?.length || 0) > 0 && (
        <div className="mt-3 text-xs text-emerald-400/90 space-y-0.5">
          {variant.strengths!.slice(0, 2).map((s, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-emerald-500">✓</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      )}

      {(variant.weaknesses?.length || 0) > 0 && (
        <div className="mt-1 text-xs text-rose-400/80 space-y-0.5">
          {variant.weaknesses!.slice(0, 1).map((w, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <span className="text-rose-500">!</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </button>
  );
}

function ScriptLine({
  label,
  text,
  muted = false,
}: {
  label: string;
  text?: string;
  muted?: boolean;
}) {
  if (!text) return null;
  return (
    <div className="flex items-start gap-2">
      <span className="text-[10px] font-bold text-text-subtle mt-0.5 shrink-0 w-10">
        {label}
      </span>
      <span className={`text-sm ${muted ? 'text-text-muted' : 'text-text'} leading-snug`}>
        {text}
      </span>
    </div>
  );
}

function ModelStrategyBadge({ strategy }: { strategy: ModelStrategy }) {
  const [showRanking, setShowRanking] = useState(false);
  const ranking = strategy.ranking || [];

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-text">
            Director pick model:{' '}
            <span className="text-amber-300">{strategy.picked_display_name}</span>
          </h3>
        </div>
        {ranking.length > 1 && (
          <button
            onClick={() => setShowRanking((s) => !s)}
            className="text-[11px] text-amber-300 hover:text-amber-200 underline underline-offset-2"
          >
            {showRanking ? 'Ẩn ranking' : `Xem ranking ${ranking.length} model`}
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted leading-relaxed mb-2">
        <span className="text-amber-300/80 font-medium">Vì sao:</span>{' '}
        {strategy.picked_reasoning || '—'}
      </p>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
        <span>
          <span className="text-text/60">Storyboard format:</span>{' '}
          {strategy.storyboard_format}
        </span>
        <span>
          <span className="text-text/60">Max refs:</span> {strategy.max_refs}
        </span>
        {strategy.needs_keyframe_gen && (
          <span className="text-emerald-400">• gen keyframes trước</span>
        )}
        {strategy.needs_tts_first && (
          <span className="text-sky-400">• TTS trước (lipsync)</span>
        )}
      </div>

      {showRanking && ranking.length > 0 && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 space-y-1.5">
          {ranking.map((r) => (
            <div
              key={r.user_model}
              className={`flex items-start gap-2 text-[11px] ${
                r.selected ? 'text-amber-300' : 'text-text-muted'
              }`}
            >
              <span className="w-12 shrink-0 font-mono tabular-nums">
                {r.score.toFixed(2)}
              </span>
              <div className="flex-1">
                <div className="font-medium">
                  {r.selected && '✓ '}
                  {r.display_name}
                </div>
                <div className="text-text-muted/70">{r.reasoning}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReferenceAnalysisSection({ mapping }: { mapping?: ReferenceMapping }) {
  if (!mapping) return null;
  const count = mapping.reference_count ?? 0;
  const refs = mapping.mapped_references || [];
  const missing = mapping.missing_references || [];
  const warnings = mapping.warnings || [];
  const hint = mapping.rendering_hint;

  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">
        🖼️ Phân tích references ({count} ảnh upload)
      </h3>

      {mapping.primary_persona_summary && (
        <div className="text-xs text-text-muted mb-3 italic border-l-2 border-amber-400/40 pl-3">
          {mapping.primary_persona_summary}
        </div>
      )}

      {refs.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {refs.map((r) => (
            <RefCard key={r.index} ref_={r} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-text-muted mb-3 italic">
          Anh chưa upload ảnh tham chiếu. AI sẽ gen all visuals từ prompt only.
        </div>
      )}

      {missing.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-2">
          <div className="text-xs font-bold text-amber-400 mb-2">📌 Gợi ý upload thêm</div>
          {missing.map((m, i) => (
            <div key={i} className="text-xs text-text-muted mb-1.5 last:mb-0">
              <strong className="text-amber-300">{m.missing_role}</strong>:{' '}
              {m.suggestion_to_user}
            </div>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 mb-2">
          <div className="text-xs font-bold text-rose-400 mb-2">⚠️ Cảnh báo chất lượng</div>
          {warnings.map((w, i) => (
            <div key={i} className="text-xs text-text-muted mb-1">▸ {w}</div>
          ))}
        </div>
      )}

      {hint && (
        <div className="text-[10px] text-text-subtle">
          {hint.refs_used}/{hint.max_refs_for_chosen_model} ref slots used · {hint.recommendation}
        </div>
      )}
    </div>
  );
}

function RefCard({ ref_ }: { ref_: MappedReference }) {
  const roleEmoji: Record<string, string> = {
    primary_subject: '👤',
    product: '📦',
    product_detail: '🔍',
    style_reference: '🎨',
    background_environment: '🌆',
    brand_asset: '🏷️',
    unknown: '❓',
  };

  return (
    <div className="border border-border bg-bg-soft/30 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-base">{roleEmoji[ref_.role] || '🖼️'}</span>
        <span className="text-xs font-medium text-text">Ảnh {ref_.index + 1}</span>
        <span className="text-[10px] text-text-subtle">· {ref_.role}</span>
      </div>
      {ref_.best_for_shots && ref_.best_for_shots.length > 0 && (
        <div className="text-[10px] text-text-muted line-clamp-2">
          Dùng cho: {ref_.best_for_shots.slice(0, 2).join(', ')}
        </div>
      )}
    </div>
  );
}

function StoryboardPreview({ frames }: { frames: any[] }) {
  if (!frames || frames.length === 0) return null;
  return (
    <div>
      <h3 className="text-sm font-semibold text-text mb-3">
        🎬 Storyboard preview ({frames.length} shots)
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {frames.map((f, idx) => (
          <div
            key={idx}
            className="shrink-0 w-44 border border-border rounded-lg p-3 bg-bg-soft/30"
          >
            <div className="text-[10px] text-text-subtle">Shot {f.shot_id || idx + 1}</div>
            <div className="text-xs font-medium text-amber-400 mt-1">
              {f.purpose || 'shot'} · {f.duration_s || '?'}s
            </div>
            <div className="text-xs text-text-muted mt-2 line-clamp-3">
              {f.action_vn || f.framing}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RedFlagsList({ flags }: { flags: string[] }) {
  return (
    <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
        <AlertTriangle className="w-3.5 h-3.5" />
        Red Flags ({flags.length})
      </div>
      <ul className="space-y-1 text-xs text-text-muted">
        {flags.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">▸</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImprovementIdeas({ ideas }: { ideas: string[] }) {
  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
      <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
        <Lightbulb className="w-3.5 h-3.5" />
        Gợi ý cải thiện
      </div>
      <ul className="space-y-1 text-xs text-text-muted">
        {ideas.map((idea, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-amber-500 mt-0.5">▸</span>
            <span>{idea}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostSummary({ proposal }: { proposal: Proposal }) {
  return (
    <div className="flex items-center gap-6 text-xs text-text-muted">
      <div className="flex items-center gap-1.5">
        <DollarSign className="w-3.5 h-3.5" />
        <span>
          Render cost: <strong className="text-text">${proposal.estimated_render_cost_usd}</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" />
        <span>
          Time: <strong className="text-text">~{Math.round(proposal.estimated_render_time_s / 60)} phút</strong>
        </span>
      </div>
      <div className="flex items-center gap-1.5 ml-auto">
        <span className="text-text-subtle">
          Phase 2 đã chi: ${proposal.cost_so_far_phase2_usd}
        </span>
      </div>
    </div>
  );
}

// ============================================
// Storyboard Keyframe Section — Phase 2.5
// ============================================

function StoryboardKeyframeSection({
  shots,
  keyframes,
  isGenAll,
  regenLoadingIds,
  error,
  meta,
  onGenAll,
  onRegen,
}: {
  shots: Shot[];
  keyframes: Keyframe[];
  isGenAll: boolean;
  regenLoadingIds: Set<string>;
  error: string | null;
  meta: { total_cost_usd: number; elapsed_s: number; success_count: number; fail_count: number } | null;
  onGenAll: () => void;
  onRegen: (shot: Shot) => void;
}) {
  // Map keyframes theo shot_id để render side-by-side với shots
  const kfByShotId = new Map(keyframes.map((k) => [k.shot_id, k]));
  const hasGenerated = keyframes.length > 0;
  const estCost = (shots.length * 0.036).toFixed(2);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text">🖼️ Storyboard Keyframes (Tùy chọn)</h3>
          <p className="text-xs text-text-muted mt-0.5">
            Gen ảnh tĩnh cho mỗi cảnh — duyệt trước khi đốt $ video.
            Chất lượng + identity consistency cao hơn (như Topview/Higgsfield)
          </p>
        </div>
        {!hasGenerated && (
          <button
            onClick={onGenAll}
            disabled={isGenAll}
            className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition disabled:opacity-50 flex items-center gap-1.5"
          >
            {isGenAll ? (
              <>
                <span className="w-3 h-3 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                Đang gen {shots.length} ảnh...
              </>
            ) : (
              <>🎨 Gen storyboard (~${estCost}, ~15s)</>
            )}
          </button>
        )}
        {hasGenerated && meta && (
          <div className="text-[11px] text-text-subtle text-right">
            ✅ {meta.success_count}/{shots.length} ảnh · ${meta.total_cost_usd} · {meta.elapsed_s}s
          </div>
        )}
      </div>

      {error && (
        <div className="text-[11px] text-rose-300 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 mb-3">
          {error}
        </div>
      )}

      {/* Grid keyframes */}
      {hasGenerated && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {shots.map((shot) => {
            const kf = kfByShotId.get(shot.shot_id);
            const isRegenning = regenLoadingIds.has(shot.shot_id);
            return (
              <KeyframeCard
                key={shot.shot_id}
                shot={shot}
                keyframe={kf}
                isRegenning={isRegenning}
                onRegen={() => onRegen(shot)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function KeyframeCard({
  shot,
  keyframe,
  isRegenning,
  onRegen,
}: {
  shot: Shot;
  keyframe?: Keyframe;
  isRegenning: boolean;
  onRegen: () => void;
}) {
  const hasImage = keyframe?.image_url;
  const isFailed = keyframe?.status === 'failed';

  return (
    <div className="rounded-xl border border-border bg-bg-soft overflow-hidden flex flex-col">
      {/* Image preview */}
      <div className="relative aspect-[9/16] bg-bg-card flex items-center justify-center overflow-hidden">
        {isRegenning ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] text-text-muted">Đang gen lại...</span>
          </div>
        ) : hasImage ? (
          <img
            src={keyframe!.image_url!}
            alt={`Shot ${shot.shot_id}`}
            className="w-full h-full object-cover"
          />
        ) : isFailed ? (
          <div className="text-center px-3">
            <div className="text-2xl mb-1">❌</div>
            <div className="text-[10px] text-rose-300">{keyframe?.error?.slice(0, 60) || 'Gen fail'}</div>
          </div>
        ) : (
          <div className="text-text-subtle text-xs">Chưa gen</div>
        )}
        {/* Shot ID badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-mono">
          {shot.shot_id} · {shot.duration_s}s · {shot.purpose}
        </div>
      </div>
      {/* Caption + action */}
      <div className="px-2.5 py-2 space-y-1.5">
        {shot.dialogue_vn && (
          <p className="text-[10.5px] text-text-muted line-clamp-2 italic">"{shot.dialogue_vn}"</p>
        )}
        {shot.caption_on_screen && (
          <p className="text-[10px] text-amber-300/80 line-clamp-1">📝 {shot.caption_on_screen}</p>
        )}
        <button
          onClick={onRegen}
          disabled={isRegenning}
          className="w-full mt-1 px-2 py-1 rounded-md bg-bg-hover hover:bg-bg-card border border-border text-[10.5px] font-medium text-text-muted hover:text-text transition disabled:opacity-50"
        >
          🔄 Gen lại
        </button>
      </div>
    </div>
  );
}
