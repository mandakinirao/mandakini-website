'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { DUR, mandaGsap, prefersReducedMotion } from '@/lib/motion'
import '@/styles/testimonials.css'

type Testimonial = { _id?: string; quote: string; personName: string; personImage: string }

/** Stable per-card tilt for the photo stack — computed once so inactive
 *  cards don't jump to a new random angle on every transition. */
function useStackRotations(count: number) {
  return useMemo(
    () => Array.from({ length: count }, () => Math.floor(Math.random() * 16) - 8),
    [count]
  )
}

/** Card pose for a given active index. GSAP owns these properties after the
 *  first paint — React never writes card transforms again, so nothing snaps
 *  mid-animation. */
function pose(i: number, active: number, count: number, rotation: number) {
  const isActive = i === active
  return {
    opacity: isActive ? 1 : 0.5,
    scale: isActive ? 1 : 0.9,
    y: isActive ? 0 : 20,
    rotate: isActive ? 0 : rotation,
    zIndex: isActive ? count : count - Math.abs(i - active),
  }
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const count = items?.length ?? 0
  const rotations = useStackRotations(count)

  // First paint: set every card's pose and show only the first quote.
  useLayoutEffect(() => {
    cardRefs.current.forEach((card, i) => card && mandaGsap.set(card, pose(i, 0, count, rotations[i])))
    slideRefs.current.forEach((slide, i) => slide && mandaGsap.set(slide, { autoAlpha: i === 0 ? 1 : 0, y: 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  const goTo = (next: number) => {
    if (count === 0) return
    const target = (next + count) % count
    if (target === index) return
    const from = index
    setIndex(target)

    const instant = prefersReducedMotion()
    const d = instant ? 0 : DUR.fast

    // Quotes cross-fade in place (same grid cell, fixed height).
    const out = slideRefs.current[from]
    const inn = slideRefs.current[target]
    if (out) mandaGsap.to(out, { autoAlpha: 0, y: -12, duration: d * 0.6, ease: 'power2.in', overwrite: true })
    if (inn) mandaGsap.fromTo(inn, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: d, delay: d * 0.35, ease: 'power2.out', overwrite: true })

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const p = pose(i, target, count, rotations[i])
      // Bring the new card to the front immediately so it never slides under another.
      if (i === target) mandaGsap.set(card, { zIndex: p.zIndex })
      mandaGsap.to(card, { ...p, duration: d, ease: 'power2.inOut', overwrite: true })
    })
  }

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion()) return
    const id = setInterval(() => goTo(index + 1), 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count])

  if (!count) return null

  return (
    <section className="testimonials" aria-roledescription="carousel" aria-label="Testimonials">
      <div className="testimonials-inner">
        <span className="testimonials-eyebrow">in their words</span>

        <div className="testimonials-stage">
          <div className="testimonials-stack">
            {items.map((t, i) => (
              <div
                key={t._id ?? i}
                ref={(el) => { cardRefs.current[i] = el }}
                className="testimonial-card"
                aria-hidden={i !== index}
              >
                {t.personImage ? (
                  <Image
                    src={t.personImage}
                    alt={t.personName}
                    width={400}
                    height={480}
                    className="testimonial-card__img"
                  />
                ) : (
                  <div className="testimonial-card__placeholder" />
                )}
              </div>
            ))}
          </div>

          <div className="testimonial-content">
            {items.map((t, i) => (
              <div
                key={t._id ?? i}
                ref={(el) => { slideRefs.current[i] = el }}
                className="testimonial-slide"
                aria-hidden={i !== index}
              >
                <div className="testimonial-author">{t.personName}</div>
                <blockquote className="testimonial-quote">{t.quote}</blockquote>
              </div>
            ))}
          </div>
        </div>

        {count > 1 && (
          <div className="testimonials-nav" role="group" aria-label="Testimonial controls">
            <button
              type="button"
              className="testimonials-arrow"
              onClick={() => goTo(index - 1)}
              aria-label="Previous testimonial"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="testimonials-dots">
              {items.map((t, i) => (
                <button
                  key={t._id ?? i}
                  type="button"
                  className={`testimonials-dot${i === index ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index ? true : undefined}
                />
              ))}
            </div>
            <button
              type="button"
              className="testimonials-arrow"
              onClick={() => goTo(index + 1)}
              aria-label="Next testimonial"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
