'use client'

import Image from 'next/image'
import Link from 'next/link'
import PillCta from '@/components/ui/PillCta'
import { useEffect, useRef } from 'react'
import type { HomeSeries } from '@/lib/home-data'
import {
  EASE,
  EASE_IN,
  EASE_OUT,
  EASE_POP,
  EASE_SOFT_INOUT,
  EASE_SOFT_OUT,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
} from '@/lib/motion'

interface RisingSunWorksProps {
  series: HomeSeries[]
}

/**
 * V2 §3 — "Projects" on the Rising Sun stage. Each project is a named
 * series: two of its images ride as tilted cards over an indigo ghost,
 * and each scroll step throws the current series off-stage and lands
 * the next with a snap, the series name swapping below.
 */
// The scalability contract (IA §2): home shows at most 4 featured
// series no matter how many exist — "All projects" is the door.
const HOME_CAP = 4

export default function RisingSunWorks({ series: allSeries }: RisingSunWorksProps) {
  const series = allSeries.slice(0, HOME_CAP)
  const rootRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const stage = stageRef.current
    if (!root || !stage) return
    const hoverAborter = new AbortController()

    const ctx = mandaGsap.context(() => {
      const groups = Array.from(
        root.querySelectorAll<HTMLElement>('.mr2-works__group')
      )
      const titles = Array.from(
        root.querySelectorAll<HTMLElement>('.mr2-works__title')
      )
      const counter = root.querySelector<HTMLElement>('.mr2-works__counter b')

      // Tile hover — the front image springs upright and lifts, the
      // second image and ghost lean further back, easing home on leave.
      if (!prefersReducedMotion() && !isTouch()) {
        groups.forEach((group) => {
          const link = group.querySelector<HTMLElement>('a')
          const front = group.querySelector('.mr2-card--front')
          const mid = group.querySelector('.mr2-card--mid')
          const ghost = group.querySelector('.mr2-card--ghost')
          if (!link || !front || !ghost) return
          link.addEventListener(
            'pointerenter',
            () => {
              // tilt + a gentle fan: front leans left, the others spread right
              mandaGsap.to(front, {
                rotation: -2,
                y: -16,
                xPercent: -7,
                duration: 0.65,
                ease: EASE_POP,
              })
              if (mid) {
                mandaGsap.to(mid, {
                  rotation: 10,
                  y: 6,
                  xPercent: 8,
                  duration: 0.65,
                  ease: EASE_POP,
                })
              }
              mandaGsap.to(ghost, {
                rotation: 16,
                y: 12,
                xPercent: 16,
                duration: 0.65,
                ease: EASE_POP,
              })
            },
            { signal: hoverAborter.signal }
          )
          link.addEventListener(
            'pointerleave',
            () => {
              mandaGsap.to(front, {
                rotation: -5,
                y: 0,
                xPercent: 0,
                duration: 0.5,
                ease: EASE,
              })
              if (mid) {
                mandaGsap.to(mid, {
                  rotation: 5,
                  y: 0,
                  xPercent: 0,
                  duration: 0.5,
                  ease: EASE,
                })
              }
              mandaGsap.to(ghost, {
                rotation: 10,
                y: 0,
                xPercent: 0,
                duration: 0.5,
                ease: EASE,
              })
            },
            { signal: hoverAborter.signal }
          )
        })
      }

      if (prefersReducedMotion()) {
        mandaGsap.set('.mr2-works__sun', { y: '-=0', yPercent: 0 })
        mandaGsap.set(groups[0], { autoAlpha: 1 })
        mandaGsap.set(titles[0], { opacity: 1 })
        return
      }

      mandaGsap.set(groups, { autoAlpha: 0, x: '70vw', rotate: 14 })
      mandaGsap.set(groups[0], { autoAlpha: 1, x: 0, rotate: 0 })
      mandaGsap.set(titles[0], { opacity: 1 })

      const steps = series.length - 1
      const tl = mandaGsap.timeline({
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: `+=${(steps + 1) * 60}%`,
          pin: true,
          scrub: true,
          snap: {
            snapTo: (v) => {
              if (v < 0.06) return 0
              const seg = (1 - 0.12) / steps
              return 0.12 + Math.round((v - 0.12) / seg) * seg
            },
            duration: { min: 0.15, max: 0.4 },
            ease: EASE_SOFT_INOUT,
          },
        },
      })

      tl.fromTo(
        '.mr2-works__sun',
        { yPercent: 40 },
        { yPercent: 0, duration: 0.7, ease: EASE_SOFT_OUT },
        0
      )

      for (let i = 1; i <= steps; i++) {
        const at = 0.7 + (i - 1)
        tl.to(
          groups[i - 1],
          { x: '-70vw', rotate: -16, autoAlpha: 0, duration: 0.5, ease: EASE_IN },
          at
        )
        tl.to(
          groups[i],
          { x: 0, rotate: 0, autoAlpha: 1, duration: 0.55, ease: EASE_OUT },
          at + 0.35
        )
        tl.to(titles[i - 1], { opacity: 0, duration: 0.2, ease: 'none' }, at + 0.1)
        tl.to(titles[i], { opacity: 1, duration: 0.25, ease: 'none' }, at + 0.55)
        if (counter) {
          tl.add(() => {
            counter.textContent = String(i + 1)
          }, at + 0.45)
        }
      }
      tl.to({}, { duration: 0.4 })
    }, root)
    return () => {
      hoverAborter.abort()
      ctx.revert()
    }
  }, [series.length])

  return (
    <section ref={rootRef} className="mr2-works" aria-label="Projects">
      <div ref={stageRef} className="mr2-works__stage">
        <div className="mr2-works__sun" aria-hidden="true" />

        {series.map((item) => (
          <div key={item.index} className="mr2-works__group">
            <Link href={item.href} aria-label={item.name}>
              <span className="mr2-card mr2-card--ghost" aria-hidden="true" />
              {item.images[1] && (
                <span className="mr2-card mr2-card--mid mr2-duo" aria-hidden="true">
                  <Image
                    src={item.images[1]}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 64vw, 36vw"
                  />
                </span>
              )}
              <span className="mr2-card mr2-card--front mr2-duo">
                <Image
                  src={item.images[0]}
                  alt={item.name}
                  fill
                  sizes="(max-width: 900px) 64vw, 36vw"
                />
              </span>
            </Link>
          </div>
        ))}

        <div className="mr2-works__meta">
          <p className="mr2-works__counter">
            <b>1</b> / {series.length} — Projects
          </p>
          <div className="mr2-works__titles">
            {series.map((item) => (
              <div key={item.index} className="mr2-works__title">
                <strong>{item.name}</strong>
              </div>
            ))}
          </div>
        </div>

        <PillCta href="/works" className="mr2-works__all">
          All projects <span aria-hidden="true">→</span>
        </PillCta>
      </div>
    </section>
  )
}
