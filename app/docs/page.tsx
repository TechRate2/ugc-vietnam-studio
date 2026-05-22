import Link from 'next/link';
import { BookOpen, Code2, Zap, Shield, ArrowRight } from 'lucide-react';

export const metadata = { title: 'Tài liệu — Vidhyper API' };

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <header>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-700/15 border border-brand-700/30 text-xs text-brand-200 font-medium mb-4">
          <BookOpen className="w-3.5 h-3.5" /> Tài liệu API
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Tích hợp Vidhyper trong 5 phút</h1>
        <p className="mt-3 text-text-muted leading-relaxed max-w-2xl">
          Vidhyper cung cấp REST API thống nhất cho 179 mô hình AI: text-to-image, text-to-video, image-to-image,
          image-to-video, audio-to-video. Tương thích chuẩn OpenAI SDK.
        </p>
      </header>

      <section className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Một endpoint', desc: 'POST /v1/model/generate{Image,Video}' },
          { icon: Code2, label: '7 SDK', desc: 'Python · JS · cURL · Swift · Kotlin · Java · Dart' },
          { icon: Shield, label: 'OpenAI compatible', desc: 'Set base_url, dùng SDK OpenAI có sẵn' },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="card p-5">
              <Icon className="w-5 h-5 text-brand-400 mb-3" />
              <div className="font-semibold mb-1">{c.label}</div>
              <div className="text-xs text-text-muted">{c.desc}</div>
            </div>
          );
        })}
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-bold mb-4">Quickstart: Sinh video với Python</h2>
        <pre className="text-xs font-mono text-text-muted bg-bg p-4 rounded-md overflow-x-auto leading-relaxed">{`import requests, time

# 1. Đăng ký account → lấy API key
API_KEY = "vh-..."

# 2. POST request sinh video
r = requests.post(
    "https://api.vidhyper.ai/v1/model/generateVideo",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "model": "alibaba/happyhorse-1.0/text-to-video",
        "prompt": "A dragon flying over neon-lit Tokyo, cinematic",
        "duration": 5,
        "resolution": "1080P",
        "ratio": "16:9",
    }
)
prediction_id = r.json()["data"]["id"]

# 3. Poll cho đến khi xong
while True:
    p = requests.get(
        f"https://api.vidhyper.ai/v1/model/prediction/{prediction_id}",
        headers={"Authorization": f"Bearer {API_KEY}"},
    ).json()
    if p["data"]["status"] == "succeeded":
        print(p["data"]["output"])
        break
    time.sleep(3)`}</pre>
      </section>

      <section className="text-center">
        <p className="text-text-muted mb-4">Khám phá 179 mô hình AI có sẵn, mỗi mô hình có playground để thử nghiệm.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/models" className="btn-primary">Khám phá mô hình <ArrowRight className="w-4 h-4" /></Link>
          <Link href="/login?signup=1" className="btn-ghost">Nhận API Key miễn phí</Link>
        </div>
      </section>
    </div>
  );
}
