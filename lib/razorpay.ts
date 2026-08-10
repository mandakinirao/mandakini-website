import type { PurchasableItem } from '@/lib/home-data'

export interface CheckoutLine {
  item: PurchasableItem
  quantity: number
}

export interface CheckoutCustomer {
  name: string
  email: string
  phone: string
  address: string
}

export interface RazorpayOrderResult {
  orderId: string
  amount: number  // paise
  currency: string
  // Returned from the server-side RAZORPAY_KEY_ID, not the unused
  // NEXT_PUBLIC_RAZORPAY_KEY_ID env var — that public var is set in
  // Vercel but intentionally not read anywhere; don't wire it up here,
  // it would risk the two falling out of sync.
  keyId: string
}

/** Thrown when a required Razorpay env var is missing/empty — distinct
 *  from a business failure (e.g. empty cart), which returns null instead.
 *  Lets the route's catch block report exactly which var is absent. */
export class RazorpayConfigError extends Error {
  constructor(missingVar: string) {
    super(`${missingVar} is not configured.`)
    this.name = 'RazorpayConfigError'
  }
}

/**
 * Razorpay order notes: max 15 keys, each value capped near 256 chars —
 * customer fields go in as separate keys (not one JSON blob) so a long
 * address can't silently truncate a sibling field. Item pricing is
 * intentionally NOT included here: the webhook re-fetches title/price
 * from Sanity at capture time, so only id/slug/qty travel in notes.
 */
export async function createRazorpayOrder(
  lines: CheckoutLine[],
  customer: CheckoutCustomer
): Promise<RazorpayOrderResult | null> {
  // .trim() — values pasted into the Vercel UI frequently carry a
  // trailing newline, which fails Razorpay's auth header with a
  // misleading "Authentication failed" rather than a config error.
  const keyId = process.env.RAZORPAY_KEY_ID?.trim()
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim()
  if (!keyId) throw new RazorpayConfigError('RAZORPAY_KEY_ID')
  if (!keySecret) throw new RazorpayConfigError('RAZORPAY_KEY_SECRET')
  if (lines.length === 0) return null

  const Razorpay = (await import('razorpay')).default
  const client = new Razorpay({ key_id: keyId, key_secret: keySecret })

  const totalINR = lines.reduce(
    (sum, { item, quantity }) => sum + item.amount * quantity,
    0
  )

  const order = await client.orders.create({
    amount: Math.round(totalINR * 100), // paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}`,
    notes: {
      customerName: customer.name.slice(0, 256),
      customerEmail: customer.email.slice(0, 256),
      customerPhone: customer.phone.slice(0, 256),
      shippingAddress: customer.address.slice(0, 256),
      items: JSON.stringify(
        lines.map(({ item, quantity }) => ({
          id: item.id,
          slug: item.slug,
          qty: quantity,
        }))
      ),
    },
  })

  return {
    orderId: order.id,
    amount: Number(order.amount),
    currency: order.currency,
    keyId,
  }
}

export interface CheckoutErrorDetails {
  message: string
  code?: string
}

/**
 * Extracts a safe-to-return message/code from a checkout failure, for the
 * route's response body (server logs still get the full error via
 * console.error — this is only what reaches the client).
 *
 * Handles two shapes: the Razorpay SDK's `{ error: { description, code } }`,
 * and a plain Error (including RazorpayConfigError, whose .message already
 * names the missing var).
 *
 * Guard: never let a key or secret reach the client, even nested inside an
 * error object — Razorpay key IDs always start with "rzp_", so anything
 * matching that prefix is redacted before the message leaves this function,
 * regardless of which branch produced it.
 */
export function safeCheckoutError(err: unknown): CheckoutErrorDetails {
  let message = 'Checkout is unavailable right now.'
  let code: string | undefined

  if (err && typeof err === 'object') {
    const e = err as { error?: { description?: unknown; code?: unknown }; message?: unknown }
    if (e.error && typeof e.error.description === 'string') {
      message = e.error.description
      if (typeof e.error.code === 'string') code = e.error.code
    } else if (typeof e.message === 'string') {
      message = e.message
    }
  }

  const redact = (s: string) => s.replace(/rzp_\S*/gi, '[redacted]')
  return { message: redact(message), code: code ? redact(code) : undefined }
}
