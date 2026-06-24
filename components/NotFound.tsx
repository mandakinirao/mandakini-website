'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import PillCta from '@/components/ui/PillCta'
import { EASE_SINE, mandaGsap, prefersReducedMotion } from '@/lib/motion'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

// Placeholder until the actual Persian cat animation is supplied.
// Replace with: import persianCat from '@/components/lottie/persian-cat.json'
const LOTTIE_PLACEHOLDER = { v: '5.9.0', fr: 24, ip: 0, op: 72, w: 400, h: 400, nm: 'persian-cat', ddd: 0, assets: [] as unknown[], layers: [] as unknown[] }

export default function NotFound() {
  const b1 = useRef<HTMLDivElement>(null)
  const b2 = useRef<HTMLDivElement>(null)
  const b3 = useRef<HTMLDivElement>(null)
  const b4 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const blobs = [b1.current, b2.current, b3.current, b4.current]
    const ctx = mandaGsap.context(() => {
      blobs.forEach((blob, i) => {
        mandaGsap.to(blob, {
          scale: 1.22,
          duration: 3.2 + i * 0.6,
          ease: EASE_SINE,
          yoyo: true,
          repeat: -1,
          delay: i * 0.85,
        })
      })
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="mr-nf">
      {/* breathing radial blobs */}
      <div ref={b1} className="mr-nf__blob mr-nf__blob--1" aria-hidden="true" />
      <div ref={b2} className="mr-nf__blob mr-nf__blob--2" aria-hidden="true" />
      <div ref={b3} className="mr-nf__blob mr-nf__blob--3" aria-hidden="true" />
      <div ref={b4} className="mr-nf__blob mr-nf__blob--4" aria-hidden="true" />

      <div className="mr-nf__body">
        {/* TODO: swap LOTTIE_PLACEHOLDER for the actual Persian cat animation JSON */}
        <div className="mr-nf__lottie" aria-hidden="true">
          <Lottie
            animationData={LOTTIE_PLACEHOLDER}
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <p className="mr-nf__code">404</p>
        <h1 className="mr-nf__heading">Lost in the studio</h1>
        <p className="mr-nf__sub">This page wandered off. The cat probably moved it.</p>

        <PillCta href="/">Back home</PillCta>
      </div>
    </div>
  )
}
