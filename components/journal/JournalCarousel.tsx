'use client'

import Image from 'next/image'
import { useState, type CSSProperties } from 'react'
import type { JournalImage } from '@/lib/journal'

function sizesForPosition(position: string) {
  return position === 'left' || position === 'right'
    ? '(max-width: 800px) 92vw, 42vw'
    : '(max-width: 800px) 92vw, 76vw'
}

export default function JournalCarousel({
  images,
  position,
}: {
  images: JournalImage[]
  position: 'left' | 'right' | 'top' | 'bottom'
}) {
  const [active, setActive] = useState(0)
  if (images.length === 0) return null

  const sizes = sizesForPosition(position)
  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const next = () => setActive((a) => (a + 1) % images.length)

  return (
    <div
      className="mr-carousel mr-journal__carousel"
      style={{ '--journal-carousel-ar': images[active].aspectRatio || 4 / 5 } as CSSProperties}
    >
      <span className="mr-journal__image mr-mask mr-carousel__stage">
        {images.map((img, i) => (
          <Image
            key={img.url}
            src={img.url}
            alt={`${img.alt} — ${i + 1} of ${images.length}`}
            fill
            sizes={sizes}
            data-reveal-img={i === 0 ? true : undefined}
            className={`mr-carousel__slide${i === active ? ' mr-carousel__slide--active' : ''}`}
          />
        ))}
      </span>

      <div className="mr-carousel__thumbs" role="tablist" aria-label="Select image">
        {images.map((img, i) => (
          <button
            key={img.url}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`View image ${i + 1} of ${images.length}`}
            className={`mr-carousel__thumb${i === active ? ' mr-carousel__thumb--active' : ''}`}
            onClick={() => setActive(i)}
          >
            <Image src={img.thumbUrl} alt="" fill sizes="64px" />
          </button>
        ))}
      </div>

      <button type="button" className="mr-carousel__btn mr-carousel__btn--prev" onClick={prev} aria-label="Previous image">
        ‹
      </button>
      <button type="button" className="mr-carousel__btn mr-carousel__btn--next" onClick={next} aria-label="Next image">
        ›
      </button>
    </div>
  )
}
