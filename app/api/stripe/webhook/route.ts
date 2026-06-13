import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { orderConfirmation, orderNotification } from '@/emails/orderEmails'

/**
 * Stripe webhook — verifies the signature, and on
 * checkout.session.completed creates the Sanity order, decrements
 * stock, and sends the confirmation email through the existing Resend
 * setup.
 *
 * Idempotent by construction: the order document _id is derived from
 * the checkout session id (`order.cs_…`), so a replayed event finds the
 * existing document and stops before any side effects repeat.
 */
export async function POST(req: NextRequest) {
  const stripe = await getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 400 })
  }

  const payload = await req.text()
  let event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, secret)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object
  const sessionId = session.id

  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.SANITY_API_WRITE_TOKEN
  ) {
    console.error('[webhook] Sanity write env missing — order NOT recorded:', sessionId)
    return NextResponse.json({ error: 'Storage not configured.' }, { status: 503 })
  }

  let items: { id: string; slug: string; qty: number; amount: number }[] = []
  try {
    items = JSON.parse(session.metadata?.items ?? '[]')
  } catch {
    console.error('[webhook] unreadable items metadata for', sessionId)
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

    // Deterministic id ⇒ replays can't duplicate. Sanity ids allow [a-z0-9._-].
    const orderId = `order.${sessionId.toLowerCase().replace(/[^a-z0-9._-]/g, '-')}`
    const existing = await client.fetch<string | null>(
      `*[_id == $id][0]._id`,
      { id: orderId }
    )
    if (existing) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    await client.create({
      _id: orderId,
      _type: 'order',
      orderId: typeof session.payment_intent === 'string' ? session.payment_intent : sessionId,
      stripeSessionId: sessionId,
      customerName: session.customer_details?.name ?? '',
      customerEmail: session.customer_details?.email ?? '',
      shippingAddress: {
        line1: session.customer_details?.address?.line1 ?? '',
        line2: session.customer_details?.address?.line2 ?? '',
        city: session.customer_details?.address?.city ?? '',
        state: session.customer_details?.address?.state ?? '',
        pincode: session.customer_details?.address?.postal_code ?? '',
        country: session.customer_details?.address?.country ?? 'India',
      },
      items: items.map((i) => ({
        _key: i.slug,
        // placeholder data carries slug-as-id (no Sanity document to reference)
        shopItemRef:
          i.id && i.id !== i.slug
            ? { _type: 'reference', _ref: i.id }
            : undefined,
        quantity: i.qty,
        price: i.amount,
      })),
      totalAmount: (session.amount_total ?? 0) / 100,
      paymentStatus: 'paid',
      fulfillmentStatus: 'new',
      orderDate: new Date().toISOString(),
    })

    // Stock decrement — once, only on first processing of this session.
    for (const i of items) {
      if (!i.id || i.id === i.slug) continue // placeholder data has no document
      try {
        await client.patch(i.id).dec({ stock: i.qty }).commit()
      } catch (err) {
        console.error('[webhook] stock decrement failed for', i.slug, err)
      }
    }

    // Emails ride the existing Resend setup; failure never fails the webhook.
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend')
        const resend = new Resend(process.env.RESEND_API_KEY)
        const from = process.env.ENQUIRY_FROM_EMAIL ?? 'studio@mandakinirao.com'
        const notify =
          process.env.ADMIN_EMAIL ??
          process.env.ENQUIRY_NOTIFY_EMAIL ??
          'studio@mandakinirao.com'
        const customer = session.customer_details?.email
        const payload2 = {
          orderRef: sessionId.slice(-8).toUpperCase(),
          customerName: session.customer_details?.name ?? '',
          total: (session.amount_total ?? 0) / 100,
          items,
        }
        const note = orderNotification(payload2)
        const sends = [
          resend.emails.send({ from, to: notify, subject: note.subject, html: note.html }),
        ]
        if (customer) {
          const conf = orderConfirmation(payload2)
          sends.push(
            resend.emails.send({ from, to: customer, subject: conf.subject, html: conf.html })
          )
        }
        const results = await Promise.allSettled(sends)
        results.forEach((r) => {
          if (r.status === 'rejected')
            console.error('[webhook] order email failed:', r.reason)
        })
      } catch (err) {
        console.error('[webhook] Resend failed (order recorded):', err)
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] order processing failed:', err)
    // Non-2xx so Stripe retries — the deterministic _id keeps retries safe.
    return NextResponse.json({ error: 'Processing failed.' }, { status: 500 })
  }
}
