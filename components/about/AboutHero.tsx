'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { mandaGsap, EASE, DUR, prefersReducedMotion } from '@/lib/motion'
import { urlForImage } from '@/sanity/lib/image'
import type { Image as SanityImage } from 'sanity'

type HeroImage = SanityImage & { alt?: string; caption?: string }

interface AboutHeroProps {
  leadIn?: string
  displayWord?: string
  subhead?: string
  leftImage?: HeroImage
  rightImage?: HeroImage
}

export default function AboutHero({
  leadIn,
  displayWord,
  subhead,
  leftImage,
  rightImage,
}: AboutHeroProps) {
  const rootRef = useRef<HTMLElement>(null)

  const leftUrl = leftImage
    ? urlForImage(leftImage).width(560).height(840).fit('crop').url()
    : null
  const rightUrl = rightImage
    ? urlForImage(rightImage).width(560).height(840).fit('crop').url()
    : null

  // Apply dark-nav body class (cream background needs cacao navigation)
  useEffect(() => {
    document.body.classList.add('about-page')
    return () => document.body.classList.remove('about-page')
  }, [])

  useEffect(() => {
    if (!rootRef.current) return
    const rm = prefersReducedMotion()
    const ctx = mandaGsap.context(() => {
      // Arch columns: opacity + slight upward drift
      mandaGsap.from('.about-hero__arch-col', {
        opacity: 0,
        y: rm ? 0 : 50,
        duration: DUR.grand,
        ease: EASE,
        stagger: rm ? 0 : 0.18,
        delay: 0.2,
      })

      // Lead-in label
      mandaGsap.from('.about-hero__lead', {
        opacity: 0,
        y: rm ? 0 : 12,
        duration: DUR.base,
        ease: EASE,
        delay: 0.35,
      })

      // Display word: slides up from behind overflow-hidden parent
      mandaGsap.from('.about-hero__word-inner', {
        yPercent: rm ? 0 : 110,
        opacity: rm ? 0 : 1,
        duration: DUR.grand,
        ease: EASE,
        delay: 0.3,
      })

      // Brushstroke draws on after word lands
      if (!rm) {
        mandaGsap.fromTo(
          '.about-hero__stroke-path',
          { strokeDashoffset: 520 },
          { strokeDashoffset: 0, duration: DUR.base, ease: EASE, delay: 0.85 }
        )
      }

      // Subhead
      mandaGsap.from('.about-hero__sub', {
        opacity: 0,
        y: rm ? 0 : 14,
        duration: DUR.base,
        ease: EASE,
        delay: 0.7,
      })

      // Museum captions
      mandaGsap.from('.about-hero__caption', {
        opacity: 0,
        duration: DUR.base,
        ease: EASE,
        stagger: rm ? 0 : 0.15,
        delay: 0.9,
      })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Render nothing if no content at all
  if (!displayWord && !leftImage && !rightImage) return null

  return (
    <section ref={rootRef} className="about-hero">
      {/* Arch clip-path defs — unique ID avoids collision */}
      <svg className="about-arch-svg" aria-hidden="true">
        <defs>
          <clipPath clipPathUnits="objectBoundingBox" id="mandakini-arch-hero">
            <path d="M 0,1 L 0,0.38 Q 0,0 0.5,0 Q 1,0 1,0.38 L 1,1 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Left arch column */}
      <div className="about-hero__arch-col about-hero__arch-col--left">
        {leftUrl && (
          <div className="about-hero__arch-wrap">
            <Image
              src={leftUrl}
              alt={leftImage?.alt ?? 'Painting by Mandakini Rao'}
              fill
              sizes="(max-width: 640px) 40vw, 26vw"
              className="about-hero__arch-img"
            />
          </div>
        )}
        {leftImage?.caption && (
          <p className="about-hero__caption">{leftImage.caption}</p>
        )}
      </div>

      {/* Centre: lead-in, display word, brushstroke, subhead */}
      <div className="about-hero__center">
        {leadIn && <p className="about-hero__lead">{leadIn}</p>}

        {displayWord && (
          <div className="about-hero__word-wrap">
            <span className="about-hero__word-inner">{displayWord}</span>
            {/* Terracotta brushstroke drawn on by strokeDashoffset tween */}
            <svg
              className="about-hero__stroke"
              aria-hidden="true"
              viewBox="0 0 520 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="about-hero__stroke-path"
                d="M 4 18 C 40 8, 110 24, 180 14 C 250 4, 320 22, 400 12 C 450 6, 490 20, 516 14"
                stroke="var(--accent-terracotta)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="520"
                strokeDashoffset="520"
              />
            </svg>
          </div>
        )}

        {subhead && <p className="about-hero__sub">{subhead}</p>}
      </div>

      {/* Right arch column */}
      <div className="about-hero__arch-col about-hero__arch-col--right">
        {rightUrl && (
          <div className="about-hero__arch-wrap">
            <Image
              src={rightUrl}
              alt={rightImage?.alt ?? 'Painting by Mandakini Rao'}
              fill
              sizes="(max-width: 640px) 40vw, 26vw"
              className="about-hero__arch-img"
            />
          </div>
        )}
        {rightImage?.caption && (
          <p className="about-hero__caption">{rightImage.caption}</p>
        )}
      </div>
    </section>
  )
}
