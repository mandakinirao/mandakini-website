import { expect, test } from 'vitest'
import { ownerNotificationEmail } from '@/lib/emails'

const payload = {
  orderNumber: 'MR-2026-0001',
  customerName: 'Asha Rao',
  customerEmail: 'asha@example.com',
  shippingAddress: '1 Road, Hyderabad',
  items: [{ title: 'Dhyanam', quantity: 1, priceAtPurchase: 4800 }],
  amountTotal: 4800,
}

test('owner email links to the order in /admin when given a URL', () => {
  const url = 'https://www.mandakinirao.com/admin/orders/order.order_abc'
  const { html } = ownerNotificationEmail({ ...payload, adminUrl: url })
  expect(html).toContain(url)
  expect(html).toContain('Open this order')
})

test('owner email has no link without a URL', () => {
  const { html } = ownerNotificationEmail(payload)
  expect(html).not.toContain('Open this order')
  expect(html).not.toContain('/admin/orders/')
})
