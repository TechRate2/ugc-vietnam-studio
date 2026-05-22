import { Check, Zap, Rocket, Building2 } from 'lucide-react';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Khởi đầu', icon: Zap, price: 0, period: 'tháng',
    desc: 'Dùng thử miễn phí cho cá nhân và sinh viên.',
    features: ['Tín dụng dùng thử $1', 'Tất cả mô hình text rẻ', 'Giới hạn 60 request/phút', 'Hỗ trợ qua diễn đàn'],
    cta: 'Đăng ký miễn phí', href: '/login?signup=1',
  },
  {
    name: 'Chuyên nghiệp', icon: Rocket, price: 9, period: 'tháng',
    desc: 'Dành cho lập trình viên và freelancer.', popular: true,
    features: ['Tín dụng tặng $10 mỗi tháng', 'Truy cập toàn bộ mô hình', 'Giới hạn 600 request/phút', 'Lịch sử lưu 90 ngày', 'Hỗ trợ email trong 24h'],
    cta: 'Chọn Chuyên nghiệp', href: '/login?plan=pro',
  },
  {
    name: 'Doanh nghiệp', icon: Building2, price: 49, period: 'tháng',
    desc: 'Đội nhóm và sản phẩm thương mại.',
    features: ['Tín dụng tặng $60 mỗi tháng', 'Nhiều tài khoản con + phân quyền', 'Giới hạn 6000 request/phút', 'SLA 99.95% có cam kết', 'Hỗ trợ riêng + tư vấn tích hợp', 'Hóa đơn VAT'],
    cta: 'Liên hệ tư vấn', href: '/login?plan=enterprise',
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-700/20 border border-brand-700/40 text-xs text-brand-200 font-medium mb-4">
          Bảng giá
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Trả tiền theo lượt dùng</h1>
        <p className="text-text-muted mt-3">
          Không phí cố định, không khóa hợp đồng. Mọi mô hình tính phí theo từng request thực tế.
          Đăng ký gói tháng để nhận tín dụng tặng và ưu đãi giới hạn.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {TIERS.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.name} className={`card p-6 relative ${t.popular ? 'border-brand-600 shadow-glow' : ''}`}>
              {t.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-bold uppercase tracking-wider">
                  Phổ biến nhất
                </span>
              )}
              <Icon className={`w-6 h-6 mb-3 ${t.popular ? 'text-brand-400' : 'text-text-muted'}`} />
              <h3 className="text-xl font-bold">{t.name}</h3>
              <p className="text-sm text-text-muted mt-1 min-h-[2.5rem]">{t.desc}</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="text-4xl font-bold">${t.price}</span>
                <span className="text-text-subtle">/{t.period}</span>
              </div>
              <Link href={t.href} className={`mt-4 w-full block text-center py-2.5 rounded-lg font-medium transition ${
                t.popular ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'border border-border hover:border-brand-600 text-text-muted hover:text-text'
              }`}>
                {t.cta}
              </Link>
              <ul className="mt-6 space-y-2.5">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="card p-6 max-w-3xl mx-auto">
        <h2 className="text-lg font-bold mb-4">Câu hỏi thường gặp</h2>
        <div className="space-y-3 text-sm">
          {[
            ['Tín dụng tặng có hết hạn không?', 'Tín dụng được làm mới đầu mỗi chu kỳ tháng và không cộng dồn.'],
            ['Có thể hủy bất cứ lúc nào không?', 'Có. Bạn hủy gói tháng tại trang Quản lý, hiệu lực kết thúc chu kỳ hiện tại.'],
            ['Phương thức thanh toán?', 'Thẻ Visa/Mastercard, VietQR (Casso), và chuyển khoản ngân hàng cho gói Doanh nghiệp.'],
          ].map(([q, a]) => (
            <details key={q} className="border-b border-border pb-3 last:border-0">
              <summary className="cursor-pointer font-medium text-text">{q}</summary>
              <p className="mt-2 text-text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
