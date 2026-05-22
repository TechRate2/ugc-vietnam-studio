import { Bot, BarChart3, GraduationCap, Image as ImgIcon, Mic, Video, Code2, Search, Smartphone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type Category = {
  slug: string;
  label: string;
  sub: string;
  icon: LucideIcon;
  accent: string;
};

export const CATEGORIES: Category[] = [
  { slug: 'agents',       label: 'Trợ lý ảo',          sub: 'Chatbot · Vẽ tự động',           icon: Bot,           accent: 'from-violet-500 to-fuchsia-500' },
  { slug: 'productivity', label: 'Hiệu suất công việc', sub: 'Đấu trường mô hình',             icon: BarChart3,     accent: 'from-sky-500 to-cyan-500' },
  { slug: 'academic',     label: 'Học thuật',           sub: 'Bộ công cụ PDF',                 icon: GraduationCap, accent: 'from-amber-500 to-orange-500' },
  { slug: 'image',        label: 'Xử lý ảnh',           sub: 'Studio 3D · Tăng nét',           icon: ImgIcon,       accent: 'from-pink-500 to-rose-500' },
  { slug: 'audio',        label: 'Âm thanh',            sub: 'Giọng đọc · Nhái giọng',         icon: Mic,           accent: 'from-emerald-500 to-teal-500' },
  { slug: 'video',        label: 'Video',               sub: 'Trung tâm sáng tạo video',       icon: Video,         accent: 'from-red-500 to-rose-600' },
  { slug: 'code',         label: 'Lập trình',           sub: 'Tạo trang web bằng AI',          icon: Code2,         accent: 'from-blue-500 to-indigo-500' },
  { slug: 'search',       label: 'Tìm kiếm thông tin',  sub: 'Trợ lý nghiên cứu',              icon: Search,        accent: 'from-yellow-500 to-amber-500' },
  { slug: 'client',       label: 'Ứng dụng client',     sub: 'Desktop · iOS · Android',        icon: Smartphone,    accent: 'from-slate-500 to-zinc-500' },
];
