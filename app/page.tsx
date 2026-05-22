import Link from 'next/link';
import { ArrowRight, ChevronRight, MessageCircle, Quote } from 'lucide-react';
import { MODELS } from '@/lib/models';
import { Reveal } from '@/components/Reveal';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import { HeroPromo } from '@/components/HeroPromo';
import { WhyAtlasSection } from '@/components/WhyAtlasSection';
import { EnterpriseScale } from '@/components/EnterpriseScale';
import { CreatorPaths } from '@/components/CreatorPaths';

const BRAND = 'Vidhyper';

const TESTIMONIALS = [
  { quote: `Việc triển khai Day-0 cho mọi mô hình SOTA trên ${BRAND} giúp chúng tôi thúc đẩy tăng trưởng người dùng mới và nâng cao tỷ lệ giữ chân người đăng ký hiện có.`, author: 'Founder · AI Video Studio', logo: '/images/reliance/higgsfield.png' },
  { quote: `Độ ổn định của ${BRAND} cùng đội ngũ hỗ trợ chất lượng cao cho phép các đội của chúng tôi tập trung nhiều hơn vào đổi mới sản phẩm, thay vì gánh nặng vận hành.`, author: 'CTO · ComfyUI Platform', logo: '/images/reliance/comfyui.png' },
  { quote: 'Việc truy cập thống nhất tới mọi mô hình AI hàng đầu chỉ qua một API duy nhất tiết kiệm cho team chúng tôi hàng trăm giờ tích hợp mỗi tháng.', author: 'Lead Engineer · OpenRouter', logo: '/images/reliance/openrouter.png' },
];

const FAQ = [
  { q: `${BRAND} API là gì và hoạt động ra sao?`, a: `${BRAND} là một nền tảng inference AI full-modal, cung cấp cho lập trình viên một AI API duy nhất để truy cập các API tạo video, tạo ảnh và LLM API hàng đầu thế giới. Thay vì phải quản lý nhiều tích hợp với từng nhà cung cấp, bạn chỉ kết nối một lần và có quyền truy cập thống nhất tới ${MODELS.length}+ mô hình được tuyển chọn trên mọi modality.` },
  { q: `${BRAND} API có tương thích với OpenAI API không?`, a: `Có. ${BRAND} cung cấp endpoint chuẩn OpenAI-compatible. Bạn chỉ cần set base_url sang api.vidhyper.ai/v1 và dùng SDK OpenAI có sẵn (Python/JS/Go) — không cần đổi code logic.` },
  { q: 'Tôi có thể dùng tối đa bao nhiêu mô hình cùng lúc?', a: `Toàn bộ ${MODELS.length} mô hình đều mở cho mọi tier. Free tier: 60 req/phút. Pro: 600 req/phút. Enterprise: tuỳ chỉnh theo nhu cầu.` },
  { q: 'Giá rẻ hơn so với gọi trực tiếp như thế nào?', a: `${BRAND} đàm phán giá sỉ với các hãng AI và share lại cho user. Trung bình rẻ hơn 60-90% so với gọi trực tiếp từ OpenAI/Google/ByteDance.` },
  { q: 'Có hỗ trợ webhook callback không?', a: `Có. Khi POST request, gửi kèm webhook_url — ${BRAND} sẽ POST kết quả về URL đó khi prediction xong, thay vì poll. Hỗ trợ retry tự động.` },
  { q: 'Data của tôi có an toàn không?', a: `Mọi request được mã hoá TLS 1.3. ${BRAND} không train trên data user. Đạt chứng chỉ SOC I/II + HIPAA compliance.` },
];

