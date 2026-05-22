'use client';

/**
 * StoryboardSection — Phase 2.5 keyframe gen panel cho SceneEditorModal.
 *
 * Workflow:
 *   1. User click "🎨 Gen Storyboard" — cost upfront $0.036 × N (~$0.25)
 *   2. Show grid N keyframes (9:16 aspect, ~10-15s gen parallel)
 *   3. Per-card: image preview + shot info + button "🔄 Gen lại"
 *   4. User OK all → bottom CTA "Start Generation" sẽ pass approvedKeyframes
 *      vào /jobs/ugc → render i2v chain với identity 100% consistent
 *
 * Pattern: TopView / Higgsfield Soul.0 / Krea — gen keyframe UPFRONT,
 * user duyệt ảnh trước khi đốt $ video.
 */

import { useState } from 'react';
import { Sparkles, Loader2, RefreshCw, Image as ImgIcon, CheckCircle2 } from 'lucide-react';
import type { Shot, CharacterSheet } from '@/lib/studio/use-propose-job';
import { useStoryboardGen, type Keyframe } from '@/lib/studio/use-storyboard-gen';

interface Props {
  /** Shots từ proposal.shots (MCSLA format) */
  shots: Shot[];
  /** Character anchor để inject vào image gen prompt */
  characterSheet: CharacterSheet | Record<string, any>;
  /** Aspect ratio cho ảnh (9:16 / 16:9 / 1:1) */
  aspectRatio: string;
  /** proposal_id để track */
  proposalId?: string;
  /** Callback khi user "OK all" — pass keyframes lên parent để render với i2v */
  onKeyframesApproved: (keyframes: Keyframe[]) => void;
}

export function StoryboardSection({
  shots,
  characterSheet,
  aspectRatio,
  proposalId,
  onKeyframesApproved,
}: Props) {
  const storyboard = useStoryboardGen();
  const [approved, setApproved] = useState(false);
  const estCost = (shots.length * 0.036).toFixed(2);
  const hasGenerated = storyboard.keyframes.length > 0;
  const successCount = storyboard.keyframes.filter((k) => k.image_url).length;

  const handleGenAll = async () => {
    if (!shots.length) return;
    setApproved(false);
    try {
      await storyboard.genStoryboard({
        proposal_id: proposalId,
        shots,
        character_sheet: characterSheet,
        aspect_ratio: aspectRatio,
      });
    } catch {
      // error đã set trong hook
    }
  };

  const handleRegen = async (shot: Shot) => {
    try {
      await storyboard.regenKeyframe({
        shot,
        character_sheet: characterSheet,
        aspect_ratio: aspectRatio,
      });
    } catch {
      // ignore per-card
    }
  };

  const handleApprove = () => {
    setApproved(true);
    onKeyframesApproved(storyboard.keyframes.filter((k) => k.image_url));
  };

  return (
    <div className="border-t border-border bg-bg-soft/30 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-text flex items-center gap-2">
            <ImgIcon className="w-4 h-4 text-amber-400" />
            🎨 Storyboard Keyframes
            <span className="text-[10px] font-normal text-text-subtle">
              (Phase 2.5 — Tùy chọn)
            </span>
          </h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            Gen ảnh tĩnh mỗi cảnh — duyệt trước khi đốt $ video. Identity consistency
            cao hơn (Higgsfield Soul.0 pattern).
          </p>
        </div>
        {!hasGenerated && (
          <button
            onClick={handleGenAll}
            disabled={storyboard.isLoading || shots.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-medium transition disabled:opacity-50"
          >
            {storyboard.isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Đang gen {shots.length} ảnh…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Gen storyboard (~${estCost} · ~15s)
              </>
            )}
          </button>
        )}
        {hasGenerated && storyboard.meta && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-text-subtle">
              ✅ {storyboard.meta.success_count}/{shots.length} · $
              {storyboard.meta.total_cost_usd} · {storyboard.meta.elapsed_s}s
            </span>
            {!approved && successCount > 0 && (
              <button
                onClick={handleApprove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 text-xs font-medium transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Duyệt + dùng cho render
              </button>
            )}
            {approved && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                Đã duyệt — sẽ render i2v
              </span>
            )}
          </div>
        )}
      </div>

      {storyboard.error && (
        <div className="text-[11px] text-rose-300 px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 mb-3">
          ⚠️ {storyboard.error}
        </div>
      )}

      {/* Grid keyframes — 3 col desktop, 2 mobile */}
      {hasGenerated && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {shots.map((shot) => {
            const kf = storyboard.keyframes.find((k) => k.shot_id === shot.shot_id);
            const isRegenning = storyboard.regenLoadingIds.has(shot.shot_id);
            return (
              <KeyframeCard
                key={shot.shot_id}
                shot={shot}
                keyframe={kf}
                isRegenning={isRegenning}
                disabled={approved}
                onRegen={() => handleRegen(shot)}
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
  disabled,
  onRegen,
}: {
  shot: Shot;
  keyframe?: Keyframe;
  isRegenning: boolean;
  disabled: boolean;
  onRegen: () => void;
}) {
  const hasImage = keyframe?.image_url;
  const isFailed = keyframe?.status === 'failed';

  return (
    <div className="rounded-xl border border-border bg-bg-soft overflow-hidden flex flex-col">
      <div className="relative aspect-[9/16] bg-bg-card flex items-center justify-center overflow-hidden">
        {isRegenning ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-[10px] text-text-muted">Đang gen lại…</span>
          </div>
        ) : hasImage ? (
          <img
            src={keyframe!.image_url!}
            alt={`Shot ${shot.shot_id}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : isFailed ? (
          <div className="text-center px-2">
            <div className="text-xl mb-1">❌</div>
            <div className="text-[9px] text-rose-300 line-clamp-2">
              {keyframe?.error?.slice(0, 60) || 'Gen fail'}
            </div>
          </div>
        ) : (
          <div className="text-text-subtle text-xs">Chưa gen</div>
        )}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-mono">
          {shot.shot_id} · {shot.duration_s}s · {shot.purpose}
        </div>
      </div>
      <div className="px-2.5 py-2 space-y-1">
        {shot.dialogue_vn && (
          <p className="text-[10px] text-text-muted line-clamp-2 italic">
            "{shot.dialogue_vn}"
          </p>
        )}
        {shot.caption_on_screen && (
          <p className="text-[10px] text-amber-300/80 line-clamp-1">
            📝 {shot.caption_on_screen}
          </p>
        )}
        <button
          onClick={onRegen}
          disabled={isRegenning || disabled}
          className="w-full mt-1 px-2 py-1 rounded-md bg-bg-hover hover:bg-bg-card border border-border text-[10px] font-medium text-text-muted hover:text-text transition disabled:opacity-40 flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Gen lại
        </button>
      </div>
    </div>
  );
}
