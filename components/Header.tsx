'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Sparkles, Bell, Globe, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { href: '/', label: 'Khám phá' },
  { href: '/studio', label: 'Studio', highlight: true },
  { href: '/models', label: 'API' },
  { href: '/pricing', label: 'Giá' },
  { href: '/docs', label: 'Tài liệu' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Studio/Video/Image direct have their own headers
  if (pathname?.startsWith('/studio') || pathname?.startsWith('/video') || pathname?.startsWith('/image')) return null;

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname?.startsWith(href);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = q.trim() ? `/models?q=${encodeURIComponent(q.trim())}` : '/models';
    router.push(url);
  };

  return (
    <>
      <header className="sticky top-0 z-40 h-16 px-4 lg:px-6 flex items-center gap-3 lg:gap-4 border-b border-border bg-bg/85 backdrop-blur-xl">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 -ml-2 text-text-muted hover:text-text"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-600/40">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold tracking-tight hidden sm:inline">Vidhyper</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV.map((n) => {
            const active = isActive(n.href);
            // Studio link uses rose accent (creator mode), others use brand violet (developer mode)
            if (n.highlight) {
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition inline-flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold shadow-md shadow-rose-600/40'
                      : 'text-rose-300 hover:text-rose-200 border border-rose-700/40 hover:border-rose-500/60 hover:bg-rose-700/10 font-medium'
                  }`}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7.4L12 16.8 5.7 21.4 8 14l-6-4.6h7.6L12 2z" /></svg>
                  {n.label}
                </Link>
              );
            }
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`px-3 py-1.5 text-sm rounded-md transition ${
                  active ? 'text-brand-200 bg-brand-700/15 font-medium' : 'text-text-muted hover:text-text'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submitSearch} className="flex-1 max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm 208 mô hình AI..."
            className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-bg-soft border border-border focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 outline-none text-sm placeholder:text-text-subtle transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium flex items-center gap-1.5 transition"
          >
            <Sparkles className="w-3 h-3" /> <span className="hidden sm:inline">Tìm</span>
          </button>
        </form>

        <div className="flex items-center gap-1 shrink-0">
          <button className="hidden md:flex p-2 hover:bg-bg-hover rounded-lg text-text-muted hover:text-text" title="Ngôn ngữ">
            <Globe className="w-4 h-4" />
          </button>
          <button className="hidden md:flex p-2 hover:bg-bg-hover rounded-lg text-text-muted hover:text-text" title="Thông báo">
            <Bell className="w-4 h-4" />
          </button>
          <Link
            href="/login"
            className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-sm text-text-muted hover:text-text border border-border hover:border-brand-600 transition"
          >
            Đăng nhập
          </Link>
          <Link
            href="/login?signup=1"
            className="px-3 py-1.5 rounded-lg text-sm bg-brand-600 hover:bg-brand-500 text-white font-medium transition shadow-md shadow-brand-600/30"
          >
            Đăng ký
          </Link>
        </div>
      </header>

      {/* Mobile menu drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 z-30 bg-bg-soft border-b border-border p-4 space-y-1">
          {NAV.map((n) => {
            const active = isActive(n.href);
            if (n.highlight) {
              return (
                <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-md text-sm font-semibold ${
                    active ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white' : 'text-rose-300 bg-rose-700/10 border border-rose-700/30'
                  }`}
                >
                  ✨ {n.label}
                </Link>
              );
            }
            return (
              <Link key={n.href} href={n.href} onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2.5 rounded-md text-sm ${
                  active ? 'bg-brand-700/20 text-brand-200 font-medium' : 'text-text-muted hover:bg-bg-hover'
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <div className="pt-3 mt-3 border-t border-border flex gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 btn-ghost text-sm justify-center">Đăng nhập</Link>
            <Link href="/login?signup=1" onClick={() => setMobileOpen(false)} className="flex-1 btn-primary text-sm justify-center">Đăng ký</Link>
          </div>
        </div>
      )}
    </>
  );
}
