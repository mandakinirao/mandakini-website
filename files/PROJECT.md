# PROJECT.md — Mandakini Rao Artist Website
> This is the master reference document for this project.
> Every coding agent MUST read this file before starting any work.
> Do not modify this file unless a major architectural decision changes.
> After reading this file, also read PROGRESS.md to know the current state.

---

## 1. Project Overview

**Client:** Mandakini Rao — visual artist based in Hyderabad, India
**Primary domain:** mandakinirao.com
**Secondary domain (Phase 2 only):** mandakiniartstudio.com

**What this site is:**
A premium artist website that feels like a world you enter, not a portfolio you browse. It is editorial, warm, nostalgic, vintage, and deeply personal. It reflects the atmosphere of her Hyderabad studio. The site includes a content-driven Works section, a transactional Shop, a Press page, an About page, a Contact page, and a cinematic loading animation. Phase 2 adds Classes, Member Login, and a gated content system.

**Who manages the site post-handoff:**
Mandakini Rao manages all content herself via Sanity Studio. She is not technical. The CMS must be simple, clear, and require zero developer involvement for routine content updates.

**Phase 1 pages (this build):**
- Home
- Works (index + individual project pages)
- Shop (index + individual product pages)
- About
- Press & Features
- Contact
- Admin (order management — internal only, not public-facing)

**Phase 2 pages (future build, schema defined now):**
- Learn / Classes
- Member Login & Dashboard
- Protected video content
- Downloadable bundles

---

## 2. Tech Stack

| Layer | Tool | Version | Reason |
|---|---|---|---|
| Frontend | Next.js | 14 (App Router) | Full design control, custom animations, SSG/SSR |
| CMS | Sanity.io | v3 | Simplest non-technical editing UI, portable content |
| Hosting | Vercel | Latest | Native Next.js support, zero config deploys |
| Payments | Stripe | Latest | Handles checkout, webhooks, payouts |
| Email | Resend | Latest | Transactional emails, clean API |
| Animation | GSAP | 3.x | Loading animation, scroll-driven reveals |
| Styling | Tailwind CSS | 3.x | Utility classes, pairs with CSS variables |
| Phase 2 Auth | Supabase | Latest | Member login, gated content (do not build in Phase 1) |

**Do not introduce any package not listed here without updating this document.**

---

## 3. Sanity Project Details

- **Project ID:** i4t9kzxg
- **Dataset:** production
- **Studio route:** /studio (embedded in Next.js app)
- **Organisation ID:** oCCddU4CJ

---

## 4. Environment Variables

The following environment variables are required. Never hardcode values. Always use process.env.

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=i4t9kzxg
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
SANITY_API_TOKEN=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Resend
RESEND_API_KEY=

# App
NEXT_PUBLIC_SITE_URL=https://mandakinirao.com
ADMIN_EMAIL=  # Mandakini's email — receives order notifications

# Phase 2 only — do not configure in Phase 1
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## 5. Folder Structure

