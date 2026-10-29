import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/admin/session'

function adminConfigured(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || !process.env.ADMIN_PASSWORD) return null
  return secret
}

/** Server components and server actions: redirects to login when signed out. */
export async function requireAdmin(): Promise<void> {
  const secret = adminConfigured()
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!secret || !(await verifySessionToken(token, secret, Date.now()))) {
    redirect('/admin/login')
  }
}

/** Route handlers: same check, no redirect. */
export async function isAdminRequest(req: NextRequest): Promise<boolean> {
  const secret = adminConfigured()
  if (!secret) return false
  return verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, secret, Date.now())
}
