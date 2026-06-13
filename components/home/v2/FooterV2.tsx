'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { mandaGsap, prefersReducedMotion } from '@/lib/motion'

const NAV_LINKS = [
  { label: 'Works', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Press', href: '/press' },
]

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'YouTube', href: 'https://youtube.com/' },
]

/**
 * V2 §7 — the final frame: columns up top, a marigold contact stamp,
 * and "MANDAKINI" so large only its middle fits, rising as you arrive.
 */
export default function FooterV2() {
  const rootRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Re-created per route: the footer persists across client-side
  // navigation while the page above it changes height, so a mount-once
  // trigger measures against the first page's layout and the reveal
  // never fires anywhere else. MotionProvider's post-paint
  // ScrollTrigger.refresh() then settles the exact positions.
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
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <Link href="/contact" className="mr2-footer__stamp" data-cursor="enter">
          Say hello <span aria-hidden="true">→</span>
        </Link>
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