```
mandakinirao/
├── app/                          # Next.js App Router
│   ├── (site)/                   # Public-facing site layout group
│   │   ├── layout.tsx            # Main site layout with nav and footer
│   │   ├── page.tsx              # Home page
│   │   ├── works/
│   │   │   ├── page.tsx          # Works index
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Individual project page
│   │   ├── shop/
│   │   │   ├── page.tsx          # Shop index
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Individual product page
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── press/
│   │   │   └── page.tsx
│   │   └── contact/
│   │       └── page.tsx
│   ├── admin/                    # Internal order management — not public nav
│   │   ├── layout.tsx            # Admin layout
│   │   └── page.tsx              # Orders dashboard
│   ├── api/                      # API routes
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   │       └── route.ts      # Stripe webhook handler
│   │   ├── orders/
│   │   │   └── [id]/
│   │   │       └── ship/
│   │   │           └── route.ts  # Mark order as shipped, trigger email
│   │   ├── contact/
│   │   │   └── route.ts          # Contact form submission
│   │   └── enquiry/
│   │       └── route.ts          # Artwork enquiry form submission
│   └── studio/
│       └── [[...tool]]/
│           └── page.tsx          # Embedded Sanity Studio
├── components/
│   ├── layout/
│   │   ├── Navigation.tsx
│   │   └── Footer.tsx
│   ├── intro/
│   │   └── IntroAnimation.tsx    # Loading animation (Subbulakshmi/Ravana concept)
│   ├── works/
│   │   ├── WorksGrid.tsx
│   │   ├── ProjectCard.tsx
│   │   └── ArtworkReveal.tsx
│   ├── shop/
│   │   ├── ShopGrid.tsx
│   │   ├── ProductCard.tsx
│   │   ├── CartDrawer.tsx
│   │   └── CheckoutButton.tsx
│   ├── ui/
│   │   ├── SanityImage.tsx       # Wrapper for Sanity image with next/image
│   │   ├── EnquiryForm.tsx
│   │   ├── ContactForm.tsx
│   │   └── NewsletterSignup.tsx
│   └── admin/
│       ├── OrderList.tsx
│       └── OrderCard.tsx
├── sanity/
│   ├── lib/
│   │   ├── client.ts             # Sanity client config
│   │   ├── queries.ts            # All GROQ queries
│   │   └── image.ts              # Image URL builder
│   └── schemas/
│       ├── index.ts              # Schema registry
│       ├── project.ts
│       ├── artwork.ts
│       ├── shopItem.ts
│       ├── order.ts
│       ├── pressItem.ts
│       ├── about.ts
│       ├── siteSettings.ts
│       ├── navigation.ts
│       ├── class.ts              # Phase 2 — define schema now, do not build UI
│       └── member.ts             # Phase 2 — define schema now, do not build UI
├── lib/
│   ├── stripe.ts                 # Stripe client and helpers
│   ├── resend.ts                 # Resend client and email send helpers
│   └── cart.ts                   # Cart state and logic
├── styles/
│   └── globals.css               # CSS variables, base styles, Tailwind directives
├── public/
│   └── placeholders/             # Placeholder images during development
├── emails/                       # Resend email templates (React Email)
│   ├── OrderConfirmation.tsx
│   ├── OrderNotification.tsx
│   ├── ShippingConfirmation.tsx
│   └── EnquiryAcknowledgement.tsx
├── PROJECT.md                    # This file
├── PROGRESS.md                   # Current build state — read before every session
├── PROMPT_LOG.md                 # Agent decision log — append after every session
├── sanity.config.ts
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## 6. Design Tokens

**Status: CONFIRMED — Updated June 2026 after client moodboard review.**
Palette synthesised from three client-provided moodboards cross-referenced against studio photographs.
Dropped: all blues (Ocean, Skyline, Lagoon) — not present in studio environment.
Typography confirmed after reviewing Jardin shop and ChungiYoo illustrations references.

```css
:root {
  /* ── Core palette ── */
  --color-cream: #F5EDD8;            /* Primary background — warm linen */
  --color-parchment: #EDE0C4;        /* Section warm — aged parchment */
  --color-toffee: #DA682F;           /* Primary terracotta accent — Toffee */
  --color-salsa: #DB3100;            /* Deep terracotta — Salsa */
  --color-amber: #C89839;            /* Warm gold — Amber */
  --color-cacao: #7B533B;            /* Body text brown — Cacao */
  --color-deep-cacao: #3D1F0D;       /* Dark text — Deep Cacao */
  --color-moss: #5B643E;             /* Green accent — Moss */
  --color-pumpkin: #AB5E16;          /* Earthy orange — Pumpkin */
  --color-rosehip: #792318;          /* Deep red — Rosehip */
  --color-near-black: #1E0A08;       /* Intro screen background — Deep warm black */

  /* ── Semantic tokens ── */
  --bg-primary: var(--color-cream);
  --bg-section-warm: var(--color-parchment);
  --bg-section-dark: var(--color-rosehip);
  --bg-intro: var(--color-near-black);
  --text-primary: var(--color-deep-cacao);
  --text-secondary: var(--color-cacao);
  --text-on-dark: var(--color-cream);
  --accent-primary: var(--color-toffee);
  --accent-secondary: var(--color-amber);
  --accent-deep: var(--color-salsa);
  --accent-green: var(--color-moss);
  --border-color: rgba(61, 31, 13, 0.12);
  --border-color-strong: rgba(61, 31, 13, 0.25);

  /* ── Typography ── */
  /* All four are Google Fonts — free, no licensing needed */
  --font-display: 'Cormorant Garamond', serif;
  /* Use for: hero headlines, large editorial moments, project titles */
  /* Weights to use: 300 (Light), 400 (Regular), 600 (SemiBold) */

  --font-display-sc: 'Cormorant SC', serif;
  /* Use for: small caps section labels, numbered project markers */

  --font-body: 'EB Garamond', serif;
  /* Use for: running body copy, About text, project descriptions */
  /* Weight: 400 Regular only */

  --font-ui: 'Jost', sans-serif;
  /* Use for: navigation labels, buttons, captions, form fields */
  /* Weights: 300 (Light), 400 (Regular) */

  /* ── Spacing ── */
  --section-padding-lg: 7rem;
  --section-padding-md: 4rem;
  --section-padding-sm: 2.5rem;
  --container-max: 1320px;
  --container-narrow: 860px;
}
```

### Google Fonts Import String
Add this to the top of globals.css:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400;1,600&family=Cormorant+SC:wght@400;600&family=EB+Garamond:ital,wght@0,400;1,400&family=Jost:wght@300;400&display=swap');
```

