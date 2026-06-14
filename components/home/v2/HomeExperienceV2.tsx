'use client'

import { useEffect, useRef, useState } from 'react'
import CanvasCards from '@/components/home/v2/CanvasCards'
import ContactStage from '@/components/home/v2/ContactStage'
import EditionShop from '@/components/home/v2/EditionShop'
import HeroRavana, { type HeroRavanaHandle } from '@/components/home/v2/HeroRavana'
import LoadingScreenStripes from '@/components/home/v2/LoadingScreenStripes'
import MarqueePress from '@/components/home/v2/MarqueePress'
import RisingSunWorks from '@/components/home/v2/RisingSunWorks'
import StripeBand from '@/components/home/v2/StripeBand'
import type { HomeData } from '@/lib/home-data'
import { ScrollTrigger, unlockScroll } from '@/lib/motion'

const THEME_KEY = 'mr2-theme'

/**
 * V2 orchestrator — the "gallery poster" pitch (/?v=2). Owns the
 * mr2-mode body flag (recolors nav, swaps footer + cursor), the
 * dark/light theme toggle, the shutter-loader handoff, and the
 * section run. V1 is untouched as the default.
 */
const SANITY_HERO_QUERY = encodeURIComponent(
  '*[_type == "siteSettings"][0].heroImages[].asset->url'
)
const SANITY_HERO_URL = `https://i4t9kzxg.api.sanity.io/v2021-10-21/data/query/production?query=${SANITY_HERO_QUERY}`

export default function HomeExperienceV2({
  series,
  prints,
  press,
  testimonials,
  heroImages: heroImagesProp,
  tagline,
  aboutBio,
  aboutPortrait,
}: HomeData) {
  const heroRef = useRef<HeroRavanaHandle>(null)
  const [showLoader, setShowLoader] = useState(true)
  const [light, setLight] = useState(false)
  const [heroImages, setHeroImages] = useState<string[]>(heroImagesProp ?? [])

  useEffect(() => {
    if (heroImages.length === 7) return
    fetch(SANITY_HERO_URL)
      .then((r) => r.json())
      .then((d) => {
        const urls: string[] = d?.result ?? []
        if (urls.length === 7) setHeroImages(urls)
      })
      .catch(() => {})
  }, [heroImages.length])

  useEffect(() => {
    document.body.classList.add('mr2-mode')
    const stored = localStorage.getItem(THEME_KEY) === 'light'
    setLight(stored)
    document.body.classList.toggle('mr2-light', stored)
    return () => document.body.classList.remove('mr2-mode', 'mr2-light')
  }, [])

  // The intro plays once per browser session; revisits and refreshes
  // land straight on the hero (a new tab replays it).
  useEffect(() => {
    if (sessionStorage.getItem('mr2-intro-seen')) {
      setShowLoader(false)
      unlockScroll()
      heroRef.current?.playEntrance()
    }
  }, [])

  const toggleTheme = () => {
    const next = !light
    setLight(next)
    document.body.classList.toggle('mr2-light', next)
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark')
  }

  const handleComplete = () => {
    setShowLoader(false)
    unlockScroll()
    heroRef.current?.playEntrance()
    ScrollTrigger.refresh()
  }

  return (
    <div className="mr2-home">
      {showLoader && <LoadingScreenStripes onComplete={handleComplete} heroAssets={heroImages} tagline={tagline} />}
      <HeroRavana ref={heroRef} images={heroImages} tagline={tagline} />
      <CanvasCards portrait={aboutPortrait} bio={aboutBio} />
      <StripeBand />
      <RisingSunWorks series={series} />
      <EditionShop prints={prints} />
      <ContactStage />
      <MarqueePress items={press} testimonials={testimonials} />

      <button
        type="button"
        className="mr2-theme-toggle"
        onClick={toggleTheme}
        aria-pressed={light}
      >
        {light ? 'Dark' : 'Light'}
      </button>
    </div>
  )
}
