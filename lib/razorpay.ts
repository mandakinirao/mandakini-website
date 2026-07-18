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
  keyId: string
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
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret || lines.length === 0) return null

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
