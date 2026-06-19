'use client'

import { useEffect, useRef } from 'react'
import PillCta from '@/components/ui/PillCta'
import { DUR, EASE, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'

interface AboutTeaserProps {
  line?: string
}

export default function AboutTeaser({ line }: AboutTeaserProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr2-teaser__line'), {
        scrollTrigger: true,
        start: 'top 75%',
      })
      if (!prefersReducedMotion()) {
        mandaGsap.from(root.querySelector('.mr2-cta'), {
          y: 22,
          autoAlpha: 0,
          duration: DUR.fast,
          ease: EASE,
          scrollTrigger: { trigger: root, start: 'top 60%', once: true },
        })
      }
    }, root)
    return () => ctx.revert()
  }, [])

  if (!line) return null

  return (
    <section ref={rootRef} className="mr2-teaser" aria-label="About Mandakini">
      <p className="mr2-teaser__line">{line}</p>
      <PillCta href="/about" className="mr2-teaser__cta">
        About Mandakini
      </PillCta>
    </section>
  )
}
