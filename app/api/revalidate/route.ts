import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'

/**
 * Sanity publish webhook → instant content refresh (IA §4).
 *
 * Studio → API → Webhooks: POST to https://<site>/api/revalidate
 * with header  x-revalidate-secret: <SANITY_REVALIDATE_SECRET>
 * on create/update/delete of project, shopItem, pressItem,
 * siteSettings. Combined with `export const revalidate = 60` on the
 * content pages, the site is static-fast and never more than seconds
 * stale after a publish.
 *
 * Secret is header-only (never a query param) so it never appears in
 * server logs, CDN access logs, or Vercel function logs.
 */
export async function POST(req: NextRequest) {
  // 20 attempts per IP per hour — limits secret-guessing
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`revalidate:${ip}`, 20, 60 * 60_000)
  if (rl.limited) {
    return NextResponse.json(
      { revalidated: false },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  const secret = req.headers.get('x-revalidate-secret')
  if (
    !process.env.SANITY_REVALIDATE_SECRET ||
    secret !== process.env.SANITY_REVALIDATE_SECRET
  ) {
    return NextResponse.json({ revalidated: false }, { status: 401 })
  }

  // Content volume is small enough that whole-site revalidation is the
  // simple, correct choice; switch to tag-based if that ever changes.
  revalidatePath('/', 'layout')
  return NextResponse.json({ revalidated: true, at: new Date().toISOString() })
}
