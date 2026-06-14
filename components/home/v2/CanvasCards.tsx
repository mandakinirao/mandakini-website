'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import {
  DUR,
  EASE,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
  revealLines,
} from '@/lib/motion'

interface CanvasCardsProps {
  portrait: string
  bio: string
}

/**
 * Homepage §2 — About. (File name kept so the orchestrator is untouched.)
 * A two-part editorial composition: a parallax portrait inside a
 * generously rounded mask, and one display line with a pill CTA to
 * /about. The previous rolling-word ticker is fully removed.
 */
export default function CanvasCards({ portrait, bio }: CanvasCardsProps) {
  const rootRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const mask = maskRef.current
    if (!root || !mask) return

    const ctx = mandaGsap.context(() => {
      const img = mask.querySelector('img')

      // The line uses the site's standard clipped line reveal.
      revealLines(root.querySelector('.mr2-about__line'), {
        scrollTrigger: true,
        start: 'top 72%',
      })

      if (prefersReducedMotion() || !img) {
        if (img) mandaGsap.set(img, { scale: 1.15 })
        return
      }

      // Standard scale-inside-mask reveal: the mask un-clips while the
      // image settles 1.3 → 1.15 (its parallax rest scale).
      mandaGsap.set(mask, { clipPath: 'inset(100% 0% 0% 0%)' })
      mandaGsap.set(img, { scale: 1.3 })
      const reveal = mandaGsap.timeline({
        defaults: { duration: DUR.base, ease: EASE },
        scrollTrigger: { trigger: mask, start: 'top 80%', once: true },
      })
      reveal.to(mask, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
      reveal.to(img, { scale: 1.15 }, 0)

      // Restrained parallax inside the mask; off on touch (jank risk).
      if (!isTouch()) {
        mandaGsap.fromTo(
          img,
          { yPercent: -5 },
          {
            yPercent: 5,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        )
      }

      // CTA eases in after the line.
      mandaGsap.from('.mr2-about__cta', {
        y: 22,
        autoAlpha: 0,
        duration: DUR.fast,
        ease: EASE,
        scrollTrigger: { trigger: root, start: 'top 60%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr2-about" aria-label="About Mandakini">
      <div ref={maskRef} className="mr2-about__media">
        <Image
          src={portrait}
          alt="Mandakini Rao in her studio"
          fill
          sizes="(max-width: 900px) 92vw, 44vw"
        />
      </div>

      <div className="mr2-about__text">
        <p className="mr2-about__line">{bio}</p>
        <Link href="/about" className="mr2-about__cta" data-cursor="view">
          About Mandakini
        </Link>
      </div>
    </section>
  )
}
