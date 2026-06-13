# Homepage Rebuild Implementation Plan (Loading → Footer)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the rudimentary homepage (loading screen, hero, sections, footer) with the full spec'd experience: one GSAP+Lenis motion system, iris-reveal loading screen, layered parallax hero, and five seamless scroll sections over a single scrubbed background.

**Architecture:** All motion lives in `lib/motion.ts` (eases, timings, `revealLines`, `revealImage`, Lenis singleton, velocity skew, background scrub). Homepage is a client orchestrator (`HomeExperience` inside `app/(site)/page.tsx`) that coordinates LoadingScreen → FLIP wordmark → Hero entrance, with each section a self-contained client component consuming motion primitives. Data comes from new `sanity/lib/queries.ts` with hard fallbacks to local placeholder data (no `.env.local` exists — Sanity is optional at runtime).

**Tech Stack:** Next.js 14 App Router, GSAP 3.15 (ScrollTrigger, Flip, CustomEase, SplitText — all free since 3.13), Lenis 1.3, Tailwind 3 (layout utilities only), CSS custom properties for all color/type tokens.

**The authoritative visual/motion spec is the user prompt saved at `files/PROMPT_04_HOMEPAGE_REBUILD.md` (Task 0 copies it there). This plan records structure, contracts, and audit-driven decisions; the spec governs look and feel.**

---

## Audit decisions (locked)

