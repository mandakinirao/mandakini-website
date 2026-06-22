# Prompt Log

---

## 2026-06-22 (a) — /about page redesign — full-bleed amber field

**Prompt summary:**
Replace the floating marigold card on /about with a full-bleed amber background design. Portrait bigger, bio text smaller and editorial, no rounded container/box — colour fills the entire viewport.

---

### Audit findings (before touching anything)

**Route:** `app/(site)/about/page.tsx`
**Current component:** `CanvasCards` (`components/home/v2/CanvasCards.tsx`)

- `CanvasCards` renders `mr2-about-outer` (background `var(--v2-bg)`) wrapping `mr2-about` (marigold `#efa72e`, `border-radius: clamp(1.5rem, 2.5vw, 2.5rem)`, `max-width: 1200px`) — the "floating card on cream/dark" the user dislikes.
- `mr2-about__line` bio text: `font-size: clamp(2rem, 3.4vw, 3.5rem)` — oversized display serif.
- `CanvasCards` is used **only** on `/about` — not imported anywhere on the homepage. Safe to replace.
- `ThemeV2` component adds `body.mr2-mode` on all non-V1, non-studio pages. `--ink-current` on `body.mr2-mode` becomes `var(--v2-fg)` = cream in dark mode — needs override for amber page.
- Existing `body.about-page` body class (in `about.css`) already handles logo switch and nav colour — we extend this pattern.

### Design decisions

| Element | Old | New |
|---|---|---|
| Background | Cream/dark body + floating marigold card | Full-bleed `color-mix(in srgb, var(--accent-amber) 38%, var(--bg-cream) 62%)` |
| Container | `max-width: 1200px`, `border-radius`, `padding` inside card | No container — section fills viewport |
| Portrait size | `aspect-ratio: 3/4` inside a constrained card | `aspect-ratio: 3/4`, full left column (`0.9fr`), Sanity image at `1200×1600` |
| Portrait corners | Inside a padded card | `border-radius: clamp(20px, 2.8vw, 48px)` on image mask directly |
| Bio font-size | `clamp(2rem, 3.4vw, 3.5rem)` — display serif | `clamp(1rem, 1.2vw, 1.18rem)` — body serif, 1.85 leading |
| Body class | None added | `about-page` (logo/nav) + `about-amber` (ink token override) |

### Files changed

| File | Change |
|---|---|
| `components/about/AboutFull.tsx` | New component — full-bleed amber about page |
| `styles/about.css` | `body.mr2-mode.about-amber` token override block + Section 3 (AboutFull CSS) |
| `app/(site)/about/page.tsx` | Swapped `CanvasCards` → `AboutFull`; portrait bump to `1200×1600` |

### Build

```
✓ Compiled successfully — 16 routes, zero errors
```

### Status

On branch `about-redesign`. Not merged to main. Awaiting visual review on Vercel preview.

---

## 2026-06-21 (c) — Multi-upload image diagnosis (report only)

**Prompt summary:**
Diagnose why multi-upload doesn't work for image-array fields in Studio. Audit every image-array field definition across all schemas, classify each, and report what change would enable multi-file upload and any tradeoffs.

---

### How Sanity Studio v3 handles image arrays — root cause

Sanity Studio v3's `array` of `image` items always adds **one image per "Add item" click**. The flow is: "Add item" → file picker opens → select one file → upload. There is no native "select multiple files" button in the standard Studio. The `options: { layout: 'grid' }` on the **outer** array changes how uploaded thumbnails are *displayed* (grid vs list) and exposes a drag-and-drop zone, but does not change the "Add item" single-file picker.

**The only multi-file path in standard Studio v3 is drag-and-drop**: drag several files from the OS file manager and drop them onto the array's drop zone. With `layout: 'grid'` this zone is more prominent; without it the zone exists but is less obvious. Either way, the "Add item" button will always open a single-file browser dialog.

**No schema change enables multi-select in the browser's file dialog** without a third-party plugin (e.g. `sanity-plugin-media` library) or a custom input component.

---

### Image-array field inventory

#### 1. `project.images` — `sanity/schemas/project.ts`

```typescript
defineField({
  name: 'images',
  title: 'Images',
  type: 'array',
  of: [{ type: 'image', options: { hotspot: true } }],
  options: { layout: 'grid' },   // ← outer array option
})
```

| Question | Answer |
|---|---|
| Structure | Array of bare `image` directly — no wrapper object, no caption/alt fields |
| Multi-upload support today | Partial. `layout: 'grid'` is set, so the drag-drop zone exists and is visible. Dragging multiple OS files onto the grid zone will upload them all. Clicking "Add item" still opens a single-file picker. |
| What would improve it | Nothing more needed in the schema — the grid layout is already the best Sanity offers natively. User education: tell Mandakini to drag files from Finder rather than clicking "Add item". |
| Tradeoff of change | N/A — field is already optimally configured for native Studio v3. |

---

#### 2. `shopItem.images` — `sanity/schemas/shopItem.ts`

```typescript
defineField({ name: 'images', title: 'Product Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] })
```

