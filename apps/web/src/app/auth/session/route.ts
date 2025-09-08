import { NextRequest, NextResponse } from 'next/server'
import { getMagicAdmin } from '@/lib/magicAdmin'
import { signSession, getSession } from '@/lib/session'

/**
 * POST: recibe el DID de Magic y crea cookie JWT
 */
export async function POST(req: NextRequest) {
  const did = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!did) return NextResponse.json({ error: 'No DID' }, { status: 401 })

  const magic = getMagicAdmin()
  await magic.token.validate(did)
  const issuer = await magic.token.getIssuer(did)
  const meta = await magic.users.getMetadataByToken(did)

  const jwt = await signSession({
    sub: issuer,
    email: meta.email,
    wallet: meta.publicAddress,
  })

  const res = NextResponse.json({
    user: { issuer, email: meta.email, wallet: meta.publicAddress },
  })
  res.cookies.set('livra_session', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return res
}

/**
 * GET: devuelve la sesión actual desde la cookie
 */
export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}
