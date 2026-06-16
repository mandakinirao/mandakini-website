'use client'

import Image from 'next/image'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

export interface HeroPortraitHandle {
  playEntrance: () => void
}

interface HeroPortraitProps {
  tagline?: string
  src?: string
}

const HeroPortrait = forwardRef<HeroPortraitHandle, HeroPortraitProps>(
  function HeroPortrait(
    {
      tagline = 'Painter · Educator · Storyteller',
      src = '/art/loader/portrait-painting-palette.jpg',
    },
    ref
  ) {
    const rootRef = useRef<HTMLElement>(null)
    const playedRef = useRef(false)

    useImperativeHandle(ref, () => ({
      playEntrance() {
        if (playedRef.current) return
        playedRef.current = true
        const root = rootRef.current
        if (!root) return

        const name = root.querySelector('.mr2-hp__name')
        const sub = root.querySelector('.mr2-hp__sub')
        const cue = root.querySelector('.mr2-hp__cue')

        if (prefersReducedMotion()) return

        mandaGsap.set([name, sub, cue], { autoAlpha: 0, y: 30 })
        mandaGsap
          .timeline()
          .to(name, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE })
          .to(sub, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE }, '-=0.55')
          .to(cue, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE }, '-=0.4')
      },
    }))

    return (
      <section ref={rootRef} className="mr2-hp">
        <div className="mr2-hp__img-wrap">
          <Image
            src={src}
            alt="Mandakini Rao"
            fill
            priority
            unoptimized
            className="mr2-hp__img"
            sizes="100vw"
          />
        </div>
        <div className="mr2-hp__overlay" />
        <div className="mr2-hp__text">
          <h1 className="mr2-hp__name">Mandakini Rao</h1>
          <p className="mr2-hp__sub">{tagline}</p>
        </div>
        <p className="mr2-hp__cue">Scroll</p>
      </section>
    )
  }
)

export default HeroPortrait