| Question | Answer |
|---|---|
| Structure | Array of bare `image` directly — no wrapper object, no caption/alt fields |
| Multi-upload support today | Minimal. No `layout` option set, so the array renders as a vertical list. The drag-drop zone exists but is much less discoverable — no visible grid to drop onto. "Add item" is still single-file only. |
| What would enable multi-file drag | Add `options: { layout: 'grid' }` to the outer `array` field (not to the `of: [image]` entry). |
| Tradeoff | None — this field has no caption/alt sub-fields. The change is cosmetic (grid vs list display) plus making the drag zone more obvious. No data schema change. |

---

#### 3. `siteSettings.heroImages` — `sanity/schemas/siteSettings.ts`

```typescript
defineField({
  name: 'heroImages',
  title: 'Hero Panels (7 images, centre outward)',
  type: 'array',
  of: [{ type: 'image', options: { hotspot: true } }],
  group: 'homepage',
  validation: (Rule) => Rule.max(7),
})
```

| Question | Answer |
|---|---|
| Structure | Array of bare `image` directly — no wrapper object, no caption/alt fields |
| Multi-upload support today | Same as shopItem — no `layout` set, vertical list, drag zone not visible. Single-file "Add item" only. |
| What would enable multi-file drag | Add `options: { layout: 'grid' }` to the outer `array` field. |
| Tradeoff | None — no caption/alt sub-fields. The `validation: Rule.max(7)` cap is unchanged. |

---

### Fields with single images (not relevant)

| Field | Schema | Type | Notes |
|---|---|---|---|
| `pressItem.imageOverride` | `pressItem.ts` | Single `image` with `alt` sub-field | Not an array — single image per press item, by design |
| `siteSettings.aboutPortrait` | `siteSettings.ts` | Single `image` | Not an array |
| `class.coverImage` | `class.ts` | Single `image` | Not an array |

---

### Fields that are arrays but contain no images

| Field | Schema | Type |
|---|---|---|
| `shopItem.sizes` | `shopItem.ts` | Array of objects (`label` + `price`) |
| `siteSettings.featuredProjects` | `siteSettings.ts` | Array of `reference → project` |
| `siteSettings.featuredShopItems` | `siteSettings.ts` | Array of `reference → shopItem` |
| `member.enrolledClasses` | `member.ts` | Array of `reference → class` |

---

### Summary verdict

| Field | Has `layout: 'grid'`? | Multi-drag works? | Click-to-multi? | Schema fix needed? |
|---|---|---|---|---|
| `project.images` | ✓ yes | ✓ yes (drag) | ✗ no (Studio limit) | None — already optimal |
| `shopItem.images` | ✗ no | ✗ drag zone hidden | ✗ no | Add `options: { layout: 'grid' }` |
| `siteSettings.heroImages` | ✗ no | ✗ drag zone hidden | ✗ no | Add `options: { layout: 'grid' }` |

**Root cause in one sentence:** `project.images` already has `layout: 'grid'` (drag-drop multi-upload is available but not obvious); `shopItem.images` and `siteSettings.heroImages` are missing `layout: 'grid'` entirely, making even drag-drop hard to discover. True "click to select multiple" is not available in standard Sanity Studio v3 without a plugin — it is a platform limitation, not a schema bug.

**If the user wants true multi-select via file picker:** The `sanity-plugin-media` package provides a proper asset library browser with multi-select capability and replaces the default image upload UI across all image fields with zero schema changes.

---

## 2026-06-21 (b) — shopItem dangling artwork reference fix

**Prompt summary:**
Urgent fix — Studio failing to load with "Unknown type: artwork" because `shopItem.artwork` referenced the now-deleted `artwork` type. Audit reads and dataset data, then remove the field if safe.

---

### Step 1 — Audit

**Field definition (`sanity/schemas/shopItem.ts` line 10):**
```typescript
defineField({ name: 'artwork', title: 'Artwork', type: 'reference', to: [{ type: 'artwork' }] })
```

**Reads in app/components/lib/sanity/lib:** 0 — field was never queried or rendered anywhere.

**Dataset check (GROQ `*[_type == "shopItem" && defined(artwork)]`):** 0 documents — no shopItem has this field populated.

**Other `artwork` in schema files:** One prose comment in `enquiry.ts` ("NOTE: this document never references private artworks") — not a type reference, no action needed.

**Conclusion:** Safe to remove. No data loss, no rendering breakage.

### Step 2 — Fix

Removed line 10 from `sanity/schemas/shopItem.ts`. No query or component changes required.

### Step 3 — Verification

**Schema grep for `{ type: 'artwork' }` after fix:** 0 hits across all schema files.

**Build:** ✓ zero errors. 16 routes. Pre-existing warnings unchanged.

---

## 2026-06-21 (a) — Project/artwork schema collapse

**Prompt summary:**
Collapse the two-type structure (`project` series + `artwork` piece) into a single `project` type — showcase only, no commerce. Migrate data, rewrite schema, remove `artwork` type, update all queries/lib/components. Verify zero build errors. Commit and push.

---

### Step 1 — Audit

| Type | Documents in dataset | Safe to remove? |
|------|---------------------|-----------------|
| `artwork` | 0 | Yes — no data to migrate |
| `project` | 1 draft (Fragments Charcoal) | `title` exists; `seriesName` absent — needs patch before schema change |

