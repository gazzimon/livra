import { NextRequest, NextResponse } from 'next/server';
import { magicAdmin } from '@/src/lib/magicAdmin';
import { setSessionCookie } from '@/src/lib/session';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const didToken = auth.startsWith('Bearer ') ? auth.slice(7) : '';
    if (!didToken) return NextResponse.json({ error: 'DID token faltante' }, { status: 401 });

    // valida el token y obtiene metadata del usuario
    await magicAdmin.token.validate(didToken); // throws si inválido
    const metadata = await magicAdmin.users.getMetadataByToken(didToken);
    // metadata: { issuer, publicAddress, email, ... }

    if (!metadata.issuer) {
      return NextResponse.json({ error: 'Issuer inválido' }, { status: 401 });
    }

    // Crea cookie de sesión propia (no dependemos de Magic en cada request)
    await setSessionCookie({
      sub: metadata.issuer,
      email: metadata.email || null,
      addr: metadata.publicAddress || null,
      iat: Math.floor(Date.now() / 1000),
    });

    return NextResponse.json({ ok: true, user: { email: metadata.email, sub: metadata.issuer } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando sesión' }, { status: 401 });
  }
}
