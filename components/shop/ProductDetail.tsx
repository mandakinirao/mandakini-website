'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { HomePrint } from '@/lib/home-data'
import {
  EASE_OUT,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'
import BuyControls from '@/components/shop/BuyControls'
import ImageCarousel from '@/components/shop/ImageCarousel'

interface ProductDetailProps {
  print: HomePrint
  others: HomePrint[]
  commerceEnabled: boolean  // kept for API compat, no longer gates CTAs
  paperSpec?: string
  signatureSpec?: string
  shippingSpec?: string
}

/**
 * /shop/[slug] — the product page: image on the left, the facts on the right.
 * Always shows price + Buy Now / Add to Cart when available.
 * Falls back to sold-out state or private-collection enquiry as needed.
 */
export default function ProductDetail({
  print,
  others,
  paperSpec = '308gsm cotton rag, archival',
  signatureSpec = 'Signed & numbered by hand',
  shippingSpec = 'Rolled, worldwide from Hyderabad',
}: ProductDetailProps) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealImage(root.querySelector('.mr-pdp__image'))
      revealLines(root.querySelector('.mr-pdp__info h1'), { delay: 0.15 })
      if (prefersReducedMotion()) return
      mandaGsap.from('.mr-pdp__info > *:not(h1)', {
        y: 24,
        autoAlpha: 0,
        duration: 0.8,
        ease: EASE_OUT,
        stagger: 0.07,
        delay: 0.35,
      })
    }, root)
    return () => ctx.revert()
  }, [print])

  return (
    <section ref={rootRef} className="mr-page mr-pdp" aria-label={print.title}>
      <Link href="/shop" className="mr-detail__back">
        ← The shop
      </Link>

      <div className="mr-pdp__layout">
        <ImageCarousel
          images={print.images?.length ? print.images : [print.image || '/art/subbulakshmi/ms-sq-3.jpg']}
          title={print.title || 'Print'}
        />

        <div className="mr-pdp__info">
          <h1>{print.title || 'Untitled print'}</h1>
          {print.price && <p className="mr-pdp__price">{print.price}</p>}
          {print.desc && <p className="mr-pdp__desc">{print.desc}</p>}

          <dl className="mr-pdp__meta">
            <div><dt>Paper</dt><dd>{paperSpec}</dd></div>
            <div><dt>Signature</dt><dd>{signatureSpec}</dd></div>
            <div><dt>Shipping</dt><dd>{shippingSpec}</dd></div>
          </dl>

          <BuyControls print={print} variant="full" />
        </div>
      </div>

      {others.length > 0 && (
        <aside className="mr-pdp__more" aria-label="Other editions">
          <p className="mr-eyebrow">Other editions</p>
          <div className="mr-products">
            {others.map((other, i) => (
              <Link key={other.slug} href={other.href} className="mr-product">
                <span className="mr-product__frame mr-mask">
                  <Image
                    src={other.image}
                    alt={other.title}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
                </span>
                <h2 className="mr-product__title">{other.title}</h2>
                <p className="mr-product__price">
                  <span>{other.price}</span>
                  <span>Nº {String(i + 1).padStart(3, '0')}</span>
                </p>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </section>
  )
}