`allSeriesQuery` artwork sub-query path: dead code (0 artwork docs). Falls back to `coverImage`/`artworkImages` path which also returns nothing — page already shows `PLACEHOLDER_SERIES`.

### Step 2 — Data migration

Patched `drafts.d15c7417-4ecb-47ca-9af9-93feb041882d` (Sanity MCP `patch_documents`):
- Set `seriesName = "Fragments Charcoal"` (copied from `title`)
- Slug `fragments-charcoal` already correct — unchanged
- Verified via GROQ: both `seriesName` and `slug` confirmed present

### Step 3 — Schema rewrite (`sanity/schemas/project.ts`)

New fields:

| Field | Type | Notes |
|-------|------|-------|
| `seriesName` | `string` | Required. Replaces `title`. |
| `slug` | `slug` | Source: `seriesName`. Required. |
| `description` | `text` (rows: 5) | Replaces `projectNote`. |
| `images` | `array of image` | Grid layout. Replaces `coverImage` + `artworkImages`. |
| `year` | `number` | Optional. |
| `displayOrder` | `number` | Lower = first on Works page. |

Removed fields: `title`, `status`, `coverImage`, `artworkImages`, `medium`, `dimensions`, `projectNote`, `projectType`, `relatedProjects`.

### Step 4 — Artwork type removed

- `sanity/schemas/artwork.ts` deleted
- `sanity/schemas/index.ts`: removed `artworkSchema` import and array entry

### Step 5 — Queries updated (`sanity/lib/queries.ts`)

Both `allSeriesQuery` and `featuredSeriesQuery` updated:
- Project fields now: `_id`, `seriesName`, `"slug": slug.current`, `description`, `images`, `year`
- Removed: `title`, `medium`, `projectNote`, `coverImage`, `artworkImages`, artwork sub-query
- Removed `status == "published"` filter — client uses `perspective: 'published'` globally

### Step 6 — `lib/home-data.ts` changes

- `HomeSeries` interface: removed `medium: string`
- `PLACEHOLDER_SERIES`: removed `medium` from all 3 entries
- Removed `SanitySaleLite` interface, `SanityArtworkLite` interface, `saleFrom()` function
- `SanitySeriesLite` interface rewritten: `seriesName?`, `slug?`, `description?`, `images?`, `year?`
- `mapSeriesDoc()` rewritten: uses `d.seriesName`/`d.description`/`d.images` directly; no artwork paths

### Step 7 — Components updated

| File | Change |
|------|--------|
| `components/works/WorksIndex.tsx` | Removed `useState` import, `filter`/`setFilter`, `mediums`, `showFilters`, filters UI block, `{item.medium}` in Tier 1 meta and Tier 2 row, `<span class="mr-windex__medium">`, replaced `listed` with `series`, removed `filter` from deps array, removed `FILTER_THRESHOLD` constant |
| `components/works/SeriesDetail.tsx` | `{series.medium} — {series.desc}` → `{series.desc}` |
| `components/home/v2/RisingSunWorks.tsx` | Removed `<small>{item.medium}</small>` |
| `components/home/ProjectSeries.tsx` | `{item.medium} — {item.desc}` → `{item.desc}` |
| `app/api/revalidate/route.ts` | Removed `artwork` from webhook type list in comment |

### Build result

```
✓ Compiled successfully
✓ 16 routes — zero errors
```

Pre-existing warnings unchanged (2× `<img>` in Navigation and LoadingScreenStripes).

---

## 2026-06-20 (d) — siteSettings schema grouped tabs

**Prompt summary:**
Reorganise the siteSettings Studio editor into collapsible tabs using Sanity's `groups` feature. No fields added, removed, or renamed. Homepage is the default group. Add missing `description` strings to any field that lacks one.

---

### Fields audited before grouping

All 23 fields confirmed present in `sanity/schemas/siteSettings.ts` after the zombie field cleanup in the previous session:

`tagline`, `aboutPortrait`, `aboutBio`, `heroImages`, `featuredProjects`, `featuredShopItems`, `worksPageHeadline`, `worksEmptyHeadline`, `worksEmptyBody`, `shopPageHeadline`, `shopPrintNote`, `printDefaultPaper`, `printDefaultSignature`, `printDefaultShipping`, `thankYouMessage`, `privateCollectionTitle`, `privateCollectionLine`, `contactPageIntro`, `contactEmail`, `instagramHandle`, `youtubeChannelName`, `seoTitle`, `seoDescription`

### Group assignment

| Group | Fields assigned |
|---|---|
| **Homepage** (default) | `tagline`, `aboutPortrait`, `aboutBio`, `heroImages`, `featuredProjects`, `featuredShopItems` |
| **Works** | `worksPageHeadline`, `worksEmptyHeadline`, `worksEmptyBody` |
| **Shop** | `shopPageHeadline`, `shopPrintNote`, `printDefaultPaper`, `printDefaultSignature`, `printDefaultShipping`, `thankYouMessage`, `privateCollectionTitle`, `privateCollectionLine` |
| **Contact** | `contactPageIntro`, `contactEmail` |
| **Social** | `instagramHandle`, `youtubeChannelName` |
| **SEO** | `seoTitle`, `seoDescription` |

