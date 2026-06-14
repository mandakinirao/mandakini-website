import type { Metadata } from 'next'
import Link from 'next/link'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Thank you — Mandakini Rao',
  description: 'Your order is confirmed.',
}

export const revalidate = 60

export default async function ThankYouPage() {
  const { thankYouMessage } = await getSiteSettings()

  return (
    <section className="mr2-page-shell mr-thanks" aria-label="Order confirmed">
      <div>
        <p className="mr-eyebrow">The Shop</p>
        <h1 className="mr-thanks__title">Thank you.</h1>
        <p className="mr-thanks__line">{thankYouMessage}</p>
        <Link href="/works" className="mr-pill" data-cursor="view">
          Keep looking
        </Link>
      </div>
    </section>
  )
}
