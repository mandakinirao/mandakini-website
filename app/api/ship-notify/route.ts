import { NextRequest, NextResponse } from 'next/server'
import { sendShippingUpdate } from '@/lib/emails'

interface ShipNotifyPayload {
  _id?: string
  orderNumber?: string
  customerName?: string
  customerEmail?: string
  status?: string
  awbNumber?: string
  courierName?: string
  shippedEmailSent?: boolean
}

/**
 * Sanity webhook — fires on order document changes. Sends the shipping
 * email exactly once: only when status is "shipped", an AWB has been
 * entered, and shippedEmailSent is still false. Checking
 * shippedEmailSent first makes the webhook's own follow-up patch (which
 * re-triggers this same webhook) a clean no-op instead of a resend.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 503 })
  }

  const provided = req.headers.get('x-webhook-secret')
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  let body: ShipNotifyPayload
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 })
  }

  const { _id, orderNumber, customerName, customerEmail, status, awbNumber, courierName, shippedEmailSent } = body

  if (shippedEmailSent) {
    return NextResponse.json({ skipped: 'already sent' })
  }
  if (status !== 'shipped' || !awbNumber) {
    return NextResponse.json({ skipped: 'not ready to notify' })
  }
  if (!_id || !customerEmail || !orderNumber) {
    console.error('[ship-notify] missing required fields on payload:', body)
    return NextResponse.json({ error: 'Incomplete order payload.' }, { status: 400 })
  }

  const result = await sendShippingUpdate(
    { orderNumber, customerName: customerName ?? '', awbNumber, courierName: courierName ?? '' },
    customerEmail
  )
  if (!result.ok) {
    console.error('[ship-notify] send failed:', result.error)
    return NextResponse.json({ error: 'Email failed to send.' }, { status: 502 })
  }

  if (
    !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    !process.env.SANITY_API_WRITE_TOKEN
  ) {
    console.error('[ship-notify] Sanity write env missing — shippedEmailSent NOT patched for', _id)
    return NextResponse.json({ error: 'Storage not configured.' }, { status: 503 })
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
    await client.patch(_id).set({ shippedEmailSent: true }).commit()
  } catch (err) {
    console.error('[ship-notify] patch failed (email already sent) for', _id, err)
    return NextResponse.json({ error: 'Patch failed after send.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
