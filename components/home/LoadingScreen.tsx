'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import {
  DUR,
  EASE,
  EASE_SINE,
  STAGGER,
  lockScroll,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'

// The MS Subbulakshmi series — gazes seated to look toward the center.
const PORTRAITS = [
  '/art/subbulakshmi/ms-cut-4.webp',
  '/art/subbulakshmi/ms-sq-3.jpg',
  '/art/subbulakshmi/ms-sq-2.jpg',
  '/art/subbulakshmi/ms-sq-1.jpg',
  '/art/subbulakshmi/ms-sq-4.jpg',
  '/art/subbulakshmi/ms-cut-2.webp',
  '/art/subbulakshmi/ms-cut-1.webp',
]

const CENTER = 3 // DOM order is leftmost → rightmost; the 4th seat is central
const MIN_RUNTIME_MS = 1800
const LOAD_SAFETY_MS = 6000

interface LoadingScreenProps {
  /** Parent FLIP-morphs the wordmark to its hero position; runs alongside the iris. */
  onExit: (wordmarkEl: HTMLElement) => void
  /** Iris finished — safe to unmount the loader and unlock scroll. */
  onComplete: () => void
}

/**
 * Spec §4 — the MS Subbulakshmi fan against deep cacao, a real-progress
 * counter, a breathing circular ENTER, and the iris reveal into the hero.
 */
