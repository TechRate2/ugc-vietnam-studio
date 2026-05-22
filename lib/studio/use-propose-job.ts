'use client';

/**
 * use-propose-job — Hook gọi POST /api/v1/jobs/propose/stream (Director Agent Phase 2).
 *
 * Phase 2 LLM-only — gen Proposal cho user duyệt trước khi render.
 * Cost: ~$0.04-0.09 / proposal.
 * Time: 60-180s.
 *
 * Default dùng SSE stream để UI show progress bar realtime mỗi stage.
 * Fallback JSON sync nếu stream broken (set `useStream=false`).
 *
 * Usage:
 *     const { propose, proposal, progress, isLoading, error } = useProposeJob();
 *     await propose({ product_input, reference_images, reference_videos, ... });
 *     // progress: { stage, status, progress_pct, elapsed_s }
 *     // proposal: ProposalJSON khi xong
 */

import { useState, useCallback, useRef } from 'react';
import type { VideoSettings } from '@/lib/types/backend';

// ============================================
// Types matching backend api/routes/propose.py
// ============================================

export type NicheHint =
  | 'auto'
  | 'beauty_skincare'
  | 'shopee_general'
  | 'supplement_health'
  | 'tech_gadget'
  | 'fashion_apparel'
  | 'food_beverage'
  | 'custom';

export interface ContextInjection {
  pain_points?: string;
  real_reviews?: string;
  usps?: string;
  forbidden_to_say?: string;
  mood_hint?: string;
}

export type ReferenceRole =
  | 'primary_subject'
  | 'secondary_subject'
  | 'product_hero'
  | 'product_detail'
  | 'style_reference'
  | 'environment'
  | 'brand_asset';

export interface ProposeRequest {
  product_input: {
    url?: string;
    text_description?: string;
    image_urls?: string[];
  };
  reference_images: string[];
  /**
   * NEW (TopView V2 UI pattern) — User tag role mỗi ảnh khi upload.
   * Cùng độ dài reference_images. Mỗi item: role string hoặc null (AI tự detect).
   * VisualPlanner verify tag user thay vì đoán mò → reference understanding 5/5.
   */
  reference_role_hints?: (ReferenceRole | null)[];
  reference_videos: string[];
  user_brief: string;
  context_injection: ContextInjection;
  settings: VideoSettings;
  niche_hint: NicheHint;
}

export interface ScriptVariant {
  variant_id: string;
  rank?: number;
  composite_score?: number;
  hook: {
    id?: string;
    framework: string;
    text_vn: string;
    spoken_duration_s?: number;
  };
  body: {
    framework_applied?: string;
    segments: Array<{
      segment_id?: string;
      text_vn: string;
      spoken_duration_s?: number;
      visual_direction?: string;
      uses_real_context?: boolean;
    }>;
    total_duration_s?: number;
  };
  cta: {
    cta_type?: string;
    text_vn: string;
    spoken_duration_s?: number;
  };
  diversity_tag?: string;
  viral_score?: number;
  scores_breakdown?: {
    hook_strength?: number;
    relatability?: number;
    story_arc?: number;
    cta_clarity?: number;
    trend_alignment?: number;
  };
  strengths?: string[];
  weaknesses?: string[];
  fix_suggestions?: string[];
  predicted_views_range?: string;
  best_post_time_vn?: string;
}

export interface MappedReference {
  index: number;
  filename_hint?: string;
  role: string; // 'primary_subject' | 'product' | 'product_detail' | 'style_reference' | 'background_environment' | 'brand_asset' | 'unknown'
  subject_type?: string;
  subject_attributes?: Record<string, any>;
  best_for_shots?: string[];
  image_gen_usage?: string;
  video_gen_usage?: string;
}

export interface MissingReference {
  missing_role: string;
  why_useful: string;
  suggestion_to_user: string;
}

export interface ReferenceMapping {
  reference_count: number;
  primary_persona_summary?: string;
  mapped_references: MappedReference[];
  missing_references?: MissingReference[];
  warnings?: string[];
  rendering_hint?: {
    max_refs_for_chosen_model?: number;
    refs_used?: number;
    refs_slot_remaining?: number;
    recommendation?: string;
  };
}

