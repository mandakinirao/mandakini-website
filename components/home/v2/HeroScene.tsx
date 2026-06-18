'use client'

import { forwardRef, useImperativeHandle } from 'react'
import InkReveal from './InkReveal'

export interface HeroSceneHandle {
  /** No-op — kept so HomeExperienceV2 wiring stays unchanged. */
  playEntrance: () => void
}

const HeroScene = forwardRef<HeroSceneHandle, { tagline?: string }>(
  function HeroScene({ tagline = 'Artist · Educator · Storyteller' }, ref) {
    useImperativeHandle(ref, () => ({ playEntrance() {} }))

    return (
      <section className="mr2-hscene" aria-label="Mandakini Rao — artist studio">
        <InkReveal
          topSrc="/art/hero/hero-bw.jpg"
          bottomSrc="/art/hero/hero-bottom.png"
        />

        {/* Vignette: ensures text at the bottom stays legible over both layers */}
        <div className="mr2-hscene__vignette" aria-hidden="true" />

        <div className="mr2-hscene__text">
          <h1 className="mr2-hscene__name" data-hero-name>Mandakini Rao</h1>
          <p className="mr2-hscene__sub">{tagline}</p>
        </div>

        <p className="mr2-hscene__cue" aria-hidden="true">Scroll</p>
      </section>
    )
  }
)

export default HeroScene
