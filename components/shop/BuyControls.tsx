'use client'

import { useState } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { useCart } from '@/lib/cart'
import PillCta from '@/components/ui/PillCta'
import { openRazorpayCheckout } from '@/lib/razorpay-checkout'

interface BuyControlsProps {
  print: HomePrint
  variant?: 'compact' | 'full'
}

export default function BuyControls({ print, variant = 'compact' }: BuyControlsProps) {
  const { add } = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!print.available || print.stock === 0) {
    return (
      <div className={`mr-buy mr-buy--${variant}`}>
        <p className="mr-buy__sold">Sold out</p>
        <p className="mr-buy__hint">
          This edition is complete —{' '}
          <a href="/contact">get in touch</a> about other works.
        </p>
      </div>
    )
  }

  const buyNow = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ slug: print.slug, qty: 1 }] }),
      })
      const data = await res.json()
      if (!res.ok || !data.orderId) {
        setError(data.error ?? 'Checkout is unavailable right now.')
        setBusy(false)
        return
      }
      openRazorpayCheckout({
        orderId: data.orderId,
        amount: data.amount,
        currency: data.currency,
        keyId: data.keyId,
        name: print.title,
        onDismiss: () => setBusy(false),
        onError: (msg) => { setError(msg); setBusy(false) },
      })
    } catch {
      setError('Checkout is unavailable right now.')
      setBusy(false)
    }
  }

  return (
    <div className={`mr-buy mr-buy--${variant}`}>
      <p className="mr-buy__amount">₹{print.amount.toLocaleString('en-IN')}</p>
      <div className="mr-buy__ctas">
        <PillCta
          onClick={() =>
            add({
              slug: print.slug,
              title: print.title,
              image: print.image,
              amount: print.amount,
              stock: print.stock,
            })
          }
        >
          Add to Cart
        </PillCta>
        <PillCta onClick={buyNow} disabled={busy}>
          {busy ? 'One moment…' : 'Buy Now'}
        </PillCta>
      </div>
      {error && <p className="mr-buy__error">{error}</p>}
    </div>
  )
}
