'use client'

import { useEffect, useRef, useState } from 'react'
import ContactCta from '@/components/home/ContactCta'
import Hero, { type HeroHandle } from '@/components/home/Hero'
import IntroStatement from '@/components/home/IntroStatement'
import LoadingScreen from '@/components/home/LoadingScreen'
import PressStrip from '@/components/home/PressStrip'
import ProjectSeries from '@/components/home/ProjectSeries'
import ShopTeaser from '@/components/home/ShopTeaser'
import type { HomeData } from '@/lib/home-data'
import {
  DUR,
  EASE,
  Flip,
  ScrollTrigger,
  initBackgroundScrub,
  mandaGsap,
  unlockScroll,
} from '@/lib/motion'

/**
 * Client orchestrator for the homepage: owns the loader ↔ hero handoff
 * (iris + FLIP wordmark), mounts the global background scrub, and lays
 * the sections out as one continuous scroll (spec §14 — zero hard cuts).
 */
export default function HomeExperience({
  series,
  prints,
  press,
  testimonials,
}: HomeData) {
  const rootRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HeroHandle>(null)
  // SSR renders the loader shade so the first paint is never a hero flash;
  // revisits in the same session drop it immediately on mount.
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('mr-intro-seen')) {
      setShowLoader(false)
      unlockScroll()
      heroRef.current?.playEntrance()
    }
  }, [])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const cleanup = initBackgroundScrub(root)
    return cleanup
  }, [])

  const handleExit = (wordmarkEl: HTMLElement) => {
    const nameEl = heroRef.current?.getNameEl()
    if (nameEl) {
      // The name never disappears and reappears — it travels (spec §4.3).
      Flip.fit(wordmarkEl, nameEl, {
        duration: DUR.grand,
        ease: EASE,
        scale: true,
        onComplete: () => {
          mandaGsap.set(nameEl, { opacity: 1 })
          mandaGsap.set(wordmarkEl, { autoAlpha: 0 })
        },
      })
    }
    heroRef.current?.playEntrance({ flipName: true })
  }

  const handleComplete = () => {
    setShowLoader(false)
    unlockScroll()
    ScrollTrigger.refresh()
  }

  return (
    <div ref={rootRef} className="mr-home">
      {showLoader && (
        <LoadingScreen onExit={handleExit} onComplete={handleComplete} />
      )}
      <Hero ref={heroRef} />
      <IntroStatement />
      <ProjectSeries series={series} />
      <ShopTeaser prints={prints} />
      <ContactCta />
      <PressStrip items={press} testimonials={testimonials} />
    </div>
  )
}
