'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Video,
  Upload,
  X,
  Sparkles,
  Code2,
  ChevronRight,
  Diamond,
} from 'lucide-react';
import { ModelInfoPanel } from '@/components/workspace/ModelInfoPanel';
import type {
  ModelSummary,
  ModelKey,
  DirectVideoRequest,
  PreviewPayloadResponse,
  DirectJobStatus,
} from '@/lib/video/model-types';
import { pickLocalFile, uploadLocalFile } from '@/lib/media/upload';

const VENDOR_LABEL: Record<string, string> = {
  vidu: 'Vidu',
  alibaba: 'Alibaba',
  bytedance: 'ByteDance',
};

const VARIANT_LABEL: Record<string, string> = {
  'reference-to-video': 'Reference → Video',
  'image-to-video': 'Image → Video',
  'text-to-video': 'Text → Video',
};

const ASPECT_CLASS: Record<string, string> = {
  '9:16': 'aspect-[9/16] max-h-[70vh] mx-auto',
  '16:9': 'aspect-video',
  '1:1': 'aspect-square max-w-[70vh] mx-auto',
  '3:4': 'aspect-[3/4] max-h-[70vh] mx-auto',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '2:3': 'aspect-[2/3] max-h-[70vh] mx-auto',
};

export function VideoDirectShell() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [modelKey, setModelKey] = useState<ModelKey>('vidu_q3_ref');
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState<number>(5);
  const [resolution, setResolution] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('');
  const [images, setImages] = useState<string[]>([]);
  const [imageSingle, setImageSingle] = useState<string>('');
  const [generateAudio, setGenerateAudio] = useState(true);
  const [movementAmplitude, setMovementAmplitude] = useState<'auto' | 'small' | 'medium' | 'large'>('auto');
  const [promptExtend, setPromptExtend] = useState(true);
  const [seed, setSeed] = useState<number | ''>(0);
  const [watermark, setWatermark] = useState(false);
  const [returnLastFrame, setReturnLastFrame] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const [preview, setPreview] = useState<PreviewPayloadResponse | null>(null);
  const [previewErr, setPreviewErr] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState<DirectJobStatus | null>(null);
  const [jobErr, setJobErr] = useState('');

  // Refs để cleanup khi unmount + abort in-flight requests
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cleanup khi unmount: clear poll interval + abort previews đang chờ
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (previewAbortRef.current) previewAbortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    fetch('/api/v1/video/direct/models')
      .then((r) => r.json())
      .then((d) => setModels(d.models || []))
      .catch((e) => console.error('load models fail', e));
  }, []);

  const current = models.find((m) => m.key === modelKey);

  useEffect(() => {
    if (!current) return;
    setDuration(current.duration.default);
    setResolution(current.resolution_options[0]);
    if (current.aspect_ratio_options && current.aspect_ratio_options.length > 0) {
      setAspectRatio(
        current.aspect_ratio_options.includes('9:16')
          ? '9:16'
          : current.aspect_ratio_options[0],
      );
    } else {
      setAspectRatio('');
    }
    if (current.variant === 'text-to-video') {
      setImages([]);
      setImageSingle('');
    }
  }, [modelKey, models.length]);

  useEffect(() => {
    if (!current) return;
    const handle = setTimeout(async () => {
      setPreviewErr('');
      // Abort request cũ trước khi fire request mới (chống race condition)
      if (previewAbortRef.current) previewAbortRef.current.abort();
      const controller = new AbortController();
      previewAbortRef.current = controller;
      try {
        const body: DirectVideoRequest = {
          model_key: modelKey,
          prompt,
          duration_s: duration,
          resolution: resolution || undefined,
          aspect_ratio: aspectRatio || undefined,
          negative_prompt: negativePrompt || undefined,
          seed: typeof seed === 'number' ? seed : undefined,
        };
        if (current.variant === 'reference-to-video') {
          body.images = images.length ? images : undefined;
        } else if (current.variant === 'image-to-video') {
          body.image = imageSingle || undefined;
        }
        if (current.extra_fields.includes('generate_audio')) body.generate_audio = generateAudio;
        if (current.extra_fields.includes('movement_amplitude')) body.movement_amplitude = movementAmplitude;
        if (current.extra_fields.includes('prompt_extend')) body.prompt_extend = promptExtend;
        if (current.extra_fields.includes('watermark')) body.watermark = watermark;
        if (current.extra_fields.includes('return_last_frame')) body.return_last_frame = returnLastFrame;

        const res = await fetch('/api/v1/video/direct/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
        const data = await res.json();
        if (controller.signal.aborted) return;  // ignore stale
        if (!res.ok) {
          setPreviewErr(data.detail || JSON.stringify(data));
          setPreview(null);
        } else {
          setPreview(data);
        }
      } catch (e: any) {
        if (e.name === 'AbortError') return;  // expected khi đổi setting nhanh
        setPreviewErr(e.message);
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [modelKey, prompt, duration, resolution, aspectRatio, negativePrompt, images, imageSingle, generateAudio, movementAmplitude, promptExtend, seed, watermark, returnLastFrame, current?.variant]);

  const handleGenerate = async () => {
    if (!preview || preview.exceeds_budget) return;
    setSubmitting(true);
    setJobErr('');
    setJob(null);
    try {
      const body: DirectVideoRequest = {
        model_key: modelKey,
        prompt,
        duration_s: duration,
        resolution: resolution || undefined,
        aspect_ratio: aspectRatio || undefined,
        negative_prompt: negativePrompt || undefined,
        seed: typeof seed === 'number' ? seed : undefined,
        ...(current?.variant === 'reference-to-video' && { images: images.length ? images : undefined }),
        ...(current?.variant === 'image-to-video' && { image: imageSingle || undefined }),
        ...(current?.extra_fields.includes('generate_audio') && { generate_audio: generateAudio }),
        ...(current?.extra_fields.includes('movement_amplitude') && { movement_amplitude: movementAmplitude }),
        ...(current?.extra_fields.includes('prompt_extend') && { prompt_extend: promptExtend }),
        ...(current?.extra_fields.includes('watermark') && { watermark }),
        ...(current?.extra_fields.includes('return_last_frame') && { return_last_frame: returnLastFrame }),
      };
      const res = await fetch('/api/v1/video/direct/generate', {
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
      // Cleanup poll cũ nếu có (tránh leak nếu user submit liên tục)
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        try {
          const pr = await fetch(`/api/v1/video/direct/${data.job_id}`);
          const pd = await pr.json();
          setJob(pd);
          if (['completed', 'succeeded', 'failed'].includes(pd.status)) {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            setSubmitting(false);
          }
        } catch {
          // Network error transient — sẽ retry tick sau
        }
      }, 4000);
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
      await fetch(`/api/v1/video/direct/${job.job_id}`, { method: 'DELETE' });
    } catch {}
    setSubmitting(false);
    setJob({ ...job, status: 'failed', error: 'Đã dừng theo dõi. Lưu ý: AtlasCloud chưa hỗ trợ cancel — prediction có thể vẫn chạy và bị tính tiền.' });
  };

  const handleUploadMulti = async () => {
    if (!current) return;
    setUploadErr('');
    const files = await pickLocalFile('image/*', true);
    if (!files.length) return;
    setUploading(true);
    try {
      const remaining = current.max_references - images.length;
      const urls = await Promise.all(files.slice(0, remaining).map((f) => uploadLocalFile(f)));
      setImages((prev) => [...prev, ...urls]);
    } catch (e: any) {
      setUploadErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadSingle = async () => {
    setUploadErr('');
    const files = await pickLocalFile('image/*', false);
    if (!files.length) return;
    setUploading(true);
    try {
      const url = await uploadLocalFile(files[0]);
      setImageSingle(url);
    } catch (e: any) {
      setUploadErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = !!preview && !preview.exceeds_budget && !submitting && prompt.trim().length > 0;
  const aspectCls = ASPECT_CLASS[aspectRatio] || 'aspect-video';

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-bg text-text overflow-hidden">
      {/* ===== HEADER STICKY ===== */}
      <header className="shrink-0 h-12 border-b border-border bg-bg-soft/80 backdrop-blur-xl flex items-center px-5 gap-5">
        <Link href="/studio" className="flex items-center gap-2 text-text-muted hover:text-text text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Studio
        </Link>
        <div className="flex items-center gap-1.5 text-text-subtle text-sm">
          <ChevronRight className="w-3 h-3" />
          <Video className="w-3.5 h-3.5 text-brand-300" />
          <span className="text-text font-medium">Video Direct</span>
        </div>
        {current && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">{VENDOR_LABEL[current.vendor]}</span>
              <span className="text-text font-semibold text-sm">{current.name_vn.replace(VENDOR_LABEL[current.vendor], '').trim()}</span>
              <span className="hidden lg:inline px-2 py-0.5 rounded-full bg-bg-card border border-border text-text-subtle text-[11px] font-mono">
                {current.endpoint}
              </span>
            </div>
          </>
        )}
        <div className="flex-1" />
        {preview && (
          <div className="flex items-center gap-3 text-sm">
            <Diamond className="w-3.5 h-3.5 text-brand-300" />
            <span className={preview.exceeds_budget ? 'text-red-400 font-semibold' : 'text-text font-semibold'}>
              ${preview.cost_usd.toFixed(3)}
            </span>
            <span className="text-text-subtle">·</span>
            <span className="text-text-muted">{preview.cost_vnd.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-[340px] shrink-0 bg-bg-soft border-r border-border flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {/* Section 1 — Model */}
            <Section title="Model" desc="Chọn vendor + variant để gen video">
              <select
                value={modelKey}
                onChange={(e) => setModelKey(e.target.value as ModelKey)}
                className="input"
              >
                {models.map((m) => (
                  <option key={m.key} value={m.key} className="bg-bg-card">
                    {VENDOR_LABEL[m.vendor]} · {m.name_vn.replace(VENDOR_LABEL[m.vendor], '').trim()} · ${m.cost_per_second_usd}/s
                  </option>
                ))}
              </select>
              {current && (
                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px]">
                  <Pill>{VARIANT_LABEL[current.variant]}</Pill>
                  <Pill>{current.duration.min}-{current.duration.max}s</Pill>
                  <Pill>{current.max_references} refs</Pill>
                  <Pill tone="emerald">${current.cost_per_second_usd}/s</Pill>
                </div>
              )}
              {current && (
                <div className="mt-3">
                  <ModelInfoPanel
                    guide={current.guide}
                    modelName={current.name_vn}
                    onUseSamplePrompt={(p) => setPrompt(p)}
                    accent="brand"
                  />
                </div>
              )}
            </Section>

            {/* Section 2 — Prompt */}
            <Section title="Prompt" desc="Mô tả video càng chi tiết càng đẹp">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                placeholder="Một cô gái Việt Nam đang đi dạo ở phố cổ Hà Nội, ánh nắng buổi sáng vàng dịu, camera handheld iPhone..."
                className="input resize-none leading-relaxed"
              />
            </Section>

            {/* Section 3 — References (variant-dependent) */}
            {current?.variant === 'reference-to-video' && (
              <Section
                title="References"
                desc={`Upload tối đa ${current.max_references} ảnh tham chiếu`}
                action={
                  <button
                    onClick={handleUploadMulti}
                    disabled={uploading || images.length >= current.max_references}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-700/20 hover:bg-brand-700/30 border border-brand-700/40 text-brand-200 text-xs font-medium disabled:opacity-40 transition"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload
                  </button>
                }
              >
                <div className="text-[11px] text-text-subtle mb-2">{images.length} / {current.max_references}</div>
                <div className="grid grid-cols-4 gap-2 mb-2">
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
                <input
                  placeholder="Hoặc paste URL ảnh rồi Enter..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      const v = e.currentTarget.value.trim();
                      setImages((p) => [...p, v].slice(0, current.max_references));
                      e.currentTarget.value = '';
                    }
                  }}
                  className="input text-xs font-mono"
                />
                {uploadErr && <ErrorBox msg={uploadErr} />}
              </Section>
            )}

            {current?.variant === 'image-to-video' && (
              <Section
                title="First-Frame Image"
                desc="Ảnh khởi đầu — video sẽ animate từ đây"
                action={
                  <button
                    onClick={handleUploadSingle}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-700/20 hover:bg-brand-700/30 border border-brand-700/40 text-brand-200 text-xs font-medium disabled:opacity-40 transition"
                  >
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Upload
                  </button>
                }
              >
                {imageSingle && (
                  <div className="relative mb-2 rounded-xl border border-border overflow-hidden bg-bg-card">
                    <img src={imageSingle} className="w-full h-40 object-cover" alt="First frame" />
                    <button
                      onClick={() => setImageSingle('')}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/80 hover:bg-red-500 flex items-center justify-center transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  value={imageSingle}
                  onChange={(e) => setImageSingle(e.target.value)}
                  placeholder="Hoặc paste URL ảnh..."
                  className="input text-xs font-mono"
                />
                {uploadErr && <ErrorBox msg={uploadErr} />}
              </Section>
            )}

            {/* Section 4 — Output settings */}
            <Section title="Output" desc="Duration, độ phân giải, tỷ lệ khung hình">
              {current && (
                <>
                  <Field label={`Duration ${current.duration.min}–${current.duration.max}s`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={current.duration.min}
                        max={current.duration.max}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="flex-1 accent-brand-500"
                      />
                      <div className="w-14 text-center px-2 py-1 rounded-md bg-bg-card border border-border text-sm tabular-nums">
                        {duration}s
                      </div>
                    </div>
                  </Field>

                  <Field label="Resolution">
                    <ChoiceGroup
                      options={current.resolution_options}
                      value={resolution}
                      onChange={setResolution}
                    />
                  </Field>

                  {current.aspect_ratio_options && current.aspect_ratio_options.length > 0 && (
                    <Field label="Aspect ratio">
                      <ChoiceGroup
                        options={current.aspect_ratio_options}
                        value={aspectRatio}
                        onChange={setAspectRatio}
                      />
                    </Field>
                  )}
                </>
              )}
            </Section>

            {/* Advanced collapse */}
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
                  {current?.extra_fields.includes('negative_prompt') && (
                    <Field label="Negative prompt">
                      <textarea
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        rows={2}
                        placeholder="blurry, low quality, distorted..."
                        className="input resize-none text-xs"
                      />
                    </Field>
                  )}
                  {current?.extra_fields.includes('movement_amplitude') && (
                    <Field label="Movement amplitude">
                      <ChoiceGroup
                        options={['auto', 'small', 'medium', 'large']}
                        value={movementAmplitude}
                        onChange={(v) => setMovementAmplitude(v as any)}
                      />
                    </Field>
                  )}
                  {current?.extra_fields.includes('generate_audio') && (
                    <ToggleRow label="Generate native audio" value={generateAudio} onChange={setGenerateAudio} />
                  )}
                  {current?.extra_fields.includes('prompt_extend') && (
                    <ToggleRow label="AI prompt enhance" value={promptExtend} onChange={setPromptExtend} />
                  )}
                  {current?.extra_fields.includes('watermark') && (
                    <ToggleRow label="Watermark" value={watermark} onChange={setWatermark} />
                  )}
                  {current?.extra_fields.includes('return_last_frame') && (
                    <ToggleRow label="Return last frame" value={returnLastFrame} onChange={setReturnLastFrame} />
                  )}
                  <Field label="Seed (reproducibility, -1 = random)">
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

          {/* Sticky footer — Submit */}
          <div className="shrink-0 px-5 py-3.5 border-t border-border bg-bg-soft/95 backdrop-blur space-y-2">
            {previewErr && <ErrorBox msg={previewErr} />}
            <button
              onClick={handleGenerate}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-lg shadow-brand-600/30 hover:scale-[1.01]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Đang generate…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate video
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ===== CANVAS ===== */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
            {/* Preview frame — aspect-ratio adaptive */}
            <div className="card overflow-hidden">
              <div className={`relative w-full bg-black ${aspectCls} transition-all`}>
                {!job && !submitting && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-text-subtle">
                    <div className="w-16 h-16 rounded-2xl border border-border bg-bg-soft flex items-center justify-center mb-4">
                      <Video className="w-7 h-7 opacity-50" />
                    </div>
                    <div className="text-sm font-medium text-text-muted">Video sẽ hiện ở đây</div>
                    <div className="text-xs mt-1 text-text-subtle">
                      Bố cục đúng tỷ lệ {aspectRatio || 'auto'}
                    </div>
                  </div>
                )}
                {submitting && !job?.video_url && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-200">
                    <Loader2 className="w-10 h-10 animate-spin mb-3" />
                    <div className="text-sm font-medium capitalize">{job?.status || 'submitting'}…</div>
                    {job?.job_id && (
                      <div className="text-xs text-text-subtle mt-1 font-mono">{job.job_id.slice(0, 8)}</div>
                    )}
                  </div>
                )}
                {job?.video_url && (
                  <video src={job.video_url} controls autoPlay className="absolute inset-0 w-full h-full object-contain bg-black" />
                )}
                {job?.status === 'failed' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-red-300">
                    <div className="font-semibold mb-1">Job failed</div>
                    <div className="text-xs text-text-subtle">{job.error}</div>
                  </div>
                )}
                {jobErr && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-300 text-sm px-6 text-center">
                    {jobErr}
                  </div>
                )}
              </div>
              {job?.video_url && (
                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                  <span className="text-xs text-text-subtle font-mono">{job.job_id}</span>
                  <a
                    href={job.video_url}
                    download
                    className="text-brand-300 text-sm hover:text-brand-200 transition font-medium"
                  >
                    Tải MP4 ↓
                  </a>
                </div>
              )}
            </div>

            {/* Payload preview — collapsible */}
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

// ============ SUB-COMPONENTS ============

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
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition ${
            value === o
              ? 'border-brand-500 bg-brand-700/25 text-brand-100'
              : 'border-border bg-bg-card text-text-muted hover:bg-bg-hover hover:text-text'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-bg-card border border-border hover:bg-bg-hover transition"
    >
      <span className="text-sm text-text">{label}</span>
      <span
        className={`w-10 h-5 rounded-full transition relative ${
          value ? 'bg-brand-500' : 'bg-bg-hover border border-border'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  );
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'emerald' }) {
  const cls = tone === 'emerald'
    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
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
