'use client';

/**
 * SceneEditorModal — Multi-Scene Editor (TopView V2 Video Agent V2 pattern).
 *
 * Replace ProposalModal cũ — thay vì show 3 variants + storyboard preview,
 * giờ show LIST scenes editable + bottom CTA "Start Generation".
 *
 * Layout (mimic TopView V2 screenshot):
 *   ┌─ ASSETS sidebar [N]  │  Multi-Scene main panel                            ─┐
 *   │  📷 Image 1          │  ⓵ New scene                              [8s ▼]   │
 *   │  📷 Image 2          │  ┌─ prompt textarea ─────────────────────────────┐ │
 *   │  + Add               │  │ UGC vertical 9:16. Female influencer @       │ │
 *   │                       │  │ [Image 2] holds blush [Image 1]...           │ │
 *   │                       │  └────────────────────────────────────────────────┘│
 *   │                       │   @  ✨Enhance                                    │
 *   │                       │                                                    │
 *   │                       │  ⓶ → Extends from Scene 1                  [7s ▼] │
 *   │                       │  ...                                              │
 *   │                       │  [+ Add Scene]                                    │
 *   │                       │  2 scenes · 15s · ~$0.50 · ~13min                 │
 *   └──────────────────────┴─[Standard][9:16][720p][✨Enhance All][▷ Start]────┘
 */

import { useState, useRef } from 'react';
import { X, Plus, Trash2, Sparkles, Clock, ChevronDown, Loader2, Play, AtSign } from 'lucide-react';
import type { Proposal, ProgressEvent } from '@/lib/studio/use-propose-job';
import { STAGE_LABELS_VN } from '@/lib/studio/use-propose-job';
import { useSceneEditor, type SceneDraft, type ApprovedScene } from '@/lib/studio/use-scene-editor';
import { useEnhancePrompt, type CharacterAnchorPayload } from '@/lib/studio/use-enhance-prompt';
import {
  insertMentionAtCursor,
  splitPromptSegments,
} from '@/lib/studio/parse-image-mentions';
import { StoryboardSection } from './StoryboardSection';
import type { Keyframe } from '@/lib/studio/use-storyboard-gen';

interface Props {
  proposal: Proposal | null;
  referenceImages: string[];
  isLoading: boolean;
  progress?: ProgressEvent | null;
  error: string | null;
  onClose: () => void;
  /** User click "Start Generation" → submit scenes approved cho Phase 3.
   * NEW v3: kèm approvedKeyframes nếu user đã gen storyboard ở Phase 2.5
   * (i2v render path với identity 100% consistent).
   */
  onStartGeneration: (scenes: ApprovedScene[], approvedKeyframes?: Keyframe[]) => void;
  onReject?: () => void;
  /** Optional — user click "Thử lại" trên error state → re-trigger propose */
  onRetry?: () => void;
}

