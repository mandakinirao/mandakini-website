'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

interface EditionShopProps {
  prints: HomePrint[]
}

/**
 * V2 §4 — the shop, kept quiet (after jardin / 1924.us): a centered
 * header and a clean grid — image, serif title, edition line. The only
 * movement is a soft fade-up on entry and a slow zoom on hover.
 */
// IA §2: the home teaser shows at most 3 featured prints.
const HOME_CAP = 3

export default function EditionShop({ prints: allPrints }: EditionShopProps) {
  const prints = allPrints.slice(0, HOME_CAP)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      if (prefersReducedMotion()) return
      mandaGsap.from('.mr2-product', {
        y: 60,
        autoAlpha: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.14,
        scrollTrigger: { trigger: root, start: 'top 72%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr2-shop" aria-label="Print editions">
      <header className="mr2-shop__head">
        <p>The Shop</p>
        <h2>Signed prints from the Hyderabad studio</h2>
      </header>

      <div className="mr2-shop__grid">
        {prints.map((print, i) => (
          <Link
            key={print.title}
            href={print.href}
            className="mr2-product"
            data-cursor="view"
          >
            <span className="mr2-product__frame mr2-duo">
              <Image
                src={print.image}
                alt={print.title}
                fill
                sizes="(max-width: 900px) 88vw, 30vw"
              />
            </span>
            <span className="mr2-product__title">{print.title}</span>
            <span className="mr2-product__price">
              <span>{print.price}</span>
              <span>Nº {String(i + 1).padStart(3, '0')}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mr2-shop__cta">
        <Link href="/shop" className="mr2-pill" data-cursor="view">
          Visit the shop
        </Link>
      </div>
    </section>
  )
}
