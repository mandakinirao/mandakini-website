/**
 * Private Collection enquiry emails — plain typographic HTML in the
 * site palette (cream #F5EFE4 / near-black #2C1A0E / terracotta
 * #B8572A). No images, no private-collection content of any kind.
 * ALL COPY IS PLACEHOLDER — pending client approval.
 */

export interface EnquiryPayload {
  name: string
  email: string
  phone?: string
  message?: string
  budgetRange?: string
  submittedAt: string
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

/** To Mandakini — a new enquiry landed. */
export function enquiryNotification(e: EnquiryPayload) {
  return {
    subject: `Private Collection enquiry — ${e.name}`,
    html: wrap(`
      <h1 style="font-size:24px;font-weight:normal;margin:0 0 20px;">A new Private Collection enquiry</h1>
      <table style="font-size:15px;line-height:1.8;border-collapse:collapse;">
        <tr><td style="padding-right:20px;color:rgba(44,26,14,0.6);">Name</td><td>${e.name}</td></tr>
        <tr><td style="padding-right:20px;color:rgba(44,26,14,0.6);">Email</td><td>${e.email}</td></tr>
        ${e.phone ? `<tr><td style="padding-right:20px;color:rgba(44,26,14,0.6);">Phone</td><td>${e.phone}</td></tr>` : ''}
        ${e.budgetRange ? `<tr><td style="padding-right:20px;color:rgba(44,26,14,0.6);">Budget</td><td>${e.budgetRange}</td></tr>` : ''}
        <tr><td style="padding-right:20px;color:rgba(44,26,14,0.6);">When</td><td>${e.submittedAt}</td></tr>
      </table>
      ${
        e.message
          ? `<p style="font-size:15px;line-height:1.7;margin:24px 0 0;"><em style="color:rgba(44,26,14,0.6);">What draws them:</em><br/>${e.message}</p>`
          : ''
      }
    `),
  }
}

/** To the enquirer — warm, brief confirmation. PLACEHOLDER COPY. */
export function enquiryConfirmation(e: EnquiryPayload) {
  return {
    subject: 'The Private Collection — thank you',
    html: wrap(`
      <h1 style="font-size:24px;font-weight:normal;margin:0 0 20px;">Thank you, ${e.name}.</h1>
      <p style="font-size:16px;line-height:1.8;margin:0 0 16px;">
        Your note has reached the studio. Mandakini shares the Private
        Collection personally, and she will write to you herself —
        usually within a few days.
      </p>
      <p style="font-size:16px;line-height:1.8;margin:0;">Warmly,<br/>The studio of Mandakini Rao</p>
    `),
  }
}
