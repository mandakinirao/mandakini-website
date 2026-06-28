'use client'

import Link from 'next/link'
import PillCta from '@/components/ui/PillCta'
import AnimatedSocialLinks, { type Social } from '@/components/ui/social-links'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion } from '@/lib/motion'

const NAV_LINKS = [
  { label: 'Works', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Press', href: '/press' },
]

const SOCIALS: Social[] = [
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/mandakini_rao/',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/@mandakinirao',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
  },
]

export default function FooterV2() {
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
          <h4>Social Links</h4>
          <AnimatedSocialLinks socials={SOCIALS} className="-ml-5" />
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
