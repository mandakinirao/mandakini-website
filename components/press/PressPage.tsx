import Image from 'next/image'
import type { EnrichedPressItem } from '@/lib/press'

const CTA: Record<string, string> = {
  video: 'Watch',
  podcast: 'Listen',
  article: 'Read',
  feature: 'Read',
}

// Alternate card accent colours for text-only cards (no thumbnail)
const TEXT_CARD_BG = [
  'var(--accent-lagoon)',
  'var(--accent-forrest)',
  'var(--accent-pumpkin)',
  'var(--accent-ocean)',
  'var(--accent-moss)',
  'var(--accent-cacao)',
]

export default function PressPage({ items }: { items: EnrichedPressItem[] }) {
  if (items.length === 0) {
    return (
      <section className="mr2-press-page mr-page">
        <header className="mr-page__head">
          <p>Press &amp; Features</p>
          <h1>In print, online, on air</h1>
        </header>
        <p style={{ opacity: 0.6 }}>Coverage coming soon.</p>
      </section>
    )
  }

  // Separate into image cards and text cards so we can assign bento sizes
  let textCardIndex = 0

  return (
    <section className="mr2-press-page mr-page" aria-label="Press and features">
      <header className="mr-page__head">
        <p>Press &amp; Features</p>
        <h1>In print, online, on air</h1>
      </header>

      <div className="mr2-press-bento">
        {items.map((item) => {
          const cta = CTA[item.type] ?? 'Read'

          if (item.thumbnail) {
            return (
              <a
                key={item._id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mr2-press-card mr2-press-card--img"
                aria-label={`${item.title} — ${item.source}`}
              >
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
                <div className="mr2-press-card__overlay">
                  <span className="mr2-press-card__source">{item.source}</span>
                  <p className="mr2-press-card__title">{item.title}</p>
                  <span className="mr2-press-card__cta">{cta} →</span>
                </div>
              </a>
            )
          }

          // Text-only card — cycles through accent palette
          const bg = TEXT_CARD_BG[textCardIndex % TEXT_CARD_BG.length]
          textCardIndex++

          return (
            <a
              key={item._id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mr2-press-card mr2-press-card--text"
              style={{ background: bg }}
              aria-label={`${item.title} — ${item.source}`}
            >
              <span className="mr2-press-card__pub">{item.source}</span>
              <p className="mr2-press-card__title">{item.title}</p>
              <span className="mr2-press-card__cta">{cta} →</span>
            </a>
          )
        })}
      </div>
    </section>
  )
}
