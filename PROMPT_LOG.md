# Prompt Log

---

## 2026-06-19 (b) — /about placeholder removed; fetch unwrapped

**Prompt summary:**
`/about` still showed "About — coming soon" even with `aboutPageQuery` and `AboutSection` in place. Root cause: an empty `try/catch {}` around the Sanity fetch silently left `data = null`, triggering the placeholder. Fix: remove the catch block and placeholder, add `{ next: { revalidate: 60 } }` to the fetch so ISR is properly wired. If data is null (document absent), render `<AboutSection data={{}} />` — no placeholder text.

**Root cause:** Silent `try/catch {}` masked any fetch error and fell through to "coming soon". The actual fetch (`client.fetch(aboutPageQuery)`) was correct; the wrapper was the problem.

**What changed:** `app/(site)/about/page.tsx` — empty catch removed, placeholder removed, `{ next: { revalidate: 60 } }` added to `client.fetch()`.

---

## 2026-06-19 (Duplicate About type removed; /about and homepage snippet wired to aboutPage)

**Prompt summary:**
Resolve a duplicate-schema problem: Studio had both the old `about` type (bio/CV/exhibitions) and new `aboutPage` singleton (name/homeSnippet/portrait/quote). The live /about showed "coming soon" because the page fetched from the non-existent old `about` document. Tasks: wire /about to `aboutPageQuery` + `<AboutSection>`; wire homepage bio to `aboutPage.homeSnippet`; remove the old `about` type entirely (schema file, index entry, query, data layer, component). Old "about" Studio document still exists in the dataset — flagged for manual deletion.

**Root cause:** Two separate About document types existed simultaneously. The page (`app/(site)/about/page.tsx`) was still pointing to `getAboutData()` → `aboutQuery` → `*[_type == "about"][0]`, while the published content lived in an `aboutPage` document. No `about` document existed, so the fetch returned null and the placeholder rendered.

**What was removed:**
- `sanity/schemas/about.ts` (deleted)
- `lib/about-data.ts` (deleted)
- `components/about/AboutPage.tsx` (deleted)
- `aboutSchema` import + registry entry from `sanity/schemas/index.ts`
- `aboutQuery` export from `sanity/lib/queries.ts`

**Note:** The orphaned `about` document remains in the Sanity dataset. It is invisible in Studio after schema removal but can be deleted via the Sanity dataset CLI (`sanity documents delete`) or the Content Lake API when ready.

---

## 2026-06-17 (Hero fix + About overhaul)

**Prompt summary:**
Three issues: (1) Strip all hero scroll effects except background parallax at 30-40% of scroll speed — text and person must scroll at normal speed with no transform. (2) Remove checkerboard artifact — solid #2C1A0E background on hero container. (3) About section: replace B&W portrait with IMG_3968 in full colour; apply warm dark painterly background (#1E120A → #2C1A0E radial gradient) instead of default cream; text in cream #F5EFE4.

---

## 2026-06-16 (WebGL hero)

**Prompt:**
Read PROJECT.md and PROGRESS.md first.

GOAL: Replace the current homepage hero visual with a WebGL liquid-reveal effect built around a single centered portrait of Mandakini. This is an INTEGRATION into the live Next.js app, not a standalone prototype.

THE EFFECT:
- Single colored portrait (hero-portrait-color.jpg) at rest — always visible base state.
- Cursor over hero: soft-edged radial reveal of alternate portrait (hero-portrait-alt.jpg) with fluid displacement warp.
- Displacement intensifies with velocity, settles when still; cursor leaves → returns to base.

TEXTURES: hero-portrait-color.jpg, hero-portrait-alt.jpg, hero-displacement.jpg (placeholder paths user will swap).

DESIGN CONSTRAINTS: NO grain, noise, or glitch — most important rule. Painterly, liquid, fluid only.

