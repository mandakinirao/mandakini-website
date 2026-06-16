# Prompt Log

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
