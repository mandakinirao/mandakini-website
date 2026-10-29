import { describe, expect, test, vi } from 'vitest'
import { cancelOrder, markDelivered, shipOrder, type CancelDeps, type OrderDeps } from '@/lib/admin/orders'
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

describe('cancelOrder', () => {
  function cancelSetup(o: Record<string, unknown>, shop: Record<string, Record<string, unknown>>, refund?: () => Promise<{ id: string }>) {
    const fake = makeFakeClient({ [o._id as string]: o, ...shop })
    const refundPayment = vi.fn(refund ?? (async () => ({ id: 'rfnd_1' })))
    const sendCancellationEmail = vi.fn(async () => ({ ok: true }))
    const deps = {
      client: fake.client,
      sendShippingUpdate: vi.fn(),
      now: () => NOW,
      refundPayment,
      sendCancellationEmail,
    } as unknown as CancelDeps
    return { ...fake, deps, refundPayment, sendCancellationEmail }
  }

  const shopDoc = (over: Record<string, unknown>) => ({ _id: 'print-1', stock: 2, sold: 3, availabilityStatus: 'available', ...over })

  test('refunds the full amount in paise and cancels in one transaction', async () => {
    const { deps, refundPayment, transactions, sendCancellationEmail } = cancelSetup(order(), { 'print-1': shopDoc({}) })
    const r = await cancelOrder(deps, 'order.order_abc')
    expect(r).toEqual({ ok: true, emailSent: true })
    expect(refundPayment).toHaveBeenCalledWith('pay_123', 480000)
    expect(transactions).toHaveLength(1)
    expect(transactions[0][0]).toEqual({
      id: 'order.order_abc',
      set: { status: 'cancelled', refundId: 'rfnd_1', refundedAt: '2026-10-29T10:00:00.000Z' },
    })
    expect(sendCancellationEmail).toHaveBeenCalledWith(
      { orderNumber: 'MR-2026-0001', customerName: 'Asha Rao', amountTotal: 4800 },
      'asha@example.com'
    )
  })

  test('second cancel does not refund again', async () => {
    const first = cancelSetup(order(), { 'print-1': shopDoc({}) })
    await cancelOrder(first.deps, 'order.order_abc')
    const again = cancelSetup(order({ status: 'cancelled', refundId: 'rfnd_1' }), {})
    const both = vi.fn()
    ;(again.deps as unknown as { refundPayment: typeof both }).refundPayment = both
    const r = await cancelOrder(again.deps, 'order.order_abc')
    expect(r).toEqual({ ok: false, error: 'This order has already been refunded.' })
    expect(first.refundPayment).toHaveBeenCalledTimes(1)
    expect(both).not.toHaveBeenCalled()
  })

  test('already-refunded paid order is not refunded again', async () => {
    const { deps, refundPayment } = cancelSetup(order({ refundId: 'rfnd_1' }), {})
    const r = await cancelOrder(deps, 'order.order_abc')
    expect(r).toEqual({ ok: false, error: 'This order has already been refunded.' })
    expect(refundPayment).not.toHaveBeenCalled()
  })

  test('tracked stock is restored and sold reduced', async () => {
    const { deps, transactions } = cancelSetup(order(), { 'print-1': shopDoc({}) })
    await cancelOrder(deps, 'order.order_abc')
    expect(transactions[0][1]).toEqual({ id: 'print-1', inc: { stock: 1 }, dec: { sold: 1 } })
  })

  test('sold-out print becomes available again', async () => {
    const { deps, transactions } = cancelSetup(order(), { 'print-1': shopDoc({ stock: 0, availabilityStatus: 'soldOut' }) })
    await cancelOrder(deps, 'order.order_abc')
    expect(transactions[0][1]).toEqual({
      id: 'print-1',
      inc: { stock: 1 },
      dec: { sold: 1 },
      set: { availabilityStatus: 'available' },
    })
  })

  test('untracked stock (null) gets no inc or dec', async () => {
    const { deps, transactions } = cancelSetup(order(), { 'print-1': shopDoc({ stock: null, sold: null }) })
    await cancelOrder(deps, 'order.order_abc')
    expect(transactions[0]).toHaveLength(1)
  })

  test('sold lower than quantity is floored at zero', async () => {
    const { deps, transactions } = cancelSetup(
      order({ items: [{ shopItem: { _ref: 'print-1' }, title: 'Dhyanam', quantity: 2, priceAtPurchase: 2400 }] }),
      { 'print-1': shopDoc({ sold: 1 }) }
    )
    await cancelOrder(deps, 'order.order_abc')
    expect(transactions[0][1]).toEqual({ id: 'print-1', inc: { stock: 2 }, set: { sold: 0 } })
  })

  test('Razorpay failure changes nothing and explains why', async () => {
    const { deps, transactions } = cancelSetup(order(), { 'print-1': shopDoc({}) }, async () => {
      throw { error: { description: 'The payment has been fully refunded already' } }
    })
    const r = await cancelOrder(deps, 'order.order_abc')
    expect(r.ok).toBe(false)
    expect((r as { error: string }).error).toContain('The payment has been fully refunded already')
    expect(transactions).toHaveLength(0)
  })

  test('delivered order cannot be cancelled', async () => {
    const { deps, refundPayment } = cancelSetup(order({ status: 'delivered' }), {})
    const r = await cancelOrder(deps, 'order.order_abc')
    expect(r.ok).toBe(false)
    expect(refundPayment).not.toHaveBeenCalled()
  })

  test('order with no payment id cannot be refunded', async () => {
    const { deps, refundPayment } = cancelSetup(order({ razorpayPaymentId: undefined }), {})
    expect(await cancelOrder(deps, 'order.order_abc')).toEqual({ ok: false, error: 'This order has no payment to refund.' })
    expect(refundPayment).not.toHaveBeenCalled()
  })
})
