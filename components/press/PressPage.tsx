import Image from 'next/image'
import Link from 'next/link'
import type { EnrichedPressItem } from '@/lib/press'

const TYPE_LABEL: Record<string, string> = {
  article: 'Article',
  video: 'Video',
  podcast: 'Podcast',
  feature: 'Feature',
}

export default function PressPage({ items }: { items: EnrichedPressItem[] }) {
  if (items.length === 0) {
    return (
      <section className="mr2-page-shell">
        <p>Press and Features — coming soon</p>
      </section>
    )
  }

  return (
    <section className="mr-page mr2-press-page" aria-label="Press and features">
      <header className="mr-page__head">
        <p>Press &amp; Features</p>
        <h1>In print, online, on air</h1>
      </header>

      <ul className="mr2-press-list">
        {items.map((item) => {
          const label = TYPE_LABEL[item.type] ?? item.type
          const inner = (
            <>
              <div className="mr2-press-list__meta">
                {item.thumbnail ? (
                  <span className="mr2-press-list__logo">
                    <Image
                      src={item.thumbnail}
                      alt={item.source}
                      width={120}
                      height={68}
                      style={{ objectFit: 'cover' }}
                    />
                  </span>
                ) : (
                  <span className="mr2-press-list__source">{item.source}</span>
                )}
                <span className="mr2-press-list__type">{label}</span>
              </div>
              <h2 className="mr2-press-list__title">{item.title}</h2>
              <span className="mr2-press-list__cta">
                {item.type === 'podcast' ? 'Listen' : item.type === 'video' ? 'Watch' : 'Read'} →
              </span>
            </>
          )

          return (
            <li key={item._id} className="mr2-press-list__item">
              <Link
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mr2-press-list__link"
              >
                {inner}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
