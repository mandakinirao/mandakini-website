# /admin CMS — Phase 1 (Login, Orders, Shop, Homepage featuring) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Mandakini a password-protected `/admin` where she can run orders end-to-end (ship, deliver, cancel + full refund) and add/edit prints, with every save live on the site — plus make the public homepage honour each item's "Show on homepage" switch.

**Architecture:** New `app/admin/**` routes inside the existing Next.js 14 app, outside the `(site)` group. Server components read Sanity with a server-only write token; server actions write to Sanity, then `revalidatePath('/', 'layout')`. Pure domain logic (session, order transitions, refund/restock, slugs, availability, validation) lives in `lib/admin/*` with dependency injection so it is unit-tested with Vitest; UI is verified on a production build in the browser.

**Tech Stack:** Next.js 14 App Router (server components + server actions), `next-sanity` client, `razorpay` SDK, Resend (`lib/emails.ts`), Web Crypto (HMAC session), Vitest (new, dev-only).

**Spec:** `docs/superpowers/specs/2026-10-29-admin-cms-design.md` (approved). This plan covers spec §8 steps 1–3 plus the homepage-featuring change from step 4. Website pages, Projects, Press, Messages and Journal get their own later plans.

## Global Constraints

- One user, **laptop only** — no mobile layouts.
- Never show database words in the UI: document, reference, slug, array, draft, publish, schema, ID, `_key`, `_id`.
- One page per task; one primary button per page; confirm only delete and cancel/refund.
- Save = live. After every successful write call `revalidatePath('/', 'layout')`.
- `SANITY_API_WRITE_TOKEN`, `RAZORPAY_KEY_SECRET`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` are read only in server code; nothing secret is passed to a client component.
- Every server action calls `requireAdmin()` first, and every `/api/admin/*` handler checks `isAdminRequest(req)` first, even though middleware also guards — server actions are callable directly by POST.
- Cancel = **full refund only**, and it **restores stock** (confirmed by user).
- Reserved slugs: `learn`, `classes`, `login`, `account`.
- Homepage caps: **3** prints, **4** projects, **8** press items.
- Upload limits: compress in browser to long edge **2500 px**, JPEG quality **0.85**; server rejects files over **4 MB** (Vercel body cap is 4.5 MB). Accept `image/jpeg`, `image/png`, `image/webp`.
- Session cookie: name `mr_admin`, HTTP-only, `secure`, `sameSite: 'lax'`, path `/`, **30 days**.
- Login rate limit: **5 attempts per IP per 15 minutes** via `checkRateLimit` (`lib/rate-limit.ts`).
- Admin pages are `noindex` and never use the public nav, footer, cat, Lenis or GSAP.
- Copy uses no em dashes (site-wide rule from the previous change).

## Review Focus

1. **Double refund** — she double-clicks "Cancel and refund", or retries after a slow response. Expect exactly one Razorpay refund. (Task 5: `cancelOrder` idempotency test.)
2. **Double shipping email** — the old Sanity webhook (`/api/ship-notify`) may still be configured and fires on the same order update. Expect the buyer to get one email. (Task 4: single-patch test asserting `shippedEmailSent: true` is written in the same patch as `status: 'shipped'`.)
3. **Restock of untracked stock** — all current prints have `stock: null` ("not tracked"). Cancelling must not try to increment a missing field (Sanity throws). (Task 5: restock test with `stock: null`.)
4. **Forged or expired session** — a tampered or 31-day-old cookie must be rejected, and a server action posted without a cookie must fail. (Task 2: session tests; Task 2 grep check that every action file calls `requireAdmin`.)
5. **A photo that can't be used** — HEIC from Photos, a 30 MB TIFF, a PDF dragged by mistake. Expect a plain message naming the file, and the rest of the batch still uploads. (Task 7: `validateUpload` tests; manual check in Task 8.)

---

## File Structure

```
middleware.ts                              guard /admin/** and /api/admin/** (new)
vitest.config.ts                           test runner config (new)
lib/admin/session.ts                       HMAC session token create/verify, password check (Web Crypto)
lib/admin/auth.ts                          requireAdmin() for server code
lib/admin/sanity.ts                        getAdminClient() (token, no CDN), revalidateSite()
lib/admin/orders.ts                        order types, tabs, transitions, shipOrder(), cancelOrder(), markDelivered()
lib/admin/shop.ts                          slugify, uniqueSlug, deriveAvailability, validatePrintInput, toShopItemFields
lib/admin/upload.ts                        validateUpload (server), shared limits
lib/admin/compress-image.ts                compressImage() (browser only)
lib/admin/featured.ts                      pickFeatured() for the public homepage
lib/razorpay.ts                            + refundPayment()
lib/emails.ts                              + sendCancellationEmail(), owner email gets adminUrl
app/admin/admin.css                        admin styles
app/admin/(auth)/login/page.tsx, actions.ts password login / logout (no shell)
app/admin/(panel)/layout.tsx               admin shell (sidebar, noindex), requireAdmin
app/admin/(panel)/page.tsx                 Home summary
app/admin/(panel)/orders/...               tabs + list; [id] order page + ship/deliver/cancel actions
app/admin/(panel)/shop/...                 print grid + reorder; new; [id] edit / delete
components/admin/*                         Sidebar, StatusBadge, PhotoDropzone, PrintForm, ConfirmButton, SortableGrid
app/api/admin/upload/route.ts              authenticated image upload → Sanity asset
app/api/razorpay/webhook/route.ts          pass adminUrl to owner email
sanity/schemas/order.ts                    + shippedAt, deliveredAt, refundId, refundedAt
sanity/lib/queries.ts, lib/home-data.ts    homepage featuring + description field fix
components/ui/MotionProvider.tsx           skip on /admin
next.config.js                             img-src add blob:
tests/admin/*.test.ts                      unit tests
```

---

### Task 1: Branch base, Vitest, admin env

**Files:**
- Create: `vitest.config.ts`, `tests/admin/smoke.test.ts`
- Modify: `package.json`, `.env.local.example`

**Interfaces:**
- Produces: `npm test` runs Vitest once; `@/` alias resolves to repo root in tests.

- [ ] **Step 1: Rebase onto the cursor/em-dash branch** so `MotionProvider.tsx` and copy changes don't conflict later.

Run: `git checkout feat/admin-cms && git rebase origin/chore/native-cursor-no-em-dashes`
Expected: clean rebase; `git log --oneline` shows the spec and plan commits directly on top of `d68ceb2`.

- [ ] **Step 2: Install Vitest** — `npm i -D vitest@^2` (only new dependency in this plan). Add `"test": "vitest run"` to `package.json` scripts. `vitest.config.ts`: `environment: 'node'`, `include: ['tests/**/*.test.ts']`, `resolve.alias: { '@': path.resolve(__dirname) }`.

