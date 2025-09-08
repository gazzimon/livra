// apps/web/src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/auth')) return NextResponse.next()

  const token = req.cookies.get('livra_session')?.value
  if (!token) return NextResponse.redirect(new URL('/auth/login', req.url))

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
}

export const config = { matcher: ['/((?!_next).*)'] }
