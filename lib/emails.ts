/**
 * Order confirmation / owner-notification emails for the Razorpay
 * webhook — plain typographic HTML in the site palette (cream #F5EFE4 /
 * cacao #2C1A0E / terracotta #B8572A — inlined, email clients cannot
 * read CSS tokens). Every send checks Resend's `.error` field, matching
 * the pattern in app/api/enquiry/route.ts (Resend resolves, doesn't
 * throw, on API-level failures).
 */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

export interface OrderEmailItem {
  title: string
  quantity: number
  priceAtPurchase: number
}

export interface OrderEmailPayload {
  orderNumber: string
  customerName: string
  customerEmail: string
  shippingAddress: string
  items: OrderEmailItem[]
  amountTotal: number
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

const itemRows = (items: OrderEmailItem[]) =>
  items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 0;font-size:15px;">${esc(i.title)}</td>
          <td style="padding:6px 0 6px 16px;font-size:15px;">× ${i.quantity}</td>
          <td style="padding:6px 0 6px 16px;font-size:15px;text-align:right;">₹${(i.priceAtPurchase * i.quantity).toLocaleString('en-IN')}</td>
        </tr>`
    )
    .join('')

function orderConfirmationEmail(o: OrderEmailPayload) {
  return {
    subject: `Your order is confirmed — ${o.orderNumber}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;">Thank you${o.customerName ? `, ${esc(o.customerName.split(' ')[0])}` : ''}.</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
        Your order <strong>${esc(o.orderNumber)}</strong> is confirmed. Each print is
        signed and numbered by hand in the Hyderabad studio — a shipping
        confirmation with the waybill number will follow once it is on its way.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${itemRows(o.items)}</table>
      <p style="font-size:16px;margin:0 0 22px;">Total — <strong>₹${o.amountTotal.toLocaleString('en-IN')}</strong></p>
      <p style="font-size:14px;line-height:1.6;color:rgba(44,26,14,0.6);margin:0;">
        Shipping to<br/>${esc(o.shippingAddress).replace(/\n/g, '<br/>')}
      </p>
    `),
  }
}

function ownerNotificationEmail(o: OrderEmailPayload) {
  return {
    subject: `New order — ${o.orderNumber}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;">New order ${esc(o.orderNumber)}</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
        ${esc(o.customerName) || 'A collector'} (${esc(o.customerEmail)}) just placed an order.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 22px;">${itemRows(o.items)}</table>
      <p style="font-size:16px;margin:0 0 22px;">Total — <strong>₹${o.amountTotal.toLocaleString('en-IN')}</strong></p>
      <p style="font-size:14px;line-height:1.6;color:rgba(44,26,14,0.6);margin:0;">
        Shipping to<br/>${esc(o.shippingAddress).replace(/\n/g, '<br/>')}
      </p>
    `),
  }
}

export interface ShippingEmailPayload {
  orderNumber: string
  customerName: string
  awbNumber: string
  courierName: string
}

function shippingUpdateEmail(o: ShippingEmailPayload) {
  return {
    subject: `Your order has shipped — ${o.orderNumber}`,
    html: wrap(`
      <h1 style="font-size:26px;font-weight:normal;margin:0 0 18px;">On its way${o.customerName ? `, ${esc(o.customerName.split(' ')[0])}` : ''}.</h1>
      <p style="font-size:16px;line-height:1.6;margin:0 0 22px;">
        Order <strong>${esc(o.orderNumber)}</strong> has shipped via <strong>${esc(o.courierName)}</strong>.
      </p>
      <p style="font-size:16px;margin:0;">Tracking / AWB — <strong>${esc(o.awbNumber)}</strong></p>
    `),
  }
}

interface SendResult {
  ok: boolean
  error?: unknown
}

async function send(from: string, to: string, subject: string, html: string): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[emails] RESEND_API_KEY missing — send skipped:', subject)
    return { ok: false, error: 'RESEND_API_KEY missing' }
  }
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const result = await resend.emails.send({ from, to, subject, html })
    if (result.error) {
      console.error('[emails] send failed:', subject, result.error)
      return { ok: false, error: result.error }
    }
    return { ok: true }
  } catch (err) {
    console.error('[emails] Resend threw:', subject, err)
    return { ok: false, error: err }
  }
}

/** To the customer — order confirmed. */
export async function sendOrderConfirmation(payload: OrderEmailPayload): Promise<SendResult> {
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error('[emails] EMAIL_FROM not set — cannot send order confirmation')
    return { ok: false, error: 'EMAIL_FROM missing' }
  }
  const { subject, html } = orderConfirmationEmail(payload)
  return send(from, payload.customerEmail, subject, html)
}

/** To Mandakini — a new order landed. */
export async function sendOwnerNotification(payload: OrderEmailPayload): Promise<SendResult> {
  const from = process.env.EMAIL_FROM
  const to = process.env.MANDAKINI_ORDER_EMAIL
  if (!from || !to) {
    console.error('[emails] EMAIL_FROM / MANDAKINI_ORDER_EMAIL not set — cannot send owner notification')
    return { ok: false, error: 'EMAIL_FROM/MANDAKINI_ORDER_EMAIL missing' }
  }
  const { subject, html } = ownerNotificationEmail(payload)
  return send(from, to, subject, html)
}

/** To the customer — order shipped. */
export async function sendShippingUpdate(payload: ShippingEmailPayload, customerEmail: string): Promise<SendResult> {
  const from = process.env.EMAIL_FROM
  if (!from) {
    console.error('[emails] EMAIL_FROM not set — cannot send shipping update')
    return { ok: false, error: 'EMAIL_FROM missing' }
  }
  const { subject, html } = shippingUpdateEmail(payload)
  return send(from, customerEmail, subject, html)
}
