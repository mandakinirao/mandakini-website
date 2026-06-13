/**
 * Order emails — plain typographic HTML in the site palette (cream
 * #F5EFE4 / near-black #2C1A0E / terracotta #B8572A — email clients
 * cannot read CSS tokens, so values are inlined to match globals.css).
 * ALL COPY IS PLACEHOLDER — pending client approval.
 */

export interface OrderEmailPayload {
  orderRef: string
  customerName: string
  total: number
  items: { slug: string; qty: number; amount: number }[]
}

const wrap = (body: string) => `
  <div style="background:#F5EFE4;padding:48px 24px;font-family:Georgia,'Times New Roman',serif;color:#2C1A0E;">
    <div style="max-width:560px;margin:0 auto;">
      <p style="font-size:12px;letter-spacing:0.3em;text-transform:uppercase;color:#B8572A;margin:0 0 28px;">Mandakini Rao — Hyderabad</p>
      ${body}
      <hr style="border:none;border-top:1px solid rgba(44,26,14,0.18);margin:36px 0 16px;" />
      <p style="font-size:12px;color:rgba(44,26,14,0.6);margin:0;">Painted in Hyderabad · mandakinirao.com</p>
    </div>
  </div>
`

const itemRows = (items: OrderEmailPayload['items']) =>
  items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;font-size:15px;">${i.slug.replace(/-/g, ' ')}</td>
          <td style="padding:6px 0 6px 16px;font-size:15px;">× ${i.qty}</td>
          <td style="padding:6px 0 6px 16px;font-size:15px;text-align:right;">₹${(i.amount * i.qty).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('')

/** To the customer — order confirmed. */
export function orderConfirmation(o: OrderEmailPayload) {
  return {
    subject: 'Your order is confirmed — Mandakini Rao',
    html: wrap(`
      <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;">Thank you${o.customerName ? `, ${o.customerName.split(' ')[0]}` : ''}.</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
        Your order <strong>${o.orderRef}</strong> is confirmed. Each print is
        signed and numbered by hand in the Hyderabad studio — a shipping
        confirmation with the waybill number will follow once it is on its way.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${itemRows(o.items)}</table>
      <p style="font-size:16px;margin:0;">Total — <strong>₹${o.total.toLocaleString('en-IN')}</strong></p>
    `),
  }
}

/** To Mandakini — a new order landed. */
export function orderNotification(o: OrderEmailPayload) {
  return {
    subject: 'New order received',
    html: wrap(`
      <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;">New order ${o.orderRef}</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
        ${o.customerName || 'A collector'} just placed an order. Full details
        (shipping address, items) are on the order document in the Studio.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${itemRows(o.items)}</table>
      <p style="font-size:16px;margin:0;">Total — <strong>₹${o.total.toLocaleString('en-IN')}</strong></p>
    `),
  }
}
