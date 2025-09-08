import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ✅ Rutas públicas → no requieren login
  if (
    pathname.startsWith('/auth') ||         // login, logout, session
    pathname.startsWith('/api') ||          // APIs abiertas
    pathname.startsWith('/_next') ||        // archivos Next.js
    pathname.startsWith('/favicon.ico') ||  // íconos
    pathname.startsWith('/assets')          // si tenés assets estáticos
  ) {
    return NextResponse.next()
  }

  // ✅ Revisar cookie de sesión
  const token = req.cookies.get('livra_session')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  try {
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
}

// ✅ Matcher: todo menos archivos estáticos
export const config = {
  matcher: ['/((?!_next|favicon.ico|assets).*)'],
}
