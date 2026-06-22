# Progress Log

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
