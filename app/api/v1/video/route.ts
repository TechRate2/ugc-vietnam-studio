import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.model || !body?.prompt) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Cần có `model` và `prompt`.' } }, { status: 400 });
  }
  const m = getModel(body.model);
  if (!m) return NextResponse.json({ error: { code: 'model_not_found', message: `Không tìm thấy mô hình ${body.model}.` } }, { status: 404 });
  if (!m.modalities.includes('video')) {
    return NextResponse.json({ error: { code: 'wrong_endpoint', message: 'Mô hình không hỗ trợ tạo video.' } }, { status: 400 });
  }

  const duration = body.duration ?? 5;
  return NextResponse.json({
    id: 'vid_' + Math.random().toString(36).slice(2, 12),
    model: m.slug,
    status: 'queued',
    estimated_seconds: duration * 3,
    created: Math.floor(Date.now() / 1000),
    output: { url: null, message: 'Polling /v1/video/jobs/{id} để lấy URL khi sẵn sàng.' },
    usage: { duration_seconds: duration, cost: (m.pricing.perRun?.amount ?? 0) * duration },
  });
}
