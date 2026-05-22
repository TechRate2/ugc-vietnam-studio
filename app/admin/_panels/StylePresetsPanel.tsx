'use client';

/**
 * Style Presets Panel — Admin §1.
 *
 * Grid view of all presets (built-in + user-created). Click → expand inspector
 * on right showing all fields. "New Preset" button opens inline form for
 * create-from-scratch (Bible-style fields).
 */

import { useState } from 'react';
import { Palette, Plus, Trash2, Lock, Search, X } from 'lucide-react';
import { useStylePresets, type StylePreset } from '@/lib/studio/use-admin';

export function StylePresetsPanel() {
  const lib = useStylePresets();
  const [selected, setSelected] = useState<StylePreset | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="flex h-full">
      {/* List */}
      <div className="w-[420px] border-r border-border flex flex-col">
        <div className="px-5 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-brand-300" />
              <h1 className="text-sm font-semibold text-text">Style Presets ({lib.items.length})</h1>
            </div>
            <button
              onClick={() => { setCreating(true); setSelected(null); }}
              className="text-xs px-2.5 py-1.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-200 hover:bg-brand-500/25 inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-text-subtle" />
            <input
              type="text"
              value={lib.search}
              onChange={(e) => lib.setSearch(e.target.value)}
              placeholder="Tìm theo name / tags / description"
              className="w-full pl-7 pr-2 py-1.5 text-xs bg-bg-soft border border-border rounded-md text-text focus:outline-none focus:border-brand-500 placeholder:text-text-subtle"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {lib.loading ? (
            <div className="p-6 text-center text-text-subtle text-sm">Đang tải…</div>
          ) : lib.error ? (
            <div className="p-6 text-center text-rose-300 text-sm">Lỗi: {lib.error}</div>
          ) : lib.items.length === 0 ? (
            <div className="p-6 text-center text-text-subtle text-sm">Chưa có preset nào.</div>
          ) : (
            lib.items.map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelected(p); setCreating(false); }}
                className={`group w-full text-left px-5 py-3 transition ${
                  selected?.id === p.id
                    ? 'bg-brand-500/10 border-l-2 border-brand-500'
                    : 'hover:bg-bg-soft border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {p.is_builtin && <Lock className="w-3 h-3 text-amber-400" />}
                    <span className="text-sm font-medium text-text truncate">{p.name}</span>
                  </div>
                  {!p.is_builtin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Xoá preset "${p.name}"?`)) {
                          void lib.remove(p.id);
                          if (selected?.id === p.id) setSelected(null);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                {p.description && (
                  <div className="text-[11px] text-text-muted line-clamp-1">{p.description}</div>
                )}
                {p.tags && (
                  <div className="text-[10px] text-text-subtle mt-0.5 truncate">#{p.tags.split(',').slice(0, 4).join(' #')}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Inspector / Creator */}
      <div className="flex-1 overflow-y-auto p-6">
        {creating ? (
          <CreatePresetForm
            onCancel={() => setCreating(false)}
            onCreated={(p) => { setCreating(false); setSelected(p); }}
            onCreate={lib.create}
          />
        ) : selected ? (
          <PresetInspector preset={selected} />
        ) : (
          <div className="h-full flex items-center justify-center text-text-subtle text-sm">
            Chọn preset bên trái để xem chi tiết, hoặc "+ New" để tạo mới.
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Inspector
// ============================================================
function PresetInspector({ preset }: { preset: StylePreset }) {
  return (
    <div className="space-y-5 text-sm">
      <div>
        <div className="flex items-center gap-2 mb-1">
          {preset.is_builtin && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> Built-in
            </span>
          )}
          <h2 className="text-lg font-semibold text-text">{preset.name}</h2>
        </div>
        {preset.description && <p className="text-xs text-text-muted">{preset.description}</p>}
        {preset.tags && <div className="mt-1 text-[10px] text-text-subtle">#{preset.tags.split(',').map((t) => t.trim()).join(' #')}</div>}
      </div>

      <Section title="Visual Style">
        <KV label="Cinematography" value={preset.visual_style.cinematography} />
        <KV label="Color grading" value={preset.visual_style.color_grading} />
        <KV label="Lighting" value={preset.visual_style.lighting_design} />
        <KV label="Camera language" value={preset.visual_style.camera_language} />
        <KV label="Grain" value={preset.visual_style.film_grain} />
        <KV label="Aspect ratio" value={preset.visual_style.aspect_ratio} />
      </Section>

      <Section title="Audio Design">
        <KV label="Mood" value={preset.audio_design.mood} />
        <KV label="Tempo" value={preset.audio_design.tempo} />
        <KV label="Music genre" value={preset.audio_design.music_genre} />
        <KV label="Dialogue style" value={preset.audio_design.dialogue_style} />
        {preset.audio_design.sfx_emphasis.length > 0 && (
          <KV label="SFX" value={preset.audio_design.sfx_emphasis.join(', ')} />
        )}
      </Section>

      <Section title="Setting">
        <KV label="Location" value={preset.setting.location} />
        <KV label="Time of day" value={preset.setting.time_of_day} />
        <KV label="Atmosphere" value={preset.setting.atmosphere} />
      </Section>

      <Section title="Constraints">
        {preset.constraints.must_have.length > 0 && <KV label="Must have" value={preset.constraints.must_have.join(' · ')} />}
        {preset.constraints.must_avoid.length > 0 && <KV label="Must avoid" value={preset.constraints.must_avoid.join(' · ')} />}
        {preset.constraints.brand_safety.length > 0 && <KV label="Brand safety" value={preset.constraints.brand_safety.join(' · ')} />}
      </Section>
    </div>
  );
}

// ============================================================
// Create form
// ============================================================
function CreatePresetForm({
  onCancel, onCreated, onCreate,
}: {
  onCancel: () => void;
  onCreated: (p: StylePreset) => void;
  onCreate: ReturnType<typeof useStylePresets>['create'];
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [cinematography, setCinematography] = useState('');
  const [colorGrading, setColorGrading] = useState('');
  const [lighting, setLighting] = useState('');
  const [cameraLang, setCameraLang] = useState('');
  const [grain, setGrain] = useState('');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [mood, setMood] = useState('');
  const [tempo, setTempo] = useState('');
  const [musicGenre, setMusicGenre] = useState('');
  const [dialogueStyle, setDialogueStyle] = useState('conversational');
  const [location, setLocation] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Cần đặt name');
      return;
    }
    setSubmitting(true); setError(null);
    try {
      const saved = await onCreate({
        name: name.trim(),
        description: description.trim(),
        visual_style: {
          cinematography, color_grading: colorGrading, lighting_design: lighting,
          camera_language: cameraLang, film_grain: grain, aspect_ratio: aspectRatio,
        },
        audio_design: {
          mood, tempo, music_genre: musicGenre,
          sfx_emphasis: [], dialogue_style: dialogueStyle,
        },
        setting: { location, time_of_day: timeOfDay, atmosphere },
        constraints: { must_have: [], must_avoid: [], brand_safety: [] },
        tags: tags.trim(),
      });
      onCreated(saved);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">+ New Style Preset</h2>
        <button onClick={onCancel} className="p-1.5 rounded hover:bg-bg-hover text-text-muted">
          <X className="w-4 h-4" />
        </button>
      </div>

      <FormField label="Name *">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="vd: Cinematic 35mm — Cool teal"
          className="w-full bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500"
        />
      </FormField>
      <FormField label="Description">
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="1-2 câu mô tả ngắn"
          className="w-full bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500 resize-y"
        />
      </FormField>
      <FormField label="Tags (CSV)">
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="vd: cinematic, premium, UGC"
          className="w-full bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500"
        />
      </FormField>

      <FormGroup title="Visual Style">
        <FormInput label="Cinematography" value={cinematography} onChange={setCinematography} placeholder="cinematic 35mm anamorphic, shallow DOF" />
        <FormInput label="Color grading" value={colorGrading} onChange={setColorGrading} placeholder="warm filmic, slight teal shadows" />
        <FormInput label="Lighting" value={lighting} onChange={setLighting} placeholder="golden hour soft window, key+fill 3:1" />
        <FormInput label="Camera language" value={cameraLang} onChange={setCameraLang} placeholder="slow dolly-in, rack focus reveals" />
        <FormInput label="Film grain" value={grain} onChange={setGrain} placeholder="light 35mm grain" />
        <FormField label="Aspect ratio">
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            className="bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500"
          >
            <option value="9:16">9:16 (TikTok / Reels)</option>
            <option value="16:9">16:9 (YouTube)</option>
            <option value="1:1">1:1 (Feed)</option>
          </select>
        </FormField>
      </FormGroup>

      <FormGroup title="Audio Design">
        <FormInput label="Mood" value={mood} onChange={setMood} placeholder="warm, intimate" />
        <FormInput label="Tempo" value={tempo} onChange={setTempo} placeholder="slow / mid / fast" />
        <FormInput label="Music genre" value={musicGenre} onChange={setMusicGenre} placeholder="lo-fi acoustic" />
        <FormField label="Dialogue style">
          <select
            value={dialogueStyle}
            onChange={(e) => setDialogueStyle(e.target.value)}
            className="bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500"
          >
            <option value="silent">silent</option>
            <option value="conversational">conversational</option>
            <option value="monologue">monologue</option>
            <option value="VO narration">VO narration</option>
          </select>
        </FormField>
      </FormGroup>

      <FormGroup title="Setting">
        <FormInput label="Location" value={location} onChange={setLocation} placeholder="indoor cafe / bedroom / studio" />
        <FormInput label="Time of day" value={timeOfDay} onChange={setTimeOfDay} placeholder="late afternoon" />
        <FormInput label="Atmosphere" value={atmosphere} onChange={setAtmosphere} placeholder="cosy" />
      </FormGroup>

      {error && (
        <div className="text-xs text-rose-300 px-3 py-2 rounded bg-rose-500/10 border border-rose-500/30">{error}</div>
      )}
      <div className="flex items-center gap-2 pt-2">
        <button onClick={onCancel} className="px-4 py-2 text-xs rounded-md border border-border bg-bg-soft hover:bg-bg-hover text-text-muted">
          Huỷ
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim()}
          className="px-4 py-2 text-xs font-medium rounded-md bg-gradient-to-r from-brand-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-40 text-white"
        >
          {submitting ? 'Đang lưu…' : 'Lưu preset'}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Small helpers
// ============================================================
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-text-subtle font-medium mb-2">{title}</div>
      <div className="rounded-md border border-border bg-bg-soft px-3 py-2 space-y-1.5">{children}</div>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-text-subtle min-w-[120px] shrink-0">{label}</span>
      <span className="text-text leading-relaxed">{value}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-text-subtle uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}

function FormInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <FormField label={label}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-bg-soft border border-border rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-brand-500"
      />
    </FormField>
  );
}

function FormGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] uppercase tracking-widest text-brand-300 font-medium pt-2">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{children}</div>
    </div>
  );
}