- [ ] **Step 3: Smoke test** — `tests/admin/smoke.test.ts`: `expect(1 + 1).toBe(2)`.

Run: `npm test` — Expected: 1 passed.

- [ ] **Step 4: Env template.** In `.env.local.example`: remove the three `STRIPE_*` lines; add, with one-line comments: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `SANITY_API_WRITE_TOKEN`, `SANITY_WEBHOOK_SECRET`, `SANITY_REVALIDATE_SECRET`, `EMAIL_FROM`, `MANDAKINI_ORDER_EMAIL`, `NEXT_PUBLIC_COMMERCE_ENABLED`, `ADMIN_SESSION_SECRET` ("32+ random chars; rotating it logs everyone out"). Keep `ADMIN_PASSWORD`.

- [ ] **Step 5: Commit** — `chore(admin): vitest, env template for admin + razorpay`

---

### Task 2: Login, session, guard

**Files:**
- Create: `lib/admin/session.ts`, `lib/admin/auth.ts`, `middleware.ts`, `app/admin/(auth)/login/page.tsx`, `app/admin/(auth)/login/actions.ts`, `tests/admin/session.test.ts`
- Modify: `components/ui/MotionProvider.tsx`

**Interfaces:**
- Produces:
  - `SESSION_COOKIE = 'mr_admin'`, `SESSION_MAX_AGE_SEC = 2_592_000`
  - `createSessionToken(secret: string, nowMs: number): Promise<string>` → `"<expiresAtMs>.<hmacHex>"`
  - `verifySessionToken(token: string | undefined, secret: string, nowMs: number): Promise<boolean>`
  - `passwordMatches(input: string, expected: string): Promise<boolean>` (constant-time: compare HMAC-SHA256 digests of both with a fixed key)
  - `requireAdmin(): Promise<void>` — reads cookie via `cookies()`; on failure `redirect('/admin/login')`
  - `isAdminRequest(req: NextRequest): Promise<boolean>` — same check from the request's cookie, for route handlers (no redirect)
  - `login(prev: { error?: string }, form: FormData): Promise<{ error?: string }>`, `logout(): Promise<void>`

All crypto via `globalThis.crypto.subtle` (middleware runs on the Edge runtime; `node:crypto` is unavailable there).

- [ ] **Step 1: Write failing tests** `tests/admin/session.test.ts`:

```ts
const S = 'x'.repeat(32)
test('valid token verifies', async () => {
  const t = await createSessionToken(S, 1_000)
  expect(await verifySessionToken(t, S, 2_000)).toBe(true)
})
test('expired token rejected', async () => {
  const t = await createSessionToken(S, 0)
  expect(await verifySessionToken(t, S, SESSION_MAX_AGE_SEC * 1000 + 1)).toBe(false)
})
test('tampered expiry rejected', async () => {
  const [, sig] = (await createSessionToken(S, 0)).split('.')
  expect(await verifySessionToken(`99999999999999.${sig}`, S, 1)).toBe(false)
})
test('wrong secret rejected', async () => {
  expect(await verifySessionToken(await createSessionToken(S, 0), 'y'.repeat(32), 1)).toBe(false)
})
test('missing/garbage rejected', async () => {
  for (const t of [undefined, '', 'abc', '1.2.3']) expect(await verifySessionToken(t, S, 1)).toBe(false)
})
test('passwordMatches', async () => {
  expect(await passwordMatches('hunter2', 'hunter2')).toBe(true)
  expect(await passwordMatches('hunter3', 'hunter2')).toBe(false)
  expect(await passwordMatches('', 'hunter2')).toBe(false)
})
```

