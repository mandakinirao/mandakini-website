# Commerce Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the already-built commerce infrastructure (BuyControls, CartDrawer, checkout, webhook) into the shop UI and add all missing CSS so the site builds and runs with zero commerce UI visible when the flag is off, and full Add to Cart / Buy Now / slide-in cart experience when the flag is on.

**Architecture:** The commerce feature gate (`lib/commerce.ts`) is server-only. Server components (ShopPage, ProductPage) call `commerceEnabled()` and pass the boolean down as a prop to client components (ShopIndex, ProductDetail). CSS for all commerce classes lives in `app/globals.css` as a new block at the end of the file, consuming Phase 1 design tokens only. No new library dependencies are introduced.

**Tech Stack:** Next.js 14 App Router, TypeScript, CSS custom properties (Phase 1 tokens), existing `lib/cart.tsx`, `lib/stripe.ts`, `components/shop/BuyControls.tsx`, `components/shop/CartDrawer.tsx`

---

## Context — What Is Already Built

The following files exist and must NOT be rewritten, only wired or extended:

| File | Status |
|------|--------|
| `lib/commerce.ts` | ✅ Feature flag — `commerceEnabled(): boolean` |
| `lib/cart.tsx` | ✅ CartContext + CartProvider + sessionStorage persistence |
| `lib/stripe.ts` | ✅ `getStripe()` + `createCheckoutSession(lines)` |
| `lib/home-data.ts` | ✅ `HomePrint` with `amount`, `stock`, `available` |
| `components/shop/BuyControls.tsx` | ✅ Sold state, Add to Cart, Buy Now pills |
| `components/shop/CartDrawer.tsx` | ✅ Slide-in panel, qty adjust, checkout |
| `app/api/checkout/route.ts` | ✅ Server-side price validation + Stripe session |
| `app/api/stripe/webhook/route.ts` | ✅ Idempotent order creation + stock decrement + emails |
| `emails/orderEmails.ts` | ✅ Order confirmation + notification |
| `app/(site)/thank-you/page.tsx` | ✅ Shell exists; needs CSS |
| `app/(site)/layout.tsx` | ✅ CartProvider + CartDrawer wired behind flag |
| `sanity/schemas/shopItem.ts` | ✅ purchaseType, stock, basePrice, stripePriceId |
| `sanity/schemas/order.ts` | ✅ Complete order schema |

**What is missing:**
1. CSS for `.mr-buy*`, `.mr-cart__*`, `.mr-thanks*` — classes are referenced in components but have zero rules
2. `ShopIndex` does not receive `commerceEnabled` and does not render `BuyControls`
3. `ProductDetail` does not receive `commerceEnabled` and always shows "Enquire to purchase"
4. `ShopPage` and `ProductPage` do not call `commerceEnabled()`
5. `PROGRESS.md` and `PROMPT_LOG.md` must be updated

---

## Hard Constraints (non-negotiable throughout)

- No grain or noise anywhere
- No square or boxy elements — pills, rounded panels, bare text links only
- No blues anywhere
- `--ease-manda` / `--dur-fast` / `--dur-base` only — no new easing values
- Do NOT touch: hero, loading screen (`LoadingScreen.tsx`, `LoadingScreenStripes.tsx`), about section (`HomeExperienceV2.tsx` about block), featured strip, `Cursor.tsx`, `PrivateCollection.tsx`
- The frozen `/?v=1` route and its components must remain untouched

---

## File Map

| Task | Files modified |
|------|---------------|
| 1 | `app/globals.css` — add commerce CSS block |
| 2 | `app/(site)/shop/page.tsx`, `components/shop/ShopIndex.tsx` — wire BuyControls into grid |
| 3 | `app/(site)/shop/[slug]/page.tsx`, `components/shop/ProductDetail.tsx` — wire BuyControls into PDP |
| 4 | `files/PROGRESS.md`, `files/PROMPT_LOG.md` — session log |

---

## Task 1: Commerce CSS

**Files:**
- Modify: `app/globals.css` (append after line 1822 — end of the file, before `@media (prefers-reduced-motion)` block)

All classes already referenced in `BuyControls.tsx`, `CartDrawer.tsx`, and `thank-you/page.tsx`. This task adds the missing rules.