export interface StoryboardFrame {
  shot_id?: string | number;
  purpose?: string;
  duration_s?: number;
  framing?: string;
  action_vn?: string;
  emotion?: string;
  lighting?: string;
  dialogue_vn?: string;
  caption_on_screen?: string;
  model_hint?: string;
}

// NEW v2 — Higgsfield-style MCSLA structured shot
export interface Shot {
  shot_id: string; // "S1", "S2", ...
  duration_s: number;
  purpose: string; // hook | problem | solution | proof | cta
  M_model_hint?: string;
  C_camera: string; // concrete: "cận mặt 50mm, đẩy nhẹ vào"
  S_subject: string; // "@main_character cau mày nhìn da bóng dầu"
  L_lighting: string; // "nắng cửa sổ vàng nhẹ 9h sáng"
  A_action: string; // "actor bĩu môi → đưa tay vuốt mặt"
  dialogue_vn?: string;
  caption_on_screen?: string;
}

// NEW v2 — Character consistency anchor
export interface CharacterSheet {
  id: string;
  name_vn: string;
  age_apparent?: number;
  gender?: 'F' | 'M';
  face: string;
  outfit_top?: string;
  outfit_bottom?: string;
  personality_traits?: string[];
  consistency_lock?: string;
  // NEW v3 — Higgsfield Soul.0 face lock pattern
  face_lock_url?: string | null;
  locked_from_user_upload?: boolean;
}

// NEW v3 — Visual Asset Plan từ VisualPlanner (Stage A0)
// Pattern: TopView V2 + ViMax Visual Asset Planning Agent
export interface VisualAsset {
  index: number;
  url?: string;
  detected_role: string;
  user_tag_verdict?: 'confirmed' | 'rejected' | 'not_tagged';
  confidence?: number;
  subject_type?: string;
  face_descriptor_vn?: string;
  outfit_observed?: string;
  dominant_features?: string[];
  color_palette_hex?: string[];
  composition_notes?: string;
  quality_assessment?: 'high' | 'medium' | 'low_reject';
  recommended_usage?: 'keyframe_anchor' | 'i2v_input_only' | 'style_reference_only' | 'skip';
  best_for_shots?: string[];
}

export interface PrimaryCharacterAnchor {
  asset_index: number | null;
  anchor_url?: string | null;
  name_vn?: string;
  age_apparent?: number;
  gender?: 'F' | 'M';
  face_descriptor?: string;
  outfit_top?: string;
  outfit_bottom?: string;
  accessories?: string[];
  distinctive_marks?: string[];
  consistency_lock?: string;
}

export interface VisualPlan {
  summary?: string;
  asset_count?: number;
  assets?: VisualAsset[];
  primary_character_anchor?: PrimaryCharacterAnchor | null;
  product_assets?: Array<{ asset_index: number; is_hero?: boolean }>;
  style_assets?: Array<{ asset_index: number; style_keywords?: string[] }>;
  missing_critical?: Array<{ role: string; reason: string; suggestion: string }>;
  grid_recommendation?: {
    should_use_grid: boolean;
    grid_layout?: '2x2' | '3x3' | null;
    reason?: string;
  };
  warnings?: string[];
  downstream_hints?: {
    director_should_anchor?: boolean;
    phase3_keyframer_strategy?: 'multi_turn_anchor' | 'grid_pattern' | 'text_only_fallback';
  };
}

// NEW v3 — Model-Aware Strategy picker (Topview pattern).
// 6 video models scored, top pick + reasoning hiển thị badge.
export interface ModelRanking {
  user_model: string;
  display_name: string;
  score: number;
  reasoning: string;
  selected: boolean;
}

export interface ModelStrategy {
  picked_model: string;
  picked_atlas_key: string;
  picked_display_name: string;
  picked_reasoning: string;
  storyboard_format: string;
  needs_keyframe_gen: boolean;
  needs_tts_first: boolean;
  max_refs: number;
  ranking: ModelRanking[];
}

