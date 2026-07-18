import { NextRequest, NextResponse } from 'next/server'
import { razorpayEnabled } from '@/lib/commerce'
import { getPurchasableItems } from '@/lib/home-data'
import { createRazorpayOrder } from '@/lib/razorpay'
import { checkRateLimit } from '@/lib/rate-limit'
import { originAllowed } from '@/lib/csrf'

/**
 * Creates a Razorpay order from cart line items (or a single item for
 * Buy Now). Amounts are validated server-side from Sanity — the client
 * sends only slugs and quantities, never prices.
 * Returns { orderId, amount (paise), currency, keyId } to the client.
 */
export async function POST(req: NextRequest) {
  // CSRF — reject requests from other origins
  if (!originAllowed(req)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  // Brute-force: 5 checkout attempts per IP per minute
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`checkout:${ip}`, 5, 60_000)
  if (rl.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  if (!razorpayEnabled()) {
    return NextResponse.json(
      { error: 'The shop is not taking orders yet.' },
      { status: 503 }
    )
  }

  let body: {
    items?: { slug?: unknown; qty?: unknown }[]
    customer?: { name?: unknown; email?: unknown; phone?: unknown; address?: unknown }
  }
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

  const name = String(body.customer?.name ?? '').trim().slice(0, 120)
  const email = String(body.customer?.email ?? '').trim().slice(0, 120)
  const phone = String(body.customer?.phone ?? '').trim().slice(0, 40)
  const address = String(body.customer?.address ?? '').trim().slice(0, 240)
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!name || !EMAIL_RE.test(email) || !phone || !address) {
    return NextResponse.json(
      { error: 'Please fill in your name, email, phone, and shipping address.' },
      { status: 400 }
    )
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
    const order = await createRazorpayOrder(lines, { name, email, phone, address })
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
