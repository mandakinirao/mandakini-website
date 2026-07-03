import Image from 'next/image'
import type { EnrichedPressItem } from '@/lib/press'

const TYPE_LABEL: Record<string, string> = {
  video: 'Video',
  podcast: 'Podcast',
  article: 'Article',
}

const CTA: Record<string, string> = {
  video: 'Watch',
  podcast: 'Listen',
  article: 'Read',
}

// Ghost columns define the grid shape before real items arrive — each column
// pairs a tall (img) slot with a short (text) slot, alternating which sits on
// top per column, mirroring the Function Health layout.
const GHOST_COLUMNS: readonly (readonly ['img' | 'text', 'img' | 'text'])[] = [
  ['img', 'text'],
  ['text', 'img'],
  ['img', 'text'],
  ['text', 'img'],
]

function GhostGrid() {
  return (
    <div className="mr2-press-bento" aria-hidden="true">
      {GHOST_COLUMNS.map((pair, i) => (
        <div key={i} className="mr2-press-col">
          {pair.map((kind, j) => (
            <div key={j} className={`mr2-press-card mr2-press-card--ghost mr2-press-card--ghost-${kind}`} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Pairs one photo-mode item with one logo-mode item per column (mirrors the
 * Function Health reference — each column is a distinct photo card + a
 * distinct logo card, never two of the same kind stacked together).
 * Relative order within each mode is preserved (displayOrder). Any surplus
 * items, once the shorter list runs out, fall back to solo columns. */
function buildColumns(items: EnrichedPressItem[]): EnrichedPressItem[][] {
  const photos = items.filter((i) => i.mode === 'photo')
  const logos = items.filter((i) => i.mode === 'logo')
  const columns: EnrichedPressItem[][] = []
  const max = Math.max(photos.length, logos.length)
  for (let i = 0; i < max; i++) {
    const pair = [photos[i], logos[i]].filter(Boolean)
    if (pair.length) columns.push(pair)
  }
  return columns
}

function PhotoCard({ item }: { item: EnrichedPressItem }) {
  const label = TYPE_LABEL[item.type] ?? 'Article'
  const cta = CTA[item.type] ?? 'Read'
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mr2-press-card mr2-press-card--img"
      aria-label={[item.headline, item.source].filter(Boolean).join(' — ') || label}
    >
      <Image
        src={item.thumbnail as string}
        alt={item.headline ?? item.source ?? label}
        fill
        sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
        style={{ objectFit: 'cover' }}
      />
      <div className="mr2-press-card__overlay">
        <span className="mr2-press-card__label">{label}</span>
        {item.headline && <p className="mr2-press-card__title">{item.headline}</p>}
        {item.source && <span className="mr2-press-card__source">{item.source}</span>}
        <span className="mr2-press-card__cta">{cta} →</span>
      </div>
    </a>
  )
}

function LogoCard({ item }: { item: EnrichedPressItem }) {
  const label = TYPE_LABEL[item.type] ?? 'Article'
  const cta = CTA[item.type] ?? 'Read'
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mr2-press-card mr2-press-card--logo"
      aria-label={[item.headline, item.source].filter(Boolean).join(' — ') || label}
    >
      <span className="mr2-press-card__label mr2-press-card__label--logo">{label}</span>
      {item.thumbnail ? (
        <span className="mr2-press-card__mark mr2-press-card__mark--image">
          <Image
            src={item.thumbnail}
            alt={item.source ?? 'Publication logo'}
            fill
            sizes="200px"
            style={{ objectFit: 'contain' }}
          />
        </span>
      ) : (
        <span className="mr2-press-card__mark mr2-press-card__mark--seal" aria-hidden="true" />
      )}
      <span className="mr2-press-card__logo-text">
        {item.headline && <p className="mr2-press-card__title mr2-press-card__title--dark">{item.headline}</p>}
        {item.source && <p className="mr2-press-card__pub">{item.source}</p>}
        <span className="mr2-press-card__cta mr2-press-card__cta--dark">{cta} →</span>
      </span>
    </a>
  )
}

export default function PressPage({ items }: { items: EnrichedPressItem[] }) {
  return (
    <section className="mr2-press-page mr-page" aria-label="Press and features">
      <header className="mr-page__head">
        <p className="mr-page__label">Press &amp; Features</p>
        <h1>In print, online, on air</h1>
      </header>

      {items.length === 0 ? (
        <>
          <GhostGrid />
          <p className="mr2-press-empty">Coverage coming soon — check back shortly.</p>
        </>
      ) : (
        <div className="mr2-press-bento">
          {buildColumns(items).map((pair, i) => (
            <div key={pair[0]._id} className={`mr2-press-col${i % 2 === 1 ? ' mr2-press-col--reverse' : ''}`}>
              {pair.map((item) =>
                item.mode === 'photo' ? (
                  <PhotoCard key={item._id} item={item} />
                ) : (
                  <LogoCard key={item._id} item={item} />
                )
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
