import { NextRequest, NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/session';

export async function POST(_req: NextRequest) {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
