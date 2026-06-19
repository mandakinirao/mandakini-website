'use client'

import { useRef, useEffect } from 'react'
import { mandaGsap, EASE, DUR, prefersReducedMotion } from '@/lib/motion'
import type { EdgeWord } from '@/components/AboutSection'

interface AboutEdgeWordsProps {
  bodyParagraph?: string[]
  edgeWords?: EdgeWord[]
  seriesTitles?: string[]
  colophon?: string[]
}

const FONT_SIZE: Record<'S' | 'M' | 'L', string> = {
  S: 'clamp(1.2rem, 4vw, 3.5rem)',
  M: 'clamp(2rem, 7vw, 7rem)',
  L: 'clamp(3.5rem, 12vw, 13rem)',
}

export default function AboutEdgeWords({
  bodyParagraph,
  edgeWords,
  seriesTitles,
  colophon,
}: AboutEdgeWordsProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const hasContent =
    (bodyParagraph?.length ?? 0) > 0 ||
    (edgeWords?.length ?? 0) > 0 ||
    (seriesTitles?.length ?? 0) > 0 ||
    (colophon?.length ?? 0) > 0

  useEffect(() => {
    const section = sectionRef.current
    if (!section || !hasContent) return
    const rm = prefersReducedMotion()

    const ctx = mandaGsap.context(() => {
      // Body fragments: fade + rise on scroll
      if ((bodyParagraph?.length ?? 0) > 0) {
        mandaGsap.from('.about-edge__frag', {
          opacity: 0,
          y: rm ? 0 : 24,
          duration: DUR.base,
          ease: EASE,
          stagger: rm ? 0 : 0.05,
          scrollTrigger: {
            trigger: '.about-edge__body',
            start: 'top 72%',
            once: true,
          },
        })
      }

      // Edge words: scroll-driven horizontal drift
      const wordEls = section.querySelectorAll<HTMLElement>('[data-edge-word]')
      wordEls.forEach((el, i) => {
        const side = el.dataset.side as 'left' | 'right'
        const depth = parseFloat(el.dataset.depth ?? '1')
        const isLeft = side === 'left'

        // Opacity encodes depth: back=faint, front=solid
        const opacity = 0.18 + depth * 0.82
        mandaGsap.set(el, { opacity })

        if (rm) return

        // Settled X: deep words stay more off-screen (parallax depth)
        // left side: negative = off left edge; right side: positive = off right edge
        const settledVw = isLeft
          ? -(20 + (1 - depth) * 40) // depth=1 → -20vw, depth=0 → -60vw
          : 20 + (1 - depth) * 40    // depth=1 →  20vw, depth=0 →  60vw

        // Stagger scroll start so words drift independently (not lockstep)
        mandaGsap.fromTo(
          el,
          { x: isLeft ? '-130vw' : '130vw' },
          {
            x: `${settledVw}vw`,
            ease: 'none', // scrubbed tweens must be linear
            scrollTrigger: {
              trigger: section,
              start: `top+=${i * 90} 88%`,
              end: 'bottom 12%',
              scrub: 0.6,
            },
          }
        )
      })

      // Footer labels: fade in
      if ((seriesTitles?.length ?? 0) + (colophon?.length ?? 0) > 0) {
        mandaGsap.from('.about-edge__series li, .about-edge__colophon p', {
          opacity: 0,
          y: rm ? 0 : 16,
          duration: DUR.base,
          ease: EASE,
          stagger: rm ? 0 : 0.06,
          scrollTrigger: {
            trigger: '.about-edge__footer',
            start: 'top 85%',
            once: true,
          },
        })
      }
    }, sectionRef)
    return () => ctx.revert()
  }, [hasContent, bodyParagraph?.length, edgeWords?.length, seriesTitles?.length, colophon?.length])

  if (!hasContent) return null

  const wordCount = edgeWords?.length ?? 0

  return (
    <section ref={sectionRef} className="about-edge-section">
      {/* Body paragraph — fractured 3-column */}
      {bodyParagraph && bodyParagraph.length > 0 && (
        <div className="about-edge__body">
          <div className="about-edge__frag-grid">
            {bodyParagraph.map((frag, i) => (
              <p key={i} className={`about-edge__frag about-edge__frag--${i % 3}`}>
                {frag}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Edge words — absolutely positioned, scroll-driven drift */}
      {edgeWords?.map((word, i) => {
        const topPercent =
          wordCount <= 1 ? 45 : 30 + (i / (wordCount - 1)) * 38
        return (
          <div
            key={word._key}
            className={`about-edge__word about-edge__word--${word.side}`}
            data-edge-word=""
            data-side={word.side}
            data-depth={word.depth ?? 1}
            style={{ fontSize: FONT_SIZE[word.scale ?? 'M'], top: `${topPercent}%` }}
            aria-hidden="true"
          >
            {word.text}
          </div>
        )
      })}

      {/* Footer: series list (left) + colophon (right) */}
      {((seriesTitles?.length ?? 0) > 0 || (colophon?.length ?? 0) > 0) && (
        <div className="about-edge__footer">
          {seriesTitles && seriesTitles.length > 0 && (
            <ul className="about-edge__series">
              {seriesTitles.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          )}
          {colophon && colophon.length > 0 && (
            <div className="about-edge__colophon">
              {colophon.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
