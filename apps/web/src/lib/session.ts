import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signSession(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}

/**
 * Devuelve la sesión actual desde la cookie, o null si no hay o es inválida
 */
export async function getSession() {
  const token = cookies().get('livra_session')?.value
  if (!token) return null
  try {
    return await verifySession(token)
  } catch {
    return null
  }
}

/**
 * Limpia la cookie de sesión (para logout)
 */
export async function clearSessionCookie() {
  cookies().set('livra_session', '', { path: '/', httpOnly: true, maxAge: 0 })
}
