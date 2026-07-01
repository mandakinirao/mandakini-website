'use client'

import { useEffect, useState } from 'react'
import PillCta from '@/components/ui/PillCta'
import { useCart } from '@/lib/cart'
import { openRazorpayCheckout } from '@/lib/razorpay-checkout'
import {
  EASE,
  lockScroll,
  mandaGsap,
  prefersReducedMotion,
  unlockScroll,
} from '@/lib/motion'

/**
 * Cart drawer (Phase 2, commerce flag only). Mirrors the Private
 * Collection panel: right slide-in, rounded inner edge, Lenis-safe
 * scroll lock, Esc + veil close. Renders nothing while the cart is
 * empty and closed — a floating count pill is the only standing UI.
 */
export default function CartDrawer() {
  const { items, subtotal, count, open, setOpen, setQty, remove, clear } =
    useCart()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    if (!prefersReducedMotion()) {
      mandaGsap.fromTo(
        '.mr-cart__panel',
        { xPercent: 104 },
        { xPercent: 0, duration: 0.8, ease: EASE }
      )
      mandaGsap.fromTo(
        '.mr-cart__veil',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: EASE }
      )
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open, setOpen])

  const checkout = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, qty: i.qty })),
        }),
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
        name: items.length === 1 ? items[0].title : `${items.length} prints`,
        onDismiss: () => setBusy(false),
        onError: (msg) => { setError(msg); setBusy(false) },
      })
    } catch {
      setError('Checkout is unavailable right now.')
      setBusy(false)
    }
  }

  return (
    <>
      {count > 0 && !open && (
        <button
          type="button"
          className="mr-cart__chip"
          onClick={() => setOpen(true)}
          aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          Cart · {count}
        </button>
      )}

      {open && (
        <div
          className="mr-cart__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Your cart"
        >
          <button
            type="button"
            className="mr-cart__veil"
            aria-label="Close cart"
            onClick={() => setOpen(false)}
          />
          <div className="mr-cart__panel">
            <div className="mr-cart__head">
              <p>Your cart</p>
              <button
                type="button"
                className="mr-cart__close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>

            {items.length === 0 ? (
              <p className="mr-cart__empty">
                Nothing here yet — the editions await.
              </p>
            ) : (
              <>
                <ul className="mr-cart__list">
                  {items.map((item) => (
                    <li key={item.slug} className="mr-cart__row">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image} alt="" className="mr-cart__thumb" />
                      <div className="mr-cart__info">
                        <p className="mr-cart__title">{item.title}</p>
                        <p className="mr-cart__amount">
                          ₹{item.amount.toLocaleString('en-IN')}
                        </p>
                        <div className="mr-cart__qty">
                          <button
                            type="button"
                            onClick={() => setQty(item.slug, item.qty - 1)}
                            aria-label={`Reduce quantity of ${item.title}`}
                          >
                            −
                          </button>
                          <span aria-live="polite">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(item.slug, item.qty + 1)}
                            disabled={item.qty >= item.stock}
                            aria-label={`Increase quantity of ${item.title}`}
                          >
                            +
                          </button>
                          <button
                            type="button"
                            className="mr-cart__remove"
                            onClick={() => remove(item.slug)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mr-cart__foot">
                  <p className="mr-cart__subtotal">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </p>
                  {error && <p className="mr-cart__error">{error}</p>}
                  <PillCta
                    className="mr-cart__checkout"
                    onClick={checkout}
                    disabled={busy}
                  >
                    {busy ? 'One moment…' : 'Checkout'}
                  </PillCta>
                  <button
                    type="button"
                    className="mr-cart__clear"
                    onClick={clear}
                  >
                    Empty the cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