### Color usage (accent system — June 2026, Phase 1)

Accents are moments, not floods. Large surfaces stay the stage colors
(near-black dark stage / cream light stage; the Private Collection room is
fixed deep cacao `#2C1A0E`). Each accent has exactly one job:

| Accent | Token | Where it appears |
|---|---|---|
| Amber `#C89839` | `--accent-index` | Numbered indexes in the works grid and series headers. Deepens to `#8A6312` on the cream stage (raw amber reads 2.2:1 there — fails AA). |
| Moss `#5B643E` | `--accent-eyebrow` | Section eyebrow labels. Lifts to `#9DAA7E` on the dark stage for AA (raw moss reads 3.1:1 there). |
| Rosehip `#792318` | `--accent-link`, `--accent-rosehip` | Link hover states, focus rings, pill CTA hover fills (cream text on rosehip: 8.9:1). Lifts to `#C4685A` on the dark stage. |
| Toffee `#DA682F` | `--accent-toffee` | Inline accent marks (`.mr-accent`). |
| Terracotta `#B8572A` | `--accent-terracotta` | The Private Collection / enquiry CTA fill (fixed room, never theme-switched). |
| Cream `#F5EFE4` | `--ink-cream` / `--v2-cream` | Fixed cream: type on night surfaces, hero card stock, loader field. |
| Deep cacao `#2C1A0E` | `--ink-night` | The Private Collection room surface; dark text on fixed-cream surfaces. |

Rules: every color comes from a token — zero hardcoded hex in components.
No blues are ever added (the existing `--v2-indigo` hero card stock comes
from the client-approved Subbulakshmi duotones and predates this rule; it
appears nowhere else). All text/background pairings are WCAG AA-verified;
the lifted dark-stage variants above exist solely to keep AA on the
near-black stage.

---

## 7. Sanity Schema Reference

### 7.1 project
Represents a collection/series of artwork. The primary content type.

| Field | Type | Notes |
|---|---|---|
| title | string | Required |
| slug | slug | Auto-generated from title |
| year | number | |
| seriesName | string | |
| status | string | 'published' or 'draft' |
| coverImage | image | Main thumbnail |
| artworkImages | array of image | Multiple images in the collection |
| medium | string | |
| dimensions | string | |
| projectNote | text | Short description, not long |
| projectType | string | 'projectOnly' or 'projectWithShop' |
| relatedProjects | array of reference | References to other project documents |
| displayOrder | number | Controls order on Works page |

### 7.2 artwork
Individual artwork within a project.

| Field | Type | Notes |
|---|---|---|
| title | string | |
| slug | slug | |
| project | reference | Parent project |
| images | array of image | |
| medium | string | |
| dimensions | string | |
| year | number | |
| availabilityStatus | string | 'available', 'sold', 'enquiryOnly' |
| isSold | boolean | Sold works remain visible |
| printsAvailable | boolean | |
| originalAvailable | boolean | |

### 7.3 shopItem
A purchasable listing.

| Field | Type | Notes |
|---|---|---|
| title | string | |
| slug | slug | |
| artwork | reference | Links to artwork document |
| itemType | string | 'print', 'original', 'limitedEdition', 'commission' |
| basePrice | number | In INR |
| sizes | array | Each: { label, price } |
| frameOptions | string | 'framed', 'unframed', 'both' |
| editionNumber | number | |
| editionSize | number | e.g. 50 |
| certificateIncluded | boolean | |
| availabilityStatus | string | 'available', 'soldOut', 'limited' |
| images | array of image | |
| shippingInfo | text | |
| stripeProductId | string | Set after Stripe product is created |

### 7.4 order
Created automatically by Stripe webhook. Never created manually.

