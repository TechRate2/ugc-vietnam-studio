'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Image as ImgIcon,
  Loader2,
  Upload,
  X,
  Sparkles,
  Code2,
  ChevronRight,
  Diamond,
} from 'lucide-react';
import { ModelInfoPanel } from '@/components/workspace/ModelInfoPanel';
import type {
  ImageModelSummary,
  ImageModelKey,
  DirectImageRequest,
  ImagePreviewResponse,
  ImageJobStatus,
} from '@/lib/image/model-types';
import { pickLocalFile, uploadLocalFile } from '@/lib/media/upload';

const VENDOR_LABEL: Record<string, string> = {
  bytedance: 'ByteDance',
  google: 'Google',
  alibaba: 'Alibaba',
};

const VARIANT_LABEL: Record<string, string> = {
  'text-to-image': 'Text → Image',
  'edit': 'Edit',
};

export function ImageDirectShell() {
  const [models, setModels] = useState<ImageModelSummary[]>([]);
  const [modelKey, setModelKey] = useState<ImageModelKey>('seedream_v45');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [size, setSize] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('');
  const [resolution, setResolution] = useState<string>('');
  const [n, setN] = useState<number>(1);
  const [seed, setSeed] = useState<number | ''>(-1);
  const [outputFormat, setOutputFormat] = useState<string>('default');
  const [thinkingMode, setThinkingMode] = useState(true);
  const [thinkingLevel, setThinkingLevel] = useState('default');
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');
  const [preview, setPreview] = useState<ImagePreviewResponse | null>(null);
  const [previewErr, setPreviewErr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<ImageJobStatus | null>(null);
  const [jobErr, setJobErr] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (previewAbortRef.current) previewAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    fetch('/api/v1/image/direct/models')
      .then((r) => r.json())
      .then((d) => setModels(d.models || []))
      .catch((e) => console.error(e));
  }, []);

  const current = models.find((m) => m.key === modelKey);

  useEffect(() => {
    if (!current) return;
    if (current.size_options) setSize(current.size_options[0]);
    else setSize('');
    if (current.aspect_ratio_options) {
      setAspectRatio(current.aspect_ratio_options.includes('9:16') ? '9:16' : current.aspect_ratio_options[0]);
    } else setAspectRatio('');
    if (current.resolution_options) setResolution(current.resolution_options[0]);
    else setResolution('');
    if (current.variant === 'text-to-image') setImages([]);
  }, [modelKey, models.length]);

  useEffect(() => {
    if (!current) return;
    const h = setTimeout(async () => {
      setPreviewErr('');
      if (previewAbortRef.current) previewAbortRef.current.abort();
      const controller = new AbortController();
      previewAbortRef.current = controller;
      try {
        const body: DirectImageRequest = {
          model_key: modelKey,
          prompt,
          size: size || undefined,
          aspect_ratio: aspectRatio || undefined,
          resolution: resolution || undefined,
          negative_prompt: negativePrompt || undefined,
          seed: typeof seed === 'number' ? seed : undefined,
        };
        if (current.variant === 'edit') body.images = images.length ? images : undefined;
        if ('n' in current.extras) body.n = n;
        if ('output_format' in current.extras) body.output_format = outputFormat;
        if ('thinking_mode' in current.extras) body.thinking_mode = thinkingMode;
        if ('thinking_level' in current.extras) body.thinking_level = thinkingLevel;
        if ('enable_web_search' in current.extras) body.enable_web_search = enableWebSearch;

        const res = await fetch('/api/v1/image/direct/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (!res.ok) {
          setPreviewErr(data.detail || JSON.stringify(data));
          setPreview(null);
        } else {
          setPreview(data);
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;
        setPreviewErr(e.message);
      }
    }, 400);
    return () => clearTimeout(h);
  }, [modelKey, prompt, size, aspectRatio, resolution, negativePrompt, seed, images, n, outputFormat, thinkingMode, thinkingLevel, enableWebSearch, current?.variant]);

  const handleUpload = async () => {
    setUploadErr('');
    const files = await pickLocalFile('image/*', true);
    if (!files.length) return;
    setUploading(true);
    try {
      const max = current?.max_references || 10;
      const remaining = max - images.length;
      const toUpload = files.slice(0, remaining);
      const urls = await Promise.all(toUpload.map((f) => uploadLocalFile(f)));
      setImages((prev) => [...prev, ...urls]);
    } catch (e: any) {
      setUploadErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!preview || preview.exceeds_budget) return;
    setSubmitting(true);
    setJobErr('');
    setJob(null);
    try {
      const body: DirectImageRequest = {
        model_key: modelKey,
        prompt,
        size: size || undefined,
        aspect_ratio: aspectRatio || undefined,
        resolution: resolution || undefined,
        negative_prompt: negativePrompt || undefined,
        seed: typeof seed === 'number' ? seed : undefined,
        ...(current?.variant === 'edit' && { images: images.length ? images : undefined }),
        ...(current && 'n' in current.extras && { n }),
        ...(current && 'output_format' in current.extras && { output_format: outputFormat }),
        ...(current && 'thinking_mode' in current.extras && { thinking_mode: thinkingMode }),
        ...(current && 'thinking_level' in current.extras && { thinking_level: thinkingLevel }),
        ...(current && 'enable_web_search' in current.extras && { enable_web_search: enableWebSearch }),
      };
      const res = await fetch('/api/v1/image/direct/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setJobErr(data.detail || JSON.stringify(data));
        setSubmitting(false);
        return;
      }
      setJob({ ...data });
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const pr = await fetch(`/api/v1/image/direct/${data.job_id}`);
          const pd = await pr.json();
          setJob(pd);
          if (['completed', 'succeeded', 'failed'].includes(pd.status)) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setSubmitting(false);
          }
        } catch {}
      }, 3000);
    } catch (e: any) {
      setJobErr(e.message);
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!job?.job_id) return;
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    try {
      await fetch(`/api/v1/image/direct/${job.job_id}`, { method: 'DELETE' });
    } catch {}
    setSubmitting(false);
    setJob({ ...job, status: 'failed', error: 'Đã dừng theo dõi. Lưu ý: AtlasCloud chưa hỗ trợ cancel — prediction có thể vẫn chạy và bị tính tiền.' });
  };

  const canSubmit = !!preview && !preview.exceeds_budget && !submitting && prompt.trim().length > 0;

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-bg text-text overflow-hidden">
      {/* ===== HEADER STICKY ===== */}
      <header className="shrink-0 h-12 border-b border-border bg-bg-soft/80 backdrop-blur-xl flex items-center px-5 gap-5">
        <Link href="/studio" className="flex items-center gap-2 text-text-muted hover:text-text text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Studio
        </Link>
        <div className="flex items-center gap-1.5 text-text-subtle text-sm">
          <ChevronRight className="w-3 h-3" />
          <ImgIcon className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-text font-medium">Image Direct</span>
        </div>
        {current && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">{VENDOR_LABEL[current.vendor]}</span>
              <span className="text-text font-semibold text-sm">{current.name_vn.replace(/(ByteDance|Google|Alibaba)\s*/i, '').trim()}</span>
              <span className="hidden lg:inline px-2 py-0.5 rounded-full bg-bg-card border border-border text-text-subtle text-[11px] font-mono">
                {current.endpoint}
              </span>
            </div>
          </>
        )}
        <div className="flex-1" />
        {preview && (
          <div className="flex items-center gap-3 text-sm">
            <Diamond className="w-3.5 h-3.5 text-amber-300" />
            <span className={preview.exceeds_budget ? 'text-red-400 font-semibold' : 'text-text font-semibold'}>
              ${preview.cost_usd.toFixed(3)}
            </span>
            <span className="text-text-subtle">·</span>
            <span className="text-text-muted">{preview.cost_vnd.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-[340px] shrink-0 bg-bg-soft border-r border-border flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <Section title="Model" desc="Chọn vendor + variant để gen ảnh">
              <select
                value={modelKey}
                onChange={(e) => setModelKey(e.target.value as ImageModelKey)}
                className="input"
              >
                {models.map((m) => (
                  <option key={m.key} value={m.key} className="bg-bg-card">
                    {VENDOR_LABEL[m.vendor]} · {m.name_vn} · ${m.cost_per_image_usd}/img
                  </option>
                ))}
              </select>
              {current && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                  <Pill>{VARIANT_LABEL[current.variant]}</Pill>
                  {current.max_references > 0 && <Pill>{current.max_references} refs max</Pill>}
                  <Pill tone="amber">${current.cost_per_image_usd}/img</Pill>
                </div>
              )}
              {current && (
                <div className="mt-3">
                  <ModelInfoPanel
                    guide={current.guide}
                    modelName={current.name_vn}
                    onUseSamplePrompt={(p) => setPrompt(p)}
                    accent="amber"
                  />
                </div>
              )}
            </Section>

            <Section title="Prompt" desc="Mô tả ảnh càng chi tiết càng đẹp">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="A young Vietnamese woman in traditional ao dai, golden hour lighting, Hanoi old quarter background, cinematic..."
                className="input resize-none leading-relaxed"
              />
            </Section>

            {current?.variant === 'edit' && (
              <Section
                title="Reference Images"
                desc={`Upload tối đa ${current.max_references} ảnh để edit`}
                action={
                  <button
                    onClick={handleUpload}
                    disabled={uploading || images.length >= current.max_references}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-medium disabled:opacity-40 transition"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload
                  </button>
                }
              >
                <div className="text-[11px] text-text-subtle mb-2">{images.length} / {current.max_references}</div>
                <div className="grid grid-cols-4 gap-2">
                  {images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl border border-border bg-bg-card overflow-hidden">
                      <img src={url} alt={`ref ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-red-500 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {uploadErr && <ErrorBox msg={uploadErr} />}
              </Section>
            )}

            <Section title="Output" desc="Kích thước + tỷ lệ + định dạng">
              {current?.size_options && (
                <Field label="Size">
                  <select value={size} onChange={(e) => setSize(e.target.value)} className="input">
                    {current.size_options.map((s) => (
                      <option key={s} value={s} className="bg-bg-card">{s}</option>
                    ))}
                  </select>
                </Field>
              )}
              {current?.aspect_ratio_options && (
                <Field label="Aspect ratio">
                  <ChoiceGroup options={current.aspect_ratio_options} value={aspectRatio} onChange={setAspectRatio} accent="amber" />
                </Field>
              )}
              {current?.resolution_options && (
                <Field label="Resolution">
                  <ChoiceGroup options={current.resolution_options} value={resolution} onChange={setResolution} accent="amber" />
                </Field>
              )}
              {current && 'n' in current.extras && (
                <Field label="Number of images (1-4)">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={1}
                      max={4}
                      value={n}
                      onChange={(e) => setN(Number(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <div className="w-14 text-center px-2 py-1 rounded-md bg-bg-card border border-border text-sm tabular-nums">
                      {n}
                    </div>
                  </div>
                </Field>
              )}
            </Section>

            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-bg-card hover:bg-bg-hover border border-border text-[13px] font-medium transition"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-text-subtle" /> Advanced settings
                </span>
                <ChevronRight className={`w-4 h-4 transition ${showAdvanced ? 'rotate-90' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="mt-3 space-y-5 px-1">
                  {current && 'negative_prompt' in current.extras && (
                    <Field label="Negative prompt">
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                        placeholder="blurry, low quality..."
                        className="input resize-none text-xs"
                      />
                    </Field>
                  )}
                  {current && 'output_format' in current.extras && (
                    <Field label="Output format">
                      <ChoiceGroup
                        options={current.extras['output_format']?.options || ['default', 'png', 'jpeg']}
                        value={outputFormat}
                        onChange={setOutputFormat}
                        accent="amber"
                      />
                    </Field>
                  )}
                  {current && 'thinking_level' in current.extras && (
                    <Field label="Thinking level">
                      <ChoiceGroup
                        options={current.extras['thinking_level']?.options || ['default', 'high', 'minimal']}
                        value={thinkingLevel}
                        onChange={setThinkingLevel}
                        accent="amber"
                      />
                    </Field>
                  )}
                  {current && 'thinking_mode' in current.extras && (
                    <ToggleRow label="Thinking mode" value={thinkingMode} onChange={setThinkingMode} />
                  )}
                  {current && 'enable_web_search' in current.extras && (
                    <ToggleRow label="Web search grounding" value={enableWebSearch} onChange={setEnableWebSearch} />
                  )}
                  <Field label="Seed (-1 = random)">
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : '')}
                      className="input tabular-nums"
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 px-5 py-3.5 border-t border-border bg-bg-soft/95 backdrop-blur space-y-2">
            {previewErr && <ErrorBox msg={previewErr} />}
            <button
              onClick={handleGenerate}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-lg shadow-amber-600/30 hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang generate…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate image
                </>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
            <div className="card overflow-hidden">
              <div className="relative w-full bg-black min-h-[400px] flex items-center justify-center p-4">
                {!job && !submitting && (
                  <div className="flex flex-col items-center justify-center text-text-subtle py-12">
                    <div className="w-16 h-16 rounded-2xl border border-border bg-bg-soft flex items-center justify-center mb-4">
                      <ImgIcon className="w-7 h-7 opacity-50" />
                    </div>
                    <div className="text-sm font-medium text-text-muted">Ảnh sẽ hiện ở đây</div>
                    <div className="text-xs mt-1 text-text-subtle">
                      {n > 1 ? `${n} ảnh` : '1 ảnh'} · {aspectRatio || size || 'auto'}
                    </div>
                  </div>
                )}
                {submitting && !job?.image_url && (
                  <div className="flex flex-col items-center justify-center text-amber-200 py-12">
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                    <div className="text-sm font-medium capitalize">{job?.status || 'submitting'}…</div>
                  </div>
                )}
                {job?.image_urls && job.image_urls.length > 0 && (
                  <div className={`grid gap-3 w-full ${job.image_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {job.image_urls.map((u, i) => (
                      <div key={i} className="relative group rounded-xl overflow-hidden bg-bg-soft">
                        <img src={u} className="w-full object-contain" alt={`Output ${i + 1}`} />
                        <a
                          href={u}
                          download
                          className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black text-amber-200 text-xs font-medium opacity-0 group-hover:opacity-100 transition"
                        >
                          Download ↓
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {job?.status === 'failed' && (
                  <div className="text-red-300 text-center">
                    <div className="font-semibold">Job failed</div>
                    <div className="text-xs text-text-subtle mt-1">{job.error}</div>
                  </div>
                )}
                {jobErr && <div className="text-red-300 text-sm">{jobErr}</div>}
              </div>
            </div>

            {preview && (
              <div className="card overflow-hidden">
                <button
                  onClick={() => setShowPayload(!showPayload)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-bg-hover transition"
                >
                  <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-text-subtle" />
                    <span className="text-sm font-medium">Request payload</span>
                    <span className="text-xs text-text-subtle font-mono">POST {preview.endpoint}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-text-subtle transition ${showPayload ? 'rotate-90' : ''}`} />
                </button>
                {showPayload && (
                  <pre className="px-5 py-4 text-[12px] font-mono bg-bg/60 border-t border-border overflow-x-auto text-emerald-300/90 leading-relaxed">
{JSON.stringify(preview.payload, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Section({
  title,
  desc,
  action,
  children,
}: {
  title: string;
  desc?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-text font-semibold text-[13px]">{title}</div>
          {desc && <div className="text-text-subtle text-[11px] mt-0.5">{desc}</div>}
        </div>
        {action}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-text-muted text-[11px] font-medium mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function ChoiceGroup({
  options,
  value,
  onChange,
  accent = 'brand',
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  accent?: 'brand' | 'amber';
}) {
  const activeCls = accent === 'amber'
    ? 'border-amber-500 bg-amber-500/15 text-amber-100'
    : 'border-brand-500 bg-brand-700/25 text-brand-100';
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
            value === o ? activeCls : 'border-border bg-bg-card text-text-muted hover:bg-bg-hover hover:text-text'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-bg-card border border-border hover:bg-bg-hover transition"
    >
      <span className="text-sm text-text">{label}</span>
      <span className={`w-10 h-5 rounded-full transition relative ${value ? 'bg-amber-500' : 'bg-bg-hover border border-border'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'amber' }) {
  const cls = tone === 'amber'
    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
    : 'bg-bg-card text-text-muted border-border';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] ${cls}`}>
      {children}
    </span>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="text-[11px] text-red-300 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
      {msg}
    </div>
  );
}
