# CLAUDE CODE PROMPT — Mandakini Rao Homepage Rebuild (Loading → Footer)

## 0. Before you write any code

1. Read `PROJECT.md`, `PROGRESS.md`, and `PROMPT_LOG.md` in full.
2. Audit the existing homepage implementation (loading screen, hero, and any sections below). The current implementation is considered rudimentary and is being replaced. Reuse existing assets, Sanity queries, and file structure where they exist; replace the visual and motion implementation entirely per this spec.
3. Adapt the file paths in section 15 to the actual structure recorded in `PROGRESS.md` if they differ. Do not invent a parallel structure.

This prompt rebuilds the complete homepage experience: loading screen, hero, and all sections below, unified by one motion system.

---

## 1. Hard constraints (never violate)

- **No square or boxy elements anywhere.** No visible rectangles with hard corners: no bordered cards, no straight-edged image frames, no rectangular buttons. CTAs are pill-shaped, bare text links, or circular only. Images live inside rounded organic masks.
- **No blues anywhere.**
- **No film grain or noise overlays anywhere** — not on images, not on backgrounds, not on the loading screen. Texture, if any, may only exist as an extremely subtle paper tone on background surfaces, never on photographs.
- **No Framer Motion.** All animation is GSAP (+ ScrollTrigger, + Flip plugin) with Lenis for smooth scroll. Do not add framer-motion to the dependency tree. Where reference components use Framer Motion, translate the mechanism to GSAP.
- **No default eases.** Every animation uses the motion tokens in section 3.
- The site must feel like Mandakini's, not a template. The palette (warm cream + serif + terracotta-family accents) superficially resembles common AI-generated defaults, so the identity must be carried by the Manda-specific devices: the MS Subbulakshmi loading motif, the Persian cat mark, Staff Regular display type, Konya script accents, handwritten annotation SVGs, and the Hyderabad sign-off. Never omit these to "simplify."

---

## 2. Design tokens

### Color
```
--bg-cream:    #FAF3EA   (base page background)
--bg-linen:    #F0E8DC   (mid-scroll background)
--ink-cacao:   #3D1F0D   (primary text, loading screen background)
--ink-night:   #2C1A0E   (footer background, deepest scroll state)
--accent-toffee:  #DA682F
--accent-amber:   #C89839
--accent-rosehip: #792318
--accent-moss:    #5B643E
--cream-on-dark:  rgba(245, 239, 228, 0.92)
```

### Type
- **Display:** Staff Regular (weight 400), self-hosted in `/public/fonts/` via `@font-face`. All large headlines, the wordmark, section titles, work titles, Practice rows.
- **Accent script (client-provided):** Konya — a handwritten signature script supplied by the client. Self-host from `/public/fonts/konya/` via `@font-face`. This is the "loopy y's and g's" voice. Used for: emphasized words inside the intro statement, the index-number swap on work-card hover, the shop tagline, the footer sign-off, the word "Mandakini" wherever it appears in running text. Seasoning only, never full paragraphs, and never below ~20px rendered size (signature scripts collapse at small sizes).
- **Editorial labels / numerals (client-provided):** Mailendra — an elegant display serif supplied by the client. Self-host from `/public/fonts/mailendra/` via `@font-face`. Used for: section eyebrows ("SELECTED WORKS"), all index numerals (01, the "(01 — 08)" count, Practice row indexes), and the loading-screen counter.
- **Body:** EB Garamond. Descriptions, captions, metadata.
- **UI:** Jost. Nav, buttons, form elements.

**Font fallback rule:** if the Konya or Mailendra files are not yet present in `/public/fonts/`, do NOT block or error: fall back to Fraunces Italic (Google, accent role) and Cormorant SC (labels role) respectively, wired through the token layer so the swap is a one-line change when the files land. Log the missing files under "NEEDS FROM AP" in PROGRESS.md. The client has also supplied Cannia, Sephir, Mileur, Utorus, and Tessa; do not use these in this pass, but keep the font tokens generic (`--font-accent`, `--font-label`) so any of them can be trialed later without touching components.

Define all of the above as CSS custom properties / a tokens file so no component hardcodes values.

---

## 3. Motion system (build this FIRST — everything else consumes it)

Create `lib/motion.ts` (or extend the existing motion utility) exporting:

