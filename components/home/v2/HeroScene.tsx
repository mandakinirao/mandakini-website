'use client'

/**
 * Hero — clip-path reveal on scroll, GSAP-pinned for Lenis sync.
 *
 * GSAP pin: true on the section (not CSS sticky) keeps everything on the
 * same Lenis-driven tick → no desync → no jumpiness.
 *
 * Text starts centred inside the small clip window and drifts to
 * lower-centre as the clip expands to fullscreen.
 */

import Image from 'next/image'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

// ── Tunable ───────────────────────────────────────────────────────────
const SCROLL_DIST      = 1400
// Asymmetric clip: 8% top (face visible), 18% sides, 32% bottom (text headroom)
const CLIP_FROM        = 'inset(8% 18% 32% 18% round 2rem)'
const CLIP_TO          = 'inset(0% round 0rem)'
const IMAGE_SCALE_FROM = 1.3
const TEXT_SCALE_FROM  = 0.48
// Clip-centre V = (8 + 68) / 2 = 38%; text ends at 72% → travel = 34% of vh
const TEXT_Y_TRAVEL    = 0.34
// ──────────────────────────────────────────────────────────────────────

export interface HeroSceneHandle {
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const sectionRef = useRef<HTMLElement>(null)
    const clipRef    = useRef<HTMLDivElement>(null)
    const textRef    = useRef<HTMLDivElement>(null)
    const playedRef  = useRef(false)

    useImperativeHandle(ref, () => ({
      playEntrance() {
        if (playedRef.current) return
        playedRef.current = true
        const text = textRef.current
        if (!text || prefersReducedMotion()) return
        // Operate on CHILDREN (name, sub) — independent from parent's scroll-driven y
        const name = text.querySelector('.mr2-hscene__name')
        const sub  = text.querySelector('.mr2-hscene__sub')
        mandaGsap.set([name, sub], { autoAlpha: 0, y: 18 })
        mandaGsap.timeline({ delay: 0.2 })
          .to(name, { autoAlpha: 1, y: 0, duration: DUR.base,  ease: EASE })
          .to(sub,  { autoAlpha: 1, y: 0, duration: DUR.grand, ease: EASE }, '-=0.55')
      },
    }))

    useEffect(() => {
      const section = sectionRef.current
      const clip    = clipRef.current
      const text    = textRef.current
      if (!section || !clip) return

      // Set clip before motion check so card renders correctly even without JS animation
      mandaGsap.set(clip, { clipPath: CLIP_FROM })

      if (prefersReducedMotion()) return

      const img = clip.querySelector('img')

      // Centre text on its anchor point via percent-based translation (not animated)
      mandaGsap.set(text, { xPercent: -50, yPercent: -50 })

      const tl = mandaGsap.timeline({
        scrollTrigger: {
          trigger:             section,
          start:               'top top',
          end:                 `+=${SCROLL_DIST}`,
          pin:                 true,   // GSAP pin — same Lenis tick, no CSS sticky desync
          scrub:               1,      // 1s lag for silky smoothness
          invalidateOnRefresh: true,
        },
      })

      // All three tweens share the same timeline progress (parallel, starting at 0)
      tl.fromTo(clip,
        { clipPath: CLIP_FROM },
        { clipPath: CLIP_TO, ease: 'none' },
        0
      )
      if (img) {
        tl.fromTo(img,
          { scale: IMAGE_SCALE_FROM },
          { scale: 1, ease: 'none' },
          '<'
        )
      }
      // Text drifts from clip-centre (38% V) to lower-centre (72% V)
      tl.fromTo(text,
        { y: () => -(window.innerHeight * TEXT_Y_TRAVEL), scale: TEXT_SCALE_FROM },
        { y: 0, scale: 1, ease: 'none' },
        '<'
      )

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }, [])

    return (
      <section ref={sectionRef} className="mr2-hscene" aria-label="Mandakini Rao — artist studio">

        {/* Clip wrapper — image, vignette, and text all expand together */}
        <div ref={clipRef} className="mr2-hscene__clip">
          <Image
            src="/art/hero/hero-main.jpg"
            alt="Mandakini Rao in her studio"
            fill
            priority
            sizes="100vw"
            className="mr2-hscene__img"
          />
          <div className="mr2-hscene__vignette" aria-hidden="true" />

          {/* Text inside clip, anchored at final lower-centre position.
              GSAP shifts it up to clip-centre at scroll=0, drifts down as clip opens. */}
          <div ref={textRef} className="mr2-hscene__text">
            <h1 className="mr2-hscene__name">Mandakini Rao</h1>
            <p className="mr2-hscene__sub">{tagline}</p>
          </div>
        </div>

        {/* Scroll cue in dark cacao surround, outside clip */}
        <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>

      </section>
    )
  }
)

export default HeroScene
