'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Mail, Lock, Github, Chrome, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 -mt-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            {mode === 'signin' ? 'Đăng nhập tài khoản' : 'Tạo tài khoản mới'}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            {mode === 'signin' ? 'Tiếp tục với AI Studio Hub' : 'Chỉ mất 30 giây — nhận ngay $1 tín dụng'}
          </p>
        </div>

        <div className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost text-sm"><Chrome className="w-4 h-4" /> Google</button>
            <button className="btn-ghost text-sm"><Github className="w-4 h-4" /> GitHub</button>
          </div>

          <div className="relative">
            <hr className="border-border" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-bg-card text-text-subtle text-xs">hoặc</span>
          </div>

          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs text-text-subtle uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                <input type="email" className="input pl-10" placeholder="ban@email.com" />
              </div>
            </div>
            <div>
              <label className="text-xs text-text-subtle uppercase tracking-wider mb-1.5 flex items-center justify-between">
                Mật khẩu
                {mode === 'signin' && (
                  <Link href="#" className="text-brand-400 hover:text-brand-300 normal-case tracking-normal text-[11px]">Quên?</Link>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle" />
                <input type="password" className="input pl-10" placeholder="Tối thiểu 8 ký tự" />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              {mode === 'signin' ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

          <p className="text-center text-sm text-text-muted">
            {mode === 'signin' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-brand-400 hover:text-brand-300 font-medium">
              {mode === 'signin' ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-text-subtle mt-4">
          Tiếp tục đồng nghĩa bạn đồng ý với <Link href="#" className="underline">Điều khoản</Link> và <Link href="#" className="underline">Chính sách bảo mật</Link>.
        </p>
      </div>
    </div>
  );
}
