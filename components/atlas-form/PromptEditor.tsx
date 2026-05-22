'use client';
import { useRef, useEffect } from 'react';

export function PromptEditor({
  label = 'Lời nhắc',
  required,
  description,
  value,
  onChange,
  placeholder = 'Mô tả những gì bạn muốn tạo...',
  showMentionHint = false,
}: {
  label?: string;
  required?: boolean;
  description?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showMentionHint?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Sync external value to contenteditable only when it differs (don't reset cursor on every keystroke)
  useEffect(() => {
    if (ref.current && ref.current.innerText !== value) {
      ref.current.innerText = value || '';
    }
  }, [value]);

  const clearText = () => {
    if (ref.current) ref.current.innerText = '';
    onChange('');
  };
  const copyText = () => navigator.clipboard.writeText(value || '');

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
        {required && <span className="text-rose-400 text-xs">*</span>}
        {description && <QuestionIcon title={description} />}
      </div>

      <div className="rounded-lg border border-border bg-bg-soft focus-within:border-brand-500 transition overflow-hidden">
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={(e) => onChange((e.target as HTMLDivElement).innerText)}
          className="px-3.5 py-3 min-h-[120px] max-h-[280px] overflow-y-auto text-sm leading-relaxed text-text focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-text-subtle"
        />

        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-bg/50">
          <button type="button" onClick={clearText} title="Xóa văn bản"
            className="p-1.5 text-text-subtle hover:text-rose-400 rounded transition">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.92 12.41L9 12.48a.31.31 0 0 0 .22.09.31.31 0 0 0 .22-.09l5.17-4.98c.53-.51.53-1.34 0-1.85L10.18 1.38a1.34 1.34 0 0 0-1.92 0L3.09 6.36a.31.31 0 0 0 0 .43l.07.07L1.47 8.5a1.33 1.33 0 0 0 0 1.85l3.84 3.7c.18.18.41.3.65.35H1.31a.31.31 0 1 0 0 .6h12.73a.31.31 0 1 0 0-.6H6.56c.25-.05.47-.17.66-.35l1.7-1.64Z" />
            </svg>
          </button>

          {showMentionHint && (
            <span className="text-[11px] text-text-subtle flex items-center gap-1.5">
              Gõ <kbd className="px-1.5 py-0.5 rounded bg-bg-card border border-border text-[10px] font-mono">@</kbd> để chèn ảnh tham chiếu.
            </span>
          )}

          <button type="button" onClick={copyText} title="Sao chép vào bộ nhớ đệm"
            className="p-1.5 text-text-subtle hover:text-text rounded transition">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.6 10.4a.4.4 0 1 1 0 .8H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h7.2a2 2 0 0 1 2 2v1.6a.4.4 0 1 1-.8 0V2a1.2 1.2 0 0 0-1.2-1.2H2A1.2 1.2 0 0 0 .8 2v7.2a1.2 1.2 0 0 0 1.2 1.2h1.6ZM6.8 5.6a1.2 1.2 0 0 0-1.2 1.2V14a1.2 1.2 0 0 0 1.2 1.2H14a1.2 1.2 0 0 0 1.2-1.2V6.8a1.2 1.2 0 0 0-1.2-1.2H6.8Zm0-.8H14a2 2 0 0 1 2 2V14a2 2 0 0 1-2 2H6.8a2 2 0 0 1-2-2V6.8a2 2 0 0 1 2-2Z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuestionIcon({ title }: { title?: string }) {
  return (
    <span title={title} className="inline-flex items-center justify-center text-text-subtle hover:text-text-muted cursor-help">
      <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </span>
  );
}