### Descriptions added or improved

Fields that had no `description` or a thin one now have a full sentence. No field names or types were changed.

| Field | Description added |
|---|---|
| `worksEmptyHeadline` | "Heading shown when no projects are published yet." |
| `worksEmptyBody` | "Supporting line shown below the empty state headline on /works." |
| `shopPageHeadline` | "Large heading on the /shop listing page." |
| `printDefaultSignature` | "Shown in the print spec table. E.g. 'Signed & numbered by hand'" |
| `printDefaultShipping` | "Shown in the print spec table. E.g. 'Rolled, worldwide from Hyderabad'" |
| `privateCollectionTitle` | "Heading for the Private Collection enquiry block on the shop page." |
| `privateCollectionLine` | "One or two sentences below the Private Collection heading." |
| `contactPageIntro` | "Introductory paragraph shown at the top of the /contact page." |
| `contactEmail` | "Displayed as a mailto link on the contact page." |
| `instagramHandle` | "Shown in the footer. E.g. @mandakini_rao" |
| `youtubeChannelName` | "Shown in the footer. E.g. @mandakinirao" |
| `seoTitle` | "Fallback page title used in browser tabs and search results when a page does not set its own." |
| `seoDescription` | "Fallback meta description. Keep under 160 characters." |
| `featuredProjects` | "Falls back to the four most recent published projects if left empty." |
| `featuredShopItems` | "Falls back to the three most recent available items if left empty." |
| `aboutPortrait` | "Portrait shown in the About section on the homepage." (tightened) |
| `aboutBio` | "Single sentence shown beside the portrait in the homepage About section." (tightened) |

### Build result

```
✓ Compiled successfully
✓ Type-check passed
✓ Static pages generated (16/16)
```

Pre-existing warnings only (no new issues). Field count: 23 in, 23 out. No field lost or duplicated.

### Studio verification

Groups appear as horizontal tabs at the top of the Site Settings document form. Homepage tab is active by default. Every field is visible in its assigned tab. No field appears in the unfiltered "All" view outside its group.

---

## 2026-06-20 (c) — Schema zombie field cleanup

**Prompt summary:**
Search every candidate legacy field across `app/`, `components/`, `lib/`, `sanity/lib/` before removing anything. Remove only confirmed-unreferenced fields from schema files. No commits until reviewed on localhost.

---

### STEP 1 — Grep results, field by field

#### `aboutPage` schema fields (9 legacy fields from the audit)

The `aboutPage` schema file (`sanity/schemas/aboutPage.ts`) was checked first. **Result: the schema already has only 3 fields** (`aboutBlockPortrait`, `aboutBlockBio`, `aboutTeaserLine`). The 9 legacy fields were removed from the schema in a prior session. They exist as ghost data in the Sanity document but are not schema definitions. **No schema changes needed for `aboutPage`.**

Grep results for the 9 field names (searching `app/ components/ lib/ sanity/lib/`):

| Field | Found in schema? | Found outside schema? | Location outside schema | Safe to remove from schema? |
|---|---|---|---|---|
| `heroDisplayWord` | ✗ Not in schema | ✓ Yes | `components/AboutSection.tsx` line 30 (type declaration) | N/A — not in schema |
| `heroLeadIn` | ✗ Not in schema | ✓ Yes | `components/AboutSection.tsx` line 29 (type declaration) | N/A — not in schema |
| `heroSubhead` | ✗ Not in schema | ✓ Yes | `components/AboutSection.tsx` line 31 (type declaration) | N/A — not in schema |
| `heroLeftImage` | ✗ Not in schema | ✓ Yes | `components/AboutSection.tsx` line 32 (type declaration) | N/A — not in schema |
| `heroRightImage` | ✗ Not in schema | ✓ Yes | `components/AboutSection.tsx` line 33 (type declaration) | N/A — not in schema |
| `bodyParagraph` | ✗ Not in schema | ✓ Yes | `AboutSection.tsx` line 35 (type), `about/AboutEdgeWords.tsx` lines 8, 21, 28, 40, 117, 120 (rendered) | N/A — not in schema |
| `edgeWords` | ✗ Not in schema | ✓ Yes | `AboutSection.tsx` line 36 (type), `about/AboutEdgeWords.tsx` lines 9, 22, 29, 108, 112, 130 (rendered) | N/A — not in schema |
| `name` | ✗ Not in schema | ✓ Yes | `AboutSection.tsx` line 26 (type), line 150 (rendered in JSX) | N/A — not in schema |
| `discipline` | ✗ Not in schema | ✓ Yes | `AboutSection.tsx` lines 27, 92, 151–152 (rendered in JSX) | N/A — not in schema |

**Key finding:** `components/AboutSection.tsx` and `components/about/AboutEdgeWords.tsx` reference all 9 fields. However, both files are **dead code** — `AboutSection.tsx` is not imported by any page or layout (only `AboutEdgeWords.tsx` imports `EdgeWord` type from it), and `AboutEdgeWords.tsx` is not imported by any page or layout. The query (`aboutPageQuery`) does not fetch any of these fields. The `/about` page route uses `CanvasCards`, not `AboutSection`. These components and the ghost data are a cleanup opportunity but are out of scope for this session (schema-only change requested).

