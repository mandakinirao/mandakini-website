'use client'

import Link from 'next/link'
import PillCta from '@/components/ui/PillCta'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion, isTouch, EASE, DUR } from '@/lib/motion'

const NAV_LINKS = [
  { label: 'Works', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Press', href: '/press' },
]

type SocialLinkProps = {
  label: string
  href: string
  handle?: string
}

function SocialLink({ label, href, handle }: SocialLinkProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const onEnter = useCallback(() => {
    if (!cardRef.current || !handle || isTouch()) return
    if (prefersReducedMotion()) {
      mandaGsap.set(cardRef.current, { autoAlpha: 1, y: 0 })
      return
    }
    mandaGsap.to(cardRef.current, { autoAlpha: 1, y: 0, duration: DUR.fast, ease: EASE })
  }, [handle])

  const onLeave = useCallback(() => {
    if (!cardRef.current || !handle) return
    if (prefersReducedMotion()) {
      mandaGsap.set(cardRef.current, { autoAlpha: 0, y: 8 })
      return
    }
    mandaGsap.to(cardRef.current, { autoAlpha: 0, y: 8, duration: DUR.fast, ease: EASE })
  }, [handle])

  return (
    <a
      className="mr2-social-link"
      href={href}
      target="_blank"
      rel="noreferrer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {label}
      {handle && (
        <div ref={cardRef} className="mr2-social-card" aria-hidden="true">
          {handle}
        </div>
      )}
    </a>
  )
}

type FooterProps = {
  instagramHandle?: string
  youtubeChannelName?: string
}

export default function FooterV2({ instagramHandle, youtubeChannelName }: FooterProps = {}) {
  const rootRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      if (prefersReducedMotion()) return
      mandaGsap.fromTo(
        '.mr2-footer__giant',
        { yPercent: 45 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: root,
            start: 'top 80%',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )
    }, root)
    return () => ctx.revert()
  }, [pathname])

  return (
    <footer ref={rootRef} className="mr2-footer">
      <div className="mr2-footer__cols">
        <div className="mr2-footer__col">
          <h4>Pages</h4>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="mr2-footer__col">
          <h4>Elsewhere</h4>
          <SocialLink
            label="Instagram"
            href="https://www.instagram.com/mandakini_rao/"
            handle={instagramHandle}
          />
          <SocialLink
            label="YouTube"
            href="https://www.youtube.com/@mandakinirao"
            handle={youtubeChannelName}
          />
        </div>
        <PillCta href="/contact" className="mr2-footer__stamp">
          Say hello <span aria-hidden="true">→</span>
        </PillCta>
      </div>

      <div className="mr2-footer__legal">
        <span>© {new Date().getFullYear()} Mandakini Rao</span>
        <span>Painted in Hyderabad</span>
      </div>

      <p className="mr2-footer__giant" aria-hidden="true">
        Mandakini
      </p>
    </footer>
  )
}