export function SceneEditorModal({
  proposal,
  referenceImages,
  isLoading,
  progress,
  error,
  onClose,
  onStartGeneration,
  onReject,
  onRetry,
}: Props) {
  const editor = useSceneEditor(proposal);
  const enhance = useEnhancePrompt();
  // NEW v3: approved keyframes từ StoryboardSection — pass vào Phase 3 nếu user OK
  const [approvedKeyframes, setApprovedKeyframes] = useState<Keyframe[]>([]);

  // Build character anchor payload từ proposal (Higgsfield Soul.0 — inject vào enhance prompt)
  const characterAnchor: CharacterAnchorPayload | undefined = (() => {
    const anchor = proposal?.visual_plan?.primary_character_anchor;
    if (!anchor || !anchor.face_descriptor) return undefined;
    return {
      face_descriptor: anchor.face_descriptor,
      outfit_top: anchor.outfit_top,
      outfit_bottom: anchor.outfit_bottom,
      age_apparent: anchor.age_apparent,
      gender: anchor.gender,
    };
  })();

  const aspectRatio = (proposal?.tech_config?.aspect_ratio || '9:16') as '9:16' | '16:9' | '1:1';

  // Single-scene enhance
  const handleEnhanceScene = async (scene: SceneDraft) => {
    if (!scene.prompt.trim()) return;
    try {
      const result = await enhance.enhanceSingle({
        scene_id: scene.id,
        raw_prompt: scene.prompt,
        aspect_ratio: aspectRatio,
        duration_s: scene.duration_s,
        image_refs: scene.image_refs,
        character_anchor: characterAnchor,
        purpose: scene.purpose,
      });
      editor.updateScene(scene.id, { prompt: result.enhanced_prompt });
    } catch {
      // error đã set vào enhance.error
    }
  };

  // Enhance All — batch parallel
  const handleEnhanceAll = async () => {
    const scenesToEnhance = editor.scenes.filter((s) => s.prompt.trim().length > 0);
    if (scenesToEnhance.length === 0) return;
    try {
      const result = await enhance.enhanceBatch({
        scenes: scenesToEnhance.map((s) => ({
          scene_id: s.id,
          raw_prompt: s.prompt,
          duration_s: s.duration_s,
          image_refs: s.image_refs,
          purpose: s.purpose,
        })),
        aspect_ratio: aspectRatio,
        character_anchor: characterAnchor,
      });
      // Update all scenes với enhanced prompts
      for (const r of result.results) {
        if (r.status === 'completed') {
          editor.updateScene(r.scene_id, { prompt: r.enhanced_prompt });
        }
      }
    } catch {
      // error đã set
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 md:p-6">
      <div className="bg-bg border border-border rounded-2xl w-full max-w-7xl h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between bg-bg-soft">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-text">🎬 Multi-Scene Editor</h2>
              <p className="text-[11px] text-text-muted">
                Plan multiple scene prompts, then generate them as a queue.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-hover transition">
            <X className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* V3.1 — Per-model prompt format tip (industry standard) */}
        {proposal?.model_strategy && (
          <ModelFormatTip
            model={proposal.model_strategy.picked_model}
            storyboardFormat={proposal.model_strategy.storyboard_format}
          />
        )}

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <LoadingState progress={progress} />
          ) : error ? (
            <ErrorState error={error} onClose={onClose} onRetry={onRetry} />
          ) : (
            <>
              {/* LEFT: Assets sidebar */}
              <AssetsSidebar referenceImages={referenceImages} />

              {/* RIGHT: Scenes list */}
              <ScenesPanel
                scenes={editor.scenes}
                referenceImages={referenceImages}
                onUpdate={editor.updateScene}
                onRemove={editor.removeScene}
                onAdd={editor.addScene}
                onEnhanceScene={handleEnhanceScene}
                perSceneLoading={enhance.perSceneLoading}
                enhanceError={enhance.error}
              />
            </>
          )}
        </div>

        {/* NEW v3 — Storyboard Phase 2.5 (TÙY CHỌN): gen keyframe ảnh upfront,
            user duyệt rồi mới render i2v → identity 100% consistent */}
        {proposal && !isLoading && !error && proposal.shots && proposal.shots.length > 0 && (
          <StoryboardSection
            shots={proposal.shots}
            characterSheet={proposal.character_sheet || {}}
            aspectRatio={proposal.tech_config?.aspect_ratio || '9:16'}
            proposalId={proposal.proposal_id}
            onKeyframesApproved={setApprovedKeyframes}
          />
        )}

        {/* Footer */}
        {proposal && !isLoading && !error && (
          <SceneEditorFooter
            scenes={editor.scenes}
            totalDuration={editor.totalDuration}
            proposal={proposal}
            referenceImagesCount={referenceImages.length}
            keyframesApproved={approvedKeyframes.length}
            onReject={onReject || onClose}
            onStart={() => onStartGeneration(
              editor.toApprovedScenes(),
              approvedKeyframes.length > 0 ? approvedKeyframes : undefined,
            )}
            onEnhanceAll={handleEnhanceAll}
            enhanceAllLoading={enhance.batchLoading}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// V3.1 — Per-model prompt format tip (industry standard từ research X/blogs)
// ============================================

const MODEL_FORMAT_TIPS: Record<string, { icon: string; title: string; tip: string }> = {
  seedance_2_0: {
    icon: '🎬',
    title: 'Seedance 2.0 — Multi-shot timeline',
    tip: 'Viết prompt theo time-code: "[0-5s] Close-up subject. [5-10s] Pull back wide. [10-15s] Tracking shot...". Model tự chuyển cảnh mượt trong 1 call (KHÔNG cần concat). Sweet spot 3-5 shots × 3-5s mỗi shot.',
  },
  seedance_2_0_fast: {
    icon: '⚡',
    title: 'Seedance 2.0 Fast — Single-sentence rapid',
    tip: '1 câu ngắn: "Woman uncaps serum, slow push-in close-up, golden hour." Strip subordinate clauses. Iterate ý tưởng rẻ trước khi gen full.',
  },
  seedance_1_5_pro: {
    icon: '🤫',
    title: 'Seedance 1.5 Pro — Silent multi-ref moodboard',
    tip: 'Mô tả prose + camera cue: "Hands holding product. Macro top-down. Golden hour window light." Output silent — TTS overlay post-prod. Sweet spot ASMR/B-roll.',
  },
  vidu_q3: {
    icon: '🎨',
    title: 'Vidu Q3 — Inline-named entities',
    tip: 'Gọi tên nhân vật trực tiếp: "Elena (25yo woman, white blouse) holds product. Marcus (28yo man, navy suit) leans in. Soft golden hour." KHÔNG dùng @Image1 syntax. Max 4 ảnh refs.',
  },
  vidu_q3_mix: {
    icon: '💎',
    title: 'Vidu Q3 Mix — Premium 1080p',
    tip: 'Cùng pattern Q3 nhưng output 1080p HD premium. Phù hợp brand showcase, hiển thị chi tiết texture. Cost 2.5× Q3 thường.',
  },
  wan_2_7: {
    icon: '🎤',
    title: 'Wan 2.7 — Audio-driven lipsync',
    tip: 'Wan KHÔNG cần prompt phức tạp. Pipeline: TTS audio + portrait → model tự sync môi + biểu cảm. Portrait phải front-facing, mouth unobstructed. Max 8s.',
  },
};

function ModelFormatTip({ model, storyboardFormat }: { model: string; storyboardFormat?: string }) {
  const tip = MODEL_FORMAT_TIPS[model];
  if (!tip) return null;
  return (
    <div className="px-6 py-2 bg-amber-500/[0.04] border-b border-amber-500/20 flex items-start gap-2">
      <span className="text-base mt-0.5">{tip.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-amber-300">{tip.title}</div>
        <div className="text-[11px] text-amber-200/80 leading-relaxed">{tip.tip}</div>
      </div>
    </div>
  );
}

// ============================================
// Loading + Error states
// ============================================

function LoadingState({ progress }: { progress?: ProgressEvent | null }) {
  const pct = progress?.progress_pct ?? 0;
  const stage = progress?.stage || 'init';
  const stageLabel = STAGE_LABELS_VN[stage] || stage;
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
      <div className="w-14 h-14 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-sm font-semibold text-text">🎬 {stageLabel}</p>
        {progress?.message && (
          <p className="text-xs text-text-subtle mt-1">{progress.message}</p>
        )}
      </div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-text-muted font-medium">{pct}%</span>
        </div>
        <div className="h-2 bg-bg-soft rounded-full overflow-hidden border border-border">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <p className="text-[11px] text-text-subtle">Director Agent analyzing — ~60-180s · cost ~$0.04</p>
    </div>
  );
}

function ErrorState({
  error,
  onClose,
  onRetry,
}: {
  error: string;
  onClose: () => void;
  onRetry?: () => void;
}) {
  // FIX C: Friendly Vietnamese — không show URL technical, parse error tip rõ ràng
  const friendly = humanizeError(error);
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
      <div className="text-5xl">{friendly.emoji}</div>
      <p className="text-sm text-rose-300 font-semibold">{friendly.title}</p>
      <p className="text-xs text-text-muted text-center max-w-md leading-relaxed">
        {friendly.message}
      </p>
      {friendly.tip && (
        <p className="text-[11px] text-amber-300/80 text-center max-w-md italic">
          💡 {friendly.tip}
        </p>
      )}
      <div className="flex items-center gap-2 mt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition"
          >
            🔄 Thử lại
          </button>
        )}
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs border border-border rounded-lg hover:bg-bg-hover text-text-muted transition"
        >
          Đóng
        </button>
      </div>
      {/* Debug detail collapsed */}
      <details className="mt-2 max-w-md w-full">
        <summary className="text-[10px] text-text-subtle cursor-pointer hover:text-text-muted">
          Chi tiết kỹ thuật
        </summary>
        <p className="text-[10px] text-text-subtle mt-1 break-all font-mono">{error}</p>
      </details>
    </div>
  );
}

