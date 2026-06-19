# PROGRESS.md — Mandakini Rao Artist Website
> Read this file before starting any session.
> Update this file at the end of every session.
> Do not read any code files to understand project state — this file tells you everything.

---

## Current Status
**Build phase:** Block 8 complete; Block 12 complete; /about rebuild complete
**Last updated by:** About page rebuild (3 sections)
**Last session date:** June 19, 2026

---

## What Is Complete
Block 1 foundation setup is complete. The Next.js 14 App Router project has been initialised, dependencies installed, Sanity Studio configured at /studio, route shells created, confirmed design tokens added to globals.css, Tailwind and Next config added, environment template created, and 9 placeholder portrait images generated. Design tokens corrected to confirmed client palette June 2026.

Block 2 Sanity schema build is complete. All 10 document schemas have been created and registered: Project, Artwork, Shop Item, Order, Press Item, About, Site Settings, Navigation, Class, and Member.

Final Prompt 03 homepage work is complete. The site now uses the warm aged-paper palette, terracotta accents, Cormorant Garamond / Jost / EB Garamond typography, cat motif system, stacked-card loading animation, centered editorial homepage hero, hamburger menu overlay, homepage sections, shop preview, press/newsletter area, and footer.

**Phase 1 — Token system live with usage map — June 13, 2026:**
- Design token semantic layer complete: all seven palette values were already present as raw tokens (globals.css :root). Phase 1 added the semantic alias layer in v2.css (`--accent-index`, `--accent-eyebrow`, `--accent-link`) with theme-aware AA-compliant values for both dark and light stages. Applied as moments across works grid, section eyebrows, link hovers, and pill CTA fills. Usage map documented in PROJECT.md §6. No blues added.

**Phase 2 — Commerce built, flag off, pending Stripe keys and Mandakini approval — June 13, 2026:**
- Full commerce infrastructure: feature flag (`lib/commerce.ts`), CartContext + sessionStorage persistence (`lib/cart.tsx`), Stripe client + checkout session (`lib/stripe.ts`), server-side price validation route (`/api/checkout`), idempotent webhook with stock decrement and order email (`/api/stripe/webhook`), order confirmation and notification email templates (`emails/orderEmails.ts`), CartDrawer slide-in panel, BuyControls (Add to Cart / Buy Now / Sold state), thank-you page — all complete.
- BuyControls wired into ShopIndex (flag-gated, article card structure when on) and ProductDetail (replaces "Enquire" CTA when flag on).
- All commerce CSS added to globals.css: `.mr-buy*`, `.mr-cart__*`, `.mr-thanks*` — consuming Phase 1 tokens only, no new values.
- Gate: `NEXT_PUBLIC_COMMERCE_ENABLED=true` + `STRIPE_SECRET_KEY` must both be set for any commerce UI to appear. With either absent, the site renders exactly as before Phase 2.
- Pending before going live: Mandakini approval of product prices + copy; Stripe account setup; `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`, `ENQUIRY_FROM_EMAIL`, `ENQUIRY_NOTIFY_EMAIL`, `ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL` added to Vercel dashboard.

---

## What Is In Progress
Nothing yet.

---

## Full Task List

### BLOCK 1 — Foundation (no design assets needed)
- [x] 1.1 Initialise Next.js 14 project with App Router and TypeScript
- [x] 1.2 Install all core dependencies (Tailwind, Sanity, GSAP, Stripe, Resend, React Email)
- [x] 1.3 Connect Sanity project (ID: i4t9kzxg) and configure sanity.config.ts
- [x] 1.4 Set up embedded Sanity Studio at /studio route
- [x] 1.5 Configure Vercel deployment and connect GitHub repo
- [x] 1.6 Set up all environment variables in Vercel dashboard
- [x] 1.7 Create all page route shells (empty pages at correct paths)
- [x] 1.8 Create globals.css with all CSS variables from PROJECT.md section 6
- [x] 1.9 Configure tailwind.config.js to reference CSS variables
- [x] 1.10 Create next.config.js with Sanity image domain and correct settings

