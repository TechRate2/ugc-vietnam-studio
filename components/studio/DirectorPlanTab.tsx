'use client';

/**
 * DirectorPlanTab — V3 Continuity Bible + Shot List + Evaluation review panel.
 *
 * Used inside SceneEditorModal as the first tab the user sees after Director
 * Agent V3 finishes planning. User reviews the bible (characters / style /
 * audio / constraints / references) + shot list + self-score, then approves to
 * move on to the render queue.
 *
 * Tabs inside this panel:
 *   - "Bible"      — global continuity state
 *   - "Shot List"  — N shots with timeline + per-shot details
 *   - "Storyboard" — frames (generated images or upload-your-own)
 *   - "Evaluation" — Director's own self-score + suggestions
 */

import { useState } from 'react';
import {
  Sparkles, Film, Image as ImgIcon, ClipboardCheck, AlertTriangle,
  Loader2, Check, RefreshCw, Wand2,
} from 'lucide-react';
import type { DirectorPlan, Shot, ReferenceAsset } from '@/lib/studio/use-director-plan';
import {
  DIRECTOR_STAGE_LABELS_VN,
  generateStoryboardImages,
  type ProgressEvent,
} from '@/lib/studio/use-director-plan';

interface Props {
  plan: DirectorPlan | null;
  referenceImages: string[];
  isLoading: boolean;
  progress?: ProgressEvent | null;
  error: string | null;
  onApprove: (planWithStoryboards: DirectorPlan) => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

type TabKey = 'bible' | 'shots' | 'storyboard' | 'evaluation';

export function DirectorPlanTab({
  plan,
  referenceImages,
  isLoading,
  progress,
  error,
  onApprove,
  onRetry,
  onCancel,
}: Props) {
  const [tab, setTab] = useState<TabKey>('bible');
  const [genStoryboard, setGenStoryboard] = useState(false);
  const [localPlan, setLocalPlan] = useState<DirectorPlan | null>(null);
  const effectivePlan = localPlan ?? plan;

  // -------------------- LOADING --------------------
  if (isLoading || !effectivePlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 gap-4">
        <Sparkles className="w-12 h-12 text-brand-400 animate-pulse" />
        <div className="text-text-muted text-sm">
          {progress?.message
            || DIRECTOR_STAGE_LABELS_VN[progress?.stage ?? 'init']
            || 'Đang khởi động Director Agent V3…'}
        </div>
        {progress && (
          <div className="text-text-subtle text-xs">
            Stage: <span className="text-brand-300">{progress.stage}</span> · {progress.status}
          </div>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <AlertTriangle className="inline w-4 h-4 mr-1" /> {error}
            {onRetry && (
              <button onClick={onRetry} className="ml-3 underline hover:text-rose-200">
                Thử lại
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const { continuity_bible: bible, shot_list, storyboard_grid, evaluation } = effectivePlan;
  const totalDur = shot_list.reduce((s, x) => s + x.duration_s, 0);
  const hasRedFlags = evaluation.red_flags && evaluation.red_flags.length > 0;

  const handleGenStoryboard = async () => {
    setGenStoryboard(true);
    try {
      const updated = await generateStoryboardImages({ plan: effectivePlan });
      setLocalPlan(updated);
      setTab('storyboard');
    } catch (e) {
      console.error(e);
    } finally {
      setGenStoryboard(false);
    }
  };

  return (
    <div className="flex flex-col h-full text-text">
      {/* Header bar: tabs + summary */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2 gap-2">
        <div className="flex items-center gap-1">
          <TabButton active={tab === 'bible'} onClick={() => setTab('bible')} icon={<Sparkles className="w-3.5 h-3.5" />}>
            Bible
          </TabButton>
          <TabButton active={tab === 'shots'} onClick={() => setTab('shots')} icon={<Film className="w-3.5 h-3.5" />}>
            Shot List ({shot_list.length})
          </TabButton>
          <TabButton active={tab === 'storyboard'} onClick={() => setTab('storyboard')} icon={<ImgIcon className="w-3.5 h-3.5" />}>
            Storyboard ({storyboard_grid.length})
          </TabButton>
          <TabButton active={tab === 'evaluation'} onClick={() => setTab('evaluation')} icon={<ClipboardCheck className="w-3.5 h-3.5" />}>
            Eval {evaluation.overall_score ? `(${evaluation.overall_score.toFixed(1)})` : ''}
          </TabButton>
        </div>
        <div className="text-xs text-text-subtle flex items-center gap-3">
          <span>{totalDur}s · {bible.aspect_ratio}</span>
          <span>${effectivePlan.cost_estimate.total_cost_usd.toFixed(2)}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {tab === 'bible' && <BibleView bible={bible} refs={bible.reference_assets} refUrls={referenceImages} />}
        {tab === 'shots' && <ShotListView shots={shot_list} />}
        {tab === 'storyboard' && (
          <StoryboardView
            plan={effectivePlan}
            onGenerate={handleGenStoryboard}
            isGenerating={genStoryboard}
          />
        )}
        {tab === 'evaluation' && <EvaluationView report={evaluation} />}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-border px-5 py-3 flex items-center justify-between gap-3">
        <div className="text-xs text-text-subtle">
          Plan ID: <span className="font-mono">{effectivePlan.plan_id}</span> · Elapsed {effectivePlan.elapsed_s}s
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-2 text-xs rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted"
            >
              Huỷ
            </button>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-2 text-xs rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" /> Re-plan
            </button>
          )}
          <button
            onClick={() => onApprove(effectivePlan)}
            disabled={hasRedFlags}
            title={hasRedFlags ? 'Có red flag — sửa trước khi approve' : ''}
            className="px-4 py-2 text-xs font-medium rounded-md bg-gradient-to-r from-brand-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white inline-flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Approve · Render
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub views
// ============================================================
function TabButton({
  active, onClick, icon, children,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
        active
          ? 'bg-brand-500/15 text-brand-200 border border-brand-500/30'
          : 'text-text-muted hover:text-text hover:bg-bg-soft border border-transparent'
      }`}
    >
      {icon} {children}
    </button>
  );
}

function BibleView({
  bible, refs, refUrls,
}: { bible: DirectorPlan['continuity_bible']; refs: ReferenceAsset[]; refUrls: string[] }) {
  return (
    <div className="space-y-4 text-sm">
      <Section title="Concept">
        <Field label="Title" value={bible.title} />
        <Field label="Logline" value={bible.logline} />
        <Field label="Intent" value={bible.intent} />
        {bible.director_notes && <Field label="Director's notes" value={bible.director_notes} long />}
      </Section>

      <Section title={`Characters (${bible.characters.length})`}>
        {bible.characters.length === 0 ? <Empty>No character in this plan.</Empty> :
          bible.characters.map((c) => (
            <div key={c.id} className="px-3 py-2 rounded-md bg-bg-soft border border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text">{c.name} <span className="text-text-subtle">· {c.role}</span></span>
                <span className="text-text-subtle font-mono">{c.id}</span>
              </div>
              <div className="text-xs text-text-muted mt-1 leading-relaxed">{c.face_signature}</div>
              {c.outfit && <div className="text-xs text-text-subtle mt-1">Outfit: {c.outfit}</div>}
            </div>
          ))}
      </Section>

      {bible.products.length > 0 && (
        <Section title={`Products (${bible.products.length})`}>
          {bible.products.map((p) => (
            <div key={p.id} className="px-3 py-2 rounded-md bg-bg-soft border border-border">
              <div className="text-xs font-medium">{p.name} <span className="text-text-subtle font-mono">{p.id}</span></div>
              {p.packaging_description && <div className="text-xs text-text-muted mt-1">{p.packaging_description}</div>}
              {p.hero_features.length > 0 && (
                <div className="text-xs text-text-subtle mt-1">Hero: {p.hero_features.join(' · ')}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      <Section title="Visual Style">
        <Field label="Cinematography" value={bible.visual_style.cinematography} />
        <Field label="Color grading" value={bible.visual_style.color_grading} />
        <Field label="Lighting" value={bible.visual_style.lighting_design} />
        <Field label="Camera language" value={bible.visual_style.camera_language} />
        <Field label="Grain" value={bible.visual_style.film_grain} />
      </Section>

      <Section title="Audio Design">
        <Field label="Mood" value={bible.audio_design.mood} />
        <Field label="Tempo" value={bible.audio_design.tempo} />
        <Field label="Genre" value={bible.audio_design.music_genre} />
        <Field label="Dialogue style" value={bible.audio_design.dialogue_style} />
        {bible.audio_design.sfx_emphasis.length > 0 && (
          <Field label="SFX" value={bible.audio_design.sfx_emphasis.join(', ')} />
        )}
      </Section>

      <Section title="Setting">
        <Field label="Location" value={bible.setting.location} />
        <Field label="Time of day" value={bible.setting.time_of_day} />
        <Field label="Atmosphere" value={bible.setting.atmosphere} />
      </Section>

      <Section title="Constraints">
        {bible.constraints.must_have.length > 0 && (
          <Field label="Must have" value={bible.constraints.must_have.join(' · ')} />
        )}
        {bible.constraints.must_avoid.length > 0 && (
          <Field label="Must avoid" value={bible.constraints.must_avoid.join(' · ')} />
        )}
        {bible.constraints.brand_safety.length > 0 && (
          <Field label="Brand safety" value={bible.constraints.brand_safety.join(' · ')} />
        )}
      </Section>

      {refs.length > 0 && (
        <Section title={`Reference Assets (${refs.length}) — Universal binding`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {refs.map((r) => {
              const url = refUrls[r.index] ?? r.url;
              return (
                <div key={r.index} className="rounded-md border border-border overflow-hidden bg-bg-soft">
                  {url && <img src={url} className="w-full aspect-square object-cover" alt="" />}
                  <div className="px-2 py-1.5 text-[10px]">
                    <div className="text-brand-300 font-medium">{r.role}</div>
                    <div className="text-text-subtle">→ {r.apply_to_shots.join(', ') || '—'}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

function ShotListView({ shots }: { shots: Shot[] }) {
  return (
    <div className="space-y-3">
      <div className="text-xs text-text-subtle">
        {shots.length} shots · {shots.reduce((s, x) => s + x.duration_s, 0)}s total
      </div>
      {shots.map((s) => (
        <div key={s.shot_id} className="rounded-md border border-border bg-bg-soft px-3 py-2.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-brand-300">{s.shot_id}</span>
              <span className="text-text-muted">{s.purpose}</span>
              {s.continuity.previous_shot_id && (
                <span className="text-amber-300 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10">
                  chain ← {s.continuity.previous_shot_id}
                </span>
              )}
            </div>
            <div className="text-text-subtle font-mono">
              {s.start_s.toFixed(1)}–{s.end_s.toFixed(1)}s · {s.duration_s}s
            </div>
          </div>
          <div className="text-xs text-text leading-relaxed">
            <span className="text-text-subtle">{s.visual.camera_shot} {s.visual.camera_movement}</span> · {s.visual.subject}. {s.visual.action}.
          </div>
          {s.audio.dialogue_vn && (
            <div className="mt-1.5 text-xs text-emerald-200/90">
              💬 "{s.audio.dialogue_vn}"
            </div>
          )}
          {s.audio.caption_on_screen && (
            <div className="mt-1 text-xs text-fuchsia-200/90">
              📝 {s.audio.caption_on_screen}
            </div>
          )}
          <div className="mt-2 flex items-center gap-2 text-[10px] text-text-subtle">
            {s.continuity.reference_indices.length > 0 && (
              <span>refs: {s.continuity.reference_indices.join(',')}</span>
            )}
            <span>model: {s.model_routing.preferred_model}</span>
            {s.emotion_beat && <span>beat: {s.emotion_beat}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function StoryboardView({
  plan, onGenerate, isGenerating,
}: { plan: DirectorPlan; onGenerate: () => void; isGenerating: boolean }) {
  const hasGenerated = plan.storyboard_grid.some((f) => f.generated_url || f.user_uploaded_url);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-subtle">
          {plan.storyboard_grid.length} frames · est. ${(0.04 * plan.storyboard_grid.length).toFixed(2)}
        </div>
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="text-xs px-3 py-1.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-200 hover:bg-brand-500/25 inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
          {hasGenerated ? 'Regenerate' : 'Generate storyboard images'}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {plan.storyboard_grid.map((f) => (
          <div key={f.shot_id} className="rounded-md border border-border bg-bg-soft overflow-hidden">
            <div className="aspect-[9/16] bg-bg-card flex items-center justify-center">
              {f.generated_url || f.user_uploaded_url ? (
                <img src={f.generated_url || f.user_uploaded_url || ''} className="w-full h-full object-cover" alt="" />
              ) : (
                <ImgIcon className="w-8 h-8 text-text-subtle" />
              )}
            </div>
            <div className="px-2 py-1.5 text-[10px] text-text-subtle">
              <span className="font-mono text-brand-300">{f.shot_id}</span> · {f.prompt.slice(0, 80)}…
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EvaluationView({ report }: { report: DirectorPlan['evaluation'] }) {
  const scores = [
    { label: 'Consistency', value: report.consistency_score },
    { label: 'Viral potential', value: report.viral_potential_score },
    { label: 'Cinematic', value: report.cinematic_score },
    { label: 'Pacing', value: report.pacing_score },
    { label: 'Brand safety', value: report.brand_safety_score },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-brand-500/30 bg-gradient-to-br from-brand-500/10 to-fuchsia-500/10 px-4 py-3">
        <div className="text-xs uppercase tracking-wider text-text-subtle">Overall</div>
        <div className="text-3xl font-bold text-text">{report.overall_score.toFixed(1)}<span className="text-base text-text-subtle">/10</span></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {scores.map((s) => (
          <div key={s.label} className="rounded-md border border-border bg-bg-soft px-3 py-2">
            <div className="text-[10px] text-text-subtle uppercase">{s.label}</div>
            <div className="text-lg font-semibold">{s.value.toFixed(1)}</div>
          </div>
        ))}
      </div>

      {report.red_flags.length > 0 && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2">
          <div className="text-xs font-medium text-rose-300 inline-flex items-center gap-1.5 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Red flags ({report.red_flags.length})
          </div>
          <ul className="text-xs text-rose-200 list-disc pl-5 space-y-0.5">
            {report.red_flags.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}

      {report.strengths.length > 0 && (
        <Section title="Strengths">
          <ul className="text-xs text-text list-disc pl-5 space-y-1">
            {report.strengths.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      )}
      {report.weaknesses.length > 0 && (
        <Section title="Weaknesses">
          <ul className="text-xs text-text-muted list-disc pl-5 space-y-1">
            {report.weaknesses.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      )}
      {report.suggestions.length > 0 && (
        <Section title="Suggestions">
          <ul className="text-xs text-amber-200/90 list-disc pl-5 space-y-1">
            {report.suggestions.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-widest text-text-subtle font-medium">{title}</div>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value, long = false }: { label: string; value?: string; long?: boolean }) {
  if (!value) return null;
  return (
    <div className={`flex ${long ? 'flex-col' : 'items-start'} gap-1.5 text-xs`}>
      <span className="text-text-subtle min-w-[110px] shrink-0">{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-xs text-text-subtle italic">{children}</div>;
}
