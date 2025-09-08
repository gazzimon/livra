import { NextRequest, NextResponse } from 'next/server'
import { getMagicAdmin } from '@/lib/magicAdmin'
import { signSession } from '@/lib/session'

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

  const res = NextResponse.json({ user: { issuer, email: meta.email } })
  res.cookies.set('livra_session', jwt, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7,
  })
  return res
}