### BLOCK 2 — Sanity Schema
- [x] 2.1 Write project schema
- [x] 2.2 Write artwork schema
- [x] 2.3 Write shopItem schema
- [x] 2.4 Write order schema
- [x] 2.5 Write pressItem schema
- [x] 2.6 Write about schema
- [x] 2.7 Write siteSettings schema
- [x] 2.8 Write navigation schema
- [x] 2.9 Write class schema (Phase 2 — schema only, no UI)
- [x] 2.10 Write member schema (Phase 2 — schema only, no UI)
- [x] 2.11 Register all schemas in sanity/schemas/index.ts
- [x] 2.12 Verify Sanity Studio loads correctly at /studio with all document types visible

### BLOCK 3 — Data Layer
- [ ] 3.1 Create sanity/lib/client.ts with correct project ID and dataset
- [ ] 3.2 Create sanity/lib/image.ts with image URL builder
- [ ] 3.3 Write all GROQ queries in sanity/lib/queries.ts:
  - getAllProjects
  - getProjectBySlug
  - getAllShopItems
  - getShopItemBySlug
  - getAbout
  - getAllPressItems
  - getFeaturedPressItems
  - getSiteSettings
  - getNavigation
  - getAllOrders
  - getOrderById

### BLOCK 4 — Stripe and Order Flow
- [ ] 4.1 Create lib/stripe.ts with Stripe client and checkout session creator
- [ ] 4.2 Create /api/stripe/webhook/route.ts — handles payment_intent.succeeded
- [ ] 4.3 Webhook creates Order document in Sanity on successful payment
- [ ] 4.4 Webhook triggers OrderConfirmation email to customer
- [ ] 4.5 Webhook triggers OrderNotification email to Mandakini
- [ ] 4.6 Create /api/orders/[id]/ship/route.ts — marks order shipped, triggers email
- [ ] 4.7 Test full payment → order creation → email flow end to end

### BLOCK 5 — Email Templates
- [ ] 5.1 Install React Email and configure
- [ ] 5.2 Create lib/resend.ts with send helpers
- [ ] 5.3 Build OrderConfirmation.tsx email template
- [ ] 5.4 Build OrderNotification.tsx email template
- [ ] 5.5 Build ShippingConfirmation.tsx email template
- [ ] 5.6 Build EnquiryAcknowledgement.tsx email template
- [ ] 5.7 Create /api/contact/route.ts with email send logic
- [ ] 5.8 Create /api/enquiry/route.ts with email send logic

### BLOCK 6 — Admin Panel
- [ ] 6.1 Create /admin route with basic middleware HTTP auth
- [ ] 6.2 Build admin layout
- [ ] 6.3 Build OrderList component showing New and Shipped columns
- [ ] 6.4 Build OrderCard component with waybill + courier form for new orders
- [ ] 6.5 Wire Mark as Shipped button to /api/orders/[id]/ship
- [ ] 6.6 Test full admin flow: see order → enter waybill → mark shipped → email fires

### BLOCK 7 — Core UI Components
- [ ] 7.1 Build Navigation component (shell — final design waits for assets)
- [ ] 7.2 Build Footer component with cat illustration placeholder
- [ ] 7.3 Build SanityImage component wrapping next/image
- [ ] 7.4 Build ContactForm component with validation and API call
- [ ] 7.5 Build EnquiryForm component with validation and API call
- [ ] 7.6 Build NewsletterSignup component
- [ ] 7.7 Build CartDrawer component with cart state
- [ ] 7.8 Build CheckoutButton component that creates Stripe session

### BLOCK 8 — Loading Animation
- [x] 8.1 Add 9 placeholder portrait images to public/placeholders/ at 400x500px
- [x] 8.2 Build IntroAnimation component with GSAP timeline
- [x] 8.3 Implement central portrait fade in
- [x] 8.4 Implement staggered lateral peek for 4 right portraits
- [x] 8.5 Implement staggered lateral peek for 4 left portraits
- [x] 8.6 Implement MANDAKINI RAO text appearance after all faces hold
- [x] 8.7 Implement Enter button fade in
- [x] 8.8 Implement intro screen fade out to homepage on Enter click
- [x] 8.9 Implement sessionStorage flag to prevent replay
- [x] 8.10 Test animation timing and feel — adjust GSAP easing and delays

