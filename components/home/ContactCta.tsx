'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { mandaGsap, revealLines } from '@/lib/motion'

/**
 * Contact — one warm invitation between the shop and the press list.
 */
export default function ContactCta() {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-contact__line'), {
        scrollTrigger: true,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={rootRef}
      className="mr-section mr-contact"
      aria-label="Contact"
      data-bg="deep"
    >
      <p className="mr-contact__line">
        Have a <em className="mr-accent">painting</em>, a commission, or a
        question in mind?
      </p>
      <Link href="/contact" className="mr-pill" data-cursor="enter">
        Get in touch
      </Link>
    </section>
  )
}
