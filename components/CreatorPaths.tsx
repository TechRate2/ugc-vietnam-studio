import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const BRAND = 'Vidhyper';

export function CreatorPaths() {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Phát triển */}
      <article className="rounded-3xl border border-border bg-bg-card overflow-hidden hover:border-brand-500/40 transition group">
        <div className="aspect-[16/10] overflow-hidden border-b border-border">
          <img src="/images/home/create-develop/develop-card.webp" alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="p-7">
          <h3 className="text-2xl lg:text-3xl font-bold text-text mb-3">Phát triển</h3>
          <p className="text-text-muted leading-relaxed mb-5">
            {BRAND} là cỗ máy AI dành riêng cho nhà phát triển hình ảnh. Chúng tôi loại bỏ sự phức tạp
            của hạ tầng và điểm nghẽn tính toán, cung cấp một cổng thống nhất tới những mô hình hình ảnh
            tiên tiến nhất thế giới. Bạn tập trung vào tác phẩm, việc nặng cứ để chúng tôi lo.
          </p>
          <ul className="space-y-2 mb-6">
            {['Một API', 'Một pipeline tốc độ cao', 'Một giải pháp có thể mở rộng'].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-text">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                {b}
              </li>
            ))}
          </ul>
          <Link href="/login?signup=1" className="btn-primary text-sm">
            Nhận API Key <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>

      {/* Sáng tạo */}
      <article className="rounded-3xl border border-border bg-bg-card overflow-hidden hover:border-brand-500/40 transition group">
        <div className="aspect-[16/10] overflow-hidden border-b border-border">
          <img src="/images/home/create-develop/create-card.webp" alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
        <div className="p-7">
          <h3 className="text-2xl lg:text-3xl font-bold text-text mb-3">Sáng tạo</h3>
          <p className="text-text-muted leading-relaxed mb-5">
            {BRAND} là khung vẽ AI đỉnh cao dành cho người sáng tạo. Thông qua tổng hợp suy luận đa
            phương thức tiên tiến, chúng tôi biến những thuật toán phức tạp thành cỗ máy cảm hứng liền mạch.
            Từ tổng hợp văn bản thành video đến tái cấu trúc hình ảnh xuyên mô hình.
          </p>
          <ul className="space-y-2 mb-6">
            {['Tự do sáng tạo đa phương thức', 'Bộ sưu tập mô hình đỉnh cao toàn cầu', 'Truyền cảm hứng tức thì'].map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-text">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                {b}
              </li>
            ))}
          </ul>
          <Link href="/models" className="btn-primary text-sm">
            Khám phá tất cả mô hình <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </article>
    </div>
  );
}
