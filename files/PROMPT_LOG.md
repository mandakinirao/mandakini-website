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

---

## PROMPT VERBATIM — June 19, 2026 — About split: homepage teaser + amber panel to /about

Read files/PROJECT.md and files/PROGRESS.md first. This splits the current
homepage amber About panel into two things: a SMALL text teaser that stays on the
homepage, and the FULL amber panel which moves to become the /about page. Goal:
reduce homepage heaviness/whitespace while keeping one human "about" beat on the
homepage, and give the amber block room on its own page.

GLOBAL CONSTRAINTS: no grain; no blue; no boxy/square elements EXCEPT the existing
amber panel (client-approved exception, reuse as-is); palette via existing CSS
tokens only — no hardcoded hex; animations only from lib/motion.ts (EASE=
'mandakini', DUR, STAGGER); GSAP+ScrollTrigger+Lenis only; GROQ only in
sanity/lib/queries.ts (PROJECT.md §14); respect prefersReducedMotion(). Do not
touch loader, cursor, Private Collection.

Current state for reference:
- components/home/v2/CanvasCards.tsx is the amber panel (rounded-mask parallax
  portrait + single display bio line + PillCta href="/about" "About Mandakini").
  Props: bio (string), portrait (string).
- It is mounted in components/home/v2/HomeExperienceV2.tsx as
  <CanvasCards portrait={aboutPortrait} bio={aboutBio} />, order: HeroScene →
  CanvasCards → StripeBand → RisingSunWorks → ...
- /about (app/(site)/about/page.tsx) currently renders AboutSection from the
  aboutPage singleton.

──────────────────────────────────────────────
STEP A — Sanity fields
──────────────────────────────────────────────
In sanity/schemas/aboutPage.ts add (all optional; do not touch existing
homeSnippet):
  - aboutTeaserLine (string) — the short line shown in the homepage teaser
  - aboutBlockBio (text, rows 5) — the longer bio for the amber panel on /about
  - aboutBlockPortrait (image, hotspot:true, + alt string)
# DECIDE: teaser line and panel bio are separate so the homepage shows a short
# hook and /about shows the full bio. If you'd rather reuse one string, point both
# at aboutBlockBio.
Extend the existing aboutPageQuery in sanity/lib/queries.ts to project all three
(portrait as `{ ..., alt }`). Update the AboutData type to include them as
optional so tsc stays green.

