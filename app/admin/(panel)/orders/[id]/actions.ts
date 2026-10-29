'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/admin/auth'
import { markDelivered, resendShippingEmail, shipOrder, type OrderDeps } from '@/lib/admin/orders'
import { getAdminClient, revalidateSite } from '@/lib/admin/sanity'
import { sendShippingUpdate } from '@/lib/emails'

export interface ActionState {
  ok?: boolean
  message?: string
  error?: string
}

function deps(): OrderDeps {
  return { client: getAdminClient(), sendShippingUpdate, now: () => new Date() }
}

function refresh() {
  revalidateSite()
  revalidatePath('/admin', 'layout')
}

export async function shipAction(orderId: string, firstName: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin()
  const r = await shipOrder(deps(), orderId, {
    courierName: String(form.get('courierName') ?? ''),
    awbNumber: String(form.get('awbNumber') ?? ''),
  })
  if (!r.ok) return { error: r.error }
  refresh()
  return r.emailSent
    ? { ok: true, message: `Marked as shipped. ${firstName} has been emailed the tracking number.` }
    : { ok: true, message: "Marked as shipped, but the email didn't send." }
}

export async function deliverAction(orderId: string): Promise<ActionState> {
  await requireAdmin()
  const r = await markDelivered(deps(), orderId)
  if (!r.ok) return { error: r.error }
  refresh()
  return { ok: true, message: 'Marked as delivered.' }
}

export async function resendAction(orderId: string): Promise<ActionState> {
  await requireAdmin()
  const r = await resendShippingEmail(deps(), orderId)
  if (!r.ok) return { error: r.error }
  refresh()
  return { ok: true, message: 'Shipping email sent.' }
}

export async function cancelAction(orderId: string): Promise<ActionState> {
  await requireAdmin()
  const [{ cancelOrder }, { refundPayment }, { sendCancellationEmail }] = await Promise.all([
    import('@/lib/admin/orders'),
    import('@/lib/razorpay'),
    import('@/lib/emails'),
  ])
  const r = await cancelOrder({ ...deps(), refundPayment, sendCancellationEmail }, orderId)
  if (!r.ok) return { error: r.error }
  refresh()
  return {
    ok: true,
    message: r.emailSent
      ? 'Order cancelled. The refund is on its way to the buyer.'
      : "Order cancelled and refunded, but the email to the buyer didn't send.",
  }
}
