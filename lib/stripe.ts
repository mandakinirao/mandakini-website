import type Stripe from 'stripe'
import type { PurchasableItem } from '@/lib/home-data'

/**
 * All Stripe logic lives here (PROJECT.md §14) — routes never touch the
 * SDK directly. Every path is guarded: missing env returns null instead
 * of throwing, so the site builds and runs without keys.
 */

let stripeClient: Stripe | null = null

export async function getStripe(): Promise<Stripe | null> {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (stripeClient) return stripeClient
  const { default: StripeCtor } = await import('stripe')
  stripeClient = new StripeCtor(process.env.STRIPE_SECRET_KEY)
  return stripeClient
}

export interface CheckoutLine {
  item: PurchasableItem
  quantity: number
}

/**
 * Creates a Stripe Checkout Session from server-validated line items.
 * Prefers a stripePriceId when the Studio has one; otherwise builds
 * price_data from the Sanity amount (INR, paise). Item slugs/quantities
 * ride in metadata so the webhook can decrement stock idempotently.
 */
export async function createCheckoutSession(
  lines: CheckoutLine[]
): Promise<{ url: string } | null> {
  const stripe = await getStripe()
  if (!stripe || lines.length === 0) return null

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    currency: 'inr',
    line_items: lines.map(({ item, quantity }) =>
      item.stripePriceId
        ? { price: item.stripePriceId, quantity }
        : {
            quantity,
            price_data: {
              currency: 'inr',
              unit_amount: Math.round(item.amount * 100),
              product_data: { name: item.title },
            },
          }
    ),
    shipping_address_collection: { allowed_countries: ['IN'] },
    success_url: `${site}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/shop`,
    metadata: {
      items: JSON.stringify(
        lines.map(({ item, quantity }) => ({
          id: item.id,
          slug: item.slug,
          qty: quantity,
          amount: item.amount,
        }))
      ),
    },
  })
  return session.url ? { url: session.url } : null
}
