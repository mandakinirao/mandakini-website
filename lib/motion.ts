'use client'

/**
 * The single motion system for the site (spec §3).
 * Every animation goes through these tokens and primitives —
 * components import gsap from here, never from 'gsap' directly.
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { CustomEase } from 'gsap/CustomEase'
import { SplitText } from 'gsap/SplitText'
import Lenis from 'lenis'

export const EASE = 'mandakini'

/** Auxiliary eases — the kinetic moments that deliberately deviate from
 *  the master ease (pointer following, physical pops, loader beats).
 *  Named here so no component ever hardcodes a GSAP ease string. */
export const EASE_OUT = 'power3.out'
export const EASE_IN = 'power3.in'
export const EASE_SOFT_OUT = 'power2.out'
export const EASE_SOFT_INOUT = 'power2.inOut'
export const EASE_SINE = 'sine.inOut'
export const EASE_POP = 'back.out(2.2)'

export const DUR = {
  fast: 0.6,
  base: 1.0,
  grand: 1.4,
} as const

export const STAGGER = {
  lines: 0.08,
  burst: 0.05,
} as const

let registered = false

function register() {
  if (registered || typeof window === 'undefined') return
  registered = true
  gsap.registerPlugin(ScrollTrigger, Flip, CustomEase, SplitText)
  CustomEase.create(EASE, '0.25, 1, 0.5, 1')
}

register()

export { gsap as mandaGsap, ScrollTrigger, Flip }

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isTouch(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(hover: none), (pointer: coarse)').matches
}

/* ── Lenis singleton, synced to ScrollTrigger (spec §3.4) ──────────── */

let lenis: Lenis | null = null
let lenisTicker: ((time: number) => void) | null = null

export function initLenis(): Lenis | null {
  if (typeof window === 'undefined' || prefersReducedMotion()) return null
  if (lenis) return lenis
  lenis = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })
  lenis.on('scroll', ScrollTrigger.update)
  lenisTicker = (time: number) => {
    lenis?.raf(time * 1000)
  }
  gsap.ticker.add(lenisTicker)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function destroyLenis() {
  if (lenisTicker) gsap.ticker.remove(lenisTicker)
  lenis?.destroy()
  lenis = null
  lenisTicker = null
}

export function lockScroll() {
  if (lenis) lenis.stop()
  document.documentElement.style.overflow = 'hidden'
}

export function unlockScroll() {
  document.documentElement.style.overflow = ''
  if (lenis) lenis.start()
}

/* ── Reveal primitives — the only two reveal moves (spec §3.3) ─────── */

interface RevealOptions {
  delay?: number
  /** animate when the element scrolls into view instead of immediately */
  scrollTrigger?: boolean
  start?: string
}

/**
 * revealLines — split into masked lines, yPercent 110 → 0, line stagger.
 * Re-splits on font load/resize via autoSplit so measurements stay true.
 */
export function revealLines(
  el: Element | null,
  opts: RevealOptions = {}
): SplitText | null {
  if (!el) return null
  if (prefersReducedMotion()) {
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        delay: opts.delay ?? 0,
        scrollTrigger: opts.scrollTrigger
          ? { trigger: el, start: opts.start ?? 'top 85%', once: true }
          : undefined,
      }
    )
    return null
  }
  gsap.set(el, { opacity: 1 })
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    linesClass: 'mr-line',
    onSplit: (self: SplitText) =>
      gsap.from(self.lines, {
        yPercent: 110,
        duration: DUR.base,
        ease: EASE,
        stagger: STAGGER.lines,
        delay: opts.delay ?? 0,
        scrollTrigger: opts.scrollTrigger
          ? { trigger: el, start: opts.start ?? 'top 85%', once: true }
          : undefined,
      }),
  })
}

/**
 * revealImage — the painting is uncovered, never slid in.
 * `el` is the rounded mask container; the inner image carries
 * [data-reveal-img] and rests at scale 1.12 (parallax travel room).
 */