---

#### `siteSettings` schema zombie fields — full grep

All 25+ siteSettings schema fields were checked. Results for the 4 candidate zombies:

| Field | Hits in `app/` | Hits in `components/` | Hits in `lib/` | Hits in `sanity/lib/` | Verdict |
|---|---|---|---|---|---|
| `homepageHeadline` | 0 | 0 | 0 | 0 | ✅ UNUSED — safe to remove |
| `homepageSubtext` | 0 | 0 | 0 | 0 | ✅ UNUSED — safe to remove |
| `signupCtaText` | 0 | 0 | 0 | 0 | ✅ UNUSED — safe to remove |
| `socialLinks` | 0 | 0 | 0 | 0 | ✅ UNUSED — safe to remove (FooterV2 uses hardcoded links) |

All other siteSettings fields confirmed USED:

| Field | Where used |
|---|---|
| `tagline` | `sanity/lib/queries.ts` siteSettingsBasicQuery; `lib/home-data.ts`; `HeroScene`, `HeroRavana`, `LoadingScreenStripes`, `ParallaxHero`, `HeroPortrait` |
| `aboutPortrait` | `sanity/lib/queries.ts` siteSettingsBasicQuery; `lib/home-data.ts` |
| `aboutBio` | `sanity/lib/queries.ts` siteSettingsBasicQuery; `lib/home-data.ts` |
| `featuredProjects` | `sanity/lib/queries.ts` featuredSeriesQuery; `lib/home-data.ts` |
| `featuredShopItems` | `sanity/lib/queries.ts` featuredShopItemsQuery; `lib/home-data.ts` |
| `heroImages` | `sanity/lib/queries.ts` heroImagesQuery; `lib/home-data.ts` |
| `worksPageHeadline`, `worksEmptyHeadline`, `worksEmptyBody` | `lib/site-settings.ts`; `app/(site)/works/page.tsx` |
| `shopPageHeadline`, `shopPrintNote` | `lib/site-settings.ts`; `app/(site)/shop/page.tsx` |
| `printDefaultPaper`, `printDefaultSignature`, `printDefaultShipping` | `lib/site-settings.ts`; `app/(site)/shop/[slug]/page.tsx` |
| `thankYouMessage` | `lib/site-settings.ts`; `app/(site)/thank-you/page.tsx` |
| `contactPageIntro`, `contactEmail` | `lib/site-settings.ts`; `app/(site)/contact/page.tsx` |
| `privateCollectionTitle`, `privateCollectionLine` | `lib/site-settings.ts`; `app/(site)/shop/page.tsx` |
| `instagramHandle`, `youtubeChannelName` | `sanity/lib/queries.ts` footerSocialQuery (kept — valid CMS fields even if FooterV2 uses hardcoded labels) |
| `seoTitle`, `seoDescription` | In schema (no current query, but reserved for future SEO use — retained) |

---

### STEP 2 — Changes made

**`sanity/schemas/siteSettings.ts`** — removed 4 zombie field definitions:
- `homepageHeadline` (`string`) — line 9–10 of original
- `homepageSubtext` (`string`) — line 10 of original
- `signupCtaText` (`string`) — line 41 of original
- `socialLinks` (`object` with instagram/youtube/facebook URL subfields) — lines 125–133 of original

No changes to `sanity/schemas/aboutPage.ts` — schema was already clean.

---

### STEP 3 — Build verification

```
✓ Compiled successfully
✓ Type-check passed (no errors)
✓ Static pages generated (16/16)
```

Pre-existing warnings (not introduced by this change):
- `<img>` in `LoadingScreenStripes.tsx` — pre-existing
- `<img>` in `Navigation.tsx` — pre-existing

**No new errors or warnings introduced.**

---

## 2026-06-20 (b) — Dataset document audit (read-only)

**Prompt summary:**
Query the live `production` dataset to classify every document against its current schema. Separate orphaned old-schema documents (deletion candidates) from current documents (keep) from mixed documents (human review). Also check `aboutPage` and `siteSettings` which the prior diagnostic flagged. Report empty-but-current fields separately from genuine orphans.

---

### Dataset overview — what types actually exist

| `_type` | Count | Notes |
|---|---|---|
| `shopItem` | 52 published + 3 draft | All created 2026-06-18 |
| `aboutPage` | 1 | ID: `aboutPage`, created 2026-06-19 |
| `siteSettings` | 1 | ID: `siteSettings`, created 2026-06-14 |
| `pressItem` | **0** | Collection is completely empty |
| `project` | **0** | No project documents |
| `artwork` | **0** | No artwork documents |
| `testimonial` | **0** | No testimonial documents |
| `about` (old type) | **0** | Orphaned document noted in PROGRESS.md has been deleted |
| `navigation` | 0 | Never populated |
| `order` | 0 | Expected — no purchases have occurred |
| `enquiry` | 0 | Expected — write-only via API |

---

### A — Orphaned documents using only OLD schema fields (deletion candidates)

**None found.** There are zero documents of type `pressItem`, `about`, `project`, `artwork`, or `testimonial`. The old orphaned `about` document previously flagged in PROGRESS.md no longer exists in the dataset.

