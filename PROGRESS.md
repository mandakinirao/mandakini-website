# Progress Log

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
