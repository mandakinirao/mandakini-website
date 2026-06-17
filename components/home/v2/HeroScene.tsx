'use client'

/**
 * Scroll-driven hero — scale-down + two-layer parallax.
 *
 * The composition starts full-screen and looks like one complete photograph.
 * As the user scrolls the hero pins and two things happen simultaneously:
 *
 *   1. The whole frame scales down (~0.80), revealing the page background
 *      around it and gaining rounded corners — a cinematic "entering the frame"
 *      moment.
 *
 *   2. The background plate drifts upward a little faster than Mandakini,
 *      separating the two layers into subtle 2.5D depth.
 *
 * Both images are 1535×1025 (same canvas). The person layer uses
 * mix-blend-mode: multiply so its white background becomes invisible and
 * Mandakini composites naturally over the studio plate.
 *
 * All tunable values live in the MOTION constant below.
 */

import Image from 'next/image'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion, isTouch } from '@/lib/motion'

// ── Tunable motion values ─────────────────────────────────────────────

const MOTION = {
  /** Scale the whole frame reaches by the end of the pin. 1 = full-screen. */
  frameScale:   0.80,
  /** Border-radius the frame gains as it shrinks (px). */
  frameRadius:  '18px',
  /** Background plate parallax — drifts up + breathes outward. */
  bg:     { y: -6,   scale: 1.07 },
  /** Person layer — stays more central; she is the anchor. */
  person: { y: -2,   scale: 1.025 },
  /** Text block — floats gently upward. */
  text:   { y: -14 },
  /** Total scroll distance the hero pins for (beyond 100 vh). */
  pinEnd: '+=130%',
  /** GSAP scrub lag — higher = smoother / more floaty. */
  scrub:  1.5,
  /** Reduce parallax magnitude on touch/mobile. */
  touchMultiplier: 0.4,
}

// ──────────────────────────────────────────────────────────────────────

export interface HeroSceneHandle {
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const sectionRef = useRef<HTMLElement>(null)
    const frameRef   = useRef<HTMLDivElement>(null)
    const bgRef      = useRef<HTMLDivElement>(null)
    const personRef  = useRef<HTMLDivElement>(null)
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
      if (!section || prefersReducedMotion()) return

      const m = isTouch() ? MOTION.touchMultiplier : 1

      const tl = mandaGsap.timeline({
        scrollTrigger: {
          trigger:             section,
          start:               'top top',
          end:                 MOTION.pinEnd,
          pin:                 true,
          scrub:               MOTION.scrub,
          anticipatePin:       1,
          invalidateOnRefresh: true,
        },
      })

      // ── 1. Scale the whole frame down ──────────────────────────────
      // borderRadius on an overflow:hidden element creates the rounded
      // cinematic frame as the hero shrinks.
      tl.to(frameRef.current, {
        scale:        MOTION.frameScale,
        borderRadius: MOTION.frameRadius,
        ease:         'none',
      }, 0)

      // ── 2. Background — drifts upward, breathes outward ───────────
      tl.to(bgRef.current, {
        yPercent: MOTION.bg.y * m,
        scale:    MOTION.bg.scale,
        ease:     'none',
      }, 0)

      // ── 3. Person — nearly stationary, the calm anchor ────────────
      tl.to(personRef.current, {
        yPercent: MOTION.person.y * m,
        scale:    MOTION.person.scale,
        ease:     'none',
      }, 0)

      // ── 4. Text — rises with the scene ────────────────────────────
      tl.to(textRef.current, {
        yPercent: MOTION.text.y * m,
        ease:     'none',
      }, 0)

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }, [])

    return (
      <section
        ref={sectionRef}
        className="mr2-hscene"
        aria-label="Mandakini Rao — artist studio"
      >
        {/* Scaling frame — this is the element that shrinks on scroll */}
        <div ref={frameRef} className="mr2-hscene__frame">

          {/* Background plate — drifts upward faster than person */}
          <div ref={bgRef} className="mr2-hscene__layer">
            <Image
              src="/art/hero/bg-only.png"
              alt=""
              fill
              priority
              unoptimized
              className="mr2-hscene__img"
              sizes="106vw"
            />
          </div>

          {/* Mandakini — nearly stationary, blended over bg via multiply */}
          <div ref={personRef} className="mr2-hscene__layer mr2-hscene__person">
            <Image
              src="/art/hero/person-only.png"
              alt="Mandakini Rao in her studio"
              fill
              priority
              unoptimized
              className="mr2-hscene__img"
              sizes="106vw"
            />
          </div>

          {/* Vignette — bottom-weighted for editorial mood */}
          <div className="mr2-hscene__vignette" aria-hidden="true" />

          {/* Editorial text */}
          <div ref={textRef} className="mr2-hscene__text">
            <h1 className="mr2-hscene__name">Mandakini Rao</h1>
            <p className="mr2-hscene__sub">{tagline}</p>
          </div>

          <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>
        </div>
      </section>
    )
  }
)

export default HeroScene
