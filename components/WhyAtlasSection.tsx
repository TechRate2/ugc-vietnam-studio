'use client';
import { useState } from 'react';
import { Code2, Users, Lock, Cpu } from 'lucide-react';

const BRAND = 'Vidhyper';

const ADVANTAGES = [
  {
    icon: Code2,
    title: 'Tích hợp dễ dàng',
    desc: 'Hoàn tất tích hợp và ra mắt tính năng trong vài phút nhờ API đơn giản và MCP + Skills gốc của chúng tôi.',
  },
  {
    icon: Users,
    title: 'Dẫn dắt bởi chuyên gia',
    desc: `Đội ngũ kỹ sư AI chuyên gia của chúng tôi mang đến cho bạn những tối ưu và công nghệ độc quyền của ${BRAND}.`,
  },
  {
    icon: Lock,
    title: 'Bảo mật cấp doanh nghiệp',
    desc: 'Dữ liệu của bạn được an toàn và bảo mật nhờ các chứng chỉ SOC I & II cùng tuân thủ HIPAA.',
  },
  {
    icon: Cpu,
    title: `Công cụ suy luận ${BRAND} Photon`,
    desc: `${BRAND} Photon engine mang lại khả năng suy luận LLM với thông lượng cao và độ trễ thấp ở quy mô lớn, nhờ lượng tử hóa FP4 tiên tiến và điều phối tối ưu hóa cho phần cứng.`,
  },
];

export function WhyAtlasSection() {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="max-w-2xl mb-10">
        <div className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-widest">Ưu thế</div>
        <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">Vì sao chọn {BRAND}?</h2>
        <p className="mt-5 text-text-muted leading-relaxed">
          {BRAND} cung cấp hạ tầng mô hình đáng tin cậy, bộ công cụ mạnh mẽ và quy trình làm việc liền mạch,
          giúp các đội ngũ xây dựng, triển khai và mở rộng AI nhanh hơn.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10">
        {/* Left: big painting */}
        <div className="relative aspect-[4/3] lg:aspect-auto rounded-3xl overflow-hidden border border-border bg-bg-card lg:order-1 order-2">
          <img src="/images/why-atlas/why-atlas-hero.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Right: accordion cards */}
        <div className="space-y-3 lg:order-2 order-1">
          {ADVANTAGES.map((a, i) => {
            const Icon = a.icon;
            const isActive = i === active;
            return (
              <button
                key={a.title}
                onClick={() => setActive(i)}
                className={`w-full text-left rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-bg-card border-brand-500/50 shadow-lg shadow-brand-600/15'
                    : 'bg-bg-soft/40 border-border hover:border-brand-500/30'
                }`}
              >
                <div className="px-5 py-4 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                    isActive ? 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-600/40' : 'bg-bg-card border border-border'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                  </div>
                  <span className={`font-semibold ${isActive ? 'text-text' : 'text-text-muted'}`}>{a.title}</span>
                </div>
                <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm text-text-muted leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
