import { NextRequest, NextResponse } from 'next/server'
import { stripeEnabled } from '@/lib/commerce'
import { getPurchasableItems } from '@/lib/home-data'
import { createCheckoutSession } from '@/lib/stripe'

/**
 * Creates a Stripe Checkout Session from cart line items (or a single
 * item for Buy Now). Amounts are validated server-side from Sanity —
 * the client sends only slugs and quantities, never prices. Guarded:
 * with commerce off or keys absent this returns 503 and the UI that
 * could call it is never rendered anyway.
 */
export async function POST(req: NextRequest) {
  if (!stripeEnabled()) {
    return NextResponse.json(
      { error: 'The shop is not taking orders yet.' },
      { status: 503 }
    )
  }

  let body: { items?: { slug?: unknown; qty?: unknown }[] }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const requested = (body.items ?? [])
    .map((i) => ({
      slug: typeof i.slug === 'string' ? i.slug : '',
      qty: Math.floor(Number(i.qty)),
    }))
    .filter((i) => i.slug && Number.isFinite(i.qty) && i.qty > 0 && i.qty <= 20)

  if (!requested.length || requested.length > 20) {
    return NextResponse.json({ error: 'Your cart looks empty.' }, { status: 400 })
  }

  // Source of truth: Sanity (placeholder list while the dataset is empty).
  const items = await getPurchasableItems(requested.map((i) => i.slug))

  const lines = []
  for (const { slug, qty } of requested) {
    const item = items.find((i) => i.slug === slug)
    if (!item) {
      return NextResponse.json(
        { error: 'An item in your cart is no longer available.' },
        { status: 409 }
      )
    }
    if (item.stock < qty) {
      return NextResponse.json(
        { error: `Only ${item.stock} of “${item.title}” remain.` },
        { status: 409 }
      )
    }
    lines.push({ item, quantity: qty })
  }

  try {
    const session = await createCheckoutSession(lines)
    if (!session) {
      return NextResponse.json(
        { error: 'Checkout is unavailable right now.' },
        { status: 503 }
      )
    }
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] session creation failed:', err)
    return NextResponse.json(
      { error: 'Checkout is unavailable right now.' },
      { status: 502 }
    )
  }
}
