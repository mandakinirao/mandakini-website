'use client'

/**
 * Scroll-driven 2.5D parallax hero.
 *
 * Seven full-canvas layers (all 2048×1366, same coordinate space) are stacked
 * on top of each other so the opening frame reproduces the original studio photo.
 * ScrollTrigger pins the section and scrubs a single timeline that drifts each
 * layer at its own speed, creating the illusion of depth.
 *
 * Layers are oversized (110 vw × 140 vh, centred on viewport) to give the
 * translate/scale movements room without ever revealing the section edge.
 *
 * Render loop is handled entirely by GSAP + Lenis — no competing rAF.
 */

import Image from 'next/image'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import {
  DUR,
  EASE,
  mandaGsap,
  prefersReducedMotion,
  isTouch,
} from '@/lib/motion'

// ── Parallax end-state values ─────────────────────────────────────────
// These are the values each layer reaches after the full pin scroll.
// The start state is always identity. Adjust these to taste.
// yPercent / xPercent are % of the oversized layer (140 vh / 110 vw).

const P = {
  /** Background plate — slowest, anchors the scene. */
  bg:      { y: -4,   x:  0,  s: 1.04  },
  /** Left painting / wooden frame — slow leftward wall drift. */
  left:    { y: -5,   x: -3,  s: 1.04  },
  /** Art cart & shelves — mid-speed foreground prop. */
  cart:    { y: -9,   x: -4,  s: 1.07  },
  /** Right painting / easel — slightly faster, drifts toward centre. */
  right:   { y: -11,  x: -2,  s: 1.08  },
  /** Mandakini — minimal movement; she is the visual anchor. */
  person:  { y: -2,   x:  0,  s: 1.035 },
  /** Brushes — fastest foreground detail, creates strong depth cue. */
  brushes: { y: -14,  x: -5,  s: 1.1   },
  /** Text block — floats gently upward with the scene. */
  text:    { y: -8 },
} as const

/** Total scroll distance the hero is pinned for (beyond 100 vh). */
const PIN_END = '+=160%'
/** GSAP scrub lag in seconds — 1–2 is the sweet spot for calmness. */
const SCRUB = 1.5
/** On touch / mobile, multiply all parallax values by this to keep it subtle. */
const TOUCH_SCALE = 0.35
// ──────────────────────────────────────────────────────────────────────

export interface ParallaxHeroHandle {
  playEntrance: () => void
}

const ParallaxHero = forwardRef<ParallaxHeroHandle, { tagline?: string }>(
  function ParallaxHero({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const sectionRef = useRef<HTMLElement>(null)
    const bgRef      = useRef<HTMLDivElement>(null)
    const leftRef    = useRef<HTMLDivElement>(null)
    const cartRef    = useRef<HTMLDivElement>(null)
    const rightRef   = useRef<HTMLDivElement>(null)
    const personRef  = useRef<HTMLDivElement>(null)
    const brushesRef = useRef<HTMLDivElement>(null)
    const textureRef = useRef<HTMLDivElement>(null)
    const textRef    = useRef<HTMLDivElement>(null)
    const playedRef  = useRef(false)

    // Entrance animation called by the loading screen after it exits.
    // Animates the text labels in; the parallax timeline is independent.
    useImperativeHandle(ref, () => ({
      playEntrance() {
        if (playedRef.current) return
        playedRef.current = true
        const text = textRef.current
        if (!text || prefersReducedMotion()) return
        const name = text.querySelector('.mr2-pxhero__name')
        const sub  = text.querySelector('.mr2-pxhero__sub')
        mandaGsap.set([name, sub], { autoAlpha: 0, y: 28 })
        mandaGsap.timeline({ delay: 0.15 })
          .to(name, { autoAlpha: 1, y: 0, duration: DUR.base,  ease: EASE })
          .to(sub,  { autoAlpha: 1, y: 0, duration: DUR.grand, ease: EASE }, '-=0.6')
      },
    }))

    useEffect(() => {
      const section = sectionRef.current
      if (!section) return
      if (prefersReducedMotion()) return

      // Halve all values on touch devices — the effect should feel subtle there.
      const m = isTouch() ? TOUCH_SCALE : 1

      const tl = mandaGsap.timeline({
        scrollTrigger: {
          trigger:             section,
          start:               'top top',
          end:                 PIN_END,
          pin:                 true,
          scrub:               SCRUB,
          anticipatePin:       1,
          invalidateOnRefresh: true,
        },
      })

      // All animations start at position 0 in the timeline so they play
      // simultaneously, each at its own rate set by the yPercent magnitude.
      tl.to(bgRef.current,      { yPercent: P.bg.y * m,                              scale: P.bg.s,      ease: 'none' }, 0)
      tl.to(leftRef.current,    { yPercent: P.left.y * m,    xPercent: P.left.x * m,    scale: P.left.s,    ease: 'none' }, 0)
      tl.to(cartRef.current,    { yPercent: P.cart.y * m,    xPercent: P.cart.x * m,    scale: P.cart.s,    ease: 'none' }, 0)
      tl.to(rightRef.current,   { yPercent: P.right.y * m,   xPercent: P.right.x * m,   scale: P.right.s,   ease: 'none' }, 0)
      tl.to(personRef.current,  { yPercent: P.person.y * m,                              scale: P.person.s,  ease: 'none' }, 0)
      tl.to(brushesRef.current, { yPercent: P.brushes.y * m, xPercent: P.brushes.x * m, scale: P.brushes.s, ease: 'none' }, 0)
      tl.to(textureRef.current, { opacity: 0.22,                                                              ease: 'none' }, 0)
      tl.to(textRef.current,    { yPercent: P.text.y * m,                                                     ease: 'none' }, 0)

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }, [])

    return (
      <section
        ref={sectionRef}
        className="mr2-pxhero"
        aria-label="Mandakini Rao — studio portrait"
      >
        {/* ── Background plate ── slowest layer; the studio space */}
        <div ref={bgRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-bg-clean.jpg"
            alt=""
            fill
            priority
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Left painting ── wall piece; drifts gently left */}
        <div ref={leftRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-left-painting.png"
            alt=""
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Art cart ── mid-foreground prop; moves a bit faster */}
        <div ref={cartRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-art-cart.png"
            alt=""
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Right painting ── easel; faster, drifts toward centre */}
        <div ref={rightRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-right-painting.png"
            alt=""
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Mandakini ── the anchor; stays calm and nearly still */}
        <div ref={personRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-person.png"
            alt="Mandakini Rao in her studio"
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Brushes ── fastest layer; strong foreground depth cue */}
        <div ref={brushesRef} className="mr2-pxhero__layer">
          <Image
            src="/art/parallax/mandakini-brushes.png"
            alt=""
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Canvas texture ── grain/weave overlay; fades in on scroll */}
        <div ref={textureRef} className="mr2-pxhero__layer mr2-pxhero__texture">
          <Image
            src="/art/parallax/mandakini-texture-overlay.png"
            alt=""
            fill
            unoptimized
            className="mr2-pxhero__img"
            sizes="110vw"
          />
        </div>

        {/* ── Vignette ── darkens edges for editorial mood + text legibility */}
        <div className="mr2-pxhero__vignette" aria-hidden="true" />

        {/* ── Editorial text ── animated in by playEntrance() */}
        <div ref={textRef} className="mr2-pxhero__text">
          <h1 className="mr2-pxhero__name">Mandakini Rao</h1>
          <p className="mr2-pxhero__sub">{tagline}</p>
        </div>

        <p className="mr2-pxhero__cue" aria-hidden="true">Scroll</p>
      </section>
    )
  }
)

export default ParallaxHero