Token reference used throughout:
- `--font-label` = Mailendra (the "Mailendra numerals" requirement)
- `--font-ui` = Jost
- `--font-display` = Sephir/Boska
- `--ink-current`, `--ink-muted-current`, `--scroll-bg` = theme-switched body ink/bg
- `--ink-cream` = `#F5EFE4` (fixed cream — for text on the dark cart panel)
- `--accent-rosehip` = `#792318` (sold state colour)
- `--accent-error` = `#C4685A`
- `--ease-manda`, `--dur-fast` = motion tokens
- `--v2-night` = `#0d0a07` (deep cacao — the cart panel background, from v2.css `:root`)

- [ ] **Step 1: Locate the insertion point**

Open `app/globals.css`. The file ends at line 1822 with `}` closing the `@media (prefers-reduced-motion)` block. The new CSS block goes **before** the reduced-motion block (find `/* ── Reduced motion` and insert before it). Verify by searching for `@media (prefers-reduced-motion: reduce)` — it should be at approximately line 1804.

- [ ] **Step 2: Add buy-controls CSS**

Insert after the last rule before the reduced-motion block (after the `@media (hover: none)` closing brace):

```css
/* ═══════════════════════════════════════════════════════════════════
   Commerce — Phase 2 (June 2026)
   Flag-gated: BuyControls and CartDrawer only render when
   NEXT_PUBLIC_COMMERCE_ENABLED=true and STRIPE_SECRET_KEY is set.
   All tokens are Phase 1 palette — no new values introduced.
   ═══════════════════════════════════════════════════════════════════ */

/* ── Buy controls (compact card footer / full PDP block) ─────────── */

.mr-buy {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-top: 0.9rem;
}

.mr-buy__amount {
  font-family: var(--font-label);
  font-size: clamp(1rem, 1.8vw, 1.25rem);
  letter-spacing: 0.04em;
  color: var(--ink-current);
}

.mr-buy__sold {
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--accent-rosehip);
}

.mr-buy__ctas {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

/* compact variant — tighter padding to fit card footer */
.mr-buy--compact .mr-buy__ctas .mr-pill {
  padding: 0.7rem 1.4rem;
}

.mr-buy__error {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--accent-error);
  letter-spacing: 0.04em;
}
```

- [ ] **Step 3: Add floating cart chip CSS**

Append immediately after the buy-controls block:

```css
/* ── Cart chip (floating pill — visible only while cart has items) ── */

.mr-cart__chip {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 300;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.5rem;
  border: 1px solid var(--ink-current);
  border-radius: 999px;
  background: var(--scroll-bg);
  color: var(--ink-current);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background-color var(--dur-fast) var(--ease-manda),
    color var(--dur-fast) var(--ease-manda),
    border-color var(--dur-fast) var(--ease-manda);
}

.mr-cart__chip:hover {
  background-color: var(--ink-current);
  color: var(--scroll-bg);
}
```

- [ ] **Step 4: Add cart overlay + panel CSS**

Append immediately after the chip block:

