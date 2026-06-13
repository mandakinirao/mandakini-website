'use client'

import { useState } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { useCart } from '@/lib/cart'

interface BuyControlsProps {
  print: HomePrint
  /** compact: card footer on the shop grid; full: product page block */
  variant?: 'compact' | 'full'
}

/**
 * Price + purchase CTAs for a buyable print (Phase 2, commerce flag
 * only — pages render this solely when commerce is enabled). Stock 0
 * shows the quiet rosehip "Sold" state with no CTA. Buy Now goes
 * straight to checkout with a single line item.
 */
export default function BuyControls({
  print,
  variant = 'compact',
}: BuyControlsProps) {
  const { add } = useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (print.stock <= 0 || !print.available) {
    return (
      <div className={`mr-buy mr-buy--${variant}`}>
        <p className="mr-buy__sold">Sold</p>
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
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Checkout is unavailable right now.')
        setBusy(false)
        return
      }
      window.location.assign(data.url)
    } catch {
      setError('Checkout is unavailable right now.')
      setBusy(false)
    }
  }

  return (
    <div className={`mr-buy mr-buy--${variant}`}>
      <p className="mr-buy__amount">₹{print.amount.toLocaleString('en-IN')}</p>
      <div className="mr-buy__ctas">
        <button
          type="button"
          className="mr-pill"
          data-cursor="view"
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
        </button>
        <button
          type="button"
          className="mr-pill"
          data-cursor="enter"
          onClick={buyNow}
          disabled={busy}
        >
          {busy ? 'One moment…' : 'Buy Now'}
        </button>
      </div>
      {error && <p className="mr-buy__error">{error}</p>}
    </div>
  )
}