export default function HomePage() {
  return (
    <div className="space-y-24 max-w-7xl mx-auto pb-12">

      {/* ============ HERO PROMO CAROUSEL ============ */}
      <section className="animate-fade-in-up">
        <HeroPromo />
      </section>

      {/* ============ FEATURED FAMILY CAROUSEL ============ */}
      <Reveal as="section">
        <div className="mb-6">
          <div className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-widest flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
              <span className="relative w-2 h-2 rounded-full bg-amber-400" />
            </span>
            Mới
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-[1.15] max-w-4xl">
            Đồng bộ ngay từ ngày đầu,<br />
            <span className="bg-gradient-to-r from-brand-300 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent animate-gradient-shift inline-block">mô hình mới sẵn sàng tức thì</span>
          </h2>
          <p className="mt-4 text-text-muted max-w-2xl leading-relaxed">
            {BRAND} cung cấp cho bạn các mô hình sáng tạo hàng đầu ngành mới nhất.
          </p>
          <Link href="/models" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-lg border border-border hover:border-brand-500 bg-bg-soft hover:bg-bg-hover text-text transition group">
            Explore all industry-leading models
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <FeaturedCarousel />
      </Reveal>

      {/* ============ NIỀM TIN — Testimonials ============ */}
      <Reveal as="section">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-amber-400 text-sm font-medium mb-3 uppercase tracking-widest">Niềm tin</div>
          <h2 className="text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Kiến tạo bởi {BRAND}.<br />Tin chọn bởi Thế giới.
          </h2>
          <p className="mt-5 text-text-muted">
            {BRAND} mang đến hạ tầng mô hình đáng tin cậy, bộ công cụ mạnh mẽ và quy trình làm việc liền mạch,
            giúp các đội ngũ xây dựng, triển khai và mở rộng AI nhanh hơn.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="card p-6 relative hover:scale-[1.02] hover:border-brand-500/30 transition-all h-full flex flex-col">
                <Quote className="absolute top-4 right-4 w-7 h-7 text-brand-700/30" />
                <p className="text-sm text-text leading-relaxed mb-4 italic flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <img src={t.logo} alt="" className="w-8 h-8 rounded-md object-contain bg-white/5 p-1" />
                  <div className="text-xs text-text-muted">{t.author}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* ============ ƯU THẾ — WhyAtlas (painting + accordion) ============ */}
      <Reveal as="section">
        <WhyAtlasSection />
      </Reveal>

      {/* ============ PHÁT TRIỂN + SÁNG TẠO ============ */}
      <Reveal as="section">
        <CreatorPaths />
      </Reveal>

      {/* ============ BUILD — Enterprise Scale (3 painting cards) ============ */}
      <Reveal as="section">
        <EnterpriseScale />
      </Reveal>

      {/* ============ FAQ ============ */}
      <Reveal as="section">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">Câu hỏi thường gặp về {BRAND}</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <details className="card p-5 group cursor-pointer hover:border-brand-500/30 transition">
                <summary className="flex items-center justify-between gap-3 list-none">
                  <span className="font-semibold text-text">{f.q}</span>
                  <ChevronRight className="w-4 h-4 text-text-subtle group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <p className="text-sm text-text-muted leading-relaxed mt-3 pt-3 border-t border-border">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Reveal>

      {/* ============ DISCORD CTA ============ */}
      <Reveal as="section" className="rounded-3xl border border-brand-700/40 bg-gradient-to-br from-brand-900/40 via-bg-card to-indigo-900/30 p-10 lg:p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,77,255,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
        <div className="relative">
          <MessageCircle className="w-12 h-12 mx-auto text-brand-300 mb-4 animate-float" />
          <h3 className="text-2xl lg:text-3xl font-bold text-text mb-3">Tham gia cộng đồng Discord {BRAND}</h3>
          <p className="text-text-muted max-w-xl mx-auto mb-6">
            Cập nhật mô hình mới nhất, share prompt hay, được hỗ trợ trực tiếp từ team và cộng đồng builder.
          </p>
          <a href="#" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-400 hover:scale-105 text-white font-semibold transition shadow-lg shadow-indigo-500/40">
            <MessageCircle className="w-5 h-5" /> Tham gia ngay
          </a>
        </div>
      </Reveal>
    </div>
  );
}