1. **Work in `/Users/arunperi/Documents/Mandakini/Website`** — the `mandakini 2.0` folder only holds the new prompt + the "Website Jun 2026 AP 2" asset drop. Spec forbids parallel structures.
2. **Fonts present:** Konya (`Konya-RaPo.otf`, Freeware *Non-Commercial*) and Mailendra (`MailendraRegular-Zpe63.otf`, *Demo* license) → copy to `public/fonts/konya/` and `public/fonts/mailendra/`, wire real `@font-face`. **License status must be logged in NEEDS FROM AP — neither is launch-licensed.** OTF served as-is; woff2 conversion when client supplies finals.
3. **Staff Regular does not exist anywhere on disk.** Do NOT add a dead `@font-face`. Token layer: `--font-display: 'Staff', 'Boska', serif` — Boska Regular (already licensed + self-hosted in `public/Boska_Complete/`) is the stand-in. Log under NEEDS FROM AP.
4. **Hero cutout exists:** `public/images/photo-with-only-person.png` (1280×854, alpha) is Mandakini isolated from `public/art/loader/portrait-home-studio-color.jpg` (the spec'd hero background). Copy to `public/images/hero/mandakini-cutout.png`. Three-layer hero is live, with the additive-layer guard kept anyway.
5. **Nine Subbulakshmi portraits:** still placeholders at `public/placeholders/portrait-[1-9].jpg`. Use them; log finals under NEEDS FROM AP.
6. **No `.env.local`** → `sanity/lib/client.ts` throws if imported without env. Guard: only import/fetch when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set; otherwise serve placeholder data. Queries still get written (advances Block 3).
7. **framer-motion** is only imported by `components/HeroSection.jsx` (being deleted) → uninstall it (PROJECT.md stack never listed it).
8. **Old root components** (`HeroSection.jsx`, `IdentitySection.jsx`, `WorksSection.jsx`, `TestimonialsSection.jsx`, `PressSection.jsx`, `SmoothScroll.jsx`, `lib/useSmoothScroll.js`) and `components/intro/IntroAnimation.tsx` are replaced/deleted. `components/home/*` placeholder sections from the earlier build are also superseded — delete the unused ones.
9. **Navigation.tsx stays** (hamburger overlay) — hero entrance only fades it in; no rebuild this pass.
10. **`/learn` route does not exist** (Phase 2). TEACHING row links to `/learn` per spec; logged as TODO (404 until Phase 2).
11. **No test runner exists in this project.** Verification = `tsc --noEmit`, `npm run build`, dev-server smoke (HTTP 200 + console-error check), reduced-motion and viewport passes. No test framework gets added for an animation build.

## File structure

```
lib/motion.ts                      — entire motion system (only animation import site for tokens)
components/ui/CursorFollower.tsx   — global cursor follower (desktop only)
components/home/LoadingScreen.tsx  — fan formation, counter, ENTER, iris exit, FLIP source
components/home/Hero.tsx           — 3-layer parallax, FLIP target, pinned frame-reveal exit
components/home/IntroStatement.tsx — pinned editorial paragraph w/ Konya emphasis
components/home/SelectedWorks.tsx  — asymmetric grid of composed work objects
components/home/ThePractice.tsx    — outline rows + cursor-following preview stack
components/home/ShopTeaser.tsx     — diagonal prints w/ cat edition stamp
components/home/PressStrip.tsx     — editorial press rows
components/layout/Footer.tsx       — REWRITE: transparent darkened footer (used by works/shop/etc. shells too — keep export shape)
components/home/HomeExperience.tsx — client orchestrator: loader↔hero handoff, background scrub mount, cursor mount
lib/home-data.ts                   — types + placeholder data + Sanity-or-fallback loaders
sanity/lib/queries.ts              — GROQ queries (Block 3 partial)
sanity/lib/image.ts                — image URL builder (needed by queries consumers)
app/(site)/page.tsx                — server component: loads data, renders <HomeExperience>
app/globals.css                    — REWRITE: section-2 tokens, @font-face, keep nav/menu CSS, drop old home/loader/footer CSS
```

## Contracts (later tasks depend on these exact names)

`lib/motion.ts` exports:
- `EASE = "mandakini"`, `EASE_INOUT = "mandakini-inout"` (CustomEase registered once)
- `DUR = { fast: 0.6, base: 1.0, grand: 1.4 }`, `STAGGER = { lines: 0.08, burst: 0.05 }`
- `prefersReducedMotion(): boolean`, `isTouch(): boolean`
- `initLenis(): Lenis | null` / `getLenis()` / `lockScroll()` / `unlockScroll()`
- `revealLines(el, opts?: { delay?: number; scrollTrigger?: boolean }): gsap.core.Tween | null` (SplitText `type:'lines', mask:'lines'`, `yPercent:110→0`)
- `revealImage(el, opts?: { delay?: number; scrollTrigger?: boolean }): gsap.core.Timeline | null` (el = mask container, child `[data-reveal-img]` counter-scales 1.25→1.12; clip-path inset)
- `initBackgroundScrub(root: HTMLElement): () => void` — tweens `--scroll-bg` and `--ink-current`/`--ink-muted-current` on `:root` through cream→linen→deep-linen→night, driven by `[data-bg="linen"|"deep"|"night"]` marker sections
- `initVelocitySkew(): () => void` — lenis velocity → clamped skewY ≤1.5deg on `[data-velocity-skew]`
- `mandaGsap` (gsap with plugins registered) — components import gsap from here, never from 'gsap' directly

`lib/home-data.ts` exports:
- `type HomeWork = { index: string; title: string; year: string; medium: string; image: string; href: string; size: 'large'|'small'; annotated?: boolean }`
- `type HomePrint = { title: string; price: string; image: string; href: string }`
- `type HomePress = { source: string; title: string; year: string; url?: string }`
- `getHomeData(): Promise<{ works: HomeWork[]; prints: HomePrint[]; press: HomePress[]; intro: string }>` — Sanity when env present, placeholders otherwise

Token names in `:root` exactly as spec section 2 (`--bg-cream`, `--bg-linen`, `--ink-cacao`, `--ink-night`, `--accent-toffee`, `--accent-amber`, `--accent-rosehip`, `--accent-moss`, `--cream-on-dark`) plus runtime scrub vars `--scroll-bg`, `--ink-current`, `--ink-muted-current`, and font tokens `--font-display`, `--font-accent` (Konya), `--font-label` (Mailendra), `--font-body` (EB Garamond), `--font-ui` (Jost).

## Tasks

### Task 0: Asset + doc prep
- [ ] Copy the user prompt into `files/PROMPT_04_HOMEPAGE_REBUILD.md` (decision-trail convention)
- [ ] `mkdir -p public/fonts/konya public/fonts/mailendra public/images/hero docs/superpowers/plans`
- [ ] Copy `Konya-RaPo.otf`, `MailendraRegular-Zpe63.otf` from `…/mandakini 2.0/Website Jun 2026 AP 2/`
- [ ] Copy `public/images/photo-with-only-person.png` → `public/images/hero/mandakini-cutout.png`
- [ ] Verify: `ls public/fonts/konya public/fonts/mailendra public/images/hero`

### Task 1: Tokens + globals.css rewrite
- [ ] Rewrite `app/globals.css`: section-2 tokens; `@font-face` Konya 400 / Mailendra 400 / keep Boska; EB Garamond + Jost via Google import; keep `.site-nav`, `.menu-*` blocks (recolored to tokens); delete `.loader-*`, `.smooth-scroll-hero*`, `.identity-*`, `.works-*`, `.work-card*`, `.testimonial*`, `.press-*`, `.site-footer*`, `.floating-footer*`, `.home-hero*` blocks; body uses `background: var(--scroll-bg, var(--bg-cream)); color: var(--ink-current, var(--ink-cacao))`; no texture/grain anywhere; reduced-motion block kept
- [ ] New component-level CSS (masks, pills, outline text, cursor follower, section scaffolding) lives in globals.css under a `/* ── home ── */` banner — project convention is plain CSS + Tailwind utilities, no CSS modules
- [ ] Verify: `npx tsc --noEmit` unaffected; grep shows no remaining `--bg-raised`/old token consumers outside untouched pages

### Task 2: lib/motion.ts
- [ ] Implement full contract above; register `ScrollTrigger, Flip, CustomEase, SplitText` once; `CustomEase.create("mandakini","0.25,1,0.5,1")`, `CustomEase.create("mandakini-inout","0.76,0,0.24,1")`; Lenis `{ duration:1.1, easing: t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true }` synced via `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`; everything no-ops gracefully under reduced motion (revealers become opacity fades, lenis/skew/scrub return null/noop-cleanups)
- [ ] Delete `lib/useSmoothScroll.js`, `components/SmoothScroll.jsx`; remove `<SmoothScroll/>` from `app/layout.tsx` (Lenis now initialized by HomeExperience-level provider — but other pages need smooth scroll too, so root mounts a tiny `components/ui/MotionProvider.tsx` client component that calls `initLenis()` + `initVelocitySkew()`)
- [ ] Verify: `npx tsc --noEmit`

### Task 3: CursorFollower
- [ ] `components/ui/CursorFollower.tsx`: fixed, `pointer-events:none`, cream dot ~12px, lerp 0.12 via `gsap.quickTo`; event delegation on `[data-cursor]` (values `view`/`open`/`enter`) expands to 72px w/ Jost label in cacao; hidden on touch + reduced motion; mounted globally by MotionProvider
- [ ] Verify: `npx tsc --noEmit`

### Task 4: LoadingScreen
- [ ] Spec section 4 exactly: cacao `#3D1F0D` full-viewport layer; 9 placeholder portraits in Ravana fan (center-out `revealImage`, 0.05s stagger); wordmark `revealLines`; Mailendra amber counter — real load progress via portrait `onLoad` count, clamped ≥1.8s; circular breathing ENTER (`data-cursor="enter"`); cat mark (reuse `components/ui/CatMark.tsx`) in rosehip
- [ ] Exit: outer-eight drift+fade on individual vectors → `clip-path: circle()` iris from center portrait position to >viewport diagonal (duration grand) over the hero; calls `props.onIris(wordmarkEl)` so HomeExperience runs `Flip.fit` to the hero title; lenis locked until complete
- [ ] sessionStorage `mr-intro-seen` skips straight to hero entrance
- [ ] Reduced motion: static wordmark + ENTER, fade-out exit
- [ ] Verify: `npx tsc --noEmit`

### Task 5: Hero
- [ ] Spec section 5: background `portrait-home-studio-color` via existing copy in `public/art/loader/` (desaturate filter + warm tint overlay div, priority-loaded `next/image`); midground name ~12vw Staff-token `--cream-on-dark` lower third; foreground cutout layer rendered only if asset flag true (it is — keep the conditional); scrubbed per-layer `yPercent`; pointer parallax lerp 0.06 (±8px bg / ±20px fg, desktop only)
- [ ] Entrance API: `playHeroEntrance()` exposed via ref/callback — bg settle 1.08→1, cutout +40px rise/fade, nav fade last; name arrives via FLIP from loader (or `revealLines` when intro skipped)
- [ ] Exit: pin ~120vh — cream eats inward (inset + border-radius tween on media container) + media counter-scale 1→1.08 + name letter-spacing drift & fade by 60%
- [ ] Verify: `npx tsc --noEmit`

### Task 6: IntroStatement + SelectedWorks
- [ ] IntroStatement per spec section 6 (placeholder copy from spec; Konya emphasis words in toffee ≥20px; ~40vh pin overlapping first work reveal)
- [ ] SelectedWorks per spec section 7: asymmetric two-col grid (right col +20vh), alternating 55%/35% (mobile single col 92%/78% alternating alignment); composed objects: Mailendra index + amber rule above, organic asymmetric-radius mask (`revealImage`), Staff title + EB Garamond meta (`revealLines`, +0.1s); per-work lazy parallax (large slower); hover trio (scale 1.12→1.18 + tint lift, title +10px / index→Konya crossfade, `data-cursor="view"`); touch fallback via viewport-center ScrollTrigger toggling a `.is-active` class; 1–2 placeholder handwritten SVG annotations inline; eyebrow "SELECTED WORKS (01 — 08)"; pill SEE ALL → `/works`; final-work handoff draws first Practice rule
- [ ] Verify: `npx tsc --noEmit`

### Task 7: ThePractice + ShopTeaser + PressStrip
- [ ] ThePractice per spec section 8: 3 rows (PAINTING→`/works`, PHOTOGRAPHY→`/works`, TEACHING→`/learn`), scrubbed scaleX rules, Mailendra indexes, 9vw outline display words (`-webkit-text-stroke`), EB Garamond blurbs; desktop: fixed lerped follower (~24vw, translate-stack `y: index*-100%`, image cycling ≥120px `Math.hypot` threshold, quick crossfade), hovered word outline→solid + 12px nudge + amber index, `data-cursor="open"`; touch: static side preview + center-trigger fill; short pin handoff into ShopTeaser; preview images hardcoded from `public/art/loader/` (TODO real picks)
- [ ] ShopTeaser per spec section 9: 3 placeholder prints on offset diagonal, works-object anatomy, rosehip CatMark circle stamp w/ 1.3→1 overshoot on reveal, Mailendra eyebrow "PRINT EDITIONS", Konya line "limited runs, signed in Hyderabad", pill SHOP PRINTS → `/shop`
- [ ] PressStrip per spec section 10: 3–4 placeholder rows (Staff name ~2vw, Mailendra year, scrubbed rules), hover slide+underline draw, external links when URLs exist (none yet — TODO), `revealLines` entries
- [ ] Verify: `npx tsc --noEmit`

### Task 8: Footer rewrite + background scrub wiring
- [ ] Rewrite `components/layout/Footer.tsx`: transparent background (page scrubs to `#2C1A0E` behind it via `data-bg="night"`), giant cream wordmark via `revealLines`, Jost nav links, bare social links, half-cropped CatMark bottom-right, Konya "Painted in Hyderabad." — keep default export signature (used by `app/(site)/layout.tsx` on all site pages; on non-home pages scrub vars default to cream theme, so footer must read `--ink-current`-style tokens and still be legible — give the footer a non-home fallback: when no scrub is active it sets its own `data-bg` scope class with night colors via plain CSS on `.site-footer-dark` wrapper)
- [ ] Verify: `npx tsc --noEmit`

### Task 9: Data layer
- [ ] `sanity/lib/image.ts` (urlForImage builder — Block 3.2), `sanity/lib/queries.ts` (getAllProjects, getFeaturedProjects [siteSettings.featuredProjects fallback to 8 most recent — TODO featured flag], getFeaturedShopItems, getFeaturedPressItems, getSiteSettings — Block 3.3 partial)
- [ ] `lib/home-data.ts` per contract; dynamic `import('../sanity/lib/client')` only when env present; try/catch → placeholders (works from `public/placeholders/` + `public/art/loader/`)
- [ ] Verify: `npx tsc --noEmit`

### Task 10: Composition + cleanup
- [ ] `components/home/HomeExperience.tsx`: client orchestrator — sessionStorage branch, LoadingScreen→Flip→`playHeroEntrance()` chain, `initBackgroundScrub` mount, section order Hero→IntroStatement→SelectedWorks→ThePractice→ShopTeaser→PressStrip (Footer stays in site layout), `data-bg` markers (`linen` on SelectedWorks, `deep` on ThePractice, `night` on a sentinel before Footer)
- [ ] Rewrite `app/(site)/page.tsx` as async server component: `const data = await getHomeData()` → `<HomeExperience {...data} />`
- [ ] Delete `components/HeroSection.jsx`, `IdentitySection.jsx`, `WorksSection.jsx`, `TestimonialsSection.jsx`, `PressSection.jsx`, `components/intro/IntroAnimation.tsx`, and unused `components/home/` placeholders (AboutIntro, ContactCTA, FeaturedWorks, Marquee, NewsletterSignup, PressQuote, ShopPreview) after grepping for remaining imports
- [ ] `npm uninstall framer-motion`
- [ ] Verify: `npx tsc --noEmit && npm run build`

### Task 11: Runtime verification
- [ ] `npm run dev` → `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` = 200; check other shells (/works, /shop, /about, /press, /contact) still 200
- [ ] Screenshot-based visual pass of loader, hero, each section, footer (desktop + ~390px mobile width) if a browser tool is available; otherwise DOM-level checks + careful read-through
- [ ] Reduced-motion + touch code paths re-read against spec section 3.7
- [ ] Definition-of-done checklist (spec section 14) walked item by item

### Task 12: Documentation (spec section 16)
- [ ] PROGRESS.md: status, what was built, full TODO list (hero cutout finals, Sanity featured flag, works filters, real handwriting SVGs, press URLs, shop data, /learn route, Staff font, woff2 conversion, font licenses), deviations + reasons, NEEDS FROM AP (a)–(f)
- [ ] PROMPT_LOG.md: dated session entry
