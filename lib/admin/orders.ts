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
