'use client';
import { useRef, useState } from 'react';
import { QuestionIcon } from './PromptEditor';

type Kind = 'video' | 'audio';
const KIND_CONFIG: Record<Kind, { accept: string; label: string; uploadLabel: string; icon: JSX.Element }> = {
  video: {
    accept: '.mp4,.avi,.mov,.webm,.mkv',
    label: 'Video tham chiếu',
    uploadLabel: 'Tải lên Video',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="23" height="23" rx="1.5" stroke="currentColor" />
        <path d="M5 7.5A1.5 1.5 0 0 1 6.5 6h11A1.5 1.5 0 0 1 19 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 16.5v-9Zm5 1.7v5.6c0 .4.44.65.78.44l4.55-2.8a.52.52 0 0 0 0-.88l-4.55-2.8a.52.52 0 0 0-.78.44Z" fill="currentColor" />
      </svg>
    ),
  },
  audio: {
    accept: '.mp3,.wav,.ogg,.flac,.m4a,.aac',
    label: 'Âm thanh tham chiếu',
    uploadLabel: 'Tải lên Âm thanh',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.5" y="0.5" width="23" height="23" rx="1.5" stroke="currentColor" />
        <path d="M16.74 6.05c.7-.2 1.26.21 1.27.9v8.6c0 1.12-1.1 2.15-2.45 2.33-1.36.16-2.45-.55-2.45-1.66 0-1.11 1.1-2.15 2.45-2.33.92-.1 1.43.2 1.43.2V9.2c0-.53-.56-.34-.56-.34l-5.05 1.62s-.58.21-.58.7v5.95c0 1.11-.99 2.14-2.34 2.33-1.36.2-2.45-.49-2.45-1.6 0-1.12 1.1-2.18 2.45-2.37.92-.14 1.34.14 1.34.14V9.49c0-.7.55-1.44 1.25-1.65l5.7-1.78Z" fill="currentColor" />
      </svg>
    ),
  },
};

export function DropZone({
  kind, label, description, value, onChange, required, max = 3, withRecord = false,
}: {
  kind: Kind; label?: string; description?: string; value: string | string[];
  onChange: (v: any) => void; required?: boolean; max?: number; withRecord?: boolean;
}) {
  const cfg = KIND_CONFIG[kind];
  const items: string[] = Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const setItems = (arr: string[]) => onChange(Array.isArray(value) || max > 1 ? arr : (arr[0] || ''));

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const tasks = Array.from(files).slice(0, max - items.length).map((file) =>
      new Promise<string>((resolve) => {
        const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file);
      })
    );
    Promise.all(tasks).then((urls) => setItems([...items, ...urls]));
  };

  const open = () => inputRef.current?.click();

  const localized = (u: string) => {
    if (u?.includes('static.atlascloud.ai/media/videos/')) return '/static-media/videos/' + u.split('/').pop();
    if (u?.includes('static.atlascloud.ai/media/images/')) return '/static-media/images/' + u.split('/').pop();
    return u;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label || cfg.label}</span>
        {required && <span className="text-rose-400 text-xs">*</span>}
        {description && <QuestionIcon title={description} />}
      </div>

      <div className="rounded-lg border border-border bg-bg-soft p-2">
        {items.length === 0 ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            className={`flex flex-col items-center justify-center py-8 px-4 rounded-md border-2 border-dashed transition cursor-pointer ${
              dragOver ? 'border-brand-500 bg-brand-700/10' : 'border-border hover:border-brand-500/50 bg-bg-card'
            }`}
            onClick={open}
          >
            <div className="text-text-subtle mb-2">{cfg.icon}</div>
            <p className="text-xs text-text-muted mb-3">Bạn có thể kéo thả tệp vào đây hoặc nhấp để tải lên</p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); open(); }}
                className="px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition">
                {cfg.uploadLabel}
              </button>
              {withRecord && (
                <button type="button" onClick={(e) => e.stopPropagation()} title="Ghi âm"
                  className="px-2.5 py-1.5 rounded-md border border-border hover:border-brand-500 text-text-muted hover:text-brand-300 transition">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((url, i) => (
              <div key={i} className="relative rounded-md overflow-hidden bg-bg-card border border-border">
                {kind === 'video' ? (
                  <video src={localized(url)} controls className="w-full aspect-video bg-black" />
                ) : (
                  <audio src={localized(url)} controls className="w-full" />
                )}
                <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur text-white hover:bg-rose-500 flex items-center justify-center text-xs">
                  ×
                </button>
              </div>
            ))}
            {items.length < max && (
              <button type="button" onClick={open}
                className="w-full py-2 rounded-md border border-dashed border-border hover:border-brand-500 text-xs text-text-muted hover:text-text">
                + Thêm {kind === 'video' ? 'video' : 'âm thanh'}
              </button>
            )}
          </div>
        )}

        <input ref={inputRef} type="file" accept={cfg.accept} multiple={max > 1} className="hidden"
          onChange={(e) => addFiles(e.target.files)} />

        <div className="mt-2 text-[11px] text-text-subtle text-right">MAX:{max}</div>
      </div>
    </div>
  );
}
