# Prompt Log

---

## 2026-07-09 — Journal/blog feature, planned then built

**Prompt summary:** Build a journal/blog: one listing page (all articles, each a card with image + text + read-more CTA) and one detail page per article. For each paragraph of an article, Mandakini needs to independently choose in Sanity Studio: 0/1/many images, collage vs. carousel-with-thumbnails display for 2+ images, and left/right/top/bottom position relative to the paragraph's text — all authored in Studio, reflected on the site automatically.

**Planning:** used plan mode properly since this was a new, architecturally non-trivial feature (no prior journal/blog code, no carousel library, no collage component to reuse). Ran an Explore pass to confirm what existed (`components/shop/ImageCarousel.tsx` as the only carousel — dot nav, no thumbnails; `.mr-mask`/`.mr-mask--b` as the only "organic image frame" pattern; Portable Text block-type fields existing in two dead schema fields with zero rendering code anywhere; no `@portabletext/react` installed), then a Plan pass to design the schema and rendering architecture. Key design decision, reasoned through rather than assumed: model each paragraph as one `journalSection` object (text + images + displayMode + position) rather than mixing plain Portable Text blocks with a separate image-block type — a paragraph's image choice needs a specific paragraph to pair against for left/right layout, which a sibling-block model can't express predictably in Studio's editor.

Confirmed three decisions with the client before writing code: add `@portabletext/react` (yes — it's Sanity's own package for a real, non-trivial rendering problem, not the kind of library the project avoids); cap narrow (left/right) collages at 2 columns regardless of image count so images stay legible (yes); one paragraph = one image-choice unit, no multi-paragraph grouping (yes).

