'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { EASE_OUT, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'

/**
 * V2 §5 — Contact: one quiet full-width beat between the shop and the
 * press marquees. Big invitation, rectangular tag, nothing else.
 */
export default function ContactStage() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr2-contact__line'), {
        scrollTrigger: true,
      })
      if (prefersReducedMotion()) return
      mandaGsap.from('.mr2-contact .mr2-footer__stamp', {
        autoAlpha: 0,
        y: 24,
        duration: 0.8,
        ease: EASE_OUT,
        scrollTrigger: { trigger: root, start: 'top 65%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr2-contact" aria-label="Contact">
      <p className="mr2-contact__line">
        Have a painting, a commission, or a question in mind?
      </p>
      <Link href="/contact" className="mr2-footer__stamp" data-cursor="enter">
        Say hello <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
