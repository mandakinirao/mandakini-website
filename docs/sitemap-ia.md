# Mandakini Rao — Sitemap & Information Architecture

_Last updated: 12 June 2026 (rev. 2 — scalability model folded in;
companion: `scalability-plan.md`, `design-system.md`)._

## 1. Sitemap

```
/                       Home (the site — dark "gallery poster"; fixed size, never grows)
│
├── /works              Projects index — two tiers: featured rows + the full list
│   └── /works/[slug]   Series detail — all pieces, notes, sale links
│
├── /shop               Shop index — 12 per view + load-more; sold-out badges
│   └── /shop/[slug]    Product detail — specs + "Enquire to purchase" (Buy in V1.x)
│
├── /about              About (stub — pending content)
├── /press              Press (stub — pending content)
├── /contact            Contact (enquiries land here)
├── /privacy            Privacy & legal (stub — footer legal line links here)
│
├── /?v=1               Retired V1 pitch (kept as-is, untouched; remove at sign-off — §7)
├── /studio/[[...tool]] Sanity Studio (content management)
└── /admin              Admin — order management (auth-gated; see §5)
```

**Reserved for Phase 2 (do not use these slugs for anything else):**
`/learn`, `/classes`, `/login`, `/account`. See §8.

## 2. Home page — fixed size by design

Section order: 1. Loader (once per session) → 2. Hero (Subbulakshmi
gallery row) → 3. About: "Two Decades" (one photo + rolling words)
→ 4. Projects (Rising Sun) → 5. Shop (quiet grid) → 6. Contact
invitation → 7. Voices & Press → 8. Footer.

**Caps (the scalability contract):** Projects shows at most **4
featured** series; Shop shows at most **3 featured** prints; the press
marquee takes at most **8** items. Sources are the curated
`siteSettings.featuredProjects` / `featuredShopItems` arrays (Phase B),
falling back to most-recent published. However much content exists,
the homepage's length and weight are constant. "All projects →" and
"Visit the shop" are the doors to everything else.

## 3. /works — the index that scales

Two tiers:

- **Tier 1 — Featured:** up to 3 series as large editorial rows (name,
  context line, three images). Same curation source as the homepage.
- **Tier 2 — The index:** *every* published series as one compact list
  row — numeral · series name · medium · piece count — with a floating
  cover preview on hover (inline thumbnail on touch). ~90px per row:
  30 projects ≈ four screens of scannable list.
- **Medium filter chips** render only when there are more than 8
  projects.
- **Empty state:** zero published projects → one quiet line + link
  home. Never a blank grid.

`/works/[slug]`: opener + paired grid; images lazy-load from the Sanity
CDN; above **24 pieces** the page shows 24 + a "Show all N pieces"
expander.

## 4. Content model (what an editor touches)

**A *Project* is a named series of works** — not a single artwork.
Sanity `project` document:

| Field | Drives |
|---|---|
| `title`, `slug` | series name, `/works/[slug]` URL |
| `projectNote`, `medium` | context line + index row + filter chip |
| `coverImage` + `artworkImages[]` | covers, grids, detail page |
| `displayOrder`, `status` | ordering; only `published` appears |

Publishing a project automatically populates `/works` (Tier 2) and its
own page. Being *featured* (dragged into Site Settings) additionally
puts it on the homepage and `/works` Tier 1.

**A *Piece*** (one painting/photo inside a series): image, title,
optional note, optional `shopItem` reference — the Sanity `artwork`
document (wiring is Phase B). **Interim rule:** no `shopItem`
reference → no "For sale" marker renders. No dead ends in the selling
loop. CMS-added series meanwhile show images with auto-numbered
captions only.

**A *Print*** (Sanity `shopItem`) drives `/shop` and `/shop/[slug]`.
Phase B adds: `featured`, `editionSize`, `sold` (webhook-managed),
`available` (manual override), `category`. `sold ≥ editionSize` or
`available: false` ⇒ the site shows a **Sold out** badge and disables
purchase/enquiry CTA (sold work stays visible — it's provenance, not
clutter).

**Freshness at scale:** pages are static with tag-based revalidation —
a Sanity publish webhook triggers `/api/revalidate` (Phase B). Fast at
any content volume.

## 5. Commerce model (phased) & /admin

**V1 (launch):** enquiry-based, no cart. Product page → "Enquire to
purchase" → `/contact` with the print pre-referenced. The `order`
schema exists but is dormant.

**V1.x (post-launch, already architected — see `scalability-plan.md`
§6):** Stripe hosted Checkout on `/shop/[slug]` → signature-verified
webhook → Sanity `order` document + edition `sold` increment (auto
sold-out at the limit) → Resend confirmation emails → Mandakini marks
shipped from `/admin`. Launch-blocking for V1.x, not optional.
Originals remain enquiry-only in all phases.

**/admin:** auth-gated (single user, zero technical knowledge assumed,
`noindex`). V1.x scope: orders list (newest first) → detail (buyer,
print, edition no., amount, Stripe ref) → one-button "Mark as shipped"
(fires the Resend shipping email). Refunds/inventory/analytics live in
Stripe/Sanity directly.

The selling loop (the IA's spine):

```
Home → Projects → Series page → piece marked "For sale · Edition…"
     → /shop/[slug] (specs, price) → Buy (V1.x) or Enquire (V1)
     → Stripe Checkout or /contact
```

Every level links down and back up (`← All projects`, `← The shop`,
prev/next series). Sideways entries (`/shop` direct, press → contact)
all resolve.

## 6. Navigation & footer (identical on all pages)

- **Nav**: fixed wordmark (top-left, → `/`) + menu (top-right):
  Works · Shop · About · Press · Contact.
- **Theme toggle**: top-right, persists across pages.
- **Footer**: Pages column, Elsewhere (Instagram/YouTube), "Say hello"
  tag → `/contact`, legal line → `/privacy`, giant MANDAKINI.

## 7. States & rules

- Loader: once per browser session; never on refresh/back-navigation
  (pre-paint `html.mr-intro-seen` guard).
- **Theme:** dark default; light is a persisted user choice; both
  themes on every page; no page may diverge. The palettes of record
  are the implemented ones (resolved 12 June 2026 in favour of the
  approved build): *dark* = warm near-black `#0d0a07` ground with warm
  cream `#f5efe4` type; *light* = warm cream `#f2ead9` ground with
  deep brown `#221408` type — never generic white. Accents: marigold
  `#efa72e` (surfaces only, never body text) and indigo `#4e5180`
  (artwork-derived; card stock and ghost surfaces only). Full tokens in
  `design-system.md`.
- 404 → Next default for unknown series/print slugs (`notFound()`).
- **Empty states:** `/works` and `/shop` with zero content render a
  designed quiet state (one line of copy + link back home), never a
  blank grid or error.
- **Retired `/?v=1` route:** kept exactly as-is (no edits) until the
  homepage is signed off by Mandakini; deleted in that same PR.
  Owner: AP.
- Pending content (stubs to build next): `/about`, `/press`,
  `/privacy`, `/contact` form, real series + artwork data in Sanity,
  testimonial quotes, press/podcast/interview entries with links.

## 8. Phase 2 (recorded to prevent collisions)

- `/learn` or `/classes`: class content, gated behind member login.
- `/login` + `/account`: member auth and dashboard.
- Secondary domain **mandakiniartstudio.com** fronts the Phase 2
  learning experience; final domain/route split TBD.
- No Phase 1 decision (slugs, auth, theming, nav) may foreclose these.