- [ ] **Step 2: Run** `npm test -- session` — Expected: FAIL (module not found).

- [ ] **Step 3: Implement `lib/admin/session.ts`** per the Interfaces block. Token signs the expiry string; verify recomputes and compares, then checks `expiresAt > nowMs`.

- [ ] **Step 4: Run** `npm test -- session` — Expected: 6 passed.

- [ ] **Step 5: Implement `lib/admin/auth.ts`, `middleware.ts`, login page/actions.**
  - `middleware.ts` matcher `['/admin/:path*', '/api/admin/:path*']`; let `/admin/login` through; otherwise verify cookie with `ADMIN_SESSION_SECRET` — on failure redirect pages to `/admin/login`, return `401` JSON for `/api/admin/*`. If `ADMIN_SESSION_SECRET` or `ADMIN_PASSWORD` is missing, treat every request as logged out.
  - `login`: rate-limit key `admin-login:<ip>` (5 / 15 min → error "Too many tries. Wait 15 minutes and try again."); wrong password → "That password isn't right."; success → set cookie (Global Constraints) and `redirect('/admin')`.
  - Login page: one password field, one "Sign in" button, site name above. `export const metadata = { robots: { index: false } }`.
  - `logout`: delete cookie, redirect to `/admin/login`.

- [ ] **Step 6: MotionProvider** — change `isStudio` to `const isBackOffice = pathname.startsWith('/studio') || pathname.startsWith('/admin')` and use it everywhere `isStudio` was used.

