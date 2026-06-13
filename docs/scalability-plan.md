# Scalability & Commerce Execution Plan

_Drafted 12 June 2026. Planning document — agreed before further build.
Companion to `sitemap-ia.md` (the IA of record) and `design-system.md`._

## 0. Scale assumptions (design targets)

| Content | Year 1 | Design ceiling |
|---|---|---|
| Projects (series) | 5–8 | **30** |
| Pieces per series | 5–15 | **40** |
| Shop items | 5–15 | **60** |
| Press/podcast items | 10–20 | 50 |
| Orders | low volume (art prints) | ~20/month |

The rule everywhere: **curation at home, scannability at the index,
depth at the detail page.** Nothing on the homepage grows with content
volume; indexes grow in scan-time, not scroll-time; only detail pages
are allowed to be long.

## 1. Homepage — fixed-size by design

- **Projects stage:** shows exactly the *featured* projects, capped at
  **4** regardless of how many exist. Source: `siteSettings.
  featuredProjects` (a drag-ordered array of references Mandakini
  curates), falling back to the 4 most recent published. 20 projects in
  Sanity → homepage unchanged. "All projects →" is the door to the rest.
- **Shop teaser:** exactly **3** featured prints
  (`siteSettings.featuredShopItems`, fallback: 3 most recent in-stock).
- **Press marquee:** capped at 8 items in the query; it loops, so more
  adds nothing.
- Consequence: homepage payload and scroll length are **constant
  forever**. No redesign needed at any content volume.

## 2. /works index — the page that must scale (redesign)

Current design (every series as a giant editorial block) is good at 3
and unusable at 20. Replace with a two-tier index:

- **Tier 1 — Featured (top):** up to 3 large editorial rows (the
  current treatment), driven by the same `featuredProjects` curation.
  The page keeps its wow.
- **Tier 2 — The index (below):** every project as one **compact list
  row**: index numeral · series name (display face) · medium · year ·
  piece count, with a cover image that floats beside the cursor on
  hover (touch: small inline thumbnail). One row ≈ 90px → 30 projects
  ≈ 4 screens of elegant, scannable list. This is the "concert bill"
  pattern and it matches the poster aesthetic exactly.
- **Filters:** medium chips (Painting / Photography / …) derived from
  the data — *build the markup now, show only when project count > 8.*
- **No pagination needed:** index payload is text + one thumb per row;
  images lazy-load. Holds comfortably to 50+ projects.

## 3. /works/[slug] — depth without weight

- Pieces render in the existing opener + pairs grid; **images
  lazy-load** below the fold (Next/Image default) and come from the
  Sanity CDN at exact widths — 40 pieces is a long page but a light one.
- At > 24 pieces, the grid shows the first 24 and a quiet
  "Show all 37 pieces" expander (client-side; data is already there).
- Per-piece data comes from `artwork` documents (see §5) — title, note,
  optional `shopItem` reference. The IA's interim rule holds: **no
  shopItem reference → no sale marker.**

## 4. /shop — grid that grows politely

- Grid stays; **12 items per view + "Load more"** (client-side slice;
  the full list query is light). At 60 items that's 5 clicks or one
  filter away from anything.
- **Availability is first-class:** `Sold out` badge (muted, not hidden
  — sold work is social proof), driven by edition inventory (§6).
- **Category chips** (Prints / Originals / …) appear only when more
  than one category exists.
- Sort: curated `displayOrder` default; "Newest" toggle later if needed.

## 5. Sanity — the management model

What Mandakini does in the Studio, and what it drives:

| Her action | Result on site |
|---|---|
| Create Project (name, note, images), Publish | Appears in /works index + own page |
| Drag it into Site Settings → Featured Projects | Appears on homepage + /works Tier 1 |
| Create Artwork (image, title, note, → Project) | Becomes a captioned piece on the series page |
| Link Artwork → Shop Item | "For sale · Edition…" marker + link appears |
| Create Shop Item (price, edition size, images) | Appears in /shop + own product page |
| Toggle Shop Item "featured" / drag into Site Settings | Appears in homepage shop teaser |
| Edition sells out (auto) or she marks unavailable | "Sold out" badge, buy disabled |

Schema work this requires:
1. **siteSettings**: add `featuredProjects[]` and `featuredShopItems[]`
   reference arrays (drag-to-reorder = her curation tool).
2. **artwork** (exists, unwired): confirm fields `title`, `note`,
   `image`, `project` (ref), `shopItem` (ref, optional), `displayOrder`;
   wire queries so series pages consume artworks (fallback: project's
   `artworkImages` for image-only series).
