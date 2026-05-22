/**
 * GET /api/v1/avatars — List 50 avatar VN preset.
 * Filter: ?ethnicity=Northern%20Vietnamese&gender=female&age_min=20&age_max=30
 */

import { NextRequest, NextResponse } from 'next/server';
import { backendClient } from '@/lib/backend-client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      ethnicity: searchParams.get('ethnicity') || undefined,
      gender: (searchParams.get('gender') as 'female' | 'male') || undefined,
      age_min: searchParams.get('age_min') ? parseInt(searchParams.get('age_min')!) : undefined,
      age_max: searchParams.get('age_max') ? parseInt(searchParams.get('age_max')!) : undefined,
    };

    const data = await backendClient.listAvatars(filters);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[/api/v1/avatars] Error:', err);
    return NextResponse.json(
      { error: { code: 'backend_error', message: err.message } },
      { status: err.status || 500 },
    );
  }
}
