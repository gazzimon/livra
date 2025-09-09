import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const COOKIE_NAME = 'livra_session'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret')

type Session = {
  sub: string
  email?: string | null
  wallet?: string | null
}

export async function signSession(payload: Session) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()            // ⬅️ await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
}

export async function clearSessionCookie() {
  const store = await cookies()            // ⬅️ await cookies()
  store.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export const SESSION_COOKIE_NAME = COOKIE_NAME
