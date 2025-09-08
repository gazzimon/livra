import { NextRequest, NextResponse } from 'next/server';
import { magicAdmin } from '@/lib/magicAdmin';
import { setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const didToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!didToken) return NextResponse.json({ error: 'DID token faltante' }, { status: 401 });

    await magicAdmin.token.validate(didToken);
    const metadata = await magicAdmin.users.getMetadataByToken(didToken);
    if (!metadata.issuer) return NextResponse.json({ error: 'Issuer inválido' }, { status: 401 });

    await setSessionCookie({
      sub: metadata.issuer,
      email: metadata.email || null,
      addr: metadata.publicAddress || null,
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando sesión' }, { status: 401 });
  }
}