---

### B — Documents using CURRENT schema fields (keep)

#### `aboutPage` — ID: `aboutPage` (created 2026-06-19, updated 2026-06-19)

Fields present in document vs current `aboutPageQuery` (`aboutTeaserLine`, `aboutBlockBio`, `aboutBlockPortrait`):

| Field in document | Fetched by current query? | Status |
|---|---|---|
| `aboutTeaserLine` | ✓ yes (`aboutPageQuery`) | Current, populated |
| `aboutBlockBio` | ✓ yes (`aboutPageQuery`) | Current, populated |
| `aboutBlockPortrait` | ✓ yes (`aboutPageQuery`) | Current, populated (Mandakini portrait image) |
| `homeSnippet` | ✓ yes (`home-data.ts` inline query) | Current, populated |
| `aboutBlockBio` (dupe check) | ✓ | — |
| `name` | ✗ not queried | Extra — present but unused |
| `discipline` | ✗ not queried | Extra — present but unused |
| `heroDisplayWord` | ✗ not queried | Extra — present but unused |
| `heroLeadIn` | ✗ not queried | Extra — present but unused |
| `heroSubhead` | ✗ not queried | Extra — present but unused |
| `heroLeftImage` | ✗ not queried | Extra — present but unused |
| `heroRightImage` | ✗ not queried | Extra — present but unused |
| `bodyParagraph` | ✗ not queried | Extra — present but unused |
| `edgeWords` | ✗ not queried | Extra — present but unused |

**Classification: B (keep).** The document is NOT an orphan — the 4 queried fields are present and populated. However, 9 extra fields exist in the document that no current query or component reads. These look like fields from an intermediate version of the `aboutPage` schema that was later simplified. They are invisible on the live site but visible in the Studio editor, which may be contributing to the "old design" confusion. The Studio form will show these fields as blank sections (schema removed them) OR as unrecognised data.

#### `siteSettings` — ID: `siteSettings` (created 2026-06-14, updated 2026-06-20)

Fields present in document vs current queries:

| Field in document | Fetched by current query? | Status |
|---|---|---|
| `heroImages` (7 images) | ✓ `heroImagesQuery` | Current, populated |
| `aboutPortrait` | ✓ `siteSettingsBasicQuery` | Current, populated |
| `instagramHandle` | ✓ `footerSocialQuery` | Current, populated — but FooterV2 no longer uses the prop (dropped in recent refactor). Minor dead wire. |
| `youtubeChannelName` | ✓ `footerSocialQuery` | Same as above |
| `homepageHeadline` | ✗ no query | NOT in document (never populated — absent from raw data) |
| `homepageSubtext` | ✗ no query | NOT in document (absent) |
| `signupCtaText` | ✗ no query | NOT in document (absent) |
| `socialLinks` | ✗ no query | NOT in document (absent) |
| `worksPageHeadline` etc. | ✗ no query | NOT in document (absent) |

**Classification: B (keep).** The document uses current fields. The zombie schema fields (`homepageHeadline`, `homepageSubtext`, etc.) that the prior diagnostic flagged were never populated — they are absent from the raw document data, not just null. The only issue is the zombie field definitions still appear as empty inputs in the Studio UI, which creates clutter but causes no data harm.

#### `shopItem` — 52 published documents (created 2026-06-18)

Field audit on all 52 documents:

| Field | Value across all 52 | Status |
|---|---|---|
| `title` | Set (titles like "Tambura 1", "Fragments Charcoal 5", etc.) | Current |
| `slug` | Set | Current |
| `availabilityStatus` | `"available"` on all | Current |
| `purchaseType` | `"buy"` on all | Current (matches new schema) |
| `sold` | `0` on all | Current (matches new schema) |
| `stock` | `0` on all | Current (matches new schema) |
| `frameOptions` | Present (truthy) | Current |
| `basePrice` | **`null` on all 52** | Empty — not old, just unpopulated |
| `stripePriceId` | **`null` on all 52** | Empty — not old, just unpopulated |
| `editionNumber` | absent | — |
| `stripeProductId` (old field) | absent | — |
| `displayOrder` (old field) | absent | — |
| `sizes` (old field) | absent | — |

**Classification: B (keep).** All 52 documents use the current schema structure. No old-schema fields are present. However, `basePrice` and `stripePriceId` are null on every document — the shop is structurally sound but commerce is non-functional until Mandakini enters prices and Stripe product IDs via the Studio.

**3 draft shopItems** (IDs: `drafts.5836183d...`, `drafts.5f5cfb36...`, `drafts.74ca49d7...`) — same structure, unpublished.

---

### C — Documents with mixed old+new fields (needs human review)

**None found.**

---

### Summary of findings

| Type | Orphans (A) | Current (B) | Mixed (C) | Empty-but-current |
|---|---|---|---|---|
| `pressItem` | 0 | 0 | 0 | **Collection empty — no documents at all** |
| `aboutPage` | 0 | 1 | 0 | 9 extra fields in document not read by any query |
| `siteSettings` | 0 | 1 | 0 | Zombie schema fields defined but never populated |
| `shopItem` | 0 | 52 + 3 draft | 0 | `basePrice` and `stripePriceId` null on all 52 |
| `project` | 0 | 0 | 0 | — |
| `artwork` | 0 | 0 | 0 | — |
| `testimonial` | 0 | 0 | 0 | — |
| `about` (old) | 0 | 0 | 0 | Already deleted |

