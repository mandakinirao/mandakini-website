# /admin CMS — Phase 3 (Journal) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mandakini writes, edits and deletes journal posts in `/admin` on one page that feels like writing a document: paragraphs with photos placed beside, above or below them.

**Architecture:** Same pattern as Phases 1–2. A post page holds post details plus an ordered list of **paragraph blocks** (the existing `journalSection` shape). Each block's text is edited in a tiny rich-text box (contentEditable, Bold / Italic / Link only) whose DOM is converted to Portable Text by a tested pure converter; server-side validation re-sanitises everything before saving.

**Tech Stack:** As before, plus dev-only `happy-dom` for DOM-converter tests.

**Spec:** `docs/superpowers/specs/2026-10-29-admin-cms-design.md` §6.4.

## Global Constraints

- Phase 1 and 2 Global Constraints apply.
- Stored shape must match what `/journal/[slug]` renders (`journalPostBySlugQuery`): post `title`, `slug`, `kicker`, `excerpt`, `coverImage{asset,alt}`, `publishedAt`, `featured`, `body[]` of `{_type:'journalSection', _key, text[], images[]{asset,alt,caption}, displayMode, position, pullQuote}`.
- Text blocks: style `normal` only; marks `strong`, `em`, and `link` annotations whose `href` starts with `http://`, `https://` or `mailto:`. Anything else is dropped on save.
- `position`: `left` | `right` | `top` | `bottom` (default `right`), only stored when the paragraph has photos. `displayMode`: `collage` | `carousel` (default `collage`), only stored with 2+ photos. `pullQuote` only allowed on a paragraph with no photos.
- Words she sees: "Paragraph", "Photos beside this paragraph", "Left / Right / Above / Below", "Show together / One at a time", "Make this a big quote", "Featured on the Journal page". Never "section", "block", "Portable Text".
- Post web address made once from the title (reserved slugs as before); editing the title doesn't change it.

## Review Focus

1. **Pasted text from Word or a web page** carries styles, fonts, headings, images. Expect plain paragraphs keeping only bold, italic and links. (Task 1 test.)
2. **A javascript: link** typed or pasted. Expect the link dropped, text kept. (Task 1 + Task 2 tests.)
3. **An empty paragraph** (no text, no photos) left in the post. Expect it silently removed on save, not an error. (Task 2 test.)
4. **A post with no paragraphs**. Expect "Write at least one paragraph". (Task 2 test.)
5. **Existing post round-trip**: opening and saving the existing "100 Days Project" unchanged must not alter its text, marks or images. (Task 2 round-trip test using its real shape.)

---

### Task 1: Rich-text converter (DOM ⇄ Portable Text)

**Files:** Create `lib/admin/richtext.ts`, `tests/admin/richtext.test.ts`. `npm i -D happy-dom@^15`; the test file starts with `// @vitest-environment happy-dom`.

**Interfaces — Produces:**
- `type PTBlock = { _type: 'block'; _key: string; style: 'normal'; markDefs: { _key: string; _type: 'link'; href: string }[]; children: { _type: 'span'; _key: string; text: string; marks: string[] }[] }`
- `blocksToHtml(blocks: PTBlock[]): string` — `<p>` per block, `<strong>`, `<em>`, `<a href>`; text HTML-escaped.
- `htmlToBlocks(root: HTMLElement): PTBlock[]` — walks `p`/`div`/`br`/text nodes; `b`/`strong` → `strong`, `i`/`em` → `em`, `a[href]` with allowed scheme → link markDef; headings, lists and other elements flatten to paragraphs/text; images and scripts ignored; empty paragraphs dropped; adjacent spans with identical marks merged.
- `safeHref(href: string): string | null`

- [ ] Tests: round-trip `blocksToHtml` → parse → `htmlToBlocks` equals the input text/marks for a block with plain, bold, italic and a link; pasted `<h2 style="font-family:x">Hi</h2><p><span style="color:red">a <b>b</b></span></p><img src=x>` → two paragraphs `Hi` and `a b` (with `b` strong), no image; `<a href="javascript:alert(1)">x</a>` → text `x` without link; `<p></p><p> </p>` → `[]`; `<script>` content dropped; `blocksToHtml` escapes `<` in text.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] Commit `feat(admin): journal rich-text converter`.

