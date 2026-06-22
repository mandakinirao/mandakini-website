'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ScrollTrigger, menuLock, menuUnlock } from '@/lib/motion'

const menuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Works / Projects', href: '/works' },
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

const THEME_KEY = 'mr2-theme'

export default function Navigation() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [light, setLight] = useState(false)

  useEffect(() => {
    setLight(localStorage.getItem(THEME_KEY) === 'light')
  }, [])

  const toggleTheme = () => {
    const next = !light
    setLight(next)
    document.body.classList.toggle('mr2-light', next)
    localStorage.setItem(THEME_KEY, next ? 'light' : 'dark')
  }

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

  // Use menuLock (body overflow, not html) so the fixed overlay can scroll internally.
  useEffect(() => {
    if (!menuOpen) return
    menuLock()
    return () => menuUnlock()
  }, [menuOpen])

  return (
    <>
      <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`} aria-label="Primary navigation">
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
          <button
            type="button"
            className="menu-overlay__theme"
            onClick={toggleTheme}
            aria-pressed={light}
          >
            <span className="menu-overlay__theme-dot" aria-hidden="true" />
            {light ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </div>
    </>
  )
}
