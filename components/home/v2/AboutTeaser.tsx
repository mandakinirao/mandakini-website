'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import PillCta from '@/components/ui/PillCta'
import { DUR, EASE, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'

interface AboutTeaserProps {
  line?: string
  body?: string
  portrait?: string
}

/** Homepage "About Mandakini" strip — portrait, teaser line, short intro. */
export default function AboutTeaser({ line, body, portrait }: AboutTeaserProps) {
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
        mandaGsap.from(root.querySelectorAll('.mr2-teaser__body, .mr2-cta, .mr2-teaser__photo'), {
          y: 22,
          autoAlpha: 0,
          duration: DUR.fast,
          ease: EASE,
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: 'top 65%', once: true },
        })
      }
    }, root)
    return () => ctx.revert()
  }, [])

  if (!line && !body) return null

  return (
    <section ref={rootRef} className="mr2-teaser" aria-label="About Mandakini">
      {portrait && (
        <div className="mr2-teaser__photo">
          <Image src={portrait} alt="Mandakini Rao in her studio" fill sizes="(max-width: 780px) 80vw, 34vw" />
        </div>
      )}
      <div className="mr2-teaser__text">
        <p className="mr2-teaser__eyebrow">About Mandakini</p>
        {line && <p className="mr2-teaser__line">{line}</p>}
        {body && body !== line && <p className="mr2-teaser__body">{body}</p>}
        <PillCta href="/about" className="mr2-teaser__cta">
          Read her story
        </PillCta>
      </div>
    </section>
  )
}
