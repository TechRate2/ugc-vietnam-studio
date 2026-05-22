/**
 * GET /api/v1/templates — List 30 templates VN.
 * Filter: ?category=ASMR&tier=S&audio_mode=silent_native
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendClient } from '@/lib/backend-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      category: searchParams.get('category') || undefined,
      tier: (searchParams.get('tier') as 'S' | 'A' | 'B') || undefined,
      audio_mode: searchParams.get('audio_mode') || undefined,
    };

    const data = await backendClient.listTemplates(filters);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[/api/v1/templates] Error:', err);
    return NextResponse.json(
      { error: { code: 'backend_error', message: err.message } },
      { status: err.status || 500 },
    );
  }
}
