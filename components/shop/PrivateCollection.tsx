'use client'

import { useEffect, useRef, useState } from 'react'
import EnquiryForm from '@/components/shop/EnquiryForm'
import {
  EASE,
  lockScroll,
  mandaGsap,
  prefersReducedMotion,
  revealLines,
  unlockScroll,
} from '@/lib/motion'

/**
 * The Private Collection — a doorway, never a gallery. No imagery,
 * no titles, no previews of private works exist anywhere on the site;
 * visitors enquire and Mandakini responds personally. The section is
 * a deliberate room-change: deep warm near-black against the page.
 */
export default function PrivateCollection() {
  const rootRef = useRef<HTMLElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-pc__title'), {
        scrollTrigger: true,
        start: 'top 78%',
      })
      revealLines(root.querySelector('.mr-pc__line'), {
        scrollTrigger: true,
        start: 'top 78%',
        delay: 0.15,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  // Panel open/close with scroll lock (plays nicely with Lenis).
  useEffect(() => {
    if (!open) return
    lockScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    if (!prefersReducedMotion()) {
      mandaGsap.fromTo(
        '.mr-pc__panel',
        { xPercent: 104 },
        { xPercent: 0, duration: 0.8, ease: EASE }
      )
      mandaGsap.fromTo(
        '.mr-pc__veil',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.5, ease: EASE }
      )
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      unlockScroll()
    }
  }, [open])

  return (
    <section ref={rootRef} className="mr-pc" aria-label="The Private Collection">
      {/* PLACEHOLDER COPY — pending client approval */}
      <h2 className="mr-pc__title">The Private Collection</h2>
      <p className="mr-pc__line">
        A selection of original works shared personally with collectors.
        Enquire to receive the collection.
      </p>
      <button
        type="button"
        className="mr-pc__cta"
        onClick={() => setOpen(true)}
        data-cursor="enter"
      >
        Enquire to View
      </button>

      {open && (
        <div className="mr-pc__overlay" role="dialog" aria-modal="true" aria-label="Private Collection enquiry">
          <button
            type="button"
            className="mr-pc__veil"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="mr-pc__panel">
            <div className="mr-pc__panel-head">
              <p>The Private Collection</p>
              <button
                type="button"
                className="mr-pc__close"
                onClick={() => setOpen(false)}
                data-cursor="view"
              >
                Close
              </button>
            </div>
            <EnquiryForm />
          </div>
        </div>
      )}
    </section>
  )
}
