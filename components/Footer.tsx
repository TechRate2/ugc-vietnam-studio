'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Github, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith('/studio') || pathname?.startsWith('/video') || pathname?.startsWith('/image')) return null;
  return (
    <footer className="border-t border-border bg-bg-soft mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight">Vidhyper</span>
            </Link>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs">
              Cổng kết nối thống nhất cho mọi mô hình AI. Một endpoint, 179 model, 12 hãng.
            </p>
          </div>

          <FooterCol title="Sản phẩm" links={[
            { href: '/models', label: 'Tất cả mô hình' },
            { href: '/models?cat=video', label: 'Video AI' },
            { href: '/models?cat=image', label: 'Image AI' },
            { href: '/models?cat=audio', label: 'Audio AI' },
          ]} />

          <FooterCol title="Tài nguyên" links={[
            { href: '/docs', label: 'Tài liệu API' },
            { href: '/pricing', label: 'Bảng giá' },
            { href: '/models?promo=new', label: 'Cập nhật mới' },
            { href: '#', label: 'Trạng thái hệ thống' },
          ]} />

          <FooterCol title="Công ty" links={[
            { href: '#', label: 'Giới thiệu' },
            { href: '#', label: 'Liên hệ' },
            { href: '#', label: 'Điều khoản dịch vụ' },
            { href: '#', label: 'Chính sách riêng tư' },
          ]} />
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-subtle">© 2026 Vidhyper. Bản quyền thuộc về người dùng cuối.</p>
          <div className="flex items-center gap-2">
            <a href="#" className="p-2 text-text-subtle hover:text-text rounded-lg hover:bg-bg-hover" aria-label="Github">
              <Github className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 text-text-subtle hover:text-text rounded-lg hover:bg-bg-hover" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="#" className="p-2 text-text-subtle hover:text-text rounded-lg hover:bg-bg-hover" aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-text mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-xs text-text-muted hover:text-text transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