---

### Root cause of "stale content from old design" — revised conclusion

The prior diagnostic hypothesised old documents in the dataset as the cause. **The dataset audit disproves this.** There are no orphaned old-schema documents. The actual causes are:

1. **`pressItem` collection is empty.** The `/press` page has no documents to display — it will always render the empty state. The press bento grid built in this session cannot show anything until press items are created in the Studio.

2. **`project` and `artwork` collections are empty.** The `/works` page and the homepage Works section have no data and will fall back to placeholder series.

3. **`testimonial` collection is empty.** The homepage Testimonials section will use `PLACEHOLDER_TESTIMONIALS` (hardcoded in `lib/home-data.ts`).

4. **`aboutPage` has 9 extra fields** (`name`, `discipline`, `heroDisplayWord`, `heroLeadIn`, `heroSubhead`, `heroLeftImage`, `heroRightImage`, `bodyParagraph`, `edgeWords`) that exist in the document but are fetched by no current query and rendered by no current component. These were likely from an intermediate build of the about page. They show up in the Studio editor as data that appears "live" but goes nowhere on site.

5. **`shopItem` records have no prices.** 52 shop items exist with correct structure but `basePrice: null` and `stripePriceId: null`. The shop renders items but none can be added to cart or purchased.

**The "old design" in Studio** is most likely the `aboutPage` document displaying its 9 extra fields in the Studio editor — fields like `heroDisplayWord`, `edgeWords`, `heroLeftImage`, `heroRightImage` suggest a prior hero/about layout concept. These fields are harmless but create confusion about what the site actually uses.

**The "stale content" on the live site** is not stale — it is the absence of content. No press items, no projects, no artworks, no testimonials have been entered.

---

## 2026-06-20 — Stale content diagnostic (read-only)

**Prompt summary:**
Investigate why Studio and/or the live site show stale content from an old design. Check dataset alignment, useCdn, fetch-level caching, orphaned schema types/fields, and distinguish old-content-in-dataset vs cache-serving-old-response.

---

### 1. Dataset alignment

| Config location | projectId | dataset |
|---|---|---|
| `sanity.config.ts` (Studio) | `i4t9kzxg` (hardcoded) | `production` (hardcoded) |
| `sanity/lib/client.ts` (Next.js) | `process.env.NEXT_PUBLIC_SANITY_PROJECT_ID \|\| 'i4t9kzxg'` | `process.env.NEXT_PUBLIC_SANITY_DATASET \|\| 'production'` |

**Verdict: aligned.** Both point to `i4t9kzxg / production`. `.env.local` confirms `NEXT_PUBLIC_SANITY_PROJECT_ID=i4t9kzxg` and `NEXT_PUBLIC_SANITY_DATASET=production`. Mismatch is NOT the cause.

---

### 2. useCdn

Set in `sanity/lib/client.ts` line 10: **`useCdn: false`**. The CDN is explicitly disabled. All reads go directly to the Content Lake API (api.sanity.io). CDN staleness is not a factor.

Additionally: `perspective: 'published'` is set — drafts are never surfaced to the Next.js client.

---

### 3. Fetch-level caching

`useCdn: false` means next-sanity uses `fetch` with `cache: 'no-store'` by default at the HTTP level (Next.js App Router behaviour when no `next.revalidate` option is passed). The ISR revalidation windows are set at the **route segment** level via `export const revalidate`:

| Route | `export const revalidate` | fetch-level `next` option |
|---|---|---|
| `app/(site)/page.tsx` (home) | `60` | none passed to `client.fetch` |
| `app/(site)/about/page.tsx` | `60` | `{ next: { revalidate: 60 } }` (redundant but harmless) |
| `app/(site)/press/page.tsx` | **`3600`** | none |
| `app/(site)/works/page.tsx` | `60` | none |
| `app/(site)/works/[slug]/page.tsx` | `60` | none |
| `app/(site)/shop/page.tsx` | `60` | none |
| `app/(site)/shop/[slug]/page.tsx` | `60` | none |
| `app/(site)/contact/page.tsx` | `60` | none |
| `app/(site)/thank-you/page.tsx` | `60` | none |
| `lib/home-data.ts` (server fn) | — | none passed to any `client.fetch` call |

**Key finding:** The press page has `revalidate = 3600` (1 hour) — it will serve a stale cached page for up to an hour after a publish. All other routes use 60 s.

**Revalidation webhook:** `app/api/revalidate/route.ts` exists and calls `revalidatePath('/', 'layout')` on POST. However:
- It requires `SANITY_REVALIDATE_SECRET` to be set in Vercel's env.
- `.env.local` does NOT contain `SANITY_REVALIDATE_SECRET`.
- There is no evidence a Sanity webhook has been configured in the Studio to call this endpoint.
- **If the webhook is not wired up in Sanity's project settings, no on-publish purge fires.** Pages only revalidate on their ISR timer (60 s or 3600 s).

---

### 4. Old document types — schema vs query gap