3. **shopItem**: add `featured` (bool), `editionSize` (number),
   `sold` (number, webhook-managed), `available` (manual override),
   `category`.
4. **Studio desk structure**: pinned order — Site Settings (singleton),
   Projects, Artworks (grouped by project), Shop, Orders, Press, About.
   This is what makes it manageable for a non-technical editor.
5. **Freshness**: ISR with tag-based revalidation — a Sanity publish
   webhook hits `/api/revalidate`; pages are static-fast at any content
   volume and update within seconds of publishing. (Replaces the
   current always-dynamic fetches; required for scale + Vercel costs.)

## 6. Stripe commerce (V1.x) — architecture

Decided now so nothing built today blocks it:

```
/shop/[slug] "Buy" → POST /api/checkout
  → Stripe Checkout Session (hosted page; price/edition from Sanity,
    metadata: shopItemId; shipping address collected by Stripe)
  → success_url /shop/[slug]/thanks   cancel_url back to product
Stripe webhook → POST /api/stripe/webhook (signature-verified)
  → create Sanity `order` (buyer, item, amount, stripe ref, edition no.)
  → increment shopItem.sold  (sold ≥ editionSize ⇒ auto Sold out)
  → Resend: confirmation email to buyer + notification to Mandakini
/admin (auth-gated, single user)
  → orders list (newest first) → detail → "Mark as shipped"
  → Resend shipping email
```

- Checkout is Stripe-hosted: no card data touches the site, minimal
  compliance surface. INR pricing; shipping rates configured in Stripe.
- Inventory race (two buyers, last print): low-volume risk, handled by
  a Sanity transaction on `sold` + post-payment refund path documented
  for the one-in-a-thousand case.
- Originals never get a Buy button — enquiry only, all phases.
- Env needed at V1.x: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `SANITY_API_WRITE_TOKEN`, `RESEND_API_KEY`, plus auth secret for
  /admin.

## 7. Execution phases (order of work)

**Phase A — Scale the surfaces** *(design + build, no new services)*
- A1. /works two-tier index (featured rows + list rows w/ hover cover,
  filter chips hidden until >8). Empty state per IA §7.
- A2. /shop load-more + sold-out badge + empty state.
- A3. Homepage caps wired to curation queries (featured arrays w/
  fallbacks).
- A4. Series page ">24 pieces" expander.
- *Acceptance: seed Sanity with 20 fake projects / 40 pieces / 30
  prints; every page stays fast and scannable; homepage unchanged.*

**Phase B — Sanity for real** *(content backbone)*
- B1. siteSettings featured arrays + desk structure.
- B2. artwork wiring (queries + series page consumption + sale-marker
  rule).
- B3. shopItem inventory/featured/category fields.
- B4. ISR + revalidation webhook.
- *Acceptance: Mandakini (or AP role-playing her) can add a project,
  feature it, attach pieces, link one to a print — zero code.*

**Phase C — Commerce V1.x** *(after launch sign-off)*
- C1. /api/checkout + Buy button (feature-flagged off until ready).
- C2. Webhook → order + inventory + Resend emails.
- C3. /admin auth + order list + mark-shipped.
- *Acceptance: test-mode purchase end-to-end → order in Studio, both
  emails received, sold count incremented, sold-out flips at limit.*

**Phase D — Content completion** *(parallel with A/B)*
- /about, /press, /privacy, /contact form (form needed for V1
  enquiries), real series/testimonial/press data entry.

## 8. Open decisions (need AP / Mandakini)

1. **Palette conflict in the IA doc §7**: it names accents *terracotta
   `#B8572A` / amber `#7A4A1E`*, ground `#2C1A0E`, and says "no blues
   anywhere" — but the implemented V2 uses near-black `#0d0a07`,
   marigold `#efa72e`, and **indigo** `#4e5180` (pulled from the
   Subbulakshmi artwork, used for card stock). Either the doc adopts
   the implemented palette or the site gets repainted — this changes
   the approved look, so it needs an explicit call before anyone
   "fixes" it.
2. Featured caps: 4 projects / 3 prints on home — confirm counts.
3. /works list rows: hover-preview floating cover vs. small inline
   thumbnails always visible — taste call on desktop.
4. /admin auth flavour: single shared credential vs. email magic-link.
5. Currency/shipping zones for Stripe (INR only? worldwide flat rate?).
