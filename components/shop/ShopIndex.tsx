'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { EASE, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'
import BuyControls from '@/components/shop/BuyControls'

const PAGE_SIZE = 12

interface ShopIndexProps {
  prints: HomePrint[]
  commerceEnabled: boolean
  headline?: string
  printNote?: string
}

export default function ShopIndex({
  prints,
  commerceEnabled,
  headline = 'Signed editions from the Hyderabad studio',
  printNote = 'Each print is signed and numbered in the Hyderabad studio.',
}: ShopIndexProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-page__head p'))
      revealLines(root.querySelector('.mr-page__head h1'), { delay: 0.12 })
      if (prefersReducedMotion()) return
      mandaGsap.from('.mr-product', {
        y: 70,
        autoAlpha: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: { trigger: root, start: 'top 70%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [prints])

  if (prints.length === 0) {
    return (
      <section className="mr-page" aria-label="Shop">
        <header className="mr-page__head">
          <p>The Shop</p>
          <h1>New editions are on the easel</h1>
        </header>
        <div className="mr-page__note">
          <p>Nothing is listed right now — check back soon, or ask about original works.</p>
          <Link href="/" className="mr-pill" data-cursor="view">
            Back home
          </Link>
        </div>
      </section>
    )
  }

  const shown = prints.slice(0, visible)

  return (
    <section ref={rootRef} className="mr-page" aria-label="Shop">
      <header className="mr-page__head">
        <p>The Shop</p>
        <h1>{headline}</h1>
      </header>

      <div className="mr-products">
        {shown.map((print, i) =>
          commerceEnabled ? (
            <article key={print.slug} className="mr-product" data-cursor="view">
              <Link href={print.href} className="mr-product__media" tabIndex={-1} aria-hidden>
                <span className="mr-product__frame mr-mask">
                  <Image
                    src={print.image}
                    alt={print.title}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
                  {!print.available && (
                    <span className="mr-product__soldout">Sold out</span>
                  )}
                </span>
              </Link>
              <Link href={print.href}>
                <h2 className="mr-product__title">{print.title}</h2>
              </Link>
              <p className="mr-product__price">
                <span>{print.price}</span>
                <span>Nº {String(i + 1).padStart(3, '0')}</span>
              </p>
              <BuyControls print={print} variant="compact" />
            </article>
          ) : (
            <Link
              key={print.slug}
              href={print.href}
              className="mr-product"
              data-cursor="view"
            >
              <span className="mr-product__frame mr-mask">
                <Image
                  src={print.image}
                  alt={print.title}
                  fill
                  sizes="(max-width: 900px) 88vw, 30vw"
                />
                {!print.available && (
                  <span className="mr-product__soldout">Sold out</span>
                )}
              </span>
              <h2 className="mr-product__title">{print.title}</h2>
              <p className="mr-product__price">
                <span>{print.price}</span>
                <span>Nº {String(i + 1).padStart(3, '0')}</span>
              </p>
            </Link>
          )
        )}
      </div>

      {prints.length > visible && (
        <div className="mr-page__note">
          <button
            type="button"
            className="mr-pill"
            data-cursor="view"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load more ({prints.length - visible} remaining)
          </button>
        </div>
      )}

      <div className="mr-page__note">
        <p>{printNote}</p>
      </div>
    </section>
  )
}
