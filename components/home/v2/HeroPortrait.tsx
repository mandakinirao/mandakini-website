'use client'

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { forwardRef, useImperativeHandle, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

// Dynamic import — WebGL component is client-only, never runs during SSR.
// The static <Image> below is always the visible fallback until textures load.
const HeroLiquid = dynamic(
  () => import('@/components/home/v2/HeroLiquid'),
  { ssr: false },
)

export interface HeroPortraitHandle {
  playEntrance: () => void
}

interface HeroPortraitProps {
  tagline?: string
  /** Base colored portrait — always visible at rest (fallback + WebGL base). */
  src?: string
  /** Alternate portrait revealed by the liquid-reveal effect. */
  altSrc?: string
  /** Optional custom displacement map path. Procedural fallback used if absent. */
  dispSrc?: string
}

const HeroPortrait = forwardRef<HeroPortraitHandle, HeroPortraitProps>(
  function HeroPortrait(
    {
      tagline  = 'Painter · Educator · Storyteller',
      src      = '/art/hero/hero-portrait-color.jpg',
      altSrc   = '/art/hero/hero-portrait-alt.jpg',
      dispSrc,
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
        const sub  = root.querySelector('.mr2-hp__sub')
        const cue  = root.querySelector('.mr2-hp__cue')
        if (prefersReducedMotion()) return
        mandaGsap.set([name, sub, cue], { autoAlpha: 0, y: 30 })
        mandaGsap.timeline()
          .to(name, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE })
          .to(sub,  { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE }, '-=0.55')
          .to(cue,  { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE }, '-=0.4')
      },
    }))

    return (
      <section ref={rootRef} className="mr2-hp">
        <div className="mr2-hp__img-wrap">
          {/*
           * Static fallback: always rendered, always below the WebGL canvas.
           * Remains visible on reduced-motion, no-WebGL, and while textures load.
           */}
          <Image
            src={src}
            alt="Mandakini Rao"
            fill
            priority
            unoptimized
            className="mr2-hp__img"
            sizes="100vw"
          />

          {/*
           * WebGL liquid-reveal canvas.
           * Starts at opacity 0 via CSS; transitions to 1 once textures decode
           * (canvas.dataset.ready = 'true' triggers the CSS rule).
           * On reduced-motion or no-WebGL the canvas never becomes visible
           * and the static Image above remains the hero.
           */}
          <HeroLiquid
            src={src}
            altSrc={altSrc}
            dispSrc={dispSrc}
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
