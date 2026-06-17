/**
 * Commerce feature gate (Phase 2, June 2026). Server-side only — pages
 * read this and pass a boolean down, so client bundles never branch on
 * the secret key. With the flag off OR Stripe keys absent, the site
 * renders exactly the pre-commerce behaviour: zero commerce UI.
 */
export function commerceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'true'
}

/** True only when Stripe is also configured — used by checkout route. */
export function stripeEnabled(): boolean {
  return commerceEnabled() && Boolean(process.env.STRIPE_SECRET_KEY)
}
