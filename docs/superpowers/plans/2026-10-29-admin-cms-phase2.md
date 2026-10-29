# /admin CMS — Phase 2 (Website, Projects, Press, Messages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Mandakini manage the rest of the site from `/admin`: homepage photos and order, About, Website words, Testimonials, Projects, Press and Messages.

**Architecture:** Same pattern as Phase 1 (`docs/superpowers/plans/2026-10-29-admin-cms-phase1.md`): server components read with `getAdminClient()`, server actions call `requireAdmin()` then pure, tested functions in `lib/admin/*`, then `revalidateSite()`. Reuses `PhotoDropzone`, `SortableGrid`, `ConfirmButton`, `uniqueSlug`, `splitNulls`.

**Tech Stack:** As Phase 1. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-10-29-admin-cms-design.md` §6.3, §6.5, §6.6, §6.7. Journal (§6.4) is Phase 3.

## Global Constraints

All Phase 1 Global Constraints apply. Additionally:
- Edit only the fields the public site actually reads (verified 2026-10-29):
  - About (`aboutPage` document, the one the site reads; the Studio "About" type is unused): `aboutBlockPortrait`, `aboutBlockBio`, `homeSnippet`, `aboutTeaserLine`.
  - Homepage (`homepage`, id `homepage`): `heroRevealTop`, `heroRevealBottom` (images with `alt`).
  - Website words (`siteSettings`, id `siteSettings`; doesn't exist yet): the 13 fields of `siteSettingsShopQuery`. Blank = use the built-in default from `lib/site-settings.ts` (field unset).
- Project reserved slugs: same list as prints. Project description: warn past **220** characters (live counter), don't block.
- Press `type`: `article` | `video` | `podcast`.
- Enquiry `status`: `new` | `responded` | `closed`, shown as **New** / **Replied** / **Archived**.
- Sidebar order: Home, Orders, Shop, Projects, Press, Messages, Website. Messages shows a count of New.

## Review Focus

1. **Website words left blank** must fall back to the built-in text on the site, not show an empty headline. (Task 3 test: blank → unset.)
2. **First save of a singleton that doesn't exist** (`siteSettings`, `homepage`) must create it with the fixed id, not a random one the site can't find. (Task 2/3 tests: `createIfNotExists` with id.)
3. **About saved to the wrong record** — must patch the existing `aboutPage` document. (Task 3 test: patch target is the fetched `_id`.)
4. **Reordering** writes only the given ids, `displayOrder` for lists and `homepageOrder` for the homepage lists. (Task 1 test.)
5. **A press link that can't be looked up** (paywall, timeout) must still save with her typed headline. (Task 6 test: lookup failure → no error, empty suggestions.)

---

### Task 1: Shared pieces — reorder helper, single-photo field, sidebar

**Files:** Create `lib/admin/content.ts`, `tests/admin/content.test.ts`, `components/admin/SinglePhoto.tsx`. Modify `components/admin/Sidebar.tsx`, `app/admin/(panel)/layout.tsx`, `app/admin/(panel)/shop/actions.ts`, `components/admin/SortableGrid.tsx`.

**Interfaces — Produces:**
- `reorderDocs(client: Pick<SanityClient, 'transaction'>, ids: string[], field: 'displayOrder' | 'homepageOrder'): Promise<void>` — one transaction, `field = index + 1`.
- `imageField(img: { assetId: string; alt: string; key?: string } | null, fallbackAlt: string)` → Sanity image object or `null`.
- `SinglePhoto` client component: props `{ label: string; value: Photo | null; onChange(p: Photo | null): void; hint?: string }`, wraps `PhotoDropzone` logic for one photo (replace on drop).
- `SortableGrid` takes an optional `onReorder(ids: string[]): Promise<{ ok: boolean }>` prop (default: `reorderPrints`).
- Sidebar items: Home, Orders, Shop, Projects, Press, Messages (count), Website.

- [ ] Test: `reorderDocs(fake, ['a','b'], 'homepageOrder')` → one transaction `[{id:'a',set:{homepageOrder:1}},{id:'b',set:{homepageOrder:2}}]`; `imageField(null)` → `null`; `imageField({assetId:'image-x',alt:''}, 'Title')` → `{_type:'image', _key: <string>, asset:{_type:'reference',_ref:'image-x'}, alt:'Title'}`.
- [ ] Run → FAIL. Implement. Run → PASS. `reorderPrints` now calls `reorderDocs`.
- [ ] Layout fetches `newMessages` count alongside `toShip`.
- [ ] Commit `feat(admin): shared reorder + single photo, full sidebar`.

### Task 2: Website → Homepage

**Files:** Create `lib/admin/homepage.ts`, `tests/admin/homepage.test.ts`, `app/admin/(panel)/website/page.tsx` (hub with 4 cards), `app/admin/(panel)/website/homepage/page.tsx`, `.../homepage/HomepageForm.tsx`, `.../homepage/actions.ts`.

**Interfaces — Produces:** `saveHomepage(client, input: { top: PrintImage | null; bottom: PrintImage | null }): Promise<void>` — `createIfNotExists({_id:'homepage',_type:'homepage'})` then `patch('homepage')` set non-null / unset null images.

- [ ] Test: both photos → `createIfNotExists` with `_id: 'homepage'` then set both; `top: null` → `unset(['heroRevealTop'])`.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] Page: two `SinglePhoto` fields — "Opening picture (shown first)" and "Picture revealed underneath" with one-line hints; **Save and put live**. Below: three drag lists — "Prints on the homepage", "Projects on the homepage", "Press on the homepage" — each showing items with Show on homepage on, ordered by `homepageOrder`, saving via `reorderDocs(..., 'homepageOrder')`. Empty list text: "Nothing chosen. The first few are shown automatically. Turn on Show on homepage on any item."
- [ ] Verify on production build (local token): page renders with live data; no save against live data unless reverted.
- [ ] Commit `feat(admin): homepage photos and homepage order`.

### Task 3: Website → About, Website words

**Files:** Create `lib/admin/singletons.ts`, `tests/admin/singletons.test.ts`, `app/admin/(panel)/website/about/{page.tsx,AboutForm.tsx,actions.ts}`, `app/admin/(panel)/website/words/{page.tsx,WordsForm.tsx,actions.ts}`.

**Interfaces — Produces:**
- `WEBSITE_WORDS: { key: keyof SiteSettings; label: string; hint: string; long?: boolean }[]` — all 13 keys, grouped Shop / Works / Contact / After an order / Private collection, labels in her words (e.g. `thankYouMessage` → "Message after someone buys").
- `saveWebsiteWords(client, raw: Record<string, unknown>): Promise<void>` — trims; blank → unset; `createIfNotExists({_id:'siteSettings',_type:'siteSettings'})` first.
- `saveAbout(client, input: { portrait: PrintImage | null; bio: string; homeSnippet: string; teaserLine: string }): Promise<void>` — fetch `*[_type=="aboutPage"][0]._id`; if none, create `_id:'aboutPage'`; patch that id; blank text → unset.
- Export `DEFAULTS` from `lib/site-settings.ts` (rename export only) so the form shows defaults as placeholders.

- [ ] Tests: words `{ shopPageHeadline: '  New  ', contactEmail: '' }` → set `{shopPageHeadline:'New'}`, unset includes `contactEmail`, created with `_id: 'siteSettings'`; about patches the fetched id `'abc'` (not `'aboutPage'`), about with no existing doc creates `'aboutPage'`; `WEBSITE_WORDS` keys equal the 13 `SiteSettings` keys.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] About page: Portrait (`SinglePhoto`), "About text" (`aboutBlockBio`, textarea, hint "Shown on the About page."), "Short introduction on the homepage" (`homeSnippet`), "One-line teaser" (`aboutTeaserLine`). Words page: grouped fields, defaults as placeholders, hint "Leave blank to use the wording shown."
- [ ] Commit `feat(admin): about and website words`.

### Task 4: Website → Testimonials

**Files:** Create `lib/admin/testimonials.ts`, `tests/admin/testimonials.test.ts`, `app/admin/(panel)/website/testimonials/{page.tsx,actions.ts,TestimonialForm.tsx,new/page.tsx,[id]/page.tsx}`.

**Interfaces — Produces:** `validateTestimonial(raw) → {ok,value:{quote,personName,photo:PrintImage|null}} | {ok:false,errors}`; `toTestimonialFields(v)`.

- [ ] Tests: quote required ("Add the quote"), name required ("Add who said it"), photo optional; fields map `personImage` via `imageField` with alt = name.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] List (drag to reorder `displayOrder`, card shows quote start + name + photo), add/edit page (one page: photo left, quote + name right, **Save and put live**), delete with confirm.
- [ ] Commit `feat(admin): testimonials`.

### Task 5: Projects

**Files:** Create `lib/admin/projects.ts`, `tests/admin/projects.test.ts`, `app/admin/(panel)/projects/{page.tsx,actions.ts,new/page.tsx,[id]/page.tsx}`, `components/admin/ProjectForm.tsx`.

**Interfaces — Produces:** `validateProject(raw, mode) → {ok,value:{name,year,description,photos:PrintImage[],showOnHomepage}} | errors`; `toProjectFields(v)` → `seriesName, year, description, gallery[], featuredOnHomepage`. Actions `createProject` (slug via `uniqueSlug(slugify(name), projectSlugs)`, `displayOrder` = max+1), `updateProject` (slug unchanged), `deleteProject`, `reorderProjects`.

- [ ] Tests: name required ("Add a name"); description over 220 → still ok (warning is UI-only); at least one photo ("Add at least one photo"); photo alt defaults to name; `year` free text trimmed.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] Grid like Shop (cover, name, year, "On homepage" badge, drag to reorder). Form like PrintForm: photos left; Name, Year, Short description (live counter "142 / 220", turns amber past 220 with "Long descriptions get cut off on the Works page"), Show on homepage switch; **Save and put live**; success links `/works/<slug>`. Delete with confirm.
- [ ] Commit `feat(admin): projects`.

### Task 6: Press

**Files:** Create `lib/admin/press.ts`, `tests/admin/press.test.ts`, `app/admin/(panel)/press/{page.tsx,actions.ts,new/page.tsx,[id]/page.tsx}`, `components/admin/PressForm.tsx`.

**Interfaces — Produces:** `validatePress(raw) → {ok,value:{link:string|null,type,headline,source,thumbnail:PrintImage|null,logoCard,showOnHomepage}} | errors` — link optional but must be `http(s)` when given ("That link doesn't look right"); with no link, a thumbnail (the clipping) is required ("Add the link or a photo of the clipping"). `toPressFields(v)` → `link, type, headlineOverride, source, thumbnailOverride, logoCard, featuredOnHomepage` (blanks unset via `splitNulls`). `lookUpLink(url, enrich): Promise<{ headline?: string; source?: string; image?: string }>` — wraps `enrichPressItems` from `lib/press.ts`; any failure → `{}`.

- [ ] Tests: validation cases above; `lookUpLink` with an `enrich` that throws → `{}`; with one returning `{headline:'H',source:'S',thumbnail:'u'}` → `{headline:'H',source:'S',image:'u'}`.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] List (source, headline, type badge, On homepage badge, drag to reorder). Form: Link + **Look it up** button (fills empty Headline/Source as suggestions she can edit; shows "Couldn't read that page. Fill these in yourself." on `{}`), Type radio (Article / Video / Podcast), Headline, Source, Picture (`SinglePhoto`, hint "For a newspaper clipping, add a photo of it here."), switches **Show publication logo instead of a photo** (`logoCard`) and **Show on homepage**. Delete with confirm.
- [ ] Commit `feat(admin): press`.

### Task 7: Messages

**Files:** Create `lib/admin/messages.ts`, `tests/admin/messages.test.ts`, `app/admin/(panel)/messages/{page.tsx,actions.ts,MessageActions.tsx}`.

**Interfaces — Produces:** `MESSAGE_TABS` (New / Replied / Archived → `new`/`responded`/`closed`); `setMessageStatus(client, id, status: 'new'|'responded'|'closed')` — rejects other values.

- [ ] Tests: valid status patches `{status}`; `'deleted'` → throws/returns error, no patch.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] Page: tabs with counts; each message as a panel (name, email `mailto:` with subject "Re: your message to Mandakini Rao", phone, budget if any, date, full message), buttons **Reply by email**, **Mark as replied**, **Archive** / **Move back to New**. Home summary "new messages" becomes a link.
- [ ] Commit `feat(admin): messages`.

### Task 8: Walk-through and handover

- [ ] `npm test`, `npx tsc --noEmit`, `npm run build`, lint on admin dirs — clean.
- [ ] Production build with the local token: open every new page against live data; for writes, create clearly labelled TEST items (hidden / not on homepage), edit, delete; for singletons (Homepage, About, Words) save once with the current values unchanged and confirm the live data didn't change (diff before/after via GROQ).
- [ ] Update `PROGRESS.md`; ledger; commit.
