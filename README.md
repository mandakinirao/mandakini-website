# Mandakini Rao — artist website

The website of **Mandakini Rao**, a painter, educator and visual artist based in Hyderabad. It shows her work (projects, journal, press), sells signed limited-edition prints, and gives her a simple back office at **`/admin`** to run everything herself.

Live: **https://www.mandakinirao.com**

---

## At a glance

| Area | What it does | Where it lives |
|---|---|---|
| **Public site** | Homepage, Projects (`/works`), Shop, Journal, Press, About, Contact | `app/(site)/`, `components/` |
| **Shop & payments** | Cart / Buy now → address form → **Razorpay** checkout (INR) → order saved, emails sent | `app/api/checkout`, `app/api/razorpay/webhook`, `lib/razorpay*.ts` |
| **`/admin`** | Mandakini's back office: orders, prints, projects, press, journal, messages, homepage, About, site wording | `app/admin/`, `components/admin/`, `lib/admin/` |
| **Content storage** | All content, images and orders are stored in **Sanity** | `sanity/` |
| **Emails** | Order confirmation, new-order alert, shipping, cancellation, enquiries — via **Resend** | `lib/emails.ts`, `emails/` |
| **Hosting** | **Vercel** — every push to `main` deploys to production | `vercel.json` |

**Stack:** Next.js 14 (App Router) · TypeScript · Sanity v3 · Razorpay · Resend · Tailwind + hand-written CSS · GSAP / Lenis / Lottie for motion · Vitest for tests.

---

## How it fits together

```
                 ┌──────────────────────── Vercel (Next.js) ─────────────────────────┐
 Visitors ──────▶│  Public site  app/(site)/*        reads content ──────┐           │
                 │                                                      ▼           │
 Mandakini ─────▶│  /admin       app/admin/*   reads + writes ──▶  Sanity (content,  │
                 │  (password login)                               images, orders)   │
 Developer ─────▶│  /studio      Sanity Studio (raw editor, fallback)      ▲          │
                 │                                                          │          │
                 │  /api/checkout ──▶ Razorpay order                        │          │
 Razorpay ──────▶│  /api/razorpay/webhook  (payment.captured) ── saves order┘          │
                 │        └──▶ Resend: email to buyer + to Mandakini                   │
 Sanity ────────▶│  /api/revalidate, /api/ship-notify  (Sanity webhooks)               │
                 └─────────────────────────────────────────────────────────────────────┘
```