──────────────────────────────────────────────
STEP B — Homepage: replace amber panel with a small teaser
──────────────────────────────────────────────
Create components/home/v2/AboutTeaser.tsx — a LIGHT section (no amber field, no
portrait, no rounded box):
  - One display-font line (Staff Regular display token) = aboutTeaserLine.
  - A PillCta href="/about" label "About Mandakini".
  - The pill uses TERRACOTTA (#B8572A via its token) as its one warm accent —
    this is the deliberate bit of color Mandakini asked for. Everything else in
    the teaser is cream/cacao tokens. Do NOT also add an amber underline; one
    accent only.
  - Reveal: reuse the existing revealLines helper for the line (scrollTrigger,
    start ~'top 75%') and a small DUR.fast/EASE fade-up for the pill — mirror the
    motion CanvasCards already uses; invent nothing new.
  - Comfortable but compact vertical padding using the existing section rhythm;
    this section should feel like a quiet beat, not a tall block.
In HomeExperienceV2.tsx: replace <CanvasCards .../> with <AboutTeaser
line={aboutTeaserLine} /> in the same position (after HeroScene, before
StripeBand). Pass aboutTeaserLine through from props/HomeData (see Step D).
Remove the CanvasCards import from HomeExperienceV2 (it will now be used only by
/about). Ensure no layout gap, leftover spacer, or broken ScrollTrigger where the
panel was.

──────────────────────────────────────────────
STEP C — /about becomes the full amber panel
──────────────────────────────────────────────
Rewrite app/(site)/about/page.tsx to render ONLY <CanvasCards>, fed from the
aboutPage singleton; remove the <AboutSection> render and import (keep the page's
metadata export).
  - bio = aboutBlockBio; portrait = aboutBlockPortrait resolved to a URL via
    urlForImage (sanity/lib/image) in the server component, fallback
    '/art/about-portrait.jpg' if empty.
  - CanvasCards' PillCta is a self-link on /about. Add OPTIONAL backwards-
    compatible props ctaHref/ctaLabel to CanvasCards (defaults '/about' /
    'About Mandakini' so homepage usage — now the teaser — and any other caller
    are unaffected). On /about pass ctaHref="/contact" ctaLabel="Say hello".
    This is the ONLY change permitted to CanvasCards.
  - Center the panel with the same section padding rhythm CanvasCards uses on the
    homepage so it isn't a lonely block in whitespace; invent no new scale.

──────────────────────────────────────────────
STEP D — data plumbing
──────────────────────────────────────────────
In lib/home-data.ts, make aboutTeaserLine available to HomeExperienceV2: source
it from the aboutPage singleton (aboutTeaserLine; fall back to homeSnippet, then
empty string). You may keep the existing aboutBio/aboutPortrait in HomeData for
now even though the homepage no longer renders the amber panel — do NOT rip out
that plumbing in this prompt (out of scope; a later cleanup can). Just ensure
aboutTeaserLine flows to the new teaser.
# Do NOT delete AboutSection, the orphaned hero/descriptionLines/quote fields on
# aboutPage, or homeSnippet in this prompt — this is the "see if the simpler
# version looks right" step. A single later cleanup prompt removes dead code once
# you confirm the design.

──────────────────────────────────────────────
VERIFY:
- `npx tsc --noEmit` clean; production build passes.
- Homepage: hero → small About teaser (display line + terracotta pill) → stripe →
  works. No amber panel on the homepage, no gap/console error. Teaser pill is
  terracotta; rest cream/cacao.
- /about: renders only the amber panel, centered, no excess whitespace; CTA →
  /contact "Say hello"; parallax + reveal fire on CLIENT-SIDE navigation to
  /about (don't regress the June 12 nav/ScrollTrigger.refresh fix).
- Cursor, loader, and other homepage sections unchanged.

On completion update files/PROGRESS.md ("About split: homepage teaser + amber
panel moved to /about; terracotta teaser pill") and append this prompt verbatim
to files/PROMPT_LOG.md.

---

## Session June 20, 2026 — Testimonials section

**Files created:**
- `sanity/schemas/testimonial.ts` (reconciled — see below)
- `components/Testimonials.tsx`
- `styles/testimonials.css`

**Files touched:**
- `sanity/lib/queries.ts` — updated existing `testimonialsQuery` (sort field `displayOrder` → `order`; added `_id`, `role` to projection)
- `components/home/v2/HomeExperienceV2.tsx` — added `<Testimonials items={testimonials} />` directly above `<MarqueePress>` (mount location: `components/home/v2/HomeExperienceV2.tsx`, between `<ContactStage />` and `<MarqueePress>`)
- `lib/home-data.ts` — `HomeTestimonial` type extended with `_id?` and `role?` (not in the original files-to-touch list; updated because the TypeScript fetch type needed to match the new query projection)

**Pre-existing testimonial schema reconciliation:**
- Schema already existed at `sanity/schemas/testimonial.ts` (registered as `testimonialSchema`, exported named export, registered in `sanity/schemas/index.ts`)
- Existing fields: `quote` (rows 3), `author`, `displayOrder` (number, initialValue 99)
- Missing fields added: `role` (string), `order` (number) — `displayOrder` renamed to `order` (no data existed so no migration needed)
- Updated: rows 4, title 'Testimonials', added `orderings`, updated preview subtitle to `role`
- `testimonialsQuery` already existed sorting by `displayOrder`; updated to sort by `order asc, _createdAt asc` and project `_id, quote, author, role`

**Real `@/lib/motion` export names used:**
- `EASE` = `'mandakini'` ✓ (same name as prompt)
- `DUR.fast` (0.6 s) — prompt used `DUR.sm` (remapped)
- `DUR.base` (1.0 s) — prompt used `DUR.md` (remapped)
- `prefersReducedMotion()` — used directly from `@/lib/motion` instead of `window.matchMedia` inline check

**CSS token names remapped:**
- `--color-cream` → `--bg-cream`
- `--color-cacao` → `--ink-cacao`
- `--color-terracotta` → `--accent-terracotta`
- `--color-rosehip` → `--accent-rosehip`
- `--font-script` → `--font-accent` (Konya script is `--font-accent` in this project)
- `--font-display`, `--font-label` matched directly

**CSS import convention:** imported inside `components/Testimonials.tsx` (`import '@/styles/testimonials.css'`) — matches Next.js App Router pattern used by other style sheets.

---

## Session June 20, 2026 — Footer social hover previews

**Files touched:**
- `sanity/schemas/siteSettings.ts` — added two new string fields: `instagramHandle` ("Instagram Display Handle") and `youtubeChannelName` ("YouTube Channel Name"). Placed immediately before the existing `socialLinks` object. No existing fields renamed or removed. The existing `socialLinks.instagram` and `socialLinks.youtube` URL fields were left intact (they are separate concerns — URL routing vs. display label).
- `sanity/lib/queries.ts` — added new `footerSocialQuery` export: `*[_type == "siteSettings"][0] { instagramHandle, youtubeChannelName }`. Extended as a new named export; existing `siteSettingsBasicQuery` untouched.
- `app/(site)/layout.tsx` — made `async`; static imports of `client` and `footerSocialQuery` added; fetch with `{ next: { revalidate: 3600 } }` and `.catch(() => null)` fallback; `instagramHandle` and `youtubeChannelName` passed as props to `FooterV2`.
- `components/home/v2/FooterV2.tsx` — module-level `SocialLink` sub-component added (not nested inside the default export); `FooterProps` type added with two optional string props; `SocialLink` renders the handle card as a direct child of `<a>` (valid HTML5 flow content inside block anchor); GSAP `autoAlpha` + `y` on mouseenter/mouseleave; `isTouch()` JS guard in handlers; card hidden via CSS `@media (hover: none), (pointer: coarse)` as second-layer guard.
- `app/v2.css` — added `.mr2-social-link` and `.mr2-social-card` rules immediately after `.mr2-footer__col a:hover`; media query `(hover: none), (pointer: coarse)` applies `display: none` to `.mr2-social-card`.

**Href verification result:**
- WRONG before this session: Instagram was `https://instagram.com/`, YouTube was `https://youtube.com/`.
- Corrected to: `https://www.instagram.com/mandakini_rao/` and `https://www.youtube.com/@mandakinirao` per prompt spec. Flagged and fixed.

**Sanity fields used/added:**
- `instagramHandle` — new field, type `string`. Seeded: `@mandakini_rao`. Published to production.
- `youtubeChannelName` — new field, type `string`. Seeded: `@mandakinirao`. Published to production.
- Pre-existing `socialLinks` object reused for URL routing only; not duplicated.

**Card color/font choice:**
- Card background: `--v2-cream` (`#f5efe4`) — light pill floats against the dark footer (`--v2-bg: #0d0a07`).
- Card text: `--v2-night` (`#0d0a07`) — near-black on cream, excellent contrast.
- Accent: `border-top: 2px solid var(--accent-terracotta)` — thin terracotta stripe at the card top, the editorial accent moment.
- Font: `--font-label` (Mailendra, fallback Cormorant SC) — quiet label voice appropriate for a handle, legible at 11px.
- No grain, no blue, no hard rectangle, no borders beyond the terracotta accent.

**Motion exports used:**
- `EASE` = `'mandakini'` (master ease, cubic-bezier 0.25,1,0.5,1)
- `DUR.fast` = 0.6s — both enter and leave transitions use this
- `prefersReducedMotion()` — instant show/hide via `mandaGsap.set` when true, no tween
- `isTouch()` — JS guard: `window.matchMedia('(hover: none), (pointer: coarse)')` — if true, handlers return early, no GSAP tween fires

**Desktop guard method (two layers):**
1. JS: `isTouch()` check at the top of `onEnter` (and bail in `onLeave`), preventing GSAP from running on touch devices even if a mouseenter fires (e.g. iOS hover simulation bugs).
2. CSS: `@media (hover: none), (pointer: coarse) { .mr2-social-card { display: none; } }` — card is structurally invisible on touch devices regardless of any JS.