### 3.1 Master ease
```js
// register once
CustomEase.create("mandakini", "0.25, 1, 0.5, 1");  // expo-ish out
// scrubbed/settling moments may additionally use:
// cubic-bezier(0.76, 0, 0.24, 1) as "mandakini-inout"
```
If the GSAP CustomEase plugin is unavailable, implement the equivalent with `gsap.parseEase` of a matching expo curve. Every tween in the codebase references these named eases. Zero tweens with default `power1.out`.

### 3.2 Timing scale
```
fast:   0.6s   (hovers, small UI)
base:   1.0s   (image reveals)
grand:  1.4s   (hero-scale moments)
stagger: 0.08s (text lines), 0.05s (small bursts)
```

### 3.3 Reveal primitives (the only two reveal moves on the site)
- **`revealLines(el)`** — text reveal. Split text into lines (SplitType or GSAP SplitText), wrap each line in an `overflow: hidden` mask, animate `yPercent: 110 → 0` with line stagger, master ease, duration `base`. Used for every headline, title, and paragraph entrance on the site.
- **`revealImage(el)`** — image reveal. The image always sits at `scale: 1.12` inside a rounded-mask container. On reveal: container `clip-path: inset(100% 0 0 0) → inset(0)` while the inner image counter-scales `1.25 → 1.12`. Duration `base`, master ease. The painting is uncovered, never slid in.

These two primitives are the entire reveal vocabulary. Do not introduce fades-from-below, rotations, or other entrance styles.

### 3.4 Lenis configuration
```js
new Lenis({ duration: 1.1, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
```
Single Lenis instance at app level, RAF-driven, synced to ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker`. Disable on `prefers-reduced-motion`.

### 3.5 Continuous background scrub
The page background is ONE element (body-level). A single ScrollTrigger timeline tweens `background-color` through the scroll journey: `#FAF3EA` (hero + intro) → `#F0E8DC` (through Selected Works) → very slightly deeper warm through The Practice → `#2C1A0E` as the footer enters, with text colors inverting in sync via a CSS class or color custom-property tween. **No section may render its own opaque background rectangle.** This is the core of the seamless feel.

### 3.6 Velocity skew
Lenis velocity feeds a clamped `skewY` (max ~1.5deg) and tiny letter-spacing stretch on elements tagged `[data-velocity-skew]` (the large display headlines). Lerps back to 0 on scroll stop. Subtle; if it's noticeable as an effect it's too strong.

### 3.7 Accessibility & performance rules
- `prefers-reduced-motion: reduce` → Lenis off, all pins off, reveals become simple opacity fades, cursor follower off, loading screen reduces to wordmark + ENTER.
- `will-change` only while animating; remove after.
- All images via `next/image` with proper `sizes`. Hero and loading portraits preloaded.
- Mobile: touch fallbacks defined per section below; never leave hover-only functionality dead on touch.

---

## 4. Loading screen

**Scene.** Full-viewport, background `#3D1F0D` (deep cacao — NOT black, NOT white). The nine painted MS Subbulakshmi portraits arranged in the Ravana ten-heads fan formation, glowing against the dark like paintings in a dim gallery. Each portrait sits in the same rounded organic mask language as the rest of the site. Wordmark "MANDAKINI RAO" in Staff Regular, `--cream-on-dark`. A 0–100 counter in Mailendra (`--font-label`), amber `#C89839`, ticking with real asset-load progress (clamped to a minimum 1.8s runtime so it never flickers past).

**Entrance.** Portraits reveal one by one (0.05s stagger) using `revealImage`, center-out order. Wordmark reveals via `revealLines` after the fan completes. Counter runs throughout.

**ENTER.** At 100: counter crossfades into a circular ENTER button (circle, thin cream stroke, Jost label, slow idle breathing scale 1.0↔1.03). Tiny cat mark in rosehip beside the wordmark.

**Exit — the iris reveal ("opens up to her website").** On ENTER click:
1. The eight outer portraits fade and drift slightly outward (each on its own vector, 0.05s stagger, duration `fast`).
2. A soft-edged circular aperture opens from the center portrait's position outward until it exceeds the viewport diagonal, revealing the cream hero beneath the dark layer. Implement as an animated `clip-path: circle(r at cx cy)` on the dark layer (with a slightly feathered edge via a duplicate blurred layer if needed). Duration `grand`, master ease. Dark gallery → sunlit studio: that contrast is the brand moment.
3. Simultaneously, the loading wordmark FLIP-morphs (GSAP Flip plugin) from its loading position to its hero position. The name never disappears and reappears — it travels.
4. Scroll is locked (Lenis stopped) until the iris completes; then hero entrance plays and scroll unlocks.

