'use client'

import Image from 'next/image'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { DUR, EASE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

export interface HeroRavanaHandle {
  /** Post-shutter entrance: cards surface pair by pair from the center. */
  playEntrance: () => void
}

interface HeroRavanaProps {
  /** 7 Sanity-hosted URLs in card order (left→right). Falls back to built-in set when empty. */
  images?: string[]
  tagline?: string
}

// AP's sketch: one centered row, the largest card in the middle, pairs
// stepping down in size outward, each tucked behind the previous.
// ring 1 = center; cutouts ride on colored card stock.
// Layout (ring/stock) is positional config; src comes from Sanity or falls back.
const CARD_LAYOUT = [
  { ring: 4, stock: 'cream' },
  { ring: 3, stock: 'indigo' },
  { ring: 2, stock: '' },
  { ring: 1, stock: '' },
  { ring: 2, stock: '' },
  { ring: 3, stock: 'marigold' },
  { ring: 4, stock: 'cream' },
]

const CENTER_INDEX = CARD_LAYOUT.findIndex((c) => c.ring === 1)

const HeroRavana = forwardRef<HeroRavanaHandle, HeroRavanaProps>(
  function HeroRavana({ images, tagline = 'Painter · Educator · Storyteller' }, ref) {
  const CARDS = CARD_LAYOUT.map((t, i) => ({ ...t, src: images?.[i] ?? '' }))

  const rootRef = useRef<HTMLElement>(null)
  const playedRef = useRef(false)
  // Gallery behaviour: one card is open at a time; hover moves it.
  const [open, setOpen] = useState(CENTER_INDEX)

  useImperativeHandle(ref, () => ({
    playEntrance: () => {
      const root = rootRef.current
      if (!root || playedRef.current) return
      playedRef.current = true

      const cards = Array.from(root.querySelectorAll<HTMLElement>('.mr2-pcard'))
      // entrance animates the INNER span; the scroll scrub owns the outer h1
      const name = root.querySelector('.mr2-hero__name-inner')
      const corners = Array.from(
        root.querySelectorAll('.mr2-hero__roles, .mr2-hero__cue')
      )

      if (prefersReducedMotion()) {
        mandaGsap.set([...cards, name, ...corners, '.site-nav'], {
          clearProps: 'opacity,visibility,transform',
          autoAlpha: 1,
        })
        return
      }

      const center = cards.find((c) => c.dataset.ring === '1')
      if (!center) return
      const centerX = center.getBoundingClientRect()
      const cx = centerX.left + centerX.width / 2

      const tl = mandaGsap.timeline({ defaults: { ease: EASE } })
      // The center painting rises first…
      tl.fromTo(
        center,
        { autoAlpha: 0, y: 50 },
        { autoAlpha: 1, y: 0, duration: DUR.base },
        0
      )
      // …then each pair slides out from behind it, one ring at a time.
      cards
        .filter((c) => c !== center)
        .forEach((card) => {
          const ring = Number(card.dataset.ring)
          const rect = card.getBoundingClientRect()
          const fromX = cx - (rect.left + rect.width / 2)
          const at = 0.5 + (ring - 2) * 0.24
          tl.fromTo(
            card,
            { x: fromX, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, duration: DUR.base },
            at
          )
        })
      if (name) {
        tl.fromTo(
          name,
          { autoAlpha: 0, y: 24 },
          { autoAlpha: 1, y: 0, duration: DUR.base },
          0.3
        )
      }
      tl.fromTo(
        [...corners, '.site-nav'],
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: DUR.fast },
        1.5
      )
    },
  }))

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      if (prefersReducedMotion()) return

      mandaGsap.set('.mr2-pcard', { autoAlpha: 0 })
      mandaGsap.set(
        ['.mr2-hero__name-inner', '.mr2-hero__roles', '.mr2-hero__cue'],
        { autoAlpha: 0 }
      )

      // Scroll exit — outer rings drift apart faster than the center.
      // CRITICAL: the scrub animates xPercent/yPercent (and the OUTER
      // name element) while the entrance animates x/autoAlpha (and the
      // INNER name span) — separate channels, so scrolling mid-entrance
      // can never lock half-built positions into the scrub's reverse
      // path. fromTo + immediateRender:false pins exact start values.
      const exit = mandaGsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
      root.querySelectorAll<HTMLElement>('.mr2-pcard').forEach((card) => {
        const ring = Number(card.dataset.ring)
        const side = card.dataset.side === 'l' ? -1 : 1
        exit.fromTo(
          card,
          { xPercent: 0, yPercent: 0 },
          {
            xPercent: ring === 1 ? 0 : side * ring * 9,
            yPercent: -(ring * 7),
            immediateRender: false,
          },
          0
        )
      })
      exit.fromTo(
        '.mr2-hero__name',
        { autoAlpha: 1, yPercent: 0 },
        { autoAlpha: 0, yPercent: -30, immediateRender: false },
        0
      )
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={rootRef} className="mr2-hero" aria-label="Mandakini Rao">
      <h1 className="mr2-hero__name">
        <span className="mr2-hero__name-inner">Mandakini Rao</span>
      </h1>

      <div className="mr2-hero__row" aria-hidden="true">
        {CARDS.map((card, i) => (
          <div
            key={i}
            className={`mr2-pcard mr2-pcard--${card.ring}${
              card.stock ? ` mr2-pcard--${card.stock}` : ''
            }${i === open ? ' is-open' : ''}`}
            data-ring={card.ring}
            data-side={i < CENTER_INDEX ? 'l' : 'r'}
            onPointerEnter={() => setOpen(i)}
          >
            {card.src && (
              <Image
                src={card.src}
                alt=""
                fill
                unoptimized
                priority={card.ring <= 2}
                sizes="(max-width: 900px) 60vw, 30vw"
              />
            )}
          </div>
        ))}
      </div>

      <p className="mr2-hero__roles">{tagline}</p>
      <p className="mr2-hero__cue">Scroll</p>
    </section>
  )
})

export default HeroRavana
