'use client';

/**
 * use-enhance-prompt — Hook gọi /api/v1/enhance/single + /enhance/batch.
 *
 * TopView V2 pattern: button "Enhance" per scene + "Enhance All" cuối panel.
 * LLM (DeepSeek V4 Flash) polish prompt ngắn → MCSLA detail.
 * Cost: $0.001/call.
 */

import { useState, useCallback } from 'react';

export interface CharacterAnchorPayload {
  face_descriptor?: string;
  outfit_top?: string;
  outfit_bottom?: string;
  age_apparent?: number;
  gender?: 'F' | 'M';
}

export interface EnhanceSingleResult {
  enhanced_prompt: string;
  summary: string;
  warnings: string[];
}

export interface EnhanceBatchSceneInput {
  scene_id: string;
  raw_prompt: string;
  duration_s: number;
  image_refs: number[];
  purpose?: string;
}

export interface EnhanceBatchSceneResult {
  scene_id: string;
  enhanced_prompt: string;
  summary: string;
  status: 'completed' | 'failed';
  error?: string;
}

export interface EnhanceBatchResult {
  results: EnhanceBatchSceneResult[];
  success_count: number;
  fail_count: number;
  elapsed_s: number;
}

export function useEnhancePrompt() {
  const [isLoading, setIsLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [perSceneLoading, setPerSceneLoading] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const enhanceSingle = useCallback(
    async (params: {
      scene_id?: string; // optional, để track loading per scene
      raw_prompt: string;
      aspect_ratio: '9:16' | '16:9' | '1:1';
      duration_s: number;
      character_anchor?: CharacterAnchorPayload;
      image_refs?: number[];
      purpose?: string;
    }): Promise<EnhanceSingleResult> => {
      setError(null);
      const sceneId = params.scene_id;
      if (sceneId) {
        setPerSceneLoading((prev) => new Set(prev).add(sceneId));
      } else {
        setIsLoading(true);
      }

      try {
        const res = await fetch('/api/v1/enhance/single', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            raw_prompt: params.raw_prompt,
            aspect_ratio: params.aspect_ratio,
            duration_s: params.duration_s,
            character_anchor: params.character_anchor,
            image_refs: params.image_refs || [],
            purpose: params.purpose,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.detail || `HTTP ${res.status}`);
        }
        return (await res.json()) as EnhanceSingleResult;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        if (sceneId) {
          setPerSceneLoading((prev) => {
            const next = new Set(prev);
            next.delete(sceneId);
            return next;
          });
        } else {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  const enhanceBatch = useCallback(
    async (params: {
      scenes: EnhanceBatchSceneInput[];
      aspect_ratio: '9:16' | '16:9' | '1:1';
      character_anchor?: CharacterAnchorPayload;
    }): Promise<EnhanceBatchResult> => {
      setError(null);
      setBatchLoading(true);
      try {
        const res = await fetch('/api/v1/enhance/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenes: params.scenes,
            aspect_ratio: params.aspect_ratio,
            character_anchor: params.character_anchor,
          }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.detail || `HTTP ${res.status}`);
        }
        return (await res.json()) as EnhanceBatchResult;
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Unknown error';
        setError(msg);
        throw e;
      } finally {
        setBatchLoading(false);
      }
    },
    [],
  );

  return {
    enhanceSingle,
    enhanceBatch,
    isLoading,
    batchLoading,
    perSceneLoading,
    error,
  };
}
