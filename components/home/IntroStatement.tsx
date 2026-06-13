'use client'

import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'

/**
 * Spec §6, extended — the first-person paragraph (from Mandakini's
 * about-me notes) pins at center while satellite fragments surface from
 * the margins as you scroll: her roles as large watermark display words,
 * her inspirations as small label clusters. Every fragment sits on the
 * page grid and enters in a fixed order so the field never feels random.
 */
const FRAGMENTS = [
  { text: 'Painter', kind: 'word', seat: 'a' },
  { text: 'People · Places · Architecture', kind: 'cluster', seat: 'b' },
  { text: 'Educator', kind: 'word', seat: 'c' },
  { text: 'Travel · Traditions · Music', kind: 'cluster', seat: 'd' },
  { text: 'Storyteller', kind: 'word', seat: 'e' },
  { text: 'Two decades · Hyderabad', kind: 'cluster', seat: 'f' },
] as const

export default function IntroStatement() {
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    const ctx = mandaGsap.context(() => {
      revealLines(textRef.current, { scrollTrigger: true, start: 'top 65%' })
      if (prefersReducedMotion()) return

      const frags = Array.from(
        stage.querySelectorAll<HTMLElement>('.mr-intro__frag')
      )
      mandaGsap.set(frags, { autoAlpha: 0, y: '6vh' })

      // One scrubbed pin: each fragment surfaces at its own point of the
      // scroll, then keeps drifting upward at its own rate (parallax).
      const tl = mandaGsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: '+=170%',
          pin: true,
          scrub: true,
        },
      })
      frags.forEach((frag, i) => {
        const at = 0.06 + i * 0.13
        tl.to(frag, { autoAlpha: 1, y: 0, duration: 0.16, ease: 'none' }, at)
        tl.to(
          frag,
          { y: '-4vh', duration: Math.max(0.2, 1 - (at + 0.16)), ease: 'none' },
          at + 0.16
        )
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr-intro" aria-label="Introduction">
      <div ref={stageRef} className="mr-intro__stage">
        {FRAGMENTS.map((frag) => (
          <span
            key={frag.seat}
            className={`mr-intro__frag mr-intro__frag--${frag.kind} mr-intro__frag--${frag.seat}`}
            aria-hidden="true"
          >
            {frag.text}
          </span>
        ))}

        <p ref={textRef} className="mr-intro__text" data-velocity-skew>
          Art has been part of my life for as long as I can remember — a
          childhood fascination with <em className="mr-accent">drawing</em>{' '}
          that grew into two decades of{' '}
          <em className="mr-accent">painting</em>, teaching and storytelling.
          I work from my studio in <em className="mr-accent">Hyderabad</em>,
          led by the same <em className="mr-accent">curiosity</em> that first
          drew me to art.
        </p>
      </div>
    </section>
  )
}