| Field | Type | Notes |
|---|---|---|
| orderId | string | Stripe payment intent ID |
| customerName | string | |
| customerEmail | string | |
| customerPhone | string | |
| shippingAddress | object | { line1, line2, city, state, pincode, country } |
| items | array | [{ shopItemRef, sizeSelected, frameOption, quantity, price }] |
| totalAmount | number | |
| paymentStatus | string | 'paid', 'pending', 'refunded' |
| fulfillmentStatus | string | 'new', 'processing', 'shipped', 'delivered' |
| waybillNumber | string | Entered by Mandakini when shipping |
| courierProvider | string | Entered by Mandakini when shipping |
| orderDate | datetime | |
| shippedDate | datetime | Set when fulfillmentStatus changes to 'shipped' |

### 7.5 pressItem

| Field | Type | Notes |
|---|---|---|
| type | string | 'testimonial', 'newspaper', 'podcast', 'interview', 'feature' |
| title | string | |
| source | string | Publication or person name |
| date | date | |
| excerpt | text | Pull quote or summary |
| externalLink | url | |
| logo | image | Publication logo |
| featured | boolean | Show in homepage preview |
| displayOrder | number | |

### 7.6 about
Single document. Only one instance should exist.

| Field | Type | Notes |
|---|---|---|
| bio | blockContent | Rich text |
| artistStatement | blockContent | Rich text |
| profilePhotos | array of image | |
| studioPhotos | array of image | |
| cv | blockContent | Rich text |
| exhibitionHistory | array | [{ year, exhibitionName, venue, location }] |

### 7.7 siteSettings
Single document. Global settings.

| Field | Type | Notes |
|---|---|---|
| homepageHeadline | string | |
| homepageSubtext | string | |
| featuredProjects | array of reference | Which projects show on homepage |
| featuredShopItems | array of reference | Which items show on homepage |
| signupCtaText | string | |
| socialLinks | object | { instagram, youtube, facebook } |
| contactEmail | string | |
| seoTitle | string | |
| seoDescription | string | |

### 7.8 navigation
Single document.

| Field | Type | Notes |
|---|---|---|
| mainNavItems | array | [{ label, href, order }] |
| footerLinks | array | [{ label, href }] |

### 7.9 class (Phase 2 — schema only, no UI)

| Field | Type | Notes |
|---|---|---|
| title | string | |
| slug | slug | |
| description | blockContent | |
| coverImage | image | |
| classType | string | 'video', 'downloadable', 'both' |
| price | number | |
| status | string | 'published', 'draft', 'comingSoon' |

### 7.10 member (Phase 2 — schema only, no UI)

| Field | Type | Notes |
|---|---|---|
| name | string | |
| email | string | |
| enrolledClasses | array of reference | |
| accountStatus | string | 'active', 'suspended' |

---

## 8. Order and Email Flow

**The complete purchase to delivery sequence:**

1. Customer selects item, size, frame option on site
2. Customer clicks Buy — Stripe Checkout session is created
3. Customer completes payment on Stripe
4. Stripe fires webhook to `/api/stripe/webhook`
5. Webhook handler:
   - Verifies Stripe signature
   - Creates Order document in Sanity with fulfillmentStatus = 'new'
   - Triggers OrderConfirmation email to customer via Resend
   - Triggers OrderNotification email to Mandakini via Resend
6. Mandakini receives email notification on her phone/laptop
7. Mandakini logs into /admin
8. She sees the order in the New Orders list
9. She enters waybillNumber and courierProvider in the order form
10. She clicks "Mark as Shipped"
11. POST request fires to `/api/orders/[id]/ship`
12. Handler updates Sanity order: fulfillmentStatus = 'shipped', shippedDate = now
13. Handler triggers ShippingConfirmation email to customer via Resend
14. Order moves from New to Shipped in the admin view

**For original artwork enquiries:**
- Customer fills enquiry form
- POST to `/api/enquiry`
- EnquiryAcknowledgement email fires to customer
- Notification email fires to Mandakini
- Mandakini responds directly via email
- No payment flow involved at this stage

---

## 9. Email Templates (via Resend + React Email)

### OrderConfirmation.tsx — to customer
- Subject: Your order is confirmed — Mandakini Rao
- Contains: order ID, item name, size, frame option, shipping address, estimated dispatch

### OrderNotification.tsx — to Mandakini
- Subject: New order received
- Contains: customer name, item ordered, size, frame, full shipping address, order ID