### BLOCK 9 — Works Page
- [ ] 9.1 Build Works index page with scroll-driven project reveals
- [ ] 9.2 Build editorial numbered project cards (01, 02, 03)
- [ ] 9.3 Build individual project page template
- [ ] 9.4 Implement full-screen cover image moment at top of project page
- [ ] 9.5 Implement artwork image layout within project page
- [ ] 9.6 Build project details section (title, year, medium, dimensions, note)
- [ ] 9.7 Conditionally show shop section for projectType = 'projectWithShop'
- [ ] 9.8 Build print listing within project page (links to shop item)
- [ ] 9.9 Build original enquiry CTA within project page
- [ ] 9.10 Build related projects section

### BLOCK 10 — Shop Page
- [ ] 10.1 Build shop index page with items grid
- [ ] 10.2 Build product detail page
- [ ] 10.3 Implement size selector
- [ ] 10.4 Implement frame option selector
- [ ] 10.5 Implement add to cart flow
- [ ] 10.6 Wire checkout to Stripe session

### BLOCK 11 — Remaining Pages
- [ ] 11.1 Build About page layout with bio, statement, photos, exhibition history
- [ ] 11.2 Build Press & Features page layout
- [ ] 11.3 Build Contact page with contact form and enquiry form

### BLOCK 12 — Homepage (partial — hero waits for client)
- [x] 12.1 Build homepage shell layout
- [x] 12.2 Build featured works section (pulls from siteSettings.featuredProjects)
- [x] 12.3 Build featured shop items section
- [x] 12.4 Build press preview section (pulls featured press items)
- [x] 12.5 Build newsletter/signup section
- [x] 12.6 Hero section built from client sketch concept

### BLOCK 13 — Asset Swap (awaiting Mandakini)
- [ ] 13.1 Replace 9 placeholder portraits with actual Subbulakshmi paintings
- [ ] 13.2 Upload artwork images into Sanity
- [ ] 13.3 Upload studio photos into Sanity for About page
- [ ] 13.4 Confirm or update font selection
- [ ] 13.5 Add logo/wordmark if provided
- [x] 13.6 Build hero section once client concept is received
- [ ] 13.7 Final QA and cross-browser testing
- [ ] 13.8 Performance audit
- [ ] 13.9 SEO meta tags and OpenGraph setup
- [ ] 13.10 Launch

---

## Known Issues / Decisions Made

**Block 1 setup notes — June 7, 2026:**
- The exact `npx create-next-app@latest .` command could not run in the project root because the folder name `Website` violates current npm package-name restrictions. A temporary lowercase scaffold was used instead, then the generated Next.js 14 files were copied into this workspace.
- Current `create-next-app@latest` now scaffolds Next 16/Tailwind 4, so `create-next-app@14` was used to satisfy the documented Next.js 14 requirement.
- Current `next-sanity` requires Next 16, so `next-sanity@9.12.3` and `sanity@3.99.0` were used for Next 14/Sanity v3 compatibility.
- The provided `sanity.config.ts` imports `@sanity/vision`, which was omitted from the dependency list, so `@sanity/vision@3.99.0` was installed to make the exact Studio config compile.
- Vercel/GitHub connection and Vercel dashboard environment variables were not changed locally; they are treated as complete based on the pre-build project note that GitHub and Vercel are already connected, while `.env.local.example` documents the required variables.

**Design tokens updated June 2026:**
- Design tokens corrected to confirmed client palette June 2026.
- Palette confirmed from 3 client moodboards. Blues (Ocean, Skyline, Lagoon) dropped — not present in studio.
- Final palette uses: Toffee, Salsa, Amber, Cacao, Deep Cacao, Moss, Pumpkin, Rosehip, Cream, Parchment.
- Typography confirmed: Cormorant Garamond (display) + Cormorant SC (small caps) + EB Garamond (body) + Jost (UI)
- globals.css in PROMPT_01 must use updated tokens from PROJECT.md section 6 — not the original values.

**About page copy confirmed:**
- Version 1 of the about_me PDF is the correct version for the website (warm, personal tone).
- Version 2 is for press/PR use only.

**Photos confirmed:**
- 6 professional photos received and ready for About page.
- B&W photos: editorial studio portraits with Subbulakshmi painting visible in background.
- Colour photo (white shirt, studio): primary About page hero image.
- All images are high resolution and production ready.

