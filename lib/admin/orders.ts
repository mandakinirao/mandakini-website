import type { SanityClient } from 'next-sanity'
import type { sendShippingUpdate } from '@/lib/emails'

export type OrderStatus = 'paid' | 'shipped' | 'delivered' | 'cancelled'

export const ORDER_TABS = [
  { key: 'to-ship', label: 'To ship', status: 'paid' },
  { key: 'shipped', label: 'Shipped', status: 'shipped' },
  { key: 'completed', label: 'Completed', status: 'delivered' },
  { key: 'cancelled', label: 'Cancelled and refunded', status: 'cancelled' },
] as const

export const canShip = (s: OrderStatus) => s === 'paid'
export const canDeliver = (s: OrderStatus) => s === 'shipped'
export const canCancel = (s: OrderStatus) => s === 'paid' || s === 'shipped'

export interface AdminOrderItem {
  shopItem?: { _ref: string }
  title: string
  quantity: number
  priceAtPurchase: number
}

export interface AdminOrder {
  _id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone: string
  shippingAddress: string
  items: AdminOrderItem[]
  amountTotal: number
  razorpayPaymentId?: string
  courierName?: string
  awbNumber?: string
  shippedEmailSent?: boolean
  refundId?: string
  refundedAt?: string
  shippedAt?: string
  deliveredAt?: string
  createdAt: string
}

export interface OrderDeps {
  client: Pick<SanityClient, 'fetch' | 'patch' | 'transaction'>
  sendShippingUpdate: typeof sendShippingUpdate
  now: () => Date
}

type Fail = { ok: false; error: string }

export const ORDER_FIELDS = `
  _id, orderNumber, "status": coalesce(status, "paid"), customerName, customerEmail,
  customerPhone, shippingAddress, items[]{ shopItem, title, quantity, priceAtPurchase },
  amountTotal, razorpayPaymentId, courierName, awbNumber, shippedEmailSent,
  refundId, refundedAt, shippedAt, deliveredAt, createdAt
`

export function fetchOrder(client: OrderDeps['client'], id: string): Promise<AdminOrder | null> {
  return client.fetch<AdminOrder | null>(`*[_type == "order" && _id == $id][0]{${ORDER_FIELDS}}`, { id })
}

function shippingPayload(o: AdminOrder, courierName: string, awbNumber: string) {
  return { orderNumber: o.orderNumber, customerName: o.customerName ?? '', awbNumber, courierName }
}

export async function shipOrder(
  deps: OrderDeps,
  orderId: string,
  input: { courierName: string; awbNumber: string }
): Promise<{ ok: true; emailSent: boolean } | Fail> {
  const courierName = input.courierName.trim()
  const awbNumber = input.awbNumber.trim()
  if (!courierName) return { ok: false, error: 'Add the courier name' }
  if (!awbNumber) return { ok: false, error: 'Add the tracking number' }
  if (courierName.length > 100 || awbNumber.length > 100) {
    return { ok: false, error: 'That looks too long. Check the courier and tracking number.' }
  }

  const order = await fetchOrder(deps.client, orderId)
  if (!order) return { ok: false, error: 'This order could not be found.' }
  if (!canShip(order.status)) return { ok: false, error: "This order isn't waiting to be shipped." }

  // Email first, then ONE patch carrying the flag — so the legacy Sanity
  // ship-notify webhook (fired by this patch) sees shippedEmailSent: true
  // and skips, instead of sending a second email.
  const email = order.customerEmail
    ? await deps.sendShippingUpdate(shippingPayload(order, courierName, awbNumber), order.customerEmail)
    : { ok: false }

  await deps.client
    .patch(orderId)
    .set({
      status: 'shipped',
      courierName,
      awbNumber,
      shippedAt: deps.now().toISOString(),
      shippedEmailSent: email.ok,
    })
    .commit()

  return { ok: true, emailSent: email.ok }
}

export async function markDelivered(deps: OrderDeps, orderId: string): Promise<{ ok: true } | Fail> {
  const order = await fetchOrder(deps.client, orderId)
  if (!order) return { ok: false, error: 'This order could not be found.' }
  if (!canDeliver(order.status)) return { ok: false, error: "This order hasn't been shipped yet." }
  await deps.client
    .patch(orderId)
    .set({ status: 'delivered', deliveredAt: deps.now().toISOString() })
    .commit()
  return { ok: true }
}

