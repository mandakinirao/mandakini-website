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
  /** Exit finished — unmount the loader, unlock scroll, play hero. */
  onComplete: () => void
  /** Hero card URLs to preload (from Sanity). Falls back to built-in set when empty. */
  heroAssets?: string[]
  tagline?: string
}

/**
 * V2 loader — the Siena sequence in Mandakini's hand: a cream field
 * with thin dark slits; the bars widen continuously until the field is
 * black, the name surfacing inside the stripes as they cross it
 * (blend-difference). Ends on black + name + a rectangular ENTER.
 * No counter — the ENTER appears once assets and animation are done.
 */
export default function LoadingScreenStripes({
  onComplete,
  heroAssets,
  tagline = 'Painter · Educator · Storyteller',
}: LoadingScreenStripesProps) {
  const HERO_ASSETS = heroAssets ?? []
  const rootRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLHeadingElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const loadedRef = useRef(0)
  const animDoneRef = useRef(false)
  const shownRef = useRef(false)
  const exitingRef = useRef(false)

  useEffect(() => {
    const root = rootRef.current
    const word = wordRef.current
    const enter = enterRef.current
    if (!root || !word || !enter) return

    lockScroll()

    const showEnter = () => {
      if (shownRef.current) return
      // wait for both the animation and (within reason) the assets
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

      if (prefersReducedMotion()) {
        mandaGsap.set(root, { backgroundColor: 'var(--v2-void)' })
        mandaGsap.set('.mr2-loader__bar', { scaleX: 1 })
        mandaGsap.set('.mr2-loader__sub', { autoAlpha: 1 })
        animDoneRef.current = true
        showEnter()
        return
      }

      // One continuous pass: slits → stripes → black.
      const tl = mandaGsap.timeline({ delay: 0.35 })
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
      // The name settles as the field turns — its own animation.
      tl.fromTo(
        word,
        { letterSpacing: '0.22em' },
        { letterSpacing: '0.1em', duration: 2.6, ease: EASE_SOFT_OUT },
        0.2
      )
      // Once black, kill the hairline seams and bring up the subline.
      tl.set(root, { backgroundColor: 'var(--v2-void)' })
      tl.fromTo(
        '.mr2-loader__sub',
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: DUR.fast, ease: EASE }
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
  }, [])

  const handleEnter = () => {
    const root = rootRef.current
    if (!root || exitingRef.current) return
    exitingRef.current = true
    sessionStorage.setItem('mr2-intro-seen', '1')
    // client-side navigations back home skip the loader instantly
    document.documentElement.classList.add('mr-intro-seen')

    if (prefersReducedMotion()) {
      mandaGsap.to(root, { autoAlpha: 0, duration: 0.6, onComplete })
      return
    }

    const tl = mandaGsap.timeline()
    tl.to(
      ['.mr2-loader__sub', '.mr2-loader__status'],
      { autoAlpha: 0, duration: 0.3, ease: EASE },
      0
    )
    tl.to(root, { yPercent: -100, duration: DUR.grand, ease: EASE }, 0.1)
    tl.add(onComplete, '-=0.5')
  }

  return (
    <div ref={rootRef} className="mr2-loader" aria-label="Loading">
      <div className="mr2-loader__bars" aria-hidden="true">
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <div key={i} className="mr2-loader__bar" />
        ))}
      </div>

      <div className="mr2-loader__identity">
        <h1 ref={wordRef} className="mr2-loader__word">
          Mandakini Rao
        </h1>
        <p className="mr2-loader__sub">{tagline}</p>
      </div>

      <div className="mr2-loader__status">
        <button
          ref={enterRef}
          type="button"
          className="mr2-loader__enter"
          data-cursor="enter"
          onClick={handleEnter}
        >
          Enter <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  )
}
