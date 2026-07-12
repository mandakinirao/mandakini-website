'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { prefersReducedMotion } from '@/lib/motion'
import catAnimation from '@/public/lottie/corner-cat.json'

// Plain SVG renderer (lottie-react / lottie-web) — no WASM, no external CDN
// fetch at runtime. Same reasoning as NotFound.tsx: the site CSP has no
// unsafe-eval and no CDN hosts in connect-src, so the dotlottie WASM player
// is blocked. This JSON is bundled locally, so it always renders.
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

/**
 * A small black cat fixed to the bottom-right corner, present on every site
 * page (mounted once in the (site) layout — so 404 and /studio are excluded
 * by construction). It hides itself over the dark homepage hero via the
 * body.mr2-hero-stage class already toggled in Navigation.tsx (CSS only).
 */
export default function CatMascot() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    setHost(document.body)
  }, [])

  if (!host) return null

  return createPortal(
    <div className="mr2-cat" aria-hidden="true">
      <Lottie
        animationData={catAnimation}
        loop={!reduced}
        autoplay={!reduced}
        style={{ width: '100%', height: '100%' }}
      />
    </div>,
    host
  )
}