interface FriendlyError {
  emoji: string;
  title: string;
  message: string;
  tip?: string;
}

function humanizeError(raw: string): FriendlyError {
  const r = raw.toLowerCase();
  if (r.includes('429') || r.includes('too many requests') || r.includes('rate limit')) {
    return {
      emoji: '🚦',
      title: 'AtlasCloud đang quá tải',
      message: 'AI provider AtlasCloud bị rate limit tạm thời (quá nhiều người gen video cùng lúc).',
      tip: 'Đợi 10-15s rồi click "Thử lại". Hoặc đổi model rẻ hơn ở Advanced.',
    };
  }
  if (r.includes('500') || r.includes('internal server error') || r.includes('all') && r.includes('scenes failed')) {
    return {
      emoji: '🔧',
      title: 'Server video AI đang lỗi tạm thời',
      message: 'AtlasCloud trả lỗi 500 khi gen video. Thường do model overload hoặc params không khớp.',
      tip: 'Đợi 30s rồi thử lại. Nếu lỗi liên tục: đổi model (Seedance 2.0 Fast / Vidu Q3) hoặc giảm duration.',
    };
  }
  if (r.includes('402') || r.includes('insufficient balance') || r.includes('out of credit')) {
    return {
      emoji: '💳',
      title: 'Hết credit AtlasCloud',
      message: 'Wallet AtlasCloud đã hết balance. Cần nạp tiền hoặc kích hoạt Coding Plan.',
      tip: 'Vào atlascloud.ai/billing → Top-up rồi thử lại.',
    };
  }
  if (r.includes('timeout') || r.includes('timed out')) {
    return {
      emoji: '⏱️',
      title: 'Quá thời gian xử lý',
      message: 'AI mất quá lâu để trả response. Thường do prompt phức tạp hoặc model overload.',
      tip: 'Thử rút gọn prompt, hoặc đổi model nhanh hơn (Seedance 2.0 Fast).',
    };
  }
  if (r.includes('parse') || r.includes('json')) {
    return {
      emoji: '🧩',
      title: 'AI trả response lỗi định dạng',
      message: 'LLM model trả JSON malformed (lỗi vendor). Hệ thống đã có salvage parser nhưng vẫn fail.',
      tip: 'Click "Thử lại" — thường gen lại sẽ ra JSON hợp lệ.',
    };
  }
  if (r.includes('network') || r.includes('fetch') || r.includes('econnrefused')) {
    return {
      emoji: '📡',
      title: 'Mất kết nối backend',
      message: 'Frontend không gọi được API. Backend có thể đang restart.',
      tip: 'Kiểm tra terminal backend đang chạy, sau đó thử lại.',
    };
  }
  // Generic fallback
  return {
    emoji: '⚠️',
    title: 'Director Agent gặp lỗi',
    message: 'Có vấn đề khi gen proposal. Xem chi tiết kỹ thuật bên dưới hoặc thử lại.',
    tip: undefined,
  };
}

