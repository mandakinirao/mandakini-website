'use client'

import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DUR, mandaGsap, prefersReducedMotion } from '@/lib/motion'
import '@/styles/testimonials.css'

type Testimonial = { _id?: string; quote: string; personName: string; personImage: string }

/** Stable per-card tilt for the photo stack — computed once so inactive
 *  cards don't jump to a new random angle on every transition. */
function useStackRotations(count: number) {
  return useMemo(
    () => Array.from({ length: count }, () => `${Math.floor(Math.random() * 16) - 8}deg`),
    [count]
  )
}

export default function Testimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const count = items?.length ?? 0
  const rotations = useStackRotations(count)

  const goTo = (next: number) => {
    if (count === 0) return
    const target = (next + count) % count
    if (target === index) return

    if (prefersReducedMotion()) {
      setIndex(target)
      return
    }

    const content = contentRef.current
    if (content) {
      mandaGsap.to(content, {
        opacity: 0,
        y: -16,
        duration: DUR.fast * 0.5,
        ease: 'power2.in',
        onComplete: () => {
          setIndex(target)
          mandaGsap.fromTo(
            content,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: DUR.fast, ease: 'power2.out' }
          )
        },
      })
    } else {
      setIndex(target)
    }

    cardRefs.current.forEach((card, i) => {
      if (!card) return
      const isActive = i === target
      mandaGsap.to(card, {
        opacity: isActive ? 1 : 0.5,
        scale: isActive ? 1 : 0.9,
        y: isActive ? 0 : 20,
        rotate: isActive ? 0 : rotations[i],
        zIndex: isActive ? count : count - Math.abs(i - target),
        duration: DUR.fast,
        ease: 'power2.inOut',
      })
    })
  }

  useEffect(() => {
    if (count <= 1 || prefersReducedMotion()) return
    const id = setInterval(() => goTo(index + 1), 6000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count])

  if (!count) return null

  const current = items[index]

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
                style={{
                  opacity: i === index ? 1 : 0.5,
                  transform: `scale(${i === index ? 1 : 0.9}) translateY(${i === index ? 0 : 20}px) rotate(${i === index ? '0deg' : rotations[i]})`,
                  zIndex: i === index ? count : count - Math.abs(i - index),
                }}
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

          <div ref={contentRef} className="testimonial-content">
            <div className="testimonial-author">{current.personName}</div>
            <blockquote className="testimonial-quote">{current.quote}</blockquote>
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
