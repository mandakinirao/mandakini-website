'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { mandaGsap } from '@/lib/motion'

export default function CursorFollower() {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: fine)').matches) setHost(document.body)
  }, [])

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    if (!host || !ring || !dot) return

    mandaGsap.set([ring, dot], { xPercent: -50, yPercent: -50, autoAlpha: 0 })

    const toRingX = mandaGsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3.out' })
    const toRingY = mandaGsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3.out' })
    const toDotX = mandaGsap.quickTo(dot, 'x', { duration: 0.14, ease: 'power2.out' })
    const toDotY = mandaGsap.quickTo(dot, 'y', { duration: 0.14, ease: 'power2.out' })

    let shown = false
    let activeEl: Element | null = null

    const onMove = (e: MouseEvent) => {
      if (!shown) {
        shown = true
        mandaGsap.set([ring, dot], { x: e.clientX, y: e.clientY })
        mandaGsap.to([ring, dot], { autoAlpha: 1, duration: 0.3 })
      }
      toRingX(e.clientX)
      toRingY(e.clientY)
      toDotX(e.clientX)
      toDotY(e.clientY)
    }

    const onOver = (e: PointerEvent) => {
      const target = (e.target as Element | null)?.closest?.('a, button')
      if (target && target !== activeEl) {
        activeEl = target
        mandaGsap.to(ring, { scale: 1.4, duration: 0.25, ease: 'power2.out' })
      }
    }
    const onOut = (e: PointerEvent) => {
      const from = (e.target as Element | null)?.closest?.('a, button')
      if (!from) return
      const to = (e.relatedTarget as Element | null)?.closest?.('a, button')
      if (from !== to) {
        activeEl = null
        mandaGsap.to(ring, { scale: 1, duration: 0.25, ease: 'power2.out' })
      }
    }

    const fadeOut = () => mandaGsap.to([ring, dot], { autoAlpha: 0, duration: 0.25 })
    const fadeIn = () => { if (shown) mandaGsap.to([ring, dot], { autoAlpha: 1, duration: 0.25 }) }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.documentElement.addEventListener('mouseleave', fadeOut)
    document.documentElement.addEventListener('mouseenter', fadeIn)
    window.addEventListener('blur', fadeOut)
    window.addEventListener('focus', fadeIn)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.documentElement.removeEventListener('mouseleave', fadeOut)
      document.documentElement.removeEventListener('mouseenter', fadeIn)
      window.removeEventListener('blur', fadeOut)
      window.removeEventListener('focus', fadeIn)
    }
  }, [host])

  if (!host) return null

  return createPortal(
    <>
      <div ref={ringRef} className="mr2-cursor__ring" aria-hidden="true" />
      <div ref={dotRef} className="mr2-cursor__dot" aria-hidden="true" />
    </>,
    host
  )
}
