# Mandakini Rao — Design System

_Last updated: 12 June 2026. The single source of truth for how the site
looks and moves. If a change disagrees with this document, update one of
them deliberately._

## 1. Identity in one line

A dark gallery-poster site: black stage, cream type, marigold reserved
for surfaces, her artwork as the only loud thing in the room.

## 2. Color tokens

Defined in `app/v2.css` (`:root` + `body.mr2-mode[.mr2-light]`).

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--v2-bg` | `#0d0a07` | `#f2ead9` | page background |
| `--v2-bg-deep` | `#060606` | `#ece2cd` | hero/loader stage |
| `--v2-fg` | `#f5efe4` | `#221408` | all primary text |
| `--v2-fg-dim` | fg @ 60% | fg @ 60% | secondary text (12px floor) |
| `--v2-fg-faint` | fg @ 16% | fg @ 16% | rules, borders |
| `--v2-card` | `#11100c` | `#faf4e8` | raised surfaces |
| `--v2-marigold` | `#efa72e` | same | **surfaces & accents only — never body text** (sun, stamp, toggle dot, sale links via `--accent-toffee`) |
| `--v2-indigo` | `#4e5180` | same | card stock, ghost cards |

Bridges: `body.mr2-mode` maps `--ink-current`, `--scroll-bg`,
`--ink-muted-current`, `--rule-current` onto the V2 tokens so legacy
(V1-era) components recolor automatically.

**Rules:** text is always `--v2-fg` or `--v2-fg-dim`; marigold/indigo
never carry sentences; blend-difference type is allowed only on the
dark theme (light theme swaps to solid ink — see `.mr2-works__meta`).

## 3. Typography

| Token | Face | Role |
|---|---|---|
| `--font-display` | **Sephir** (approved 06/2026; Boska fallback) | names, headings, big words, piece titles |
| `--font-label` | **Mailendra** | eyebrows, counters, prices, micro-labels |
| `--font-accent` | **Konya** (script) | rare emphasis words only (V1 legacy) |
| `--font-body` | EB Garamond | long-form paragraphs |
| `--font-ui` | Jost 300/400 | buttons, captions, navigation, notes |

Approved-but-unused faces (kept in `/fonts`): Tessa, Utorus (near-twins
of Sephir), Cannia and Mileur (too deconstructed/hairline for UI —
decoration only, with sign-off).

**Type scale** (clamp-based; the floor is the law):

- Hero / footer giant: `clamp(2.4rem, 7.6vw, 7.4rem)` and up
- Section titles: `clamp(1.8rem, 3.8vw, 3.4rem)`
- Piece / product titles: `clamp(1.3rem, 2vw, 1.7rem)`
- Body & notes: `clamp(14px, 1.05vw, 16px)`
- Labels / eyebrows / prices: `clamp(12px, 1.05vw, 15px)` or fixed `12–13px`
- **Nothing on the site renders below 12px.**

Letter-spacing: uppercase labels `0.18–0.34em`; display faces never
tighter than `0.03em`.

## 4. Space, shape, surfaces

- Page gutter: `clamp(20px, 5vw, 72px)`; page top padding
  `clamp(9rem, 20vh, 13rem)` (clears fixed nav).
- Section rhythm: `13–18vh` vertical padding between major sections.
- Grids: max-width `1240px`, gaps `clamp(28px, 4vw, 64px)`.
- Image shapes: V2 surfaces use rounded rectangles
  (`6px` products, `clamp(20px, 2.6vw, 40px)` full-bleed canvases);
  inner editorial pages use the organic `.mr-mask` radii. Aspect
  ratios: portrait work `4/5`, series opener `16/9`.
- Pinned sections must paint `background: var(--v2-bg)` (prevents
  bleed-through during ScrollTrigger transitions).

## 5. Motion grammar

All motion runs through `lib/motion.ts` (GSAP + Lenis). Tokens:
`DUR.fast .6s / base 1s / grand 1.4s`, ease `mandakini`
(`0.25, 1, 0.5, 1`).

- **Loader**: cream field, dark slits widen to black; the name lives in
  blend-difference; rectangular ENTER. Plays once per browser session
  (`sessionStorage mr2-intro-seen`; an inline `<head>` script sets
  `html.mr-intro-seen` pre-paint so returning visitors never see a
  flash).
- **Hero**: gallery row — equal-height strips, hovered card takes the
  width (`width` transition, 0.55s).
- **Two Decades**: one B&W photograph; the word ticker rolls on its own
  clock (3.6s hold, 0.6s out / 1.15s in), pauses off-screen.
- **Projects (home)**: pinned Rising Sun stage; snap-stepped advances;
  spring hover (cards tilt + fan, `back.out(2.2)`).
- **Everything else**: scrubbed or short (≤1s) reveals; marquees are
  pure CSS. Never time-based reveals on scroll triggers that a fast
  scroll can outrun — scrub or roll instead.
- `prefers-reduced-motion`: every component renders its final state
  statically; marquees stop.

## 6. Components

- **Buttons**: rectangular tags (border 1px fg, uppercase 12px Jost,
  invert on hover). The marigold "Say hello" tag is the only filled one.
  No circles.
- **Cursor**: native cursor + a label chip (`View / Enter / Drag`)
  beside the pointer over `[data-cursor]` targets; hides on leave,
  scroll, click.
- **Theme toggle**: fixed top-right beside the nav burger; persists via
  `localStorage mr2-theme`.
- **Footer (`FooterV2`)**: identical on every page — link columns,
  marigold tag, cropped giant MANDAKINI.
- **Sale indication**: toffee uppercase underlined label
  "For sale · Edition…" linking to the print's `/shop/[slug]`;
  otherwise muted "Not for sale".

## 7. Accessibility

12px type floor; focus-visible outlines (marigold) on all interactive
elements; decorative images `alt=""`/`aria-hidden`; difference-blend
text replaced with solid ink wherever the math fails (light theme);
reduced-motion fallbacks everywhere; touch devices skip hover-only
behaviors.