The loading screen mounts only on first visit per session (sessionStorage flag); subsequent navigations to `/` skip to the hero with its entrance animation only.

---

## 5. Hero — layered parallax

**Layers (back to front):**
1. **Background:** the studio environment from `portrait-home-studio-color` (assets folder `website june 2026 ap`), desaturated with the warm tint overlay (CSS filter + tint layer — tint, not grain). Slowest layer.
2. **Midground:** "MANDAKINI RAO" in Staff Regular, huge (clamp to ~12vw), `--cream-on-dark` with the existing soft text shadow, positioned in the lower third (final resting position consistent with `bottom: 4vh` spec). Medium parallax speed.
3. **Foreground (conditional):** a transparent-PNG cutout of Mandakini at `/public/images/hero/mandakini-cutout.png`, overlapping the bottom portion of the letterforms so the name sits BEHIND her. Fastest layer. **If this file does not exist, render the two-layer version gracefully (background + name) with no errors and no layout shift — structure the component so the cutout layer is purely additive when the asset lands.**

**Motion.**
- Scroll parallax: per-layer `yPercent` differentials via one scrubbed ScrollTrigger (background slowest, foreground fastest).
- Desktop mouse parallax: pointer position lerped (0.06 lerp factor) into ±8px background / ±20px foreground translation. Off on touch.
- Entrance (post-iris): background settles `scale 1.08 → 1.0` (duration `grand`); name arrives via the FLIP morph from the loading screen; cutout rises 40px with fade; nav fades in last. No grain at any point; no black at any point.

