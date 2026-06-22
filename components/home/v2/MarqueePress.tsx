'use client'

import { useEffect } from 'react'
import PillCta from '@/components/ui/PillCta'
import type { HomePress } from '@/lib/home-data'
import { MARQUEE } from '@/lib/motion'

const PLACEHOLDER_ITEMS: HomePress[] = [
  { source: 'The Hindu', title: 'A studio where music becomes paint', year: '2025' },
  { source: 'Deccan Chronicle', title: 'Hyderabad artists to watch', year: '2024' },
  { source: 'Telangana Today', title: 'Portraits of a voice', year: '2024' },
  { source: 'Paint & Process', title: 'Podcast — episode 41', year: '2023' },
]

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
 * Speed driven by MARQUEE constants from @/lib/motion via CSS variables.
 * Reduced-motion: animation stops, row stays readable.
 */
export default function MarqueePress({ items }: MarqueePressProps) {
  const list = items.length ? items : PLACEHOLDER_ITEMS
  const rowA = list.slice(0, 8)
  const rowB = [...rowA].reverse()

  useEffect(() => {
    document.documentElement.style.setProperty('--mr2-marquee-dur', `${MARQUEE.dur}s`)
    document.documentElement.style.setProperty('--mr2-marquee-dur-alt', `${MARQUEE.durAlt}s`)
  }, [])

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

      <div className="mr2-press__footer">
        <PillCta href="/press">All press &amp; features</PillCta>
      </div>
    </section>
  )
}