export function revealImage(
  el: Element | null,
  opts: RevealOptions = {}
): gsap.core.Timeline | null {
  if (!el) return null
  const img = el.querySelector('[data-reveal-img]')
  if (prefersReducedMotion()) {
    if (img) gsap.set(img, { scale: 1.12 })
    gsap.fromTo(
      el,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        delay: opts.delay ?? 0,
        scrollTrigger: opts.scrollTrigger
          ? { trigger: el, start: opts.start ?? 'top 85%', once: true }
          : undefined,
      }
    )
    return null
  }
  gsap.set(el, { clipPath: 'inset(100% 0% 0% 0%)' })
  if (img) gsap.set(img, { scale: 1.25 })
  const tl = gsap.timeline({
    delay: opts.delay ?? 0,
    defaults: { duration: DUR.base, ease: EASE },
    scrollTrigger: opts.scrollTrigger
      ? { trigger: el, start: opts.start ?? 'top 85%', once: true }
      : undefined,
  })
  tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)' }, 0)
  if (img) tl.to(img, { scale: 1.12 }, 0)
  return tl
}

/* ── Continuous background scrub (spec §3.5) ───────────────────────── */

interface ScrubPalette {
  '--scroll-bg': string
  '--ink-current': string
  '--ink-muted-current': string
  '--rule-current': string
}

const SCRUB_PALETTES: Record<string, ScrubPalette> = {
  cream: {
    '--scroll-bg': '#FAF3EA',
    '--ink-current': '#3D1F0D',
    '--ink-muted-current': 'rgba(61, 31, 13, 0.56)',
    '--rule-current': 'rgba(61, 31, 13, 0.16)',
  },
  linen: {
    '--scroll-bg': '#F0E8DC',
    '--ink-current': '#3D1F0D',
    '--ink-muted-current': 'rgba(61, 31, 13, 0.56)',
    '--rule-current': 'rgba(61, 31, 13, 0.16)',
  },
  deep: {
    '--scroll-bg': '#E9DDCB',
    '--ink-current': '#3D1F0D',
    '--ink-muted-current': 'rgba(61, 31, 13, 0.6)',
    '--rule-current': 'rgba(61, 31, 13, 0.18)',
  },
  night: {
    '--scroll-bg': '#2C1A0E',
    '--ink-current': '#F5EFE4',
    '--ink-muted-current': 'rgba(245, 239, 228, 0.6)',
    '--rule-current': 'rgba(245, 239, 228, 0.18)',
  },
}

/**
 * One body-level background journey: cream → linen → deep → night,
 * driven by [data-bg] marker sections inside `root`. Text colors invert
 * in sync because every component reads the --ink-current family.
 */
export function initBackgroundScrub(root: HTMLElement): () => void {
  if (prefersReducedMotion()) return () => {}
  const docEl = document.documentElement
  const markers = Array.from(root.querySelectorAll<HTMLElement>('[data-bg]'))
  const triggers: ScrollTrigger[] = []
  markers.forEach((marker) => {
    const key = marker.dataset.bg as keyof typeof SCRUB_PALETTES
    const palette = SCRUB_PALETTES[key]
    if (!palette) return
    const tween = gsap.to(docEl, {
      ...palette,
      ease: 'none',
      immediateRender: false,
      scrollTrigger: {
        trigger: marker,
        start: 'top 90%',
        end: 'top 35%',
        scrub: true,
      },
    })
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
  })
  return () => {
    triggers.forEach((t) => {
      t.animation?.kill()
      t.kill()
    })
    Object.keys(SCRUB_PALETTES.cream).forEach((prop) =>
      docEl.style.removeProperty(prop)
    )
  }
}

/* ── Velocity skew (spec §3.6) ─────────────────────────────────────── */

/**
 * Lenis velocity feeds a clamped skewY on [data-velocity-skew] elements.
 * Deviation from spec: the "tiny letter-spacing stretch" is omitted —
 * letter-spacing animates layout, which §14 forbids (transform-only rule).
 */
export function initVelocitySkew(): () => void {
  if (prefersReducedMotion() || !lenis) return () => {}
  const els = Array.from(
    document.querySelectorAll<HTMLElement>('[data-velocity-skew]')
  )
  if (!els.length) return () => {}
  const clampSkew = gsap.utils.clamp(-1.5, 1.5)
  const setters = els.map((el) =>
    gsap.quickTo(el, 'skewY', { duration: 0.5, ease: 'power3.out' })
  )
  const onScroll = (e: { velocity: number }) => {
    const skew = clampSkew(e.velocity * 0.04)
    setters.forEach((set) => set(skew))
  }
  lenis.on('scroll', onScroll)
  return () => {
    lenis?.off('scroll', onScroll)
    els.forEach((el) => gsap.set(el, { skewY: 0 }))
  }
}
