'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import InkReveal from './InkReveal'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

// ── Tunable ──────────────────────────────────────────────────────────────
const CLIP_FROM   = 'inset(8% 18% 32% 18% round clamp(12px, 2vw, 24px))'
const CLIP_TO     = 'inset(0% 0% 0% 0% round 0px)'
const SCROLL_DIST = 900  // px of scroll while the section is pinned
// ─────────────────────────────────────────────────────────────────────────

export interface HeroSceneHandle {
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    const sectionRef = useRef<HTMLElement>(null)
    const clipRef    = useRef<HTMLDivElement>(null)
    const textRef    = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      playEntrance() {
        const text = textRef.current
        if (!text) return
        mandaGsap.fromTo(
          text.querySelectorAll('[data-hero-name], .mr2-hscene__sub'),
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: DUR.grand, ease: EASE, stagger: 0.15 }
        )
      },
    }), [])

    useEffect(() => {
      const section = sectionRef.current
      const clip    = clipRef.current
      const text    = textRef.current
      if (!section || !clip || !text) return

      const ctx = mandaGsap.context(() => {
        // Children start hidden — playEntrance reveals them after loader
        mandaGsap.set(
          text.querySelectorAll('[data-hero-name], .mr2-hscene__sub'),
          { autoAlpha: 0 }
        )

        if (prefersReducedMotion()) return

        // Centre the text container; GSAP's xPercent/yPercent handle the
        // origin correctly even while scroll-driven y is applied to the parent.
        mandaGsap.set(text, { xPercent: -50, yPercent: -50 })

        const tl = mandaGsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: `+=${SCROLL_DIST}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })

        // 1. Clip expands: rounded inset card → full viewport
        tl.fromTo(clip, { clipPath: CLIP_FROM }, { clipPath: CLIP_TO, ease: 'none' }, 0)
        // 2. Image un-zooms in sync with the expanding clip
        tl.fromTo('.mr2-ink', { scale: 1.08 }, { scale: 1, ease: 'none' }, '<')
        // 3. Text starts centred inside the small clip window (38% from top)
        //    and drifts to lower-centre (72%) as the clip opens.
        tl.fromTo(
          text,
          { y: () => -(window.innerHeight * 0.34), scale: 0.72 },
          { y: 0, scale: 1, ease: 'none' },
          '<'
        )
      })

      return () => ctx.revert()
    }, [])

    return (
      <section ref={sectionRef} className="mr2-hscene" aria-label="Mandakini Rao — artist studio">
        <div ref={clipRef} className="mr2-hscene__clip">
          <InkReveal
            topSrc="/art/hero/hero-bw.jpg"
            bottomSrc="/art/hero/hero-bottom.png"
          />
          <div className="mr2-hscene__vignette" aria-hidden="true" />
        </div>

        <div ref={textRef} className="mr2-hscene__text">
          <h1 className="mr2-hscene__name" data-hero-name>Mandakini Rao</h1>
          <p className="mr2-hscene__sub">{tagline}</p>
        </div>

        <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>
      </section>
    )
  }
)

export default HeroScene
