'use client'

import { useEffect, useRef, useState } from 'react'
import {
  DUR,
  EASE,
  EASE_OUT,
  isTouch,
  mandaGsap,
  prefersReducedMotion,
} from '@/lib/motion'

const LABELS: Record<string, string> = {
  view: 'View',
  open: 'Open',
  enter: '',
}

/**
 * Global cursor follower (spec §12): cream dot lerped behind the pointer,
 * expanding with a label over [data-cursor] targets. pointer-events: none —
 * the native cursor always works underneath. Absent on touch/reduced motion.
 */
export default function CursorFollower() {
  const [enabled, setEnabled] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    setEnabled(!isTouch() && !prefersReducedMotion())
  }, [])

  useEffect(() => {
    if (!enabled) return
    const el = rootRef.current
    const label = labelRef.current
    if (!el || !label) return

    mandaGsap.set(el, { xPercent: -50, yPercent: -50 })
    const toX = mandaGsap.quickTo(el, 'x', { duration: 0.4, ease: EASE_OUT })
    const toY = mandaGsap.quickTo(el, 'y', { duration: 0.4, ease: EASE_OUT })

    let visible = false
    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true
        mandaGsap.set(el, { x: e.clientX, y: e.clientY })
        mandaGsap.to(el, { opacity: 1, duration: 0.3 })
      }
      toX(e.clientX)
      toY(e.clientY)
    }

    const expand = (kind: string) => {
      label.textContent = LABELS[kind] ?? LABELS.view
      const big = kind === 'enter' ? 110 : 72
      mandaGsap.to(el, { width: big, height: big, duration: DUR.fast, ease: EASE })
      mandaGsap.to(label, { opacity: 1, duration: DUR.fast, ease: EASE })
    }

    const shrink = () => {
      mandaGsap.to(el, { width: 12, height: 12, duration: DUR.fast, ease: EASE })
      mandaGsap.to(label, { opacity: 0, duration: DUR.fast / 2, ease: EASE })
    }

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.('[data-cursor]')
      if (target) expand((target as HTMLElement).dataset.cursor || 'view')
    }

    const onOut = (e: PointerEvent) => {
      const from = (e.target as Element | null)?.closest?.('[data-cursor]')
      if (!from) return
      const to = (e.relatedTarget as Element | null)?.closest?.('[data-cursor]')
      if (from !== to) shrink()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="mr-cursor" aria-hidden="true">
      <span ref={labelRef} className="mr-cursor__label" />
    </div>
  )
}
