'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { EnrichedPressItem } from '@/lib/press'
import { mandaGsap, DUR, EASE, prefersReducedMotion } from '@/lib/motion'

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

/** Pairs one "tall" item (photo or clipping — anything image-forward) with
 * one "short" logo item per column (mirrors the Function Health reference —
 * each column is two distinct press mentions, never two of the same visual
 * weight stacked together). Relative order within each group is preserved
 * (displayOrder). Surplus items, once the shorter list runs out, fall back
 * to solo columns. */
function buildColumns(items: EnrichedPressItem[]): EnrichedPressItem[][] {
  const tall = items.filter((i) => i.mode !== 'logo')
  const short = items.filter((i) => i.mode === 'logo')
  const columns: EnrichedPressItem[][] = []
  const max = Math.max(tall.length, short.length)
  for (let i = 0; i < max; i++) {
    const pair = [tall[i], short[i]].filter(Boolean)
    if (pair.length) columns.push(pair)
  }
  return columns
}

function PhotoCard({ item }: { item: EnrichedPressItem }) {
  const label = TYPE_LABEL[item.type] ?? 'Article'
  const cta = CTA[item.type] ?? 'Read'
  return (
    <a
      href={item.url as string}
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
      href={item.url as string}
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

/** A photographed/scanned print clipping — no destination link. The scan is
 * the content, so no scrim or overlaid text sits on top of it (that would
 * make it harder to read, the opposite of a photo card's intent). Caption
 * lives below, on its own cream strip. Opens the lightbox on click. */
function ClippingCard({ item, onOpen }: { item: EnrichedPressItem; onOpen: () => void }) {
  const label = TYPE_LABEL[item.type] ?? 'Article'
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mr2-press-card mr2-press-card--clipping"
      aria-label={`Expand: ${[item.headline, item.source].filter(Boolean).join(' — ') || label}`}
    >
      <span className="mr2-press-card__frame">
        <Image
          src={item.thumbnail as string}
          alt={item.headline ?? item.source ?? label}
          fill
          sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: 'contain' }}
        />
        <span className="mr2-press-card__expand" aria-hidden="true">
          <ExpandGlyph />
        </span>
      </span>
      <span className="mr2-press-card__caption">
        <span className="mr2-press-card__label mr2-press-card__label--logo">{label}</span>
        {item.headline && <p className="mr2-press-card__title mr2-press-card__title--dark">{item.headline}</p>}
        {item.source && <p className="mr2-press-card__pub">{item.source}</p>}
      </span>
    </button>
  )
}

function ExpandGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.5 1H1V5.5M8.5 13H13V8.5M13 1L8 6M1 13L6 8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Lightbox({ item, onClose }: { item: EnrichedPressItem; onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const frame = frameRef.current
    if (!overlay || !frame) return

    if (prefersReducedMotion()) {
      mandaGsap.set([overlay, frame], { autoAlpha: 1 })
    } else {
      mandaGsap.set(overlay, { autoAlpha: 0 })
      mandaGsap.set(frame, { autoAlpha: 0, scale: 0.96 })
      mandaGsap
        .timeline()
        .to(overlay, { autoAlpha: 1, duration: DUR.fast, ease: EASE })
        .to(frame, { autoAlpha: 1, scale: 1, duration: DUR.fast, ease: EASE }, '<0.05')
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const label = TYPE_LABEL[item.type] ?? 'Article'

  return (
    <div
      ref={overlayRef}
      className="mr2-press-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={item.headline ?? item.source ?? label}
      onClick={onClose}
    >
      <button type="button" className="mr2-press-lightbox__close" onClick={onClose} aria-label="Close">
        <CloseGlyph />
      </button>
      <div ref={frameRef} className="mr2-press-lightbox__frame" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a fixed
            width/height on next/image would force this box into a wrong
            aspect ratio (clippings vary landscape/portrait); a plain <img>
            sizes itself from the real loaded image so it always fills the
            available space correctly. */}
        <img
          src={item.thumbnail as string}
          alt={item.headline ?? item.source ?? label}
          className="mr2-press-lightbox__img"
        />
        {(item.headline || item.source) && (
          <div className="mr2-press-lightbox__caption">
            {item.headline && <p>{item.headline}</p>}
            {item.source && <span>{item.source}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

export default function PressPage({ items }: { items: EnrichedPressItem[] }) {
  const [openItem, setOpenItem] = useState<EnrichedPressItem | null>(null)

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
              {pair.map((item) => {
                if (item.mode === 'clipping') {
                  return <ClippingCard key={item._id} item={item} onOpen={() => setOpenItem(item)} />
                }
                return item.mode === 'photo' ? (
                  <PhotoCard key={item._id} item={item} />
                ) : (
                  <LogoCard key={item._id} item={item} />
                )
              })}
            </div>
          ))}
        </div>
      )}

      {openItem && <Lightbox item={openItem} onClose={() => setOpenItem(null)} />}
    </section>
  )
}