**Scroll exit — the frame reveal.** Pin the hero for ~120vh. As the user scrolls: the cream page background "eats inward" from all four edges (animate the hero media container's inset/border-radius growing, like margins growing around a plate in an art book) while the imagery inside counter-scales `1.0 → 1.08` (camera pushing in as the page reclaims the frame). The name's letters drift apart slightly (letter-spacing tween) and fade by ~60% progress. The hero ends as a wide editorial band, with the intro statement's first line already visible beneath, pulling the eye down. No postcard, no tilt, no white border, no linen landing.

---

## 6. Intro statement

One large editorial paragraph, first person, ~40 words (pull final copy from Sanity if a field exists; otherwise placeholder: "I paint, photograph and teach from my studio in Hyderabad. My work moves between canvas and camera, looking for the same warmth in both.").

- Set in Staff Regular at ~3.5vw, max-width ~28ch, asymmetrically placed (offset left).
- Emphasized words ("paint", "photograph", "Hyderabad", "warmth") set in Konya script (`--font-accent`), slightly larger, in toffee `#DA682F` — this is where the loopy descenders live.
- Reveals via `revealLines` on enter.
- **Handoff:** the paragraph pins briefly (~40vh) while the first Selected Work's mask begins opening beneath it, then releases.

---

## 7. Selected Works (the ChungiYoo section)

**Data:** 6–8 works from Sanity (use the existing works query/schema; if a `featured` flag doesn't exist, take the most recent 8 and leave a TODO).

**Layout.** Asymmetric two-column editorial grid, desktop: left column starts high, right column offset ~20vh lower; cards alternate large (~55% width) and small (~35% width); generous cream space; no horizontal row alignment anywhere. Mobile: single column, alternating widths (~92% / ~78%) and left/right alignment to keep the rhythm.

**Anatomy of one work (a composed object, not a card):**
- Artwork image inside a rounded organic mask (large, slightly irregular radius — use a superellipse-feeling radius set, e.g. asymmetric corner radii, so corners feel drawn). Image at `scale: 1.12` inside.
- Above the mask: index "01" in Mailendra (`--font-label`) + a short amber rule.
- Below: title in Staff Regular; year + medium in EB Garamond.
- One or two works get a small handwritten-style SVG annotation (placeholder SVG with a hand-drawn underline/arrow; flag in PROGRESS.md that real digitized handwriting will replace it).
- No borders, no shadows, no background panels.

**Section header.** Eyebrow "SELECTED WORKS" in Mailendra (`--font-label`) + index count "(01 — 08)", revealed via `revealLines`.

**Scroll behavior.**
- Each work enters via `revealImage` + `revealLines` (type follows mask by 0.1s).
- While in view: slow lazy parallax of the image inside its mask (the 1.12 oversize provides the travel room); large works drift slightly slower than small ones. One scrubbed ScrollTrigger per work.

**Hover (desktop) — three simultaneous moves on master ease, duration `fast`:**
1. Image `scale 1.12 → 1.18` AND the warm desaturation tint lifts (filter/tint opacity tween) so the painting's true colors bloom — resting = desaturated warm treatment, hover = the painting waking up.
2. Title slides 10px right; index number crossfades into the same number handwritten in Konya script (`--font-accent`), amber.
3. The circular VIEW cursor (section 12) becomes active over the whole composed object.
Entire object is one link → `/works/[slug]` (or `/works` if detail routes don't exist yet — check PROGRESS.md).

**Touch fallback.** The color-bloom + title shift trigger via ScrollTrigger when the work crosses viewport center (and reverse on exit).

**SEE ALL.** Pill button (Jost, cacao on cream, inverts on hover) → `/works`. Implement as a normal route link for now; shared-element transition to the Works page is a later prompt.

**Handoff out:** as the final work releases, the first Practice row's rule line draws in across the viewport width (scaleX 0→1, scrubbed).

---

## 8. The Practice

Type-led counterpart to the image-led works grid. Three full-width rows: **PAINTING / PHOTOGRAPHY / TEACHING.**

**Anatomy per row:** thin rule above (drawn in on scroll, scaleX, scrubbed); small index 01/02/03 in Mailendra (`--font-label`); the discipline word as one massive Staff Regular line spanning the viewport (~9vw), rendered in OUTLINE (text-stroke, cacao, transparent fill); a one-line EB Garamond description tucked under the right end:
- PAINTING — "originals and commissioned canvases" → `/works` (filter to paintings when filters exist; unfiltered for v1, leave TODO)
- PHOTOGRAPHY — "editorial and personal photography" → `/works` (same TODO)
- TEACHING — "classes from the Hyderabad studio" → `/learn`

**Hover (desktop):**
- A floating preview (~24vw, same rounded mask language, image at 1.12) fades + scales in and follows the cursor with soft lerp (factor ~0.08). Architecture: a fixed-position follower containing the row's 2–3 preview images stacked vertically, switching rows via `y: index * -100%` tween (translate-stack mechanism — see references). As the cursor travels along a row, cycle that row's images with quick crossfades using a distance threshold: only advance after the pointer has moved ≥120px (`Math.hypot` on pointer deltas) so it feels liquid, never jittery.
- The hovered word fills: outline → solid cacao (animate text fill/stroke), word nudges 12px right, index turns amber.
- Use the section 12 cursor in "view" mode over rows.

**Touch fallback.** Each row shows a static small preview image beside the word; the outline→solid fill triggers at viewport center.

**Preview images:** pull representative pieces per discipline from Sanity if categorization exists; otherwise hardcode three asset references with a TODO.

**Handoff out:** the third row holds (short pin) while the shop teaser's prints rise behind/beneath it.

---

## 9. Shop teaser

Two or three prints (Sanity shop/prints query if it exists; placeholders + TODO otherwise), same composed-object anatomy as Selected Works but smaller, arranged on an offset diagonal. Each print carries the **cat edition stamp**: small rosehip cat mark in a circle, top-right of the mask, applied with a quick scale-overshoot (1.3→1) as the print reveals — the only playful overshoot on the page. Eyebrow "PRINT EDITIONS" in Mailendra + a Konya script line "limited runs, signed in Hyderabad". Pill CTA "SHOP PRINTS" → `/shop`. Hover matches the works-card behavior exactly (same dialect).

---

## 10. Press strip

Compact editorial list, 3–4 items (Sanity press query if present; placeholders + TODO otherwise). Each row: publication name in Staff Regular (~2vw), year in Mailendra (`--font-label`), thin rule between rows drawn in on scroll. Hover: row text slides 10px right + an animated underline draws under the publication name (same `fast` timing as the cards — one language). Rows reveal via `revealLines`. Bare-text-link rows, no pills. Section links nowhere globally; rows link out to articles (external, `target="_blank"`) when URLs exist.

By this point the background scrub is heading toward dark; ensure text colors have inverted via the section 3.5 system before the footer.

---

## 11. Footer

Background reached via the global scrub to `#2C1A0E` (the footer itself stays transparent; the PAGE darkens into it — no seam). Giant cream wordmark "MANDAKINI RAO" in Staff Regular, revealed via `revealLines` as it enters. Nav links (Jost), social links as bare text. The Persian cat mark sits at the bottom-right edge, half-cropped by the viewport edge. Sign-off line in Konya script, cream: "Painted in Hyderabad." Pill CTA for contact if a contact route exists.

---

## 12. Custom cursor (desktop only)

A single global cursor follower: cream `#FAF3EA` circle, lerped behind the pointer (factor ~0.12), default ~12px dot.
- Over Selected Works objects and shop prints: expands to ~72px with "VIEW" in Jost, cacao.
- Over The Practice rows: same expansion, label "OPEN" (or "VIEW" — keep one if simpler).
- Over the ENTER button on the loading screen: the system cursor hides and the follower expands around the button.
- `mix-blend-mode: difference` is NOT used (it creates blue-ish artifacts on warm palettes); use solid cream with cacao text.
- Fully disabled on touch devices and under reduced motion; native cursor remains functional underneath at all times (the follower is `pointer-events: none`).

---

## 13. Reference patterns (study the mechanism, rebuild in GSAP + our tokens; never install as-is)

1. **21st.dev — "Services with Animated Hover Modal" (cnippet_dev):** the Practice section's blueprint — list rows with a cursor-following modal revealing stacked images via `top/y: index * -100%`. It is Framer Motion; translate to GSAP. Its ease `cubic-bezier(0.76, 0, 0.24, 1)` matches our "mandakini-inout".
2. **fancycomponents.dev — ImageTrail docs:** the lerp `intensity` + `Math.hypot` distance-threshold pattern for liquid cursor-followers; apply to the Practice preview cycling.
3. **CodePen gusevdigital `dygLbqJ` and designcourse `vYQQKBW`:** Lenis + GSAP + SplitType text reveal on scroll — the exact stack for `revealLines`.
4. **Codrops GSAP + Lenis articles:** section pinning and seamless handoff patterns.
Rule: mechanics may be borrowed; markup, styling, easing, and tokens are always ours. No Framer Motion. No component installed verbatim.

---

## 14. Definition of done

- One continuous scroll from iris reveal to footer with zero hard cuts: every section handoff overlaps per the specs above.
- Single body background element scrubbing cream → linen → night; no section background rectangles.
- Both reveal primitives used everywhere; no stray entrance styles; no default eases.
- 60fps scroll on a mid-range laptop (transform/opacity/clip-path only; no animating layout properties; no scroll-linked filters on large surfaces except the hover tint, which is per-card).
- Reduced-motion path verified.
- Mobile verified: touch fallbacks active, cursor follower absent, loading screen and hero fully functional, no hover-dead zones.
- No console errors; missing-asset fallbacks (hero cutout, Sanity gaps) degrade gracefully with TODOs logged.

## 15. Files to read / touch

**Read first:** `PROJECT.md`, `PROGRESS.md`, `PROMPT_LOG.md`, existing `app/page.tsx` (or equivalent), existing loading/hero components, existing Sanity query utilities, existing global styles/tokens.

**Expected to create or rewrite (adapt names to the existing structure):**
- `lib/motion.ts` (or extend existing) — eases, timings, revealLines, revealImage, Lenis setup, velocity skew, background scrub controller
- `components/home/LoadingScreen.tsx`
- `components/home/Hero.tsx`
- `components/home/IntroStatement.tsx`
- `components/home/SelectedWorks.tsx`
- `components/home/ThePractice.tsx`
- `components/home/ShopTeaser.tsx`
- `components/home/PressStrip.tsx`
- `components/layout/Footer.tsx`
- `components/ui/CursorFollower.tsx`
- token/global style files for the section 2 tokens and the Konya + Mailendra @font-face additions (with the fallback rule)
- `app/page.tsx` composition

Do not touch: Sanity schemas (read-only this pass), checkout/shop logic, Learn pages.

## 16. On completion (required)

1. Update `PROGRESS.md`: what was built, every TODO left (hero cutout asset, Sanity featured flag, works filters, real handwriting SVGs, press URLs, shop data), and any deviations from this spec with reasons.
2. Append a dated entry to `PROMPT_LOG.md` summarizing this prompt and the outcome.
3. List the asset requests for AP in PROGRESS.md under "NEEDS FROM AP": (a) Mandakini cutout PNG from the studio shoot, (b) nine Subbulakshmi portrait finals if placeholders are still in use, (c) digitized handwriting samples, (d) per-discipline preview image picks for The Practice, (e) Konya and Mailendra font files (woff2 preferred) dropped into /public/fonts/konya/ and /public/fonts/mailendra/ if not already present, (f) confirmation that commercial web licenses are held for Konya and Mailendra before launch.