export default function LoadingScreen({ onExit, onComplete }: LoadingScreenProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)
  const counterRef = useRef<HTMLSpanElement>(null)
  const enterRef = useRef<HTMLButtonElement>(null)
  const loadedRef = useRef(0)
  const exitingRef = useRef(false)

  const handleAsset = () => {
    loadedRef.current += 1
  }

  useEffect(() => {
    const root = rootRef.current
    const shade = shadeRef.current
    const counter = counterRef.current
    const enter = enterRef.current
    if (!root || !shade || !counter || !enter) return

    lockScroll()
    document.body.classList.add('home-intro-active')

    const ctx = mandaGsap.context(() => {
      mandaGsap.set(enter, { autoAlpha: 0, scale: 0.9 })

      if (prefersReducedMotion()) {
        // Reduced path: wordmark + ENTER, no fan choreography, no counter run.
        counter.textContent = ''
        mandaGsap.set(enter, { autoAlpha: 1, scale: 1 })
        revealLines(wordmarkRef.current)
        return
      }

      // Fan entrance — the central portrait uncovers first; the other eight
      // wait stacked behind it, then each ring of two slides out to its seat.
      const seats = Array.from(
        shade.querySelectorAll<HTMLElement>('.mr-loader__seat')
      )
      const FAN_START = 0.2 + DUR.base * 0.7 // pairs emerge as the center settles
      const RING_GAP = 0.22

      revealImage(seats[CENTER]?.querySelector('.mr-loader__portrait') ?? null, {
        delay: 0.2,
      })

      seats.forEach((seat, i) => {
        if (i === CENTER) return
        const cs = getComputedStyle(seat)
        const target = {
          '--fx': cs.getPropertyValue('--fx').trim() || '0vw',
          '--fy': cs.getPropertyValue('--fy').trim() || '0vh',
          '--rot': cs.getPropertyValue('--rot').trim() || '0deg',
          '--s': cs.getPropertyValue('--s').trim() || '1',
        }
        // Park the seat at the center slot, fully hidden behind the first
        // portrait, with the image already at its resting scale.
        mandaGsap.set(seat, {
          autoAlpha: 0,
          '--fx': '0vw',
          '--fy': '0vh',
          '--rot': '0deg',
          '--s': '1',
        })
        const img = seat.querySelector('[data-reveal-img]')
        if (img) mandaGsap.set(img, { scale: 1.12 })

        const ring = Math.abs(i - CENTER) // 1..4, each ring is a pair
        mandaGsap
          .timeline({ delay: FAN_START + (ring - 1) * RING_GAP })
          .set(seat, { autoAlpha: 1 }) // still covered by the center portrait
          .to(seat, { ...target, duration: DUR.base, ease: EASE })
      })

      revealLines(wordmarkRef.current, {
        delay: FAN_START + 3 * RING_GAP + DUR.base * 0.5,
      })

      // Counter: real asset progress clamped to a minimum 1.8s runtime.
      const start = performance.now()
      let finished = false
      const tick = () => {
        if (finished) return
        const elapsed = performance.now() - start
        const timeP = Math.min(1, elapsed / MIN_RUNTIME_MS)
        const assetP =
          elapsed > LOAD_SAFETY_MS ? 1 : loadedRef.current / PORTRAITS.length
        const p = Math.min(timeP, assetP)
        counter.textContent = String(Math.round(p * 100)).padStart(2, '0')
        if (p >= 1) {
          finished = true
          mandaGsap.ticker.remove(tick)
          // Counter crossfades into the circular ENTER.
          mandaGsap.to(counter, { autoAlpha: 0, duration: DUR.fast, ease: EASE })
          mandaGsap.to(enter, {
            autoAlpha: 1,
            scale: 1,
            duration: DUR.fast,
            ease: EASE,
            onComplete: () => {
              mandaGsap.to(enter, {
                scale: 1.03,
                duration: 1.6,
                ease: EASE_SINE,
                repeat: -1,
                yoyo: true,
              })
            },
          })
        }
      }
      mandaGsap.ticker.add(tick)
    }, root)

    return () => {
      ctx.revert()
      document.body.classList.remove('home-intro-active')
    }
  }, [])

  const handleEnter = () => {
    const root = rootRef.current
    const shade = shadeRef.current
    const wordmark = wordmarkRef.current
    if (!root || !shade || !wordmark || exitingRef.current) return
    exitingRef.current = true
    sessionStorage.setItem('mr-intro-seen', '1')

    if (prefersReducedMotion()) {
      onExit(wordmark)
      mandaGsap.to(root, {
        autoAlpha: 0,
        duration: 0.6,
        onComplete,
      })
      return
    }

    const seats = Array.from(
      shade.querySelectorAll<HTMLElement>('.mr-loader__seat')
    )
    const vw = window.innerWidth
    const vh = window.innerHeight
    const cx = vw / 2
    const cy = vh * 0.44

    const tl = mandaGsap.timeline()

    // 1 — the eight outer portraits drift outward on their own vectors.
    seats.forEach((seat, i) => {
      if (i === CENTER) return
      const rect = seat.getBoundingClientRect()
      const dx = rect.left + rect.width / 2 - cx
      const dy = rect.top + rect.height / 2 - cy
      const mag = Math.hypot(dx, dy) || 1
      const portrait = seat.querySelector('.mr-loader__portrait')
      if (!portrait) return
      tl.to(
        portrait,
        {
          x: (dx / mag) * 70,
          y: (dy / mag) * 70,
          autoAlpha: 0,
          duration: DUR.fast,
          ease: EASE,
        },
        Math.abs(i - CENTER) * STAGGER.burst
      )
    })

    tl.to(
      '.mr-loader__status',
      { autoAlpha: 0, duration: DUR.fast, ease: EASE },
      0
    )

    // 2 — the aperture opens from the central portrait until it clears
    //     the viewport diagonal. 3 — parent FLIPs the wordmark in parallel.
    const radius = Math.hypot(vw, vh) * 1.05
    tl.add(() => onExit(wordmark), DUR.fast * 0.5)
    tl.to(
      shade,
      {
        '--iris-r': `${radius}px`,
        duration: DUR.grand,
        ease: EASE,
      },
      DUR.fast * 0.5
    )
    tl.add(onComplete)
  }

  return (
    <div ref={rootRef} className="mr-loader-wrap" aria-label="Loading">
      <div ref={shadeRef} className="mr-loader">
        <div className="mr-loader__fan" aria-hidden="true">
          {PORTRAITS.map((src, i) => (
            <div key={src} className="mr-loader__seat">
              <div className="mr-loader__portrait mr-mask">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 26vw, 21vw"
                  priority={Math.abs(i - CENTER) <= 1}
                  data-reveal-img
                  onLoad={handleAsset}
                  onError={handleAsset}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mr-loader__status">
          <span ref={counterRef} className="mr-loader__counter">
            00
          </span>
          <button
            ref={enterRef}
            type="button"
            className="mr-loader__enter"
            data-cursor="enter"
            onClick={handleEnter}
          >
            Enter
          </button>
        </div>
      </div>

      <div className="mr-loader__identity">
        <h1 ref={wordmarkRef} className="mr-loader__wordmark">
          Mandakini Rao
        </h1>
      </div>
    </div>
  )
}
