'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
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

interface ProjectSeriesProps {
  series: HomeSeries[]
}

/**
 * Projects — each project is a named series of works, shown as its
 * name, a line of context, and a few images from the series. Speaks
 * the Selected Works dialect: organic masks, uncover reveals,
 * alternating offsets.
 */
export default function ProjectSeries({ series }: ProjectSeriesProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const touch = isTouch()

    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-eyebrow'), { scrollTrigger: true })

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
            mask.addEventListener('mouseenter', () =>
              mandaGsap.to(img, { scale: 1.18, duration: DUR.fast, ease: EASE })
            )
            mask.addEventListener('mouseleave', () =>
              mandaGsap.to(img, { scale: 1.12, duration: DUR.fast, ease: EASE })
            )
          })
      })
    }, root)
    return () => ctx.revert()
  }, [series])

  return (
    <section
      ref={rootRef}
      className="mr-section mr-projects"
      aria-label="Projects"
      data-bg="linen"
    >
      <header className="mr-works__header">
        <p className="mr-eyebrow">
          Projects <span className="mr-eyebrow__count">({series.length})</span>
        </p>
      </header>

      <div className="mr-projects__list">
        {series.map((item, n) => (
          <Link
            key={item.name}
            href={item.href}
            className={`mr-series${n % 2 ? ' mr-series--alt' : ''}`}
            data-cursor="view"
          >
            <div className="mr-series__head">
              <span className="mr-series__index">{item.index}</span>
              <h3 className="mr-series__name">{item.name}</h3>
              <p className="mr-series__meta">
                {item.medium} — {item.desc}
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
                    sizes="(max-width: 900px) 44vw, 22vw"
                    data-reveal-img
                  />
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