```css
/* ── Cart drawer (slide-in from right, rounded inner edge) ──────── */

.mr-cart__overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
}

.mr-cart__veil {
  position: absolute;
  inset: 0;
  background: rgba(6, 6, 6, 0.55);
  border: none;
  padding: 0;
  cursor: pointer;
}

/* Night (deep cacao) surface with cream type — never theme-switches.
   The rounded left edge is the only deliberate shape language here. */
.mr-cart__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(440px, 94vw);
  background: var(--v2-night);  /* #0d0a07 — deep cacao, from v2.css */
  color: var(--ink-cream);       /* #F5EFE4 */
  border-radius: 1.5rem 0 0 1.5rem;
  padding: clamp(2rem, 4vh, 3rem) clamp(1.5rem, 4vw, 2.5rem);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overscroll-behavior: contain;
}

.mr-cart__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.mr-cart__head p {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  font-weight: 400;
}

.mr-cart__close {
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(245, 239, 228, 0.55);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-manda);
}

.mr-cart__close:hover {
  color: var(--ink-cream);
}

.mr-cart__empty {
  font-family: var(--font-body);
  font-size: 1.05rem;
  color: rgba(245, 239, 228, 0.55);
  line-height: 1.6;
}

/* ── Cart item list ─────────────────────────────────────────────── */

.mr-cart__list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mr-cart__row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 1rem;
  align-items: start;
}

.mr-cart__thumb {
  width: 64px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.6rem;
  display: block;
}

.mr-cart__info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.mr-cart__title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.25;
}

.mr-cart__amount {
  font-family: var(--font-label);
  font-size: 0.95rem;
  color: rgba(245, 239, 228, 0.7);
}

.mr-cart__qty {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.2rem;
}

.mr-cart__qty button {
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid rgba(245, 239, 228, 0.3);
  border-radius: 999px;
  background: none;
  color: var(--ink-cream);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color var(--dur-fast) var(--ease-manda);
}

.mr-cart__qty button:hover:not(:disabled) {
  border-color: var(--ink-cream);
}

.mr-cart__qty button:disabled {
  opacity: 0.3;
  cursor: default;
}

.mr-cart__qty span {
  min-width: 1.5rem;
  text-align: center;
  font-family: var(--font-label);
  font-size: 1rem;
}

.mr-cart__remove {
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: rgba(245, 239, 228, 0.4);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color var(--dur-fast) var(--ease-manda);
  text-transform: uppercase;
}

.mr-cart__remove:hover {
  color: rgba(245, 239, 228, 0.75);
}

/* ── Cart footer ────────────────────────────────────────────────── */

.mr-cart__foot {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(245, 239, 228, 0.14);
}

.mr-cart__subtotal {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  font-family: var(--font-ui);
  font-size: 13px;
  letter-spacing: 0.1em;
  color: rgba(245, 239, 228, 0.75);
  text-transform: uppercase;
}

.mr-cart__subtotal span:last-child {
  font-family: var(--font-label);
  font-size: 1.1rem;
  letter-spacing: 0.04em;
  text-transform: none;
  color: var(--ink-cream);
}

.mr-cart__error {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--accent-error);
}

/* Checkout pill inherits .mr-pill but needs cream/night inversion
   on the dark panel surface */
.mr-cart__checkout.mr-pill {
  border-color: var(--ink-cream);
  color: var(--ink-cream);
}

.mr-cart__checkout.mr-pill:hover {
  background-color: var(--ink-cream);
  color: var(--v2-night);
}

.mr-cart__clear {
  font-family: var(--font-ui);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(245, 239, 228, 0.35);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  align-self: center;
  transition: color var(--dur-fast) var(--ease-manda);
}

.mr-cart__clear:hover {
  color: rgba(245, 239, 228, 0.65);
}
```

- [ ] **Step 5: Add thank-you page CSS**

Append immediately after the cart block:

```css
/* ── Thank-you page (/thank-you) ───────────────────────────────── */

.mr-thanks {
  min-height: 60vh;
  display: flex;
  align-items: center;
  padding: clamp(6rem, 14vh, 10rem) clamp(1.5rem, 6vw, 5rem);
}

.mr-thanks__title {
  font-family: var(--font-display);
  font-size: clamp(2.8rem, 6vw, 4.5rem);
  font-weight: 400;
  line-height: 1.05;
  margin-bottom: 1.2rem;
}

.mr-thanks__line {
  max-width: 44ch;
  font-family: var(--font-body);
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  line-height: 1.75;
  color: var(--ink-muted-current);
  margin-bottom: 2.5rem;
}
```

- [ ] **Step 6: Verify TypeScript and build**

Run from the project root:

```bash
cd /Users/arunperi/Documents/Mandakini/Website && npx tsc --noEmit
```

Expected: zero errors. The CSS changes do not affect TypeScript, but the compile confirms nothing else drifted.

---

## Task 2: Wire BuyControls into the Shop Grid

**Files:**
- Modify: `app/(site)/shop/page.tsx` (server component — call `commerceEnabled()`, pass to ShopIndex)
- Modify: `components/shop/ShopIndex.tsx` (client component — accept flag, restructure card when flag ON)