- **Sanity is the database.** Nothing is stored in the Next.js app itself.
- **`/admin` is a friendly layer on top of Sanity.** It reads and writes the same Sanity documents the public site reads, then refreshes the site (`revalidatePath`) so changes are live within seconds. Mandakini never needs Sanity Studio.
- **Sanity Studio** is still available at `/studio` for developers (raw editing, history, anything `/admin` doesn't cover).

---

## Running it locally

Requirements: **Node.js 20+** (developed on 24) and npm.

```bash
git clone https://github.com/mandakinirao/mandakini-website.git
cd mandakini-website
npm install
cp .env.local.example .env.local   # then fill in values (see below)
npm run dev                         # http://localhost:3000
```

Useful scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build && npm start` | Production build — **always check changes this way before shipping**; animations and caching behave differently in dev |
| `npm test` | Unit tests (Vitest) for `/admin` logic: login, orders/refunds, prints, uploads, journal text, homepage rules |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

The public site works with only the three `NEXT_PUBLIC_SANITY_*` values (it falls back to built-in placeholder content where Sanity is empty). `/admin`, the shop and emails need the rest.

---

## Environment variables

Set these in `.env.local` for local work and in **Vercel → Project → Settings → Environment Variables** for production. Never commit real values.

| Variable | Needed for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | everything | `i4t9kzxg` (public) |
| `NEXT_PUBLIC_SANITY_DATASET` | everything | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | everything | `2024-01-01` |
| `SANITY_API_WRITE_TOKEN` | `/admin`, order saving | Sanity token with **Editor** rights. Server-only. |
| `SANITY_REVALIDATE_SECRET` | `/api/revalidate` | Shared secret for the Sanity publish webhook |
| `SANITY_WEBHOOK_SECRET` | `/api/ship-notify` | Shared secret for the Sanity order webhook |
| `NEXT_PUBLIC_COMMERCE_ENABLED` | shop | `true` to take orders |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | checkout, refunds | `rzp_test_…` locally, `rzp_live_…` in production |
| `RAZORPAY_WEBHOOK_SECRET` | `/api/razorpay/webhook` | Must match the secret set on the Razorpay dashboard webhook |
| `RESEND_API_KEY` | all emails | |
| `EMAIL_FROM` | all emails | Must be on a **domain verified in Resend**, e.g. `Mandakini Rao <orders@mandakinirao.com>`. The Resend test sender (`onboarding@resend.dev`) can only email the Resend account owner. |
| `MANDAKINI_ORDER_EMAIL` | new-order + enquiry alerts | Where Mandakini receives notifications |
| `NEXT_PUBLIC_SITE_URL` | links in emails, CSRF check | Comma-separated allowed origins, first one is canonical |
| `ADMIN_PASSWORD` | `/admin` login | The password Mandakini types |
| `ADMIN_SESSION_SECRET` | `/admin` login | 32+ random characters (`openssl rand -hex 32`). Changing it signs everyone out. |

Legacy, unused: `STRIPE_*`, `ADMIN_EMAIL`, `ENQUIRY_*` (left from an earlier Stripe version; see *Known issues*).

---

## `/admin` — the back office

Password login at `/admin/login` (signed 30-day cookie, 5 attempts per 15 minutes). Laptop-only by design. Every save goes live immediately.

| Section | What Mandakini can do |
|---|---|
| **Home** | Summary: orders to ship, new messages, prints in the shop |
| **Orders** | Tabs *To ship / Shipped / Completed / Cancelled*. Open an order → copy address → **Mark as shipped** (enter courier + tracking; buyer is emailed) → **Mark as delivered**. **Cancel order** = full Razorpay refund + stock restored + buyer emailed. |
| **Shop** | Prints as photo cards, drag to reorder. Add/edit: drag in many photos (auto-compressed in the browser), title, price, edition size, how many left, description, *Buy online* or *Enquiry only*, *Show in shop*, *Show on homepage*. |
| **Projects** | Series of work with galleries, drag to reorder, *Show on homepage*. |
| **Press** | Articles / videos / podcasts / scanned clippings. *Look it up* pre-fills headline and publication from the link. |
| **Journal** | Write posts: cover, title, summary, date, then paragraphs with **B / I / Link**, photos (left / right / above / below, together or one at a time), or a big pull quote. |
| **Messages** | Contact-form and private-collection enquiries: *New / Replied / Archived*, *Reply by email*. |
| **Website** | Homepage opening pictures and homepage order; About (portrait, About text, homepage intro); Testimonials; *Website words* (13 site texts, blank = built-in wording). |

Code map:

- `middleware.ts` — guards `/admin/**` and `/api/admin/**`.
- `lib/admin/` — pure, unit-tested logic (session, orders, refunds, prints, projects, press, journal, rich text, singletons). Server actions call these.
- `app/admin/(auth)/login` — login page. `app/admin/(panel)/…` — every screen; each `actions.ts` calls `requireAdmin()` first.
- `app/api/admin/upload` — authenticated image upload to Sanity (max 4 MB after browser compression).
- Design and plans: `docs/superpowers/specs/2026-10-29-admin-cms-design.md`, `docs/superpowers/plans/2026-10-29-admin-cms-phase{1,2,3}.md`.

---

## Shop & order flow

1. Buyer clicks **Buy now** or checks out the cart → `CheckoutAddressModal` collects name, email, phone, address.
2. `POST /api/checkout` re-reads prices and stock from Sanity (the browser only sends which items and how many), creates a **Razorpay order** with the buyer details in its notes, returns it.
3. Razorpay's checkout opens; on success the buyer lands on `/thank-you`.
4. Razorpay calls **`POST /api/razorpay/webhook`** with `payment.captured`. The route verifies the signature, fetches the order notes, creates the Sanity `order` (idempotent on the Razorpay order id, number `MR-YYYY-NNNN`), lowers stock, and emails the buyer and Mandakini (with an *Open this order* link to `/admin`).
5. Shipping, delivery, cancel/refund are done in `/admin → Orders`.

**Dashboard setup this depends on**
- **Razorpay** (in **Live mode** for real payments — Test and Live have separate webhook lists): webhook URL `https://www.mandakinirao.com/api/razorpay/webhook`, event `payment.captured`, secret = `RAZORPAY_WEBHOOK_SECRET`.
- **Resend:** verify the `mandakinirao.com` domain (DNS records are added at the domain's DNS host, currently Hostinger) and set `EMAIL_FROM` to an address on it.
- **Sanity webhooks (optional):** `POST /api/revalidate` with header `x-revalidate-secret` (refresh site after Studio edits); `POST /api/ship-notify` with header `x-webhook-secret` (legacy shipping email from Studio edits — `/admin` sends it directly now).

---

## Project structure

```
app/
  (site)/            public pages: home, works, shop, journal, press, about, contact, thank-you
  admin/             /admin back office (see above)
  api/               checkout, razorpay webhook, enquiry, revalidate, ship-notify, admin upload
  studio/            Sanity Studio at /studio
components/          UI by area: home/v2, shop, journal, press, about, admin, ui
lib/                 data loading (home-data, journal, press, site-settings), motion, emails, razorpay, admin/*
sanity/
  schemas/           content types (shopItem, project, journalPost, order, enquiry, …)
  lib/queries.ts     all GROQ queries used by the public site
styles/, app/*.css   global and page styles (homepage v2 styles in app/v2.css)
tests/               Vitest unit tests
docs/                design system, sitemap/IA, plans and specs
PROGRESS.md          dated log of every change and why
```

Content types worth knowing: `shopItem` (prints), `project` (series), `journalPost` (+ `journalSection` paragraphs), `pressItem`, `testimonial`, `enquiry` (messages), `order`, and singletons `homepage`, `aboutPage` (what `/about` reads), `siteSettings` (site wording). Homepage featuring uses each item's `featuredOnHomepage` + `homepageOrder` (caps: 3 prints, 4 projects, 8 press; falls back to the first few).

---

## Deploying

- **Push to `main` → Vercel deploys production automatically.** Work on a branch, check with `npm run build && npm start`, then merge.
- Environment variable changes need a **redeploy** to take effect.
- Security headers / CSP live in `next.config.js` (Razorpay, Google Fonts and Sanity are allow-listed there).

---

## Known issues / to do

- **Order emails not arriving (as of Oct 2026):** `EMAIL_FROM` is still Resend's test sender, so buyers are never emailed; and the Razorpay **Live** webhook needs confirming (no real order has reached Sanity since July). See *Shop & order flow → Dashboard setup*.
- `lib/stripe.ts`, `app/api/stripe/webhook`, `emails/orderEmails.ts` and the `stripe` package are leftovers from an earlier Stripe version and can be removed.
- `Konya.otf` (script font) fails Chrome's font validator; a clean copy from the font vendor is needed.
- The Sanity Studio "About" type (`about`) is unused — the site reads `aboutPage` (edit it in `/admin → Website → About`).
- Images re-saved from `/admin` don't keep Studio crop/hotspot settings (none are used today).

For the full history of decisions and fixes, read **`PROGRESS.md`**.