**Font reference confirmed:**
- Jardin shop + ChungiYoo illustrations confirmed as font/hero references.
- Siena.film confirmed for the "sepia film" scroll and transition feel.

**Still pending from client:**
- Google Drive folder shared but currently empty — more assets expected.
- 9 Subbulakshmi portrait paintings for loading animation (not yet received).
- Artwork collection images for Works page.

**Block 2 schema notes — June 7, 2026:**
- All schemas were built from PROJECT.md section 7 and registered in sanity/schemas/index.ts.
- About, Site Settings, and Navigation use singleton-style `__experimental_actions` as specified; current Sanity v3 typings do not include that property, so those definitions and the exported registry use a narrow TypeScript cast while preserving the requested schema behavior.
- Verification: /studio returned 200 and `tsc --noEmit` completed successfully.

**Final Prompt 03 homepage notes — June 7, 2026:**
- Homepage and intro were rebuilt from the final replacement homepage prompt, superseding earlier homepage prompt versions.
- New global palette uses warm aged-paper backgrounds with terracotta and deep cacao accents.
- Cat motif is implemented as a reusable CatMark and appears in navigation, dividers, shop cards, and footer.
- Homepage content is hardcoded placeholder content for now; Sanity data connection is still pending Block 3.
- Verification: `tsc --noEmit` passed, component color scan found no hardcoded hex/rgba values, and http://localhost:3001/ returned 200.

**Loader and hero refinement notes — June 7, 2026:**
- The old portrait intro was replaced with a CSS-keyframed stacked artwork-card loader matching the provided sketch: central Box 1 fades in, paired Box 2 cards slide outward, then Box 3 and Box 4 cards reveal in staggered layers.
- The homepage hero now uses the requested centered title, "Welcome to the canvas of Mandakini Rao", with a large editorial composition, dashed canvas-frame border, top-left identity, top-right hamburger, and small decorative mark.
- A global canvas/paper texture layer was added in CSS and applies across the site without image assets.
- Hamburger menu overlay includes Home, Works / Projects, Shop, Workshops, About, and Contact.
- Verification: `tsc --noEmit`, `npm run build`, browser loader/hero/menu checks, and http://localhost:3001/ all passed.

---

## Files Created or Modified in Last Session
- sanity/schemas/aboutPage.ts (3 new field groups: HERO, BODY, ABOUT-BLOCK; legacy fields kept)
- sanity/lib/queries.ts (aboutPageQuery extended with all new fields)
- components/AboutSection.tsx (AboutData type extended; EdgeWord type added)
- components/about/AboutHero.tsx (new — flanking arch columns + centred display word + brushstroke)
- components/about/AboutEdgeWords.tsx (new — fractured body text + parallax edge words + footer labels)
- styles/about.css (rewritten — nav fix kept; new Section 1 + Section 2 CSS; old AboutSection rules removed)
- components/home/v2/CanvasCards.tsx (ctaHref + ctaLabel optional props added; homepage default unchanged)
- app/(site)/about/page.tsx (rewritten — AboutHero → AboutEdgeWords → CanvasCards; CTA → /contact)

---

## Next Steps for Next Agent
Commerce Phase 2 is complete and flag-gated. Next work when ready:
1. Obtain Stripe keys from Mandakini and set env vars in Vercel dashboard (see Phase 2 entry above for full list)
2. Add real Sanity product data (Block 13 — asset swap)
3. Test the full checkout flow end-to-end with Stripe test mode
4. Admin panel (Block 6) — order management UI