// ============================================
// Assets sidebar (left column — TopView pattern)
// ============================================

function AssetsSidebar({ referenceImages }: { referenceImages: string[] }) {
  return (
    <div className="w-44 shrink-0 border-r border-border bg-bg-soft/40 flex flex-col overflow-hidden">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <span className="text-[11px] font-bold text-text uppercase tracking-wider">Assets</span>
        <span className="px-1.5 py-0 rounded-full bg-bg-card text-text-subtle text-[10px] font-mono">
          {referenceImages.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {referenceImages.length === 0 ? (
          <div className="text-[11px] text-text-subtle text-center py-6">
            Chưa upload ref nào
          </div>
        ) : (
          referenceImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Image ${i + 1}`}
                className="w-full aspect-square object-cover rounded-md border border-border"
              />
              <div className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded bg-black/70 text-white text-[9px] font-medium text-center">
                Image {i + 1}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// Scenes main panel
// ============================================

function ScenesPanel({
  scenes,
  referenceImages,
  onUpdate,
  onRemove,
  onAdd,
  onEnhanceScene,
  perSceneLoading,
  enhanceError,
}: {
  scenes: SceneDraft[];
  referenceImages: string[];
  onUpdate: (id: string, patch: Partial<SceneDraft>) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onEnhanceScene: (scene: SceneDraft) => void;
  perSceneLoading: Set<string>;
  enhanceError: string | null;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {enhanceError && (
        <div className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-300">
          ⚠️ Enhance fail: {enhanceError}
        </div>
      )}
      {scenes.length === 0 && (
        <div className="text-center py-12 text-text-subtle text-sm">
          Chưa có scene nào. Click "+ Add Scene" để bắt đầu.
        </div>
      )}
      {scenes.map((scene, i) => (
        <SceneCard
          key={scene.id}
          scene={scene}
          index={i}
          isFirst={i === 0}
          canDelete={scenes.length > 1}
          referenceImages={referenceImages}
          isEnhancing={perSceneLoading.has(scene.id)}
          onUpdate={(patch) => onUpdate(scene.id, patch)}
          onRemove={() => onRemove(scene.id)}
          onEnhance={() => onEnhanceScene(scene)}
        />
      ))}

      <button
        onClick={onAdd}
        className="w-full py-3 rounded-xl border-2 border-dashed border-border hover:border-brand-500/60 hover:bg-bg-soft/50 transition flex items-center justify-center gap-2 text-sm text-text-muted hover:text-text"
      >
        <Plus className="w-4 h-4" />
        Add Scene
      </button>
    </div>
  );
}

function SceneCard({
  scene,
  index,
  isFirst,
  canDelete,
  referenceImages,
  isEnhancing,
  onUpdate,
  onRemove,
  onEnhance,
}: {
  scene: SceneDraft;
  index: number;
  isFirst: boolean;
  canDelete: boolean;
  referenceImages: string[];
  isEnhancing: boolean;
  onUpdate: (patch: Partial<SceneDraft>) => void;
  onRemove: () => void;
  onEnhance: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showMentionPicker, setShowMentionPicker] = useState(false);

  const segments = splitPromptSegments(scene.prompt);
  const mentionCount = segments.filter((s) => s.type === 'mention').length;

  const handleInsertMention = (idx1: number) => {
    const cursor = textareaRef.current?.selectionStart ?? scene.prompt.length;
    const { newPrompt, newCursorPos } = insertMentionAtCursor(scene.prompt, idx1, cursor);
    onUpdate({ prompt: newPrompt });
    setShowMentionPicker(false);
    requestAnimationFrame(() => {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  return (
    <div className="flex gap-3">
      {/* Scene index + chain indicator */}
      <div className="flex flex-col items-center pt-2 gap-1">
        <div
          className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
            isFirst
              ? 'bg-bg-card border border-border text-text'
              : 'bg-bg-card border border-border text-text-muted'
          }`}
        >
          {index + 1}
        </div>
      </div>

      {/* Scene body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs text-text-muted">
            {isFirst ? (
              <span>New scene</span>
            ) : (
              <span className="text-text-subtle">→ Extends from Scene {index}</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <DurationPicker
              value={scene.duration_s}
              onChange={(v) => onUpdate({ duration_s: v })}
            />
            {canDelete && (
              <button
                onClick={onRemove}
                className="p-1 rounded hover:bg-rose-500/20 text-text-subtle hover:text-rose-300 transition"
                title="Xóa scene"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="relative rounded-xl border border-border bg-bg-soft/40 focus-within:border-brand-500 transition overflow-hidden">
          <textarea
            ref={textareaRef}
            value={scene.prompt}
            onChange={(e) => onUpdate({ prompt: e.target.value })}
            placeholder="Mô tả cảnh: UGC vertical 9:16. Female influencer @[Image N] holds product [Image M]..."
            rows={4}
            className="w-full bg-transparent text-sm text-text placeholder:text-text-subtle p-3 focus:outline-none resize-y min-h-[88px] leading-relaxed"
          />

          {/* Action row dưới textarea */}
          <div className="px-3 py-2 border-t border-border/50 bg-bg-soft/30 flex items-center gap-2">
            <button
              onClick={() => setShowMentionPicker(!showMentionPicker)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-hover text-xs text-text-muted hover:text-text transition"
              title="Insert image mention"
            >
              <AtSign className="w-3.5 h-3.5" />
              {mentionCount > 0 && <span className="text-[10px]">{mentionCount}</span>}
            </button>
            <button
              onClick={onEnhance}
              disabled={isEnhancing || !scene.prompt.trim()}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-bg-hover text-xs text-text-muted hover:text-text transition disabled:opacity-40 disabled:cursor-not-allowed"
              title="Enhance — LLM polish prompt thành MCSLA detail (~$0.001)"
            >
              {isEnhancing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span className="text-[10px]">{isEnhancing ? 'Enhancing…' : 'Enhance'}</span>
            </button>
          </div>

          {/* Mention picker dropdown */}
          {showMentionPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMentionPicker(false)} />
              <div className="absolute left-3 bottom-12 z-20 rounded-lg bg-bg-card border border-border shadow-xl p-2 min-w-[180px]">
                <div className="text-[10px] text-text-subtle uppercase tracking-wider px-2 pb-1.5">
                  Insert image mention
                </div>
                {referenceImages.length === 0 ? (
                  <div className="text-xs text-text-subtle px-2 py-1.5">
                    Chưa có ref. Upload ở Assets sidebar.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {referenceImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => handleInsertMention(i + 1)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-hover text-xs text-text"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-6 h-6 object-cover rounded border border-border"
                        />
                        <span>Image {i + 1}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Mention chips display */}
        {mentionCount > 0 && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            <span className="text-[10px] text-text-subtle">Mentions:</span>
            {segments
              .filter((s) => s.type === 'mention')
              .map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand-700/30 border border-brand-500/40 text-brand-100 text-[10px] font-medium"
                >
                  📷 Image {s.imageIndex}
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DurationPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  const options = [3, 5, 7, 8, 10, 12, 15];
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md bg-bg-card hover:bg-bg-hover border border-border text-[11px] text-text-muted hover:text-text transition"
      >
        <Clock className="w-3 h-3" />
        <span className="font-medium">{value}s</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 rounded-lg bg-bg-card border border-border shadow-xl overflow-hidden">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`block w-full text-left px-3 py-1.5 text-[11px] transition ${
                  opt === value
                    ? 'bg-brand-700/20 text-brand-200'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text'
                }`}
              >
                {opt}s
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// Footer — total stats + CTA
// ============================================

// V3.3 — Per-model min refs requirement (sync với backend VIDEO_MODEL_SPECS)
const MIN_REFS_PER_MODEL: Record<string, number> = {
  vidu_q3: 1,
  vidu_q3_mix: 1,
  wan_2_7: 1,
  seedance_1_5_pro: 1,
  seedance_2_0: 1,
  seedance_2_0_fast: 1,
  auto: 0,  // backend picker chọn model phù hợp
};

function SceneEditorFooter({
  scenes,
  totalDuration,
  proposal,
  referenceImagesCount,
  keyframesApproved,
  onReject,
  onStart,
  onEnhanceAll,
  enhanceAllLoading,
}: {
  scenes: SceneDraft[];
  totalDuration: number;
  proposal: Proposal;
  referenceImagesCount: number;
  keyframesApproved: number;
  onReject: () => void;
  onStart: () => void;
  onEnhanceAll: () => void;
  enhanceAllLoading: boolean;
}) {
  const sceneCount = scenes.length;
  const estCost = proposal.estimated_render_cost_usd || 0;
  const estTimeMin = Math.round((proposal.estimated_render_time_s || 0) / 60);

  // V3.3 — Check min refs requirement
  const userModel = (proposal.tech_config?.model || 'vidu_q3') as string;
  const minRefs = MIN_REFS_PER_MODEL[userModel] ?? 0;
  const refsMissing = minRefs > 0 && referenceImagesCount < minRefs;
  const startDisabled =
    sceneCount === 0 ||
    scenes.some((s) => !s.prompt.trim()) ||
    refsMissing;

  return (
    <div className="px-6 py-3 border-t border-border bg-bg-soft flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="text-[11px] text-text-muted">
          {sceneCount} scene{sceneCount > 1 ? 's' : ''} · ~{totalDuration}s · ~${estCost} · ~
          {estTimeMin} min
        </div>
        {keyframesApproved > 0 && (
          <div className="text-[11px] text-emerald-300 font-medium px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10">
            🎨 {keyframesApproved} keyframes approved — sẽ render i2v (identity 100%)
          </div>
        )}
        {refsMissing && (
          <div className="text-[11px] text-rose-400 font-medium px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10">
            ⚠️ Model {userModel} cần tối thiểu {minRefs} ảnh — bạn đang có {referenceImagesCount}. Upload ảnh hoặc chọn model khác.
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onReject}
          className="px-3 py-1.5 rounded-lg border border-border hover:border-rose-500/60 hover:text-rose-400 text-xs text-text-muted transition"
        >
          ❌ Reject
        </button>
        <button
          onClick={onEnhanceAll}
          disabled={enhanceAllLoading || sceneCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card hover:bg-bg-hover border border-border text-xs text-text-muted hover:text-text transition disabled:opacity-40 disabled:cursor-not-allowed"
          title={`Enhance All ${sceneCount} scenes parallel (~$${(sceneCount * 0.001).toFixed(3)})`}
        >
          {enhanceAllLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {enhanceAllLoading ? 'Enhancing all…' : 'Enhance All'}
        </button>
        <button
          onClick={onStart}
          disabled={startDisabled}
          title={refsMissing ? `Cần upload ít nhất ${minRefs} ảnh cho model ${userModel}` : ''}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition"
        >
          <Play className="w-3.5 h-3.5" />
          Start Generation
        </button>
      </div>
    </div>
  );
}