### ShippingConfirmation.tsx — to customer
- Subject: Your order is on its way
- Contains: item name, waybill number, courier provider, dispatch date

### EnquiryAcknowledgement.tsx — to customer
- Subject: Thank you for your enquiry — Mandakini Rao
- Contains: confirmation that enquiry was received, what they enquired about, that Mandakini will be in touch

---

## 10. Admin Panel Rules

Route: /admin
This is not in the public navigation. Mandakini accesses it directly via URL.
No authentication in Phase 1 — implement basic HTTP auth via middleware.
Password stored in environment variable: ADMIN_PASSWORD

**UI requirements:**
- Shows two columns: New Orders and Shipped Orders
- Each order card shows: customer name, item, size, frame, city, order date
- New order card has a form: waybill number input + courier name input + Mark as Shipped button
- Shipped order card shows: waybill number, courier, shipped date — no further actions
- No other UI elements needed in Phase 1

---

## 11. Loading Animation (Intro Screen)

**Concept:** The Ravana/Subbulakshmi formation
- Background: var(--color-near-black)
- 9 portrait images of MS Subbulakshmi painted by Mandakini
- Central portrait appears first (fade in)
- 4 portraits emerge from right side, staggered, peeking from behind central
- 4 portraits emerge from left side, staggered, peeking from behind central
- Each flanking portrait: slightly smaller, partially visible, lateral slide from behind previous
- Once all 9 hold: "MANDAKINI RAO" appears below central portrait
- Enter button appears at bottom center
- On Enter click: intro screen fades out, homepage fades in
- Uses GSAP for all animation
- sessionStorage flag prevents replay in same session

**Placeholder setup:**
Use 9 placeholder portrait images at 400x500px (portrait ratio) until client provides actual artwork.
Place placeholders at: public/placeholders/portrait-[1-9].jpg

---

## 12. Works Page Behaviour

- Entry: artwork outline animation draws itself on page load
- Scroll to reveal: each project card reveals as user scrolls down
- Projects numbered editorially: 01, 02, 03 etc.
- Each project card: cover image, number, title, year, short note
- Click card: navigate to /works/[slug]
- Inside project page:
  - Full-screen cover image moment
  - Artwork images in a relaxed, non-grid layout
  - Project details: title, year, medium, dimensions, note
  - If projectType = 'projectWithShop': show available prints + enquiry for originals
  - If projectType = 'projectOnly': no buying section shown
  - Related projects at the bottom

---

## 13. Shop Behaviour

- Simple catalogue, separate from Works editorial experience
- Items grouped by type: Prints, Originals, Limited Editions
- Each item shows: image, title, price, size options
- Add to cart for prints (direct purchase via Stripe)
- Enquire button for originals (fires enquiry form, no direct payment)
- Cart is a drawer (slides in from right)
- Checkout via Stripe Checkout (redirect to Stripe hosted page)

---

## 14. Coding Conventions

- TypeScript throughout. No JavaScript files except config files.
- All Sanity queries in sanity/lib/queries.ts — never write inline GROQ
- All email sending logic in lib/resend.ts — never call Resend directly from routes
- All Stripe logic in lib/stripe.ts — never call Stripe directly from routes
- Use Next.js Server Components for all data fetching pages
- Use Client Components only when interactivity is required (mark with 'use client')
- CSS variables for all colours — never hardcode hex values in components
- Tailwind for spacing and layout utilities only — use CSS variables for colours
- Never use inline styles
- All images go through the SanityImage component — never raw img tags for CMS content
- Error boundaries on all interactive client components

---

## 15. What Requires Client Assets Before Building

The following cannot be finalised without Mandakini providing files:

- The 9 Subbulakshmi portrait images for the loading animation (use placeholders)
- Actual artwork images for Works page (use placeholders)
- Homepage hero concept (she has a specific idea — build shell only)
- Logo or wordmark if she has one
- Font confirmation (proceed with Cormorant Garamond + Jost until she confirms)

Everything else can and should be built now.

---

## 16. Phase 2 — Do Not Build, Only Prepare

The following are Phase 2. Do not build any UI or logic for these in Phase 1.
Do define the Sanity schemas for class and member so the data structure is ready.

- Classes / Learn section
- Member login and dashboard
- Gated video content
- Downloadable bundles
- Supabase authentication
- Payment flow for classes

---

*Last updated: Project initialisation*
*Updated by: Project planning — pre-build*
