'use client'

/**
 * Hero section — background parallax only.
 *
 * The background plate moves upward at BG_PARALLAX_RATE of the scroll speed.
 * Everything else (person layer, text, vignette) scrolls at normal speed.
 * No scale, no pin, no opacity animation on scroll.
 *
 * Entrance text animation is driven separately by playEntrance(), which is
 * called by the loading screen after it completes.
 */

import Image from 'next/image'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

// ── Tunable ───────────────────────────────────────────────────────────
/** How fast the background moves relative to scroll.
 *  0 = locked (no parallax). 1 = same speed as scroll (no depth).
 *  0.32 ≈ 32% speed — subtle, cinematic, never vertiginous. */
const BG_PARALLAX_RATE = 0.32
// ──────────────────────────────────────────────────────────────────────

export interface HeroSceneHandle {
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const sectionRef = useRef<HTMLElement>(null)
    const bgRef      = useRef<HTMLDivElement>(null)
    const textRef    = useRef<HTMLDivElement>(null)
    const playedRef  = useRef(false)

    useImperativeHandle(ref, () => ({
      playEntrance() {
        if (playedRef.current) return
        playedRef.current = true
        const text = textRef.current
        if (!text || prefersReducedMotion()) return
        const name = text.querySelector('.mr2-hscene__name')
        const sub  = text.querySelector('.mr2-hscene__sub')
        mandaGsap.set([name, sub], { autoAlpha: 0, y: 26 })
        mandaGsap.timeline({ delay: 0.2 })
          .to(name, { autoAlpha: 1, y: 0, duration: DUR.base,  ease: EASE })
          .to(sub,  { autoAlpha: 1, y: 0, duration: DUR.grand, ease: EASE }, '-=0.55')
      },
    }))

    useEffect(() => {
      const section = sectionRef.current
      const bg      = bgRef.current
      if (!section || !bg || prefersReducedMotion()) return

      // Function value recalculates on viewport resize (invalidateOnRefresh).
      const tween = mandaGsap.to(bg, {
        y:    () => -(window.innerHeight * BG_PARALLAX_RATE),
        ease: 'none',
        scrollTrigger: {
          trigger:             section,
          start:               'top top',
          end:                 'bottom top',
          scrub:               true,
          invalidateOnRefresh: true,
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    }, [])

    return (
      <section
        ref={sectionRef}
        className="mr2-hscene"
        aria-label="Mandakini Rao — artist studio"
      >
        {/* Background — parallax layer. Oversized vertically so movement
            never exposes the section background colour at the bottom edge.
            Height = 155 vh (100 vh + 20 vh top margin + 35 vh travel room). */}
        <div ref={bgRef} className="mr2-hscene__bg">
          <Image
            src="/art/hero/bg-only.png"
            alt=""
            fill
            priority
            unoptimized
            className="mr2-hscene__img"
            sizes="100vw"
          />
        </div>

        {/* Person — static, no parallax. Composited over the bg via
            mix-blend-mode: multiply (white studio background → transparent). */}
        <div className="mr2-hscene__person">
          <Image
            src="/art/hero/person-only.png"
            alt="Mandakini Rao in her studio"
            fill
            priority
            unoptimized
            className="mr2-hscene__img"
            sizes="100vw"
          />
        </div>

        <div className="mr2-hscene__vignette" aria-hidden="true" />

        {/* Text — scrolls at normal page speed; no transform applied here. */}
        <div ref={textRef} className="mr2-hscene__text">
          <h1 className="mr2-hscene__name">Mandakini Rao</h1>
          <p className="mr2-hscene__sub">{tagline}</p>
        </div>

        <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>
      </section>
    )
  }
)

export default HeroScene
