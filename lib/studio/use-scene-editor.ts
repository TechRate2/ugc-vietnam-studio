'use client';

/**
 * use-scene-editor — Hook quản lý Multi-Scene Editor state (TopView V2 pattern).
 *
 * Flow:
 *   1. Proposal done → buildScenesFromProposal(proposal) → SceneDraft[]
 *   2. User edit từng scene: prompt / duration / image refs / delete / add
 *   3. Click "Start Generation" → emit ApprovedScenes[] để backend render queue
 */

import { useState, useCallback, useEffect } from 'react';
import type { Proposal, Shot, CharacterSheet } from './use-propose-job';

export interface SceneDraft {
  id: string;
  prompt: string;
  duration_s: number;
  /** image indices (1-based) referenced trong prompt qua [Image N] */
  image_refs: number[];
  /** scene_id của scene trước (chain continuity), null nếu là scene đầu */
  extends_from?: string | null;
  /** purpose từ Director (hook/problem/solution/proof/cta) — readonly hint */
  purpose?: string;
  /** caption_on_screen (optional overlay text) */
  caption?: string;
  /** dialogue VN nếu có voiceover */
  dialogue?: string;
}

export interface ApprovedScene {
  scene_id: string;
  prompt: string;
  duration_s: number;
  image_refs: number[];
  extends_from?: string | null;
  purpose?: string;
  caption?: string;
  dialogue?: string;
}

/**
 * Convert proposal.shots[] + character_sheet → SceneDraft[] cho editor init.
 *
 * Logic:
 *   - Mỗi shot trong proposal.shots[] = 1 SceneDraft
 *   - Build prompt từ MCSLA: subject + camera + lighting + action
 *   - Replace @main_character bằng face descriptor từ character_sheet (text-only)
 *   - extends_from = shot trước (chain liên tiếp) hoặc null cho scene đầu
 *   - image_refs: parse [Image N] tokens từ A_action (nếu có) hoặc empty
 */
export function buildScenesFromProposal(proposal: Proposal | null): SceneDraft[] {
  if (!proposal?.shots || proposal.shots.length === 0) {
    // Fallback: dùng storyboard_preview nếu có (legacy schema)
    const fallback = (proposal?.storyboard_preview || []).map((f, i) => ({
      id: f.shot_id ? String(f.shot_id) : `S${i + 1}`,
      prompt: [f.framing, f.action_vn].filter(Boolean).join('. '),
      duration_s: f.duration_s || 3,
      image_refs: [],
      extends_from: i > 0 ? `S${i}` : null,
      purpose: f.purpose,
      caption: f.caption_on_screen,
      dialogue: f.dialogue_vn,
    }));
    return fallback;
  }

  const charSheet = proposal.character_sheet || {};
  return proposal.shots.map((shot: Shot, i: number) => {
    const promptBuilder = composeScenePrompt(shot, charSheet, proposal.tech_config);
    const imageRefs = extractImageMentions(promptBuilder);
    return {
      id: shot.shot_id || `S${i + 1}`,
      prompt: promptBuilder,
      duration_s: shot.duration_s || 3,
      image_refs: imageRefs,
      extends_from: i > 0 ? proposal.shots![i - 1].shot_id || `S${i}` : null,
      purpose: shot.purpose,
      caption: shot.caption_on_screen,
      dialogue: shot.dialogue_vn,
    };
  });
}

/**
 * Compose scene prompt từ MCSLA shot — pattern TopView V2 long-form scene description.
 *
 * Style: UGC vertical 9:16. [Subject description from anchor]. [Camera + lighting].
 *        [Action concrete]. Caption: "...". Audio: "...".
 */
function composeScenePrompt(
  shot: Shot,
  charSheet: CharacterSheet | Record<string, any>,
  techConfig: any,
): string {
  const aspect = techConfig?.aspect_ratio || '9:16';
  const aspectLabel = aspect === '9:16' ? 'vertical 9:16' : aspect === '16:9' ? 'landscape 16:9' : 'square 1:1';

  // Resolve @main_character với character_sheet text desc
  let subject = shot.S_subject || '';
  if (subject.includes('@main_character')) {
    const charDesc = formatCharacterShortDesc(charSheet);
    subject = subject.replace(/@main_character/gi, charDesc || 'the main character');
  }

  const parts: string[] = [`UGC style, ${aspectLabel}.`];
  if (subject) parts.push(subject + '.');
  if (shot.C_camera) parts.push(`Camera: ${shot.C_camera}.`);
  if (shot.L_lighting) parts.push(`Lighting: ${shot.L_lighting}.`);
  if (shot.A_action) parts.push(`Action: ${shot.A_action}.`);
  if (shot.caption_on_screen) parts.push(`Caption: "${shot.caption_on_screen}".`);
  if (shot.dialogue_vn) parts.push(`Voice: "${shot.dialogue_vn}".`);

  return parts.join(' ').trim();
}