### Task 2: Journal post validation and mapping

**Files:** Create `lib/admin/journal.ts`, `tests/admin/journal.test.ts`.

**Interfaces — Produces:**
- `interface ParagraphInput { key: string; text: PTBlock[]; photos: (PrintImage & { caption?: string })[]; position: 'left'|'right'|'top'|'bottom'; displayMode: 'collage'|'carousel'; pullQuote: boolean }`
- `interface PostInput { title; kicker; excerpt; cover: PrintImage | null; publishedAt: string /* ISO */; featured: boolean; paragraphs: ParagraphInput[] }`
- `validatePost(raw): { ok: true; value: PostInput } | { ok: false; errors: Record<string,string> }` — title required ("Add a title"); cover required ("Add a cover photo"); empty paragraphs removed; none left → "Write at least one paragraph"; every block re-sanitised (style normal, allowed marks, `safeHref`); `pullQuote` forced false when photos exist; publishedAt invalid/blank → now.
- `toPostFields(v)` → stored fields per Global Constraints (cover alt defaults to title; photo alt defaults to title; `position` only with photos; `displayMode` only with 2+).

- [ ] Tests: the Review Focus cases 2–5 (round-trip uses the real "100 Days Project" first paragraph shape: three normal blocks, one collage photo at `right`); `pullQuote` with photos → false; cover missing error; photo caption kept.
- [ ] Run → FAIL. Implement. Run → PASS.
- [ ] Commit `feat(admin): journal post validation`.

### Task 3: Journal screens

**Files:** Create `app/admin/(panel)/journal/{page.tsx,actions.ts,new/page.tsx,[id]/page.tsx}`, `components/admin/journal/{PostEditor.tsx,ParagraphCard.tsx,RichText.tsx}`. Modify `components/admin/Sidebar.tsx` (add **Journal** after Press).

**Interfaces — Consumes:** Task 1–2, `PhotoDropzone`, `SinglePhoto`, `ConfirmButton`, `toPhoto`/`toPrintImage`. **Produces** actions `savePost(id|null, raw) → {ok,id,slug}|{ok:false,errors,message?}`, `deletePost(id)` (type-guarded).

- [ ] List page: newest first; cards with cover, title, date ("17 Jul 2026"), "Featured" badge; **+ Write a post**.
- [ ] Editor, top: Cover photo (`SinglePhoto`), Title, "Small line above the title" (kicker), "Short summary for the Journal page" (excerpt), Date (date input, default today), **Featured on the Journal page** switch.
- [ ] Editor, body: paragraphs in order. Each `ParagraphCard`: `RichText` box (toolbar **B**, *I*, Link — Link prompts inline for a web address, no `window.prompt`), "Photos beside this paragraph" (`PhotoDropzone` with a caption box per photo), and when photos exist: "Where do the photos go?" Left / Right / Above / Below; with 2+: "Show together" / "One at a time"; with no photos: **Make this a big quote** switch. Card actions: Move up, Move down, Remove paragraph (inline confirm). Between cards and at the end: **+ Add a paragraph**.
- [ ] Footer: **Publish** (new) / **Save changes** (edit); success "“100 Days Project” is live. View it on the site →" linking `/journal/<slug>`; delete post via `ConfirmButton`. Unsaved-changes warning.
- [ ] `RichText` uses `blocksToHtml` for initial content and `htmlToBlocks` on input; paste is intercepted and inserted as plain text with line breaks → paragraphs (formatting from the clipboard is not kept).
- [ ] Commit `feat(admin): journal list and editor`.

### Task 4: Walk-through and handover

- [ ] `npm test`, tsc, lint, build clean.
- [ ] Production build, read-only: list shows the existing post; editor loads it with all paragraphs, photos, positions; in the browser, run `htmlToBlocks` on each loaded RichText and confirm it equals the stored blocks (round-trip, no save). Write a new post only on the user's go-ahead.
- [ ] PROGRESS.md, ledger, commit.
