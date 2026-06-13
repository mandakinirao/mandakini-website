'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { HomePrint } from '@/lib/home-data'
import {
  DUR,
  EASE,
  ScrollTrigger,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'

interface ShopTeaserProps {
  prints: HomePrint[]
}

/**
 * Spec §9 — prints on an offset diagonal in the Selected Works dialect.
 */
export default function ShopTeaser({ prints }: ShopTeaserProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = prefersReducedMotion()
    const touch = isTouch()

    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-eyebrow'), { scrollTrigger: true })
      revealLines(root.querySelector('.mr-shop__tagline'), {
        scrollTrigger: true,
        delay: 0.1,
      })

      root.querySelectorAll<HTMLElement>('.mr-work').forEach((print) => {
        const mask = print.querySelector<HTMLElement>('.mr-work__mask')
        const img = mask?.querySelector('img') ?? null

        revealImage(mask, { scrollTrigger: true })
        revealLines(print.querySelector('.mr-work__title'), {
          scrollTrigger: true,
          delay: 0.1,
        })
        revealLines(print.querySelector('.mr-work__meta'), {
          scrollTrigger: true,
          delay: 0.18,
        })

        if (reduced || !img) return
        if (touch) {
          ScrollTrigger.create({
            trigger: print,
            start: 'top 60%',
            end: 'bottom 40%',
            onToggle: (self) => {
              print.classList.toggle('is-active', self.isActive)
              mandaGsap.to(img, {
                scale: self.isActive ? 1.18 : 1.12,
                duration: DUR.fast,
                ease: EASE,
              })
            },
          })
        } else {
          print.addEventListener('mouseenter', () =>
            mandaGsap.to(img, { scale: 1.18, duration: DUR.fast, ease: EASE })
          )
          print.addEventListener('mouseleave', () =>
            mandaGsap.to(img, { scale: 1.12, duration: DUR.fast, ease: EASE })
          )
        }
      })
    }, root)

    return () => ctx.revert()
  }, [prints])

  return (
    <section ref={rootRef} className="mr-section mr-shop" aria-label="Print editions">
      <header className="mr-shop__header">
        <p className="mr-eyebrow">Print Editions</p>
        <p className="mr-shop__tagline">limited runs, signed in Hyderabad</p>
      </header>

      <div className="mr-shop__grid">
        {prints.map((print, i) => (
          <Link
            key={print.title}
            href={print.href}
            className="mr-work"
            data-cursor="view"
          >
            <span className={`mr-work__mask mr-mask${i % 2 ? ' mr-mask--b' : ''}`}>
              <Image
                src={print.image}
                alt={print.title}
                fill
                sizes="(max-width: 900px) 82vw, 30vw"
                data-reveal-img
              />
              <span className="mr-work__veil" aria-hidden="true" />
            </span>
            <span className="mr-work__title">{print.title}</span>
            <span className="mr-work__meta">{print.price}</span>
          </Link>
        ))}
      </div>

      <div className="mr-shop__cta">
        <Link href="/shop" className="mr-pill">
          Shop prints
        </Link>
      </div>
    </section>
  )
}
