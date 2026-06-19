'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { mandaGsap, EASE, DUR } from '@/lib/motion'
import { urlForImage } from '@/sanity/lib/image'
import type { Image as SanityImage } from 'sanity'

type TextRow = {
  _key: string
  col1?: string
  col2?: string
  col3?: string
}

export type AboutData = {
  name?: string
  discipline?: string
  descriptionLines?: TextRow[]
  portrait?: SanityImage & { alt?: string }
  quote?: string
  quoteAttribution?: string
}

function StackedName({ name }: { name: string }) {
  const words = name.trim().split(/\s+/)
  return (
    <h1 className="about-name-heading" aria-label={name}>
      {words.map((word, i) => (
        <span key={i} className="about-name-line">
          {word}
        </span>
      ))}
    </h1>
  )
}

export default function AboutSection({ data }: { data: AboutData }) {
  const root = useRef<HTMLDivElement>(null)
  const portraitRef = useRef<HTMLDivElement>(null)

  const portraitUrl = data.portrait
    ? urlForImage(data.portrait).width(620).height(900).fit('crop').url()
    : null

  useEffect(() => {
    if (!root.current) return
    const ctx = mandaGsap.context(() => {
      // Name: words slide up from below, no scroll trigger (first section)
      mandaGsap.from('.about-name-line', {
        yPercent: 110,
        duration: DUR.grand,
        ease: EASE,
        stagger: 0.08,
        delay: 0.1,
      })

      // Discipline line fades in after name
      mandaGsap.from('.about-discipline', {
        opacity: 0,
        y: 18,
        duration: DUR.base,
        ease: EASE,
        delay: 0.5,
      })

      // Scattered text rows fade in on scroll
      mandaGsap.from('.about-text-row span', {
        opacity: 0,
        y: 24,
        duration: DUR.base,
        ease: EASE,
        stagger: 0.04,
        scrollTrigger: {
          trigger: '.about-text-section',
          start: 'top 70%',
          once: true,
        },
      })

      // Portrait parallax (slow drift)
      if (portraitRef.current) {
        mandaGsap.to(portraitRef.current.querySelector('img'), {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.about-portrait-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // Quote fade in
      mandaGsap.from('.about-quote-text, .about-quote-attr', {
        opacity: 0,
        y: 20,
        duration: DUR.base,
        ease: EASE,
        stagger: 0.15,
        scrollTrigger: {
          trigger: '.about-quote-section',
          start: 'top 72%',
          once: true,
        },
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root}>
      {/* Hero — stacked name */}
      <section className="about-hero-intro">
        <p className="about-eyebrow">About</p>
        {data.name && <StackedName name={data.name} />}
        {data.discipline && (
          <p className="about-discipline">{data.discipline}</p>
        )}
      </section>

      {/* Scattered description text */}
      {data.descriptionLines && data.descriptionLines.length > 0 && (
        <section className="about-text-section">
          <div className="about-text-rows">
            {data.descriptionLines.map((row) => (
              <div key={row._key} className="about-text-row" data-text-row="">
                <span>{row.col1}</span>
                <span>{row.col2}</span>
                <span>{row.col3}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Arch-clipped portrait */}
      {portraitUrl && (
        <section className="about-portrait-section">
          {/* Inline SVG clip path — scoped to this page */}
          <svg className="about-arch-svg" aria-hidden="true">
            <defs>
              <clipPath clipPathUnits="objectBoundingBox" id="mandakini-arch">
                <path d="M 0,1 L 0,0.38 Q 0,0 0.5,0 Q 1,0 1,0.38 L 1,1 Z" />
              </clipPath>
            </defs>
          </svg>
          <div className="about-portrait-inner">
            <div ref={portraitRef} className="about-arch-wrap">
              <Image
                src={portraitUrl}
                alt={data.portrait?.alt ?? 'Mandakini Rao'}
                fill
                sizes="(max-width: 900px) 92vw, 38rem"
                className="about-arch-img"
              />
            </div>
          </div>
        </section>
      )}

      {/* Pull quote */}
      {data.quote && (
        <section className="about-quote-section">
          <span className="about-quote-mark" aria-hidden="true">"</span>
          <blockquote>
            <p className="about-quote-text">{data.quote}</p>
            {data.quoteAttribution && (
              <cite className="about-quote-attr">— {data.quoteAttribution}</cite>
            )}
          </blockquote>
        </section>
      )}
    </div>
  )
}