INTEGRATION REQUIREMENTS:
- Mount WebGL canvas client-side only (dynamic import ssr:false)
- Tie render loop into GSAP ticker — no competing rAF
- Existing cursor stays unchanged
- Fallback: static Image on no-WebGL, reduced-motion, or while loading
- Preserve loading screen + hero scroll-exit choreography
- Lazy/defer texture loading
- Expose tunable params with comments: reveal radius, edge feather, displacement amplitude, velocity influence, settle speed

ON COMPLETION: Update PROGRESS.md and PROMPT_LOG.md.

---

## 2026-06-16

**Prompt:**
Read PROJECT.md and PROGRESS.md first. Two tasks: replace the custom cursor site-wide, and make all CTAs consistent. Touch only the cursor component, the shared button/CTA component(s), and their styles. Do not change page content, layout structure, or animations beyond what is specified.

**TASK 1 — CURSOR:**
Replace the current custom cursor entirely. Remove the expand-to-VIEW behaviour, VIEW label, expanding ring state, and per-element cursor labels. New design: circular outer ring in deep cacao #2C1A0E + small solid inner dot in terracotta #B8572A. Outer ring trails with GSAP quickTo on transforms (~0.5s power3.out); inner dot tracks tighter/faster. Centering via xPercent/yPercent -50 set once with gsap.set. Portal-mounted directly as child of body. Hidden on touch/non-(pointer:fine). Fades out on mouseleave/blur. Remove the delegated data-cursor API and strip all data-cursor/data-cursor-label attributes from work cards, featured strip, shop links, and everywhere. Optional subtle scale nudge on clickable elements (skip if complexity risk).

**TASK 2 — CTA CONSISTENCY:**
Audit every CTA/button across all pages (home, works, shop, product, about, press, contact, private collection enquiry). Create ONE shared pill button component. All CTAs: pill shape (fully rounded), no rotation/tilt, border 1px #2C1A0E on transparent with cacao text, hover fills rosehip #792318 with cream #F5EFE4 text, transition on master ease. Consistent padding/font scale. CTAs align to content axis of their section. Cart/checkout commerce buttons styled the same but feature-flag gated behaviour preserved.

**CONSTRAINTS:** No grain/noise. No boxy/square elements. No blues. Palette only: cream #F5EFE4, deep cacao #2C1A0E, terracotta #B8572A, rosehip #792318, amber #C89839. Master ease and shared timing only. Do not modify hero, loading screen, about section, featured strip logic, or Private Collection enquiry flow beyond CTA styling.

**ON COMPLETION:** Update PROGRESS.md with two entries and append prompt to PROMPT_LOG.md.

---

## 2026-06-13

**Prompt:**
Read PROJECT.md and PROGRESS.md first.

Bug: The Sanity Studio is mounted in this Next.js app and is served at /studio, but loading mandakini-website.vercel.app/studio shows "Tool not found: studio". The Studio shell loads (Structure and Vision appear) but the default route fails to resolve.

Investigate and fix:
1. Check sanity.config.ts (or sanity.config.js) and confirm basePath is set to '/studio'.
2. Check the Next.js route folder that mounts the Studio (likely app/studio/...). Confirm it uses an OPTIONAL catch-all segment named exactly [[...tool]] (double brackets), NOT a single catch-all [...tool] or a plain [tool]. A non-optional or wrongly named segment is the most likely cause: the path segment is being captured and treated as a tool name, producing "Tool not found".
3. Ensure the route file correctly imports and renders the Studio with the shared config, and that basePath in the config matches the /studio mount point exactly.

Fix the mismatch so that visiting /studio loads the default Structure view with no "Tool not found" error.

Constraints:
- Do NOT modify any schemas, document types, fields, or unrelated config.
- Do NOT change CORS settings or environment variables.
- Only touch the Studio route file and sanity.config if needed.

On completion: report exactly what was misconfigured and what you changed, then update PROGRESS.md (Studio route fixed: /studio loads correctly) and append this prompt to PROMPT_LOG.md.
