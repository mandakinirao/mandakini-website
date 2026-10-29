import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/admin/session'

/** Guards /admin and /api/admin. Server actions and route handlers re-check. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/admin/login') return NextResponse.next()

  const secret = process.env.ADMIN_SESSION_SECRET
  const signedIn =
    Boolean(secret && process.env.ADMIN_PASSWORD) &&
    (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, secret as string, Date.now()))
  if (signedIn) return NextResponse.next()

  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  return NextResponse.redirect(new URL('/admin/login', req.url))
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