function formatCharacterShortDesc(cs: any): string {
  if (!cs) return '';
  const gender = cs.gender === 'F' ? 'female' : cs.gender === 'M' ? 'male' : '';
  const age = cs.age_apparent;
  const ageStr =
    typeof age === 'number'
      ? `${age}-year-old`
      : typeof age === 'string' && age.match(/\d/)
        ? age
        : '';
  const ethnic = 'Vietnamese';
  const role = 'beauty influencer';

  const head = [ageStr, ethnic, gender, role].filter(Boolean).join(' ');
  const face = cs.face || '';
  const outfit = [cs.outfit_top, cs.outfit_bottom].filter(Boolean).join(', ');

  return [head, face, outfit ? `wearing ${outfit}` : ''].filter(Boolean).join(', ');
}

/** Parse [Image N] mentions từ string → list 1-based indices unique sorted */
function extractImageMentions(s: string): number[] {
  const out = new Set<number>();
  for (const m of s.matchAll(/\[Image\s+(\d+)\]/gi)) {
    const n = parseInt(m[1], 10);
    if (!isNaN(n)) out.add(n);
  }
  return Array.from(out).sort((a, b) => a - b);
}

// ============================================
// Hook
// ============================================

export function useSceneEditor(proposal: Proposal | null) {
  const [scenes, setScenes] = useState<SceneDraft[]>([]);

  // Re-init scenes khi proposal thay đổi
  useEffect(() => {
    if (proposal) {
      setScenes(buildScenesFromProposal(proposal));
    } else {
      setScenes([]);
    }
  }, [proposal]);

  const updateScene = useCallback((id: string, patch: Partial<SceneDraft>) => {
    setScenes((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = { ...s, ...patch };
        // Auto re-extract image_refs nếu prompt thay đổi
        if (patch.prompt !== undefined) {
          next.image_refs = extractImageMentions(patch.prompt);
        }
        return next;
      }),
    );
  }, []);

  const addScene = useCallback(() => {
    setScenes((prev) => {
      const newIdx = prev.length + 1;
      const lastId = prev[prev.length - 1]?.id || null;
      const newId = `S${newIdx}`;
      return [
        ...prev,
        {
          id: newId,
          prompt: '',
          duration_s: 5,
          image_refs: [],
          extends_from: lastId,
          purpose: 'shot',
        },
      ];
    });
  }, []);

  const removeScene = useCallback((id: string) => {
    setScenes((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      // Update extends_from cho scene đi sau (chain continuity)
      const removedIdx = prev.findIndex((s) => s.id === id);
      if (removedIdx >= 0 && removedIdx < filtered.length) {
        const prevId = removedIdx > 0 ? filtered[removedIdx - 1].id : null;
        filtered[removedIdx] = { ...filtered[removedIdx], extends_from: prevId };
      }
      return filtered;
    });
  }, []);

  const reorderScenes = useCallback((from: number, to: number) => {
    setScenes((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      // Re-chain extends_from theo order mới
      return next.map((s, i) => ({
        ...s,
        extends_from: i > 0 ? next[i - 1].id : null,
      }));
    });
  }, []);

  const reset = useCallback(() => {
    setScenes(proposal ? buildScenesFromProposal(proposal) : []);
  }, [proposal]);

  const toApprovedScenes = useCallback((): ApprovedScene[] => {
    return scenes.map((s) => ({
      scene_id: s.id,
      prompt: s.prompt,
      duration_s: s.duration_s,
      image_refs: s.image_refs,
      extends_from: s.extends_from,
      purpose: s.purpose,
      caption: s.caption,
      dialogue: s.dialogue,
    }));
  }, [scenes]);

  // Total duration + cost estimate
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_s || 0), 0);

  return {
    scenes,
    totalDuration,
    updateScene,
    addScene,
    removeScene,
    reorderScenes,
    reset,
    toApprovedScenes,
  };
}
