'use client'

import Image from 'next/image'
import PillCta from '@/components/ui/PillCta'
import { useEffect, useRef } from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'

interface AboutFullProps {
  portrait: string
  bio: string
}

const FALLBACK_BIO =
  'Painter, photographer, and educator based in Hyderabad, India. Her work moves between portraiture and still life — finding warmth in the studio, the face, and the palette.'

export default function AboutFull({ portrait, bio }: AboutFullProps) {
  const rootRef = useRef<HTMLElement>(null)
  const maskRef = useRef<HTMLDivElement>(null)

  // Rosehip field: add body classes so the nav + logo switch to dark ink.
  useEffect(() => {
    document.body.classList.add('about-page', 'about-rosehip')
    return () => document.body.classList.remove('about-page', 'about-rosehip')
  }, [])

  useEffect(() => {
    const root = rootRef.current
    const mask = maskRef.current
    if (!root || !mask) return
    const rm = prefersReducedMotion()

    const ctx = mandaGsap.context(() => {
      const img = mask.querySelector('img')

      // Portrait: wipe up from bottom, image settles from slight scale
      if (!rm && img) {
        mandaGsap.set(mask, { clipPath: 'inset(100% 0% 0% 0%)' })
        mandaGsap.set(img, { scale: 1.08 })
        mandaGsap.timeline({ defaults: { duration: DUR.grand, ease: EASE }, delay: 0.1 })
          .to(mask, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
          .to(img, { scale: 1, ease: EASE }, 0)
      }

      // Eyebrow + name: line-split theatrical reveal
      mandaGsap.from(root.querySelector('.mr-about-full__eyebrow'), {
        autoAlpha: 0,
        y: rm ? 0 : 6,
        duration: DUR.base,
        ease: EASE,
        delay: rm ? 0 : 0.2,
      })
      revealLines(root.querySelector('.mr-about-full__name'), { delay: rm ? 0 : 0.3 })

      // Bio: simple fade-up at editorial reading pace
      mandaGsap.from(root.querySelector('.mr-about-full__bio'), {
        autoAlpha: 0,
        y: rm ? 0 : 14,
        duration: DUR.base,
        ease: EASE,
        delay: rm ? 0 : 0.52,
      })

      // CTA eases in last
      mandaGsap.from('.mr-about-full__cta', {
        autoAlpha: 0,
        y: rm ? 0 : 16,
        duration: DUR.fast,
        ease: EASE,
        delay: rm ? 0 : 0.7,
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr-about-full" aria-label="About Mandakini Rao">
      <div ref={maskRef} className="mr-about-full__media">
        <Image
          src={portrait || '/art/about-portrait.jpg'}
          alt="Mandakini Rao"
          fill
          priority
          sizes="(max-width: 768px) 80vw, 48vw"
        />
      </div>

      <div className="mr-about-full__body">
        <p className="mr-about-full__eyebrow">About</p>
        <h1 className="mr-about-full__name">
          Mandakini<br />Rao
        </h1>
        <p className="mr-about-full__bio">{bio || FALLBACK_BIO}</p>
        <PillCta href="/contact" className="mr-about-full__cta">
          Say hello
        </PillCta>
      </div>
    </section>
  )
}
