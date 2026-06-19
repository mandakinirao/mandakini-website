# PROMPT_LOG.md — Mandakini Rao Artist Website
> Coding agents append a one-paragraph summary to this file at the end of every session.
> Format: ## Session [date] — [task completed]
> This file is a decision trail. It explains why non-obvious choices were made.
> Do not delete previous entries.

---

## Session — Project planning (pre-build)
All architecture, schema, folder structure, design tokens, order flow, email flow, and admin panel behaviour were planned and documented in PROJECT.md before any code was written. Sanity project ID i4t9kzxg is already created by the client. GitHub and Vercel are already connected. The font pairing Cormorant Garamond and Jost was selected as the working default based on the warm, editorial aesthetic direction — client confirmation is pending. Placeholder portraits at 400x500px are to be used for the loading animation until client provides the 9 Subbulakshmi paintings. Homepage hero section is deliberately left unbuilt until client shares her concept. All other sections proceed with placeholders.

## Session June 7, 2026 — Block 1 foundation setup
Initialised the Mandakini Rao site as a Next.js 14 App Router/TypeScript/Tailwind project, installed the core Sanity, GSAP, Stripe, Resend, and React Email dependencies, created the requested folder structure and placeholder routes, configured Sanity Studio at /studio, added the Sanity client stub, Tailwind tokens from the confirmed June 2026 PROJECT.md palette, Next image settings, environment template, and 9 warm solid-colour 400x500 JPEG placeholders. The exact root `create-next-app@latest .` command could not be used because the current folder name has a capital letter and latest now targets Next 16/Tailwind 4, so a lowercase temporary Next 14 scaffold was generated and copied into place; `next-sanity@9.12.3`, `sanity@3.99.0`, and `@sanity/vision@3.99.0` were used so the documented Next 14/Sanity v3 setup and provided Studio config compile. Verification with `npm run dev` returned 200 for /, /works, /shop, /about, /press, /contact, /admin, /studio, /works/test-project, and /shop/test-product.

## Session June 7, 2026 — Design token correction
Design tokens corrected from placeholder values to confirmed client palette extracted from three moodboards. Blues (Ocean, Skyline, Lagoon) were intentionally excluded as they do not appear in the studio environment. Typography updated to Cormorant Garamond / Cormorant SC / EB Garamond / Jost. All four are Google Fonts loaded via @import. Placeholder portrait images confirmed at public/placeholders/.

## Session June 7, 2026 — Sanity schema build
Built and registered all 10 Sanity document schemas from PROJECT.md section 7: Project, Artwork, Shop Item, Order, Press Item, About, Site Settings, Navigation, Class, and Member. Phase 2 Class and Member schemas were added as schema-only content types with no UI work. About, Site Settings, and Navigation retain the requested singleton-style `__experimental_actions`; current Sanity v3 TypeScript definitions do not expose that property, so narrow casts were added to those schema definitions and the registry without changing the fields. Verification passed with /studio returning 200 and `tsc --noEmit` completing successfully.

## Session June 7, 2026 — Final homepage and intro build
Rebuilt the homepage from the final replacement Prompt 03, using a warm cream aged-paper base, terracotta accents, dark footer/intro treatment, and the Cormorant Garamond / Jost / EB Garamond type system. Added a reusable CatMark so the 1924-inspired cat personality appears in navigation, section dividers, shop edition stamps, and the footer without depending on library icons. The intro animation now uses GSAP with 9 placeholder portraits, staggered left/right portrait reveals, Mandakini Rao title timing, an Enter fade-out, and sessionStorage replay prevention. The homepage includes placeholder editorial data for works, shop, press, and newsletter sections until Sanity queries are wired; the client-specific hero remains intentionally blocked pending the hero concept and assets.

