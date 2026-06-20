'use client'

import type { HomePress } from '@/lib/home-data'

interface MarqueePressProps {
  items: HomePress[]
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
 * V2 §6 — press: two opposing marquee walls.
 * Testimonials now live in their own dedicated section above this one.
 * Pure CSS loop; reduced motion stops the animation and leaves a readable row.
 */
export default function MarqueePress({ items }: MarqueePressProps) {
  const rowA = items.slice(0, 8)
  const rowB = [...rowA].reverse()
  return (
    <section className="mr2-press" aria-label="Press">
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
