import { NextRequest, NextResponse } from 'next/server';
import { getModel } from '@/lib/models';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.model || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: { code: 'bad_request', message: 'Cần có `model` và `messages`.' } }, { status: 400 });
  }

  const m = getModel(body.model);
  if (!m) return NextResponse.json({ error: { code: 'model_not_found', message: `Không tìm thấy mô hình ${body.model}.` } }, { status: 404 });
  if (!m.modalities.includes('text') && !m.modalities.includes('multimodal')) {
    return NextResponse.json({ error: { code: 'wrong_endpoint', message: 'Mô hình này không hỗ trợ endpoint /chat. Hãy dùng endpoint khác phù hợp.' } }, { status: 400 });
  }

  const lastUser = [...body.messages].reverse().find((x: any) => x.role === 'user')?.content || '';
  return NextResponse.json({
    id: 'chatcmpl_' + Math.random().toString(36).slice(2, 12),
    object: 'chat.completion',
    model: m.slug,
    created: Math.floor(Date.now() / 1000),
    choices: [{
      index: 0,
      finish_reason: 'stop',
      message: {
        role: 'assistant',
        content: `[stub — gắn provider thật ở đây] Mô hình ${m.name} trả lời cho prompt: "${String(lastUser).slice(0, 80)}"`,
      },
    }],
    usage: { prompt_tokens: 12, completion_tokens: 24, total_tokens: 36 },
  });
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'chat',
    note: 'POST với { model, messages: [{role, content}] }. Cùng URL cho mọi nhà cung cấp.',
  });
}
