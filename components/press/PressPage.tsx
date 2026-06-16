import Image from 'next/image'
import Link from 'next/link'

export interface PressItem {
  _id: string
  type: string
  title: string
  source: string
  date: string
  excerpt?: string
  externalLink?: string
  logo?: string
}

const TYPE_LABEL: Record<string, string> = {
  newspaper: 'Press',
  feature: 'Feature',
  interview: 'Interview',
  podcast: 'Podcast',
  testimonial: 'Testimonial',
}

export default function PressPage({ items }: { items: PressItem[] }) {
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
          const year = item.date ? item.date.slice(0, 4) : ''
          const label = TYPE_LABEL[item.type] ?? item.type
          const inner = (
            <>
              <div className="mr2-press-list__meta">
                {item.logo ? (
                  <span className="mr2-press-list__logo">
                    <Image src={item.logo} alt={item.source} width={64} height={32} style={{ objectFit: 'contain' }} />
                  </span>
                ) : (
                  <span className="mr2-press-list__source">{item.source}</span>
                )}
                <span className="mr2-press-list__type">{label}</span>
                {year && <span className="mr2-press-list__year">{year}</span>}
              </div>
              <h2 className="mr2-press-list__title">{item.title}</h2>
              {item.excerpt && (
                <p className="mr2-press-list__excerpt">{item.excerpt}</p>
              )}
              {item.externalLink && (
                <span className="mr2-press-list__cta">
                  Read {item.type === 'podcast' ? 'episode' : 'article'} →
                </span>
              )}
            </>
          )

          return (
            <li key={item._id} className="mr2-press-list__item">
              {item.externalLink ? (
                <Link
                  href={item.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mr2-press-list__link"
                >
                  {inner}
                </Link>
              ) : (
                <div className="mr2-press-list__link">{inner}</div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
