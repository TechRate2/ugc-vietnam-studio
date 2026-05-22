import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BRAND = 'Vidhyper';

const CARDS = [
  {
    title: 'Ổn định và linh hoạt',
    image: '/images/enterprise-scale/stable-agile.webp',
    bullets: [
      'Cụm GPU quy mô lớn',
      'Framework suy luận được tối ưu hóa',
      'Truy cập mô hình SOTA từ Day 0',
    ],
  },
  {
    title: 'Độc quyền',
    image: '/images/enterprise-scale/exclusive.webp',
    description: `Truy cập độc quyền các mô hình mã nguồn đóng được triển khai trên đám mây riêng của ${BRAND}`,
    extra: 'Quyền truy cập độc quyền vào các mô hình closed-source hàng đầu chạy trong private cloud của chúng tôi—các tác vụ nhạy cảm nhất vẫn được cách ly, tuân thủ và hoàn toàn dưới quyền kiểm soát của bạn.',
  },
  {
    title: 'Thông lượng siêu cao',
    image: '/images/enterprise-scale/ultra-throughput.webp',
    bullets: [
      'Hệ thống batching tự động',
      'P99 latency < 800ms',
      'Auto-scale GPU pool linh hoạt',
    ],
  },
];

export function EnterpriseScale() {
  return (
    <div>
      <div className="max-w-2xl mb-10">
        <div className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-widest">Build</div>
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
          Thiết kế cho<br />quy mô doanh nghiệp
        </h2>
        <p className="mt-5 text-text-muted leading-relaxed">
          {BRAND} mang đến cho bạn những mô hình sáng tạo mới nhất, dẫn đầu ngành.
        </p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/login?signup=1" className="btn-primary text-sm">Liên hệ kinh doanh <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/pricing" className="btn-ghost text-sm">Tìm hiểu thêm</Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {CARDS.slice(0, 2).map((c) => (
          <article key={c.title} className="rounded-3xl border border-border bg-bg-card overflow-hidden hover:border-brand-500/40 transition group">
            <h3 className="px-6 pt-6 pb-4 text-2xl lg:text-3xl font-bold text-text">{c.title}</h3>
            <div className="px-6">
              <div className="rounded-2xl overflow-hidden border border-border aspect-[16/9]">
                <img src={c.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="p-6 pt-5">
              {c.bullets && (
                <ul className="space-y-2.5">
                  {c.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-text">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {c.description && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-text font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                    <span>{c.description}</span>
                  </div>
                  {c.extra && <p className="text-sm text-text-muted leading-relaxed pl-4">{c.extra}</p>}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>

      {/* 3rd card full width */}
      <article className="mt-6 rounded-3xl border border-border bg-bg-card overflow-hidden hover:border-brand-500/40 transition group">
        <div className="grid lg:grid-cols-[1fr_1.3fr]">
          <div className="p-6 lg:p-10 flex flex-col justify-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-text mb-5">Thông lượng siêu cao</h3>
            <p className="text-text-muted leading-relaxed mb-5">
              Nền tảng inference được thiết kế cho workload production scale với batching tự động,
              auto-scale GPU pool và độ trễ p99 dưới 800ms.
            </p>
            <ul className="space-y-2.5">
              {CARDS[2].bullets!.map((b) => (
                <li key={b} className="flex items-start gap-3 text-text">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="aspect-[16/9] lg:aspect-auto overflow-hidden border-l border-border">
            <img src={CARDS[2].image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </article>
    </div>
  );
}
