'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { HomeSeries } from '@/lib/home-data'
import {
  DUR,
  EASE,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'

interface SeriesDetailProps {
  series: HomeSeries
  prev: HomeSeries
  next: HomeSeries
}

/**
 * /works/[slug] — one series in full: name, note, every image at
 * generous scale, and prev/next series to keep the visit moving.
 */
const FOLD_AT = 24 // IA §3: long series fold past this many pieces

export default function SeriesDetail({ series, prev, next }: SeriesDetailProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [showAll, setShowAll] = useState(false)
  const pieces =
    showAll || series.pieces.length <= FOLD_AT
      ? series.pieces
      : series.pieces.slice(0, FOLD_AT)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const touch = isTouch()

    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-page__head p'))
      revealLines(root.querySelector('.mr-page__head h1'), { delay: 0.1 })
      revealLines(root.querySelector('.mr-detail__note'), { delay: 0.2 })

      root.querySelectorAll<HTMLElement>('.mr-detail__piece').forEach((piece, i) => {
        const mask = piece.querySelector<HTMLElement>('.mr-detail__item')
        revealImage(mask, { scrollTrigger: true, delay: (i % 2) * 0.1 })
        revealLines(piece.querySelector('.mr-detail__caption'), {
          scrollTrigger: true,
          delay: (i % 2) * 0.1 + 0.2,
        })
        const img = mask?.querySelector('img')
        if (reduced || touch || !img || !mask) return
        mask.addEventListener('mouseenter', () =>
          mandaGsap.to(img, { scale: 1.18, duration: DUR.fast, ease: EASE })
        )
        mask.addEventListener('mouseleave', () =>
          mandaGsap.to(img, { scale: 1.12, duration: DUR.fast, ease: EASE })
        )
      })
    }, root)
    return () => ctx.revert()
  }, [series, showAll])

  return (
    <section ref={rootRef} className="mr-page" aria-label={series.name}>
      <Link href="/works" className="mr-detail__back" data-cursor="view">
        ← All projects
      </Link>

      <header className="mr-page__head">
        <p>Project {series.index}</p>
        <h1>{series.name}</h1>
        <span className="mr-detail__note">
          {series.medium} — {series.desc}
        </span>
      </header>

      <div className="mr-detail__grid">
        {pieces.map((piece, i) => (
          <figure key={piece.src} className="mr-detail__piece">
            <span className={`mr-detail__item mr-mask${i % 2 ? ' mr-mask--b' : ''}`}>
              <Image
                src={piece.src}
                alt={piece.title || `${series.name} — image ${i + 1}`}
                fill
                sizes="(max-width: 900px) 92vw, 60vw"
                data-reveal-img
              />
            </span>
            <figcaption className="mr-detail__caption">
              <span className="mr-detail__piece-title">
                {piece.title || `${series.name} ${String(i + 1).padStart(2, '0')}`}
                {piece.note && <em>{piece.note}</em>}
              </span>
              {piece.sale ? (
                <Link
                  href={piece.sale.href}
                  className="mr-detail__sale"
                  data-cursor="view"
                >
                  For sale · {piece.sale.label} <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <span className="mr-detail__nfs">Not for sale</span>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      {!showAll && series.pieces.length > FOLD_AT && (
        <div className="mr-page__note">
          <button
            type="button"
            className="mr-pill"
            data-cursor="view"
            onClick={() => setShowAll(true)}
          >
            Show all {series.pieces.length} pieces
          </button>
        </div>
      )}

      <nav className="mr-detail__nav" aria-label="More projects">
        <Link href={prev.href} data-cursor="view">
          <small>Previous</small>
          {prev.name}
        </Link>
        <Link href={next.href} data-cursor="view" className="mr-detail__next">
          <small>Next</small>
          {next.name}
        </Link>
      </nav>
    </section>
  )
}
