'use client';
import { useState, useMemo } from 'react';
import { Play, Copy, Download, Share2, History, Sparkles, ChevronsUpDown, Image as ImgIcon, Video, Mic, FileText, Code2, BookOpen, RotateCw, Check, Box, ArrowRight, Wrench, Database, FileCode, MessageSquare, Upload, X, Plus, LayoutGrid, FileJson } from 'lucide-react';
import type { Model } from '@/lib/models';
import { renderMarkdown, type MdResult } from '@/lib/markdown';
import { computePrice, formatPrice, unitLabel } from '@/lib/pricing';
import { PromptEditor } from './atlas-form/PromptEditor';
import { ImagePool } from './atlas-form/ImagePool';
import { DropZone } from './atlas-form/DropZone';
import { AtlasSelect, AtlasSwitch, AtlasNumberSlider } from './atlas-form/AtlasSelect';

type Tab = 'playground' | 'api' | 'examples' | 'readme' | 'history';
type Lang = 'python' | 'javascript' | 'curl' | 'swift' | 'kotlin' | 'java' | 'dart';
type ApiPane = 'example-code' | 'call-api' | 'queue' | 'params-input' | 'params-response' | 'integration' | 'raw-schema' | 'llm-prompt';

type SchemaProp = {
  type?: string;
  description?: string;
  default?: any;
  enum?: any[];
  minimum?: number;
  maximum?: number;
  maxLength?: number;
};

type InputSchema = {
  properties?: Record<string, SchemaProp>;
  required?: string[];
  'x-order-properties'?: string[];
};

type ExampleEntry = {
  inputs?: Record<string, any>;
  outputs?: { outputs?: string[] };
};

const VN_LABELS: Record<string, string> = {
  prompt: 'Lời Nhắc', negative_prompt: 'Lời Nhắc Phủ Định',
  resolution: 'Độ Phân Giải', ratio: 'Tỷ Lệ Khung Hình', aspect_ratio: 'Tỷ Lệ Khung Hình',
  duration: 'Thời Lượng', seed: 'Seed', image: 'Hình ảnh', image_url: 'URL Hình ảnh',
  images: 'Hình ảnh (nhiều)', last_image: 'Ảnh cuối', end_image: 'Ảnh kết thúc',
  mask_image: 'Ảnh mặt nạ', reference_images: 'Ảnh tham chiếu',
  video: 'Video', video_url: 'URL Video', videos: 'Video (nhiều)', reference_videos: 'Video tham chiếu',
  audio: 'Âm thanh', audio_url: 'URL Âm thanh', reference_audios: 'Âm thanh tham chiếu',
  cfg_scale: 'CFG Scale', steps: 'Số bước', num_inference_steps: 'Số bước Inference',
  guidance_scale: 'Guidance Scale', width: 'Chiều rộng', height: 'Chiều cao',
  fps: 'FPS', num_frames: 'Số khung hình', strength: 'Cường độ', quality: 'Chất lượng',
  style: 'Phong cách', text: 'Văn bản', num_images: 'Số ảnh', n: 'Số lượng', size: 'Kích thước',
  generate_audio: 'Sinh âm thanh', enable_sync_mode: 'Đồng bộ', enable_prompt_expansion: 'Mở rộng prompt',
  enable_base64_output: 'Output Base64', bgm: 'Nhạc nền', camera_fixed: 'Camera cố định',
  sound: 'Âm thanh', prompt_extend: 'Mở rộng prompt', output_format: 'Định dạng output',
  movement_amplitude: 'Biên độ chuyển động', shot_type: 'Loại cảnh quay',
  audio_setting: 'Cài đặt âm thanh', audio_type: 'Loại âm thanh',
  enable_image_search: 'Tìm kiếm ảnh', max_images: 'Số ảnh tối đa',
  input_fidelity: 'Độ trung thực', image_urls: 'URL ảnh (nhiều)',
};
const vnLabel = (k: string) => VN_LABELS[k] || k.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

// Detect if field is media (image/video/audio) — needs file upload UI
const MEDIA_FIELD_RE = /^(image|images|image_url|image_urls|last_image|end_image|mask_image|reference_images|video|video_url|videos|reference_videos|audio|audio_url|reference_audios)$/;
const isMediaField = (k: string) => MEDIA_FIELD_RE.test(k);
function mediaType(k: string): 'image' | 'video' | 'audio' {
  if (/audio/.test(k)) return 'audio';
  if (/video/.test(k)) return 'video';
  return 'image';
}
function isArrayField(k: string, prop: SchemaProp) {
  return prop.type === 'array' || /^(images|videos|reference_(images|videos|audios)|image_urls)$/.test(k);
}

