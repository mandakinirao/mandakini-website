import Image from 'next/image'
import { PortableText } from 'next-sanity'
import type { AboutData, Exhibition } from '@/lib/about-data'

function ExhibitionRow({ ex }: { ex: Exhibition }) {
  return (
    <li className="mr2-cv__row">
      <span className="mr2-cv__year">{ex.year}</span>
      <span className="mr2-cv__name">{ex.exhibitionName}</span>
      <span className="mr2-cv__venue">
        {ex.venue}{ex.location ? `, ${ex.location}` : ''}
      </span>
    </li>
  )
}

export default function AboutPage({
  bio,
  artistStatement,
  profilePhotos,
  studioPhotos,
  cv,
  exhibitionHistory,
}: AboutData) {
  const empty =
    !bio && !artistStatement && profilePhotos.length === 0 &&
    studioPhotos.length === 0 && !cv && exhibitionHistory.length === 0

  if (empty) {
    return (
      <section className="mr2-page-shell">
        <p>About — coming soon</p>
      </section>
    )
  }

  return (
    <article className="mr2-about-page">

      {/* ── Bio + portrait ─────────────────────────────────────── */}
      {(bio || profilePhotos.length > 0) && (
        <section className="mr2-abp__intro">
          {profilePhotos[0] && (
            <div className="mr2-abp__portrait">
              <Image
                src={profilePhotos[0]}
                alt="Mandakini Rao"
                fill
                sizes="(max-width: 900px) 92vw, 44vw"
                priority
              />
            </div>
          )}
          {bio && (
            <div className="mr2-abp__bio mr2-prose">
              <PortableText value={bio} />
            </div>
          )}
        </section>
      )}

      {/* ── Artist statement ───────────────────────────────────── */}
      {artistStatement && (
        <section className="mr2-abp__statement">
          <div className="mr2-prose">
            <PortableText value={artistStatement} />
          </div>
        </section>
      )}

      {/* ── Studio photos ──────────────────────────────────────── */}
      {studioPhotos.length > 0 && (
        <section className="mr2-abp__studio" aria-label="Studio">
          <div className="mr2-abp__photo-row">
            {studioPhotos.map((src, i) => (
              <div key={src} className="mr2-abp__photo">
                <Image
                  src={src}
                  alt={`Studio ${i + 1}`}
                  fill
                  sizes="(max-width: 900px) 80vw, 33vw"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Exhibition history ─────────────────────────────────── */}
      {exhibitionHistory.length > 0 && (
        <section className="mr2-abp__exhibitions">
          <h2 className="mr2-abp__section-title">Exhibitions</h2>
          <ul className="mr2-cv__list">
            {[...exhibitionHistory]
              .sort((a, b) => b.year - a.year)
              .map((ex, i) => (
                <ExhibitionRow key={`${ex.year}-${i}`} ex={ex} />
              ))}
          </ul>
        </section>
      )}

      {/* ── CV ─────────────────────────────────────────────────── */}
      {cv && (
        <section className="mr2-abp__cv">
          <h2 className="mr2-abp__section-title">CV</h2>
          <div className="mr2-prose">
            <PortableText value={cv} />
          </div>
        </section>
      )}

    </article>
  )
}
