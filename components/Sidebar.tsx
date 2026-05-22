'use client';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronRight, LayoutGrid, Server, Activity } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { MODELS, VENDORS } from '@/lib/models';

export default function Sidebar() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const currentCat = sp.get('cat');

  // Studio + Login pages dùng full-bleed layout, không show global sidebar
  if (pathname?.startsWith('/studio') || pathname?.startsWith('/login') || pathname?.startsWith('/video') || pathname?.startsWith('/image')) return null;

  // Real counts per category
  const counts: Record<string, number> = {};
  for (const c of CATEGORIES) counts[c.slug] = MODELS.filter((m) => m.category === c.slug).length;

  const inModelsArea = pathname === '/' || pathname?.startsWith('/models');

  return (
    <aside className="hidden lg:block w-72 shrink-0 border-r border-border bg-bg-soft min-h-[calc(100vh-64px)] sticky top-16 self-start overflow-y-auto max-h-[calc(100vh-64px)]">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text">Danh mục</h3>
          <Link href="/models" className="text-xs text-brand-300 hover:text-brand-200">Tất cả →</Link>
        </div>

        <nav className="space-y-1">
          <Link
            href="/models"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
              !currentCat && inModelsArea ? 'bg-brand-700/20 border border-brand-700/40' : 'hover:bg-bg-hover border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium ${!currentCat && inModelsArea ? 'text-brand-200' : 'text-text'}`}>Tất cả mô hình</div>
              <div className="text-xs text-text-subtle">Xem toàn bộ {MODELS.length} model</div>
            </div>
            <span className="text-xs text-text-subtle">{MODELS.length}</span>
          </Link>

          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const active = currentCat === c.slug;
            const count = counts[c.slug] || 0;
            if (count === 0) return null;
            return (
              <Link
                key={c.slug}
                href={`/models?cat=${c.slug}`}
                className={`group flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  active ? 'bg-brand-700/20 border border-brand-700/40' : 'hover:bg-bg-hover border border-transparent'
                }`}
              >
                <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${active ? 'text-brand-200' : 'text-text'}`}>{c.label}</div>
                  <div className="text-xs text-text-subtle truncate">{c.sub}</div>
                </div>
                <span className="text-xs text-text-subtle group-hover:text-text-muted">{count}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <h3 className="text-xs font-semibold text-text-subtle uppercase tracking-wider mb-3">Trạng thái hệ thống</h3>
        <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
          <span className="relative flex w-2 h-2">
            <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <span className="relative w-2 h-2 rounded-full bg-emerald-500" />
          </span>
          Tất cả mô hình hoạt động bình thường
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 bg-bg-card rounded-md border border-border">
            <div className="flex items-center gap-1 text-text-subtle"><LayoutGrid className="w-3 h-3" /> Mô hình</div>
            <div className="text-text font-semibold mt-1 text-base">{MODELS.length}</div>
          </div>
          <div className="p-2.5 bg-bg-card rounded-md border border-border">
            <div className="flex items-center gap-1 text-text-subtle"><Server className="w-3 h-3" /> Hãng</div>
            <div className="text-text font-semibold mt-1 text-base">{VENDORS.length}</div>
          </div>
        </div>
        <div className="mt-3 p-2.5 bg-bg-card rounded-md border border-border text-xs flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-400" />
          <span className="text-text-muted">Độ trễ trung bình: <span className="text-text font-medium">~120ms</span></span>
        </div>
      </div>
    </aside>
  );
}
