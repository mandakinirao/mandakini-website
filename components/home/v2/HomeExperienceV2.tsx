'use client'

import { useEffect, useRef, useState } from 'react'
import CanvasCards from '@/components/home/v2/CanvasCards'
import ContactStage from '@/components/home/v2/ContactStage'
import EditionShop from '@/components/home/v2/EditionShop'
import ParallaxHero, { type ParallaxHeroHandle } from '@/components/home/v2/ParallaxHero'
import LoadingScreenStripes from '@/components/home/v2/LoadingScreenStripes'
import MarqueePress from '@/components/home/v2/MarqueePress'
import RisingSunWorks from '@/components/home/v2/RisingSunWorks'
import StripeBand from '@/components/home/v2/StripeBand'
import type { HomeData } from '@/lib/home-data'
import { ScrollTrigger, unlockScroll } from '@/lib/motion'

const THEME_KEY = 'mr2-theme'

export default function HomeExperienceV2({
  series,
  prints,
  press,
  testimonials,
  tagline,
  aboutBio,
  aboutPortrait,
}: HomeData) {
  const heroRef = useRef<ParallaxHeroHandle>(null)
  const [showLoader, setShowLoader] = useState(true)
  const [light, setLight] = useState(false)

  useEffect(() => {
    document.body.classList.add('mr2-mode')
    const stored = localStorage.getItem(THEME_KEY) === 'light'
    setLight(stored)
    document.body.classList.toggle('mr2-light', stored)
    return () => document.body.classList.remove('mr2-mode', 'mr2-light')
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('mr2-intro-seen')) {
      setShowLoader(false)
      unlockScroll()
      heroRef.current?.playEntrance()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {showLoader && (
        <LoadingScreenStripes onComplete={handleComplete} tagline={tagline} />
      )}
      <ParallaxHero ref={heroRef} tagline={tagline} />
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
