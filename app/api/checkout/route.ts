import { NextRequest, NextResponse } from 'next/server'
import { razorpayEnabled } from '@/lib/commerce'
import { getPurchasableItems } from '@/lib/home-data'
import { createRazorpayOrder } from '@/lib/razorpay'

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 1000
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > RATE_LIMIT
}

/**
 * Creates a Razorpay order from cart line items (or a single item for
 * Buy Now). Amounts are validated server-side from Sanity — the client
 * sends only slugs and quantities, never prices.
 * Returns { orderId, amount (paise), currency, keyId } to the client.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
  }
  if (!razorpayEnabled()) {
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
        { error: `Only ${item.stock} of "${item.title}" remain.` },
        { status: 409 }
      )
    }
    lines.push({ item, quantity: qty })
  }

  try {
    const order = await createRazorpayOrder(lines)
    if (!order) {
      return NextResponse.json(
        { error: 'Checkout is unavailable right now.' },
        { status: 503 }
      )
    }
    return NextResponse.json(order)
  } catch (err) {
    console.error('[checkout] Razorpay order creation failed:', err)
    return NextResponse.json(
      { error: 'Checkout is unavailable right now.' },
      { status: 502 }
    )
  }
}
