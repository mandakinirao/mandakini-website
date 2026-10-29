'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { LottieRefCurrentProps } from 'lottie-react'
import { CAT_LINES, leanAngle, nextLineIndex } from '@/lib/cat'
import { prefersReducedMotion } from '@/lib/motion'
import catAnimation from '@/public/lottie/corner-cat.json'

// Plain SVG renderer (lottie-react / lottie-web) — no WASM, no external CDN
// fetch at runtime. Same reasoning as NotFound.tsx: the site CSP has no
// unsafe-eval and no CDN hosts in connect-src, so the dotlottie WASM player
// is blocked. This JSON is bundled locally, so it always renders.
const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

const BUBBLE_MS = 6000
const HOP_MS = 650

/**
 * A small black cat fixed to the bottom-right corner, present on every site
 * page (mounted once in the (site) layout — so 404 and /studio are excluded
 * by construction). It hides itself over the dark homepage hero via the
 * body.mr2-hero-stage class already toggled in Navigation.tsx (CSS only).
 *
 * Interactive: hover → a hop and a quicker loop; click/tap → a speech bubble
 * linking somewhere on the site; on a mouse, it leans toward the cursor.
 * Reduced motion keeps the bubble but drops the hop and the lean.
 */
export default function CatMascot() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [reduced, setReduced] = useState(false)
  const [hopping, setHopping] = useState(false)
  const [line, setLine] = useState<number | null>(null)
  const lineCount = useRef(-1)
  const lottie = useRef<LottieRefCurrentProps | null>(null)
  const catRef = useRef<HTMLButtonElement>(null)
  const leanRef = useRef<HTMLSpanElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setReduced(prefersReducedMotion())
    setHost(document.body)
  }, [])

  // Lean toward the cursor — fine pointers only, one style write per frame.
  useEffect(() => {
    if (!host || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    let frame = 0
    let x = 0
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const cat = catRef.current
        const lean = leanRef.current
        if (!cat || !lean) return
        const r = cat.getBoundingClientRect()
        lean.style.transform = `rotate(${leanAngle(r.left + r.width / 2, x)}deg)`
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [host, reduced])

  const closeBubble = useCallback(() => {
    clearTimeout(closeTimer.current)
    setLine(null)
  }, [])

  useEffect(() => {
    if (line === null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeBubble()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [line, closeBubble])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const hop = () => {
    if (reduced || hopping) return
    setHopping(true)
    lottie.current?.setSpeed(2)
    setTimeout(() => {
      setHopping(false)
      lottie.current?.setSpeed(1)
    }, HOP_MS)
  }

  const toggleBubble = () => {
    if (line !== null) return closeBubble()
    lineCount.current = nextLineIndex(lineCount.current)
    setLine(lineCount.current)
    hop()
    clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setLine(null), BUBBLE_MS)
  }

  if (!host) return null

  const current = line !== null ? CAT_LINES[line] : null

  return createPortal(
    <div className="mr2-cat">
      {current && (
        <div className="mr2-cat__bubble" role="status">
          <Link href={current.href} onClick={closeBubble}>
            {current.text}{'\u00a0'}<span aria-hidden="true">→</span>
          </Link>
        </div>
      )}
      <button
        ref={catRef}
        type="button"
        className={`mr2-cat__btn${hopping ? ' mr2-cat__btn--hop' : ''}`}
        aria-label="Say hello to the studio cat"
        aria-expanded={line !== null}
        onMouseEnter={hop}
        onClick={toggleBubble}
      >
        <span ref={leanRef} className="mr2-cat__lean">
          <Lottie
            lottieRef={lottie}
            animationData={catAnimation}
            loop={!reduced}
            autoplay={!reduced}
            style={{ width: '100%', height: '100%' }}
          />
        </span>
      </button>
    </div>,
    host
  )
}
