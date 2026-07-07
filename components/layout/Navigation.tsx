'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ScrollTrigger, menuLock, menuUnlock } from '@/lib/motion'

const menuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Works / Projects', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'Press', href: '/press' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [navHidden, setNavHidden] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!document.querySelector('.mr-hero')) {
      setScrolled(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: '.mr-hero',
      start: 'bottom 30%',
      end: 'max',
      onEnter: () => setScrolled(true),
      onLeaveBack: () => setScrolled(false),
    })

    setScrolled(window.scrollY > window.innerHeight * 1.5)

    return () => {
      trigger.kill()
    }
  }, [pathname])

  // Homepage hero stage — while the ink-reveal hero is the visible surface,
  // the nav logo shows its cream mark (over dark artwork) instead of cacao.
  useEffect(() => {
    const hero = document.querySelector('.mr2-hscene')
    const content = document.querySelector('.mr2-home__content')
    if (!hero || !content) return

    document.body.classList.add('mr2-hero-stage')

    const trigger = ScrollTrigger.create({
      trigger: content,
      start: 'top 120px',
      onEnter: () => document.body.classList.remove('mr2-hero-stage'),
      onLeaveBack: () => document.body.classList.add('mr2-hero-stage'),
    })

    return () => {
      trigger.kill()
      document.body.classList.remove('mr2-hero-stage')
    }
  }, [pathname])

  // Hide on scroll-down, reveal on scroll-up — driven by direction, not position.
  // Dead zone of 6px prevents jitter from micro-bounces.
  useEffect(() => {
    let lastY = window.scrollY
    const DEAD = 6

    const onScroll = () => {
      const y = window.scrollY
      if (y < 80) {
        setNavHidden(false)
      } else if (y > lastY + DEAD) {
        setNavHidden(true)
      } else if (y < lastY - DEAD) {
        setNavHidden(false)
      }
      lastY = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Always reveal nav while the menu overlay is open.
  useEffect(() => {
    if (menuOpen) setNavHidden(false)
  }, [menuOpen])

  // Use menuLock (body overflow, not html) so the fixed overlay can scroll internally.
  useEffect(() => {
    if (!menuOpen) return
    menuLock()
    return () => menuUnlock()
  }, [menuOpen])

  return (
    <>
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''} ${navHidden ? 'site-nav--hidden' : ''}`} aria-label="Primary navigation">
        <Link href="/" className="site-logo" onClick={() => setMenuOpen(false)}>
          {/* Text fallback — shown on non-v2 pages (e.g. /?v=1) */}
          <span className="site-logo__text">
            <span>Mandakini</span>
            <span>Rao</span>
          </span>

          {/* Image logo — theme-aware, shown on v2 pages only via CSS */}
          <span className="site-logo__mark" data-nav-logo>
            <img
              src="/art/logo/logo-cream.png"
              className="site-logo__img site-logo__img--cream"
              alt="Mandakini Rao"
              width={150}
              height={83}
            />
            <img
              src="/art/logo/logo-cacao.png"
              className="site-logo__img site-logo__img--cacao"
              alt=""
              aria-hidden="true"
              width={150}
              height={83}
            />
          </span>
        </Link>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'menu-toggle--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div
        className={`menu-overlay canvas-texture ${menuOpen ? 'menu-overlay--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="menu-overlay__inner">
          <p>Studio Directory</p>
          <div className="menu-overlay__links">
            {menuLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