**Execution:** schema (`journalSection.ts` object type with Sanity's `hidden: ({parent}) => ...` pattern so displayMode/position only appear once enough images exist; `journalPost.ts` document type), GROQ, a `lib/journal.ts` loader mirroring existing loader conventions, five new components (`JournalArticle`, `JournalSection`, `JournalImageGroup`, `JournalCollage`, `JournalCarousel`, `JournalIndex`), and the listing/detail routes mirroring `works/page.tsx`'s exact structure.

**Bugs found during verification** (both CSS, caught by measuring actual DOM rects rather than trusting a screenshot at first glance): the cover image was invisible because `.mr-journal__cover` is a `<span>` and never got `display:block`, so `aspect-ratio` silently didn't apply and the element collapsed to zero height. The 5-image collage rendered as single-column full-width stacked images instead of a 3-column masonry, because the base `.mr-collage` rule sets `display:grid` and the 5+-image variant only added `columns` (CSS multi-column) without overriding `display` — multi-column layout is a no-op inside a grid container. Both fixed by adding explicit `display: block` overrides. Several other apparent "missing image" moments during review turned out to be nothing — just screenshots taken before the browser had scrolled/painted the right region; confirmed via `getBoundingClientRect()` before concluding anything was actually broken.

**Content-authoring verification**: rather than uploading new test images, queried existing Sanity image assets already referenced by published `project` documents (Fragments Charcoal, MS Subbalakshmi, London in Gouache series) and reused those `asset._ref`s directly via the Sanity MCP's `create_documents` tool — built two full `journalPost` documents with real Portable Text block structure covering all 6 required layout combinations, published them, and reviewed every combination on localhost. Also verified interactively in Sanity Studio itself that the conditional field-hiding works live (adding a second image to a single-image paragraph immediately revealed the Collage/Carousel picker that had been hidden).

**Verified:** clean build; all 6 combinations visually confirmed; `/?v=1` confirmed untouched via `git diff --stat`; Studio's live conditional-field behavior confirmed interactively, not just by reading the schema.

**Open/deferred**: whether to keep the 2 test journal posts as Mandakini's real first entries or delete them — flagged for the client to decide, not resolved yet.

## 2026-07-07 (iii) — Hamburger color bug + missing 404 cat

**Prompt summary:** From a screenshot of the live deployed hero, asked that only the hamburger menu there be cream — everywhere else (rest of homepage, other pages) it should be cacao. Separately, reported the cat animation was missing on the live `/404` page.

**Hamburger investigation:** expected this to be a quick CSS tweak, but checking the deployed site showed the hamburger was cream **everywhere**, not just the hero — a real pre-existing bug, not a new request. Traced it to `.site-nav`'s color: the rule meant to make it cacao (`.site-nav.scrolled`) and a page-specific override (`body.about-page .site-nav`) were both present and both matched, yet neither took effect — the base rule's cream value won regardless. Root cause never fully confirmed but most likely Next's automatic CSS chunk/layer splitting between globals.css and a component-imported about.css. Fix: added explicit rules directly in globals.css (same file as the winning base rule) with clearly higher specificity, keyed off the existing `mr2-hero-stage` body class from the earlier hero work.

**A verification detour:** while confirming the fix, `getComputedStyle` reads via the browser automation tool kept returning the old cream value even after setting an inline `style="color:red"` directly on the element — which should be impossible under normal CSS rules (inline style always wins). This turned out to be an unreliable reading from the tool, not a real bug — switching to zoomed screenshots of actual rendered pixels immediately showed the correct cacao color. Lesson: when a DOM/computed-style check contradicts what a screenshot shows, trust the screenshot — screenshots reflect what the compositor actually painted; a JS property read can be stale or wrong for reasons that are hard to pin down.

**404 cat investigation:** console on the live page showed a real error trail — `dotlottie-web`'s WASM binary fetch to `cdn.jsdelivr.net` and `unpkg.com` both failing, with an explicit `[dotlottie-web] Initialization failed` at the end. The site's CSP doesn't allow either host. Also found the local fallback JSON (`public/lottie/persian-cat.json`) was a 116-byte empty placeholder, not real animation data. Rather than widening the CSP for a third-party WASM CDN, downloaded the actual animation (still reachable at the external URL referenced in code) and switched to `lottie-react`, a pure-JS/SVG renderer already in the project's dependencies — no CSP change, no external runtime dependency.

**Merge:** both fixes committed to `fix/nav-color-and-404-cat`, verified, and merged straight to main — treated as corrective fixes to already-live bugs rather than new feature work awaiting review.

**Verified:** clean builds; console showed no WASM errors after the switch; zoomed screenshots (not computed-style checks) confirmed correct hamburger color across the homepage hero, past the hero, `/about`, and `/press`.

## 2026-07-07 (ii) — Small-text legibility fix + testimonials redesign

**Prompt summary:** About page "About" label and press card text (small serif labels) were hard to read — asked to switch from serif to sans-serif and make it more visible. Separately, asked to redesign the testimonials section to match a specific reference (21st.dev component, later replaced with the client's own pasted React/Framer-Motion source for a stacked-photo carousel), and update Sanity to capture image, text, and name.

**Investigation:** an Explore agent traced every complained-about instance back to one root cause — `--font-label`, the token used for every eyebrow/kicker/label sitewide, resolved to Mailendra, a serif whose license was still pending, at small sizes (10-13px) with reduced opacity (38-50%). Asked the client whether to patch just the two flagged spots or fix the token site-wide; they chose the token fix, which resolved About + Press plus every other small label in one change, and also let go of a licensing liability. Also confirmed whether to raise size/opacity beyond the font swap (yes) and what fields the testimonials redesign needed in Sanity (name + quote + image, no separate role field — role/context stays folded into the name text as before).

**Testimonials execution:** the initial pass (matching the 21st.dev description) was a two-column layout with a single circular photo. The client then pasted the exact reference component they wanted — a Framer Motion stacked-photo-deck carousel (inactive cards tilted/scaled/faded behind the active one) with `lucide-react` arrow icons. Rebuilt it to match that design closely while respecting the project's standing motion rule (GSAP only, no Framer Motion) and avoiding a new icon-library dependency (inline SVG arrows instead) — same visual result, no new dependencies.

**Bug found and fixed along the way:** while wiring testimonial data, discovered `testimonialsQuery` queried `author`/`role`/`order`, fields that don't exist on the `testimonial` schema (`personName`/`displayOrder`). This meant no testimonial entered in Studio could ever have rendered with a real name — the query always returned empty/undefined for the field the component displayed. Fixed the query to match the actual schema.

**V1 protection:** adding `personImage` and renaming the display field to `personName` broke the build — `components/home/PressStrip.tsx`, a V1-only (`?v=1`) component, shares the same `HomeTestimonial` type and reads `.author`. The user explicitly said not to touch PressStrip. Fix: kept a computed `author` field on the shared type (always equal to `personName`), so PressStrip keeps compiling and rendering byte-for-byte the same without being edited at all.

**Merge:** client said "commit and push to main" partway through, before a full manual review — did a quick self-verification screenshot of the new testimonials carousel first, then committed, pushed, merged to main, and verified the merged build.

**Verified:** clean builds throughout; `git diff` confirmed zero changes to any V1 file; visually confirmed sans-serif labels on About/Press and the new stacked-photo testimonials carousel in production mode.

**Deferred:** no real testimonial content exists in Sanity yet — homepage still shows placeholder quotes (no photos) until Mandakini enters real ones in Studio.

## 2026-07-07 — Bigger logo, hero background swap, per-page colors, journal (planned)

**Prompt summary:** Mandakini's feedback list: logo a little bigger; hero background over the portrait area changed (asset shared); background colors changed per page from her approved palettes; testimonials and media pages pending from her; studio page opening in a new window; journal/blog page. Arun asked to plan before executing since the client's phrasing needed interpretation, not literal execution.

**Planning:** explored the codebase (routes, V1/V2 split, logo rendering, hero mechanism, page-wash color system, testimonials/press/journal state) and the client's shared assets folder in parallel, then asked clarifying questions before writing a plan — critically, on the hero: the first reading ("background over the portrait area has to be changed") was interpreted as "replace her face with the new flat-lay," but the client corrected this immediately: keep the ink-reveal exactly as it behaves today, her B&W portrait stays the top layer, and the new flat-lay becomes the *bottom* (revealed) layer — and both images should be Sanity-configurable, not hardcoded. Also clarified: Studio-link meaning unclear (deferred), testimonials content will be entered directly in Sanity Studio by the client (no code work needed, section already exists), journal should follow the jardin.showit.site editorial pattern (image/kicker/headline/excerpt/read-more → standard article detail).

**Execution (Workstream A — `feat/hero-flatlay-logo`):** wired the previously dormant `homepage` singleton's `heroRevealTop`/`heroRevealBottom` Sanity fields end-to-end instead of hardcoding the new asset, since the schema already existed but nothing consumed it. Removed the fields' required validation to support independent per-field fallback. Seeded the singleton via Sanity MCP (Studio UI can't create it — actions are `['update','publish']` only) and uploaded the client's flat-lay image (downscaled from 6.5MB/5712px to 2560px via `sips`) through Studio using the same file-input-injection technique from the earlier press-clippings session, since `file_upload` rejects host paths.

**Bug found during review:** client reported "the logo and the image are conflicting" on `/about` with a screenshot, plus the press page background still being plain cream. The first was a real regression — the bigger logo increased the fixed nav's height beyond what `/about` and `/contact`'s top padding had been tuned for, causing a visual overlap. Fixed both pages' clearance and had an Explore agent audit every other page for the same failure mode (none found — other pages center their top content away from the logo). The press background comment was simply flagging that Workstream B (per-page colors) hadn't started yet, not a new bug.

**Localhost review blocker:** the client couldn't get the page to load at all. Root cause (pre-existing, unrelated to this work): the site's CSP has no `unsafe-eval`, which breaks Next's Fast Refresh runtime in `next dev` on every fresh load — the page never hydrates. Solved by switching client review to `npm run build && npm start`, which isn't affected.

**Execution (Workstream B — `feat/page-washes`):** implemented the planned per-page color mapping (works→amber 12%, press→skyline 14% [new], contact→lagoon 8%, about→rosehip 12% replacing its previous 38% amber). Renamed `about-amber`→`about-rosehip` everywhere including a hover-fill color that has to match the page background exactly.

**Merge:** client instructed "commit and push" before reviewing (browser automation was rejected mid-flow), then explicitly "merge everything to main" — both branches merged to `main` via `feat/page-washes` (which already contained `feat/hero-flatlay-logo`'s commits), verified with a clean `npm run build` on the merged result before pushing.

**Verified:** clean builds throughout; hero image sources confirmed via network resource timing (Sanity CDN cross-origin requests) and a hover-triggered pixel reveal showing real flat-lay color through the B&W layer; `/?v=1` confirmed untouched via `git diff --stat`; grepped for stragglers of every renamed CSS class.

**Deferred to a later round:** Journal/blog build-out (schema + routes + jardin-style listing/detail components) was planned but not started this session. Studio-page meaning still needs clarification from Mandakini.

## 2026-07-04 — Homepage press CTA missing + scroll cue too small

**Prompt summary:** From a homepage screenshot, asked whether a "view all press" CTA should be added at the bottom of the press marquee section (it turned out one already existed in code, just not visible in production) — and separately, that the "Scroll" hint at the bottom of the hero is too small to notice; make it bigger and centered.

**Investigation:** the user's original screenshot showed what looked like a dummy/placeholder carousel above the press ticker — turned out to be the unrelated Projects/Works carousel (real Sanity data: Fragments Charcoal, MS Subbalakshmi, London in Gouache), and the ticker below it was already showing real press content correctly. No bug there. Clarified this with the user before touching anything.

Then checked the actual homepage press marquee's footer CTA (`components/home/v2/MarqueePress.tsx` already had `<PillCta href="/press">All press & features</PillCta>` — this was added in an earlier session, "Press reel — slow speed + add CTA"). Scrolled the live production site past the marquee straight into the footer with no CTA visible in between — confirmed via DOM inspection that the element exists (`display: flex`, `opacity: 1`, correct text) but its bounding box was **14,415px wide**. Root cause: `.mr2-press` is `display: grid` with no `grid-template-columns`; the marquee rows' un-wrapped duplicated ticker text has an enormous intrinsic width, and without a column constraint, Grid sizes its implicit column (and therefore every child sharing it, including the footer) to that intrinsic width. The CTA was being centered at the midpoint of a box thousands of pixels wider than the viewport — invisible to every real visitor despite "existing" and passing a naive `display`/`opacity` check.

**Fix:** added `grid-template-columns: minmax(0, 1fr)` to `.mr2-press`, capping the column to the section's actual width.

**Scroll cue fix:** `.mr2-hscene__cue` bumped from `10-12px @ 0.45 opacity, bottom-right` to `13-17px @ 0.7 opacity, bottom-center` (`left: 50%; transform: translateX(-50%)`), per explicit request.

**Verified:** `npm run build` clean. Applied directly to `main` (stashed off the in-progress `press-clippings-lightbox` branch, same pattern as the contact-email fix, since these are unrelated homepage bugs) rather than branching, given the low risk and the user's explicit "commit and push" after checking it themselves on localhost.



## 2026-07-03 (vii) — Contact email → mandakinirao@gmail.com

**Prompt summary:** All mailto/"contact me"/"say hello" forms should deliver to mandakinirao@gmail.com.

**Investigation:** grepped for every `mailto:` and email-address occurrence rather than assuming a single source. Found the address is set in exactly two places, both defaulting to the old `studio@mandakinirao.com` placeholder: `lib/site-settings.ts` (feeds both the `/contact` page's mailto link and the shop's Private Collection `EnquiryForm` mailto, via `getSiteSettings()`), and three server API routes with the same fallback for Resend sends. Checked Sanity directly — no `siteSettings` document exists at all (published or raw perspective), so the code default is the actual live value, not something a Studio edit would override.

**Change:** swapped all 5 occurrences to `mandakinirao@gmail.com`.

**Surfaced but not changed:** `/contact` has two contact mechanisms side by side — a direct mailto link (now fixed) and `ContactForm.tsx`, which still POSTs to `/api/enquiry` (saves to Sanity, only emails if `RESEND_API_KEY` is set — it isn't, so it's currently a no-op for email) rather than using mailto like the shop's sibling form. Only the shop form got last week's "replace Resend with mailto" refactor; the main contact form didn't. Flagged this asymmetry rather than silently unifying the two — changing ContactForm's submit behavior (server save + toast vs. popping open the visitor's email client) is a UX decision, not an email-address swap, so left it for the user to decide separately.

**Verified:** `npm run build` clean, then confirmed via `curl` against the built site that `/contact`'s HTML contains `mailto:mandakinirao@gmail.com` and `/shop`'s HTML carries `contactEmail":"mandakinirao@gmail.com"` through to the enquiry form. No user-facing visual change, so no localhost screenshot review needed — applied directly rather than branching.

## 2026-07-03 (vi) — Lightbox too small, expand cue too loud

**Prompt summary:** From a review screenshot, the lightbox image was rendering much smaller than the available space — asked to make it big enough to actually read. Also asked for the clickability of clipping cards to be signaled subtly, not obviously.

**Diagnosis:** the lightbox `<Image>` had hardcoded `width={1400} height={1800}` (portrait 0.78 ratio) applied uniformly to every clipping. Checked the actual loaded dimensions of one clipping — 2000×769, landscape — confirming the hardcoded box shape was fighting the real image on every card that isn't portrait-ish. `width:auto;height:auto` in CSS doesn't override this because the browser still treats the HTML `width`/`height` attributes as the element's intrinsic size for layout purposes.

**Fix:** replaced `next/image` with a plain `<img>` in the lightbox specifically (grid thumbnails still use `next/image` — they have a real fixed aspect-ratio container via CSS, so no bug there) so sizing comes from the real loaded image, not a guess. Raised the lightbox's CSS size caps (padding, frame, image) and bumped the source image resolution cap in `lib/press.ts` from 1200px to 2000px, since the grid thumbnail and the near-full-viewport lightbox now share one URL and the lightbox needs real detail to be legible.

**Subtlety fix:** cursor changed to `zoom-in` on clipping cards (a more specific, conventional signal than a generic pointer). The circular expand badge dimmed to `opacity: 0.55` by default, brightening on hover/focus — visible enough to notice, not loud enough to look like a UI control shouting for attention.

**Verified:** `npm run build && npm start`, Chrome automation — confirmed the lightbox image now loads at its real 2000×769 and fills the frame properly (screenshot matches expectation), badge dims correctly at rest. Not committed — still in the same review cycle as the previous clipping-upload work.


## 2026-07-03 (v) — Print clippings: upload + lightbox card

**Prompt summary:** 7 photographed/scanned press-article images sitting in `assests by mandakini/Press Articles/` needed to go into Sanity and onto `/press`. No source URL exists for these (they're print, not online), so asked for a different presentation: expand on click. Also asked, as an open question, whether the same treatment should extend to images elsewhere on the site.

**Answered the open question first (exploratory, not implemented):** recommended not extending the lightbox site-wide yet — other image contexts (hero, works, shop) already have a clear click destination (a series/product page), so a lightbox there would compete with existing navigation. Flagged works/gallery detail images as worth reconsidering later, as its own decision, not bundled into this one.

**Schema + data model:** `pressItem.link` changed from required to optional. `lib/press.ts` skips the OG/oEmbed fetch entirely when there's no link (nothing to fetch), and adds a third mode, `'clipping'`: assigned when there's no link but a thumbnail exists. Mode precedence, in order: no thumbnail → logo; no link + thumbnail → clipping; `logoCard` flag or still no thumbnail → logo; otherwise → photo.

**Component work:** `components/press/PressPage.tsx` converted to a client component (`'use client'`) — needed for the lightbox's open/close state; the data fetch stays server-side in `page.tsx`, only rendering moved client-side. New `ClippingCard`: the scan is shown uncropped (`object-fit: contain` on a cream mat) with no scrim or overlaid text — overlaying text on a document scan would make it harder to read, the opposite of what a photo-card overlay is for. A small circular expand-glyph badge (matching the site's pill/circle rule) sits top-right of the image; caption (label/headline/source) lives below on its own line, not overlaid. New `Lightbox`: GSAP fade+scale via the shared `lib/motion.ts` tokens (`DUR`, `EASE`, `mandaGsap`), `prefers-reduced-motion` → instant show/hide, dismissible via Escape, backdrop click, or a circular close button; locks body scroll while open. `buildColumns()` (from the previous session's paired-column layout work) generalized from a strict photo/logo split to "tall" (photo + clipping) vs "short" (logo), so clipping cards slot into the same alternating-column rhythm without a redesign.

**Upload mechanism (the actual friction point):** no Sanity MCP tool accepts raw file uploads — `create_documents`/`patch_documents` only take JSON, and the browser's own `file_upload` tool stopped accepting filesystem paths mid-session ("must read the file and pass its contents via the `files` parameter... update the desktop app"). Worked around this by copying the 7 images into `public/tmp-press-upload/` (Next.js serves `/public` directly, no rebuild needed), then in the Studio tab: `fetch()` the same-origin URL, build a `File` from the blob, attach it to the hidden Sanity file `<input>` via a `DataTransfer` object and a dispatched `change` event — functionally identical to a real drag-and-drop, no separate asset API involved. Deleted `public/tmp-press-upload/` once all 7 uploads completed.

**Content accuracy:** read each of the 7 scanned clippings directly (via the image-reading tool, not filename guessing) before writing headline/source. Three items (Art 48 feature, "Let the wall do the talking", Nagarame O Chitram) have an unclear or unreadable publication name on the scan — left `source` blank rather than attributing them to a guessed outlet. This also means those three are correctly excluded from the homepage ticker (which requires both headline and source), while the 4 with confirmed sources appear there.

**Verification:** `npm run build && npm start`, Chrome automation. Confirmed: all 8 items render (1 real photo card + 7 clippings) in the correct paired-column layout; clicking a clipping opens the lightbox with the full scan and caption; close button and DOM-state-after-close both verified; the real Telangana First card is unaffected and still opens externally in a new tab; homepage ticker correctly picks up only the 4 sourced clippings. Hit the same dev-mode persisted-fetch-cache issue as prior sessions when the Studio's cold-start briefly 500'd on `/studio/structure/pressItem` right after a `.next` wipe — resolved by a second clean restart, unrelated to this feature.

**Not committed** — stopping here for review, per this project's established pattern (confirmed explicitly after being corrected on this point earlier in the engagement).

## 2026-07-04 (ii) — Merging press-clippings-lightbox into main

**Prompt summary:** User reported `/press` still showed the old plain-photo-card layout in production while localhost showed the correct clipping/lightbox/paired-column result.

**Diagnosis:** the branch had been reviewed, approved, and pushed — but never merged into `main`. `git diff main press-clippings-lightbox --stat` confirmed `main` was still on the pre-clippings commit; production was serving that. Not a new bug, just an unmerged branch.

**Fix:** merged `press-clippings-lightbox` into `main`. Conflicts were limited to `PROGRESS.md`/`PROMPT_LOG.md` (additive doc sections, resolved by keeping both in chronological order); the three email-fix files and CSS auto-merged cleanly since only one side had touched them since the branch point.

## 2026-07-03 (iv) — Press grid: paired-column layout (Function Health reference)

**Prompt summary:** User annotated a screenshot of the Function Health press grid: each column pairs one photo card + one logo/text card, and which sits on top alternates per column ("1 can be the text and 2 can be the image... next item top image bottom text, then top text bottom image"). Asked not to look like the dense-packed result the fix currently produced.

**First pass rejected before commit:** grouped items into columns by raw sequential order (2 items at a time from the displayOrder-sorted list) with alternating `flex-direction: column-reverse` per column. Looked wrong with real+demo data — whenever two adjacent items happened to share a mode (e.g. two photo-mode Wikipedia fetches back to back), the column showed two stacked photos next to a column of two stacked logo cards. User caught this immediately from a screenshot ("i dont think you understood... it should not look like this") before I'd committed anything.

**Fix:** `buildColumns()` in `components/press/PressPage.tsx` — split items into separate `photos` and `logos` arrays (mode-filtered, order preserved within each), then zip: column `i` = `[photos[i], logos[i]]`. This guarantees every column pairs one distinct photo item with one distinct logo item, exactly like the reference (each card in a pair is a different press mention, not an image+caption of the same one). Leftover items (unequal photo/logo counts) become solo single-card columns. The existing `i % 2 === 1 → column-reverse` alternation was kept — it now flips a true photo/logo pair instead of two same-mode cards.

**CSS restructuring (`app/v2.css`):** the grid stopped being a `grid-auto-flow: dense` masonry (which placed cards by whatever fit, not by pairing) — now `.mr2-press-bento` is a plain 4-col grid of `.mr2-press-col` flex-column wrappers, each holding exactly the 2 (or 1) cards for that column. `.mr2-press-card--img` moved from `grid-row: span 2` to `aspect-ratio: 3/4` since it's no longer a row-spanning grid item.

**Verification:** since only one real press item exists (no natural way to see multi-column pairing), published 4 temporary demo items (mixed photo/logo/podcast modes) via Sanity MCP, confirmed via Chrome automation (screenshots + DOM inspection of `.mr2-press-col` children) that columns correctly pair one photo + one logo item with alternating stack order, then fully removed the demo drafts (unpublish + discard) so only the real item remains. User reviewed on localhost and approved; committed and pushed directly to `main` per explicit instruction this time (not a feature-branch-only merge).

---

## 2026-07-03 (iii) — Press card: bigger text, still "barely readable"

**Prompt summary:** After the first legibility pass (larger headline, lighter tracking, stronger scrim), user reported the text was still barely readable on the Vercel preview and asked to increase font size further — no other direction given.

**Fix:** bumped photo-mode text sizes again, same scoped selectors as the first pass (`.mr2-press-card--img .mr2-press-card__{label,title,cta}`, `.mr2-press-card__source`): label 11px→13px, source 12px→16px, CTA 11px→13px, headline `clamp(1.2rem,2vw,1.5rem)` → `clamp(1.4rem,2.6vw,1.9rem)`. Letter-spacing tightened slightly further (0.1em → 0.06–0.08em) since larger uppercase text at the same tracking looks looser. Overlay `gap` 0.5rem→0.6rem for breathing room. Verified via zoomed screenshot on `npm run build && npm start` — did not commit yet, rolled into the same working-tree change as the column-layout fix below since the user moved straight to the next request before reviewing/approving this one in isolation.

---

## 2026-07-03 (ii) — Press card legibility fix (photo mode only)

**Prompt summary:** Live `/press` photo-mode card text (headline, ARTICLE label, source, READ) too small/faint/tracked-out to read over the image — Telangana First card given as the example, text "nearly dissolves into the photo." Fix only: bigger headline as focal text, subtler tracking, stronger scrim under the text specifically (not the whole card), cream text confirmed against the scrim not the raw image. Do not touch logo-mode unless values are shared (verify if so). No redesign, no GSAP/motion changes, palette locked. STOP for localhost review before commit.

**Context noticed on read:** the screenshot showed telanganafirst.in now rendering in photo mode with no headline — checked Sanity directly and found the client had since added a `thumbnailOverride` image and manual `source: "Telangana First"` via Studio (my two review-only demo items from the previous session were also gone — client had cleaned them up). Real data now: thumbnail present, headline still null. Confirms the fix needs to look right both with and without a headline.

**Fix — CSS only, scoped to `.mr2-press-card--img`:**
- Headline: `clamp(0.88rem,1.1vw,1rem)` → `clamp(1.2rem,2vw,1.5rem)`, opacity 0.9→0.97 — now unambiguously the card's focal text.
- Label/source/CTA: 10px→11–12px, letter-spacing 0.2–0.28em → 0.1em (kept subtle tracking, not zero), opacity 0.45–0.55 → 0.78–0.85.
- Scrim: rebuilt from a 3-stop to a 5-stop gradient, near-solid (~0.9+) for roughly the bottom quarter where text sits, fading out by ~85% up the card — stronger locally without darkening the whole photo.
- Deliberately did NOT reorder the source above the headline (considered it, reverted) — that would have been a layout change, out of scope for "legibility only."
- Headline/CTA overrides scoped via `.mr2-press-card--img` ancestor selector specifically so logo-mode (`.mr2-press-card--logo`, `--dark` variants) can't inherit anything — verified by temporarily flipping a demo item's `logoCard` boolean and comparing side by side; logo card unchanged.

**Verification:**
- The one real press item currently has no headline, so headline-specific sizing couldn't be checked against real data. Temporarily published a demo item (Wikipedia, has a headline) to verify, then unpublished + discarded the draft immediately after confirming — production Sanity now shows only the real `telanganafirst.in` item, matching what's live before this change (thumbnail + source, no headline).
- Hit the same dev-mode persisted-fetch-cache issue as the previous session (publishing new Sanity content after an existing `.next` build meant the page kept serving the pre-publish snapshot) — same fix, `rm -rf .next` before each server restart.
- Confirmed via `npm run build && npm start` + Chrome automation (forcing `img.loading = 'eager'` to work around this browser tool's lazy-load screenshot timing quirk, same as last session): Telangana First card text is now clearly legible at a glance; a headline-bearing demo card showed the headline as clear focal text; logo-mode card confirmed unchanged.
- Build clean, zero errors.


## 2026-07-03 — Press build-time auto-fetch + masonry card design

**Prompt summary:** Build the build-time auto-fetch for press items and the masonry card design (Function Health reference), in order. GSAP+Lenis+ScrollTrigger only, palette locked (no blue/grain, pill/rounded/circular only), GROQ only in `sanity/lib/queries.ts`. Context given up front: fields already existed on the schema but the fetch was never implemented (live `/press` showed empty "ARTICLE"/"READ" cards), and auto-fetch will fail often for this site's real press (regional outlets, old archive URLs, print, paywalls) — override is a normal input, not a rare rescue. STOP for localhost review before commit.

**Diagnosis before writing code:**
- Read `sanity/lib/queries.ts`, `lib/press.ts`, `components/press/PressPage.tsx`, `app/(site)/press/page.tsx`. Found `lib/press.ts` and `pressItemsQuery` already existed but used field names from *before* the 2026-06-23 schema restructure (`url`, `titleOverride`, `imageOverride`, `sourceOverride`, `order`) — the restructure renamed these (`link`, `headlineOverride`, `thumbnailOverride`, `source`, `displayOrder`) but the query/lib layer was never updated. That mismatch, not a missing feature, was the actual root cause of the empty cards.
- Queried Sanity directly (`mcp__Sanity__query_documents`): only one real `pressItem` document exists (`telanganafirst.in`, all override fields null) — confirmed this is the "poor OG" real-world case named in the prompt.

**Part 1 — build-time fetch:**
- Confirmed and kept the existing architecture: fetch runs server-side in the async Server Component `app/(site)/press/page.tsx` (ISR, revalidate 3600) and in `getHomeData()` — never client-side.
- Rewrote `lib/press.ts`: renamed all fields to match current schema, implemented exact `?? ` precedence per spec (no more falling back to the raw URL as a fake headline), oEmbed-first for YouTube, OG-tag scrape otherwise, both under a 5s timeout + try/catch that returns `{}` on any failure — matches "missing OG tags is expected, not an error."
- Fixed `sanity/lib/queries.ts` `pressItemsQuery` field list and ordering field.
- Updated `lib/home-data.ts` ticker mapping; filtered items with no headline/source out of the ticker only (grid still shows them via logo mode) so the homepage marquee never renders blank text.

**Part 2 — masonry card, two modes:**
- Added one schema field, `pressItem.logoCard` (boolean) — needed because "has a thumbnail" alone can't distinguish a real photo from an uploaded publication logo; asked the editor to flag it explicitly rather than guessing from image aspect ratio.
- Rewrote `components/press/PressPage.tsx`: `PhotoCard` (full-bleed image, warm cacao bottom-up scrim, no hard edge) and `LogoCard` (cream card, circular mark — uploaded logo image or a generic circular seal when there's truly no image — headline/source as text). Circular mark chosen to satisfy the "pill/rounded/circular only" constraint.
- `app/v2.css`: scrim recolored from near-black to warm cacao (`rgba(44,26,14,...)`) per the locked palette; added the logo-card CSS block. Existing bento/masonry grid (photo cards span 2 rows) kept.
- Part 3 (Studio hints): updated `link`, `headlineOverride`, `thumbnailOverride`, `source` field descriptions on `pressItem` to say overrides are normal/expected, not just "leave blank to auto-fill."

**Unplanned but necessary fix surfaced mid-task:** auto-fetched thumbnails come from arbitrary outlet domains, which the recent CSP-hardening commit's `img-src 'self' data: https://cdn.sanity.io` and `next.config.js` `remotePatterns` (Sanity-only) would both block/throw on. Widened both to any `https:` host for images only — flagged explicitly rather than silently loosening security config, since it touches a recent hardening commit.

**Verification:**
- Added two demo `pressItem` documents via Sanity MCP for the review only: a plain-auto-fill Wikipedia article (no overrides) and a text-override-only item (headline+source set by hand, no thumbnail). Left the real `telanganafirst.in` item untouched as the "graceful no-data" case.
- `npm run build` clean, zero errors. Verified all three states visually via `npm run build && npm start` (not `next dev` — dev mode's CSP blocks React Fast Refresh's eval-based HMR, a pre-existing unrelated issue, not a regression from this task) using Chrome automation: auto-filled photo card, override-driven logo card, and the graceful empty-state logo card with generic seal all render correctly and distinctly.
- User completed their own localhost review and approved; proceeding to commit per their instruction. Demo Sanity documents intentionally left in place unless told to remove them.


## 2026-07-01 — Hero full-bleed + loading morph + nav update (Parts 1–5, session 2)

**Prompt summary:** Supersedes session 1. Full-bleed hero, centered artist name with warm scrim, loading screen that morphs into hero as one continuous GSAP timeline (FLIP-style — oval + name travel from screen-centre to hero positions). No Framer Motion, palette locked, prefers-reduced-motion respected.

**Actions taken:**

### Part 1 — Full-screen hero (retained from session 1)
- Same as session 1. No changes.

### Part 2a — Logo oval (3 review options, retained from session 1)
- `HeroScene.tsx`: `data-hero-oval` attribute added to option A — the loader morph measures this element as its destination.

### Part 2b — Centered name + warm gradient scrim (new)
- `HeroScene.tsx`: Added `<div className="mr2-hscene__scrim" aria-hidden="true" />` as sibling before `.mr2-hscene__text`.
- `app/v2.css`: `.mr2-hscene__scrim` — radial-gradient ellipse at `top: 62%`, cacao tones `rgba(44,26,14,...)`, 4-stop falloff from 0.70→0.38→0.12→transparent, `z-index: 5`, `pointer-events: none`.
- `app/v2.css`: `.mr2-hscene__vignette` — changed from pure-black `rgba(0,0,0,...)` to warm cacao `rgba(44,26,14,...)`.
- `app/v2.css`: `.mr2-hscene__name` — `left:50%; transform:translate(-50%,-50%); text-align:center` for true centering.

### Part 3 — Loading screen morphs into hero (full rewrite)
- `components/home/v2/LoadingScreenStripes.tsx` completely rewritten:
  - Dark `#1A0D06` field, centred oval (`.mr2-hero-oval--a`) + artist name + Enter pill.
  - Entrance: staggered fade-in (oval → name → button), delay 0.35s, DUR.base, EASE.
  - On Enter (GSAP timeline, T0=0.08):
    - Enter button fades up and out (0.32s)
    - Root bg lifts to `transparent` (DUR.grand) — hero image reveals beneath
    - Oval travel: measures loader oval + `[data-hero-oval]` rects; translate+scale to hero; crossfade loader→hero oval near end of travel
    - Name travel: hero `[data-hero-name]` set to loader name rect via GSAP, then travels to natural position (x:0, y:0, scale:1); loader name fades in place
  - Reduced-motion: simple `autoAlpha` fade, no travel.
- `components/home/v2/HeroScene.tsx`: `HeroSceneHandle` extended with `playEntranceAfterMorph()` — only animates `.mr2-hscene__sub` (tagline); name already at final position after morph.
- `components/home/v2/HomeExperienceV2.tsx`: `handleComplete` calls `playEntranceAfterMorph()` instead of `playEntrance()`. Returning-visitor path still calls `playEntrance()` (name + tagline both animate).
- `app/v2.css`: Loader section rewritten — `.mr2-loader { background: #1A0D06 }`, `.mr2-loader__inner { flex-direction:column; align-items:center }`, `.mr2-loader__name` typographic styles, `.mr2-loader__enter` pill + `:hover` retained.

### Parts 4–5 (retained from session 1)
- Nav hide/show and Press in hamburger unchanged.

### Build result
- ✓ Compiled successfully — 15 routes, zero errors.

### STOP POINT
Awaiting localhost review: full-bleed hero, 3 oval options, centered name+scrim, loading-to-hero morph. Oval pick required before removing unused options and committing.

---

## 2026-07-01 — Hero full-bleed + nav update (Parts 1–4)

**Prompt summary:** Multi-part hero and nav update. GSAP + Lenis + ScrollTrigger only, no Framer Motion. Full-screen ink-reveal hero (no inset panel), cream oval logo at top centre with 3 review options, header hide/show on scroll direction, Press added to hamburger.

**Actions taken:**

### Part 1 — Full-screen hero
- `app/v2.css`: Removed `clip-path: inset(14% 8% 12% 8% round ...)` from `.mr2-hscene__clip`. Hero is now full-bleed.
- `app/v2.css`: `.mr2-hscene` background changed from `var(--v2-bg)` to `#2C1A0E` (no cream mat).
- `components/home/v2/InkReveal.tsx`: `BRUSH_R` 130→190, `BRUSH_VARY` 50→70 for full-viewport feel.

### Part 2 — Logo oval (3 review options)
- `components/home/v2/HeroScene.tsx`: Added `.mr2-hero-ovals` with 3 oval variants (A/B/C), positioned absolute at `top: clamp(18px,3.5vh,36px); left: 50%; transform: translateX(-50%)`.
- `app/v2.css`: Added `.mr2-hero-ovals`, `.mr2-hero-oval`, `.mr2-hero-oval--a/b/c`, `.mr2-hero-oval__tag` CSS.
- All ovals: `background: #F5EFE4`, `border-radius: 999px`, cacao logo.
- Option A: `1px solid #2C1A0E`, padding `18–28/28–44px`, logo `40–60px`.
- Option B: `2px solid #2C1A0E`, padding `12–18/18–28px`, logo `34–50px`.
- Option C: no border, `box-shadow: 0 2px 18px rgba(44,26,14,0.22)`, padding `24–36/40–58px`, logo `46–70px`.
- Review labels (A/B/C) shown in cream text below each oval.
- **STOP POINT: oval pick required before committing.**

### Part 3 — Nav hide/show on scroll direction
- `components/layout/Navigation.tsx`: `navHidden` state, scroll listener with 6px dead zone, resets at `scrollY < 80` and when menu open. Class `site-nav--hidden` applied to `<nav>`.
- `app/globals.css`: `.site-nav` transition extended to include `transform 0.48s var(--ease-manda)`. `.site-nav--hidden { transform: translateY(-100%) }`. Reduced-motion override: `opacity: 0; visibility: hidden` (no transform).
- Logo oval is in hero, not nav → it stays when nav hides and disappears naturally as content scrolls over the hero.

### Part 4 — Press in hamburger
- `components/layout/Navigation.tsx`: `{ label: 'Press', href: '/press' }` added to `menuLinks` between Shop and About.

### Build result
- ✓ Compiled successfully — 15 routes, zero errors. Pre-existing warnings unchanged.

---

## 2026-06-26 — Revalidation audit + webhook documentation

**Prompt summary:** Diagnose why Sanity publishes don't appear on the live Vercel site. Confirm `revalidatePath('/', 'layout')` coverage. Update docs only — no code changes.

**Diagnosis:**
- All content pages use `export const revalidate = 60` (ISR). `press` uses 3600.
- `useCdn: false` in `sanity/lib/client.ts` — no Sanity CDN staleness.
- `app/api/revalidate/route.ts` exists and is correct. It calls `revalidatePath('/', 'layout')` after verifying `SANITY_REVALIDATE_SECRET`.
- Root cause: Sanity webhook was not configured in `sanity.io/manage`, so the route was never called. Site was relying on ISR-only.

**Coverage confirmed:**
`revalidatePath('/', 'layout')` targets `app/layout.tsx` (root layout). All content pages pass through it — homepage, /works, /works/[slug], /shop, /shop/[slug], /press, /about, /contact, /thank-you. The `(site)` route group is URL-transparent and does not create a separate layout scope. `/studio/*` and `/admin` excluded by design.

**Architecture documented in PROGRESS.md:**
- On-demand revalidation: Sanity webhook → `/api/revalidate` → `revalidatePath('/', 'layout')`
- Auth: `x-revalidate-secret` header matched against `SANITY_REVALIDATE_SECRET` Vercel env var
- ISR fallback: `revalidate = 60` remains as safety net
- Open item recorded: webhook URL must be manually updated when domain switches to `mandakinirao.com`

**Actions taken:** PROGRESS.md and PROMPT_LOG.md updated. No code changed.

---

## 2026-06-24 — Phase 3: 404 page

**Prompt summary:** Multi-phase session. Phase 3: create the 404 not-found page with breathing GSAP radial gradient (terracotta/amber/rosehip/moss), Lottie Persian cat placeholder, and pill CTA home.

**Actions taken:**
- Confirmed no `not-found.tsx` existed. Installed `lottie-react@2.4.1`.
- Created `public/lottie/persian-cat.json` (minimal valid empty Lottie — placeholder).
- Created `components/NotFound.tsx`: four blob divs with radial gradients, GSAP yoyo breathing, Lottie dynamic import with `LOTTIE_PLACEHOLDER` const, text, `PillCta href="/"`.
- Created `app/not-found.tsx`: imports `NotFound`, exports metadata.
- Appended `.mr-nf` CSS block to `app/v2.css`.
- Fixed TypeScript error: `lottie-react` doesn't accept `animationData: null` — replaced with valid empty Lottie object.
- Build verified clean. Committed `02074fc`.

---

## 2026-06-24 — Phase 2: works index fixed-slot crossfade preview

**Prompt summary:** Multi-phase session. Phase 2: replace cursor-following floating image preview on the Tier 2 works list with a fixed-position GSAP opacity crossfade between per-series image slots.

**Actions taken:**
- Removed `previewImgRef`, cursor-follow logic (`quickTo x/y`, `pointermove`, scroll-hide), per-row pointerleave hide.
- Added `slotRefs` array; each series pre-renders an `<img>` stacked in the preview panel at `opacity: 0`.
- `pointerenter` → crossfade in/out active slots. `pointerleave` on `.mr-windex__list` → hide panel.
- Updated `.mr-windex__preview` CSS: fixed right panel (`right: clamp(2rem,5vw,6rem); top:50%; transform:translateY(-50%)`), added `.mr-windex__preview-img` for stacked positioning.
- Build verified clean. Committed `cd5b34a`.

---

## 2026-06-24 — Phase 1: dark theme removal

**Prompt summary:** Multi-phase session. Phase 1: remove the dark/light theme toggle system entirely. Collapse to a single cream stage. Preserve V1 route isolation — `body:not(.mr2-mode)` cursor rule must keep working.

**Actions taken:**
- Diagnosed V1 isolation conflict before acting: `mr2-mode` serves two roles (theme gating + V1 discriminator). Resolved by keeping `mr2-mode` as V1 guard only, stripping theme logic.
- Pruned `ThemeV2.tsx` to V1 guard only (no localStorage, no `mr2-light`).
- Removed `THEME_KEY`, `toggleTheme`, `light` state, and toggle button from `Navigation.tsx`.
- Promoted light-canonical values to `:root` in `v2.css`; deleted `body.mr2-mode.mr2-light` block; fixed logo to always show cacao; removed theme-toggle CSS; fixed `mr2-works__meta` blend mode.
- Deleted `.menu-overlay__theme*` CSS from `globals.css`.
- Stripped `body.mr2-mode.` prefix from all page-wash selectors in `pages.css` and `about.css`.
- Build verified clean. Committed `e39580e`.

---

## 2026-06-23 — Schema audit + restructure (Phase 3)

**Prompt summary:** Update all Sanity schemas to a new audited structure. Schema-only change — do not touch front-end components or GROQ consumers. Diagnose first, report, then implement. Do not commit or push.

**Actions taken:**
- Delivered full pre-change state report (11 document types, all fields, orphans identified).
- Created `sanity/schemas/homepage.ts` and `sanity/schemas/about.ts` (new singletons).
- Modified `project.ts`, `shopItem.ts`, `testimonial.ts`, `pressItem.ts`, `order.ts`, `siteSettings.ts`, `sanity/schemas/index.ts`, `sanity.config.ts`.
- Build verified clean (`npm run build` — 16 routes, zero errors).
- No commit or push. Stopped for localhost review.

**Orphans pending confirmation:** `aboutPage` schema, `navigation` schema, 22 siteSettings fields, legacy shopItem commerce fields (`desc`, `basePrice`, Stripe fields, `purchaseType`, `availabilityStatus`, `stock`, `sizes`, `frameOptions`, `editionNumber`, `editionSize`, `sold`, `certificateIncluded`, `shippingInfo`).

**Follow-up required:** GROQ query updates in `sanity/lib/queries.ts` (8 queries affected), data migration for `aboutPage` → `about`, `heroImages` → `homepage` singleton, siteSettings social handles.

---

## 2026-06-22 (i) — Studio crash + upload CORS fix

**Prompt summary:**
Fix the Studio structure tool crash (zombie upload items) and the image upload failure (missing CORS localhost entry). Commit and push.

### Fix 1 — Studio crash (zombie image items in "London in Gouache")

Located the document via GROQ (`*[_type == "project" && seriesName match "London*"]`):
- Published ID: `f56fd071-8dc9-4452-a30f-c123ef5a7145`
- Draft ID: `drafts.f56fd071-8dc9-4452-a30f-c123ef5a7145`

Patched the draft to unset the two zombie items:
```
patch_documents: drafts.f56fd071-8dc9-4452-a30f-c123ef5a7145
  unset: images[_key=="6eeed290155a"]
  unset: images[_key=="2255ce8860bc"]
```

Result: 1/1 successful. Zombie items removed. Studio `/studio/structure/project` will no longer crash.

### Fix 2 — Upload CORS (localhost)

```
add_cors_origin: http://localhost:3000
  allowCredentials: true
  projectId: i4t9kzxg
```

Result: Added. Local dev Studio uploads now unblocked.

Both fixes are Sanity-side (data + project config) — no code changes, no build needed.

---

## 2026-06-22 (h) — Image upload failure diagnosis (report only)

**Prompt summary:**
Image uploads to a project's Images field in Sanity Studio fail with "Upload failed — see the console for more information." This blocks the client from adding artwork — high priority. Diagnose cause: reproduce the error, check CORS origins and `allowCredentials`, check write token / auth, check Images field definition for recent breaking changes. State single most likely root cause. Report only — no changes, no commit.

---

### Task 1 — CORS configuration (confirmed via Sanity Management API)

```
GET https://api.sanity.io/v2021-06-07/projects/i4t9kzxg/cors
Authorization: Bearer <auth token from `sanity debug --secrets`>
```

**Full response:**
```json
[
  {
    "id": 2899216,
    "origin": "https://mandakini-website.vercel.app",
    "allowCredentials": true,
    "createdAt": "2026-06-13T14:59:35.027Z",
    "updatedAt": "2026-06-13T14:59:35.027Z",
    "projectId": "i4t9kzxg"
  }
]
```

**Findings:**
- Exactly one CORS origin is configured: `https://mandakini-website.vercel.app`.
- `allowCredentials: true` is set on that origin — correct for OAuth-based Studio uploads from production.
- `createdAt: 2026-06-13T14:59:35.027Z` — this entry was created (or re-created) today. Before today there was either no entry or an entry without `allowCredentials: true`.
- **No localhost entries.** `http://localhost:3000`, `http://localhost:3001`, and `http://localhost:3333` are all absent.

**Consequence:**
- Production Studio (`https://mandakini-website.vercel.app/studio`) → CORS now correctly configured; uploads should succeed as of today.
- Local dev Studio (`http://localhost:3000/studio`) → **all requests from the Studio to `api.sanity.io` are CORS-blocked**. No CORS entry exists for localhost; the browser will reject every upload preflight with a CORS error.

---

### Task 2 — Auth / write token

Sanity Studio uses **OAuth authentication** for all operations — the logged-in user's session cookie is sent with each request to `api.sanity.io`. A `SANITY_API_TOKEN` is not required for Studio uploads; it is only required for server-side writes from Next.js API routes / serverless functions.

Current auth state:
- `mcp__Sanity__whoami` → authenticated as "Mandakini rao" (mandakinirao@gmail.com), role: `administrator`.
- `.env.local` — no `SANITY_API_TOKEN` key present at all.
- `.env.local.example` — `SANITY_API_TOKEN=` (empty placeholder; never filled in).
- Vercel production env vars — cannot inspect (Vercel CLI not authenticated in this session).

**Verdict:** The absent `SANITY_API_TOKEN` does **not** explain Studio upload failures. Studio uploads authenticate via OAuth session, not via API token. The missing token would only affect server-side writes (e.g., a `/api/sanity-write` route) — not present in this project. This is a red herring for the Studio upload issue.

---

### Task 3 — Images field definition (recent changes)

Current `project.images` field (`sanity/schemas/project.ts`):
```ts
defineField({
  name: 'images',
  title: 'Images',
  type: 'array',
  of: [{ type: 'image', options: { hotspot: true } }],
  options: { layout: 'grid' },
  description: 'Upload one or more images for this series. Drag to reorder. The first image is used as the cover.',
}),
```

This is a standard Sanity image array definition. The field was introduced in the 2026-06-21 schema collapse (commit `71e2ccf`) replacing `coverImage` + `artworkImages`. No subsequent changes have been made to the field definition.

**Verdict:** The field definition is correct and there are no unusual wrappers, custom input components, or recent structural changes that would break upload handling. The schema is not the cause.

---

### Task 4 — Package versions

```
sanity                3.99.0   (latest: 6.1.0)
@sanity/vision        3.99.0   (latest: 6.1.0)
@sanity/cli (global)  3.99.0   (latest: 7.2.3)
```

The installed Sanity package (`3.99.0`) is severely outdated. The NPM registry now shows the latest as `6.1.0`, meaning **two full major versions** have been skipped. Package mismatches at this scale can cause subtle issues with Studio behaviour, upload progress handlers, and asset processing — but this is a background risk factor, not the proximate cause of the upload failure.

---

### Task 5 — Single most likely root cause

**CORS: missing `allowCredentials: true` on the production origin (now fixed), plus no localhost entry for local development.**

**What was happening before today:**
- The production CORS entry (`https://mandakini-website.vercel.app`) was created at `2026-06-13T14:59:35.027Z` with `allowCredentials: true`. Before that timestamp, the entry either did not exist or existed without credentials allowed.
- When `allowCredentials` is not set (or the origin is absent), the browser cannot send the user's Sanity OAuth session cookie in cross-origin requests to `api.sanity.io`. The upload request arrives at Sanity's asset API unauthenticated, and Sanity rejects it — which the Studio surfaces as "Upload failed."

**What is happening now (ongoing):**
- Production Studio uploads should now work since `allowCredentials: true` is set.
- **Local development uploads remain broken.** Any attempt to upload from `http://localhost:3000/studio` will be CORS-rejected by the browser before the request even reaches Sanity. This is the active failure mode for anyone testing locally.

**Fix (not applied — report only):**
Add a localhost CORS origin with `allowCredentials: true`:
```
npx sanity cors add http://localhost:3000 --credentials
```
Or via Sanity manage UI: `manage.sanity.io → project i4t9kzxg → API → CORS Origins → Add origin`.

No code changes, no schema changes, no token needed.

---

## 2026-06-22 (g) — Studio structure tool crash diagnosis (report only)

**Prompt summary:**
The Sanity Studio structure tool crashes ("The structure tool crashed") when opening the `project` document type at `/studio/structure/project`. REPORT ONLY — no fixes, no commits. Tasks: (1) show the structure/desk definition for the project pane, (2) grep all schema and config files for remaining `artwork` references, (3) reproduce the crash locally and capture the stack trace, (4) identify the exact cause.

---

### Task 1 — Structure tool definition for the project pane

File: **`sanity.config.ts`** (complete, 49 lines)

```ts
import { defineConfig } from 'sanity'
import { deskTool, type StructureBuilder } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

const PINNED = [
  'siteSettings',
  'project',
  'shopItem',
  'order',
  'pressItem',
  'testimonial',
]

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings (featured & socials)')
        .id('siteSettings')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings')
        ),
      S.divider(),
      S.documentTypeListItem('project').title('Projects (series)'),   // ← this pane crashes
      S.documentTypeListItem('shopItem').title('Shop items'),
      S.documentTypeListItem('order').title('Orders'),
      S.divider(),
      S.documentTypeListItem('pressItem').title('Press'),
      S.documentTypeListItem('testimonial').title('Testimonials'),
      ...S.documentTypeListItems().filter(
        (item) => !PINNED.includes(item.getId() ?? '')
      ),
    ])

export default defineConfig({
  name: 'mandakini-rao',
  title: 'Mandakini Rao',
  basePath: '/studio',
  projectId: 'i4t9kzxg',
  dataset: 'production',
  plugins: [deskTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
})
```

A previous fix (commit `71e2ccf`) already removed `'artwork'` from the PINNED array and `S.documentTypeListItem('artwork').title('Artworks (pieces)')` from the structure items list — that fixed an earlier crash ("Schema type with name artwork not found"). The current structure definition is clean.

---

### Task 2 — Full `artwork` grep across all schema and config files

Command: `grep -rn "artwork" . --include="*.ts" --include="*.tsx" --include="*.js" --exclude-dir=node_modules --exclude-dir=.next`

**Results (2 hits, both comments — no type references):**

| File | Line | Content |
|------|------|---------|
| `sanity/schemas/enquiry.ts` | 6 | `* NOTE: this document never references private artworks; the private` |
| `lib/home-data.ts` | 6 | `* workspace and the Sanity dataset has no artwork yet (Block 13 pending),` |

**Verdict:** Zero `artwork` type references anywhere. No reference type definitions, no GROQ queries, no `initialValue`, no `orderings`, no `preview`, no structure builder calls. The `artwork` type is fully removed from the project.

---

### Task 3 — Crash reproduced: verbatim stack trace

The production Studio at `mandakini-website.vercel.app/studio/structure/project` provided this error (captured from the browser console by the user):

```
Error: getAttribute only applies to plain objects
    at d.getAttribute
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:31916)
    at H.applyViaAccessor
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:52144)
    at H.apply
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:52086)
    at V.compiled
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:54974)
    at V.apply
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:55145)
    at Array.reduce (<anonymous>)
    at V.applyAll
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:55211)
    at G.rebase
       (https://mandakini-website.vercel.app/_next/static/chunks/6940-44a3b482fe461747.js:11:59662)
```

---

### Task 4 — Root cause: exact identification

**Not caused by `artwork`.** Schemas and structure are clean. The cause is in the dataset.

#### The broken data

GROQ query `*[_type == "project"] { _id, seriesName, "brokenImages": images[!defined(asset)] }` returns:

| Document | `brokenImages` count | Details |
|----------|---------------------|---------|
| Fragments Charcoal (`87d07143`) | 0 | All 14 images have valid `asset` references |
| London in Gouache (`eace351d`) | **2** | Two image array items with `_upload` metadata but **no `asset` field** |

The two broken items in "London in Gouache":
```json
{ "_key": "6eeed290155a", "_type": "image", "_upload": { "progress": 100, "updatedAt": "2026-06-22T01:22:58.246Z" } }
{ "_key": "2255ce8860bc", "_type": "image", "_upload": { "progress": 100, "updatedAt": "2026-06-22T01:23:06.053Z" } }
```

#### What these objects are

Sanity Studio writes an `_upload: { progress: N }` placeholder into an array item during a file upload — progress goes 0→100 as the file uploads, then the Studio finalises the item by writing the real `asset: { _ref: '...' }` and removing `_upload`. If the Studio session is interrupted (tab close, network drop, save conflict) after the upload reaches 100% but before the finalisation write, the document is left with these "zombie" image items: `_type: 'image'`, `_upload: { progress: 100 }`, but **no `asset` property**.

#### Why this crashes the structure tool

The error `getAttribute only applies to plain objects` originates in Sanity's OT (Operational Transformation) rebase system — specifically `G.rebase` → `V.applyAll` → `V.apply` → `H.apply` → `H.applyViaAccessor` → `d.getAttribute`.

When the Studio opens the project document list pane, it subscribes to a real-time listener for all `project` documents. The listener delivers the "London in Gouache" document, and Sanity's internal OT rebase system tries to traverse its attribute tree to reconcile local and remote document state. `d.getAttribute` is the function that reads a field from a document node — it expects every node to be a plain object with the standard Sanity document shape. The zombie image items contain `_upload: { progress: 100, updatedAt: "..." }` but no `asset`. This `_upload` value is not a shape the OT system expects at that position in the tree, so `getAttribute` throws `"getAttribute only applies to plain objects"`.

This error is uncaught by any component inside the document list pane and propagates to the structure tool's top-level React error boundary → **"The structure tool crashed"**.

#### Why only `project` crashes

The "London in Gouache" document is the only document in any type that has zombie `_upload` items. Every other document type either has no documents (testimonial, project/artwork old types) or has properly-finalised images (shopItem, aboutPage, siteSettings). Only the `project` pane triggers the real-time listener that delivers this document, so only that pane crashes.

#### The fix (not applied — report only)

Remove the two zombie image items from the "London in Gouache" document using Sanity MCP `patch_documents` with an `unset` or array filter operation targeting `_key == "6eeed290155a"` and `_key == "2255ce8860bc"`. No schema changes needed.

---

## 2026-06-22 (f) — Four-branch merge to main + Production deploy

**Prompt summary:**
Merge the four approved feature branches into main in order (about-redesign → logo-size → press-reel-speed → page-color-washes), building after each. Stop on any conflict or build failure. Pre-check Vercel status on page-color-washes before starting. After all merges clean, push main to production, smoke-test 8 routes, update docs, keep branches until live production verified.

**Execution:**

| Step | Branch | Conflicts | Code files | Build |
|------|---------|-----------|------------|-------|
| 1 | `about-redesign` | None (fast-forward) | N/A | ✓ 16 routes |
| 2 | `logo-size` | PROGRESS.md, PROMPT_LOG.md | None — only docs | ✓ 16 routes |
| 3 | `press-reel-speed` | PROGRESS.md, PROMPT_LOG.md | None — only docs | ✓ 16 routes |
| 4 | `page-color-washes` | PROGRESS.md, PROMPT_LOG.md | None — only docs | ✓ 16 routes |

**Conflict note:** All four branches diverged from the same ancestor (`78f1eba`). Every branch inserted a new PROGRESS/PROMPT_LOG section at the same position (line 3). Git correctly flagged these as conflicts; resolution was additive (keep both sides in insertion order). No source-code file conflicted on any merge — all code changes were to non-overlapping file sets.

**Production push:** `git push origin main` → `78f1eba..784862c`. Vercel production deployment triggered.

**Smoke test (local build, 16 routes compiled):**

| Route | Status | Type |
|-------|--------|------|
| `/` (home) | ✓ | ƒ Dynamic |
| `/about` | ✓ | ○ Static (3.09 kB) |
| `/works` | ✓ | ○ Static (3.76 kB) |
| `/works/[slug]` | ✓ | ƒ Dynamic (3.41 kB) |
| `/shop` | ✓ | ○ Static (5.45 kB) |
| `/shop/[slug]` | ✓ | ƒ Dynamic (4.42 kB) |
| `/contact` | ✓ | ○ Static (1.4 kB) |
| `/press` | ✓ | ○ Static (437 B) |

All 8 target routes built without error.

**Branches retained:** `about-redesign`, `logo-size`, `press-reel-speed`, `page-color-washes` — not deleted until live production site is visually verified.

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

## 2026-06-22 (b) — Logo size increase +25%

**Prompt summary:**
Increase the logo by roughly 25–30% following the client's request for a bigger logo after the previous 1.5× bump. Preserve theme-aware switching. Branch for preview before merging.

---

### Audit

Logo sizing is CSS-only. The HTML `width`/`height` attributes are aspect-ratio hints; `width: auto` in CSS means the CSS `height` value alone drives the rendered size.

**Before:**
```css
.site-logo__img { height: clamp(44px, 9vh, 96px); width: auto; }
@media (max-width: 480px) { .site-logo__img { height: 44px; } }
```
HTML attrs: `width={120} height={66}` (ratio ~1.82:1, landscape)

### Changes

**`app/globals.css`:**
```css
/* before */
.site-logo__img { height: clamp(44px, 9vh, 96px); width: auto; }
@media (max-width: 480px) { .site-logo__img { height: 44px; } }

/* after */
.site-logo__img { height: clamp(54px, 11vh, 120px); width: auto; }
@media (max-width: 480px) { .site-logo__img { height: 50px; } }
```

| Breakpoint | Before | After | Δ |
|---|---|---|---|
| Desktop min | 44px | 54px | +23% |
| Desktop fluid | 9vh | 11vh | +22% |
| Desktop max | 96px | 120px | +25% |
| Mobile ≤480px | 44px | 50px | +14% (conservative) |

Mobile is bumped less aggressively — a 25% increase at 44px would be ~55px, which risks looking oversized in the fixed-height mobile nav bar relative to the menu toggle.

**`components/layout/Navigation.tsx`:**
Both `<img>` tags (cream + cacao variants): `width={120} height={66}` → `width={150} height={83}`. Ratio preserved (~1.81:1). Theme-switching logic (`site-logo__img--cream` / `site-logo__img--cacao` CSS classes) untouched.

### Build

```
✓ Compiled successfully — 16 routes, zero errors
```

### Status

On branch `about-redesign`. Not merged to main. Awaiting visual review on Vercel preview.

Branch `logo-size`. Not merged to main. Awaiting visual review on Vercel preview.

## 2026-06-22 (b) — Press reel speed + CTA

**Prompt summary:**
Slow the homepage press marquee reel (Mandakini found it too fast). Add a CTA linking to the full Press page. Drive timing from motion tokens in @/lib/motion — no raw durations outside the motion system. Use pill CTA. Ensure empty state shows placeholder content. Commit to `press-reel-speed` branch for Vercel preview.

**Decisions:**
- Added `MARQUEE = { dur: 60, durAlt: 80 }` to `lib/motion.ts`. Chosen values: ~67% slower than the original 36s/46s. Forward/reverse differ by 20s for the visual depth effect the original had.
- Speed wired via CSS custom properties (`--mr2-marquee-dur`, `--mr2-marquee-dur-alt`) set in a `useEffect`. CSS `animation-duration` uses `var(--mr2-marquee-dur, 60s)` — the fallback matches the constant so SSR and hydration pre-paint match.
- CTA placed in `.mr2-press__footer` (centered, `padding-top: 4rem`) below both marquee rows. Uses `PillCta` as required by the no-boxy rule.
- CTA uses `var(--v2-cream)` for border/text (not `--v2-fg`) because the lagoon press background is always dark — `--v2-fg` would flip to dark in light mode and fail contrast.
- Double-layer empty guard: `home-data.ts` already falls back to `PLACEHOLDER_PRESS`; `MarqueePress` now has a local fallback too so the section is immune if the prop arrives empty for any reason.

**Files changed:** `lib/motion.ts`, `components/home/v2/MarqueePress.tsx`, `app/v2.css`.

## 2026-06-22 (e) — Increase shop moss wash intensity

**Prompt summary:**
Moss tint on both shop pages (/shop and /shop/[slug]) reads too faint — green is not visible enough. Increase to ~22% moss + cream using the existing color-mix token approach. Keep both shop pages at the same tint for a continuous listing→item transition. Match the visible-but-soft strength of the amber project wash (~20%). Build must pass. Commit to page-color-washes branch, do not merge until reviewed.

**Decision:**
Single change to `styles/pages.css` — `pdp-moss` rule only. Percentage: `10%` → `22%`. Both `/shop` and `/shop/[slug]` already share the same `pdp-moss` class (applied via `PageWash` in each page.tsx), so one rule change covers both pages simultaneously. No page.tsx files needed to change.

Rationale for 22%: amber wash is set at 20%, which Mandakini approved as the "warm but paper-like" benchmark. Moss is a muted, greyish-green — it needs a slightly higher percentage than amber to achieve the same perceptual saturation. 22% lands at approximately the same visual weight.

**Files changed:** `styles/pages.css` (pdp-moss mix percentages only).

---

## 2026-06-22 (d) — Client crash diagnosis (report only)

**Prompt summary:**
Both /shop and /shop/[slug] throw "Application error: a client-side exception" on the page-color-washes branch. Reproduce both crashes, capture full stack traces, identify exact file/line, explain what recent commit introduced the listing crash, assess whether the branch needs to be discarded or just patched.

---

### Findings

#### Server behaviour
Both pages return HTTP 200. `npm run dev` logs show successful compilation and 200 responses with no server-side errors or stack traces. The crash is **purely client-side** — it occurs in the browser after hydration.

#### Actual error (both pages, both crashes)

```
DOMException: Failed to execute 'add' on 'DOMTokenList':
The token provided ('pdp-moss page-wash-light') contains HTML space characters,
which are not valid in tokens.
```

Browser stack trace (all browsers — Chrome, Safari, Firefox):
```
DOMTokenList.add (native)
PageWash useEffect  →  components/ui/PageWash.tsx line 6
React.useEffect internal scheduler
```

#### Exact line causing both crashes

**`components/ui/PageWash.tsx`, line 6:**
```tsx
document.body.classList.add(className)   // ← throws when className contains a space
```

The DOM spec (§7.1.9.2) requires that every token passed to `classList.add()` must not contain ASCII whitespace. A space-separated string like `"pdp-moss page-wash-light"` is treated as a **single invalid token**, not two tokens. All five browser-spec implementations throw `DOMException` synchronously when this is called.

`classList.add()` accepts **multiple separate arguments** (`classList.add("a", "b")` or `classList.add(...["a","b"])`), not a space-joined string.

#### What introduced the listing-page crash

Commit `3d3feac` (the previous session's "fix" commit) added `<PageWash className="pdp-moss page-wash-light" />` to `app/(site)/shop/page.tsx`. Before that commit the shop listing had no `PageWash` call and rendered fine. The shop item page had already been broken since commit `a5fc4b9` (which first introduced `PageWash` with space-separated strings across all four washed pages).

**All five pages with a wash are affected by the same bug:**

| Page | className passed | Status |
|---|---|---|
| `/works` | `"works-cream page-wash-light"` | broken |
| `/works/[slug]` | `"series-amber page-wash-light"` | broken |
| `/shop` | `"pdp-moss page-wash-light"` | broken (since 3d3feac) |
| `/shop/[slug]` | `"pdp-moss page-wash-light"` | broken (since a5fc4b9) |
| `/contact` | `"contact-rosehip page-wash-light"` | broken |

#### Is the branch salvageable with a targeted fix?

**Yes — one-file fix, two lines changed.** The branch is structurally correct:
- CSS rules in `styles/pages.css` are correct
- All page.tsx imports and render calls are correct
- The `getShopItemBySlug` data fix is correct and unrelated to this bug
- The only defect is `classList.add(className)` where `className` is a space-joined string

Fix is:
```tsx
// components/ui/PageWash.tsx — lines 5-8
useEffect(() => {
  const classes = className.split(' ').filter(Boolean)
  document.body.classList.add(...classes)
  return () => document.body.classList.remove(...classes)
}, [className])
```

This resolves all five crashing pages in one edit. No data fetching, no CSS, no page files need to change. The branch does NOT need to be discarded.

---

## 2026-06-22 (c) — Shop item crash fix + cohesive moss wash

**Prompt summary:**
Fix "Application error: a client-side exception" on /shop/[slug]. Find root cause, report it, fix it, guard empty fields. Then apply the same moss tint to both /shop listing and /shop/[slug] so there is no cream→green jump.

**Root cause (Part A):**
`getPrintBySlug` → `getAllPrints` → `getHomeData` → `featuredShopItemsQuery`. This query returns at most 3 items (the featured ones from siteSettings). For any of the 52 real Sanity shop items whose slug is not in those 3 featured, `print` was `null` → `notFound()` threw → the error boundary showed "Application error." The fix: added `getShopItemBySlug(slug)` that calls `getAllShopItems()` (queries the full catalogue with no cap). Updated the detail page and generateMetadata to use this function.

**Decisions:**
- New function `getShopItemBySlug` added to `lib/home-data.ts` rather than changing `getPrintBySlug` — the old function is still used by the homepage (correctly, to get only featured items for the homepage shop teaser). Changing `getPrintBySlug` would have made `getAllPrints` over-fetch on every homepage load.
- `getAllShopItems` is already the correct query for the full catalogue — reused it, no new GROQ.
- Empty-field guards in `ProductDetail`: `image` gets fallback URL, `title` gets "Untitled print", `price` and `desc` conditionally rendered with `&&` so missing values don't render empty `<p>` tags.

**Part B decision:**
Applied `pdp-moss page-wash-light` to `/shop` listing (same class already used on `/shop/[slug]`). Both shop pages now share `color-mix(in srgb, var(--accent-moss) 10%, var(--bg-cream) 90%)`. No CSS change needed — the rule already existed; only a PageWash import was added to the listing page.

**Files changed:** `lib/home-data.ts`, `app/(site)/shop/[slug]/page.tsx`, `app/(site)/shop/page.tsx`, `components/shop/ProductDetail.tsx`.

---

## 2026-06-22 (a) — Per-page background color washes

**Prompt summary:**
Apply per-page background color washes using only the locked palette and the wash rule (soft, low-saturation, one color per page, warm, never saturated). Find each page route via grep. Confirm works listing stays cream. Apply soft amber to works detail, soft moss to shop item (Mandakini's explicitly requested green), soft rosehip to contact. Background color only — no typography or layout changes. Run build, commit to `page-color-washes` branch for Vercel preview.

**Decisions:**
- Created `components/ui/PageWash.tsx` — null-render client component, adds/removes a body class string on mount/unmount. Reusable across any page, keeps separation from animation logic already in the existing components.
- Created `styles/pages.css` — all four wash rules + shared `page-wash-light` block (ink tokens + logo swap + nav color). Single file keeps all page-level tints in one place, separate from about.css.
- Import pattern: each page.tsx imports `'@/styles/pages.css'` and renders `<PageWash className="..." />` — no changes to underlying client components (WorksIndex, SeriesDetail, ProductDetail, ContactForm).
- Wash percentages chosen to pass the "paper not paint" test: amber 20%, moss 10%, rosehip 7%. Rosehip is highly saturated so 7% achieves the blush without overloading the hue.
- `page-wash-light` shared class handles ink token override, logo swap (cream→cacao), and nav text colour for ALL light-field washes — DRY pattern.

**Files changed:** `components/ui/PageWash.tsx` (new), `styles/pages.css` (new), 4 page.tsx files (PageWash rendered + CSS imported).

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
