import { MODELS, VENDORS, modelsByCategory } from '@/lib/models';
import { CATEGORIES } from '@/lib/categories';
import ModelCard from '@/components/ModelCard';
import { Filter, SortDesc, Grid3x3, List, Search, X } from 'lucide-react';
import Link from 'next/link';

type SP = {
  cat?: string;
  vendor?: string;
  modality?: string;
  promo?: string;
  q?: string;
  sort?: string;
  view?: string;
  page?: string;
};

const PAGE_SIZE = 24;

function buildUrl(base: SP, overrides: Partial<SP> & { _toggle?: keyof SP }) {
  const next: any = { ...base, ...overrides };
  if (overrides._toggle) {
    delete next._toggle;
    if (base[overrides._toggle] === (overrides as any)[overrides._toggle]) {
      delete next[overrides._toggle];
    }
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) params.set(k, String(v));
  const s = params.toString();
  return '/models' + (s ? '?' + s : '');
}

export default function ModelsPage({ searchParams }: { searchParams: SP }) {
  const { cat, vendor, modality, promo, q, sort = 'new', view = 'grid', page = '1' } = searchParams;

  let models = modelsByCategory(cat);
  if (vendor) models = models.filter((m) => m.vendorSlug === vendor);
  if (modality) models = models.filter((m) => m.modalities.includes(modality as any));
  if (promo === 'new') models = models.filter((m) => m.isNew);
  if (promo === 'featured') models = models.filter((m) => m.isFeatured);
  if (q) {
    const qq = q.toLowerCase();
    models = models.filter((m) =>
      m.name.toLowerCase().includes(qq) ||
      m.vendor.toLowerCase().includes(qq) ||
      m.description.toLowerCase().includes(qq) ||
      m.tags.some((t) => t.toLowerCase().includes(qq))
    );
  }

  // Sort
  if (sort === 'new') models = [...models].sort((a, b) => Number(b.isNew || 0) - Number(a.isNew || 0));
  else if (sort === 'featured') models = [...models].sort((a, b) => Number(b.isFeatured || 0) - Number(a.isFeatured || 0));
  else if (sort === 'price-low') models = [...models].sort((a, b) => (a.pricing.perRun?.amount || 999) - (b.pricing.perRun?.amount || 999));
  else if (sort === 'price-high') models = [...models].sort((a, b) => (b.pricing.perRun?.amount || 0) - (a.pricing.perRun?.amount || 0));
  else if (sort === 'name') models = [...models].sort((a, b) => a.name.localeCompare(b.name));

  // Pagination
  const totalModels = models.length;
  const totalPages = Math.max(1, Math.ceil(totalModels / PAGE_SIZE));
  const pageNum = Math.max(1, Math.min(totalPages, parseInt(page, 10) || 1));
  const paged = models.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE);

  const currentCat = CATEGORIES.find((c) => c.slug === cat);
  const activeFilters: { label: string; href: string }[] = [];
  if (cat && currentCat) activeFilters.push({ label: 'Danh mục: ' + currentCat.label, href: buildUrl(searchParams, { cat: undefined }) });
  if (vendor) activeFilters.push({ label: 'Hãng: ' + (VENDORS.find((v) => v.slug === vendor)?.name || vendor), href: buildUrl(searchParams, { vendor: undefined }) });
  if (modality) activeFilters.push({ label: 'Phương thức: ' + modality, href: buildUrl(searchParams, { modality: undefined }) });
  if (promo) activeFilters.push({ label: promo === 'new' ? 'Mới ra mắt' : 'Nổi bật', href: buildUrl(searchParams, { promo: undefined }) });
  if (q) activeFilters.push({ label: `Tìm: "${q}"`, href: buildUrl(searchParams, { q: undefined }) });

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      <aside className="hidden lg:block w-60 shrink-0 space-y-6">
        <FilterGroup label="Phương thức">
          {([
            { v: 'text', l: 'Văn bản' }, { v: 'image', l: 'Hình ảnh' },
            { v: 'video', l: 'Video' }, { v: 'audio', l: 'Âm thanh' },
            { v: 'multimodal', l: 'Đa phương thức' },
          ] as { v: string; l: string }[]).map((o) => {
            const count = MODELS.filter((m) => m.modalities.includes(o.v as any)).length;
            if (count === 0) return null;
            const active = modality === o.v;
            return (
              <FilterItem
                key={o.v}
                label={o.l}
                count={count}
                active={active}
                href={buildUrl(searchParams, { modality: active ? undefined : o.v, page: undefined })}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup label="Nhà cung cấp">
          {VENDORS.map((v) => {
            const active = vendor === v.slug;
            return (
              <FilterItem
                key={v.slug}
                label={v.name}
                count={v.count}
                active={active}
                href={buildUrl(searchParams, { vendor: active ? undefined : v.slug, page: undefined })}
              />
            );
          })}
        </FilterGroup>

        <FilterGroup label="Khuyến mãi">
          <FilterItem
            label="Mới ra mắt"
            count={MODELS.filter((m) => m.isNew).length}
            badgeColor="text-emerald-400"
            active={promo === 'new'}
            href={buildUrl(searchParams, { promo: promo === 'new' ? undefined : 'new', page: undefined })}
          />
          <FilterItem
            label="Đang nổi bật"
            count={MODELS.filter((m) => m.isFeatured).length}
            badgeColor="text-amber-400"
            active={promo === 'featured'}
            href={buildUrl(searchParams, { promo: promo === 'featured' ? undefined : 'featured', page: undefined })}
          />
        </FilterGroup>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              {q ? `Kết quả "${q}"` : currentCat ? currentCat.label : promo === 'new' ? 'Mô hình mới' : promo === 'featured' ? 'Mô hình nổi bật' : 'Tất cả mô hình'}
            </h1>
            <p className="text-sm text-text-muted mt-0.5">
              <span className="text-text font-medium">{totalModels}</span> trong tổng <span className="text-text">{MODELS.length}</span> mô hình
              {totalPages > 1 && <span className="text-text-subtle"> · Trang {pageNum}/{totalPages}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <details className="relative">
              <summary className="btn-ghost text-xs cursor-pointer list-none">
                <SortDesc className="w-3.5 h-3.5" /> Sắp xếp: <span className="text-text">{sortLabel(sort)}</span>
              </summary>
              <div className="absolute right-0 top-full mt-1 w-44 bg-bg-card border border-border rounded-lg shadow-xl z-10 overflow-hidden">
                {[
                  ['new', 'Mới nhất'],
                  ['featured', 'Nổi bật'],
                  ['name', 'Tên A → Z'],
                  ['price-low', 'Giá thấp nhất'],
                  ['price-high', 'Giá cao nhất'],
                ].map(([v, l]) => (
                  <Link key={v} href={buildUrl(searchParams, { sort: v, page: undefined })}
                    className={`block px-3 py-2 text-xs hover:bg-bg-hover ${sort === v ? 'bg-brand-700/15 text-brand-200' : 'text-text-muted'}`}>
                    {l}
                  </Link>
                ))}
              </div>
            </details>

            <div className="inline-flex border border-border rounded-lg p-0.5 bg-bg-card">
              <Link href={buildUrl(searchParams, { view: 'grid' })} className={`p-1.5 rounded ${view === 'grid' ? 'bg-brand-600 text-white' : 'text-text-subtle hover:text-text'}`}>
                <Grid3x3 className="w-3.5 h-3.5" />
              </Link>
              <Link href={buildUrl(searchParams, { view: 'list' })} className={`p-1.5 rounded ${view === 'list' ? 'bg-brand-600 text-white' : 'text-text-subtle hover:text-text'}`}>
                <List className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-text-subtle">Bộ lọc:</span>
            {activeFilters.map((f) => (
              <Link key={f.label} href={f.href}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-bg-card border border-border text-xs text-text-muted hover:border-rose-500/40 hover:text-rose-300 transition">
                {f.label} <X className="w-3 h-3" />
              </Link>
            ))}
            <Link href="/models" className="text-xs text-brand-300 hover:text-brand-200 ml-1">Xoá tất cả</Link>
          </div>
        )}

        {paged.length === 0 ? (
          <div className="card p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-text-subtle" />
            <p className="text-text-muted">Không tìm thấy mô hình phù hợp.</p>
            <Link href="/models" className="text-sm text-brand-300 hover:text-brand-200 mt-2 inline-block">Xoá bộ lọc và thử lại</Link>
          </div>
        ) : view === 'list' ? (
          <div className="space-y-2">
            {paged.map((m) => (
              <Link key={m.slug} href={`/models/${m.slug}`} className="card p-4 flex items-center gap-4 hover:border-brand-500/60 transition">
                <div className={`w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br ${m.accent} shrink-0`}>
                  {m.demoMedia?.src && <img src={m.demoMedia.src} alt={m.name} className="w-full h-full object-cover" loading="lazy" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{m.name}</h3>
                    {m.isNew && <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-medium">MỚI</span>}
                  </div>
                  <p className="text-xs text-text-muted line-clamp-1">{m.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-text-subtle">
                    <span>{m.vendor}</span>
                    <span>·</span>
                    <span>{m.tags[0]}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs text-text-subtle">Từ</div>
                  <div className="text-sm font-semibold text-brand-300">
                    {m.pricing.perRun ? `$${m.pricing.perRun.amount}` : '—'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paged.map((m) => <ModelCard key={m.slug} m={m} />)}
          </div>
        )}

        {totalPages > 1 && <Pagination current={pageNum} total={totalPages} sp={searchParams} />}
      </div>
    </div>
  );
}

function sortLabel(s: string) {
  return { new: 'Mới nhất', featured: 'Nổi bật', name: 'Tên A → Z', 'price-low': 'Giá thấp', 'price-high': 'Giá cao' }[s] || 'Mới nhất';
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider mb-3">{label}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterItem({ label, count, active, href, badgeColor = 'text-text-subtle' }: {
  label: string; count: number; active: boolean; href: string; badgeColor?: string;
}) {
  return (
    <Link href={href} className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm transition ${
      active ? 'bg-brand-700/20 text-brand-200 font-medium' : 'hover:bg-bg-hover text-text-muted'
    }`}>
      <span className="truncate">{label}</span>
      <span className={`text-xs shrink-0 ml-2 ${badgeColor}`}>{count}</span>
    </Link>
  );
}

function Pagination({ current, total, sp }: { current: number; total: number; sp: SP }) {
  const pages: (number | '...')[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      {current > 1 && (
        <Link href={buildUrl(sp, { page: String(current - 1) })} className="px-3 py-1.5 rounded-md text-sm border border-border hover:border-brand-500/60 hover:text-text text-text-muted">
          ‹ Trước
        </Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={i} className="px-2 text-text-subtle">…</span>
        ) : (
          <Link
            key={p}
            href={buildUrl(sp, { page: String(p) })}
            className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-md text-sm transition ${
              p === current ? 'bg-brand-600 text-white font-medium' : 'border border-border hover:border-brand-500/60 text-text-muted hover:text-text'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {current < total && (
        <Link href={buildUrl(sp, { page: String(current + 1) })} className="px-3 py-1.5 rounded-md text-sm border border-border hover:border-brand-500/60 hover:text-text text-text-muted">
          Sau ›
        </Link>
      )}
    </div>
  );
}
