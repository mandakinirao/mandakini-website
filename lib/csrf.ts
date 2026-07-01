import type { NextRequest } from 'next/server'

/**
 * CSRF origin guard for mutating API routes.
 *
 * Webhooks (Stripe, Razorpay) must NOT use this — they authenticate via
 * signature verification instead and arrive from servers with no Origin.
 *
 * Returns true when the request may proceed, false to reject.
 */

function allowedOrigins(): string[] {
  const site = process.env.NEXT_PUBLIC_SITE_URL
  const origins = ['http://localhost:3000', 'http://localhost:3001']
  if (site) origins.push(site.replace(/\/$/, ''))
  return origins
}

export function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const referer = req.headers.get('referer')

  // Server-to-server calls (no browser involved) carry neither header —
  // allow them; they cannot carry user cookies.
  if (!origin && !referer) return true

  const allowed = allowedOrigins()

  if (origin) {
    return allowed.some((o) => origin === o)
  }

  // Fallback: check the referer URL's origin
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin
      return allowed.some((o) => refOrigin === o)
    } catch {
      return false
    }
  }

  return false
}
