'use client'

import Link from 'next/link'
import PillCta from '@/components/ui/PillCta'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion } from '@/lib/motion'

const NAV_LINKS = [
  { label: 'Works', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Press', href: '/press' },
]

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="15"
      height="15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  )
}

type FooterProps = {
  instagramHandle?: string
  youtubeChannelName?: string
}

export default function FooterV2({
  instagramHandle,
  youtubeChannelName,
}: FooterProps = {}) {
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
          <a
            className="mr2-social-link"
            href="https://www.instagram.com/mandakini_rao/"
            target="_blank"
            rel="noreferrer"
          >
            <InstagramIcon />
            {instagramHandle ?? 'Instagram'}
          </a>
          <a
            className="mr2-social-link"
            href="https://www.youtube.com/@mandakinirao"
            target="_blank"
            rel="noreferrer"
          >
            <YouTubeIcon />
            {youtubeChannelName ?? 'YouTube'}
          </a>
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
