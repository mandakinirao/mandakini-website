import type { PurchasableItem } from '@/lib/home-data'

export interface CheckoutLine {
  item: PurchasableItem
  quantity: number
}

export interface RazorpayOrderResult {
  orderId: string
  amount: number  // paise
  currency: string
  keyId: string
}

export async function createRazorpayOrder(
  lines: CheckoutLine[]
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
      items: JSON.stringify(
        lines.map(({ item, quantity }) => ({
          id: item.id,
          slug: item.slug,
          qty: quantity,
          amount: item.amount,
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
