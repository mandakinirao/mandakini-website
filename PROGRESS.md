# Progress Log

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
