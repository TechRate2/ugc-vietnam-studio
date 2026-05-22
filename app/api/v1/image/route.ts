import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.model || !body?.prompt) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Cần có `model` và `prompt`.' } }, { status: 400 });
  }
  const m = getModel(body.model);
  if (!m) return NextResponse.json({ error: { code: 'model_not_found', message: `Không tìm thấy mô hình ${body.model}.` } }, { status: 404 });
  if (!m.modalities.includes('image')) {
    return NextResponse.json({ error: { code: 'wrong_endpoint', message: 'Mô hình không hỗ trợ tạo ảnh.' } }, { status: 400 });
  }

  return NextResponse.json({
    id: 'img_' + Math.random().toString(36).slice(2, 12),
    model: m.slug,
    created: Math.floor(Date.now() / 1000),
    data: [{ url: 'https://placehold.co/1024x1024/0a0a0b/7c4dff?text=Stub+Image' }],
    usage: { runs: 1, cost: m.pricing.perRun?.amount ?? 0 },
  });
}
