'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DUR, EASE, EASE_OUT, mandaGsap } from '@/lib/motion'

const LABELS: Record<string, string> = {
  view: 'View',
  open: 'Open',
  drag: 'Drag',
  enter: 'Enter',
}

const REST_SCALE = 0.18 // 64px base → ~12px dot
const HOVER_SCALE = 1.3 // → ~83px circle with readable label

/**
 * The site cursor, rebuilt from scratch (June 2026).
 *
 * Architecture (the load-bearing decisions):
 * - Portaled to document.body — NEVER inside the Lenis wrapper or any
 *   transformed/filtered ancestor, which silently re-anchors
 *   position:fixed and causes the stuck-follower bug this replaces.
 * - One element. Movement is two gsap.quickTo tweens on x/y fed by a
 *   single window mousemove listener. No React state on move, no own
 *   rAF loops, no top/left writes.
 * - Hover states via ONE delegated pointerover/pointerout pair on
 *   document, reading `[data-cursor]` (label from data-cursor-label,
 *   else the data-cursor keyword, else "View"). Scale/opacity tweens
 *   on the same element only.
 * - While scrolling, the element under the pointer is re-resolved via
 *   elementFromPoint so the label can never strand when content moves
 *   beneath a stationary pointer.
 * - Hidden when (pointer: fine) doesn't match; fades out on document
 *   mouseleave and window blur, back on re-entry. Native cursor stays
 *   visible (it was never intentionally hidden — see PROGRESS.md).
 *
 * Gated off body:not(.mr2-mode) in CSS so the retired /?v=1 page keeps
 * only its own legacy cursor (that page is frozen by client direction).
 */
export default function Cursor() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) {
      setHost(document.body)
    }
  }, [])

  useEffect(() => {
    const el = rootRef.current
    const label = labelRef.current
    if (!host || !el || !label) return

    mandaGsap.set(el, {
      xPercent: -50,
      yPercent: -50,
      scale: REST_SCALE,
      transformOrigin: '50% 50%',
    })
    const toX = mandaGsap.quickTo(el, 'x', { duration: 0.5, ease: EASE_OUT })
    const toY = mandaGsap.quickTo(el, 'y', { duration: 0.5, ease: EASE_OUT })

    let shown = false
    let lastX = 0
    let lastY = 0
    let activeTarget: Element | null = null

    const expand = (target: HTMLElement) => {
      activeTarget = target
      label.textContent =
        target.dataset.cursorLabel ??
        LABELS[target.dataset.cursor ?? ''] ??
        'View'
      mandaGsap.to(el, { scale: HOVER_SCALE, duration: DUR.fast, ease: EASE })
      mandaGsap.to(label, { opacity: 1, duration: DUR.fast, ease: EASE })
    }

    const shrink = () => {
      activeTarget = null
      mandaGsap.to(el, { scale: REST_SCALE, duration: DUR.fast, ease: EASE })
      mandaGsap.to(label, { opacity: 0, duration: DUR.fast / 2, ease: EASE })
    }

    const onMove = (e: MouseEvent) => {
      lastX = e.clientX
      lastY = e.clientY
      if (!shown) {
        shown = true
        mandaGsap.set(el, { x: lastX, y: lastY })
        mandaGsap.to(el, { autoAlpha: 1, duration: 0.3, ease: EASE })
      }
      toX(lastX)
      toY(lastY)
    }

    // Delegated hover — components only declare [data-cursor].
    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.(
        '[data-cursor]'
      ) as HTMLElement | null
      if (target && target !== activeTarget) expand(target)
    }
    const onOut = (e: PointerEvent) => {
      const from = (e.target as Element | null)?.closest?.('[data-cursor]')
      if (!from) return
      const to = (e.relatedTarget as Element | null)?.closest?.('[data-cursor]')
      if (from !== to) shrink()
    }

    // Scroll moves content under a stationary pointer without firing
    // pointer events — re-resolve so the hover state can never strand.
    let syncQueued = false
    const onScroll = () => {
      if (syncQueued || !shown) return
      syncQueued = true
      requestAnimationFrame(() => {
        syncQueued = false
        const under = document
          .elementFromPoint(lastX, lastY)
          ?.closest?.('[data-cursor]') as HTMLElement | null
        if (under && under !== activeTarget) expand(under)
        else if (!under && activeTarget) shrink()
      })
    }

    const fadeOut = () => {
      mandaGsap.to(el, { autoAlpha: 0, duration: 0.25, ease: EASE })
    }
    const fadeIn = () => {
      if (shown) mandaGsap.to(el, { autoAlpha: 1, duration: 0.25, ease: EASE })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    document.documentElement.addEventListener('mouseleave', fadeOut)
    document.documentElement.addEventListener('mouseenter', fadeIn)
    window.addEventListener('blur', fadeOut)
    window.addEventListener('focus', fadeIn)
    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('scroll', onScroll)
      document.documentElement.removeEventListener('mouseleave', fadeOut)
      document.documentElement.removeEventListener('mouseenter', fadeIn)
      window.removeEventListener('blur', fadeOut)
      window.removeEventListener('focus', fadeIn)
    }
  }, [host])

  if (!host) return null

  return createPortal(
    <div ref={rootRef} className="mrx-cursor" aria-hidden="true">
      <span ref={labelRef} className="mrx-cursor__label" />
    </div>,
    host
  )
}
