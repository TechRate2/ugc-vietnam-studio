'use client';
import { useRef, useState } from 'react';
import { QuestionIcon } from './PromptEditor';

export function ImagePool({
  label, description, value, onChange, required, max = 9, multiple = true, withLibraryButton = true,
}: {
  label: string; description?: string; value: string | string[]; onChange: (v: any) => void;
  required?: boolean; max?: number; multiple?: boolean; withLibraryButton?: boolean;
}) {
  const items: string[] = Array.isArray(value) ? value.filter(Boolean) : value ? [value] : [];
  const fileRef = useRef<HTMLInputElement>(null);

  const setItems = (arr: string[]) => onChange(multiple ? arr : (arr[0] || ''));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const tasks = Array.from(files).slice(0, max - items.length).map((file) =>
      new Promise<string>((resolve) => {
        const r = new FileReader(); r.onload = () => resolve(r.result as string); r.readAsDataURL(file);
      })
    );
    Promise.all(tasks).then((urls) => setItems([...items, ...urls]));
  };

  const onAdd = () => fileRef.current?.click();
  const onDelete = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const onReplace = (i: number) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.jpg,.jpeg,.png,.gif,.webp';
    inp.onchange = () => {
      const file = inp.files?.[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => { const next = [...items]; next[i] = r.result as string; setItems(next); };
      r.readAsDataURL(file);
    };
    inp.click();
  };

  const localized = (u: string) => {
    if (u?.includes('static.atlascloud.ai/media/images/')) return '/static-media/images/' + u.split('/').pop();
    return u;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
          <span className="text-xs text-text-subtle">({items.length}/{max})</span>
          {required && <span className="text-rose-400 text-xs">*</span>}
          {description && <QuestionIcon title={description} />}
        </div>
        {withLibraryButton && (
          <button type="button" className="text-xs text-brand-300 hover:text-brand-200 flex items-center gap-0.5">
            Thư viện tài nguyên công khai
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      <div className="rounded-lg border border-border bg-bg-soft p-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.length < max && (
            <button type="button" onClick={onAdd}
              className="aspect-square rounded-md border-2 border-dashed border-border hover:border-brand-500 flex items-center justify-center text-text-subtle hover:text-brand-300 transition bg-bg-card"
              title="Tải lên ảnh"
            >
              <svg width="20" height="20" viewBox="0 0 14 14" fill="currentColor">
                <rect x="6" y="0" width="2" height="14" />
                <rect x="0" y="6" width="14" height="2" />
              </svg>
            </button>
          )}

          {items.length < max && withLibraryButton && (
            <button type="button"
              className="aspect-square rounded-md border-2 border-dashed border-border hover:border-brand-500 flex items-center justify-center text-text-subtle hover:text-brand-300 transition bg-bg-card"
              title="Thư viện chân dung"
            >
              <svg viewBox="14 14 20 20" width="22" height="22" fill="none" stroke="currentColor">
                <path d="M26 23.4c.24 0 .44-.08.6-.25a.84.84 0 0 0 .26-.61c0-.24-.09-.44-.26-.6a.84.84 0 0 0-.6-.26c-.24 0-.44.09-.6.26a.84.84 0 0 0-.26.6c0 .24.09.44.26.6.16.18.36.26.6.26ZM22 23.4c.24 0 .44-.08.6-.25a.84.84 0 0 0 .26-.61c0-.24-.09-.44-.26-.6a.84.84 0 0 0-.6-.26c-.24 0-.44.09-.6.26a.84.84 0 0 0-.26.6c0 .24.09.44.26.6.16.18.36.26.6.26ZM25.76 26.6c.53-.37.92-.86 1.15-1.46h-5.82c.24.6.62 1.09 1.15 1.46.53.36 1.12.55 1.77.55s1.24-.19 1.77-.55ZM21.77 29.26a6 6 0 0 1-1.81-1.22 5.85 5.85 0 0 1-1.69-4.04c0-.8.16-1.54.45-2.23a5.74 5.74 0 0 1 1.24-1.81 5.86 5.86 0 0 1 4.04-1.67c.79 0 1.53.15 2.23.45a5.74 5.74 0 0 1 1.81 1.22 5.74 5.74 0 0 1 1.22 1.81c.3.7.45 1.44.45 2.23s-.15 1.53-.45 2.23a5.74 5.74 0 0 1-1.22 1.81 5.74 5.74 0 0 1-1.81 1.22 5.6 5.6 0 0 1-2.23.45 5.6 5.6 0 0 1-2.23-.45Z" fill="currentColor" />
              </svg>
            </button>
          )}

          {items.map((url, idx) => (
            <div key={idx} className="group relative aspect-square rounded-md overflow-hidden bg-bg-card border border-border hover:border-brand-500/60 transition">
              <div className="absolute top-1 left-1 w-5 h-5 rounded bg-black/60 backdrop-blur text-[10px] text-white font-bold flex items-center justify-center z-10">{idx + 1}</div>
              <button type="button" className="absolute top-1 right-1 w-5 h-5 rounded bg-brand-600 text-white flex items-center justify-center z-10" title="Đã chọn">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
              <img src={localized(url)} alt="" className="w-full h-full object-cover" />

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-0.5 py-1 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
                <button type="button" onClick={() => window.open(localized(url), '_blank')} title="Phóng to"
                  className="p-1 text-white/90 hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
                <button type="button" onClick={() => onReplace(idx)} title="Thay thế"
                  className="p-1 text-white/90 hover:text-white">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
                <button type="button" onClick={() => onDelete(idx)} title="Xóa"
                  className="p-1 text-rose-300 hover:text-rose-200">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.gif,.webp" multiple={multiple}
          className="hidden" onChange={(e) => handleFiles(e.target.files)} />

        <div className="mt-2 text-[11px] text-text-subtle text-right">MAX:{max}</div>
      </div>
    </div>
  );
}