**About section rebuild — June 12, 2026:**
- Homepage About (section 2, after the hero) rebuilt as a two-part editorial composition: parallax B&W portrait in a generously rounded mask (clip reveal, image settles 1.3 → 1.15, restrained ±5% scroll parallax via GSAP ScrollTrigger riding the existing Lenis instance; parallax off on touch) + one display line + pill CTA to /about (rosehip fill on hover).
- The previous rolling-word ticker ("Two Decades") was removed entirely — no orphaned tweens, intervals, IntersectionObservers, or `.mr2-roll`/`.mr2-canvas` CSS remain (verified by grep).
- Copy "Painter, photographer and educator, working between canvas, lens and the ragas of Carnatic music." is PLACEHOLDER pending client approval. Portrait path needs confirmation (using the approved studio portrait; spec suggests /public/images/about/mandakini-portrait.jpg).
- Spec mapping notes: "Staff Regular" rendered via the site display token (Sephir — Staff was never supplied); colors go through the theme tokens so the section holds in both dark and light themes (the spec's cream/near-black pairing is the light theme). No grain, no squares, no blues; hero, loader, works, and global layout untouched.
- Verification: `tsc --noEmit` pending in this note's session run; / returns 200.

**Cursor hardening + Studio Journal — June 12, 2026:**
- Cursor: confirmed/hardened the quickTo-transform follower spec — GSAP quickTo on x/y only, zero React state on mousemove, fixed-position element mounted at the layout root (outside <main> and any transformed/filter ancestor, resolving the containing-block stuck bug), pointer-events: none, will-change: transform added, expansion animates scale/opacity on the same element, hidden on touch via JS bail AND a (hover:none)/(pointer:coarse) media query. Deviation logged: the cursor is a pill label chip, not a circle — the client-direction sessions explicitly rejected circular cursors; chip retained. Hide-on-scroll retained as the fix for hover targets scrolling out from under a stationary pointer.
- Studio Journal: new lazy homepage section (between Voices & Press and the footer): curated Instagram posts rendered from Sanity images (no Meta embed.js, no IG iframes) with hover scale + "View on Instagram" reveal, and YouTube facade cards (thumbnail + circular play; youtube-nocookie iframe injected only on click). Whole section mounts via IntersectionObserver (600px margin) so initial load and the hero are untouched. Asymmetric 12-col grid, rounded masks, staggered scale-inside-mask reveals, bare Instagram/YouTube profile links below; existing footer links intact. `socialPost` Sanity schema added (platform/image/caption/url/youtubeId/order) and registered; query capped at 6; placeholder posts marked for client approval.
- Verification: `tsc --noEmit` clean; / returns 200; journal markup renders; no embed scripts present.

**Private Collection enquiry flow — June 12, 2026:**
- Shop page gained "The Private Collection" — a deliberate room-change section in fixed warm near-black #2C1A0E with cream type (distinct against both site themes), typographic only: heading + supporting line (PLACEHOLDER copy marked) + pill "Enquire to View" (cream border → terracotta fill, near-black text). Zero imagery: no private works appear anywhere in code, CMS, or seeds, per the gating requirement. The cat line-accent option was skipped — the cat motif was removed from this project by client direction earlier.
- CTA opens a slide-in panel (right drawer, rounded inner edge, Lenis-safe lockScroll/unlockScroll, Esc + veil close). Form: Name, Email, Phone (opt), "What draws you to the collection?" (opt), Budget range (opt; placeholder tiers without currency assumptions). Rounded fields, rosehip focus rings, gentle rosehip-tinted inline errors, pill "Request the Collection" with submitting state; success replaces the form ("Thank you. Mandakini will share the collection with you personally." — PLACEHOLDER).
- /api/enquiry: server-side validation, honeypot + 3s minimum-fill check (bots receive silent success), modest in-memory per-IP rate limit (5/10min; revisit if multi-instance), Sanity `enquiry` document write via SANITY_API_WRITE_TOKEN (graceful log-only when env absent), then two Resend emails (notification to Mandakini, warm confirmation to the enquirer — plain typographic HTML templates in emails/enquiryEmails.ts, PLACEHOLDER copy). Email failure after a successful write still returns success and logs.
- `enquiry` schema added with status new|responded|closed for the future /admin panel; submittedAt set server-side.
- New env needed at launch: SANITY_API_WRITE_TOKEN, RESEND_API_KEY, ENQUIRY_FROM_EMAIL, ENQUIRY_NOTIFY_EMAIL.
- Verification: `tsc --noEmit` clean; /shop 200 with section rendered; API returns silent success for honeypot/fast-fill submissions.

**Cursor rebuilt from scratch — June 12, 2026:**
- Old implementation deleted entirely (component, styles, listeners; grep-verified zero references). New `components/ui/Cursor.tsx`: mounted once in the ROOT layout and PORTALED to document.body via createPortal — structurally outside the Lenis wrapper and every transformed/filtered ancestor, eliminating the fixed-position containing-block failure class. Single div + inner label span; movement is two gsap.quickTo tweens (x/y, 0.5s power3.out) fed by one window mousemove listener; xPercent/yPercent -50 set once; no React state on move, no own rAF, no top/left writes. Hover via ONE delegated pointerover/pointerout pair reading [data-cursor] / [data-cursor-label]; expansion is scale+opacity on the same element (rest 0.18 → 1.3). 42 existing data-cursor attributes across work cards, featured cards, shop, and CTAs feed the API — no per-element listeners anywhere.
- Hygiene: renders only when matchMedia('(pointer: fine)') matches (+ CSS coarse-pointer kill); fades out on document mouseleave and window blur, back on re-entry; native cursor remains visible (was never intentionally hidden). Scroll-under-pointer is handled by re-resolving elementFromPoint on scroll (rAF-throttled) so the label can never strand mid-Lenis-scroll — the original "stuck VIEW" cause.
- Checklist: [pass, by construction + headless checks] portal target is document.body; single mount in root layout (survives route changes; effect cleanup prevents listener duplication); zero old-cursor references; tsc clean; / and /works 200. [needs AP's browser confirmation] visual smoothness during fast Lenis scroll, hover during card animations, DevTools body-child inspection, console cleanliness — not verifiable headlessly; please confirm on localhost:3004.
- Deviations logged: the frozen /?v=1 reference keeps its own legacy cursor (client direction: zero changes to V1); the new cursor is CSS-gated off that route so the two never coexist.

**Cleanup — June 12, 2026 (audit pass; no new features, no visual changes beyond the listed removals):**

*Studio Journal removed entirely (deprioritized):*
- Deleted `components/home/v2/StudioJournal.tsx` (incl. its IntersectionObserver lazy-load wiring and GSAP reveal timelines).
- Deleted the `socialPost` Sanity schema (`sanity/schemas/socialPost.ts`) and its registration in `sanity/schemas/index.ts`.
- Deleted `socialPostsQuery` from `sanity/lib/queries.ts`; deleted `getSocialPosts`, `HomeSocialPost`, `PLACEHOLDER_SOCIAL`, and the `socialPosts` field of `HomeData` from `lib/home-data.ts`.
- Removed the section mount + prop from `HomeExperienceV2.tsx` and every `.mr2-journal*` rule from `app/v2.css` (incl. the responsive block).

*Social links now render in exactly one place — the footer (`FooterV2`):*
- The duplicate Instagram/YouTube links at the bottom of the homepage belonged to the Studio Journal and went with it.
- The legacy `components/layout/Footer.tsx` (old `mr-footer`, unused — carried a second copy of the links) was deleted along with all `.mr-footer*` CSS; the `body.mr2-mode .mr-footer` gating selector in v2.css was trimmed accordingly.

*Dead code removed:*
- Unused scaffold files: `sanity/lib/live.ts` (sanityFetch/SanityLive never imported), `sanity/env.ts`, `sanity/structure.ts`, `sanity/schemaTypes/` (empty registry — the real one is `sanity/schemas/`).
- `lib/home-data.ts`: the orphaned homepage works-grid concept (`HomeWork`, `PLACEHOLDER_WORKS`, `SIZE_PATTERN`, the `works` field and its Sanity fetch) — neither V1 nor V2 consumed it.
- `sanity/lib/queries.ts`: unused `allProjectsQuery`, `projectBySlugQuery`, `featuredProjectsQuery`, `siteSettingsQuery` (the series queries superseded them; re-add when a page actually consumes them).
- `lib/motion.ts`: unused `getLenis`, `EASE_INOUT` (+ its CustomEase registration), and the external `SplitText` re-export.
- Dead CSS in `app/globals.css`: `.mr-direction` (retired V1/V2 pitch-switcher chip), `.mr-mask--c`, the never-rendered works-grid rules (`.mr-works__grid`, `.mr-works__cta`, `.mr-work__head/__index/__index-num/__index-script/__rule/__annotation`), the entire `.mr-practice__*` family, and all `.mr-footer*` rules — verified unreferenced (incl. dynamically-built class names) before deletion. `.mr-work` base/nth-of-type rules KEPT (live styling for ShopTeaser).
- package.json: removed unused `@gsap/react`, `@react-email/components`, `react-email`, `@stripe/stripe-js`, `stripe`, `@sanity/client`. ⚠ Reinstall `stripe`/`@stripe/stripe-js` at Block 4 and React Email at Block 5. `styled-components@^6.4.2` is now an explicit dependency (runtime peer of sanity v3 Studio; previously satisfied implicitly — installs in this workspace need `--legacy-peer-deps`).
- V1 (`/?v=1`) untouched: its components, legacy cursor (`CursorFollower`), and styles remain frozen per client direction.

*Consistency pass (single source of truth; zero visual change — identical values, now tokenized):*
- Colors: every rule-level hex in `app/globals.css` and `app/v2.css` now reads a token. New fixed-value tokens (surfaces that deliberately never theme-switch): `--accent-terracotta #B8572A`, `--accent-error #C4685A`, `--ink-cream #F5EFE4`, `--bg-void #060606` (globals); `--v2-cream/--v2-night/--v2-void/--v2-rosehip` (v2). The Private Collection's fixed night/cream palette intentionally does NOT map to theme-switched `--v2-*` vars. `lib/motion.ts` SCRUB_PALETTES keeps literal values by necessity (GSAP interpolates the scroll background journey) — it is the JS-side palette definition. Email templates keep inline hex (HTML email cannot read CSS vars).
- Easing: master ease = `mandakini` (JS `EASE`) / `--ease-manda` (CSS), both `cubic-bezier(0.25, 1, 0.5, 1)`. Auxiliary eases are now named tokens in `lib/motion.ts` (`EASE_OUT`, `EASE_IN`, `EASE_SOFT_OUT`, `EASE_SOFT_INOUT`, `EASE_SINE`, `EASE_POP`) — no component hardcodes a GSAP ease string anymore. One stray CSS `transition: color 0.4s ease` on `.site-nav` now uses `var(--ease-manda)`.
- Timing: JS `DUR` (0.6 / 1.0 / 1.4) matches CSS `--dur-fast/base/grand`; confirmed aligned.
- Files changed in the consistency pass: `lib/motion.ts`, `app/globals.css`, `app/v2.css`, `components/ui/Cursor.tsx`, `components/ui/CursorFollower.tsx`, `components/home/Hero.tsx`, `components/home/LoadingScreen.tsx`, `components/home/v2/ContactStage.tsx`, `components/home/v2/RisingSunWorks.tsx`, `components/home/v2/LoadingScreenStripes.tsx`, `components/shop/ProductDetail.tsx`, `components/works/WorksIndex.tsx`.

*Verification:* `tsc --noEmit` clean (also with `--noUnusedLocals --noUnusedParameters`); `next lint` clean; `npm run build` passes; all routes 200 (/, /?v=1, /works, /works/[slug], /shop, /shop/[slug], /about, /contact, /press, /admin, /studio); headless Chromium run: loader plays → Enter → hero entrance animates, scroll triggers fire, footer renders, zero journal markup, exactly one Instagram + one YouTube link (footer), zero console errors across all routes.


**Navigation & footer reveal fixes — June 12, 2026 (bug fixes only):**
- Root cause confirmed as predicted: ScrollTriggers owned by PERSISTENT components survived client-side navigation with stale measurements. `Navigation`'s nav-ink trigger was mount-once (and watched the V1-only `.mr-hero`, going stale or pointing at a removed node after any route change); `FooterV2`'s MANDAKINI scrub was mount-once, so its positions were measured against the first page's height and never fired anywhere else. Fixed structurally, not per-page:
  - `MotionProvider` (the Lenis owner, root layout) now owns route transitions: on every pathname change it resets scroll to the top (`lenis.scrollTo(0, {immediate})` + `window.scrollTo`), rebinds the velocity-skew to the new page's elements, and runs `ScrollTrigger.refresh()` after a double rAF so every surviving trigger re-measures against the new layout. Page-level triggers already die with their own `gsap.context` revert on unmount.
  - `Navigation`: hero trigger re-created per pathname; menu force-closes on pathname change (covers back/forward as well as link clicks); menu scroll-lock now uses the Lenis-safe `lockScroll`/`unlockScroll` instead of bare body overflow; removed the dead `/#workshops` menu link (no such anchor exists anywhere — broken navigation target).
  - `FooterV2`: the giant-name scrub trigger is re-created per pathname; combined with the global post-paint refresh, the reveal works identically on every route.
  - Structural route fix: `app/about`, `app/contact`, `app/press` lived OUTSIDE the `(site)` route group, so those pages rendered with no nav and no footer at all (deviation from PROJECT.md §5, which places them inside). Moved into `app/(site)/…`; their shells no longer nest a second `<main>` (the group layout provides it) and use a small `.mr2-page-shell` style (theme ink, clear of the fixed nav). `/admin` stays outside by design (internal, no public chrome).
  - All nav/menu/footer links were already Next `<Link>`s — verified zero raw internal `<a href>` anchors.
- Checklist (verified headless-Chromium, one session, no refreshes, home → works → shop → about → contact → home via the menu):
  - [x] Nav works from every page to every page — all hops client-side (no full reloads), URL updates, menu opens and closes cleanly every time
  - [x] Scroll resets to top on every new route
  - [x] Footer MANDAKINI reveal fires on ALL routes — giant name scrubs yPercent 45 → 0 on every page (40 → 0 on short shell pages where the footer is already partially in view)
  - [x] No duplicate Lenis instances (singleton guard + single root mount; one `lenis` class on <html> throughout the session)
  - [x] No console errors on any route, including the frozen /?v=1 (V1 renders untouched, body class clean, zero errors)
- Constraints respected: no grain, no boxy elements, no blues, master ease only (route-transition code introduces zero new easing; the footer scrub stays `ease: none` as scrubs must).
- Files changed: `components/ui/MotionProvider.tsx`, `components/layout/Navigation.tsx`, `components/home/v2/FooterV2.tsx`, `app/(site)/about|contact|press/page.tsx` (moved + de-nested), `app/v2.css` (+`.mr2-page-shell`).


**Phase 1 — Accent color system — June 12, 2026 (styling pass only):**
- All seven required colors already existed as tokens (globals.css :root): amber `--accent-amber #C89839`, rosehip `--accent-rosehip #792318`, moss `--accent-moss #5B643E`, toffee `--accent-toffee #DA682F`, deep cacao `--ink-night #2C1A0E`, cream `--ink-cream #F5EFE4`, terracotta `--accent-terracotta #B8572A`. Phase 1 added the SEMANTIC layer in v2.css: `--accent-index`, `--accent-eyebrow`, `--accent-link` — theme-aware so every accent holds WCAG AA on both stages (lifted dark-stage variants: moss → #9DAA7E 8:1, rosehip → #C4685A 5.2:1; amber deepens to #8A6312 4.5:1 on cream). No blues added anywhere.
- Applied as moments (scoped `body.mr2-mode`, so the frozen /?v=1 keeps its original colors): works grid + series index numerals → amber; section eyebrow labels (`.mr-eyebrow`, shop section head) → moss; link hover states (footer columns, works list rows, detail sale links, menu overlay) → rosehip family; focus rings → rosehip family (was marigold); pill CTA hover fills (`.mr-pill`, footer stamp) → rosehip fill with cream text (8.9:1; terracotta+ink fails AA at 3.5:1, so rosehip was chosen of the two allowed); inline accents stay toffee.
- "Color usage" note added to PROJECT.md §6 documenting which accent goes where and the AA lift values.
- Deviations (logged, not silently skipped): the cat motif was REMOVED from this project by client direction (see Private Collection notes) — no toffee/amber cat applied; "The Practice" section does not exist in the current build (V1-era concept, never rendered — its dead CSS went in the cleanup pass), so no moss-tinted room was created — flagging for AP rather than inventing a section; `--v2-indigo` (hero card stock) predates the no-blues rule, comes from the client-approved Subbulakshmi duotones, sits inside the untouchable hero, and appears nowhere else.
- Phase 1 gate passed: build clean; /, /works, /shop, /about, /contact, /press all 200; computed styles verified in headless Chromium on BOTH themes (dark: eyebrow #9DAA7E, index #C89839, focus #C4685A; light: eyebrow #5B643E, index #8A6312); zero console errors. Hero, loader, about, cursor, Private Collection untouched.