**Schemas registered in `sanity/schemas/index.ts`** (13 total):
`project`, `artwork`, `shopItem`, `order`, `pressItem`, `aboutPage`, `siteSettings`, `navigation`, `class`, `member`, `enquiry`, `testimonial`

**Schema types that have NO corresponding query in `sanity/lib/queries.ts`:**
- `navigation` — schema defined, no query, no UI reads it
- `class` — Phase 2 placeholder (expected)
- `member` — Phase 2 placeholder (expected)
- `enquiry` — schema defined but no read query (write-only via API route, fine)
- `order` — schema defined but no read query (admin panel reads directly, not via shared query)

None of these is the cause of stale content.

**Critical: `pressItem` schema vs PROJECT.md mismatch**

PROJECT.md §7.5 describes the OLD pressItem schema:
```
type, title, source, date, excerpt, externalLink, logo, featured, displayOrder
```

The CURRENT `sanity/schemas/pressItem.ts` defines the NEW schema (rewritten in a prior session):
```
url, type, titleOverride, imageOverride, sourceOverride, order
```

These are completely different field sets. If any `pressItem` documents in the `production` dataset were created under the OLD schema (with `externalLink`, `logo`, `excerpt`, `featured`), they will have fields the current query (`pressItemsQuery`) never requests. The current query only fetches `url, type, titleOverride, imageOverride, sourceOverride, order`. Any old document with `externalLink` instead of `url` would return with `url: undefined` and be silently dropped by `enrichPressItems`.

**`siteSettings` old fields still present in schema:**
`homepageHeadline`, `homepageSubtext`, `signupCtaText`, `socialLinks` (old object with instagram/youtube/facebook URLs) — all defined in the schema but referenced by no query in `queries.ts`. They are zombie fields: visible in Studio but never consumed. Not a cause of stale content but a source of editor confusion.

---

### 5. Failure mode diagnosis

**Evidence points to: (a) old documents still live in the dataset.**

Reasons:
1. `useCdn: false` — no CDN layer to serve stale responses
2. `revalidate = 60` on all main pages — at most 60 s stale after a Sanity publish, not "old design" stale
3. The revalidation webhook is not confirmed to be wired up in Sanity, but even without it the 60 s ISR ceiling means content is fresh within a minute
4. **The most likely cause:** Documents in the `production` dataset were authored against the OLD schema (e.g. `pressItem` with `externalLink`, `logo`, `excerpt`; `siteSettings` with `homepageHeadline`). After the schema was replaced, those old documents still exist and still have the old field values. The new queries don't fetch those fields, so the new UI gets `undefined`/null and falls back to placeholders — which looks like "stale old design content"
5. PROGRESS.md explicitly notes: *"The old 'about' document still exists in the Sanity dataset (invisible in Studio after schema removal). Awaiting manual deletion via dataset tools."* — this is documented evidence that old orphaned documents exist in the dataset.

**Failure mode (b) — cache serving stale responses — is unlikely** because:
- CDN is disabled
- ISR windows are short (60 s)
- The "old design" look is structural (field names changed), not just stale text values

**Summary:** The Studio is showing old-design fields because old documents authored against the original schema still live in the dataset. After schema fields were renamed/replaced, the Studio's document forms show the old field values but the live site's new queries never read them — so the site shows fallbacks/placeholders. This is a **dataset hygiene problem**, not a caching problem.

**Recommended next steps (not implemented — diagnostic only):**
1. Use Sanity CLI or Vision tool to audit which `pressItem`, `siteSettings`, and `about` documents exist and what fields they contain
2. Delete or re-author old documents that predate the schema rewrites
3. If `SANITY_REVALIDATE_SECRET` is not set in Vercel, add it and configure the Sanity webhook to call `/api/revalidate` — eliminates the 60 s ISR lag and the 3600 s press lag entirely

---

## 2026-06-19 (c) — /about blank page: Sanity client fallbacks

**Prompt summary:**
/about renders AboutSection but all fields are blank. The aboutPage document IS published in Sanity (confirmed via CLI). Diagnose and fix the fetch.

**Root cause:** `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` are not configured in Vercel's build environment. `createClient({ projectId: undefined })` throws during `next build`'s static-page generation phase. The env-var guard added in the previous fix (`!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID`) then returns `<AboutSection data={{}} />` as the static shell — blank page. ISR cannot rescue this because the env var is still absent at runtime on the same host.

**Evidence:** Vercel build log showed `Error: Configuration must contain 'projectId'` during `Generating static pages (8/16)`. Sanity CLI confirmed `aboutPage` document present, published, all fields filled (name: "Mandakini Rao", portrait, quote, homeSnippet).

**Fix:** Added hardcoded fallbacks `|| 'i4t9kzxg'` and `|| 'production'` to `sanity/lib/client.ts`. These are already public values in `sanity.config.ts`. Client now initialises correctly with or without env vars. Removed env-var guard from `app/(site)/about/page.tsx`; fetch always runs.

**Note:** Other data-fetching functions (`getHomeData`, `getAllShopItems`, etc.) still guard on `hasSanityEnv()` and return placeholder data when env vars are absent. Those placeholders can be eliminated by adding the same env vars to Vercel's project settings.

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
