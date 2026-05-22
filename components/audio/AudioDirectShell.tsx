'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Mic,
  Play,
  Pause,
  ChevronRight,
  Diamond,
  Sparkles,
  Download,
  Volume2,
} from 'lucide-react';

interface Voice {
  alias: string;
  voice_id: string;
  provider: 'elevenlabs' | 'minimax';
  label_vn: string;
  gender: 'female' | 'male';
  tier: 'premium' | 'budget';
}

const SAMPLE_TEXTS = [
  'Xin chào, đây là demo giọng đọc tiếng Việt tự nhiên — phù hợp cho video TikTok, podcast hoặc livestream.',
  'Sản phẩm balo YUUMY YBA25 — thiết kế tối giản, chống nước, ngăn laptop 14 inch padded, giá chỉ 450 nghìn.',
  'Anh em ơi, hôm nay mình review một sản phẩm cực kỳ thú vị — chiếc tai nghe không dây với pin trâu 30 tiếng.',
];

export function AudioDirectShell() {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [voiceAlias, setVoiceAlias] = useState<string>('mai');
  const [text, setText] = useState('');
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [speed, setSpeed] = useState(1.0);
  const [costPreview, setCostPreview] = useState<{ char_count: number; estimated_credits: number; estimated_vnd: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [history, setHistory] = useState<{ url: string; voice: string; text: string }[]>([]);
  const [err, setErr] = useState('');
  const [playing, setPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetch('/api/v1/audio/direct/voices')
      .then((r) => r.json())
      .then((d) => setVoices(d.voices || []))
      .catch(() => {});
  }, []);

  // Debounce cost preview
  useEffect(() => {
    if (!text.trim()) {
      setCostPreview(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/v1/audio/direct/preview-cost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice_preset: voiceAlias }),
        });
        const d = await r.json();
        if (r.ok) setCostPreview(d);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [text, voiceAlias]);

  const current = voices.find((v) => v.alias === voiceAlias);
  const canSubmit = text.trim().length > 0 && !submitting;

  const handleGenerate = async () => {
    setSubmitting(true);
    setErr('');
    setAudioUrl('');
    try {
      const r = await fetch('/api/v1/audio/direct/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice_preset: voiceAlias,
          stability,
          similarity_boost: similarityBoost,
          speed,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setErr(d.detail || JSON.stringify(d));
        return;
      }
      const url = d.audio_url;
      if (!url) {
        setErr('Backend không trả audio_url. Response: ' + JSON.stringify(d).slice(0, 200));
        return;
      }
      setAudioUrl(url);
      setHistory((h) => [{ url, voice: voiceAlias, text: text.slice(0, 80) }, ...h.slice(0, 9)]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  // Group voices by tier
  const premiumVoices = voices.filter((v) => v.tier === 'premium');
  const budgetVoices = voices.filter((v) => v.tier === 'budget');

  return (
    <div className="flex-1 min-w-0 flex flex-col bg-bg text-text overflow-hidden">
      {/* Header */}
      <header className="shrink-0 h-12 border-b border-border bg-bg-soft/80 backdrop-blur-xl flex items-center px-5 gap-5">
        <Link href="/studio" className="flex items-center gap-2 text-text-muted hover:text-text text-sm transition">
          <ArrowLeft className="w-4 h-4" /> Studio
        </Link>
        <div className="flex items-center gap-1.5 text-text-subtle text-sm">
          <ChevronRight className="w-3 h-3" />
          <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-text font-medium">Audio Direct</span>
        </div>
        {current && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm">{current.provider}</span>
              <span className="text-text font-semibold text-sm">{current.label_vn}</span>
            </div>
          </>
        )}
        <div className="flex-1" />
        {costPreview && (
          <div className="flex items-center gap-3 text-sm">
            <Diamond className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-text font-semibold">{costPreview.estimated_credits} credit</span>
            <span className="text-text-subtle">·</span>
            <span className="text-text-muted">~{costPreview.estimated_vnd.toLocaleString('vi-VN')}đ</span>
          </div>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — voice picker */}
        <aside className="w-[340px] shrink-0 bg-bg-soft border-r border-border flex flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            <div>
              <div className="text-text font-semibold text-[13px] mb-1">Giọng đọc</div>
              <div className="text-text-subtle text-[11px] mb-3">12 giọng VN preset · 6 premium + 6 budget</div>

              {premiumVoices.length > 0 && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Premium (ElevenLabs)
                  </div>
                  <div className="space-y-1.5 mb-4">
                    {premiumVoices.map((v) => (
                      <VoiceRow key={v.alias} voice={v} active={voiceAlias === v.alias} onClick={() => setVoiceAlias(v.alias)} />
                    ))}
                  </div>
                </>
              )}

              {budgetVoices.length > 0 && (
                <>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-2">💰 Budget (MiniMax)</div>
                  <div className="space-y-1.5">
                    {budgetVoices.map((v) => (
                      <VoiceRow key={v.alias} voice={v} active={voiceAlias === v.alias} onClick={() => setVoiceAlias(v.alias)} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="text-text font-semibold text-[13px] mb-1">Voice settings</div>
              <div className="text-text-subtle text-[11px] mb-3">Chỉ ElevenLabs voices có stability + similarity</div>
              <Field label={`Speed ${speed.toFixed(2)}×`}>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.05}
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </Field>
              {current?.provider === 'elevenlabs' && (
                <>
                  <Field label={`Stability ${stability.toFixed(2)}`}>
                    <input
                      type="range"
                      min={0} max={1} step={0.05}
                      value={stability}
                      onChange={(e) => setStability(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </Field>
                  <Field label={`Similarity boost ${similarityBoost.toFixed(2)}`}>
                    <input
                      type="range"
                      min={0} max={1} step={0.05}
                      value={similarityBoost}
                      onChange={(e) => setSimilarityBoost(Number(e.target.value))}
                      className="w-full accent-brand-500"
                    />
                  </Field>
                </>
              )}
            </div>
          </div>

          <div className="shrink-0 px-5 py-3.5 border-t border-border bg-bg-soft/95 backdrop-blur">
            {err && <div className="text-[11px] text-red-300 px-3 py-2 mb-2 rounded-lg bg-red-500/10 border border-red-500/30">{err}</div>}
            <button
              onClick={handleGenerate}
              disabled={!canSubmit}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition shadow-lg shadow-emerald-600/30 hover:scale-[1.01]"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo…</> : <><Mic className="w-4 h-4" /> Tạo giọng đọc</>}
            </button>
          </div>
        </aside>

        {/* Main canvas */}
        <main className="flex-1 overflow-y-auto bg-bg">
          <div className="max-w-4xl mx-auto px-6 py-6 space-y-5">
            {/* Text input */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-text font-semibold text-sm">Nội dung đọc</div>
                  <div className="text-text-subtle text-xs mt-0.5">Tiếng Việt có dấu — dùng dấu câu để pause tự nhiên</div>
                </div>
                <div className="text-text-subtle text-xs tabular-nums">{text.length} / 5000</div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                maxLength={5000}
                placeholder="Nhập nội dung tiếng Việt cần đọc..."
                className="input resize-none leading-relaxed text-base"
              />

              {/* Quick samples */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-wider text-text-subtle font-medium mr-1 self-center">Mẫu nhanh:</span>
                {SAMPLE_TEXTS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setText(s)}
                    className="px-3 py-1 rounded-full text-xs bg-bg-card hover:bg-bg-hover border border-border text-text-muted hover:text-text transition"
                  >
                    Mẫu {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio player */}
            {audioUrl && (
              <div className="card p-5">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={togglePlay}
                    className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-white transition shadow-lg shadow-emerald-600/40"
                  >
                    {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-text font-medium text-sm">{current?.label_vn}</div>
                    <div className="text-text-subtle text-xs truncate">{text.slice(0, 100)}</div>
                  </div>
                  <a
                    href={audioUrl}
                    download
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-card hover:bg-bg-hover border border-border text-text-muted hover:text-text text-xs font-medium transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Tải MP3
                  </a>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  controls
                  onPlay={() => setPlaying(true)}
                  onPause={() => setPlaying(false)}
                  onEnded={() => setPlaying(false)}
                  className="w-full"
                />
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div className="card p-5">
                <div className="text-text font-semibold text-sm mb-3">📜 Lịch sử (10 gần nhất)</div>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-bg-soft hover:bg-bg-hover transition">
                      <button
                        onClick={() => setAudioUrl(h.url)}
                        className="w-8 h-8 rounded-full bg-bg-card hover:bg-emerald-500/20 flex items-center justify-center text-text-muted hover:text-emerald-300 transition"
                      >
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-text-muted truncate">{h.text}</div>
                        <div className="text-[10px] text-text-subtle">{h.voice}</div>
                      </div>
                      <a href={h.url} download className="text-text-subtle hover:text-text transition" title="Tải">
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!audioUrl && !submitting && (
              <div className="card p-10 text-center text-text-subtle">
                <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <div className="text-sm">Nhập text + chọn giọng + bấm "Tạo giọng đọc"</div>
                <div className="text-xs mt-1">Audio MP3 sẽ hiện ở đây sau ~3-5 giây</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function VoiceRow({ voice, active, onClick }: { voice: Voice; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition border ${
        active
          ? 'bg-brand-700/20 border-brand-700/40 text-brand-100'
          : 'bg-bg-card border-border text-text-muted hover:bg-bg-hover hover:text-text'
      }`}
    >
      <span className="text-base">{voice.gender === 'female' ? '👩' : '👨'}</span>
      <span className="flex-1 text-left">
        <span className="block font-medium text-[13px]">{voice.label_vn}</span>
      </span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-text-muted text-[11px] font-medium mb-1.5">{label}</div>
      {children}
    </div>
  );
}
