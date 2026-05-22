import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { PromoBanner } from '@/components/PromoBanner';

export const metadata: Metadata = {
  title: 'Vidhyper — Nền tảng AI Inference Full-Modal cho nhà phát triển',
  description: 'Một endpoint duy nhất cho mọi mô hình AI: ngôn ngữ, hình ảnh, video, âm thanh. 179 model từ 12 hãng hàng đầu. Trả tiền theo lượt dùng, không khoá hợp đồng.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col">
        <PromoBanner />
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
