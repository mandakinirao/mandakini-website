'use client'

import { useEffect, useRef } from 'react'
import type { HomePress, HomeTestimonial } from '@/lib/home-data'
import {
  mandaGsap,
  prefersReducedMotion,
  revealLines,
} from '@/lib/motion'

interface PressStripProps {
  items: HomePress[]
  testimonials: HomeTestimonial[]
}

/**
 * Spec §10, extended — voices first (testimonial quotes in the display
 * face), then the compact editorial press / podcast / interview list.
 */
export default function PressStrip({ items, testimonials }: PressStripProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-eyebrow'), { scrollTrigger: true })
      root
        .querySelectorAll<HTMLElement>('.mr-press__quote')
        .forEach((quote, i) => {
          revealLines(quote.querySelector('blockquote'), {
            scrollTrigger: true,
            delay: (i % 3) * 0.08,
          })
          revealLines(quote.querySelector('cite'), {
            scrollTrigger: true,
            delay: (i % 3) * 0.08 + 0.15,
          })
        })
      root.querySelectorAll<HTMLElement>('.mr-press__row').forEach((row) => {
        const rule = row.querySelector('.mr-press__rule')
        if (rule && !prefersReducedMotion()) {
          mandaGsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: row,
                start: 'top 95%',
                end: 'top 70%',
                scrub: true,
              },
            }
          )
        }
        revealLines(row.querySelector('.mr-press__source'), {
          scrollTrigger: true,
        })
      })
    }, root)
    return () => ctx.revert()
  }, [items])

  return (
    <section
      ref={rootRef}
      className="mr-section mr-press"
      aria-label="Press"
      data-bg="night"
    >
      <p className="mr-eyebrow">Voices &amp; Press</p>

      <div className="mr-press__quotes">
        {testimonials.map((t) => (
          <figure key={t.author} className="mr-press__quote">
            <blockquote>“{t.quote}”</blockquote>
            <cite>{t.author}</cite>
          </figure>
        ))}
      </div>

      <div className="mr-press__list">
        {items.map((item) => {
          const inner = (
            <>
              <span className="mr-press__rule" aria-hidden="true" />
              <span className="mr-press__source">{item.source}</span>
              <span className="mr-press__title">{item.title}</span>
              <span className="mr-press__year">{item.year}</span>
            </>
          )
          return item.url ? (
            <a
              key={item.source + item.year}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="mr-press__row"
            >
              {inner}
            </a>
          ) : (
            <span key={item.source + item.year} className="mr-press__row">
              {inner}
            </span>
          )
        })}
      </div>
    </section>
  )
}
