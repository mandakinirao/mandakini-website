'use client'

import { useEffect, useState } from 'react'
import PillCta from '@/components/ui/PillCta'
import CheckoutAddressModal from '@/components/shop/CheckoutAddressModal'
import { useCart } from '@/lib/cart'
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
  const [addrOpen, setAddrOpen] = useState(false)
  const [nearFooter, setNearFooter] = useState(false)

  useEffect(() => {
    const footer = document.querySelector('footer.mr2-footer')
    if (!footer) return
    const io = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -15% 0px' }
    )
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    document.body.classList.add('mr-modal-open')
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
      document.body.classList.remove('mr-modal-open')
      unlockScroll()
    }
  }, [open, setOpen])

  return (
    <>
      {count > 0 && !open && (
        <button
          type="button"
          className={`mr-cart__chip${nearFooter ? ' mr-cart__chip--hidden' : ''}`}
          onClick={() => setOpen(true)}
          aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
        >
          Cart · {count}
        </button>
      )}

      <CheckoutAddressModal
        open={addrOpen}
        items={items.map((i) => ({ slug: i.slug, qty: i.qty }))}
        label={items.length === 1 ? items[0]?.title ?? 'Print' : `${items.length} prints`}
        onClose={() => setAddrOpen(false)}
      />

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
                        <div className="mr-cart__qty-row">
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
                          </div>
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
                  <PillCta
                    className="mr-cart__checkout"
                    onClick={() => {
                      setOpen(false)
                      setAddrOpen(true)
                    }}
                  >
                    Checkout
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
