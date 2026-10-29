# /admin — a friendly CMS for Mandakini, on top of Sanity

_Design, 29 Oct 2026. Status: approved._

## 1. Intent

Mandakini Rao runs mandakinirao.com herself: her art, her projects, her journal,
and a shop selling limited-edition prints (Razorpay). Today she does all of that
in Sanity Studio (`/studio`), and it isn't working for her:

- The Studio's UI is confusing from the moment it opens.
- Uploading images (homepage, settings) is a chore.
- Orders are opaque — she can't easily tell what's new, paid, shipped, or done,
  and nothing tells her a new order has arrived.
- Creating a new print or a new post takes too many steps.

`/admin` replaces the Studio **for her**. It is a set of screens inside the
existing Next.js site, designed around how she thinks ("add a print", "ship this
order", "change the homepage photo"), not around how the data is stored. Sanity
stays as the database, image host, and CDN. Every save in `/admin` writes to
Sanity and the public site reflects it within seconds.

**The point is better UX, not a reskin of Sanity.** If a screen ends up looking
like a Sanity document form with nicer colours, it has failed.

## 2. Who it's for

- One user: Mandakini. Non-technical artist.
- **Laptop only.** No phone/tablet layouts needed; design for a large screen
  (side-by-side panes, drag-and-drop from Finder, keyboard-friendly forms).
- When she adds a print or post, **everything is usually ready** (photos, price,
  text). Optimise for speed in one sitting, not step-by-step hand-holding.

## 3. Goals, non-goals, anti-goals

**Goals**
1. She never needs to open `/studio` for anything she does routinely.
2. Orders: she always knows what needs shipping, and shipping/cancelling is one
   screen and one button.
3. Adding a print or a post is one page, one sitting.
4. Images: drag in many at once, reorder by dragging.
5. Every save is live on the site within seconds, and she's told so with a link.

**Non-goals**
- Mobile/tablet support.
- Multiple users, roles, or permissions.
- Replacing Sanity as storage, or moving to Firebase/Shopify.
- Rebuilding the public site.
- Classes / members (Phase-2 schema types `class`, `member` exist but are unused).

**Anti-goals (would be failures even if they "work")**
- Showing database vocabulary: document, reference, slug, array, draft/publish,
  schema, ID, `_key`.
- Tabs, nested panels, or modals-within-modals to complete a routine task.
- Any save that silently doesn't reach the live site.
- A refund or delete that can happen without an explicit confirmation.
- Exposing the Sanity write token or Razorpay secret to the browser.

## 4. UX principles (apply to every screen)

1. **One page per task.** No multi-step wizards, no tabs for routine work.
2. **Her words, not database words.** "Print", "Project", "Shown on homepage",
   "How many left" — never "shopItem", "featuredOnHomepage", "stock".
3. **Fill in whatever can be worked out.** Web address from the title, alt text
   from the title, "how many left" = edition size on create, sold-out when 0 left.
4. **One obvious primary button per page.**
5. **Always confirm the result**: "Dhyanam is live ✓ — View on site →".
6. **Confirm only destructive actions**: delete, cancel/refund.
7. **Save = live.** No draft/publish split. (Sanity keeps revision history, so a
   mistake can be recovered via Studio if ever needed.)
8. **Hide what she never changes** (display-order numbers → drag to reorder;
   "units sold" → maintained by orders).

Visual style: calm, roomy, readable — large type, generous spacing, the site's
cream/cacao palette as accents. It should feel like her studio, not a dev tool.
Exact styling is the builder's call within these principles.

## 5. Structure

Sidebar (her words), with a home summary at the top:

| Section | What it covers | Sanity type(s) |
|---|---|---|
| **Home** | "2 orders to ship · 1 new message · 6 prints in the shop" + shortcuts | read-only summary |
| **Orders** | To ship / Shipped / Completed / Cancelled & refunded | `order` |
| **Shop** | Prints as photo cards; add/edit; drag to reorder | `shopItem` |
| **Projects** | Series and their photos; drag to reorder | `project` |
| **Journal** | Posts | `journalPost` (+ `journalSection`) |
| **Press** | Articles, videos, clippings | `pressItem` |
| **Messages** | Contact & private-collection enquiries | `enquiry` |
| **Website** | Homepage photos, About page, Testimonials, Contact & footer details | `homepage`, `aboutPage`, `testimonial`, `siteSettings` |

`/studio` stays, for the developer only. Not linked from `/admin`.

## 6. Screens in detail

### 6.1 Orders (highest priority)

**List.** Default tab **To ship** (paid, not yet shipped), with a count badge.
Other tabs: **Shipped**, **Completed**, **Cancelled / Refunded**. Each row:
order number, date, buyer name, what they bought, amount, status badge.
Newest first.

**Order page.** One page showing:
- Buyer name, phone, email, shipping address (with a **Copy address** button for
  the courier label).
- Items, quantities, prices paid, total.
- Status, and the action for that status:
  - **To ship** → fields: Courier name, Tracking number → **Mark as shipped**.
    Sends the buyer the shipping email (with tracking number) and moves the
    order to Shipped.
  - **Shipped** → **Mark as delivered** → moves to Completed. (Manual; no
    courier-tracking integration.)
  - **To ship** or **Shipped** → secondary **Cancel order**.

**Cancel & refund.** Confirmation: "Cancel this order and refund ₹4,800 to
<buyer>?" On confirm:
1. Full refund via Razorpay Refunds API on the order's `razorpayPaymentId`.
2. Order status → `cancelled`; record refund id/time.
3. Restore stock for each item (and decrement `sold`); clear sold-out if stock > 0.
4. Email the buyer that the order was cancelled and refunded.
If the Razorpay refund fails, nothing else changes and she sees a plain error.

**New-order email to Mandakini** on every paid order, linking straight to the
order page in `/admin`. (The email pipeline itself is broken today — see §9.)

Order data itself (buyer, items, amount) stays read-only in `/admin`, as now.

### 6.2 Shop — add / edit a print

One page, two columns:
- **Left — Photos.** Large drop zone ("Drag your photos here"); accepts many
  files at once; first = cover; drag to reorder; remove with ×. Alt text
  auto-filled from the title, editable per photo (tucked away, not required
  to type).
- **Right — Details.** Title · Price (₹) · Edition size · How many left
  (defaults to edition size on create) · Description · "For sale" vs "Enquiry
  only" (`purchaseType`).
- **Bottom.** Switches: **Show in shop** (on by default) and **Show on
  homepage**. Primary button: **Save and put live**.
- **Hidden / automatic:** slug (from title; must avoid reserved slugs `learn`,
  `classes`, `login`, `account` and duplicates), `displayOrder` (drag on the
  Shop list), `homepageOrder` (drag on homepage list), `sold` (orders),
  `availabilityStatus` (derived: hidden if "Show in shop" off; soldOut if
  0 left; else available).

**Shop list.** Grid of photo cards (cover, title, price, "12 of 50 left" or
"Sold out" badge, "Hidden" badge). Drag to reorder. **+ Add a print**.
Delete lives on the edit page behind a confirmation.

### 6.3 Projects
Same pattern as prints: name, year, short description (with the existing
~220-char guidance shown as a live counter), gallery (multi-drop, reorder,
per-photo alt), **Show on homepage** switch. Drag to reorder on the list.

### 6.4 Journal
Post page: title, kicker, excerpt, cover photo, date (defaults to today),
featured switch, and the body.

The body is a sequence of sections (existing `journalSection`: rich text +
optional images with captions, display mode single/collage/carousel, position,
pull-quote flag, optional link). The editor must feel like writing a document —
paragraphs with photos dropped between them — not like editing an array of
objects. This is the hardest screen and is **built last**; until then she can
keep using Studio for journal posts.

### 6.5 Press
Paste a link → the site already auto-fetches headline/thumbnail/source at build
time; show what it found and let her override headline, source, thumbnail, and
the "logo card" switch. Clipping with no link: upload the scanned image.
Drag to reorder; **Show on homepage** switch.

### 6.6 Messages
List of enquiries (newest first): name, email, phone, message, budget range,
date, status. Mark as **Replied** / **Archived**. "Reply by email" opens her
mail client.

### 6.7 Website
Plain pages, one per area:
- **Homepage** — the two hero reveal photos (top/bottom), each a drop zone.
  Featured prints/projects/press are chosen via the "Show on homepage" switch
  on each item in its own section; this page shows what's currently featured
  as drag-to-order lists (writes `homepageOrder`). See §7 "Homepage featuring"
  — the public site must be changed to actually honour these switches.
- **About** — writes the **`aboutPage`** document (the one the site actually
  reads: `name`, `discipline`, hero words/images, `bodyParagraph`,
  `aboutBlockBio`, `aboutBlockPortrait`, `edgeWords`, `homeSnippet`,
  `aboutTeaserLine`). Note: the current Studio edits a different, unused
  `about` type — so today the About page effectively isn't editable in Studio.
- **Testimonials** — quote, person, optional photo; drag to reorder.
- **Contact & footer** — footer text, Instagram/YouTube handles, shipping note,
  enquiry email (`siteSettings`). The `siteSettings` document doesn't exist yet
  in the dataset (the site uses code fallbacks from `lib/site-settings.ts`);
  first save creates it.

## 7. Technical design (developer's calls, stated for review)

- **Where:** routes under `app/admin/` in the existing Next.js 14 app, outside
  the `(site)` group so it doesn't get the public nav/footer/motion. Excluded
  from the public CSP if needed for image upload previews (check), and
  `noindex`.
- **Login:** single password (`ADMIN_PASSWORD` env, already in the env
  template) at `/admin/login` → signed, HTTP-only, secure session cookie
  (e.g. 30-day). Middleware guards `/admin/**`; every server action re-checks
  the session. Rate-limit login attempts (reuse `lib/rate-limit.ts`).
- **Reads:** server components query Sanity with the token (`useCdn: false`) so
  she always sees fresh data, including types not publicly readable (orders,
  enquiries).
- **Writes:** Next.js server actions using `@sanity/client` with
  `SANITY_API_WRITE_TOKEN` (server-only). Validate input server-side.
- **Images:** uploaded to the Sanity assets API by our server, one file per
  request, so the token never reaches the browser; keep `hotspot` support.
  Two size limits apply: Next.js 14 server actions accept only **1 MB** bodies
  by default, and Vercel functions cap request bodies at **4.5 MB**. So: resize
  and compress each photo in the browser before upload (long edge ~2500 px,
  quality ~0.85, comfortably under 4.5 MB), and send it to a dedicated
  authenticated route handler (`/api/admin/upload`) rather than a server action.
  The route returns the Sanity asset reference; the form's save action then
  stores that reference.
- **Homepage featuring (public-site change required):** today the homepage
  ignores the per-item `featuredOnHomepage` switch. Prints and projects are
  read from `siteSettings.featuredShopItems` / `featuredProjects` curated
  arrays (`featuredShopItemsQuery`, `featuredSeriesQuery` in
  `sanity/lib/queries.ts`), which have no field in the Studio schema and don't
  exist in the dataset — so the homepage silently falls back to "first N".
  Press uses all items by `displayOrder`. Change these queries to select
  `featuredOnHomepage == true` ordered by `homepageOrder`, keeping the existing
  caps (4 projects, 3 prints, 8 press) and the existing "first N" fallback when
  nothing is featured. Remove the unused curated-array references.
- **Live on save:** after each write, `revalidatePath` the affected public pages
  (or `revalidatePath('/', 'layout')`, matching the current `/api/revalidate`
  approach).
- **Emails:** reuse `lib/emails.ts` (Resend). Add "order cancelled & refunded".
  Shipping email is sent directly from the "Mark as shipped" action (no longer
  dependent on the Sanity webhook → `/api/ship-notify`); keep the
  `shippedEmailSent` guard so it can't double-send.
- **Refunds:** Razorpay Refunds API (`razorpay` SDK already installed), server
  side only.
- **Order schema additions:** `refundId`, `refundedAt` (and `deliveredAt`,
  `shippedAt` if useful). Studio schema updated to match so `/studio` still
  shows them.

## 8. Build order

1. Login + admin shell (sidebar, home summary).
2. **Orders** — list, order page, mark shipped (+ email), mark delivered,
   cancel & refund (+ email, stock restore).
3. **Shop** — list with drag-reorder, add/edit print with multi-photo upload.
4. **Website** — homepage photos, About, Contact & footer, Testimonials; plus
   the public-site query change so "Show on homepage" works (§7).
5. **Projects**, **Press**, **Messages**.
6. **Journal** editor.

Each step ships on its own branch and is reviewed on a preview deployment before
merging to `main` (merging to `main` deploys to production).

## 9. Dependencies and known issues

- **Order emails are currently not arriving** (neither buyer nor Mandakini).
  Paused pending Vercel access to read logs/env. Likely causes, in order:
  Razorpay webhook not registered (or registered in the wrong Test/Live mode),
  missing `SANITY_API_WRITE_TOKEN` in production, and `EMAIL_FROM` still the
  Resend sandbox sender (needs a verified `mandakinirao.com` domain). §6.1's
  emails depend on this being fixed; the Orders screens themselves do not.
- `SANITY_API_WRITE_TOKEN` must be set in Vercel for `/admin` writes.

## 10. Decisions made by the developer (please check)

- Homepage featuring uses the per-item "Show on homepage" switch (approved
  by the user, option A), not separate curated lists.
- Cancel = **full refund only** (no partial refunds), and it **restores stock**
  (confirmed by the user).
- "Delivered" is a manual button, no courier tracking integration.
- No draft/publish: save is live.
- Single shared password login, not Google sign-in (can be added later).
- Journal editor built last; Studio remains the fallback for journal until then.
- Slugs are auto-generated from titles and not editable in `/admin`.
- Fields in Studio that `/admin` doesn't expose (e.g. `currency`,
  `privateCollectionCtaLabel`, nav items) stay Studio-only.

## 11. Left to the builder

Component library and styling details, exact copy, empty states, loading and
error states, image compression approach, how drag-to-reorder is implemented,
and file/module layout under `app/admin/` — within the principles above.
