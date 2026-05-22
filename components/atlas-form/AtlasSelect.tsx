'use client';
import { useState, useRef, useEffect } from 'react';
import { QuestionIcon } from './PromptEditor';

export function AtlasSelect({
  label, value, options, onChange, description, required,
}: {
  label: string; value: string; options: (string | number)[]; onChange: (v: string) => void;
  description?: string; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="flex items-center justify-between gap-3" ref={ref}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
        {required && <span className="text-rose-400 text-xs">*</span>}
        {description && <QuestionIcon title={description} />}
      </div>

      <div className="relative">
        <button
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((s) => !s)}
          className="inline-flex items-center gap-2 px-3 py-1.5 min-w-[110px] rounded-md border border-border bg-bg-soft hover:border-brand-500/50 text-sm text-text transition justify-between"
        >
          <span>{value || '—'}</span>
          <DoubleArrow />
        </button>

        {open && (
          <div role="listbox" className="absolute right-0 top-full mt-1 z-20 min-w-[160px] max-h-[260px] overflow-y-auto bg-bg-card border border-border rounded-lg shadow-xl">
            {options.map((opt) => {
              const v = String(opt);
              return (
                <button
                  key={v}
                  role="option"
                  aria-selected={String(value) === v}
                  onClick={() => { onChange(v); setOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-sm transition ${
                    String(value) === v ? 'bg-brand-700/20 text-brand-200 font-medium' : 'text-text-muted hover:bg-bg-hover'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function AtlasSwitch({
  label, value, onChange, description, required,
}: {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string; required?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
        {required && <span className="text-rose-400 text-xs">*</span>}
        {description && <QuestionIcon title={description} />}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          value ? 'bg-brand-600' : 'bg-bg-card border border-border'
        }`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${
          value ? 'translate-x-5' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}

function DoubleArrow() {
  return (
    <span className="text-text-subtle">
      <svg width="6" height="10" viewBox="0 0 4 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.19 8L0 8L2.72 4.03H3.92L1.19 8Z" fill="currentColor" />
        <path d="M1.19 0L0 0L2.72 4.03H3.92L1.19 0Z" fill="currentColor" />
      </svg>
    </span>
  );
}

export function AtlasNumberSlider({
  label, value, min = 0, max = 100, step = 1, onChange, description, required,
}: {
  label: string; value: number; min?: number; max?: number; step?: number;
  onChange: (v: number) => void; description?: string; required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</span>
          {required && <span className="text-rose-400 text-xs">*</span>}
          {description && <QuestionIcon title={description} />}
        </div>
        <input
          type="number"
          value={value ?? min}
          min={min} max={max} step={step}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 px-2 py-1 text-sm text-center rounded-md border border-border bg-bg-soft focus:border-brand-500 outline-none"
        />
      </div>
      <input
        type="range"
        value={value ?? min}
        min={min} max={max} step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-brand-500"
      />
    </div>
  );
}
