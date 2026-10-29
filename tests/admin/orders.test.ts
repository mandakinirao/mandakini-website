import { describe, expect, test, vi } from 'vitest'
import { markDelivered, shipOrder, type OrderDeps } from '@/lib/admin/orders'
import { makeFakeClient } from './fake-sanity'

const NOW = new Date('2026-10-29T10:00:00.000Z')

const order = (over: Record<string, unknown> = {}) => ({
  _id: 'order.order_abc',
  orderNumber: 'MR-2026-0001',
  status: 'paid',
  customerName: 'Asha Rao',
  customerEmail: 'asha@example.com',
  customerPhone: '9999999999',
  shippingAddress: '1 Road, Hyderabad',
  items: [{ shopItem: { _ref: 'print-1' }, title: 'Dhyanam', quantity: 1, priceAtPurchase: 4800 }],
  amountTotal: 4800,
  razorpayPaymentId: 'pay_123',
  shippedEmailSent: false,
  createdAt: '2026-10-28T10:00:00.000Z',
  ...over,
})

function setup(o = order(), emailOk = true) {
  const fake = makeFakeClient({ [o._id as string]: o })
  const sendShippingUpdate = vi.fn(async () => (emailOk ? { ok: true } : { ok: false, error: 'x' }))
  const deps = { client: fake.client, sendShippingUpdate, now: () => NOW } as unknown as OrderDeps
  return { ...fake, deps, sendShippingUpdate }
}

describe('shipOrder', () => {
  test('ships a paid order with one patch and one email', async () => {
    const { deps, patches, sendShippingUpdate } = setup()
    const r = await shipOrder(deps, 'order.order_abc', { courierName: 'Delhivery', awbNumber: 'AWB123' })
    expect(r).toEqual({ ok: true, emailSent: true })
    expect(patches).toEqual([
      {
        id: 'order.order_abc',
        set: {
          status: 'shipped',
          courierName: 'Delhivery',
          awbNumber: 'AWB123',
          shippedAt: '2026-10-29T10:00:00.000Z',
          shippedEmailSent: true,
        },
      },
    ])
    expect(sendShippingUpdate).toHaveBeenCalledTimes(1)
    expect(sendShippingUpdate).toHaveBeenCalledWith(
      { orderNumber: 'MR-2026-0001', customerName: 'Asha Rao', awbNumber: 'AWB123', courierName: 'Delhivery' },
      'asha@example.com'
    )
  })

  test('trims courier and tracking number', async () => {
    const { deps, patches } = setup()
    await shipOrder(deps, 'order.order_abc', { courierName: '  Delhivery ', awbNumber: ' AWB123 ' })
    expect(patches[0].set).toMatchObject({ courierName: 'Delhivery', awbNumber: 'AWB123' })
  })

  test('empty tracking number is rejected without side effects', async () => {
    const { deps, patches, sendShippingUpdate } = setup()
    const r = await shipOrder(deps, 'order.order_abc', { courierName: 'Delhivery', awbNumber: '  ' })
    expect(r).toEqual({ ok: false, error: 'Add the tracking number' })
    expect(patches).toHaveLength(0)
    expect(sendShippingUpdate).not.toHaveBeenCalled()
  })

  test('empty courier is rejected', async () => {
    const { deps } = setup()
    const r = await shipOrder(deps, 'order.order_abc', { courierName: '', awbNumber: 'AWB123' })
    expect(r).toEqual({ ok: false, error: 'Add the courier name' })
  })

  test('already shipped order is refused', async () => {
    const { deps, patches } = setup(order({ status: 'shipped' }))
    const r = await shipOrder(deps, 'order.order_abc', { courierName: 'Delhivery', awbNumber: 'AWB123' })
    expect(r).toEqual({ ok: false, error: "This order isn't waiting to be shipped." })
    expect(patches).toHaveLength(0)
  })

  test('email failure still ships, flag stays false', async () => {
    const { deps, patches } = setup(order(), false)
    const r = await shipOrder(deps, 'order.order_abc', { courierName: 'Delhivery', awbNumber: 'AWB123' })
    expect(r).toEqual({ ok: true, emailSent: false })
    expect(patches[0].set).toMatchObject({ status: 'shipped', shippedEmailSent: false })
  })
})

describe('markDelivered', () => {
  test('shipped order becomes delivered', async () => {
    const { deps, patches } = setup(order({ status: 'shipped' }))
    expect(await markDelivered(deps, 'order.order_abc')).toEqual({ ok: true })
    expect(patches).toEqual([
      { id: 'order.order_abc', set: { status: 'delivered', deliveredAt: '2026-10-29T10:00:00.000Z' } },
    ])
  })

  test('paid order cannot be marked delivered', async () => {
    const { deps, patches } = setup()
    const r = await markDelivered(deps, 'order.order_abc')
    expect(r.ok).toBe(false)
    expect(patches).toHaveLength(0)
  })
})
