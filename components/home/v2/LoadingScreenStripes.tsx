'use client'

import { useEffect, useRef } from 'react'
import {
  DUR,
  EASE,
  EASE_SOFT_INOUT,
  EASE_SOFT_OUT,
  lockScroll,
  mandaGsap,
  prefersReducedMotion,
} from '@/lib/motion'

const BAR_COUNT = 22

interface LoadingScreenStripesProps {
  onComplete: () => void
  heroAssets?: string[]
  tagline?: string
}

/**
 * V2 loader — cream field turning black (Siena sequence).
 * Logo fades in after the field turns dark, then on ENTER the logo
 * and the name travel to their final resting positions in the nav
 * corner and hero bottom — one continuous motion into the site.
 */
export default function LoadingScreenStripes({
  onComplete,
  heroAssets,
  tagline = 'Painter · Educator · Storyteller',
}: LoadingScreenStripesProps) {
  const HERO_ASSETS = heroAssets ?? []
  const rootRef      = useRef<HTMLDivElement>(null)
  const wordRef      = useRef<HTMLHeadingElement>(null)
  const subRef       = useRef<HTMLParagraphElement>(null)
  const enterRef     = useRef<HTMLButtonElement>(null)
  const loaderLogoRef = useRef<HTMLDivElement>(null)
  const loadedRef    = useRef(0)
  const animDoneRef  = useRef(false)
  const shownRef     = useRef(false)
  const exitingRef   = useRef(false)

  useEffect(() => {
    const root  = rootRef.current
    const word  = wordRef.current
    const enter = enterRef.current
    const logo  = loaderLogoRef.current
    if (!root || !word || !enter || !logo) return

    lockScroll()

    const showEnter = () => {
      if (shownRef.current) return
      if (!animDoneRef.current) return
      if (loadedRef.current < HERO_ASSETS.length && !timedOut) return
      shownRef.current = true
      mandaGsap.to(enter, { autoAlpha: 1, y: 0, duration: DUR.fast, ease: EASE })
    }

    let timedOut = false
    const safety = window.setTimeout(() => {
      timedOut = true
      showEnter()
    }, 6000)

    HERO_ASSETS.forEach((src) => {
      const img = new window.Image()
      img.onload = img.onerror = () => {
        loadedRef.current += 1
        showEnter()
      }
      img.src = src
    })

    const ctx = mandaGsap.context(() => {
      mandaGsap.set(enter, { autoAlpha: 0, y: 16 })
      mandaGsap.set(logo,  { autoAlpha: 0, y: -12 })

      if (prefersReducedMotion()) {
        mandaGsap.set(root, { backgroundColor: 'var(--v2-void)' })
        mandaGsap.set('.mr2-loader__bar', { scaleX: 1 })
        mandaGsap.set('.mr2-loader__sub', { autoAlpha: 1 })
        mandaGsap.set(logo, { autoAlpha: 1, y: 0 })
        animDoneRef.current = true
        showEnter()
        return
      }

      const tl = mandaGsap.timeline({ delay: 0.35 })

      // Bars widen from slits to full black
      tl.fromTo(
        '.mr2-loader__bar',
        { scaleX: 0.055 },
        {
          scaleX: 1.02,
          duration: 2.4,
          ease: EASE_SOFT_INOUT,
          stagger: { each: 0.012, from: 'center' },
        },
        0
      )

      // Name settles (letter-spacing)
      tl.fromTo(
        word,
        { letterSpacing: '0.22em' },
        { letterSpacing: '0.1em', duration: 2.6, ease: EASE_SOFT_OUT },
        0.2
      )

      // Field turns solid void after bars fill
      tl.set(root, { backgroundColor: 'var(--v2-void)' })

      // Logo + subline surface simultaneously on the dark field
      tl.fromTo(
        logo,
        { autoAlpha: 0, y: -12 },
        { autoAlpha: 1, y: 0, duration: DUR.fast, ease: EASE }
      )
      tl.fromTo(
        '.mr2-loader__sub',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: DUR.fast, ease: EASE },
        '<'
      )

      tl.add(() => {
        animDoneRef.current = true
        showEnter()
      })
    }, root)

    return () => {
      window.clearTimeout(safety)
      ctx.revert()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleEnter = () => {
    const root = rootRef.current
    if (!root || exitingRef.current) return
    exitingRef.current = true
    sessionStorage.setItem('mr2-intro-seen', '1')
    // NOTE: do NOT add 'mr-intro-seen' to <html> here.
    // The CSS rule `html.mr-intro-seen .mr2-loader { display:none }` would fire
    // instantly and kill every GSAP tween before they can play.
    // The class is added by onComplete (in HomeExperienceV2.handleComplete)
    // after all animations have finished.

    // Reduced-motion fallback: simple fade
    if (prefersReducedMotion()) {
      mandaGsap.to(root, { autoAlpha: 0, duration: 0.6, onComplete })
      return
    }

    // ── Measure shared element positions before any transform ─────────
    const loaderLogoEl = loaderLogoRef.current
    const loaderWordEl = wordRef.current
    const navLogoEl    = document.querySelector<HTMLElement>('[data-nav-logo]')
    const heroNameEl   = document.querySelector<HTMLElement>('[data-hero-name]')

    // Disable pointer events so the transparent loader doesn't block the site
    mandaGsap.set(root, { pointerEvents: 'none' })

    const tl = mandaGsap.timeline({ onComplete })

    const TRAVEL_START = 0.15

    // ── Fade out elements that don't travel ───────────────────────────
    tl.to(
      [subRef.current, enterRef.current],
      { autoAlpha: 0, duration: 0.5, ease: EASE },
      0
    )

    // ── Dissolve the stripe bars + loader background ──────────────────
    tl.to('.mr2-loader__bars', { opacity: 0, duration: 1.2, ease: EASE }, 0)
    tl.to(root, { backgroundColor: 'transparent', duration: 1.5, ease: EASE }, 0)

    // ── Logo: loader center → nav corner ─────────────────────────────
    if (loaderLogoEl && navLogoEl) {
      const src = loaderLogoEl.getBoundingClientRect()
      const dst = navLogoEl.getBoundingClientRect()

      // Guard: if nav logo is display:none its rect will be 0×0 — fall back to fade
      if (src.width > 0 && dst.width > 0) {
        const scale = Math.min(dst.width / src.width, dst.height / src.height)
        const dx = (dst.left + dst.width  / 2) - (src.left + src.width  / 2)
        const dy = (dst.top  + dst.height / 2) - (src.top  + src.height / 2)

        mandaGsap.set(navLogoEl, { autoAlpha: 0 })

        tl.to(
          loaderLogoEl,
          { x: dx, y: dy, scale, transformOrigin: 'center center', duration: DUR.grand, ease: EASE },
          TRAVEL_START
        )

        // Crossfade near end of travel — PNG scales cleanly, no font rasterisation issue
        tl.to(loaderLogoEl, { autoAlpha: 0, duration: 0.28, ease: 'none' }, TRAVEL_START + DUR.grand - 0.28)
        tl.fromTo(navLogoEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: 'none' }, TRAVEL_START + DUR.grand - 0.2)
      } else {
        tl.to(loaderLogoEl, { autoAlpha: 0, duration: DUR.base, ease: EASE }, 0)
      }
    } else if (loaderLogoEl) {
      tl.to(loaderLogoEl, { autoAlpha: 0, duration: DUR.base, ease: EASE }, 0)
    }

    // ── Name: hero name travels FROM loader position → its natural home ──
    // We animate the HERO element (not the loader word) so it always renders
    // at its own native font-size.  It starts scaled/offset to sit on top of
    // the loader word, then eases to scale:1 — perfectly sharp at the end.
    // The loader word simply fades out; no scaling on it at all.
    if (loaderWordEl && heroNameEl) {
      const src = loaderWordEl.getBoundingClientRect()
      const dst = heroNameEl.getBoundingClientRect()

      if (src.width > 0 && dst.width > 0) {
        const scaleFrom = src.height / dst.height
        const dx = (src.left + src.width  / 2) - (dst.left + dst.width  / 2)
        const dy = (src.top  + src.height / 2) - (dst.top  + dst.height / 2)

        // Place hero name over the loader word, invisible
        mandaGsap.set(heroNameEl, {
          x: dx, y: dy, scale: scaleFrom,
          transformOrigin: 'center center',
          autoAlpha: 0,
        })

        // Fade loader word out in place — no position/scale change on it
        tl.to(loaderWordEl, { autoAlpha: 0, duration: 0.5, ease: 'power2.inOut' }, TRAVEL_START)

        // Hero name fades in and travels to x:0 y:0 scale:1
        // Starting slightly after the loader word begins to fade so they don't fully overlap
        tl.to(heroNameEl, {
          x: 0, y: 0, scale: 1, autoAlpha: 1,
          transformOrigin: 'center center',
          duration: DUR.grand, ease: EASE,
        }, TRAVEL_START + 0.18)
      } else {
        tl.to(loaderWordEl, { autoAlpha: 0, duration: DUR.base, ease: EASE }, 0)
      }
    } else if (loaderWordEl) {
      tl.to(loaderWordEl, { autoAlpha: 0, duration: DUR.base, ease: EASE }, 0)
    }
  }

  return (
    <div ref={rootRef} className="mr2-loader" aria-label="Loading">
      <div className="mr2-loader__bars" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div key={i} className="mr2-loader__bar" />
        ))}
      </div>

      <div className="mr2-loader__identity">
        {/* Logo — fades in after the field turns dark, travels to nav on ENTER */}
        <div ref={loaderLogoRef} className="mr2-loader__logo" aria-hidden="true">
          <img src="/art/logo/logo-cream.png" alt="" width={160} height={88} />
        </div>

        <h1 ref={wordRef} className="mr2-loader__word">
          Mandakini Rao
        </h1>
        <p ref={subRef} className="mr2-loader__sub">{tagline}</p>
      </div>

      <div className="mr2-loader__status">
        <button
          ref={enterRef}
          type="button"
          className="mr2-loader__enter"
          onClick={handleEnter}
        >
          Enter <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
