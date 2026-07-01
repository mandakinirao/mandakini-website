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

    mandaGsap.set(root, { pointerEvents: 'none' })

    // Reduced-motion fallback: simple fade
    if (prefersReducedMotion()) {
      mandaGsap.to(root, { autoAlpha: 0, duration: 0.6, onComplete })
      return
    }

    const tl = mandaGsap.timeline({ onComplete })

    // Identity (logo, name, subline, enter) fades out quickly
    tl.to(
      [loaderLogoRef.current, wordRef.current, subRef.current, enterRef.current],
      { autoAlpha: 0, duration: 0.4, ease: EASE },
      0
    )

    // Bars retract from full width back to slits — shutter opening in reverse
    tl.to(
      '.mr2-loader__bar',
      {
        scaleX: 0.055,
        duration: 1.6,
        ease: EASE_SOFT_INOUT,
        stagger: { each: 0.012, from: 'center' },
      },
      0.1
    )

    // Field lifts to transparent as bars retract
    tl.to(root, { backgroundColor: 'transparent', duration: 1.4, ease: EASE }, 0.3)
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
