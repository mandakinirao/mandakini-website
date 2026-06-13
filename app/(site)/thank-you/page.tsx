import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Thank you — Mandakini Rao',
  description: 'Your order is confirmed.',
}

/**
 * Checkout success (Phase 2). Minimal and typographic — the order
 * details live in the confirmation email; this page only settles the
 * moment. PLACEHOLDER COPY — pending client approval.
 */
export default function ThankYouPage() {
  return (
    <section className="mr2-page-shell mr-thanks" aria-label="Order confirmed">
      <div>
        <p className="mr-eyebrow">The Shop</p>
        <h1 className="mr-thanks__title">Thank you.</h1>
        <p className="mr-thanks__line">
          Your order is confirmed — a confirmation is on its way to your
          inbox, and a shipping note with the waybill number will follow
          once your print leaves the Hyderabad studio.
        </p>
        <Link href="/works" className="mr-pill" data-cursor="view">
          Keep looking
        </Link>
      </div>
    </section>
  )
}
