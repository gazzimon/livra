import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  const body = await req.json(); // { hash, signers?: string[], meta?: any }
  if (!body?.hash) return NextResponse.json({ error: 'hash required' }, { status: 400 });

  const dir = join(process.cwd(), '.anchors');
  await mkdir(dir, { recursive: true });
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const file = join(dir, `${now}-${body.hash}.json`);

  await writeFile(file, JSON.stringify({
    ...body, anchoredAt: new Date().toISOString(), chain: 'local-stub'
  }, null, 2));

  return NextResponse.json({ ok: true, file, chain: 'local' });
}
