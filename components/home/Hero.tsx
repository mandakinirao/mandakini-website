'use client'

import Image from 'next/image'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import {
  DUR,
  EASE,
  EASE_OUT,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
  revealLines,
} from '@/lib/motion'

export interface HeroHandle {
  /** The inline name element the loader wordmark FLIPs onto. */
  getNameEl: () => HTMLElement | null
  /**
   * Post-iris entrance: background settles 1.08 → 1, cutout rises,
   * nav fades in last. When `flipName` the parent owns the name's arrival;
   * otherwise the name reveals via revealLines (intro-skipped path).
   */
  playEntrance: (opts?: { flipName?: boolean }) => void
}

// Two-layer hero: the person-free studio scene sits behind a transparent
// cutout of Mandakini, so the parallax layers never show her twice (spec §5).
const HAS_CUTOUT = true // /public/images/hero/mandakini-cutout.png is in the repo

const Hero = forwardRef<HeroHandle>(function Hero(_props, ref) {
  const rootRef = useRef<HTMLElement>(null)
  const zoomRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)
  const cutoutRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLSpanElement>(null)

  useImperativeHandle(ref, () => ({
    getNameEl: () => nameRef.current,
    playEntrance: ({ flipName }: { flipName?: boolean } = {}) => {
      const bg = bgRef.current
      const cutout = cutoutRef.current
      const name = nameRef.current
      if (prefersReducedMotion()) {
        mandaGsap.set([bg, cutout, name, '.site-nav'].filter(Boolean), {
          clearProps: 'opacity,visibility',
          autoAlpha: 1,
        })
        return
      }
      const tl = mandaGsap.timeline({ defaults: { ease: EASE } })
      if (bg) tl.fromTo(bg, { scale: 1.08 }, { scale: 1, duration: DUR.grand }, 0)
      if (cutout) {
        tl.fromTo(
          cutout,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: DUR.base },
          0.15
        )
      }
      if (!flipName && name) {
        mandaGsap.set(name, { autoAlpha: 1 })
        revealLines(name, { delay: 0.2 })
      }
      tl.fromTo(
        '.site-nav',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: DUR.fast },
        DUR.grand * 0.75
      )
    },
  }))

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    let removeMove: (() => void) | null = null

    const ctx = mandaGsap.context(() => {
      if (prefersReducedMotion()) return

      // Hidden until the FLIP morph or revealLines delivers it.
      mandaGsap.set(nameRef.current, { opacity: 0 })

      // Scroll exit — the cream page reclaims the frame (spec §5).
      const exit = mandaGsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=120%',
          pin: true,
          scrub: true,
        },
      })
      exit.fromTo(
        '.mr-hero__media',
        { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
        { clipPath: 'inset(9vh 7vw 11vh 7vw round 56px)', duration: 1 },
        0
      )
      exit.fromTo(zoomRef.current, { scale: 1 }, { scale: 1.08, duration: 1 }, 0)
      // Layered parallax differentials: background slowest, cutout fastest.
      exit.to(bgRef.current, { yPercent: -4, duration: 1 }, 0)
      if (cutoutRef.current) {
        exit.to(cutoutRef.current, { yPercent: -12, duration: 1 }, 0)
      }
      // The name's letters drift apart and it is gone by ~60% progress.
      exit.to(
        nameRef.current,
        { letterSpacing: '0.16em', autoAlpha: 0, duration: 0.6 },
        0
      )

      // Desktop pointer parallax — lerped, off on touch.
      if (!isTouch()) {
        const toBgX = mandaGsap.quickTo(bgRef.current, 'x', {
          duration: 0.8,
          ease: EASE_OUT,
        })
        const toBgY = mandaGsap.quickTo(bgRef.current, 'y', {
          duration: 0.8,
          ease: EASE_OUT,
        })
        const toFgX = cutoutRef.current
          ? mandaGsap.quickTo(cutoutRef.current, 'x', {
              duration: 0.8,
              ease: EASE_OUT,
            })
          : null
        const toFgY = cutoutRef.current
          ? mandaGsap.quickTo(cutoutRef.current, 'y', {
              duration: 0.8,
              ease: EASE_OUT,
            })
          : null
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          toBgX(nx * -16)
          toBgY(ny * -16)
          toFgX?.(nx * 40)
          toFgY?.(ny * 40)
        }
        window.addEventListener('pointermove', onMove, { passive: true })
        removeMove = () => window.removeEventListener('pointermove', onMove)
      }
    }, root)

    return () => {
      removeMove?.()
      ctx.revert()
    }
  }, [])

  return (
    <section ref={rootRef} className="mr-hero" aria-label="Mandakini Rao">
      <div className="mr-hero__media">
        <div ref={zoomRef} className="mr-hero__zoom">
          <div ref={bgRef} className="mr-hero__layer mr-hero__bg">
            <Image
              src="/images/hero/studio-without-person.jpg"
              alt="Mandakini Rao's Hyderabad studio"
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="mr-hero__tint" aria-hidden="true" />
          <h1 className="mr-hero__name">
            <span ref={nameRef} className="mr-hero__name-inner">
              Mandakini Rao
            </span>
          </h1>
          {HAS_CUTOUT && (
            <div ref={cutoutRef} className="mr-hero__cutout" aria-hidden="true">
              <Image
                src="/images/hero/mandakini-cutout.png"
                alt=""
                fill
                priority
                sizes="100vw"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
})

export default Hero
