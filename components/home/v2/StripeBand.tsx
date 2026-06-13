'use client'

import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion } from '@/lib/motion'

const BARS = 16

/** The recurring seam: a quiet stripe field that scrubs open and closed
 *  as it crosses the viewport — the loader's motif echoing through. */
export default function StripeBand() {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      if (prefersReducedMotion()) {
        mandaGsap.set('.mr2-band__bar', { scaleY: 1 })
        return
      }
      mandaGsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
        .to('.mr2-band__bar', {
          scaleY: 1,
          stagger: { each: 0.03, from: 'center' },
          ease: 'none',
          duration: 0.5,
        })
        .to('.mr2-band__bar', {
          scaleY: 0,
          stagger: { each: 0.03, from: 'edges' },
          ease: 'none',
          duration: 0.5,
        })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={rootRef} className="mr2-band" aria-hidden="true">
      {Array.from({ length: BARS }).map((_, i) => (
        <div key={i} className="mr2-band__bar" />
      ))}
    </div>
  )
}
