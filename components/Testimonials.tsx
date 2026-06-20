'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { gsap } from 'gsap'
import { EASE, DUR, prefersReducedMotion } from '@/lib/motion'
import '@/styles/testimonials.css'

type Testimonial = { _id?: string; quote: string; author: string; role?: string }

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const quoteRef = useRef<HTMLDivElement>(null)
  const count = items?.length ?? 0

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return
      const target = (next + count) % count
      if (prefersReducedMotion() || !quoteRef.current) {
        setIndex(target)
        return
      }
      gsap.to(quoteRef.current, {
        opacity: 0,
        y: -16,
        duration: DUR.fast,
        ease: EASE,
        onComplete: () => {
          setIndex(target)
          gsap.fromTo(
            quoteRef.current,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: DUR.base, ease: EASE }
          )
        },
      })
    },
    [count]
  )

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion()) return
    const id = setInterval(() => goTo(index + 1), 7000)
    return () => clearInterval(id)
  }, [index, count, goTo])

  if (!count) return null

  const current = items[index]

  return (
    <section className="testimonials" aria-roledescription="carousel" aria-label="Testimonials">
      <div className="testimonials-inner">
        <span className="testimonials-eyebrow">in their words</span>

        <div className="testimonials-stage">
          <div ref={quoteRef} className="testimonial-block">
            <blockquote className="testimonial-quote">{current.quote}</blockquote>
            <div className="testimonial-author">
              {current.author}
              {current.role && (
                <span className="testimonial-role">, {current.role}</span>
              )}
            </div>
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
              ←
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
              →
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
