'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import InkReveal from './InkReveal'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

export interface HeroSceneHandle {
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const textRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      playEntrance() {
        const text = textRef.current
        if (!text) return
        const els = text.querySelectorAll('[data-hero-name], .mr2-hscene__sub')
        if (prefersReducedMotion()) {
          mandaGsap.set(els, { autoAlpha: 1, y: 0 })
          return
        }
        mandaGsap.fromTo(
          els,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: DUR.grand, ease: EASE, stagger: 0.15 }
        )
      },
    }), [])

    useEffect(() => {
      const text = textRef.current
      if (!text) return
      mandaGsap.set(
        text.querySelectorAll('[data-hero-name], .mr2-hscene__sub'),
        { autoAlpha: 0 }
      )
    }, [])

    return (
      <section className="mr2-hscene" aria-label="Mandakini Rao — artist studio">
        {/* Static framed clip — cream mat visible on all sides */}
        <div className="mr2-hscene__clip">
          <InkReveal topSrc="/art/hero/hero-bw.jpg" bottomSrc="/art/hero/hero-bottom.png" />
          <div className="mr2-hscene__vignette" aria-hidden="true" />
        </div>
        <div ref={textRef} className="mr2-hscene__text">
          <h1 className="mr2-hscene__name" data-hero-name>Mandakini Rao</h1>
          <p className="mr2-hscene__sub">{tagline}</p>
        </div>
        <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>
      </section>
    )
  }
)

export default HeroScene
