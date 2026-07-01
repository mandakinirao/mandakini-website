/**
 * Commerce feature gate. Server-side only — pages read this and pass a
 * boolean down so client bundles never branch on secret keys.
 */
export function commerceEnabled(): boolean {
  return process.env.NEXT_PUBLIC_COMMERCE_ENABLED === 'true'
}

/** True when Razorpay keys are present — used by the checkout route. */
export function razorpayEnabled(): boolean {
  return (
    commerceEnabled() &&
    Boolean(process.env.RAZORPAY_KEY_ID) &&
    Boolean(process.env.RAZORPAY_KEY_SECRET)
  )
}
