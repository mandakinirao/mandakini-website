'use client'

import type { HomePress, HomeTestimonial } from '@/lib/home-data'

interface MarqueePressProps {
  items: HomePress[]
  testimonials: HomeTestimonial[]
}

function Track({ items }: { items: HomePress[] }) {
  return (
    <div className="mr2-press__track">
      {items.map((item, i) => (
        <span key={`${item.source}-${i}`} className="mr2-press__item">
          <b>{item.source}</b>
          <i>{item.title}</i>
          <em>✦ {item.year}</em>
        </span>
      ))}
    </div>
  )
}

/**
 * V2 §6 — voices & press: testimonial quotes set large, then the press /
 * podcast / interview names as two opposing marquee walls. Pure CSS
 * loop; reduced motion stops the animation and leaves a readable row.
 */
export default function MarqueePress({ items, testimonials }: MarqueePressProps) {
  // IA §2: the marquee loops, so it never needs more than 8 items.
  const rowA = items.slice(0, 8)
  const rowB = [...rowA].reverse()
  return (
    <section className="mr2-press" aria-label="Voices and press">
      <div className="mr2-press__quotes">
        {testimonials.map((t) => (
          <figure key={t.author} className="mr2-press__quote">
            <blockquote>“{t.quote}”</blockquote>
            <cite>{t.author}</cite>
          </figure>
        ))}
      </div>

      <div className="mr2-press__row">
        <Track items={rowA} />
        <Track items={rowA} />
      </div>
      <div className="mr2-press__row mr2-press__row--reverse">
        <Track items={rowB} />
        <Track items={rowB} />
      </div>
    </section>
  )
}
