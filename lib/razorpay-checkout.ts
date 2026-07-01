'use client'

interface RazorpayOptions {
  orderId: string
  amount: number  // paise
  currency: string
  keyId: string
  name: string
  onDismiss?: () => void
  onError?: (message: string) => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: new (options: Record<string, unknown>) => { open(): void }
  }
}

export function openRazorpayCheckout(opts: RazorpayOptions) {
  if (typeof window === 'undefined' || !window.Razorpay) {
    opts.onError?.('Payment gateway not loaded. Please refresh and try again.')
    return
  }

  const rzp = new window.Razorpay({
    key: opts.keyId,
    amount: opts.amount,
    currency: opts.currency,
    order_id: opts.orderId,
    name: 'Mandakini Rao',
    description: opts.name,
    image: '/art/logo/logo-cacao.png',
    theme: { color: '#2C1A0E' },
    handler: () => {
      window.location.assign('/thank-you')
    },
    modal: {
      ondismiss: opts.onDismiss,
    },
  })

  rzp.open()
}
