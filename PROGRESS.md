# Progress Log

## Studio route fixed: /studio loads correctly
- **Date:** 2026-06-13
- **Issue:** Visiting `/studio` showed "Tool not found: studio" — the Studio's internal router was receiving the full URL path `/studio` and treating `studio` as a tool name.
- **Root cause:** `basePath: '/studio'` was missing from `sanity.config.ts`. Without it, the Studio doesn't know to strip the `/studio` mount prefix before resolving tool routes.
- **Fix:** Added `basePath: '/studio'` to the `defineConfig` call in `sanity.config.ts`.
- **Route file:** `app/studio/[[...tool]]/page.tsx` was already correct (optional catch-all, correct import).