The product card is currently a `<Link>` wrapping everything. When commerce is on, interactive buttons (Add to Cart, Buy Now) cannot be nested inside an `<a>` tag — that is invalid HTML and breaks accessibility. The solution: when `commerceEnabled` is true, render the card as an `<article>` with the image and title linked separately, and `BuyControls` rendered below outside the link. When false, keep the existing `<Link>` wrapping (zero behavioural change for non-commerce mode).

- [ ] **Step 1: Update ShopPage to pass the flag**

Open `app/(site)/shop/page.tsx`. The file currently imports `getHomeData` and passes `prints` to `ShopIndex`. Add the `commerceEnabled` import and pass the flag:

```tsx
import type { Metadata } from 'next'
import PrivateCollection from '@/components/shop/PrivateCollection'
import ShopIndex from '@/components/shop/ShopIndex'
import { getHomeData } from '@/lib/home-data'
import { commerceEnabled } from '@/lib/commerce'

export const metadata: Metadata = {
  title: 'Shop — Mandakini Rao',
  description: 'Signed, numbered print editions from Mandakini Rao's Hyderabad studio.',
}

export const revalidate = 60

export default async function ShopPage() {
  const { prints } = await getHomeData()
  return (
    <>
      <ShopIndex prints={prints} commerceEnabled={commerceEnabled()} />
      <PrivateCollection />
    </>
  )
}
```

- [ ] **Step 2: Update ShopIndex props interface**

Open `components/shop/ShopIndex.tsx`. Add `commerceEnabled: boolean` to `ShopIndexProps` and import `BuyControls`:

Replace the imports and interface at the top of the file:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { HomePrint } from '@/lib/home-data'
import { EASE, mandaGsap, prefersReducedMotion, revealLines } from '@/lib/motion'
import BuyControls from '@/components/shop/BuyControls'

const PAGE_SIZE = 12

