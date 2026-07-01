import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { orderConfirmation, orderNotification } from '@/emails/orderEmails'

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'))
  } catch {
    return false
  }
}

/**
 * Razorpay webhook — verifies the signature, and on payment.captured
 * creates the Sanity order, decrements stock, and sends confirmation
 * emails. Idempotent: order _id is derived from the Razorpay payment id.
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
  const orderId = payment.order_id as string
  const amountPaise = payment.amount as number
  const email = payment.email as string | undefined
  const contact = payment.contact as string | undefined

  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.SANITY_API_WRITE_TOKEN
  ) {
    console.error('[rzp-webhook] Sanity write env missing — order NOT recorded:', paymentId)
    return NextResponse.json({ error: 'Storage not configured.' }, { status: 503 })
  }

  let items: { id: string; slug: string; qty: number; amount: number }[] = []
  try {
    const notes = payment.notes as Record<string, string> | undefined
    items = JSON.parse(notes?.items ?? '[]')
  } catch {
    console.error('[rzp-webhook] unreadable items notes for', paymentId)
  }

  try {
    const { createClient } = await import('next-sanity')
    const client = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
      token: process.env.SANITY_API_WRITE_TOKEN,
      useCdn: false,
    })

    const sanityId = `order.${paymentId.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`
    const existing = await client.fetch<string | null>(`*[_id == $id][0]._id`, { id: sanityId })
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    await client.create({
      _id: sanityId,
      _type: 'order',
      orderId: paymentId,
      stripeSessionId: orderId, // reuse field for Razorpay order_id
      customerName: '',
      customerEmail: email ?? '',
      shippingAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
      items: items.map((i) => ({
        _key: i.slug,
        shopItemRef: i.id && i.id !== i.slug ? { _type: 'reference', _ref: i.id } : undefined,
        quantity: i.qty,
        price: i.amount,
      })),
      totalAmount: amountPaise / 100,
      paymentStatus: 'paid',
      fulfillmentStatus: 'new',
      orderDate: new Date().toISOString(),
    })

    // Stock decrement + sold increment
    for (const i of items) {
      if (!i.id || i.id === i.slug) continue
      try {
        const updated = await client
          .patch(i.id)
          .dec({ stock: i.qty })
          .inc({ sold: i.qty })
          .commit<{ stock?: number }>()
        if (typeof updated.stock === 'number' && updated.stock <= 0) {
          await client.patch(i.id).set({ availabilityStatus: 'soldOut' }).commit()
        }
      } catch (err) {
        console.error('[rzp-webhook] stock update failed for', i.slug, err)
      }
    }

    if (process.env.RESEND_API_KEY && email) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.ENQUIRY_FROM_EMAIL ?? 'studio@mandakinirao.com'
        const notify = process.env.ADMIN_EMAIL ?? process.env.ENQUIRY_NOTIFY_EMAIL ?? 'studio@mandakinirao.com'
        const emailPayload = {
          orderRef: paymentId.slice(-8).toUpperCase(),
          customerName: contact ?? '',
          total: amountPaise / 100,
          items,
        }
        const note = orderNotification(emailPayload)
        const conf = orderConfirmation(emailPayload)
        const results = await Promise.allSettled([
          resend.emails.send({ from, to: notify, subject: note.subject, html: note.html }),
          resend.emails.send({ from, to: email, subject: conf.subject, html: conf.html }),
        ])
        results.forEach((r) => {
          if (r.status === 'rejected') console.error('[rzp-webhook] email failed:', r.reason)
        })
      } catch (err) {
        console.error('[rzp-webhook] Resend failed (order recorded):', err)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[rzp-webhook] order processing failed:', err)
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
