'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import {
  ScrollTrigger,
  destroyLenis,
  initLenis,
  initVelocitySkew,
} from '@/lib/motion'

/**
 * Mounted once in the root layout: owns the Lenis instance, the
 * velocity-skew binding, and the route transition contract.
 *
 * Route transitions: persistent components (nav, footer) keep their
 * ScrollTriggers across client-side navigation, so their measured
 * positions go stale the moment the page height changes. On every
 * pathname change we reset scroll to the top immediately, rebind the
 * velocity-skew to the new page's elements, and refresh every
 * ScrollTrigger once the new layout has painted (double rAF). Page-level
 * triggers never leak — each component reverts its own gsap.context on
 * unmount.
 */
export default function MotionProvider() {
  const lenisRef = useRef<ReturnType<typeof initLenis>>(null)
  const pathname = usePathname()
  const isBackOffice = pathname.startsWith('/studio') || pathname.startsWith('/admin')

  useEffect(() => {
    if (isBackOffice) return
    lenisRef.current = initLenis()
    return () => destroyLenis()
  }, [isBackOffice])

  useEffect(() => {
    if (isBackOffice) return
    lenisRef.current?.scrollTo(0, { immediate: true, force: true })
    const cleanupSkew = initVelocitySkew()
    let raf2 = 0
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => ScrollTrigger.refresh())
    })
    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      cleanupSkew()
    }
  }, [pathname, isBackOffice])

  return null
}
