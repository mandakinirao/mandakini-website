'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ImageCarouselProps {
  images: string[]
  title: string
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [active, setActive] = useState(0)

  if (images.length <= 1) {
    return (
      <span className="mr-pdp__image mr-mask">
        <Image
          src={images[0] ?? ''}
          alt={title}
          fill
          sizes="(max-width: 900px) 92vw, 46vw"
          data-reveal-img
          priority
        />
      </span>
    )
  }

  const prev = () => setActive((a) => (a - 1 + images.length) % images.length)
  const next = () => setActive((a) => (a + 1) % images.length)

  return (
    <div className="mr-carousel">
      <span className="mr-pdp__image mr-mask mr-carousel__stage">
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${title} — view ${i + 1}`}
            fill
            sizes="(max-width: 900px) 92vw, 46vw"
            data-reveal-img={i === 0 ? true : undefined}
            priority={i === 0}
            className={`mr-carousel__slide${i === active ? ' mr-carousel__slide--active' : ''}`}
          />
        ))}
      </span>

      <div className="mr-carousel__dots" aria-label="Select image">
        {images.map((_, i) => (
          <button
            key={i}
            className={`mr-carousel__dot${i === active ? ' mr-carousel__dot--active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`View ${i + 1}`}
            aria-current={i === active}
          />
        ))}
      </div>

      <button className="mr-carousel__btn mr-carousel__btn--prev" onClick={prev} aria-label="Previous image">
        ‹
      </button>
      <button className="mr-carousel__btn mr-carousel__btn--next" onClick={next} aria-label="Next image">
        ›
      </button>
    </div>
  )
}