export async function resendShippingEmail(
  deps: OrderDeps,
  orderId: string
): Promise<{ ok: boolean; error?: string }> {
  const order = await fetchOrder(deps.client, orderId)
  if (!order) return { ok: false, error: 'This order could not be found.' }
  if (order.status !== 'shipped' || !order.awbNumber) {
    return { ok: false, error: "This order hasn't been shipped yet." }
  }
  if (order.shippedEmailSent) return { ok: true }
  const email = await deps.sendShippingUpdate(
    shippingPayload(order, order.courierName ?? '', order.awbNumber),
    order.customerEmail
  )
  if (!email.ok) return { ok: false, error: "The email still didn't send. Try again later." }
  await deps.client.patch(orderId).set({ shippedEmailSent: true }).commit()
  return { ok: true }
}

export interface CancelDeps extends OrderDeps {
  refundPayment: (paymentId: string, amountPaise: number) => Promise<{ id: string }>
  sendCancellationEmail: (
    payload: { orderNumber: string; customerName: string; amountTotal: number },
    customerEmail: string
  ) => Promise<{ ok: boolean }>
}

interface StockDoc {
  _id: string
  stock?: number | null
  sold?: number | null
  availabilityStatus?: string
}

/** Full refund via Razorpay, then cancel + restock in one transaction, then email. */
export async function cancelOrder(
  deps: CancelDeps,
  orderId: string
): Promise<{ ok: true; emailSent: boolean } | Fail> {
  const order = await fetchOrder(deps.client, orderId)
  if (!order) return { ok: false, error: 'This order could not be found.' }
  if (order.refundId) return { ok: false, error: 'This order has already been refunded.' }
  if (!canCancel(order.status)) return { ok: false, error: "This order can't be cancelled any more." }
  if (!order.razorpayPaymentId) return { ok: false, error: 'This order has no payment to refund.' }

  let refundId: string
  try {
    refundId = (await deps.refundPayment(order.razorpayPaymentId, Math.round(order.amountTotal * 100))).id
  } catch (err) {
    const { RazorpayConfigError, safeCheckoutError } = await import('@/lib/razorpay')
    if (err instanceof RazorpayConfigError) {
      return { ok: false, error: "Refunds aren't set up on this website yet, so nothing was changed." }
    }
    return { ok: false, error: `Razorpay could not refund this payment: ${safeCheckoutError(err).message}` }
  }

  const qtyById = new Map<string, number>()
  for (const i of order.items ?? []) {
    if (i.shopItem?._ref) qtyById.set(i.shopItem._ref, (qtyById.get(i.shopItem._ref) ?? 0) + i.quantity)
  }
  const shopDocs = qtyById.size
    ? await deps.client.fetch<StockDoc[]>(`*[_id in $ids]{ _id, stock, sold, availabilityStatus }`, {
        ids: Array.from(qtyById.keys()),
      })
    : []

  let tx = deps.client.transaction().patch(orderId, (p) =>
    p.set({ status: 'cancelled', refundId, refundedAt: deps.now().toISOString() })
  )
  for (const doc of shopDocs ?? []) {
    const qty = qtyById.get(doc._id) ?? 0
    const tracked = typeof doc.stock === 'number'
    const hasSold = typeof doc.sold === 'number'
    if (!tracked && !hasSold) continue
    tx = tx.patch(doc._id, (p) => {
      let b = p
      if (tracked) b = b.inc({ stock: qty })
      if (hasSold) b = (doc.sold as number) >= qty ? b.dec({ sold: qty }) : b.set({ sold: 0 })
      if (doc.availabilityStatus === 'soldOut') b = b.set({ availabilityStatus: 'available' })
      return b
    })
  }
  await tx.commit()

  const email = order.customerEmail
    ? await deps.sendCancellationEmail(
        { orderNumber: order.orderNumber, customerName: order.customerName ?? '', amountTotal: order.amountTotal },
        order.customerEmail
      )
    : { ok: false }
  return { ok: true, emailSent: email.ok }
}
