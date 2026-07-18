import { NextRequest, NextResponse } from 'next/server'
import { enquiryConfirmation, enquiryNotification } from '@/emails/enquiryEmails'
import { checkRateLimit } from '@/lib/rate-limit'
import { originAllowed } from '@/lib/csrf'

const MIN_FILL_MS = 3000

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // CSRF — reject requests from other origins
  if (!originAllowed(req)) {
    return NextResponse.json({ ok: false, error: 'Forbidden.' }, { status: 403 })
  }

  // Brute-force: 5 submissions per IP per 10 minutes
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  const rl = checkRateLimit(`enquiry:${ip}`, 5, 10 * 60_000)
  if (rl.limited) {
    return NextResponse.json(
      { ok: false, error: 'Too many requests — please try again later.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 })
  }

  // Honeypot ("website") and minimum fill time: bots get a quiet
  // success so they learn nothing.
  const startedAt = Number(body.startedAt)
  if (
    (typeof body.website === 'string' && body.website.length > 0) ||
    !Number.isFinite(startedAt) ||
    Date.now() - startedAt < MIN_FILL_MS
  ) {
    return NextResponse.json({ ok: true })
  }

  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const phone = String(body.phone ?? '').trim()
  const message = String(body.message ?? '').trim().slice(0, 2000)
  const budgetRange = String(body.budgetRange ?? '').trim()

  if (!name || name.length > 120) {
    return NextResponse.json({ ok: false, error: 'Please share your name.' }, { status: 400 })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'That email doesn’t look right.' }, { status: 400 })
  }

  const submittedAt = new Date().toISOString()
  const payload = { name, email, phone, message, budgetRange, submittedAt }

  // 1 — Sanity write (skipped gracefully when env isn't configured).
  if (
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID &&
    process.env.SANITY_API_WRITE_TOKEN
  ) {
    try {
      const { createClient } = await import('next-sanity')
      const writeClient = createClient({
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
        apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-01-01',
        token: process.env.SANITY_API_WRITE_TOKEN,
        useCdn: false,
      })
      await writeClient.create({
        _type: 'enquiry',
        ...payload,
        status: 'new',
      })
    } catch (err) {
      console.error('[enquiry] Sanity write failed:', err)
      return NextResponse.json(
        { ok: false, error: 'Something went wrong — please try again.' },
        { status: 500 }
      )
    }
  } else {
    console.warn('[enquiry] Sanity env missing — enquiry logged only:', payload)
  }

  // 2 — Emails. The Sanity write above already succeeded, so a failure
  // here is reported to the visitor but doesn't mean the enquiry was lost.
  if (process.env.RESEND_API_KEY) {
    const from = process.env.EMAIL_FROM
    const to = process.env.MANDAKINI_ORDER_EMAIL
    if (!from || !to) {
      console.error('[enquiry] EMAIL_FROM / MANDAKINI_ORDER_EMAIL not set — cannot send email')
      return NextResponse.json(
        { ok: false, error: 'Your message was saved, but email is misconfigured — please reach out directly in the meantime.' },
        { status: 500 }
      )
    }
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)
      const note = enquiryNotification(payload)
      const conf = enquiryConfirmation(payload)
      const [noteResult, confResult] = await Promise.all([
        resend.emails.send({ from, to, replyTo: email, subject: note.subject, html: note.html }),
        resend.emails.send({ from, to: email, replyTo: to, subject: conf.subject, html: conf.html }),
      ])
      if (noteResult.error) {
        console.error('[enquiry] notification email failed:', noteResult.error)
      }
      if (confResult.error) {
        console.error('[enquiry] confirmation email failed:', confResult.error)
      }
      if (noteResult.error || confResult.error) {
        return NextResponse.json(
          { ok: false, error: 'Your message was saved, but the notification email failed to send — Mandakini may not see it right away.' },
          { status: 502 }
        )
      }
    } catch (err) {
      console.error('[enquiry] Resend threw (write succeeded):', err)
      return NextResponse.json(
        { ok: false, error: 'Your message was saved, but the notification email failed to send.' },
        { status: 502 }
      )
    }
  } else {
    console.warn('[enquiry] RESEND_API_KEY missing — emails skipped')
  }

  return NextResponse.json({ ok: true })
}