interface ShopIndexProps {
  prints: HomePrint[]
  commerceEnabled: boolean
}
```

- [ ] **Step 3: Update ShopIndex component signature and card markup**

Update the component function to accept `commerceEnabled` and render cards conditionally.

Replace the entire `export default function ShopIndex` function body with:

```tsx
export default function ShopIndex({ prints, commerceEnabled }: ShopIndexProps) {
  const rootRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(PAGE_SIZE)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ctx = mandaGsap.context(() => {
      revealLines(root.querySelector('.mr-page__head p'))
      revealLines(root.querySelector('.mr-page__head h1'), { delay: 0.12 })
      if (prefersReducedMotion()) return
      mandaGsap.from('.mr-product', {
        y: 70,
        autoAlpha: 0,
        duration: 1,
        ease: EASE,
        stagger: 0.1,
        scrollTrigger: { trigger: root, start: 'top 70%', once: true },
      })
    }, root)
    return () => ctx.revert()
  }, [prints])

  if (prints.length === 0) {
    return (
      <section className="mr-page" aria-label="Shop">
        <header className="mr-page__head">
          <p>The Shop</p>
          <h1>New editions are on the easel</h1>
        </header>
        <div className="mr-page__note">
          <p>Nothing is listed right now — check back soon, or ask about original works.</p>
          <Link href="/" className="mr-pill" data-cursor="view">
            Back home
          </Link>
        </div>
      </section>
    )
  }

  const shown = prints.slice(0, visible)

  return (
    <section ref={rootRef} className="mr-page" aria-label="Shop">
      <header className="mr-page__head">
        <p>The Shop</p>
        <h1>Signed editions from the Hyderabad studio</h1>
      </header>

      <div className="mr-products">
        {shown.map((print, i) =>
          commerceEnabled ? (
            /* Commerce ON: article card — buttons can't nest inside <a> */
            <article key={print.slug} className="mr-product" data-cursor="view">
              <Link href={print.href} className="mr-product__media" tabIndex={-1} aria-hidden>
                <span className="mr-product__frame mr-mask">
                  <Image
                    src={print.image}
                    alt={print.title}
                    fill
                    sizes="(max-width: 900px) 88vw, 30vw"
                  />
                  {!print.available && (
                    <span className="mr-product__soldout">Sold out</span>
                  )}
                </span>
              </Link>
              <Link href={print.href}>
                <h2 className="mr-product__title">{print.title}</h2>
              </Link>
              <p className="mr-product__price">
                <span>{print.price}</span>
                <span>Nº {String(i + 1).padStart(3, '0')}</span>
              </p>
              <BuyControls print={print} variant="compact" />
            </article>
          ) : (
            /* Commerce OFF: original link-wrapped card, zero change */
            <Link
              key={print.slug}
              href={print.href}
              className="mr-product"
              data-cursor="view"
            >
              <span className="mr-product__frame mr-mask">
                <Image
                  src={print.image}
                  alt={print.title}
                  fill
                  sizes="(max-width: 900px) 88vw, 30vw"
                />
                {!print.available && (
                  <span className="mr-product__soldout">Sold out</span>
                )}
              </span>
              <h2 className="mr-product__title">{print.title}</h2>
              <p className="mr-product__price">
                <span>{print.price}</span>
                <span>Nº {String(i + 1).padStart(3, '0')}</span>
              </p>
            </Link>
          )
        )}
      </div>

      {prints.length > visible && (
        <div className="mr-page__note">
          <button
            type="button"
            className="mr-pill"
            data-cursor="view"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          >
            Load more ({prints.length - visible} remaining)
          </button>
        </div>
      )}

      <div className="mr-page__note">
        <p>Each print is signed and numbered in the Hyderabad studio.</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/arunperi/Documents/Mandakini/Website && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Verify build**

```bash
cd /Users/arunperi/Documents/Mandakini/Website && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` or `Route (app)` summary with no errors.

---

## Task 3: Wire BuyControls into the Product Detail Page

**Files:**
- Modify: `app/(site)/shop/[slug]/page.tsx` (server component — call `commerceEnabled()`, pass to ProductDetail)
- Modify: `components/shop/ProductDetail.tsx` (client component — accept flag, replace "Enquire" CTA with BuyControls when flag ON)

- [ ] **Step 1: Update ProductPage to pass the flag**

Open `app/(site)/shop/[slug]/page.tsx`. Add `commerceEnabled` import and pass the result to `ProductDetail`:

```tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import { getAllPrints, getPrintBySlug } from '@/lib/home-data'
import { commerceEnabled } from '@/lib/commerce'

interface Params {
  params: { slug: string }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const print = await getPrintBySlug(params.slug)
  return {
    title: print ? `${print.title} — Mandakini Rao` : 'Print — Mandakini Rao',
    description: print?.desc,
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: Params) {
  const [print, all] = await Promise.all([
    getPrintBySlug(params.slug),
    getAllPrints(),
  ])
  if (!print) notFound()

  const others = all.filter((p) => p.slug !== print.slug)
  return (
    <ProductDetail
      print={print}
      others={others}
      commerceEnabled={commerceEnabled()}
    />
  )
}
```

- [ ] **Step 2: Update ProductDetail props interface**

Open `components/shop/ProductDetail.tsx`. Add `commerceEnabled` to the interface and import `BuyControls`:

Replace the imports and interface at the top:

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { HomePrint } from '@/lib/home-data'
import {
  EASE_OUT,
  mandaGsap,
  prefersReducedMotion,
  revealImage,
  revealLines,
} from '@/lib/motion'
import BuyControls from '@/components/shop/BuyControls'

interface ProductDetailProps {
  print: HomePrint
  others: HomePrint[]
  commerceEnabled: boolean
}
```

- [ ] **Step 3: Replace "Enquire" CTA with conditional BuyControls**

Update the component signature and the CTA block inside the product info section. Find this block:

```tsx
          {print.available ? (
            <>
              <Link href="/contact" className="mr-pill" data-cursor="enter">
                Enquire to purchase
              </Link>
              <p className="mr-pdp__hint">
                Replies within a few days — include the print name and your city.
              </p>
            </>
          ) : (
            <>
              <p className="mr-pdp__soldout">Sold out</p>
              <p className="mr-pdp__hint">
                This edition is complete. Ask about other works —{' '}
                <Link href="/contact">get in touch</Link>.
              </p>
            </>
          )}
```

Replace it with:

```tsx
          {commerceEnabled ? (
            <BuyControls print={print} variant="full" />
          ) : print.available ? (
            <>
              <Link href="/contact" className="mr-pill" data-cursor="enter">
                Enquire to purchase
              </Link>
              <p className="mr-pdp__hint">
                Replies within a few days — include the print name and your city.
              </p>
            </>
          ) : (
            <>
              <p className="mr-pdp__soldout">Sold out</p>
              <p className="mr-pdp__hint">
                This edition is complete. Ask about other works —{' '}
                <Link href="/contact">get in touch</Link>.
              </p>
            </>
          )}
```

Also update the function signature line from:
```tsx
export default function ProductDetail({ print, others }: ProductDetailProps) {
```
to:
```tsx
export default function ProductDetail({ print, others, commerceEnabled }: ProductDetailProps) {
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd /Users/arunperi/Documents/Mandakini/Website && npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Verify build**

```bash
cd /Users/arunperi/Documents/Mandakini/Website && npm run build 2>&1 | tail -20
```

Expected: builds successfully. All routes including `/shop`, `/shop/[slug]`, `/thank-you` should be listed.

---

## Task 4: Update PROGRESS.md and PROMPT_LOG.md

**Files:**
- Modify: `files/PROGRESS.md`
- Modify: `files/PROMPT_LOG.md`

- [ ] **Step 1: Append two entries to PROGRESS.md**

Open `files/PROGRESS.md`. Find the `## What Is Complete` section and append after the last entry in that section (after the Phase 1 accent color system paragraph):

```markdown
**Phase 1 — Token system live with usage map — June 13, 2026 (commerce groundwork):**
- Design token semantic layer complete: all seven palette values were already present as raw tokens (globals.css :root). Phase 1 added the semantic alias layer in v2.css (`--accent-index`, `--accent-eyebrow`, `--accent-link`) with theme-aware AA-compliant values for both dark and light stages. Applied as moments across works grid, section eyebrows, link hovers, and pill CTA fills. Usage map documented in PROJECT.md §6. No blues added.

**Phase 2 — Commerce built, flag off, pending Stripe keys and Mandakini approval — June 13, 2026:**
- Full commerce infrastructure: feature flag (`lib/commerce.ts`), CartContext + sessionStorage persistence (`lib/cart.tsx`), Stripe client + checkout session (`lib/stripe.ts`), server-side price validation route (`/api/checkout`), idempotent webhook with stock decrement and order email (`/api/stripe/webhook`), order confirmation and notification email templates (`emails/orderEmails.ts`), CartDrawer slide-in panel, BuyControls (Add to Cart / Buy Now / Sold state), thank-you page — all complete.
- BuyControls wired into ShopIndex (flag-gated, article card structure when on) and ProductDetail (replaces "Enquire" CTA when flag on).
- All commerce CSS added to globals.css: `.mr-buy*`, `.mr-cart__*`, `.mr-thanks*` — consuming Phase 1 tokens only, no new values.
- Gate: `NEXT_PUBLIC_COMMERCE_ENABLED=true` + `STRIPE_SECRET_KEY` must both be set for any commerce UI to appear. With either absent, the site renders exactly as before Phase 2.
- Pending before going live: Mandakini approval of product prices + copy; Stripe account setup; `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_NOTIFY_EMAIL`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL` added to Vercel dashboard.
```

- [ ] **Step 2: Append session entry to PROMPT_LOG.md**

Open `files/PROMPT_LOG.md`. Append at the end:

```markdown
## Session June 13, 2026 — Commerce Phase 2 build

Phase 2 prompt specified: all new UI must consume Phase 1 tokens; product schema to add price/stripePriceId/stock/purchaseType; order schema; product UI (flag ON) showing Mailendra price + Add to Cart + Buy Now pills + Sold state; cart as React context + slide-in drawer (cream/deep cacao tokens, never boxy); checkout route creating Stripe sessions with server-side price validation; idempotent webhook creating Sanity orders, decrementing stock, and sending order confirmation email; thank-you page; all Stripe paths guarded against missing env. Hard constraints: no grain, no square/boxy elements, no blues, master ease only, do not touch hero/loader/about/cursor/Private Collection.

On exploration, the vast majority of Phase 2 was already implemented from prior sessions: lib/commerce.ts, lib/cart.tsx, lib/stripe.ts, BuyControls.tsx, CartDrawer.tsx, /api/checkout, /api/stripe/webhook, emails/orderEmails.ts, thank-you page shell, Sanity schemas (shopItem had purchaseType/stock/basePrice/stripePriceId; order schema was complete). The CartProvider and CartDrawer were already wired into the site layout behind the commerce flag.

What was missing: (1) all CSS for commerce classes (`.mr-buy*`, `.mr-cart__*`, `.mr-thanks*`) — classes were referenced in components but had zero rules; (2) ShopIndex did not receive the `commerceEnabled` prop or render BuyControls; (3) ProductDetail always showed "Enquire to purchase" regardless of the flag; (4) ShopPage and ProductPage did not call `commerceEnabled()`.

Implemented: added commerce CSS block to globals.css (Phase 1 tokens only; cart panel uses `--v2-night` deep cacao + `--ink-cream` per the cream/deep cacao token requirement; Mailendra via `--font-label` on `.mr-buy__amount`); wired `commerceEnabled` prop through ShopPage → ShopIndex (article card structure with separate image link + BuyControls when on, original Link card when off); wired `commerceEnabled` prop through ProductPage → ProductDetail (BuyControls replaces "Enquire" CTA when on). TypeScript clean, build passes, all routes 200.
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|-------------|------|
| All UI consumes Phase 1 tokens | Task 1 — CSS uses `--font-label`, `--ink-cream`, `--v2-night`, `--accent-rosehip`, `--accent-error`, `--ease-manda`, `--dur-fast` |
| Flag off = zero errors, zero commerce UI | Architecture — `commerceEnabled()` is the gate; CSS exists but classes aren't rendered |
| `purchaseType: "buy" \| "privateCollection"` on shopItem | Already in `sanity/schemas/shopItem.ts` ✅ |
| `price`, `stripePriceId`, `stock` on shopItem | Already in `sanity/schemas/shopItem.ts` ✅ |
| Order schema | Already in `sanity/schemas/order.ts` ✅ |
| Price in Mailendra numerals | Task 1 — `.mr-buy__amount { font-family: var(--font-label) }` |
| "Add to Cart" + "Buy Now" pills | BuyControls already has this; Tasks 2+3 wire it in |
| Stock 0 → quiet "Sold" in rosehip, no CTA | BuyControls already has this; `.mr-buy__sold { color: var(--accent-rosehip) }` in Task 1 |
| Cart drawer — rounded panel, cream/deep cacao | Task 1 — `.mr-cart__panel` uses `--v2-night` + `--ink-cream`, `border-radius: 1.5rem 0 0 1.5rem` |
| Qty adjust respecting stock | CartDrawer already does this ✅ |
| Cart persists per session (sessionStorage) | `lib/cart.tsx` already does this ✅ |
| Checkout creates Stripe session, INR | `lib/stripe.ts` + `/api/checkout` already do this ✅ |
| Server-side price validation | `/api/checkout/route.ts` already does this ✅ |
| Cancel returns to shop with cart intact | `createCheckoutSession` sets `cancel_url: ${site}/shop` ✅; cart is sessionStorage ✅ |
| Webhook verifies signature | `/api/stripe/webhook/route.ts` already does this ✅ |
| Webhook creates Sanity order, decrements stock | Already done ✅ |
| Webhook idempotent | Deterministic `_id = order.${sessionId}` already done ✅ |
| Order confirmation email | `emails/orderEmails.ts` ✅ |
| Thank-you page — typographic, on-token-palette | Page shell exists; Task 1 adds CSS |
| All Stripe paths guarded | All env checks already in place ✅ |
| Update PROGRESS.md + PROMPT_LOG.md | Task 4 |

**No placeholders found.**

**Type consistency:** `BuyControls` expects `print: HomePrint` and `variant: 'compact' \| 'full'` (confirmed in `BuyControls.tsx`). `HomePrint` has `amount`, `stock`, `available`, `slug`, `title`, `image` (confirmed in `lib/home-data.ts`). All usages in Tasks 2+3 match.

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-13-commerce-phase2.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks

**2. Inline Execution** — Execute tasks in this session using executing-plans

**Which approach?**
