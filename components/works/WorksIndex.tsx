'use client'

import Image from 'next/image'
import Link from 'next/link'
import PillCta from '@/components/ui/PillCta'
import { useEffect, useRef } from 'react'
import type { HomeSeries } from '@/lib/home-data'
import {
  DUR,
  EASE,
  EASE_OUT,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'

const FEATURED_COUNT = 3 // Tier 1 — editorial rows

interface WorksIndexProps {
  series: HomeSeries[]
  /** curated Tier 1 (Site Settings → Featured Projects) */
  featured: HomeSeries[]
  headline?: string
  emptyHeadline?: string
  emptyBody?: string
}

/**
 * /works — the two-tier Projects index (IA §3). Tier 1: up to three
 * featured series as large editorial rows. Tier 2: every series as a
 * compact, scannable list row with a floating cover preview on hover.
 * Scales to 30+ projects without the page becoming a marathon.
 */
export default function WorksIndex({
  series,
  featured,
  headline = 'Bodies of work',
  emptyHeadline = 'New work is on the easel',
  emptyBody = 'No projects are published yet — the studio is busy. Check back soon.',
}: WorksIndexProps) {
  const rootRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewImgRef = useRef<HTMLImageElement>(null)
  const tierOne = (featured.length ? featured : series).slice(0, FEATURED_COUNT)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const touch = isTouch()
    const aborter = new AbortController()
    const { signal } = aborter

    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-page__head p'))
      revealLines(root.querySelector('.mr-page__head h1'), { delay: 0.12 })

      // Tier 1 — the editorial rows keep their uncover language.
      root.querySelectorAll<HTMLElement>('.mr-series').forEach((row) => {
        revealLines(row.querySelector('.mr-series__name'), {
          scrollTrigger: true,
        })
        revealLines(row.querySelector('.mr-series__meta'), {
          scrollTrigger: true,
          delay: 0.12,
        })
        row
          .querySelectorAll<HTMLElement>('.mr-series__mask')
          .forEach((mask, i) => {
            revealImage(mask, { scrollTrigger: true, delay: i * 0.12 })
            const img = mask.querySelector('img')
            if (reduced || touch || !img) return
            mask.addEventListener(
              'mouseenter',
              () =>
                mandaGsap.to(img, { scale: 1.18, duration: DUR.fast, ease: EASE }),
              { signal }
            )
            mask.addEventListener(
              'mouseleave',
              () =>
                mandaGsap.to(img, { scale: 1.12, duration: DUR.fast, ease: EASE }),
              { signal }
            )
          })
      })

      // Tier 2 — rows fade in; a cover preview floats beside the cursor.
      if (!reduced) {
        mandaGsap.from('.mr-windex__row', {
          y: 36,
          autoAlpha: 0,
          duration: 0.8,
          ease: EASE,
          stagger: 0.06,
          scrollTrigger: { trigger: '.mr-windex', start: 'top 78%', once: true },
        })
      }

      const preview = previewRef.current
      const previewImg = previewImgRef.current
      if (!reduced && !touch && preview && previewImg) {
        mandaGsap.set(preview, { xPercent: -50, yPercent: -112, scale: 0.92 })
        const toX = mandaGsap.quickTo(preview, 'x', {
          duration: 0.4,
          ease: EASE_OUT,
        })
        const toY = mandaGsap.quickTo(preview, 'y', {
          duration: 0.4,
          ease: EASE_OUT,
        })
        const move = (e: PointerEvent) => {
          toX(e.clientX)
          toY(e.clientY)
        }

        // pointerleave does NOT fire when the page scrolls under a
        // stationary cursor — force-hide on any scroll event instead.
        const hidePreview = () =>
          mandaGsap.to(preview, {
            autoAlpha: 0,
            scale: 0.92,
            duration: 0.25,
            ease: EASE,
          })
        window.addEventListener('scroll', hidePreview, { passive: true })
        // Tie scroll-listener cleanup to the AbortController so a single
        // aborter.abort() in the useEffect return tears down everything.
        signal.addEventListener('abort', () =>
          window.removeEventListener('scroll', hidePreview)
        )

        root.querySelectorAll<HTMLElement>('.mr-windex__row').forEach((row) => {
          row.addEventListener(
            'pointerenter',
            (e) => {
              previewImg.src = row.dataset.cover ?? ''
              mandaGsap.set(preview, { x: e.clientX, y: e.clientY })
              mandaGsap.to(preview, {
                autoAlpha: 1,
                scale: 1,
                duration: 0.35,
                ease: EASE,
              })
            },
            { signal }
          )
          row.addEventListener(
            'pointerleave',
            () =>
              mandaGsap.to(preview, {
                autoAlpha: 0,
                scale: 0.92,
                duration: 0.25,
                ease: EASE,
              }),
            { signal }
          )
          row.addEventListener('pointermove', move, { signal })
        })
      }
    }, root)

    return () => {
      aborter.abort()
      ctx.revert()
    }
  }, [series])

  if (series.length === 0) {
    return (
      <section className="mr-page" aria-label="Projects">
        <header className="mr-page__head">
          <p>Projects</p>
          <h1>{emptyHeadline}</h1>
        </header>
        <div className="mr-page__note">
          <p>{emptyBody}</p>
          <PillCta href="/">Back home</PillCta>
        </div>
      </section>
    )
  }

  return (
    <section ref={rootRef} className="mr-page" aria-label="Projects">
      <header className="mr-page__head">
        <p>
          Projects <span className="mr-eyebrow__count">({series.length})</span>
        </p>
        <h1>{headline}</h1>
      </header>

      {/* Tier 1 — featured */}
      <div className="mr-projects__list">
        {tierOne.map((item, n) => (
          <Link
            key={item.slug}
            href={item.href}
                       className={`mr-series${n % 2 ? ' mr-series--alt' : ''}`}
          >
            <div className="mr-series__head">
              <span className="mr-series__index">{item.index}</span>
              <h2 className="mr-series__name">{item.name}</h2>
              <p className="mr-series__meta">
                {item.desc}
              </p>
            </div>
            <div className="mr-series__row">
              {item.images.slice(0, 3).map((src, i) => (
                <span
                  key={src}
                  className={`mr-series__mask mr-mask${i % 2 ? ' mr-mask--b' : ''}`}
                >
                  <Image
                    src={src}
                    alt={`${item.name} — image ${i + 1}`}
                    fill
                    sizes="(max-width: 900px) 44vw, 30vw"
                    data-reveal-img
                  />
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {/* Tier 2 — the full index */}
      <div className="mr-windex">
        <p className="mr-eyebrow">All projects</p>

        <div className="mr-windex__list">
          {series.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="mr-windex__row"
                           data-cover={item.images[0]}
            >
              <span className="mr-windex__num">{item.index}</span>
              <span className="mr-windex__name">{item.name}</span>
              <span className="mr-windex__count">
                {item.pieces.length} pieces
              </span>
              {/* touch devices get the cover inline instead of the
                  floating preview */}
              <span className="mr-windex__thumb" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.images[0]} alt="" loading="lazy" />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* floating cover preview (desktop hover) */}
      <div ref={previewRef} className="mr-windex__preview" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={previewImgRef} alt="" />
      </div>
    </section>
  )
}
