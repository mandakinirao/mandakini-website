# Progress Log

## Contact email updated to mandakinirao@gmail.com everywhere (2026-07-03)
- **Date:** 2026-07-03
- **Branch:** none — small, low-risk config change made directly (no visual/behavioral change to verify beyond the address itself).
- **Audit:** every mailto/contact/enquiry email destination in the codebase traced back to two sources, both defaulting to the old placeholder `studio@mandakinirao.com`:
  - `lib/site-settings.ts` `DEFAULTS.contactEmail` — feeds the `/contact` page's direct `mailto:` link and, via `app/(site)/shop/page.tsx` → `PrivateCollection` → `EnquiryForm`, the Private Collection enquiry form's `mailto:` URL. No `siteSettings` document currently exists in Sanity (`perspective: 'published'` and `'raw'` both return zero documents), so this code default is what's actually live — not overridden by Studio content.
  - Three server API routes (`app/api/enquiry/route.ts`, `app/api/razorpay/webhook/route.ts`, `app/api/stripe/webhook/route.ts`) had the same placeholder as a fallback for Resend `from`/`to` addresses. None are currently active — no `RESEND_API_KEY` is set locally, so these email sends are already no-ops (enquiries are saved to Sanity's `enquiry` type instead); fixed the fallback anyway for correctness whenever Resend is wired up.
- **Change:** all 5 occurrences of `studio@mandakinirao.com` → `mandakinirao@gmail.com`.
- **Note surfaced, not acted on:** the `/contact` page actually renders **two** contact paths — a direct `mailto:` link (fixed here) *and* `ContactForm.tsx`, which POSTs to `/api/enquiry` (saves to Sanity, optionally emails via Resend) rather than using `mailto:` like its sibling `EnquiryForm.tsx` on the shop page. The two forms have different architectures since only the shop enquiry form got the "replace Resend with mailto" refactor (commit `4c5a99c`, 2026-07-01). Didn't unify them — that's a UX/architecture decision (server-saved vs. mail-client-popup), not just an email-address fix.
- **`enquiryRecipientEmail`** (a `siteSettings` schema field) is defined but never queried anywhere in the codebase — confirmed dead/orphaned, unrelated to any of the above. Not touched.
- **Verified:** `npm run build` clean; `/contact` page HTML confirmed to contain `mailto:mandakinirao@gmail.com`; `/shop` page HTML confirmed `contactEmail":"mandakinirao@gmail.com"` flowing to the enquiry form.

## Press grid — paired column layout (2026-07-03)
- **Date:** 2026-07-03
- **Branch:** `press-autofetch-masonry` (same branch as the press card work) — localhost-reviewed, approved, merged to `main`.
- **Problem:** the dense-packed bento grid (`grid-auto-flow: dense`, photo cards `grid-row: span 2`) placed cards wherever there was room, with no relationship between which cards ended up adjacent. Client wanted the Function Health reference pattern instead: each column is a pair of two *distinct* press items — one photo card, one logo/text card — and which one sits on top alternates from column to column (col 1: image-top/text-bottom, col 2: text-top/image-bottom, ...).
- **First attempt was wrong:** grouped items into column-pairs by raw sequence (`displayOrder`), which produced a column of two stacked photo cards next to a column of two stacked logo cards whenever adjacent items happened to share a mode — not the reference pattern. Caught via user screenshot comparison before committing.
- **Fix — `components/press/PressPage.tsx`:** replaced sequential pairing with `buildColumns()` — splits items into `photos` and `logos` arrays (mode-filtered, `displayOrder` preserved within each), then zips one from each into every column (`[photos[i], logos[i]]`). Guarantees each column pairs one of each kind; any surplus (unequal photo/logo counts) falls back to solo single-card columns. `GhostGrid` empty-state updated to the same paired-column shape.
- **CSS (`app/v2.css`):** `.mr2-press-bento` is now a plain 4-column grid of `.mr2-press-col` wrappers (flex column, `gap: 14px`), not a dense auto-flow grid — removed `grid-auto-flow: dense` / `grid-auto-rows`. `.mr2-press-col--reverse` (`flex-direction: column-reverse`) applied to every other column via `i % 2 === 1`, alternating which card is visually on top without touching DOM order. `.mr2-press-card--img` switched from `grid-row: span 2` to `aspect-ratio: 3/4` (now a standalone flex child, not a grid item spanning rows); `.mr2-press-card--logo` given `min-height: 240px` for a comparably "short" counterpart. Responsive breakpoints simplified to just column-count changes (900px→2 cols, 560px→1 col) — no more row-span overrides needed.
- **Verification:** temporarily published 4 demo `pressItem` documents (mixed photo/logo/podcast) to see the multi-column pattern with only 1 real item live; confirmed columns correctly pair distinct photo+logo items with alternating stack order via Chrome automation, then unpublished + discarded all demo drafts — production Sanity has only the real `telanganafirst.in` item.
- **No GSAP/motion or palette changes** — pure layout/CSS restructuring.
- **Build result:** ✓ zero errors, `/press` still static (○), 16 routes.

## Press card legibility fix — photo mode only (2026-07-03)
- **Date:** 2026-07-03
- **Branch:** `press-autofetch-masonry` (same branch as the card build — localhost-reviewed, approved).
- **Problem:** on the live `telanganafirst.in` card, the overlay text (ARTICLE label, source, READ) was nearly illegible over the photo — 10px uppercase text at 0.2–0.28em letter-spacing, and a scrim that maxed out at 0.92 opacity right at the card edge, disintegrated against a busy/pale image.
- **Fix, scoped to photo-mode (`.mr2-press-card--img`) only — no JSX changes, CSS only:**
  - Headline (`.mr2-press-card--img .mr2-press-card__title`): `clamp(0.88rem,1.1vw,1rem)` → `clamp(1.2rem,2vw,1.5rem)`, now the card's clear focal text; color pushed to near-full-opacity cream (0.9 → 0.97).
  - Label/source/CTA: font-size bumped (10px→11–12px), letter-spacing cut roughly in half (0.2–0.28em → 0.1em, "subtle" not "heavily tracked-out"), opacity raised (0.45–0.55 → 0.78–0.85).
  - Scrim (`.mr2-press-card--img::after`): re-tuned from a 3-stop `0.92→0.66→0.28→0` gradient to a 5-stop `0.97→0.88→0.56→0.18→0` gradient — a near-solid warm-cacao band under the text block, fading out by ~85% up the card. Still bottom-up, no hard edge, doesn't darken the whole photo (top ~15% untouched).
  - Overlay gap `0.35rem → 0.5rem` to give the now-larger text room to breathe.
- **Logo-mode untouched by construction:** headline/CTA scoping uses `.mr2-press-card--img` ancestor selectors specifically so `.mr2-press-card--logo` (and the `--dark` title/CTA variants it uses) can't inherit the change. Verified visually by temporarily toggling a demo item's `logoCard` flag — logo card renders identically to before.
- **Contrast:** cream text (~#F5EFE4) sits on an effectively near-solid cacao (~#2C1A0E) scrim band at the bottom of the card — comfortably exceeds WCAG AA even at the smaller label/source sizes.
- **Verification:** temporarily published a demo `pressItem` (Wikipedia, with a headline) to confirm the headline-specific sizing, since the one real press item currently has no headline set (client added a `thumbnailOverride` + manual `source` since the last session, still no `headlineOverride`). Confirmed on `npm run build && npm start` via Chrome automation, then unpublished + discarded the demo draft — only the real `telanganafirst.in` item remains live.
- **No GSAP/motion/palette changes** — pure CSS sizing/spacing/color, same warm-cacao family already in use.
- **Build result:** ✓ zero errors, `/press` still static (○), 16 routes.

## Press build-time auto-fetch + masonry card design (2026-07-03)
- **Date:** 2026-07-03
- **Branch:** `press-autofetch-masonry` — localhost-reviewed, approved, ready to push.

### Part 1 — Build-time metadata fetch (fixed a stale-field bug, not a from-scratch build)
- **Root cause of the empty-card bug:** the 2026-06-23 schema restructure renamed `pressItem` fields (`url`→`link`, `titleOverride`→`headlineOverride`, `imageOverride`→`thumbnailOverride`, `sourceOverride`→`source`, `order`→`displayOrder`) but `sanity/lib/queries.ts` (`pressItemsQuery`) and `lib/press.ts` were never updated. The GROQ query was pulling fields that no longer exist, so every press item resolved to blank headline/thumbnail/source — hence the live-site card showing only "ARTICLE"/"READ".
- **Where it runs:** server-side only, in the async Server Component `app/(site)/press/page.tsx` (ISR, `revalidate = 3600`) and in `getHomeData()` for the homepage ticker. No client-side fetch.
- **`lib/press.ts` rewritten:** `RawPressItem`/`EnrichedPressItem` fields renamed to match the current schema. Precedence implemented exactly as specified: `headline = headlineOverride ?? fetched ?? null`, `thumbnail = thumbnailOverride ?? fetched ?? null`, `source = source ?? fetched(site_name ?? hostname) ?? null`. YouTube/video links use oEmbed first (`fetchFromYoutubeOembed`); everything else uses OG tag scraping (`fetchFromOg`). Both wrapped in `fetchWithTimeout` (5s) + try/catch — any failure returns `{}`, never throws, never blocks the build.
- **`sanity/lib/queries.ts`:** `pressItemsQuery` field list and `order by` fixed to current schema names.
- **`lib/home-data.ts`:** ticker mapping updated to `p.headline`/`p.url`; items missing a headline or source are filtered out of the ticker only (the /press grid still renders them via logo-mode).

### Part 2 — Masonry press card (two render modes)
- **Schema addition:** `pressItem.logoCard` (boolean, default off) — lets an editor explicitly flag a print/paywalled item whose uploaded image is a publication mark, not a photo. Mode is computed as `mode = logoCard || !thumbnail ? 'logo' : 'photo'` — avoids fragile image-shape heuristics.
- **`components/press/PressPage.tsx` rewritten:** `PhotoCard` (image fills the card, warm cacao bottom-up gradient scrim, headline + source overlaid, whole card links out) and `LogoCard` (cream card, circular mark — the uploaded logo image if present, otherwise a plain circular seal — headline + source as text, first-class layout not a broken-image fallback).
- **`app/v2.css`:** photo-card scrim changed from near-black `rgba(10,6,4,...)` to warm cacao `rgba(44,26,14,...)`, bottom-up, soft falloff. New logo-card block: `.mr2-press-card--logo`, `.mr2-press-card__mark` (circular per the site's pill/circle rule), `.mr2-press-card__mark--seal` (generic fallback when there's truly no image). Existing bento/masonry grid (photo cards span 2 rows, logo cards 1 row) retained.
- **Homepage ticker (`MarqueePress`) untouched** — same component, same behaviour; it now just receives correctly-populated data.

### Necessary security-config widening (flagged, not silent)
- Press thumbnails are auto-fetched from arbitrary outlet domains (regional news sites, `i.ytimg.com`, etc.) — impossible to enumerate in advance. Two configs from the 2026-06-26 CSP-hardening commit had to widen:
  - `next.config.js` `images.remotePatterns`: added a `https: **` wildcard entry alongside the existing `cdn.sanity.io` one (Next's Image component throws for unconfigured hostnames).
  - CSP `img-src`: `'self' data: https://cdn.sanity.io` → `'self' data: https:`.
- Everything else in the CSP (script-src, connect-src, etc.) is untouched.

### Demo content added for localhost review
- Two `pressItem` documents added directly via Sanity MCP for the review (not part of the code change): one plain auto-fill (Wikipedia — Madhubani art, no overrides) and one text-override-only (headline + source set by hand, no thumbnail → logo mode). The pre-existing `telanganafirst.in` item was left untouched as the natural "auto-fetch failed gracefully" case. All three states confirmed working on localhost (`npm run build && npm start`) — the /press bento grid shows: (a) auto-filled photo card, (b) override-driven logo card, (c) graceful no-data logo card with generic seal.
- **Note:** dev mode (`next dev`) has a pre-existing, unrelated issue — the CSP `script-src` (no `unsafe-eval`) blocks React Fast Refresh's HMR runtime, throwing console `EvalError`s on every hot reload. Doesn't affect production builds (no eval in prod React) or this feature; not fixed here as it's outside this task's scope. Worth a dedicated follow-up.

### Build result
- ✓ `npm run build` — zero errors, `/press` still prerenders static (○), 16 routes.

## Hero full-bleed + loading morph + nav update (2026-07-01)
- **Date:** 2026-07-01
- **Branch:** `hero-nav-update` — not yet merged. Awaiting localhost review + oval pick.
- **Commit:** none yet — STOP point after Parts 1–5

### Part 1 — Full-screen ink-reveal hero
- Removed `clip-path: inset(14% 8% 12% 8% round ...)` from `.mr2-hscene__clip` in `app/v2.css`. Hero is full-bleed, edge to edge.
- `.mr2-hscene` background changed from `var(--v2-bg)` to `#2C1A0E` (warm cacao fallback, no cream mat).
- `.mr2-home__content` rounded-top-edge overlay pattern retained.
- `InkReveal.tsx` brush constants: `BRUSH_R` 130→190, `BRUSH_VARY` 50→70 for full-viewport feel.

### Part 2a — Logo oval at top centre (3 options for review)
- `HeroScene.tsx`: `.mr2-hero-ovals` container with three labelled variants (A/B/C) at top centre, z-index 20.
- All three are solid `#F5EFE4` cream fill — logo always legible over the reveal image.
- `data-hero-oval` on the primary oval (A) — the loading-screen morph targets this element.
- **Option A — Pendant:** `1px solid #2C1A0E`, padding `18–28/28–44px`, logo `40–60px`.
- **Option B — Coin:** `2px solid #2C1A0E`, padding `12–18/18–28px`, logo `34–50px`.
- **Option C — Seal:** no border, `box-shadow: 0 2px 18px rgba(44,26,14,0.22)`, padding `24–36/40–58px`, logo `46–70px`.
- A/B/C labels shown in cream for comparison; remove unused options after pick.

### Part 2b — Artist name centered + warm gradient scrim
- `HeroScene.tsx`: `.mr2-hscene__scrim` element added as sibling to `.mr2-hscene__text` (at z-index 5, between vignette z-2 and text z-10).
- `v2.css`: Scrim is a radial gradient centered at the same `top: 62%` position as the text — `rgba(44,26,14,...)` cacao tones, 4-stop falloff, no hard edge.
- Vignette updated from pure-black `rgba(0,0,0,...)` to warm cacao `rgba(44,26,14,...)` to match.
- Name is horizontally centered (`left:50%; transform:translate(-50%,-50%); text-align:center`) throughout.

### Part 3 — Loading screen morphs into hero
- `LoadingScreenStripes.tsx` rewritten: dark `#1A0D06` field, logo oval (`.mr2-hero-oval--a` classes), artist name, Enter pill.
- Entrance: staggered fade-in of oval → name → button (delay 0.35s, DUR.base, EASE).
- On Enter (GSAP timeline, no Framer Motion):
  1. Enter button fades up and out (0.32s)
  2. Loader field lifts to `transparent` (DUR.grand) — hero reveals beneath
  3. **Oval travel:** measures loader oval rect + `[data-hero-oval]` rect; loader oval translates+scales to hero position; crossfade at end of travel
  4. **Name travel:** HERO name element (`[data-hero-name]`) is placed at loader name's rect via GSAP set, then travels to its natural position (x:0, y:0, scale:1). Travel is primarily vertical since both are horizontally centred. Loader name fades in place.
- `HeroSceneHandle` extended: `playEntranceAfterMorph()` — animates only the tagline (name already placed by morph).
- `HomeExperienceV2.handleComplete` calls `playEntranceAfterMorph()` instead of `playEntrance()`.
- Returning visitors (sessionStorage flag): `playEntrance()` still animates name + tagline normally.
- `prefers-reduced-motion`: simple fade, no travel.

### Part 4 — Header hides on scroll-down, reveals on scroll-up
- `Navigation.tsx`: `navHidden` state, 6px dead zone, resets at `scrollY < 80` and when menu opens. Class `site-nav--hidden` applied.
- `globals.css`: `transform: translateY(-100%)` with `0.48s` transition. Reduced-motion: `opacity:0; visibility:hidden` (no transform).
- Logo oval is in the hero → belongs to the hero and disappears naturally as content scrolls over it.

### Part 5 — Press in hamburger menu
- `Navigation.tsx`: `{ label: 'Press', href: '/press' }` added between Shop and About.

### Build
- `✓ Compiled successfully — 15 routes, zero errors`

---

## Revalidation audit + webhook wiring (2026-06-26)
- **Date:** 2026-06-26
- **Commit:** docs-only (this entry)
- **Task:** Confirm `revalidatePath('/', 'layout')` coverage and document the on-demand revalidation architecture.

### Coverage confirmed
`app/api/revalidate/route.ts` calls `revalidatePath('/', 'layout')`. This purges the cache for every page that passes through `app/layout.tsx` (the root layout). All content pages are covered:

| Page | Route |
|------|-------|
| Homepage | `/` |
| Works listing | `/works` |
| Works detail | `/works/[slug]` (all slugs) |
| Shop listing | `/shop` |
| Shop detail | `/shop/[slug]` (all slugs) |
| Press | `/press` |
| About | `/about` |
| Contact | `/contact` |
| Thank-you | `/thank-you` |

`/studio/*` and `/admin` are excluded by design — they are not statically cached content pages.

The `(site)` route group is transparent to layout inheritance; all pages inside it still flow through the root layout. A single `revalidatePath('/', 'layout')` call is sufficient.

### Revalidation architecture
- **On-demand (primary):** Sanity webhook → POST `https://<domain>/api/revalidate` with `x-revalidate-secret` header matching `SANITY_REVALIDATE_SECRET` Vercel Production env var → `revalidatePath('/', 'layout')` → instant cache purge on every publish.
- **ISR fallback:** `export const revalidate = 60` on all content pages (press: 3600). Pages regenerate in the background within 60 s of the next visit even if the webhook misses.
- **CDN:** `useCdn: false` in `sanity/lib/client.ts` — no Sanity CDN staleness on top of ISR.

### ⚠️ Open item — domain switch action required
When the site moves from `*.vercel.app` to `mandakinirao.com`, the Sanity webhook URL in `sanity.io/manage → API → Webhooks` **must be updated** to the new domain. If the webhook URL is not updated, Sanity publishes will silently stop triggering revalidation and the site will fall back to ISR-only (60 s staleness). This is a manual step — it is not handled by Vercel domain assignment.

---

## Phase 3 — 404 page: breathing gradient + Lottie slot (June 2026)
- **Date:** 2026-06-24
- **Commit:** `02074fc`
- **Task:** Create the missing 404 page at `app/not-found.tsx` with a GSAP breathing gradient and a Lottie Persian cat placeholder.
- **Breathing gradient:** Four `position: absolute` radial-gradient blob divs in terracotta (`rgba(184,87,42,0.28)`), amber (`rgba(200,152,57,0.24)`), rosehip (`rgba(121,35,24,0.22)`), moss (`rgba(91,100,62,0.2)`). Each breathes via `mandaGsap.to({ scale: 1.22, yoyo, repeat: -1, ease: EASE_SINE })` at staggered 0.85s delays. Reduced motion: no animation.
- **Lottie:** `lottie-react` installed (v2.4.1). `LOTTIE_PLACEHOLDER` const holds a minimal empty Lottie JSON (renders nothing). Swap for actual Persian cat animation JSON when ready. Mounted `dynamic(() => import('lottie-react'), { ssr: false })` to avoid SSR.
- **Layout:** Full-viewport centered column — Lottie slot → "404" eyebrow → display heading → sub copy → PillCta home. Background uses `var(--v2-bg)` (cream). Page is outside `(site)` layout so no nav/footer — intentional for 404.
- **CSS:** `.mr-nf` block appended to `app/v2.css`.
- **Build result:** ✓ zero errors. 17 routes (new `/_not-found` static route).

## Phase 2 — Works index fixed-slot crossfade preview (June 2026)
- **Date:** 2026-06-24
- **Commit:** `cd5b34a`
- **Task:** Replace the cursor-following floating image on the Tier 2 works list with a fixed-position right panel that crossfades between per-series images on hover.
- **Removed:** `previewImgRef`, `quickTo x/y`, `pointermove`, `EASE_OUT` import, per-row pointerleave hide, scroll-event hide, single `<img>` with swapped `src`.
- **Added:** `slotRefs` array (one img ref per series), all stacked `position: absolute` in the preview panel. `pointerenter` on row i: fade out previous slot (0.2s), fade in new slot (0.35s), show panel on first hover. `pointerleave` on `.mr-windex__list`: fade all out (0.3s) — no flicker between adjacent rows.
- **Preview CSS:** Changed from `top: 0; left: 0` (cursor-positioned) to `right: clamp(2rem, 5vw, 6rem); top: 50%; transform: translateY(-50%)` (fixed right, vertically centred). Shadow lightened for cream stage.
- **Build result:** ✓ zero errors. 16 routes.

## Phase 1 — Dark theme removal (June 2026)
- **Date:** 2026-06-24
- **Commit:** `e39580e`
- **Task:** Collapse the dual dark/light theme system to a single permanent cream stage. Remove the theme toggle button and all dark-mode CSS.
- **ThemeV2.tsx:** Stripped to V1 guard only — sets `mr2-mode` on non-V1/non-Studio routes, removes stale `mr2-light` class. No localStorage, no toggling.
- **Navigation.tsx:** Removed `THEME_KEY`, `light` state, localStorage `useEffect`, `toggleTheme()`, and the `menu-overlay__theme` button JSX.
- **app/v2.css:** `:root` now holds cream-canonical token values (`--v2-bg: #f2ead9`, `--v2-fg: #221408`, etc.). Deleted `body.mr2-mode.mr2-light` block. Logo always shows cacao variant. Removed theme-toggle CSS blocks. `mr2-works__meta` changed from `mix-blend-mode: difference` + cream to `normal` + `var(--v2-fg)`.
- **app/globals.css:** Deleted `.menu-overlay__theme`, `.menu-overlay__theme:hover`, `.menu-overlay__theme-dot` CSS blocks. `body:not(.mr2-mode) .mrx-cursor` rule left untouched (V1 isolation).
- **styles/pages.css:** Stripped `body.mr2-mode.` prefix from all 9 page-wash selectors — they now apply unconditionally.
- **styles/about.css:** Stripped `body.mr2-mode.` prefix from 3 selectors (logo swap, amber override).
- **V1 isolation:** `mr2-mode` is still conditionally absent on `/?v=1` — `body:not(.mr2-mode)` cursor rule continues to fire correctly. No V1 selector was touched.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.

## Schema audit + restructure — Phase 3 (June 2026)
- **Date:** 2026-06-23
- **Scope:** Schema-only change. No front-end components or GROQ queries touched. Build verified clean after all changes.
- **New schemas:**
  - `sanity/schemas/homepage.ts` — `homepage` singleton; `heroRevealTop` + `heroRevealBottom` (both image + hotspot + alt, required). Replaces old `siteSettings.heroImages` array.
  - `sanity/schemas/about.ts` — `about` singleton; `portrait` (image + hotspot + alt), `bio` (portable text blocks), `pullQuote` (string). Replaces `aboutPage` type.
- **Modified schemas:**
  - `project.ts`: `images` → `gallery` (array of images with alt required on each); `year`: `number` → `string`; slug reserved validation (learn/classes/login/account); added `featuredOnHomepage` (boolean, default false), `homepageOrder` (number).
  - `shopItem.ts`: Images now have alt required. Added `price` (number), `description` (text), `displayOrder` (number), `featuredOnHomepage` (boolean, default false), `homepageOrder` (number). Old `desc`, `basePrice` fields and all legacy Stripe/commerce fields (`itemType`, `purchaseType`, `sizes`, `frameOptions`, `editionNumber`, `editionSize`, `sold`, `certificateIncluded`, `availabilityStatus`, `shippingInfo`, `stripeProductId`, `stripePriceId`, `stock`) kept in Studio with LEGACY labels pending explicit confirmation of removal.
  - `testimonial.ts`: `author` → `personName`; `order` → `displayOrder`; `role` removed.
  - `pressItem.ts`: `url` → `link`; `titleOverride` → `headlineOverride`; `imageOverride` → `thumbnailOverride`; `sourceOverride` → `source`; `order` → `displayOrder`; removed "Feature" from type list; added `featuredOnHomepage` (boolean, default false), `homepageOrder` (number).
  - `order.ts`: Rebuilt for Razorpay. Removed Stripe fields (`orderId`, `stripeSessionId`). `shippingAddress` changed from structured object → plain text. `items` array: now `{shopItem ref, quantity, priceAtPurchase}`. Removed `paymentStatus` + `fulfillmentStatus` → single `status` select [Paid/Shipped/Delivered/Cancelled] default Paid. `waybillNumber` → `awbNumber`. Added `orderNumber`, `razorpayPaymentId`, `createdAt`. Removed `courierProvider`, `shippedDate`, `orderDate`.
  - `siteSettings.ts`: Replaced 6-group / 23-field structure with 3-tab layout: Navigation (logo+alt, navItems array), Footer (footerText, instagramHandle default @mandakini_rao, youtubeHandle default @mandakinirao), Commerce (currency default INR, shippingNote, enquiryRecipientEmail, privateCollectionCtaLabel default "Enquire to view the private collection"). Old 22 siteSettings fields are now absent from the Studio — data still exists in documents but is not editable until migrated. Confirm removal.
  - `sanity/schemas/index.ts`: Added `homepageSchema`, `aboutSchema`. `aboutPageSchema` and `navigationSchema` kept (existing data / legacy type continuity).
  - `sanity.config.ts`: Desk structure reorganised into three tiers — Settings (Homepage/Site Settings/About singletons), Work (Projects/Press/Testimonials), Commerce (Shop Items/Orders/Enquiries) — plus catch-all for legacy types.
- **GROQ queries that need updating in the NEXT task** (`sanity/lib/queries.ts` — not touched here):
  - `testimonialsQuery`: `order(order asc)` → `order(displayOrder asc)`, `author` → `personName`, remove `role`
  - `pressItemsQuery`: all 5 field renames
  - `allSeriesQuery` + `featuredSeriesQuery`: `images` → `gallery`
  - `featuredShopItemsQuery` + `allShopItemsQuery` + `shopItemsBySlugsQuery`: `desc` → `description`, `basePrice` → `price`
  - `heroImagesQuery`: point at `*[_type == "homepage"][0]` with `heroRevealTop`/`heroRevealBottom`
  - `siteSettingsBasicQuery`, `footerSocialQuery`, `siteSettingsShopQuery`: update to new siteSettings fields; `youtubeChannelName` → `youtubeHandle`
  - `aboutPageQuery`: point at `*[_type == "about"][0]`, new field names
- **Data migrations needed before decommissioning old types/fields:**
  - Copy `aboutPage` documents → `about` (portrait, bio, pullQuote mapping)
  - Populate `homepage` singleton with hero images (was `siteSettings.heroImages`)
  - Copy `siteSettings.instagramHandle`, `youtubeChannelName` → new fields
  - Existing `project.images` data → needs GROQ query update to target `gallery` (data stored under `images` key in documents is unaffected at the API level)
- **Pending confirmation (await before deleting):** `aboutPage` schema, `navigation` schema, 22 orphaned siteSettings fields, legacy shopItem commerce fields.

## Sanity fixes — Studio crash + upload CORS (June 2026)
- **Date:** 2026-06-22
- **Studio crash fix (data):** Removed two zombie image items (`_key: 6eeed290155a`, `_key: 2255ce8860bc`) from the "London in Gouache" project document draft (`f56fd071-8dc9-4452-a30f-c123ef5a7145`). Items were stuck in `_upload: { progress: 100 }` state with no `asset` reference — caused `G.rebase` → `d.getAttribute` to throw "getAttribute only applies to plain objects" and crash the Studio structure tool on every load. Fix via Sanity MCP `patch_documents` unset. No code changes.
- **Upload CORS fix:** Added `http://localhost:3000` with `allowCredentials: true` to the Sanity project's CORS origins. Without this, the browser blocked all local dev Studio upload requests before they reached `api.sanity.io`. Production origin (`https://mandakini-website.vercel.app`) already had `allowCredentials: true`. Fix via Sanity MCP `add_cors_origin`. No code changes.

## Four-branch merge to main + Production deploy (June 2026)
- **Date:** 2026-06-22
- **Branches merged (in order):** `about-redesign` → `logo-size` → `press-reel-speed` → `page-color-washes`
- **Strategy:** Smallest/most-isolated first; large CSS branch last. Build run after each merge. Stop-on-conflict policy maintained — only `PROGRESS.md` and `PROMPT_LOG.md` conflicted (additive doc sections from the same ancestor), resolved by keeping both sides. No source-code conflicts on any merge.
- **Merge outcomes:**
  - `about-redesign` → fast-forward, zero conflicts. Build ✓.
  - `logo-size` → PROGRESS.md + PROMPT_LOG.md conflict (additive). Resolved. Build ✓.
  - `press-reel-speed` → PROGRESS.md + PROMPT_LOG.md conflict (additive). Resolved. Build ✓.
  - `page-color-washes` → PROGRESS.md + PROMPT_LOG.md conflict (additive). All code files (PageWash fix, moss 22%, shop data, ProductDetail guards, shop/page.tsx) merged cleanly. Build ✓.
- **Production push:** `git push origin main` → `78f1eba..784862c`. Vercel production deploy triggered.
- **Smoke test (local build, all 16 routes):** ✓ home (ƒ), /about (○), /works (○), /works/[slug] (ƒ), /shop (○), /shop/[slug] (ƒ), /contact (○), /press (○). Zero errors.
- **Branches retained:** `about-redesign`, `logo-size`, `press-reel-speed`, `page-color-washes` — kept until live Production site is verified.

## /about page redesign — full-bleed amber field (June 2026)
- **Date:** 2026-06-22
- **Branch:** `about-redesign` (not yet on main — awaiting visual review)
- **Task:** Replace the floating marigold card on the /about page with a full-bleed amber background and a larger portrait placed directly on the colour field. Bio text reduced from `clamp(2rem, 3.4vw, 3.5rem)` display size to `clamp(1rem, 1.2vw, 1.18rem)` editorial body size.
- **Previous component:** `CanvasCards` (shared with homepage, floating card pattern, `border-radius: clamp(1.5rem, 2.5vw, 2.5rem)`, marigold `#efa72e` background inside a padded outer wrapper on `var(--v2-bg)` background).
- **New component:** `components/about/AboutFull.tsx` — full-page section, two-column grid desktop, single-column mobile. Portrait left, text right. No container, no card.
- **Colour:** `color-mix(in srgb, var(--accent-amber) 38%, var(--bg-cream) 62%)` — softened amber from the locked palette, warm and refined. Applied both on `body.mr2-mode.about-amber` (so the body bg behind the nav matches) and on the section itself.
- **Theme override:** `body.mr2-mode.about-amber` re-roots `--ink-current`, `--v2-fg`, `--ink-muted-current`, `--rule-current` to dark cacao values so all V2 components (nav links, PillCta, menu overlay) inherit correct dark ink on the amber field regardless of saved dark/light preference. Existing `about-page` body class handles logo switching (`site-logo__img--cacao` shown).
- **Portrait:** Sanity image now requested at `1200×1600` (was `900×1200`), `aspect-ratio: 3/4`, `border-radius: clamp(20px, 2.8vw, 48px)`.
- **Motion:** Portrait wipe reveal (clipPath inset 100%→0%, scale 1.08→1), eyebrow fade, `revealLines` on name (theatrical line split), bio fade-up, CTA autoAlpha fade. All via `mandaGsap` / `@/lib/motion`.
- **Files changed:** `components/about/AboutFull.tsx` (new), `styles/about.css` (Section 3 + body token override added), `app/(site)/about/page.tsx` (swapped CanvasCards → AboutFull, portrait size bumped).

## Logo size increase — +25% (June 2026)
- **Date:** 2026-06-22
- **Branch:** `logo-size` (not yet on main — awaiting visual review)
- **Task:** Increase the logo size by ~25% following Mandakini's request for a bigger logo after the previous 1.5× bump.
- **Pre-change state:** Logo size was controlled entirely by CSS (`height: clamp(44px, 9vh, 96px); width: auto`). HTML `width={120}` `height={66}` were aspect-ratio hints only. Mobile fixed at `height: 44px` (≤480px).
- **Change — CSS (`app/globals.css`):**
  - Desktop: `clamp(44px, 9vh, 96px)` → `clamp(54px, 11vh, 120px)` (+23% min, +22% fluid, +25% max)
  - Mobile ≤480px: `44px` → `50px` (+14% — conservative to keep mobile nav balanced)
- **Change — HTML hint (`components/layout/Navigation.tsx`):**
  - Both `logo-cream.png` and `logo-cacao.png`: `width={120} height={66}` → `width={150} height={83}` (proportional, ratio preserved at ~1.81:1)
- **Theme switching untouched:** `site-logo__img--cream` / `site-logo__img--cacao` logic and all `body.mr2-mode`/`body.mr2-mode.mr2-light` rules unchanged.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.

## Press reel — slow speed + add CTA (June 2026)
- **Date:** 2026-06-22
- **Branch:** `press-reel-speed` (not yet on main — awaiting visual review)
- **Task:** Slow the homepage press marquee (Mandakini found it too fast) and add a CTA linking to /press.
- **Speed change:** Forward track 36s → 60s (~67% slower). Reverse track 46s → 80s (~74% slower). `MARQUEE = { dur: 60, durAlt: 80 }` added to `lib/motion.ts`. `MarqueePress.tsx` sets `--mr2-marquee-dur` and `--mr2-marquee-dur-alt` CSS variables via `useEffect`. CSS uses `var(--mr2-marquee-dur, 60s)` — no raw duration outside the motion system.
- **CTA added:** `<PillCta href="/press">All press & features</PillCta>` inside `.mr2-press__footer` below the two marquee rows. Fixed-cream styling (`var(--v2-cream)`) since the lagoon press section background is always dark regardless of theme toggle.
- **Empty guard:** Component-level `PLACEHOLDER_ITEMS` fallback added for double safety (complements the existing `home-data.ts` `PLACEHOLDER_PRESS` fallback).
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `lib/motion.ts` (MARQUEE constant), `components/home/v2/MarqueePress.tsx` (speed, CTA, guard), `app/v2.css` (CSS vars, footer, CTA override).
- **No merge to main yet — review on Vercel preview first.**

## Shop moss wash intensity increase — 10% → 22% (June 2026)
- **Date:** 2026-06-22
- **Branch:** `page-color-washes` (not yet on main)
- **Change:** Increased `pdp-moss` background mix from `color-mix(in srgb, var(--accent-moss) 10%, var(--bg-cream) 90%)` to `22% moss / 78% cream`. 10% was too faint to read as green; 22% matches the visible-but-soft intensity of the amber project wash (20%) so the shop reads as gently sage at the same perceptual weight the project page reads as warm.
- **Continuity:** Both `/shop` listing and `/shop/[slug]` item use the same `pdp-moss` class — single rule change keeps listing→item transition continuous with zero jump.
- **No hardcoded hex:** Change is entirely within the `color-mix()` + `var(--accent-moss)` token system.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `styles/pages.css` (pdp-moss percentage only).

## Shop item crash fix + cohesive moss wash (June 2026)
- **Date:** 2026-06-22
- **Branch:** `page-color-washes` (extended — not yet on main)
- **Part A — crash fix (root cause):** `/shop/[slug]` used `getPrintBySlug` → `getAllPrints` → `getHomeData` → `featuredShopItemsQuery` which returns only 3 featured items. Any slug not in those 3 returned `null` → `notFound()` → Application error on Vercel. Added `getShopItemBySlug(slug)` to `lib/home-data.ts` which calls `getAllShopItems()` (full catalogue query). Updated `/shop/[slug]` page and `generateMetadata` to use `getShopItemBySlug` + `getAllShopItems`. Added empty-field guards in `ProductDetail` for `image`, `title`, `price`, `desc` (no-empty-pages rule — items with no artwork image or no price now show placeholder/omit the field rather than throwing).
- **Part B — cohesive tint:** Applied `pdp-moss page-wash-light` to `/shop` listing page so both shop pages share the same 10% moss + 90% cream background. Eliminates the cream→green jump when navigating from listing to item.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `lib/home-data.ts` (getShopItemBySlug added), `app/(site)/shop/[slug]/page.tsx` (use getShopItemBySlug), `app/(site)/shop/page.tsx` (PageWash + pages.css import), `components/shop/ProductDetail.tsx` (field guards).

## Per-page background washes — cream / amber / moss / rosehip (June 2026)
- **Date:** 2026-06-22
- **Branch:** `page-color-washes` (not yet on main — awaiting visual review)
- **Task:** Apply per-page background color washes from the locked palette. Soft, low-saturation, one color per page. Background only — no typography or layout changes.
- **Approach:** New `components/ui/PageWash.tsx` — null-render client component that adds/removes body class on mount/unmount. New `styles/pages.css` with all four wash rules plus shared `page-wash-light` ink + logo selectors.
- **Washes applied:**
  - `/works` (listing): `works-cream` — restores `var(--bg-cream)` cream field. Listing reads like an editorial catalogue.
  - `/works/[slug]` (series detail): `series-amber` — `color-mix(in srgb, var(--accent-amber) 20%, var(--bg-cream) 80%)`. 20% amber: distinctly warmer than cream listing, still reads as paper.
  - `/shop/[slug]` (product detail): `pdp-moss` — `color-mix(in srgb, var(--accent-moss) 10%, var(--bg-cream) 90%)`. 10% moss: earthy sage per Mandakini's request. Very muted, not a saturated green block.
  - `/contact`: `contact-rosehip` — `color-mix(in srgb, var(--accent-rosehip) 7%, var(--bg-cream) 93%)`. 7% rosehip: warm blush. Rosehip is deep/saturated so 7% reads clearly intentional without dominating.
- **Shared handling (`page-wash-light`):** All washes flip `--ink-current`, `--ink-muted-current`, `--rule-current`, `--v2-fg` to cacao (dark). Logo swapped from cream→cacao variant. Nav text forced `var(--ink-cacao)`.
- **No hardcoded hex:** All tints via `color-mix()` + existing palette tokens.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `components/ui/PageWash.tsx` (new), `styles/pages.css` (new), `app/(site)/works/page.tsx`, `app/(site)/works/[slug]/page.tsx`, `app/(site)/shop/[slug]/page.tsx`, `app/(site)/contact/page.tsx`.
- **No merge to main yet — review on Vercel preview first.**

## shopItem — remove dangling `artwork` reference field (June 2026)
- **Date:** 2026-06-21
- **Task:** Urgent fix — Studio failing to load with "Unknown type: artwork" because `shopItem.artwork` referenced the now-deleted `artwork` type.
- **Audit findings:**
  - Field: `shopItem.ts` line 10 — `type: 'reference', to: [{ type: 'artwork' }]`
  - Reads in app/components/lib/sanity/lib: **0** — field was never queried or rendered
  - shopItem documents with `artwork` populated in dataset: **0**
  - Only other `artwork` occurrence in schemas: a prose comment in `enquiry.ts` — not a type reference
- **Fix:** Removed the `artwork` field definition from `sanity/schemas/shopItem.ts`. No query or component changes needed (nothing read the field). No document data lost.
- **Schema grep after fix:** Zero `{ type: 'artwork' }` references across all schema files.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `sanity/schemas/shopItem.ts` (1 field removed), `PROGRESS.md`, `PROMPT_LOG.md`.

## Project/artwork schema collapse — single `project` type (June 2026)
- **Date:** 2026-06-21
- **Task:** Collapse two-type structure (`project` series + `artwork` piece) into a single `project` type — showcase only, no commerce. Remove all `artwork` dependencies.
- **Data migration (Step 2):** Patched `drafts.d15c7417-4ecb-47ca-9af9-93feb041882d` (Fragments Charcoal) — copied `title` → `seriesName` before removing `title`. Slug unchanged. Verified via GROQ query.
- **Schema rewrite (Step 3):** Rewrote `sanity/schemas/project.ts`. New fields: `seriesName` (required), `slug`, `description`, `images` (array with grid layout), `year`, `displayOrder`. Removed: `title`, `status`, `coverImage`, `artworkImages`, `medium`, `dimensions`, `projectNote`, `projectType`, `relatedProjects`.
- **Artwork type removed (Step 4):** `sanity/schemas/artwork.ts` deleted. Removed import + entry from `sanity/schemas/index.ts`.
- **GROQ queries updated:** `allSeriesQuery` and `featuredSeriesQuery` in `sanity/lib/queries.ts` now project `seriesName`, `description`, `images`, `year` from `project` documents only. Removed artwork sub-query, `status` filter (client uses `perspective: 'published'`).
- **`lib/home-data.ts` updated:**
  - Removed `SanitySaleLite` interface, `SanityArtworkLite` interface, `saleFrom()` function.
  - Updated `SanitySeriesLite` interface: `seriesName`, `slug`, `description`, `images`, `year`.
  - Rewrote `mapSeriesDoc()`: uses `d.seriesName`/`d.description`/`d.images` directly, no artwork paths, no sale links.
  - Removed `medium` from `HomeSeries` interface and all 3 `PLACEHOLDER_SERIES` objects.
- **Components updated (all `medium` references removed):**
  - `components/works/WorksIndex.tsx` — removed `filter`/`setFilter` state, `mediums`, `showFilters`, filters UI block, `{item.medium}` in Tier 1 meta and Tier 2 row, replaced `listed` with `series`, removed `useState` import and `filter` from deps array.
  - `components/works/SeriesDetail.tsx` — `{series.medium} — {series.desc}` → `{series.desc}`.
  - `components/home/v2/RisingSunWorks.tsx` — removed `<small>{item.medium}</small>`.
  - `components/home/ProjectSeries.tsx` — `{item.medium} — {item.desc}` → `{item.desc}`.
  - `app/api/revalidate/route.ts` — removed `artwork` from webhook type list in comment.
- **Build result:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.
- **Files changed:** `sanity/schemas/project.ts`, `sanity/schemas/artwork.ts` (deleted), `sanity/schemas/index.ts`, `sanity/lib/queries.ts`, `lib/home-data.ts`, `components/works/WorksIndex.tsx`, `components/works/SeriesDetail.tsx`, `components/home/v2/RisingSunWorks.tsx`, `components/home/ProjectSeries.tsx`, `app/api/revalidate/route.ts`.

## siteSettings schema — grouped tabs for Studio editor (June 2026)
- **Date:** 2026-06-20
- **Task:** Reorganise the siteSettings schema into collapsible groups so the Studio editor is no longer one long scroll. No fields added, removed, or renamed.
- **Groups added (Sanity `groups` feature):**
  - **Homepage** (default) — `tagline`, `aboutPortrait`, `aboutBio`, `heroImages`, `featuredProjects`, `featuredShopItems`
  - **Works** — `worksPageHeadline`, `worksEmptyHeadline`, `worksEmptyBody`
  - **Shop** — `shopPageHeadline`, `shopPrintNote`, `printDefaultPaper`, `printDefaultSignature`, `printDefaultShipping`, `thankYouMessage`, `privateCollectionTitle`, `privateCollectionLine`
  - **Contact** — `contactPageIntro`, `contactEmail`
  - **Social** — `instagramHandle`, `youtubeChannelName`
  - **SEO** — `seoTitle`, `seoDescription`
- **Descriptions added** to all fields that lacked one (`worksEmptyHeadline`, `worksEmptyBody`, `shopPageHeadline`, `printDefaultSignature`, `printDefaultShipping`, `privateCollectionTitle`, `privateCollectionLine`, `contactPageIntro`, `contactEmail`, `instagramHandle`, `youtubeChannelName`, `seoTitle`, `seoDescription`, `featuredProjects`, `featuredShopItems`).
- **No field names, types, or validation rules changed** — stored data in existing Sanity documents is unaffected.
- **Build result:** ✓ zero errors. Pre-existing warnings unchanged.
- **Files changed:** `sanity/schemas/siteSettings.ts` (groups + descriptions added).
- **No commit — awaiting localhost review.**

## Schema zombie field cleanup — siteSettings (June 2026)
- **Date:** 2026-06-20
- **Task:** Remove unused legacy fields from `aboutPage` and `siteSettings` schemas after codebase-wide grep proof.
- **aboutPage schema — no changes needed:** The schema already has only 3 fields (`aboutBlockPortrait`, `aboutBlockBio`, `aboutTeaserLine`). The 9 legacy fields flagged in the audit (`name`, `discipline`, `heroDisplayWord`, `heroLeadIn`, `heroSubhead`, `heroLeftImage`, `heroRightImage`, `bodyParagraph`, `edgeWords`) are ghost data in the Sanity document — they were already removed from the schema file previously. The schema is clean.
- **Note — dead components:** `components/AboutSection.tsx` and `components/about/AboutEdgeWords.tsx` reference some of these ghost field names but are not mounted anywhere on the live site. They are dead code but were not touched in this session (scope: schema only).
- **siteSettings schema — 4 zombie fields removed:** Confirmed zero references in all of `app/`, `components/`, `lib/`, `sanity/lib/` before removing:
  - `homepageHeadline` — zero hits outside schema
  - `homepageSubtext` — zero hits outside schema
  - `signupCtaText` — zero hits outside schema
  - `socialLinks` (instagram/youtube/facebook URLs) — zero hits; FooterV2 uses hardcoded links now
- **All other siteSettings fields retained:** `tagline`, `aboutPortrait`, `aboutBio`, `featuredProjects`, `featuredShopItems`, `heroImages`, `worksPageHeadline`, `worksEmptyHeadline`, `worksEmptyBody`, `shopPageHeadline`, `shopPrintNote`, `printDefaultPaper`, `printDefaultSignature`, `printDefaultShipping`, `thankYouMessage`, `contactPageIntro`, `privateCollectionTitle`, `privateCollectionLine`, `instagramHandle`, `youtubeChannelName`, `contactEmail`, `seoTitle`, `seoDescription` — all actively referenced in queries, `lib/site-settings.ts`, or pages.
- **Build result:** ✓ zero errors. Warnings are pre-existing (unrelated `<img>` tags in Navigation and LoadingScreenStripes).
- **Files changed:** `sanity/schemas/siteSettings.ts` (4 fields removed), `PROGRESS.md`, `PROMPT_LOG.md`.
- **No commit — awaiting localhost review.**

## Dataset document audit — read-only (June 2026)
- **Date:** 2026-06-20
- **Task:** Query all document types flagged by the stale-content diagnostic. Classify each document as orphaned old-schema (A), current schema (B), or mixed (C). No files were changed.
- **Result:** No orphaned documents found. Zero Category A documents exist.
- **Key findings:**
  - `pressItem`: **0 documents** — collection completely empty. The press page bento grid built in this session has no content. Mandakini must create press items via Studio.
  - `aboutPage`: 1 document (B — keep). The 4 fields queried by `aboutPageQuery` are all present. However, 9 extra fields exist in the document (`name`, `discipline`, `heroDisplayWord`, `heroLeadIn`, `heroSubhead`, `heroLeftImage`, `heroRightImage`, `bodyParagraph`, `edgeWords`) that no current query reads. These are from an intermediate design of the about page — invisible on site, but visible in Studio as seemingly live data.
  - `siteSettings`: 1 document (B — keep). Zombie schema fields (`homepageHeadline`, `homepageSubtext`, etc.) are defined in the schema but **absent from the document itself** (never populated) — they appear as empty Studio inputs, not actual data.
  - `shopItem`: 52 published + 3 drafts (all B). Use current schema. `basePrice` and `stripePriceId` are null on all 52 — data entry gap, not a schema problem. Commerce cannot function until prices are entered.
  - `project`, `artwork`, `testimonial`, `navigation`, `order`, `enquiry`: **0 documents each**.
  - `about` (old type): 0 documents — already deleted (prior PROGRESS note is resolved).
- **Revised root cause:** "Stale content" is the absence of content, not old documents. All live-site sections that appear empty or placeholder are falling back because the Sanity collections are empty (press, works, testimonials). The `aboutPage` extra fields are the most likely cause of Studio confusion — they look populated but go nowhere on the live site.
- **Action needed:**
  1. Enter `pressItem` documents in Studio (press page has 0 content)
  2. Enter prices (`basePrice`, `stripePriceId`) for shopItems before enabling commerce
  3. Optionally clean up `aboutPage` extra fields — either remove them from the schema (if the intermediate design is abandoned) or wire them to components
  4. Wire Sanity revalidation webhook: add `SANITY_REVALIDATE_SECRET` to Vercel env, create on-publish webhook in Sanity project settings
- **Files changed:** PROGRESS.md (this entry), PROMPT_LOG.md (audit tables appended). No code changes.

## /about blank page fixed — Sanity client hardcoded fallbacks (June 2026)
- **Date:** 2026-06-19
- **Root cause:** `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET` were not configured in Vercel's build environment. `createClient` received `undefined` as projectId, threw during static generation, and the env-var guard in the about page returned `<AboutSection data={{}} />` — blank content. Confirmed via Sanity CLI: the `aboutPage` document exists, is published, and has all fields filled.
- **Fix:** Added `|| 'i4t9kzxg'` and `|| 'production'` fallbacks to `sanity/lib/client.ts`. These values are already public (hardcoded in `sanity.config.ts`). The client now initialises correctly regardless of whether Vercel env vars are set. Removed the env-var guard from `app/(site)/about/page.tsx` — the fetch always runs and returns the published document.
- **Files changed:** `sanity/lib/client.ts` (fallback projectId + dataset), `app/(site)/about/page.tsx` (env-var guard removed).

## /about route wired to AboutSection — placeholder removed (June 2026)
- **Date:** 2026-06-19
- **Issue:** `/about` still showed "About — coming soon" even after the schema fix. Root cause: `app/(site)/about/page.tsx` wrapped the Sanity fetch in an empty `try/catch {}`, silently setting `data = null` on any error (missing env var at build, network fault, etc.), then rendered the placeholder.
- **Fix:** Removed the empty catch block and "coming soon" placeholder entirely. The Sanity fetch now propagates errors rather than hiding them. Added `{ next: { revalidate: 60 } }` as a third argument to `client.fetch()` so the ISR cache is correctly wired to the fetch. If `data` is genuinely null (document deleted), `<AboutSection data={{}} />` renders an empty-but-valid page with no misleading placeholder text.
- **Files changed:** `app/(site)/about/page.tsx` (removed try/catch, removed placeholder, added next revalidate option).

## /about route + homepage snippet wired to aboutPage; duplicate About type removed (June 2026)
- **Date:** 2026-06-19
- **Issue — Duplicate About schema caused /about to show "coming soon":** The Studio had two document types: the old `about` type (bio, artistStatement, profilePhotos, cv, exhibitionHistory) and the new `aboutPage` singleton (name, discipline, homeSnippet, descriptionLines, portrait, quote, quoteAttribution). The live `/about` page was fetching from the old `about` type; since no document of that type existed, it returned empty and showed the placeholder.
- **Fix — /about page:** Rewired `app/(site)/about/page.tsx` to fetch via `aboutPageQuery` and render `<AboutSection>`. Dynamic import pattern used to avoid build-time Sanity client errors.
- **Fix — Homepage snippet:** `getHomeData()` in `lib/home-data.ts` now fetches `*[_type == "aboutPage"][0].homeSnippet` in parallel. `CanvasCards.tsx` hides the bio paragraph when the field is empty.
- **Removed — Old "about" type:** Deleted `sanity/schemas/about.ts`, removed `aboutSchema` from `sanity/schemas/index.ts`, removed `aboutQuery` from `sanity/lib/queries.ts`, deleted `lib/about-data.ts` and `components/about/AboutPage.tsx`. Studio now shows only one About entry ("About Page").
- **Note:** The old "about" document still exists in the Sanity dataset (invisible in Studio after schema removal). Awaiting manual deletion via dataset tools.
- **Files changed:** `app/(site)/about/page.tsx` (rewrite), `components/AboutSection.tsx` (new), `styles/about.css` (new), `sanity/schemas/aboutPage.ts` (new), `sanity/schemas/index.ts` (aboutSchema removed), `sanity/lib/queries.ts` (aboutQuery removed, aboutPageQuery added), `lib/home-data.ts` (homeSnippet fetch added), `components/home/v2/CanvasCards.tsx` (hide-when-empty guard). Deleted: `sanity/schemas/about.ts`, `lib/about-data.ts`, `components/about/AboutPage.tsx`.

## Hero parallax fix + About section overhaul (June 2026)
- **Date:** 2026-06-17
- **Issue 1 — Hero parallax stripped to essentials:** Removed frame scale-down, pin, entrance opacity animation. Only remaining scroll effect: background plate (`bg-only.png`) moves upward at 32% of scroll speed via GSAP ScrollTrigger (scrub, no pin). Person layer and all text scroll at normal page speed with no transform. BG_PARALLAX_RATE constant at top of `HeroScene.tsx` for easy tuning.
- **Issue 2 — Checkerboard eliminated:** Set `background: #2C1A0E` on `.mr2-hscene` section + `isolation: isolate`. Any transparent PNG artifact now shows the solid deep cacao instead of the browser transparent grid.
- **Issue 3 — About section image + background:** Hardcoded `/art/about-portrait.jpg` (converted from `IMG_3968.HEIC`) in `CanvasCards.tsx`; removed `filter: grayscale(1)` for full colour. Background changed from `var(--v2-bg)` to `radial-gradient(ellipse at 38% 55%, #2C1A0E 0%, #1E120A 70%)` — warm painterly dark distinct from the rest of the site. About section text forced to cream `#F5EFE4` independent of theme toggle.
- **Files changed:** `HeroScene.tsx` (rewrite), `CanvasCards.tsx` (image src), `app/v2.css` (hero CSS, about CSS), `public/art/about-portrait.jpg` (new).

## WebGL liquid-reveal hero (June 2026)
- **Date:** 2026-06-16
- **Task:** Replace the static hero portrait with a WebGL liquid-reveal effect. Cursor hovering over the hero fades in an alternate portrait through a soft radial mask with fluid displacement warp. Warp amplitude scales with cursor velocity and settles when still; cursor leaving the hero returns to the base colored portrait. Static `<Image>` always rendered beneath the canvas as fallback (no-WebGL, reduced-motion, SSR).
- **Files changed:** `components/home/v2/HeroPortrait.tsx` (dynamic import of HeroLiquid, static fallback co-rendered), `components/home/v2/HeroLiquid.tsx` (new — WebGL1 canvas, GSAP ticker render loop, procedural displacement fallback, ResizeObserver), `app/v2.css` (`.mr2-hp__gl` opacity transition via `data-ready`), `public/art/hero/` (placeholder portrait images).
- **Key decisions:** Procedural smooth sine-wave displacement canvas used when no `dispSrc` provided (no noise/grain). GSAP ticker piggy-backs on Lenis loop (no competing rAF). Canvas opacity: 0 → 1 triggered by `canvas.dataset.ready = 'true'` once textures decode. All tunable constants (radius, feather, amplitude, velocity influence, settle speed) are JS constants with comments at the top of HeroLiquid.tsx.

## Cursor replaced + CTAs unified (June 2026)
- **Date:** 2026-06-16
- **Task 1 — Cursor:** Replaced the expand-to-VIEW cursor entirely. New design: `--v2-fg` outer ring (34px, trails at 0.5s power3.out) + terracotta `#b8572a` inner dot (8px, tighter 0.14s). Portal-mounted to body via `CursorFollower.tsx`; hidden on touch / non-(pointer:fine); fades on mouseleave/blur; subtle ring scale on hover of `a`/`button`. Removed `Cursor.tsx` (was unused — it was mounted in layout.tsx independently, now gone). Stripped all `data-cursor` / `data-cursor-label` attributes from every non-v1 component.
- **Task 2 — CTA consistency:** Created `components/ui/PillCta.tsx` — one shared pill button/link component. Canonical class `.mr2-cta`: `border-radius: 999px`, `var(--v2-fg)` border+text, rosehip `#792318` hover fill with cream text. Replaced all divergent CTA styles (`mr2-footer__stamp` had rotation + marigold fill; `mr2-works__all` was rectangular; `mr-cart__checkout.mr-pill` had different selectors). Fixed `.mr2-pill` in v2.css to add `border-radius`. Updated v2 home components (ContactStage, FooterV2, CanvasCards, EditionShop, RisingSunWorks) and all non-v2 pages (works, shop, contact, press) to use PillCta. Commerce button behaviour preserved (flag-gated, style only changed).
- **Files changed:** `components/ui/CursorFollower.tsx` (rewrite), `components/ui/PillCta.tsx` (new), `app/layout.tsx` (remove Cursor mount), `app/v2.css` (cursor + cta CSS), `app/globals.css` (selector updates), 15+ component files (data-cursor stripped, PillCta adopted).

## Studio route fixed: /studio loads correctly
- **Date:** 2026-06-13
- **Issue:** Visiting `/studio` showed "Tool not found: studio" — the Studio's internal router was receiving the full URL path `/studio` and treating `studio` as a tool name.
- **Root cause:** `basePath: '/studio'` was missing from `sanity.config.ts`. Without it, the Studio doesn't know to strip the `/studio` mount prefix before resolving tool routes.
- **Fix:** Added `basePath: '/studio'` to the `defineConfig` call in `sanity.config.ts`.
- **Route file:** `app/studio/[[...tool]]/page.tsx` was already correct (optional catch-all, correct import).
