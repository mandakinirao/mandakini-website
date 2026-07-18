import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmation, sendOwnerNotification } from '@/lib/emails'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

interface NoteItem {
  id: string
  slug: string
  qty: number
}

/**
 * Razorpay webhook — verifies the signature, and on payment.captured
 * creates the Sanity order, decrements stock, and sends confirmation
 * emails. Idempotent on razorpayOrderId (a captured payment can only
 * ever belong to one order).
 *
 * Customer/address fields travel in the Razorpay ORDER's notes (set at
 * order-creation time in lib/razorpay.ts). Razorpay does not copy order
 * notes onto the payment entity delivered in this webhook, so they are
 * read by fetching the order directly rather than trusting
 * `payment.notes`.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const signature = req.headers.get('x-razorpay-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const payload = await req.text()
  if (!verifySignature(payload, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  let event: { event: string; payload: { payment?: { entity: Record<string, unknown> } } }
  try {
    event = JSON.parse(payload)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  if (event.event !== 'payment.captured') {
    return NextResponse.json({ received: true })
  }

  const payment = event.payload.payment?.entity
  if (!payment) return NextResponse.json({ received: true })

  const paymentId = payment.id as string
  const razorpayOrderId = payment.order_id as string
  const amountPaise = payment.amount as number
  const paymentEmail = payment.email as string | undefined
  const paymentContact = payment.contact as string | undefined

  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.SANITY_API_WRITE_TOKEN
  ) {
    console.error('[rzp-webhook] Sanity write env missing — order NOT recorded:', paymentId)
    return NextResponse.json({ error: 'Storage not configured.' }, { status: 503 })
  }

  // Order notes carry the customer/address fields set at order-creation
  // time — fetch the order itself, not payment.notes (see doc comment).
  let notes: Record<string, string> = {}
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (keyId && keySecret) {
    try {
      const Razorpay = (await import('razorpay')).default
      const rzpClient = new Razorpay({ key_id: keyId, key_secret: keySecret })
      const order = await rzpClient.orders.fetch(razorpayOrderId)
      notes = (order.notes as Record<string, string>) ?? {}
    } catch (err) {
      console.error('[rzp-webhook] order fetch failed for', razorpayOrderId, err)
    }
  }

  const customerName = notes.customerName ?? ''
  const customerEmail = notes.customerEmail || paymentEmail || ''
  const customerPhone = notes.customerPhone || paymentContact || ''
  const shippingAddress = notes.shippingAddress ?? ''

  let noteItems: NoteItem[] = []
  try {
    noteItems = JSON.parse(notes.items ?? '[]')
  } catch {
    console.error('[rzp-webhook] unreadable items notes for', razorpayOrderId)
  }

  try {
    const [{ createClient }, { orderCountQuery, shopItemsBySlugsQuery }] = await Promise.all([
      import('next-sanity'),
      import('@/sanity/lib/queries'),
    ])
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })

    const sanityId = `order.${razorpayOrderId.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`
    const existing = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: sanityId })
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    // Re-fetch title/price snapshots from Sanity — never trust client-
    // supplied amounts, and notes.items intentionally carries no pricing.
    const slugs = noteItems.map((i) => i.slug)
    const shopDocs = slugs.length
      ? await client.fetch<{ _id: string; title?: string; slug?: string; basePrice?: number }[]>(
          shopItemsBySlugsQuery,
          { slugs }
        )
      : []

    const items = noteItems.map((i) => {
      const doc = shopDocs.find((d) => d.slug === i.slug)
      return {
        _key: i.slug,
        shopItem: doc ? { _type: 'reference' as const, _ref: doc._id } : undefined,
        title: doc?.title ?? i.slug,
        quantity: i.qty,
        priceAtPurchase: doc?.basePrice ?? 0,
        docId: doc?._id,
      }
    })

    const orderCount = await client.fetch<number>(orderCountQuery)
    const orderNumber = `MR-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`
    const createdAt = new Date().toISOString()
    const amountTotal = amountPaise / 100

    await client.create({
      _id: sanityId,
      _type: 'order',
      orderNumber,
      razorpayOrderId,
      razorpayPaymentId: paymentId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: items.map(({ _key, shopItem, title, quantity, priceAtPurchase }) => ({
        _key,
        shopItem,
        title,
        quantity,
        priceAtPurchase,
      })),
      amountTotal,
      status: 'paid',
      shippedEmailSent: false,
      createdAt,
    })

    // Stock decrement + sold increment
    for (const i of items) {
      if (!i.docId) continue
      try {
        const updated = await client
          .patch(i.docId)
          .dec({ stock: i.quantity })
          .inc({ sold: i.quantity })
          .commit<{ stock?: number }>()
        if (typeof updated.stock === 'number' && updated.stock <= 0) {
          await client.patch(i.docId).set({ availabilityStatus: 'soldOut' }).commit()
        }
      } catch (err) {
        console.error('[rzp-webhook] stock update failed for', i.title, err)
      }
    }

    const emailPayload = {
      orderNumber,
      customerName,
      customerEmail,
      shippingAddress,
      items: items.map(({ title, quantity, priceAtPurchase }) => ({ title, quantity, priceAtPurchase })),
      amountTotal,
    }

    if (customerEmail) {
      const confResult = await sendOrderConfirmation(emailPayload)
      if (!confResult.ok) console.error('[rzp-webhook] confirmation email failed:', confResult.error)
    }
    const notifyResult = await sendOwnerNotification(emailPayload)
    if (!notifyResult.ok) console.error('[rzp-webhook] owner notification failed:', notifyResult.error)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[rzp-webhook] order processing failed:', err)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