- [ ] **Step 7: Verify in browser** on a production build (`npm run build && npm start`, with `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in `.env.local`):
  - `/admin` → redirected to `/admin/login`.
  - Wrong password → message; 6th try within 15 min → rate-limit message.
  - Right password → lands on `/admin` (404 is fine until Task 3).
  - `curl -s -o /dev/null -w '%{http_code}' -X POST localhost:3000/api/admin/upload` → `401`.

- [ ] **Step 8: Commit** — `feat(admin): password login, signed session cookie, /admin guard`

---

### Task 3: Admin shell, Sanity admin client, Home summary

**Files:**
- Create: `lib/admin/sanity.ts`, `app/admin/(panel)/layout.tsx`, `app/admin/admin.css`, `app/admin/(panel)/page.tsx`, `components/admin/Sidebar.tsx`

**Interfaces:**
- Produces:
  - `getAdminClient(): SanityClient` — `createClient` from `next-sanity` with project/dataset/apiVersion fallbacks as in `sanity/lib/client.ts`, `token: process.env.SANITY_API_WRITE_TOKEN`, `useCdn: false`, `perspective: 'published'`. Throws `Error('SANITY_API_WRITE_TOKEN is not set')` if missing.
  - `revalidateSite(): void` — `revalidatePath('/', 'layout')`.
  - Sidebar items (this phase): **Home** `/admin`, **Orders** `/admin/orders` (with to-ship count), **Shop** `/admin/shop`; footer link **Sign out**. Later plans append items.

- [ ] **Step 1: Layout.** `app/admin/(panel)/layout.tsx` calls `requireAdmin()` and renders the shell. The login page lives in `app/admin/(auth)/` (Task 2), so it never gets this layout. Import only `admin.css` (no site components). `metadata.robots = { index: false, follow: false }`.

- [ ] **Step 2: Styles.** `admin.css`: scoped under `.mr-admin`; cream `#F5EFE4` background, cacao `#2C1A0E` text, terracotta `#B8572A` primary button; base font 17px, generous spacing; fixed 240px sidebar, content max-width 1100px. Must override the site's global styles that leak in from `app/globals.css` and `app/v2.css` (e.g. ensure normal cursor, body background, link colours).

- [ ] **Step 3: Home page** `app/admin/(panel)/page.tsx` — one GROQ round trip:

```groq
{
  "toShip": count(*[_type == "order" && status == "paid"]),
  "newMessages": count(*[_type == "enquiry" && coalesce(status, "new") == "new"]),
  "inShop": count(*[_type == "shopItem" && coalesce(availabilityStatus, "available") != "hidden"])
}
```

Render one sentence of three links: "2 orders to ship · 1 new message · 6 prints in the shop" (singular/plural correct; "Nothing to ship" when 0). Messages link is plain text until the Messages plan.

- [ ] **Step 4: Verify** on a production build: signed in, `/admin` shows the sidebar and real counts from the live dataset; no nav/footer/cat; normal cursor; page source contains `noindex`.

- [ ] **Step 5: Commit** — `feat(admin): shell, sidebar, home summary`

---

### Task 4: Orders — list, order page, Mark as shipped, Mark as delivered

**Files:**
- Create: `lib/admin/orders.ts`, `tests/admin/orders.test.ts`, `app/admin/(panel)/orders/page.tsx`, `app/admin/(panel)/orders/[id]/page.tsx`, `app/admin/(panel)/orders/[id]/actions.ts`, `components/admin/StatusBadge.tsx`
- Modify: `sanity/schemas/order.ts`

**Interfaces:**
- Consumes: `getAdminClient`, `revalidateSite` (Task 3), `requireAdmin` (Task 2), `sendShippingUpdate` (`lib/emails.ts`).
- Produces (in `lib/admin/orders.ts`):
  - `type OrderStatus = 'paid' | 'shipped' | 'delivered' | 'cancelled'`
  - `ORDER_TABS = [{ key: 'to-ship', label: 'To ship', status: 'paid' }, { key: 'shipped', label: 'Shipped', status: 'shipped' }, { key: 'completed', label: 'Completed', status: 'delivered' }, { key: 'cancelled', label: 'Cancelled and refunded', status: 'cancelled' }] as const`
  - `canShip(s)`, `canDeliver(s)`, `canCancel(s)`: `paid` / `shipped` / `paid | shipped`
  - `interface AdminOrder { _id; orderNumber; status: OrderStatus; customerName; customerEmail; customerPhone; shippingAddress; items: { shopItem?: { _ref: string }; title: string; quantity: number; priceAtPurchase: number }[]; amountTotal: number; razorpayPaymentId?: string; courierName?: string; awbNumber?: string; shippedEmailSent?: boolean; refundId?: string; createdAt: string }`
  - `interface OrderDeps { client: Pick<SanityClient, 'fetch' | 'patch' | 'transaction'>; sendShippingUpdate: typeof sendShippingUpdate; now: () => Date }`
  - `shipOrder(deps, orderId: string, input: { courierName: string; awbNumber: string }): Promise<{ ok: true; emailSent: boolean } | { ok: false; error: string }>`
  - `markDelivered(deps, orderId): Promise<{ ok: true } | { ok: false; error: string }>`
  - `resendShippingEmail(deps, orderId): Promise<{ ok: boolean; error?: string }>`

`shipOrder` rules: trim both inputs; each required, max 100 chars ("Add the courier name" / "Add the tracking number"); order must exist and `canShip`; send the email **first**, then commit **one** patch: `{ status: 'shipped', courierName, awbNumber, shippedAt: now.toISOString(), shippedEmailSent: emailOk }`. Email failure does not block shipping; it returns `emailSent: false`.

- [ ] **Step 1: Write failing tests** `tests/admin/orders.test.ts` using an in-memory fake client (`fetch` returns a fixture order; `patch(id).set(obj).commit()` records `{ id, set }`):
  - `shipOrder` on a `paid` order writes exactly one patch whose `set` equals `{ status: 'shipped', courierName: 'Delhivery', awbNumber: 'AWB123', shippedAt: '2026-10-29T10:00:00.000Z', shippedEmailSent: true }` and calls `sendShippingUpdate` once with `({ orderNumber: 'MR-2026-0001', customerName: 'Asha Rao', awbNumber: 'AWB123', courierName: 'Delhivery' }, 'asha@example.com')`.
  - Inputs `'  Delhivery '`, `' AWB123 '` are trimmed.
  - Empty tracking number → `{ ok: false, error: 'Add the tracking number' }`, no patch, no email.
  - Order already `shipped` → `{ ok: false, error: "This order isn't waiting to be shipped." }`.
  - Email resolves `{ ok: false }` → patch has `shippedEmailSent: false`, result `{ ok: true, emailSent: false }`.
  - `markDelivered` on `shipped` → patch `{ status: 'delivered', deliveredAt: <now> }`; on `paid` → error, no patch.

- [ ] **Step 2: Run** `npm test -- orders` — Expected: FAIL.

- [ ] **Step 3: Implement** `lib/admin/orders.ts` per Interfaces.

- [ ] **Step 4: Run** `npm test -- orders` — Expected: all pass.

- [ ] **Step 5: Schema.** `sanity/schemas/order.ts`: add read-only `shippedAt` (datetime), `deliveredAt` (datetime), `refundId` (string), `refundedAt` (datetime), after `courierName`.

- [ ] **Step 6: Pages and actions.**
  - `orders/page.tsx`: tabs from `ORDER_TABS` via `?tab=` (default `to-ship`), each tab shows its count. Rows: order number, date (`29 Oct 2026`), buyer, items summary ("Dhyanam × 1, +1 more"), `₹4,800`, StatusBadge. Newest first. Empty states per tab ("Nothing waiting to be shipped.").
  - `orders/[id]/page.tsx`: `params.id` is URL-encoded `_id`. Sections: Buyer (name, phone as `tel:` link, email as `mailto:` link), Ship to (address + **Copy address** button), Items with line totals and Total, then the action area for the status: ship form (Courier name, Tracking number, **Mark as shipped**), or **Mark as delivered**, plus secondary **Cancel order** (wired in Task 5). Shipped/Completed show courier + tracking. If `status == 'shipped' && !shippedEmailSent`, show "The shipping email didn't send." with a **Send it again** button.
  - `actions.ts`: `'use server'`; each action calls `requireAdmin()`, builds deps with `getAdminClient()`, calls the lib function, on success `revalidateSite()` and `revalidatePath('/admin/orders')`. Buttons show a pending state and are disabled while pending.
  - Success notices: "Marked as shipped. Asha has been emailed the tracking number." / "Marked as shipped, but the email didn't send." / "Marked as delivered."

- [ ] **Step 7: Verify** on a production build against the live dataset using a test order created in Studio (`status: paid`, your own email as customer): ship it → order moves to Shipped tab, one email arrives (requires email fix; otherwise confirm the "didn't send" path renders), Mark as delivered → Completed tab. Delete the test order in Studio afterwards.

- [ ] **Step 8: Commit** — `feat(admin): orders list, order page, ship and deliver`

---

### Task 5: Cancel and full refund with restock

**Files:**
- Modify: `lib/admin/orders.ts`, `tests/admin/orders.test.ts`, `lib/razorpay.ts`, `lib/emails.ts`, `app/admin/(panel)/orders/[id]/actions.ts`, `app/admin/(panel)/orders/[id]/page.tsx`
- Create: `components/admin/ConfirmButton.tsx`

**Interfaces:**
- Consumes: `AdminOrder`, `OrderDeps`, `canCancel` (Task 4).
- Produces:
  - `refundPayment(paymentId: string, amountPaise: number): Promise<{ id: string }>` in `lib/razorpay.ts` — `client.payments.refund(paymentId, { amount: amountPaise, speed: 'normal' })`; throws `RazorpayConfigError` when keys are missing (same pattern as `createRazorpayOrder`).
  - `sendCancellationEmail(payload: { orderNumber: string; customerName: string; amountTotal: number }, customerEmail: string): Promise<SendResult>` in `lib/emails.ts`. Subject `Your order has been cancelled: MR-2026-0001`; body says the order is cancelled and `₹4,800` has been refunded to the original payment method, usually within 5 to 7 working days.
  - `interface CancelDeps extends OrderDeps { refundPayment: typeof refundPayment; sendCancellationEmail: typeof sendCancellationEmail }`
  - `cancelOrder(deps: CancelDeps, orderId: string): Promise<{ ok: true; emailSent: boolean } | { ok: false; error: string }>`

`cancelOrder` rules, in order:
1. Order must exist and `canCancel`; if `refundId` is already set, return `{ ok: false, error: 'This order has already been refunded.' }` without calling Razorpay.
2. `razorpayPaymentId` required, else error "This order has no payment to refund."
3. `refundPayment(paymentId, Math.round(amountTotal * 100))`. On throw: return `{ ok: false, error: 'Razorpay could not refund this payment: <safe message>' }` (reuse `safeCheckoutError` for the message) and write nothing.
4. One transaction: patch order `{ status: 'cancelled', refundId, refundedAt }`; for each item with a `shopItem._ref`, fetch `{ _id, stock, sold, availabilityStatus }` first, then patch: `dec({ sold: qty })` only if `sold` is a number (floor at 0 via `set` if `sold < qty`); `inc({ stock: qty })` only if `stock` is a number; if `availabilityStatus == 'soldOut'` and resulting stock is `> 0` or untracked → `set({ availabilityStatus: 'available' })`.
5. Send cancellation email; result's `emailSent` reflects it. Email failure does not undo anything.

- [ ] **Step 1: Write failing tests** (append to `orders.test.ts`):
  - Paid order `amountTotal: 4800` → `refundPayment` called once with `('pay_123', 480000)`; transaction contains order patch `{ status: 'cancelled', refundId: 'rfnd_1', refundedAt: <now> }`.
  - **Called twice** (second time the fake returns the order with `refundId: 'rfnd_1'`) → `refundPayment` called exactly once overall; second result is the "already been refunded" error.
  - Item with `stock: 2, sold: 3, availabilityStatus: 'available'`, qty 1 → `inc stock 1`, `dec sold 1`, no status change.
  - Item with `stock: 0, availabilityStatus: 'soldOut'`, qty 1 → `inc stock 1` and `set availabilityStatus 'available'`.
  - Item with `stock: null, sold: null` → **no** `inc`/`dec` operations for that item.
  - `refundPayment` throws `{ error: { description: 'The payment has been fully refunded already' } }` → `{ ok: false }` containing that text, no transaction committed.
  - `delivered` order → error, `refundPayment` not called.

- [ ] **Step 2: Run** `npm test -- orders` — Expected: new tests FAIL.

- [ ] **Step 3: Implement** `refundPayment`, `sendCancellationEmail`, `cancelOrder`.

- [ ] **Step 4: Run** `npm test` — Expected: all pass.

- [ ] **Step 5: UI.** `ConfirmButton` (client): first click swaps the button for an inline confirm panel — text "Cancel this order and refund ₹4,800 to Asha Rao? This can't be undone." with **Yes, cancel and refund** (primary, disabled while pending) and **Keep the order**. No browser `confirm()` dialogs. Wire to a `cancelAndRefund(orderId)` server action (requireAdmin → deps → `cancelOrder` → revalidate). Success notice: "Order cancelled. ₹4,800 is being refunded to Asha." Cancelled orders show refund id and date.

- [ ] **Step 6: Verify** with Razorpay **Test mode** keys locally: create a real test payment through the site's checkout (test card), let the webhook create the order (or create one in Studio with the real test `razorpayPaymentId` and amount), then cancel from `/admin` → Razorpay test dashboard shows one refund for the full amount; order shows in the Cancelled tab; clicking again is impossible (button gone) and a direct re-POST returns the "already refunded" error.

- [ ] **Step 7: Commit** — `feat(admin): cancel order with full Razorpay refund and restock`

---

### Task 6: New-order email links to /admin

**Files:**
- Modify: `lib/emails.ts`, `app/api/razorpay/webhook/route.ts`, `tests/admin/emails.test.ts` (create)

**Interfaces:**
- Produces: `OrderEmailPayload.adminUrl?: string`; `ownerNotificationEmail` renders an "Open this order" link when present. Export `ownerNotificationEmail` for testing.

- [ ] **Step 1: Failing test** — `ownerNotificationEmail({ ...payload, adminUrl: 'https://www.mandakinirao.com/admin/orders/order.order_abc' }).html` contains that URL and the text `Open this order`; without `adminUrl` it contains neither.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** In the webhook, pass `adminUrl: \`${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.mandakinirao.com'}/admin/orders/${encodeURIComponent(sanityId)}\`` (use the first origin if `NEXT_PUBLIC_SITE_URL` is comma-separated). **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** — `feat(admin): owner order email links to the order in /admin`

---

### Task 7: Shop domain logic and image upload route

**Files:**
- Create: `lib/admin/shop.ts`, `lib/admin/upload.ts`, `lib/admin/compress-image.ts`, `app/api/admin/upload/route.ts`, `tests/admin/shop.test.ts`, `tests/admin/upload.test.ts`
- Modify: `next.config.js` (CSP `img-src` add `blob:`)

**Interfaces:**
- Produces (`lib/admin/shop.ts`):
  - `RESERVED_SLUGS = ['learn', 'classes', 'login', 'account']`
  - `slugify(title: string): string` — lowercase, strip accents, non-alphanumerics → `-`, collapse/trim dashes, max 96; empty → `'print'`
  - `uniqueSlug(base: string, taken: string[]): string` — if `base` is reserved or taken, append `-2`, `-3`, …
  - `deriveAvailability(i: { showInShop: boolean; howManyLeft: number | null }): 'available' | 'soldOut' | 'hidden'`
  - `interface PrintImage { assetId: string; alt: string; key?: string }`
  - `interface PrintInput { title: string; price: number; editionSize: number | null; howManyLeft: number | null; description: string; purchaseType: 'buy' | 'privateCollection'; showInShop: boolean; showOnHomepage: boolean; images: PrintImage[] }`
  - `validatePrintInput(raw: Record<string, unknown>, mode: 'create' | 'edit'): { ok: true; value: PrintInput } | { ok: false; errors: Partial<Record<keyof PrintInput, string>> }`
  - `toShopItemFields(input: PrintInput): Record<string, unknown>` — maps to `title, basePrice, editionSize, stock, description, purchaseType, availabilityStatus, featuredOnHomepage, images[]` where each image is `{ _type: 'image', _key, asset: { _type: 'reference', _ref: assetId }, alt: alt || title }`
- Produces (`lib/admin/upload.ts`): `MAX_UPLOAD_BYTES = 4 * 1024 * 1024`, `ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']`, `validateUpload(f: { type: string; size: number; name: string }): { ok: true } | { ok: false; error: string }`
- Produces (`lib/admin/compress-image.ts`, browser only): `compressImage(file: File): Promise<File>` — `createImageBitmap` → canvas scaled so the long edge ≤ 2500 → `toBlob('image/jpeg', 0.85)`; throws `Error("<name> can't be opened. Save it as a JPEG and try again.")` if decoding fails.
- Produces (route): `POST /api/admin/upload` multipart field `file` → `200 { assetId: string, url: string }` | `400 { error }` | `401`.

- [ ] **Step 1: Failing tests** `shop.test.ts`:
  - `slugify('Raga in Ochre (Print)')` → `'raga-in-ochre-print'`; `slugify('Dhyānam')` → `'dhyanam'`; `slugify('!!!')` → `'print'`.
  - `uniqueSlug('dhyanam', ['dhyanam', 'dhyanam-2'])` → `'dhyanam-3'`; `uniqueSlug('login', [])` → `'login-2'`.
  - `deriveAvailability`: `{false, 5}` → `hidden`; `{true, 0}` → `soldOut`; `{true, null}` → `available`; `{true, 3}` → `available`.
  - `validatePrintInput` create: missing title → `errors.title === 'Add a title'`; `price: 0` with `purchaseType: 'buy'` → `errors.price === 'Add a price'`; `editionSize: 50`, `howManyLeft` blank, create → `value.howManyLeft === 50`; same on **edit** → `null` stays `null`; `howManyLeft: 60, editionSize: 50` → `errors.howManyLeft === "Can't be more than the edition size"`; no images → `errors.images === 'Add at least one photo'`.
  - `toShopItemFields`: image with empty alt gets the title as alt; `showInShop: false` → `availabilityStatus: 'hidden'`; `showOnHomepage: true` → `featuredOnHomepage: true`.
- [ ] `upload.test.ts`: `{type:'image/heic'}` → error `"photo.heic isn't a JPEG, PNG or WebP. Save it as a JPEG and try again."`; size `4*1024*1024 + 1` → error `"photo.jpg is too large (over 4 MB)."`; jpeg 1 MB → ok.

- [ ] **Step 2: Run** `npm test -- shop upload` — FAIL. **Step 3: Implement** the three lib files. **Step 4: Run** — PASS.

- [ ] **Step 5: Route.** `isAdminRequest(req)` first (`401` JSON on failure), `validateUpload`, then `getAdminClient().assets.upload('image', Buffer.from(await file.arrayBuffer()), { filename: file.name })` → return `{ assetId: asset._id, url: asset.url }`. Never return the token or raw Sanity errors.

- [ ] **Step 6: CSP.** `next.config.js` `img-src` becomes `"img-src 'self' data: blob: https:"` (local previews before upload).

- [ ] **Step 7: Verify** — signed in, `curl` with the session cookie uploading a 2 MB JPEG returns an `assetId` starting `image-`; without cookie → `401`.

- [ ] **Step 8: Commit** — `feat(admin): print validation, slugs, authenticated image upload`

---

### Task 8: Shop screens — grid, reorder, add, edit, delete

**Files:**
- Create: `app/admin/(panel)/shop/page.tsx`, `app/admin/(panel)/shop/actions.ts`, `app/admin/(panel)/shop/new/page.tsx`, `app/admin/(panel)/shop/[id]/page.tsx`, `app/admin/(panel)/shop/[id]/actions.ts`, `components/admin/PrintForm.tsx`, `components/admin/PhotoDropzone.tsx`, `components/admin/SortableGrid.tsx`

**Interfaces:**
- Consumes: everything in Task 7; `ConfirmButton` (Task 5); `getAdminClient`, `revalidateSite`, `requireAdmin`.
- Produces server actions:
  - `createPrint(raw: Record<string, unknown>): Promise<{ ok: true; id: string; slug: string } | { ok: false; errors: Record<string, string> }>` — slug from `uniqueSlug(slugify(title), allExistingSlugs)`, set once at creation; `sold: 0`; `displayOrder` = max + 1.
  - `updatePrint(id: string, raw): Promise<same>` — never changes slug, `sold`, or `displayOrder`.
  - `deletePrint(id: string): Promise<{ ok: boolean; error?: string }>` — refuse if any order references it: "This print has orders, so it can't be deleted. Turn off "Show in shop" instead."
  - `reorderPrints(ids: string[]): Promise<{ ok: boolean }>` — one transaction setting `displayOrder = index + 1`.

- [ ] **Step 1: Grid page.** Cards: cover photo (Sanity URL `?w=600`), title, `₹4,800`, stock line ("12 of 50 left" / "Not tracked" when stock null / "Sold out" badge), "Hidden" badge, "On homepage" badge. Drag to reorder (native HTML5 drag-and-drop in `SortableGrid`, saves on drop with a small "Order saved" notice). Primary button **+ Add a print**. Includes `privateCollection` items (badge "Enquiry only").

- [ ] **Step 2: PrintForm** (shared by new/edit), two columns per spec §6.2:
  - Left `PhotoDropzone`: "Drag your photos here, or click to choose" — multi-file; each file → `compressImage` → `validateUpload` → `POST /api/admin/upload` (max 3 in parallel), with per-photo progress and per-photo error text; failed files don't block others; first photo labelled "Cover"; drag to reorder; × to remove; "Describe this photo (optional)" small field per photo.
  - Right fields with labels: Title · Price (₹) · Edition size ("How many prints in the edition") · How many left · Description · "How can people get it?" radio: "Buy online" / "Enquiry only".
  - Bottom: switches **Show in shop**, **Show on homepage**; primary **Save and put live** (create) / **Save changes** (edit); disabled while uploads are in progress or saving.
  - Inline field errors from `validatePrintInput`; unsaved-changes warning on leaving the page (`beforeunload`).
- [ ] **Step 3: Success.** After save: "Dhyanam is live. View it on the site →" linking `/shop/<slug>` (new tab). Hidden items say "Saved. It's hidden from the shop." instead.
- [ ] **Step 4: Edit page** loads the print (`_id` from URL), pre-fills the form (existing `stock: null` shows "How many left" blank with hint "Leave blank if you don't keep count"), **Delete this print** at the bottom via `ConfirmButton` ("Delete Dhyanam from the website? This can't be undone.").
- [ ] **Step 5: Grep check** — `grep -L "requireAdmin" $(find "app/admin/(panel)" -name actions.ts)` prints nothing.
- [ ] **Step 6: Verify** on a production build against the live dataset:
  - Add a print with 4 photos dragged at once, including one HEIC and one PDF → the 2 good photos upload, the 2 bad ones show their messages.
  - Save → success message; `/shop` shows it within seconds; `/shop/<slug>` shows the description.
  - Edit price → site updates; title change keeps the same URL.
  - Reorder on the grid → `/shop` order matches.
  - Turn off Show in shop → gone from `/shop`; Delete → confirm panel → removed.
  - Remove the test print afterwards.
- [ ] **Step 7: Commit** — `feat(admin): shop grid, add/edit/delete prints, drag to reorder`

---

### Task 9: Public site — honour "Show on homepage", show print descriptions

**Files:**
- Create: `lib/admin/featured.ts`, `tests/admin/featured.test.ts`
- Modify: `sanity/lib/queries.ts`, `lib/home-data.ts`

**Interfaces:**
- Produces: `pickFeatured<T>(featured: T[] | null, fallback: T[] | null, cap: number): T[]` — `featured` if non-empty else `fallback`, then sliced to `cap`.

Findings this task fixes (verified against the live dataset): the homepage reads `siteSettings.featuredShopItems` / `featuredProjects`, which don't exist, so `featuredOnHomepage` is ignored; and the shop queries read `desc` while the data stores `description`, so print descriptions never reach the site.

- [ ] **Step 1: Failing tests** — `pickFeatured([a], [b, c], 3)` → `[a]`; `pickFeatured([], [b, c, d, e], 3)` → `[b, c, d]`; `pickFeatured(null, null, 3)` → `[]`.
- [ ] **Step 2: Run** — FAIL. **Step 3: Implement.** **Step 4: Run** — PASS.
- [ ] **Step 5: Queries.**
  - Replace `featuredShopItemsQuery` with `featuredShopItemsQuery` = buyable, non-hidden `shopItem` where `featuredOnHomepage == true`, ordered `coalesce(homepageOrder, 999) asc, coalesce(displayOrder, 999) asc`, `[0...3]`; add `firstShopItemsQuery` = the old fallback branch (`[0...3]`).
  - Replace `featuredSeriesQuery` likewise (`featuredOnHomepage == true`, same ordering, `[0...4]`); fallback stays `getAllSeries()` in `getFeaturedSeries`.
  - Add `featuredPressItemsQuery` (`featuredOnHomepage == true`, ordered by `homepageOrder` then `displayOrder`); homepage press = `pickFeatured(featured, all, 8)`.
  - In all shop projections replace `desc,` with `"desc": coalesce(description, desc),`.
  - Remove the `siteSettings.featuredShopItems` / `featuredProjects` references.
- [ ] **Step 6: Wire** `getHomeData` / `getFeaturedSeries` to use `pickFeatured` with caps 3 / 4 / 8.
- [ ] **Step 7: Verify** on a production build against the live dataset: homepage prints/projects/press are exactly the items with "Featured on Homepage" on in Studio (in `homepageOrder`); turning one off in `/admin` Shop removes it from the homepage after save; a print page shows its description.
- [ ] **Step 8: Commit** — `fix(site): homepage honours Show on homepage; show print descriptions`

---

### Task 10: Final check and handover

- [ ] **Step 1:** `npm test`, `npx tsc --noEmit`, `npm run build` — all clean.
- [ ] **Step 2:** Full walk-through on a production build: login → Home counts → ship → deliver → cancel/refund (Test mode) → add/edit/reorder/delete print → homepage featuring → sign out. No em dashes or database words on any admin screen (`grep -rn "—\|slug\|document" app/admin components/admin` shows only code, no UI strings).
- [ ] **Step 3:** Update `PROGRESS.md` with a dated entry (what shipped, env vars to add in Vercel: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SANITY_API_WRITE_TOKEN`; Razorpay must be in Live mode keys for real refunds).
- [ ] **Step 4:** Push `feat/admin-cms`, open a PR, and test on the Vercel preview before any merge to `main`.