export default function Playground({
  m, schema, examples, readme,
}: {
  m: Model; schema: any | null; examples: ExampleEntry[] | null; readme: string | null;
}) {
  const [tab, setTab] = useState<Tab>('playground');
  const [running, setRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(true);

  const inputSchema: InputSchema | null = schema?.components?.schemas?.Input || null;
  const responseSchema = schema?.components?.schemas?.PredictionResponse || null;
  const firstExample = examples?.[0] || null;

  const initialValues = useMemo(() => {
    const v: Record<string, any> = {};
    if (inputSchema?.properties) {
      for (const [k, p] of Object.entries(inputSchema.properties)) {
        if (p.default !== undefined) v[k] = p.default;
      }
    }
    if (firstExample?.inputs) {
      for (const [k, val] of Object.entries(firstExample.inputs)) v[k] = val;
    }
    return v;
  }, [inputSchema, firstExample]);

  const [values, setValues] = useState<Record<string, any>>(initialValues);

  // Dynamic pricing
  const totalPrice = computePrice(m, values);
  const basePrice = m.pricing.perRun?.amount ?? 0;
  const unit = unitLabel(m);

  const handleRun = async () => {
    setRunning(true);
    setShowOutput(false);
    await new Promise((r) => setTimeout(r, 800));
    setShowOutput(true);
    setRunning(false);
  };
  const setVal = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));
  const resetForm = () => setValues(initialValues);

  // Input view mode: form (default) hoặc JSON raw editor (như Atlas)
  const [inputView, setInputView] = useState<'form' | 'json'>('form');
  const [jsonText, setJsonText] = useState('');
  const [jsonErr, setJsonErr] = useState<string | null>(null);

  const mdReadme: MdResult | null = readme ? renderMarkdown(readme) : null;

  return (
    <div>
      <div className="border-b border-border mb-6">
        <div className="flex items-center gap-1 overflow-x-auto">
          {([
            { id: 'playground', label: 'Sân chơi', icon: Sparkles },
            { id: 'api', label: 'API', icon: Code2 },
            { id: 'examples', label: 'Ví dụ', icon: ImgIcon },
            { id: 'readme', label: 'README', icon: BookOpen },
            { id: 'history', label: 'Lịch sử', icon: History },
          ] as { id: Tab; label: string; icon: any }[]).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition flex items-center gap-1.5 whitespace-nowrap ${
                  tab === t.id ? 'border-brand-500 text-text' : 'border-transparent text-text-muted hover:text-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'playground' && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold">Đầu vào</h3>
              <ViewToggle
                value={inputView}
                onChange={(v) => {
                  if (v === 'json') {
                    setJsonText(JSON.stringify(values, null, 2));
                    setJsonErr(null);
                  } else if (v === 'form' && inputView === 'json') {
                    try {
                      const parsed = JSON.parse(jsonText);
                      setValues(parsed);
                      setJsonErr(null);
                    } catch (e: any) { setJsonErr(e.message); return; }
                  }
                  setInputView(v);
                }}
              />
            </div>
            <div className="p-5 max-h-[600px] overflow-y-auto">
              {inputView === 'form' && (
                <div className="space-y-4">
                  {inputSchema ? renderForm(inputSchema, values, setVal) : (
                    <div className="text-sm text-text-subtle text-center py-6">Không có schema input cho mô hình này</div>
                  )}
                </div>
              )}
              {inputView === 'json' && (
                <div className="space-y-2">
                  <textarea
                    value={jsonText}
                    onChange={(e) => {
                      setJsonText(e.target.value);
                      try { JSON.parse(e.target.value); setJsonErr(null); } catch (err: any) { setJsonErr(err.message); }
                    }}
                    className="input font-mono text-xs resize-none w-full min-h-[400px] leading-relaxed"
                    spellCheck={false}
                  />
                  {jsonErr && <div className="text-xs text-rose-400">⚠ {jsonErr}</div>}
                  {!jsonErr && <div className="text-xs text-emerald-400">✓ JSON hợp lệ</div>}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between">
              <button onClick={resetForm} className="btn-ghost text-sm">Đặt lại</button>
              <button onClick={handleRun} disabled={running} className="btn-primary disabled:opacity-50">
                <Play className="w-4 h-4" />
                {running ? 'Đang chạy...' : `Chạy ${formatPrice(totalPrice)}`}
              </button>
            </div>
            <div className="px-5 pb-3 text-[11px] text-text-subtle text-right flex items-center justify-between">
              <span>
                {totalPrice > basePrice && (
                  <span className="text-text-muted">{formatPrice(basePrice)}/{unit} × {(totalPrice / basePrice).toFixed(2)}</span>
                )}
              </span>
              <a href="#" className="hover:text-brand-300">Liên kết thẻ tín dụng ›</a>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                Đầu ra
                <span className="text-xs font-normal text-text-subtle">
                  {running ? '● đang xử lý' : (firstExample?.outputs?.outputs?.length || m.sampleMedia) ? '● Mẫu' : '● Nhàn rỗi'}
                </span>
              </h3>
              <div className="flex items-center gap-1">
                <button className="btn-ghost text-xs"><Share2 className="w-3 h-3" /> Chia sẻ</button>
                <button className="btn-ghost text-xs"><Download className="w-3 h-3" /> Tải xuống</button>
              </div>
            </div>
            <div className="aspect-[16/10] bg-black/80 relative overflow-hidden flex items-center justify-center">
              {running ? (
                <div className="text-center">
                  <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-text-muted">Đang tạo từ {m.name}...</p>
                </div>
              ) : firstExample?.outputs?.outputs?.[0] ? (
                <OutputMedia url={firstExample.outputs.outputs[0]} />
              ) : m.sampleMedia ? (
                m.sampleMedia.type === 'video' ? (
                  <video src={m.sampleMedia.src} controls autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
                ) : (
                  <img src={m.sampleMedia.src} alt="sample" className="w-full h-full object-contain" />
                )
              ) : m.demoMedia?.src ? (
                <img src={m.demoMedia.src} alt="cover" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center px-4">
                  <p className="text-sm text-text-subtle">Bấm <span className="text-brand-300">Chạy</span> để tạo</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'api' && <ApiTab m={m} schema={schema} inputSchema={inputSchema} responseSchema={responseSchema} firstExample={firstExample} values={values} />}

      {tab === 'examples' && (
        <div>
          {examples && examples.length ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {examples.flatMap((ex, ei) =>
                (ex.outputs?.outputs || []).map((url, oi) => (
                  <ExampleCard key={ei + '_' + oi} ex={ex} url={url} onTryInPlayground={() => {
                    if (ex.inputs) setValues(ex.inputs);
                    setTab('playground');
                  }} />
                ))
              )}
            </div>
          ) : (
            <div className="card p-8 text-center text-text-muted">Không có ví dụ cho mô hình này</div>
          )}
        </div>
      )}

      {tab === 'readme' && (
        <div className="grid lg:grid-cols-[220px_1fr] gap-6">
          <aside className="lg:sticky lg:top-4 lg:self-start">
            <div className="text-xs text-text-subtle uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Mục lục
            </div>
            <ul className="border-l border-border space-y-1">
              {(mdReadme?.toc || []).map((t) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className={`block py-1 px-3 text-sm text-text-muted hover:text-text border-l-2 border-transparent hover:border-brand-500 -ml-px ${t.lvl === 3 ? 'pl-6 text-xs' : ''}`}>
                    {t.text}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
          <article className="card p-6 prose-readme">
            {mdReadme ? <div dangerouslySetInnerHTML={{ __html: mdReadme.html }} /> : <p className="text-text-muted">Không có README cho mô hình này.</p>}
          </article>
        </div>
      )}

      {tab === 'history' && (
        <div className="card p-8 text-center text-text-muted">
          <History className="w-10 h-10 mx-auto mb-3 text-text-subtle" />
          <p>Đăng nhập để xem lịch sử chạy của bạn.</p>
        </div>
      )}
    </div>
  );
}

function renderForm(schema: InputSchema, values: Record<string, any>, setVal: (k: string, v: any) => void) {
  const order = schema['x-order-properties'] || Object.keys(schema.properties || {});
  const required = new Set(schema.required || []);
  return order
    .filter((k) => k !== 'model' && schema.properties?.[k])
    .map((k) => {
      const p = schema.properties![k];
      return <FormField key={k} fieldKey={k} prop={p} value={values[k]} required={required.has(k)} onChange={(v) => setVal(k, v)} />;
    });
}

function FormField({ fieldKey, prop, value, required, onChange }: {
  fieldKey: string; prop: SchemaProp; value: any; required: boolean; onChange: (v: any) => void;
}) {
  const isPromptKey = fieldKey === 'prompt' || fieldKey === 'text' || fieldKey === 'negative_prompt';
  const label = vnLabel(fieldKey);

  // ===== Image fields (single + multi) → ImagePool with thumbnail grid =====
  if (/^(image|images|image_url|image_urls|last_image|end_image|mask_image|reference_images)$/.test(fieldKey)) {
    const isArr = /^(images|image_urls|reference_images)$/.test(fieldKey);
    const max = isArr ? (fieldKey === 'reference_images' ? 9 : 6) : 1;
    return <ImagePool
      label={label} description={prop.description} value={value || (isArr ? [] : '')}
      onChange={onChange} required={required} max={max} multiple={isArr}
      withLibraryButton={fieldKey === 'image' || fieldKey === 'reference_images'} />;
  }

  // ===== Video fields → DropZone =====
  if (/^(video|video_url|videos|reference_videos)$/.test(fieldKey)) {
    const max = /^(videos|reference_videos)$/.test(fieldKey) ? 3 : 1;
    return <DropZone kind="video" label={label} description={prop.description}
      value={value || (max > 1 ? [] : '')} onChange={onChange} required={required} max={max} />;
  }

  // ===== Audio fields → DropZone with record button =====
  if (/^(audio|audio_url|reference_audios)$/.test(fieldKey)) {
    const max = fieldKey === 'reference_audios' ? 3 : 1;
    return <DropZone kind="audio" label={label} description={prop.description}
      value={value || (max > 1 ? [] : '')} onChange={onChange} required={required} max={max} withRecord />;
  }

  // ===== Prompt fields → PromptEditor (contenteditable rich) =====
  if (isPromptKey) {
    return <PromptEditor label={label} description={prop.description} required={required}
      value={value || ''} onChange={onChange}
      placeholder={prop.description}
      showMentionHint={fieldKey === 'prompt'} />;
  }

  // ===== Boolean → AtlasSwitch inline row =====
  if (prop.type === 'boolean') {
    return <AtlasSwitch label={label} description={prop.description} required={required}
      value={!!value} onChange={onChange} />;
  }

  // ===== Enum → AtlasSelect combobox =====
  if (prop.enum) {
    return <AtlasSelect label={label} description={prop.description} required={required}
      value={value ?? prop.default ?? prop.enum[0]} options={prop.enum} onChange={onChange} />;
  }

  // ===== Number with bounded range → slider =====
  if ((prop.type === 'integer' || prop.type === 'number') && prop.minimum !== undefined && prop.maximum !== undefined && (prop.maximum - prop.minimum) <= 200) {
    return <AtlasNumberSlider label={label} description={prop.description} required={required}
      value={Number(value ?? prop.default ?? prop.minimum)} min={prop.minimum} max={prop.maximum}
      step={prop.type === 'integer' ? 1 : 0.1} onChange={onChange} />;
  }

  // ===== Seed → number + random button =====
  if (fieldKey === 'seed') {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
          {required && <span className="text-rose-400 text-xs">*</span>}
          {prop.description && (
            <span title={prop.description} className="inline-flex items-center text-text-subtle hover:text-text-muted cursor-help">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <input type="number" className="w-32 px-2 py-1 text-sm text-right rounded-md border border-border bg-bg-soft focus:border-brand-500 outline-none"
            value={value ?? -1} onChange={(e) => onChange(Number(e.target.value))} />
          <button type="button" onClick={() => onChange(Math.floor(Math.random() * 2147483647))}
            className="px-2 py-1 rounded-md border border-border hover:border-brand-500 text-text-muted hover:text-brand-300 transition" title="Random">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ===== Plain number =====
  if (prop.type === 'integer' || prop.type === 'number') {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
          {required && <span className="text-rose-400 text-xs">*</span>}
        </div>
        <input type="number" className="w-32 px-2 py-1 text-sm text-right rounded-md border border-border bg-bg-soft focus:border-brand-500 outline-none"
          value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))}
          min={prop.minimum} max={prop.maximum} />
      </div>
    );
  }

  // ===== Plain text =====
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
        {required && <span className="text-rose-400 text-xs">*</span>}
      </div>
      <input type="text" className="input text-sm w-full" value={value ?? ''}
        onChange={(e) => onChange(e.target.value)} placeholder={prop.description} />
    </div>
  );
}

function OutputMedia({ url }: { url: string }) {
  let src = url;
  if (url.includes('static.atlascloud.ai/media/videos/')) src = '/static-media/videos/' + url.split('/').pop();
  else if (url.includes('static.atlascloud.ai/media/images/')) src = '/static-media/images/' + url.split('/').pop();
  if (/\.(mp4|webm|mov|f4v)$/i.test(url)) {
    return <video src={src} controls autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />;
  }
  if (/\.(png|jpe?g|webp|gif)$/i.test(url)) {
    return <img src={src} alt="output" className="w-full h-full object-contain" />;
  }
  return <a href={src} target="_blank" rel="noreferrer" className="text-brand-300">{url}</a>;
}

function ExampleCard({ ex, url, onTryInPlayground }: { ex: ExampleEntry; url: string; onTryInPlayground: () => void }) {
  let src = url;
  if (url.includes('static.atlascloud.ai/media/videos/')) src = '/static-media/videos/' + url.split('/').pop();
  else if (url.includes('static.atlascloud.ai/media/images/')) src = '/static-media/images/' + url.split('/').pop();
  const isVideo = /\.(mp4|webm|mov|f4v)$/i.test(url);
  const prompt = (ex.inputs?.prompt || ex.inputs?.text || ex.inputs?.description || JSON.stringify(ex.inputs || {})).slice(0, 140);
  return (
    <div className="card overflow-hidden flex flex-col">
      <div className="aspect-square bg-black/60 relative overflow-hidden">
        {isVideo ? (
          <video src={src} muted loop playsInline preload="metadata" className="w-full h-full object-cover"
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0; }} />
        ) : (
          <img src={src} alt="" loading="lazy" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-text-muted line-clamp-3 mb-3 flex-1">{prompt}</p>
        <button onClick={onTryInPlayground} className="btn-primary text-xs w-full">
          <Sparkles className="w-3 h-3" /> Thử trong Sân chơi
        </button>
      </div>
    </div>
  );
}

// =================== API TAB — FULL 9 SECTIONS ===================
function ApiTab({ m, schema, inputSchema, responseSchema, firstExample, values }: {
  m: Model; schema: any; inputSchema: InputSchema | null; responseSchema: any; firstExample: ExampleEntry | null; values: Record<string, any>;
}) {
  const [pane, setPane] = useState<ApiPane>('example-code');
  const [lang, setLang] = useState<Lang>('python');
  const [copied, setCopied] = useState(false);

  const inputs = firstExample?.inputs || { ...values, model: m.atlasKey?.replace(/-/g, '/') };
  const isVideo = m.modalities[0] === 'video';
  const apiPath = isVideo ? '/api/v1/model/generateVideo' : '/api/v1/model/generateImage';

  const code = useMemo(() => genCode(lang, apiPath, inputs), [lang, apiPath, inputs]);

  const copyForAI = () => {
    const ctx = `# ${m.name} (${m.atlasKey?.replace(/-/g, '/')})

**Mô tả:** ${m.description}

**Endpoint:** POST https://api.atlascloud.ai${apiPath}
**Authentication:** Bearer token via header \`Authorization: Bearer $ATLASCLOUD_API_KEY\`

**Input Schema:**
\`\`\`json
${JSON.stringify(inputSchema, null, 2)}
\`\`\`

**Response Schema:**
\`\`\`json
${JSON.stringify(responseSchema, null, 2)}
\`\`\`

**Example Input:**
\`\`\`json
${JSON.stringify(firstExample?.inputs || {}, null, 2)}
\`\`\`

**Example Output:**
\`\`\`json
${JSON.stringify(firstExample?.outputs || {}, null, 2)}
\`\`\`
`;
    navigator.clipboard.writeText(ctx);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const nav: { id: ApiPane; label: string; icon: any; section?: boolean }[] = [
    { id: 'example-code', label: 'Ví dụ mã', icon: FileCode },
    { id: 'call-api', label: 'Gọi API', icon: ArrowRight },
    { id: 'queue', label: 'Queue', icon: Database },
    { id: 'params-input', label: 'Đầu vào', icon: Box },
    { id: 'params-response', label: 'Phản hồi', icon: Box },
    { id: 'integration', label: 'Tích hợp', icon: Wrench },
    { id: 'raw-schema', label: 'Raw Schema', icon: Code2 },
    { id: 'llm-prompt', label: 'LLM Prompt', icon: MessageSquare },
  ];

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      <aside className="lg:sticky lg:top-4 lg:self-start space-y-3">
        <button onClick={copyForAI} className="btn-primary w-full text-sm">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Đã sao chép' : 'Copy for AI'}
        </button>
        <ul className="space-y-0.5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pane === n.id;
            const isParamSection = n.id === 'params-input' || n.id === 'params-response';
            return (
              <li key={n.id}>
                {n.id === 'params-input' && (
                  <div className="text-[10px] uppercase tracking-wider text-text-subtle px-3 mt-3 mb-1">Tham số</div>
                )}
                <button
                  onClick={() => setPane(n.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-md flex items-center gap-2 text-sm transition ${
                    active ? 'bg-brand-700/20 text-brand-200 font-medium' : 'text-text-muted hover:text-text hover:bg-bg-hover'
                  } ${isParamSection ? 'pl-6' : ''}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {n.label}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="card overflow-hidden min-w-0">
        {pane === 'example-code' && (
          <ExampleCodePane m={m} code={code} lang={lang} setLang={setLang} apiPath={apiPath} />
        )}
        {pane === 'call-api' && <CallApiPane m={m} apiPath={apiPath} />}
        {pane === 'queue' && <QueuePane />}
        {pane === 'params-input' && <ParamsTablePane title="Tham số đầu vào" schema={inputSchema} />}
        {pane === 'params-response' && <ParamsTablePane title="Tham số phản hồi" schema={responseSchema} />}
        {pane === 'integration' && <IntegrationPane m={m} />}
        {pane === 'raw-schema' && <RawSchemaPane schema={schema} />}
        {pane === 'llm-prompt' && <LlmPromptPane m={m} inputSchema={inputSchema} firstExample={firstExample} />}
      </div>
    </div>
  );
}

function ExampleCodePane({ m, code, lang, setLang, apiPath }: { m: Model; code: string; lang: Lang; setLang: (l: Lang) => void; apiPath: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const langs: { id: Lang; label: string }[] = [
    { id: 'python', label: 'Python' }, { id: 'javascript', label: 'JavaScript' },
    { id: 'curl', label: 'cURL' }, { id: 'swift', label: 'Swift' },
    { id: 'kotlin', label: 'Kotlin' }, { id: 'java', label: 'Java' },
    { id: 'dart', label: 'Dart' },
  ];
  return (
    <>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Ví dụ mã</h3>
        <button onClick={copy} className="btn-ghost text-xs">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Đã sao chép' : 'Sao chép'}
        </button>
      </div>
      <div className="flex border-b border-border overflow-x-auto">
        {langs.map((l) => (
          <button key={l.id} onClick={() => setLang(l.id)}
            className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px whitespace-nowrap ${
              lang === l.id ? 'border-brand-500 text-text' : 'border-transparent text-text-muted hover:text-text'
            }`}>{l.label}</button>
        ))}
      </div>
      <pre className="p-4 text-xs font-mono text-text-muted overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre">{code}</pre>
    </>
  );
}

function CallApiPane({ m, apiPath }: { m: Model; apiPath: string }) {
  return (
    <div className="p-5">
      <h3 className="text-base font-semibold mb-4">Gọi API</h3>
      <div className="space-y-5">
        <div>
          <h4 className="text-xs text-text-subtle uppercase tracking-wider mb-2">Endpoint chính</h4>
          <pre className="p-3 rounded-md bg-bg border border-border font-mono text-xs text-text-muted">
{`POST https://api.atlascloud.ai${apiPath}
Authorization: Bearer $ATLASCLOUD_API_KEY
Content-Type: application/json`}
          </pre>
        </div>
        <div>
          <h4 className="text-xs text-text-subtle uppercase tracking-wider mb-2">Poll prediction</h4>
          <pre className="p-3 rounded-md bg-bg border border-border font-mono text-xs text-text-muted">
{`GET https://api.atlascloud.ai/api/v1/model/prediction/{request_id}
Authorization: Bearer $ATLASCLOUD_API_KEY`}
          </pre>
        </div>
        <div>
          <h4 className="text-xs text-text-subtle uppercase tracking-wider mb-2">Quy trình</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-text-muted">
            <li>POST request body chứa <code className="text-brand-300">model</code> + tham số input.</li>
            <li>API trả về <code className="text-brand-300">prediction_id</code> ngay lập tức.</li>
            <li>Poll endpoint <code className="text-brand-300">GET /prediction/&#123;id&#125;</code> mỗi 3-5 giây.</li>
            <li>Khi <code className="text-brand-300">status = &quot;succeeded&quot;</code>, lấy kết quả ở <code className="text-brand-300">data.output</code>.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function QueuePane() {
  return (
    <div className="p-5">
      <h3 className="text-base font-semibold mb-4">Hàng đợi (Queue)</h3>
      <p className="text-sm text-text-muted mb-4">
        Atlas Cloud xử lý request bằng queue bất đồng bộ. Sau khi POST, request được đưa vào hàng đợi
        và trả về <code className="text-brand-300">prediction_id</code> để theo dõi.
      </p>
      <div className="space-y-3">
        {[
          ['queued', 'Đang chờ xử lý — request được tiếp nhận, chờ slot GPU rảnh', 'text-amber-400'],
          ['processing', 'Đang generate — model đang sinh kết quả', 'text-blue-400'],
          ['succeeded', 'Hoàn thành — kết quả có sẵn ở data.output', 'text-emerald-400'],
          ['failed', 'Thất bại — kiểm tra trường data.error để biết lý do', 'text-rose-400'],
          ['canceled', 'Đã huỷ — user huỷ trước khi hoàn thành', 'text-text-subtle'],
        ].map(([state, desc, color]) => (
          <div key={state} className="flex items-start gap-3 p-3 rounded-md bg-bg border border-border">
            <code className={`text-xs font-semibold ${color} shrink-0 w-24`}>{state}</code>
            <span className="text-xs text-text-muted">{desc}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 p-3 rounded-md bg-brand-700/10 border border-brand-700/30 text-xs text-text-muted">
        💡 <strong className="text-text">Khuyến nghị:</strong> exponential backoff khi poll (3s → 5s → 8s) để giảm tải API
        và tránh rate limit.
      </div>
    </div>
  );
}

function ParamsTablePane({ title, schema }: { title: string; schema: any }) {
  if (!schema?.properties) {
    return <div className="p-5"><h3 className="text-base font-semibold mb-4">{title}</h3><p className="text-sm text-text-muted">Không có schema</p></div>;
  }
  const order = schema['x-order-properties'] || Object.keys(schema.properties);
  const required = new Set(schema.required || []);
  return (
    <div className="p-5">
      <h3 className="text-base font-semibold mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-xs text-text-subtle uppercase tracking-wider border-b border-border">
              <th className="text-left py-2 pr-3 font-medium">Tham số</th>
              <th className="text-left py-2 pr-3 font-medium">Loại</th>
              <th className="text-left py-2 pr-3 font-medium">Bắt buộc</th>
              <th className="text-left py-2 pr-3 font-medium">Default</th>
              <th className="text-left py-2 pr-3 font-medium">Range / Enum</th>
              <th className="text-left py-2 font-medium">Mô tả</th>
            </tr>
          </thead>
          <tbody>
            {order.map((k: string) => {
              const p = schema.properties[k]; if (!p) return null;
              const range = p.enum ? p.enum.join(', ') : ((p.minimum !== undefined || p.maximum !== undefined) ? `${p.minimum ?? '−∞'} ÷ ${p.maximum ?? '∞'}` : '—');
              return (
                <tr key={k} className="border-b border-border/40">
                  <td className="py-2 pr-3"><code className="text-brand-300 text-xs">{k}</code></td>
                  <td className="py-2 pr-3 text-text-muted text-xs">{p.type || '—'}</td>
                  <td className="py-2 pr-3 text-xs">{required.has(k) ? <span className="text-rose-400">✓ Yes</span> : <span className="text-text-subtle">—</span>}</td>
                  <td className="py-2 pr-3"><code className="text-text-muted text-xs">{p.default === undefined ? '—' : JSON.stringify(p.default)}</code></td>
                  <td className="py-2 pr-3 text-xs text-text-muted">{range}</td>
                  <td className="py-2 text-xs text-text-muted">{p.description || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationPane({ m }: { m: Model }) {
  const integrations = [
    { name: 'LangChain', desc: 'Dùng wrapper AtlasCloudLLM cho chat / text completion', icon: '🦜' },
    { name: 'LlamaIndex', desc: 'Tích hợp via LLM adapter chuẩn OpenAI-compatible', icon: '🦙' },
    { name: 'n8n', desc: 'Node HTTP Request, endpoint Atlas, polling tự động', icon: '⚙️' },
    { name: 'Make.com / Zapier', desc: 'Webhook trigger sau khi generate xong', icon: '🔗' },
    { name: 'OpenAI SDK', desc: 'Set base_url = api.atlascloud.ai/v1, dùng SDK OpenAI gốc', icon: '🧠' },
    { name: 'Vercel AI SDK', desc: 'Stream response qua provider tuỳ chỉnh', icon: '▲' },
    { name: 'Discord Bot', desc: 'Slash command → call Atlas → reply with media', icon: '💬' },
    { name: 'Webhook', desc: 'POST callback URL khi prediction hoàn tất', icon: '🪝' },
  ];
  return (
    <div className="p-5">
      <h3 className="text-base font-semibold mb-2">Tích hợp với framework</h3>
      <p className="text-sm text-text-muted mb-5">Atlas Cloud tương thích chuẩn REST + OpenAI-compatible, dùng được trên hầu hết framework AI/automation.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {integrations.map((i) => (
          <div key={i.name} className="p-3 rounded-lg bg-bg border border-border hover:border-brand-500/40 transition">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{i.icon}</span>
              <span className="font-semibold text-sm">{i.name}</span>
            </div>
            <p className="text-xs text-text-muted">{i.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RawSchemaPane({ schema }: { schema: any }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(schema, null, 2);
  const copy = () => { navigator.clipboard.writeText(json); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">Raw OpenAPI Schema</h3>
        <button onClick={copy} className="btn-ghost text-xs">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Đã sao chép' : 'Sao chép JSON'}
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-text-muted overflow-auto max-h-[700px]">{json}</pre>
    </>
  );
}

function LlmPromptPane({ m, inputSchema, firstExample }: { m: Model; inputSchema: any; firstExample: ExampleEntry | null }) {
  const [copied, setCopied] = useState(false);
  const prompt = `Bạn đang dùng mô hình **${m.name}** (${m.atlasKey?.replace(/-/g, '/')}) từ ${m.vendor}.

**Mô tả:** ${m.description}

**Loại:** ${m.modalities.join(', ')} · **Category:** ${m.category}

**Endpoint:** POST https://api.atlascloud.ai/api/v1/model/${m.modalities[0] === 'video' ? 'generateVideo' : 'generateImage'}

**Input schema (JSON):**
\`\`\`json
${JSON.stringify(inputSchema, null, 2)}
\`\`\`

**Ví dụ input/output:**
\`\`\`json
${JSON.stringify(firstExample || {}, null, 2)}
\`\`\`

Dùng đoạn context này để generate code hoặc prompt cho task của bạn.`;
  const copy = () => { navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <>
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold">LLM Prompt</h3>
        <button onClick={copy} className="btn-ghost text-xs">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Đã sao chép' : 'Sao chép prompt'}
        </button>
      </div>
      <div className="p-5">
        <p className="text-xs text-text-muted mb-3">Sao chép đoạn prompt này để cấp đầy đủ context cho ChatGPT/Claude/Gemini khi bạn cần help generate code dùng model này.</p>
        <pre className="p-4 text-xs font-mono text-text-muted bg-bg border border-border rounded-md overflow-auto max-h-[600px] whitespace-pre-wrap">{prompt}</pre>
      </div>
    </>
  );
}

// =================== VIEW TOGGLE (matches Atlas MediaSettingsCard_viewToggle) ===================
function ViewToggle({ value, onChange }: { value: 'form' | 'json'; onChange: (v: 'form' | 'json') => void }) {
  const [open, setOpen] = useState(false);
  const opts: { id: 'form' | 'json'; label: string; icon: any }[] = [
    { id: 'form', label: 'Biểu mẫu', icon: LayoutGrid },
    { id: 'json', label: 'JSON', icon: FileJson },
  ];
  const cur = opts.find((o) => o.id === value) || opts[0];
  const CurIcon = cur.icon;
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border hover:border-brand-500/50 text-xs text-text-muted hover:text-text bg-bg-soft transition"
      >
        <CurIcon className="w-3.5 h-3.5" />
        <span>{cur.label}</span>
        <ChevronsUpDown className="w-3 h-3 opacity-70" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1 w-36 bg-bg-card border border-border rounded-lg shadow-xl z-10 overflow-hidden">
          {opts.map((o) => {
            const Icon = o.icon;
            return (
              <button
                key={o.id}
                role="menuitem"
                onMouseDown={(e) => { e.preventDefault(); onChange(o.id); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-bg-hover transition ${
                  value === o.id ? 'text-brand-200 bg-brand-700/15' : 'text-text-muted'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{o.label}</span>
                {value === o.id && <Check className="w-3 h-3 ml-auto" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =================== MEDIA UPLOAD FIELD ===================
function MediaUploadField({ mediaType, isArray, value, onChange, description }: {
  mediaType: 'image' | 'video' | 'audio';
  isArray: boolean;
  value: any;
  onChange: (v: any) => void;
  description?: string;
}) {
  const accept = mediaType === 'image' ? 'image/*' : mediaType === 'video' ? 'video/*' : 'audio/*';
  const Icon = mediaType === 'image' ? ImgIcon : mediaType === 'video' ? Video : Mic;

  // Normalize value to array for unified handling
  const items: string[] = Array.isArray(value) ? value : value ? [value] : [];

  const setUrl = (idx: number, url: string) => {
    if (isArray) {
      const next = [...items];
      next[idx] = url;
      onChange(next);
    } else {
      onChange(url);
    }
  };
  const remove = (idx: number) => {
    if (isArray) {
      onChange(items.filter((_, i) => i !== idx));
    } else {
      onChange('');
    }
  };
  const addNew = () => {
    if (isArray) onChange([...items, '']);
  };

  const handleFile = (idx: number, file: File) => {
    // Convert to data URL for local preview (real upload would POST to backend)
    const reader = new FileReader();
    reader.onload = () => setUrl(idx, reader.result as string);
    reader.readAsDataURL(file);
  };

  const renderItem = (url: string, idx: number) => {
    const isData = url?.startsWith('data:');
    const isAtlasMedia = url?.includes('static.atlascloud.ai/media');
    const localized = isAtlasMedia ? '/static-media/' + (url.includes('/videos/') ? 'videos' : 'images') + '/' + url.split('/').pop() : url;
    const hasUrl = !!url;
    return (
      <div key={idx} className="border border-border rounded-lg overflow-hidden bg-bg-soft">
        {hasUrl ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {mediaType === 'image' ? (
              <img src={localized} alt="" className="max-w-full max-h-full object-contain" />
            ) : mediaType === 'video' ? (
              <video src={localized} controls muted className="max-w-full max-h-full" />
            ) : (
              <audio src={localized} controls className="w-full" />
            )}
            <button
              type="button"
              onClick={() => remove(idx)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur text-white hover:bg-rose-500 flex items-center justify-center"
              title="Xoá"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video cursor-pointer hover:bg-bg-hover transition border-2 border-dashed border-border hover:border-brand-500/40">
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(idx, f);
              }}
            />
            <Upload className="w-6 h-6 text-text-subtle mb-2" />
            <span className="text-xs text-text-muted">Kéo thả hoặc click để tải lên</span>
            <span className="text-[10px] text-text-subtle mt-0.5">{mediaType === 'image' ? 'PNG/JPG/WebP' : mediaType === 'video' ? 'MP4/WebM' : 'MP3/WAV'}</span>
          </label>
        )}
        <div className="p-2 flex items-center gap-1.5">
          <input
            type="text"
            value={hasUrl && !isData ? url : ''}
            onChange={(e) => setUrl(idx, e.target.value)}
            placeholder="Hoặc dán URL..."
            className="flex-1 px-2 py-1 text-xs bg-bg rounded border border-border focus:border-brand-500 outline-none"
          />
        </div>
      </div>
    );
  };

  if (isArray) {
    const displayItems = items.length > 0 ? items : [''];
    return (
      <div className="space-y-2">
        {displayItems.map((url, idx) => renderItem(url, idx))}
        <button
          type="button"
          onClick={addNew}
          className="w-full py-2 rounded-md border border-dashed border-border hover:border-brand-500/40 text-xs text-text-muted hover:text-text flex items-center justify-center gap-1.5"
        >
          <Plus className="w-3 h-3" /> Thêm {mediaType === 'image' ? 'ảnh' : mediaType === 'video' ? 'video' : 'âm thanh'}
        </button>
      </div>
    );
  }

  return renderItem(items[0] || '', 0);
}

// =================== CODE GENERATORS ===================
function genCode(lang: Lang, apiPath: string, inputs: Record<string, any>): string {
  const body = JSON.stringify(inputs, null, 2);
  if (lang === 'python') {
    const lines = Object.entries(inputs).map(([k, v]) => `    "${k}": ${JSON.stringify(v)},`).join('\n');
    return `import requests
import time

# Step 1: Start generation
generate_url = "https://api.atlascloud.ai${apiPath}"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer $ATLASCLOUD_API_KEY"
}
data = {
${lines}
}

generate_response = requests.post(generate_url, headers=headers, json=data)
prediction_id = generate_response.json()["data"]["id"]

# Step 2: Poll for result
poll_url = f"https://api.atlascloud.ai/api/v1/model/prediction/{prediction_id}"
while True:
    r = requests.get(poll_url, headers=headers)
    result = r.json()
    status = result["data"]["status"]
    if status == "succeeded":
        print(result["data"]["output"])
        break
    elif status == "failed":
        raise Exception("Generation failed")
    time.sleep(3)`;
  }
  if (lang === 'javascript') {
    return `const generateUrl = "https://api.atlascloud.ai${apiPath}";
const headers = {
  "Content-Type": "application/json",
  "Authorization": \`Bearer \${process.env.ATLASCLOUD_API_KEY}\`,
};
const data = ${body};

const r = await fetch(generateUrl, { method: "POST", headers, body: JSON.stringify(data) });
const { data: { id } } = await r.json();

// Poll
while (true) {
  const p = await fetch(\`https://api.atlascloud.ai/api/v1/model/prediction/\${id}\`, { headers });
  const j = await p.json();
  if (j.data.status === "succeeded") { console.log(j.data.output); break; }
  if (j.data.status === "failed") throw new Error("Generation failed");
  await new Promise(r => setTimeout(r, 3000));
}`;
  }
  if (lang === 'curl') {
    return `curl -X POST https://api.atlascloud.ai${apiPath} \\
  -H "Authorization: Bearer $ATLASCLOUD_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${body}'

# Poll
curl -X GET https://api.atlascloud.ai/api/v1/model/prediction/{prediction_id} \\
  -H "Authorization: Bearer $ATLASCLOUD_API_KEY"`;
  }
  if (lang === 'swift') {
    return `import Foundation
let url = URL(string: "https://api.atlascloud.ai${apiPath}")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("Bearer \\(ProcessInfo.processInfo.environment["ATLASCLOUD_API_KEY"] ?? "")", forHTTPHeaderField: "Authorization")
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
request.httpBody = try JSONSerialization.data(withJSONObject: ${body})
let (data, _) = try await URLSession.shared.data(for: request)
print(String(data: data, encoding: .utf8) ?? "")`;
  }
  if (lang === 'kotlin') {
    return `import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType

val client = OkHttpClient()
val body = """${body}""".trimIndent().toRequestBody("application/json".toMediaType())
val request = Request.Builder()
    .url("https://api.atlascloud.ai${apiPath}")
    .addHeader("Authorization", "Bearer \${System.getenv("ATLASCLOUD_API_KEY")}")
    .post(body)
    .build()
client.newCall(request).execute().use { response ->
    println(response.body?.string())
}`;
  }
  if (lang === 'java') {
    return `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
String body = "${body.replace(/"/g, '\\"').replace(/\n/g, '\\n')}";
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.atlascloud.ai${apiPath}"))
    .header("Authorization", "Bearer " + System.getenv("ATLASCLOUD_API_KEY"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();
HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`;
  }
  return `import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

final response = await http.post(
  Uri.parse('https://api.atlascloud.ai${apiPath}'),
  headers: {
    'Authorization': 'Bearer \${Platform.environment["ATLASCLOUD_API_KEY"]}',
    'Content-Type': 'application/json',
  },
  body: jsonEncode(${body}),
);
print(response.body);`;
}