export interface Proposal {
  proposal_id: string;
  created_at: string;
  tech_config: any;
  product_summary: any;
  niche_detected: string;
  niche_confidence: number;
  viral_dna_applied?: any;
  trends_applied: any[];
  director_concept_summary: string;
  cinematic_brief: any;
  // NEW v2 — top-level cho Phase 3 đọc thuận tiện
  character_sheet?: CharacterSheet;
  shots?: Shot[];
  // NEW v3 — Visual Asset Plan (pre-analysis của refs)
  visual_plan?: VisualPlan;
  // NEW v3 — Model-Aware Strategy picker output
  model_strategy?: ModelStrategy | null;
  // Existing
  script_variants: ScriptVariant[];
  reference_mapping: ReferenceMapping;
  storyboard_preview: StoryboardFrame[];
  recommended_variant_id: string;
  recommended_reason?: string;
  global_red_flags?: string[];
  global_improvement_ideas?: string[];
  cost_so_far_phase2_usd: number;
  estimated_render_cost_usd: number;
  estimated_render_time_s: number;
  estimated_total_cost_usd: number;
}

// ============================================
// Progress event from SSE
// ============================================

export interface ProgressEvent {
  stage: string; // init | strategist | niche | trends | director | copywriter | critic | assemble | model_picker
  status: 'running' | 'done';
  progress_pct?: number; // 0-99 (100 chỉ khi complete)
  message?: string;
  elapsed_s?: number;
  elapsed_s_total?: number;
  // optional per-stage extras
  niche_id?: string;
  count?: number;
  variants?: number;
  refs_mapped?: number;
  // model_picker stage
  picked?: string;
  reasoning?: string;
}

// Vietnamese label map cho UI display
export const STAGE_LABELS_VN: Record<string, string> = {
  init: 'Khởi động',
  strategist: 'Phân tích sản phẩm + audience',
  niche: 'Xác định niche',
  trends: 'Tải TikTok VN trends',
  director: 'Đạo diễn dựng tầm nhìn cinematic',
  copywriter: 'Viết kịch bản (Hook + Body + CTA) + Map ảnh',
  critic: 'Critic chấm viral score',
  model_picker: 'Chấm 6 model, pick fit script nhất',
  assemble: 'Hoàn tất proposal',
};

// ============================================
// Hook
// ============================================

export function useProposeJob() {
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [progress, setProgress] = useState<ProgressEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const propose = useCallback(async (request: ProposeRequest) => {
    setIsLoading(true);
    setError(null);
    setProposal(null);
    setProgress(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch('/api/v1/jobs/propose/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.detail || `HTTP ${response.status}`);
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let finalProposal: Proposal | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE events delimited by \n\n
        let sepIdx: number;
        while ((sepIdx = buffer.indexOf('\n\n')) >= 0) {
          const rawEvent = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);

          // Parse `event: <name>\ndata: <json>`
          const lines = rawEvent.split('\n');
          let eventName = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event:')) eventName = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
            // comment lines (`:`) hoặc empty → ignore
          }
          if (!dataStr) continue;

          let payload: any;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue; // skip malformed
          }

          if (eventName === 'stage') {
            setProgress(payload as ProgressEvent);
          } else if (eventName === 'complete') {
            finalProposal = payload as Proposal;
            setProposal(finalProposal);
            setProgress({
              stage: 'assemble',
              status: 'done',
              progress_pct: 100,
              message: 'Hoàn tất!',
            });
          } else if (eventName === 'error') {
            throw new Error(payload.error || 'Backend stream error');
          }
        }
      }

      if (!finalProposal) {
        throw new Error('Stream ended without complete event');
      }
      return finalProposal;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        // user cancel — không treat as error
        return null as any;
      }
      const message = e instanceof Error ? e.message : 'Unknown error';
      setError(message);
      throw e;
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setProposal(null);
    setError(null);
    setIsLoading(false);
    setProgress(null);
  }, []);

  return { propose, proposal, progress, isLoading, error, reset, cancel };
}