## Session June 7, 2026 — Loader and homepage hero refinement
Replaced the portrait-based intro with the client-sketched stacked-card loader: numbered rectangular canvas cards reveal from the center in tactile layers, then the loader fades out smoothly into the homepage. Updated the homepage hero to center the exact title "Welcome to the canvas of Mandakini Rao" inside a quiet editorial canvas-frame composition with top-left identity and a top-right hamburger menu. Added a reusable global CSS canvas texture using low-opacity gradients and grain-like pseudo-elements so the loading screen, homepage, and future/light/dark page sections share the same warm artist-studio surface without adding image assets. The hamburger overlay now exposes Home, Works / Projects, Shop, Workshops, About, and Contact while leaving unrelated CMS, shop, route, and data work untouched.

## Session June 12, 2026 — About section rebuild (parallax portrait + line + CTA)
Task: Rebuild the homepage About section (section 2, directly after the hero). Read PROJECT.md and PROGRESS.md first. Touch only the About section component and its styles. Remove the existing moving/marquee text entirely including any GSAP tweens, ScrollTriggers, or ticker logic. New structure: two-part editorial composition — portrait image with parallax (masked container with generous border-radius, image scaled ~1.15 translating vertically on scroll via GSAP ScrollTrigger tied to Lenis, scale-inside-mask reveal 1.3 → 1.15) and a text block (one strong descriptive placeholder line in the display face at clamp ~2rem–3.5rem, standard clipped line reveal, pill CTA "About Mandakini" → /about, 1px border default, rosehip #792318 fill with cream text on hover). Desktop: asymmetric ~40–45% image with vertically offset text; mobile stacked, parallax reduced/disabled. Hard constraints: no grain, no square/boxy elements, no blues, existing palette and master ease only, do not break the hero. On completion update PROGRESS.md and append this prompt to PROMPT_LOG.md.

## Session June 12, 2026 — Cursor quickTo refactor (Prompt 1 of 2)
Fix the custom cursor so it tracks smoothly without sticking: drive exclusively with GSAP quickTo() x/y transforms (never top/left), mousemove only updates targets, no React re-renders, element position:fixed at document root outside Lenis/transformed ancestors, pointer-events:none + will-change:transform, expanded state via scale/opacity on the same element, verify during Lenis scroll, hide entirely on touch. Constraints: no grain, circular only, no blues, master ease. Update PROGRESS.md and PROMPT_LOG.md.

## Session June 12, 2026 — Studio Journal social section (Prompt 2 of 2)
Add a "Studio Journal" homepage section between the works grid and footer with curated Instagram posts (custom-rendered from Sanity — decision: no Meta embeds) and YouTube videos. Part A: socialPost Sanity schema (platform instagram|youtube, image, caption, url, youtubeId, order). Part B: cream section, display heading with clipped line reveal, asymmetric editorial grid of 4–6 rounded items; IG cards link out with hover scale + caption + "View on Instagram"; YouTube uses the facade pattern (thumbnail + circular play; youtube-nocookie iframe only on click); whole section lazy via IntersectionObserver; bare Instagram/YouTube profile links below; mobile single column. Constraints: no grain, no squares, no blues, palette + master ease only, no third-party embed scripts, fully lazy. Update PROGRESS.md and PROMPT_LOG.md.

## Session June 12, 2026 — Private Collection enquiry flow
Build the Private Collection gated enquiry (no artwork shown anywhere): Sanity `enquiry` schema (name/email/phone/message/budgetRange/submittedAt/status new|responded|closed); a quiet dark (#2C1A0E/cream) typographic Shop section with "The Private Collection" heading, placeholder supporting line, pill "Enquire to View" (terracotta hover); CTA opens a slide-in panel form (rounded fields, rosehip focus + gentle errors, honeypot + min-time spam checks, no CAPTCHA, pill "Request the Collection", success state replaces form); Next.js route handler validates server-side, writes the Sanity document, sends two Resend emails (notification + warm confirmation, placeholder copy), shows success even if email fails post-write, modest per-IP rate limit. Constraints: no grain, no boxy shapes, no blues, palette + master ease only, absolutely no private collection imagery/filenames/titles anywhere. Update PROGRESS.md and PROMPT_LOG.md.

## Session June 12, 2026 — Cursor rip-and-replace
Delete the existing custom cursor entirely and rebuild: one component portaled to document.body (never inside Lenis/transformed ancestors), single div + label span, position:fixed top/left 0, pointer-events none, will-change transform, gsap.quickTo x/y (~0.5s power3.out) fed by one mousemove listener, xPercent/yPercent -50 set once, no React state/rAF/top-left writes; hover via one delegated pointerover/out on document reading [data-cursor]/[data-cursor-label], scale+opacity tweens on the same element; re-add data-cursor to work cards and featured strip; hide when (pointer:fine) doesn't match and on blur/document mouseleave; native cursor stays visible; verify checklist (Lenis scroll tracking, mid-animation hover, route changes, body child, no duplicates/errors). Constraints: no grain, circular, no blues, master ease. Update PROGRESS.md and PROMPT_LOG.md.

## Session June 12, 2026 — Codebase audit & cleanup
Task: Audit and clean the codebase. No new features. No visual changes except the removals listed. Read PROJECT.md and PROGRESS.md first. Remove the Studio Journal section entirely: component, styles, its Sanity socialPost schema, queries, and any lazy-load wiring. It is deprioritized; do not leave it commented out, delete it. Fix duplicated social links: Instagram/YouTube links currently render in the footer AND again at the bottom of pages. Find the duplication (likely a component mounted in both footer and a page layout). Keep them ONLY in the footer. Remove all other instances. Dead code pass: remove unused components, unused imports, orphaned GSAP tweens/ScrollTriggers from deleted features (old marquee, old cursor, old enquiry concepts), unused styles, unused Sanity schemas/fields, and unused dependencies in package.json. Consistency pass: confirm a single source of truth exists for colors, master ease, and timing scale as CSS/JS tokens. If any component hardcodes hex values or easing, refactor it to use the tokens. List every file changed. Run the site after cleanup and confirm: homepage loads, all routes render, no console errors, animations on the homepage are intact. Do not redesign anything. On completion update PROGRESS.md with a "Cleanup" entry listing removals, and append this prompt to PROMPT_LOG.md.


## Session June 12, 2026 — Navigation reliability & footer reveal fixes
Task: Fix page-to-page navigation and the footer MANDAKINI reveal on non-home pages. Bug fixes only. Read PROJECT.md and PROGRESS.md first. Touch only: navigation/menu component, route transition logic, footer component, and Lenis/ScrollTrigger initialization. Navigation: page-to-page navigation is unreliable. Audit and fix so that: every nav/menu link uses Next.js <Link> (no full reloads); the menu closes cleanly on navigate; scroll position resets to top on new routes; and Lenis + ScrollTrigger are properly destroyed and re-initialized (or refreshed via ScrollTrigger.refresh()) on every route change. Stale ScrollTrigger instances from a previous page must not survive navigation; this is the most likely root cause, verify and fix it structurally, not per-page. Footer reveal: the large MANDAKINI name in the footer animates correctly on the homepage but fails on other pages. Diagnose why (almost certainly the trigger is created before content has laid out, or is bound to homepage-only markup, or is killed by the navigation issue above). Fix so the footer is one shared component whose reveal works identically on every route, including after client-side navigation. Test: home → works → shop → about → contact, scrolling to the footer on each, in one session without refreshes. Confirm with a checklist in PROGRESS.md: nav works from every page to every page, footer reveal fires on all routes, no duplicate Lenis instances, no console errors. No grain, no boxy elements, no blues, master ease only. Update PROGRESS.md and PROMPT_LOG.md.

## Session June 19, 2026 — About page rebuild (3 sections)

Rebuilt /about from scratch as three stacked sections. (1) **aboutPage schema** extended with three new optional field groups: HERO (heroLeadIn, heroDisplayWord, heroSubhead, heroLeftImage, heroRightImage); BODY (bodyParagraph, edgeWords[], seriesTitles, colophon); ABOUT-BLOCK (aboutBlockBio, aboutBlockPortrait). Legacy fields kept for backward compatibility. `aboutPageQuery` in queries.ts extended to project every new field. `AboutData` type in `AboutSection.tsx` updated with all new optional fields + a new exported `EdgeWord` type. (2) **Section 1 — `AboutHero`**: cream section with 3-column grid (left arch | centre text | right arch). Each painting clipped to a soft rounded arch via SVG clipPath `id="mandakini-arch-hero"`. Entrance-only GSAP animation: arches fade+rise, display word slides up from `overflow:hidden` parent (same technique as the existing name reveal in AboutSection), terracotta brushstroke draws on via `stroke-dashoffset` tween (no DrawSVGPlugin dependency). `body.about-page` class set here (nav fix). (3) **Section 2 — `AboutEdgeWords`**: cream section, `overflow-x: clip`, `min-height: 200vh`. bodyParagraph fragments in a fractured 3-column grid (mirrors `.about-text-row` pattern). edgeWords absolutely positioned, scroll-driven x drift (`ease: none`, scrub 0.6), settled while still partially off-frame; depth encodes opacity (faint=back, solid=front) and scroll-start stagger (each word i starts at `top+=${i*90}`). seriesTitles bottom-left, colophon bottom-right; both label-font. (4) **Section 3 — `CanvasCards`** reused unchanged except for two optional backward-compatible props (`ctaHref`, `ctaLabel`); on /about these are `"/contact"` and `"Say hello"`. Homepage call site passes no props so defaults (/about, "About Mandakini") apply — homepage panel is visually and behaviorally identical. Decisions made: symmetric arch columns; brushstroke via dashoffset; all-cream Section 2; contact CTA on /about. `tsc --noEmit` clean, `npm run build` passes (16/16 static pages, /about = 7.4 kB).

## Session June 13, 2026 — Commerce Phase 2 build

Phase 2 prompt specified: all new UI must consume Phase 1 tokens; product schema to add price/stripePriceId/stock/purchaseType; order schema; product UI (flag ON) showing Mailendra price + Add to Cart + Buy Now pills + Sold state; cart as React context + slide-in drawer (cream/deep cacao tokens, never boxy); checkout route creating Stripe sessions with server-side price validation; idempotent webhook creating Sanity orders, decrementing stock, and sending order confirmation email; thank-you page; all Stripe paths guarded against missing env. Hard constraints: no grain, no square/boxy elements, no blues, master ease only, do not touch hero/loader/about/cursor/Private Collection.

On exploration, the vast majority of Phase 2 was already implemented from prior sessions: lib/commerce.ts, lib/cart.tsx, lib/stripe.ts, BuyControls.tsx, CartDrawer.tsx, /api/checkout, /api/stripe/webhook, emails/orderEmails.ts, thank-you page shell, Sanity schemas (shopItem had purchaseType/stock/basePrice/stripePriceId; order schema was complete). The CartProvider and CartDrawer were already wired into the site layout behind the commerce flag.

What was missing: (1) all CSS for commerce classes (`.mr-buy*`, `.mr-cart__*`, `.mr-thanks*`) — classes were referenced in components but had zero rules; (2) ShopIndex did not receive the `commerceEnabled` prop or render BuyControls; (3) ProductDetail always showed "Enquire to purchase" regardless of the flag; (4) ShopPage and ProductPage did not call `commerceEnabled()`.

Implemented: added commerce CSS block to globals.css (Phase 1 tokens only; cart panel uses `--v2-night` deep cacao + `--ink-cream` per the cream/deep cacao token requirement; Mailendra via `--font-label` on `.mr-buy__amount`; cart chip z-index raised to 310 to clear the loader at 300); wired `commerceEnabled` prop through ShopPage → ShopIndex (article card structure with separate image link + BuyControls when on, original Link card when off); wired `commerceEnabled` prop through ProductPage → ProductDetail (BuyControls replaces "Enquire" CTA when on). TypeScript clean, build passes, all routes 200.

---

## PROMPT VERBATIM — June 19, 2026 — About page rebuild (3 sections)

Read files/PROJECT.md and files/PROGRESS.md first, before any other file. This
prompt rebuilds the entire /about page into three stacked sections in one pass:
(1) a flanking-arch hero, (2) an edge-word scroll section, (3) a reuse of the
existing amber About panel. Work in the order below — schema, then Sections 1 & 2,
then Section 3 — and do not start the components until the schema compiles.

GLOBAL CONSTRAINTS (enforce throughout, do not deviate):
- No grain/noise anywhere. No blue anywhere. No boxy or square elements — arches,
  pills, circles, or bare text links only.
- Palette strictly via the existing CSS tokens (confirmed single-source in the
  June 12 cleanup); never hardcode hex. Cream #F5EFE4, deep cacao #2C1A0E,
  terracotta #B8572A, rosehip #792318, amber #C89839.
- Animation values come ONLY from lib/motion.ts (EASE='mandakini', DUR, STAGGER).
  GSAP + ScrollTrigger + Lenis only. No Framer Motion.
- GROQ lives only in sanity/lib/queries.ts (PROJECT.md §14). Never inline GROQ.
- Do not touch: homepage components, the loader, the cursor, Private Collection.
  The ONLY permitted change outside /about is one backwards-compatible prop added
  to CanvasCards (Section 3 below).
- Respect prefersReducedMotion() everywhere: no scrub drift; show settled states.

STEP A — SCHEMA & DATA: Extend aboutPage schema with HERO, BODY, ABOUT-BLOCK
field groups. Extend aboutPageQuery. Update AboutData type.

STEP B — SECTIONS 1 & 2: AboutHero (flanking arch columns, centred display word,
brushstroke via stroke-dashoffset), AboutEdgeWords (fractured body text, parallax
edge words with depth/opacity/stagger, footer labels). overflow-x: clip required.

STEP C — SECTION 3: Reuse CanvasCards with backwards-compatible ctaHref/ctaLabel
props. On /about pass ctaHref="/contact" ctaLabel="Say hello".

---

## PROMPT VERBATIM — June 19, 2026 — Header logo enlarged ~1.5×

Read files/PROJECT.md and files/PROGRESS.md first. Single targeted change: make
the header logo ~1.5× bigger. No other visual or behavioral changes.

Touch only:
- components/layout/Navigation.tsx
- the stylesheet holding .site-logo / .site-logo__img rules (globals.css or
  v2.css — grep for `.site-logo__img` and edit where the displayed size is set)

The logo is the shared site-wide nav mark (Next/Image at /art/logo/logo-cream.png
and logo-cacao.png), currently intrinsic 80×44, theme-aware cream/cacao swap.

Do:
1. In Navigation.tsx bump BOTH <Image> intrinsic dimensions from width={80}
   height={44} to width={120} height={66} (same 20:11 ratio, 1.5×) on both the
   --cream and --cacao images, so Next/Image serves a sharp asset.
2. In CSS, find where .site-logo__img (or .site-logo__mark) sets its rendered
   size and scale it ~1.5×. If it currently has no explicit size and relies on the
   intrinsic px, add an explicit height (e.g. height: 66px; width: auto) so the
   render is controlled and consistent. Use the existing spacing tokens/rhythm;
   don't introduce magic numbers elsewhere.
3. Responsive cap: ensure the larger logo does NOT crowd the hamburger/menu or
   overflow the header on small screens. Add/keep a mobile clamp so it scales down
   gracefully (e.g. a clamp() on height, or a max at the existing mobile
   breakpoint). The nav must not wrap or collide at 380px.

Constraints: no grain, no blue, no boxy elements, palette tokens only, master
ease/timing only (this change shouldn't add animation). Don't alter the
cream/cacao theme-swap logic, the scrolled state, or menu behavior.

Verify: logo is visibly ~1.5× larger on desktop across all routes (it's one
shared component, so check home + one inner page); crisp (not upscaled-blurry);
header layout intact at 1440 / 768 / 380px with no collision or wrap; no console
errors; nav links and menu still work.

On completion update files/PROGRESS.md ("Header logo enlarged ~1.5×") and append
this prompt verbatim to files/PROMPT_LOG.md.
