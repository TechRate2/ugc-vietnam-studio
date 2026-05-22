'use client';

/**
 * use-storyboard-gen — Hook gen N keyframes từ proposal.shots + character_sheet.
 *
 * Phase 2.5 — sau khi user pick variant, trước khi render video.
 * Cost: ~$0.25 / storyboard (7 ảnh × $0.036 Seedream).
 * Time: ~10-15s parallel.
 *
 * Pattern:
 *   1. Call genStoryboard(shots, character_sheet) → trả keyframes[]
 *   2. User xem grid, reject ảnh nào → call regenKeyframe(shot) → trả ảnh mới
 *   3. User OK all → submit Phase 3 render với approvedKeyframes làm i2v reference
 */

import { useState, useCallback } from 'react';
import type { Shot, CharacterSheet } from './use-propose-job';

export interface Keyframe {
  shot_id: string;
  image_url: string | null;
  prompt: string;
  status: 'completed' | 'failed';
  error?: string;
  purpose?: string;
  duration_s?: number;
  dialogue_vn?: string;
  caption_on_screen?: string;
}

export interface StoryboardResult {
  keyframes: Keyframe[];
  total_cost_usd: number;
  elapsed_s: number;
  model_key: string;
  success_count: number;
  fail_count: number;
  proposal_id?: string;
}

export function useStoryboardGen() {
  const [keyframes, setKeyframes] = useState<Keyframe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [regenLoadingIds, setRegenLoadingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<Pick<StoryboardResult, 'total_cost_usd' | 'elapsed_s' | 'success_count' | 'fail_count'> | null>(null);

  const genStoryboard = useCallback(
    async (params: {
      proposal_id?: string;
      shots: Shot[];
      character_sheet: CharacterSheet | Record<string, any>;
      aspect_ratio?: string;
      model_key?: string;
    }) => {
      setIsLoading(true);
      setError(null);
      setKeyframes([]);
      try {
        const res = await fetch('/api/v1/jobs/storyboard/gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proposal_id: params.proposal_id,
            shots: params.shots,
            character_sheet: params.character_sheet,
            aspect_ratio: params.aspect_ratio || '9:16',
            model_key: params.model_key || 'seedream_v45',
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || err.error || `HTTP ${res.status}`);
        }
        const data = (await res.json()) as StoryboardResult;
        setKeyframes(data.keyframes);
        setMeta({
          total_cost_usd: data.total_cost_usd,
          elapsed_s: data.elapsed_s,
          success_count: data.success_count,
          fail_count: data.fail_count,
        });
        return data;
      } catch (e: any) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const regenKeyframe = useCallback(
    async (params: {
      shot: Shot;
      character_sheet: CharacterSheet | Record<string, any>;
      aspect_ratio?: string;
      prompt_override?: string;
    }) => {
      const shotId = params.shot.shot_id;
      setRegenLoadingIds((prev) => new Set(prev).add(shotId));
      setError(null);
      try {
        const res = await fetch('/api/v1/jobs/storyboard/regen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shot: params.shot,
            character_sheet: params.character_sheet,
            aspect_ratio: params.aspect_ratio || '9:16',
            prompt_override: params.prompt_override,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || err.error || `HTTP ${res.status}`);
        }
        const newKf = (await res.json()) as Keyframe;
        // Replace in-place trong list
        setKeyframes((prev) => prev.map((k) => (k.shot_id === shotId ? newKf : k)));
        return newKf;
      } catch (e: any) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        setRegenLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(shotId);
          return next;
        });
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setKeyframes([]);
    setError(null);
    setIsLoading(false);
    setRegenLoadingIds(new Set());
    setMeta(null);
  }, []);

  return {
    keyframes,
    meta,
    isLoading,
    regenLoadingIds,
    error,
    genStoryboard,
    regenKeyframe,
    reset,
  };
}
