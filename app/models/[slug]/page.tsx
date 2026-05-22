import { notFound } from 'next/navigation';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import { ChevronRight, Heart, Copy, FileText, Calendar, Cpu, DollarSign, Sparkles, Code2 } from 'lucide-react';
import { getModel, MODELS } from '@/lib/models';
import { CATEGORIES } from '@/lib/categories';
import Playground from '@/components/Playground';
import ModelCard from '@/components/ModelCard';

async function loadAtlasData(atlasKey?: string) {
  if (!atlasKey) return { schema: null, examples: null, readme: null };
  const dataDir = path.join(process.cwd(), 'public', 'models-data');
  const [schema, examples, readme] = await Promise.all([
    fs.readFile(path.join(dataDir, 'schema', atlasKey + '.json'), 'utf8').then(JSON.parse).catch(() => null),
    fs.readFile(path.join(dataDir, 'example', atlasKey + '.json'), 'utf8').then(JSON.parse).then((j) => j?.examples || null).catch(() => null),
    fs.readFile(path.join(dataDir, 'readme', atlasKey + '.md'), 'utf8').catch(() => null),
  ]);
  return { schema, examples, readme };
}

const VN_CATEGORY: Record<string, string> = {
  text: 'Văn bản', image: 'Hình ảnh', video: 'Video', audio: 'Âm thanh', multimodal: 'Đa phương thức',
};

export default async function ModelDetailPage({ params }: { params: { slug: string } }) {
  const m = getModel(params.slug);
  if (!m) return notFound();
  const cat = CATEGORIES.find((c) => c.slug === m.category);
  const { schema, examples, readme } = await loadAtlasData(m.atlasKey);

  // Related models: same category, same vendor first, exclude self
  const related = MODELS
    .filter((x) => x.slug !== m.slug && (x.category === m.category || x.vendor === m.vendor))
    .sort((a, b) => (a.vendor === m.vendor ? -1 : 1) - (b.vendor === m.vendor ? -1 : 1))
    .slice(0, 4);

  const priceLine = (() => {
    if (m.pricing.input && m.pricing.output) {
      return [
        { label: 'Input', value: `$${m.pricing.input.amount}/1M token` },
        { label: 'Output', value: `$${m.pricing.output.amount}/1M token` },
      ];
    }
    if (m.pricing.perRun) {
      const unit = m.pricing.perRun.unit === 'second' ? 'giây' : m.pricing.perRun.unit === 'minute' ? 'phút' : m.pricing.perRun.unit === 'image' ? 'ảnh' : 'lần';
      return [{ label: 'Mỗi lần chạy', value: `$${m.pricing.perRun.amount}/${unit}` }];
    }
    return [{ label: 'Giá', value: 'Liên hệ' }];
  })();

  const cover = m.demoMedia?.type === 'image' ? m.demoMedia.src : null;
  const sampleVideo = m.sampleMedia?.type === 'video' ? m.sampleMedia.src : null;
  const sampleImage = m.sampleMedia?.type === 'image' ? m.sampleMedia.src : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-text-muted flex-wrap">
        <Link href="/" className="hover:text-text">Trang chủ</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/models" className="hover:text-text">Mô hình</Link>
        <ChevronRight className="w-3 h-3" />
        {cat && <>
          <Link href={`/models?cat=${cat.slug}`} className="hover:text-text">{cat.label}</Link>
          <ChevronRight className="w-3 h-3" />
        </>}
        <span className="text-brand-300 font-mono text-[11px]">{m.vendor.toLowerCase()}/{m.slug}</span>
      </nav>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="grid lg:grid-cols-[340px_1fr] gap-6 p-6">
          {/* Hero cover */}
          <div className={`aspect-square rounded-xl overflow-hidden relative bg-gradient-to-br ${m.accent}`}>
            {(sampleImage || cover) && !sampleVideo && (
              <img src={sampleImage || cover!} alt={m.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            {sampleVideo && (
              <video src={sampleVideo} autoPlay loop muted playsInline preload="metadata"
                className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <span className="px-2 py-1 rounded bg-black/60 backdrop-blur text-white/95 text-[10px] uppercase tracking-wider font-medium border border-white/10">
                {VN_CATEGORY[m.modalities[0]] || m.modalities[0]}
              </span>
              {m.isNew && (
                <span className="px-2 py-1 rounded bg-emerald-500/95 text-white text-[10px] font-bold tracking-wider uppercase">● Mới</span>
              )}
            </div>
          </div>

          <div className="space-y-4 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-brand-600/20 text-brand-300 text-[11px] font-medium border border-brand-700/40 uppercase tracking-wider">
                    {VN_CATEGORY[m.modalities[0]] || m.modalities[0]}
                  </span>
                  <span className="text-text-subtle text-xs">·</span>
                  <span className="text-xs text-text-muted">by <span className="text-text font-medium">{m.vendor}</span></span>
                </div>
                <h1 className="text-3xl font-bold text-text leading-tight">{m.name} API</h1>
                <p className="text-text-muted mt-2 leading-relaxed">{m.description}</p>
              </div>
              <button className="btn-ghost text-sm shrink-0">
                <Heart className="w-4 h-4" /> Yêu thích
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {m.tags.map((t) => <span key={t} className="chip">{t}</span>)}
              {m.modalities.map((mod) => <span key={mod} className="chip border-brand-700/40 text-brand-300">{VN_CATEGORY[mod] || mod}</span>)}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <Info icon={Calendar} label="Phát hành" value={new Date(m.releaseDate).toLocaleDateString('vi-VN')} />
              <Info icon={Cpu} label="Cửa sổ context" value={m.contextWindow ? `${(m.contextWindow / 1000).toFixed(0)}K` : 'N/A'} />
              {priceLine.map((p) => <Info key={p.label} icon={DollarSign} label={p.label} value={p.value} />)}
            </div>

            {!!m.capabilities?.length && (
              <div className="pt-2">
                <div className="text-[11px] text-text-subtle uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Khả năng
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {m.capabilities.map((c) => (
                    <span key={c} className="px-2.5 py-1 rounded-md bg-bg-soft border border-border text-[11px] text-text-muted">{c}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-2 flex-wrap">
              <Link href={`/docs/${m.slug}`} className="btn-ghost">
                <FileText className="w-4 h-4" /> Tài liệu kỹ thuật
              </Link>
              <a href="#api" className="btn-ghost">
                <Code2 className="w-4 h-4" /> Schema API
              </a>
              <button className="btn-primary">
                Bắt đầu dùng API
              </button>
            </div>
          </div>
        </div>
      </div>

      <Playground m={m} schema={schema} examples={examples} readme={readme} />

      {related.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mô hình tương tự</h2>
            <Link href="/models" className="text-sm text-brand-300 hover:text-brand-200">Xem tất cả →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((r) => <ModelCard key={r.slug} m={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-bg-soft border border-border">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-subtle mb-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-sm font-semibold text-text">{value}</div>
    </div>
  );
}
