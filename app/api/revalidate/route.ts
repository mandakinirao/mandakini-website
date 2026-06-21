import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sanity publish webhook → instant content refresh (IA §4).
 *
 * Studio → API → Webhooks: POST to
 *   https://<site>/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>
 * on create/update/delete of project, shopItem, pressItem,
 * siteSettings. Combined with `export const revalidate = 60` on the
 * content pages, the site is static-fast and never more than seconds
 * stale after a publish.
 */
export async function POST(req: NextRequest) {
  const secret =
    req.nextUrl.searchParams.get('secret') ??
    req.headers.get('x-revalidate-secret')

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
