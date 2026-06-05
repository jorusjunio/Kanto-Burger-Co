# AI Context - Kanto Burger Co.

Last updated: 2026-06-02

## Project Snapshot

- App: Kanto Burger Co., a local burger/snack ordering site.
- Stack: Next.js 16.2.6 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-style UI, Prisma 7 with Neon adapter, NextAuth v4, Zustand cart.
- Database models: User, Category, Product, AddOn, Order, OrderItem.
- Demo admin seed: `admin@kantoburger.test` / `password123`.
- Important repo note: Next.js 16 uses newer conventions. Read `node_modules/next/dist/docs/` before changing framework-level behavior.

## Verified Health

- 2026-06-02: `npm.cmd run lint` passes.
- 2026-06-02: `npm.cmd run build` passes.
- Dev server was reachable at `http://localhost:3000`.
- 2026-06-02: `npm.cmd test` passes with 24 tests.
- 2026-06-02: `npm.cmd run lint` passes.
- 2026-06-02: `npm.cmd run build` passes after rerunning with write permission for `.next` artifacts.
- 2026-06-02: Checkout hardening completed and covered by validation/cart tests.
- 2026-06-02: Regenerated Prisma client so `trackingToken` exists in generated Order types; `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build` pass.
- 2026-06-02: Admin menu validation hardening verified with `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.
- 2026-06-02: Payment workflow/UI hardening verified with `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.
- 2026-06-02: Auth routing hardening verified with `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build`.
- 2026-06-02: Final pre-design readiness check: `npm.cmd test` passes with 24 tests, `npm.cmd run lint` passes, and `npm.cmd run build` passes.

## Completed

### Design Phase Prep

- 2026-06-02: Design phase started using `https://codewithsadee.github.io/foodie/#` and the Royal Fare/Foodie-style screenshot as inspiration.
- Created public asset folders:
  - `public/assets/brand`
  - `public/assets/hero`
  - `public/assets/products`
  - `public/assets/categories`
  - `public/assets/decor`
  - `public/assets/references`
- Current visual direction: warm fast-food storefront, orange/red accent system, bold condensed headings, clean product cards, category cards, strong burger hero image, responsive layout.
- 2026-06-02: User uploaded brand assets in `public/assets/brand` and 10 product images in `public/assets/products`.
- Uploaded product images match the seed menu names and are usable for product cards. Most are landscape JPGs around 240px tall, so use them in card/list contexts; avoid stretching them as full-width hero images.
- Brand assets include SVG/PNG logo variants; prefer the transparent logo variant for navigation/header use.
- 2026-06-02: User uploaded additional images in `public/assets/decor-good-for-cutouts`; assets include product duplicates plus cheese, chili powder, lettuce, fries, sauce splash, tomato sauce, grill patties, burger stack, and wide banner.
- Design execution is pending explicit user `GO`. Do not start UI code changes until the user approves the design goal list.

## Pending Design Goals

1. Build a Foodie/Royal Fare inspired storefront direction: warm cream base, orange/red accents, bold condensed headings, strong food photography, and clean white product cards.
2. Use uploaded product images in menu/product cards and map filenames to seeded product names where possible.
3. Use `public/assets/hero/Wide banner.jpg` and/or the strongest burger image as temporary hero media; create transparent PNG cutouts from selected `decor-good-for-cutouts` files if needed.
4. Redesign customer-facing pages first: `/`, `/menu`, `/cart`, `/checkout`, and `/order/[orderNumber]`.
5. Keep admin pages more operational and readable, with lighter polish only: better header/nav consistency, status badges, tables, and spacing.
6. Preserve existing functionality and run `npm.cmd test`, `npm.cmd run lint`, and `npm.cmd run build` after design changes.

### Baseline MVP

- Public storefront landing page.
- Menu categories/products with stock labels.
- Product customization with add-ons and notes.
- Zustand cart persisted to local storage.
- Checkout creates orders, validates stock, and decrements tracked stock.
- Customer order tracking by order number.
- Admin order list and order detail pages.
- Admin order/payment status update forms.
- Seed script creates categories, products, add-ons, and demo admin user.

### Admin Auth

- Added NextAuth credentials auth backed by the `User` table and bcrypt password hashes.
- Added auth route at `/api/auth/[...nextauth]`.
- Added public admin login page at `/admin/login`.
- Protected `/admin`, `/admin/orders`, and `/admin/orders/[orderId]` with a route-group layout under `src/app/admin/(protected)`.
- Added admin sign-out button.
- Added `requireAdminSession()` guard to admin order status/payment server actions.

### Admin Menu Management

- Added protected admin menu list at `/admin/menu`.
- Added product creation page at `/admin/menu/new`.
- Added product edit page at `/admin/menu/[productId]/edit`.
- Added product server actions for create, update, and availability toggle.
- Product form supports category, slug, description, price, image URL, featured flag, availability, stock tracking, stock quantity, low stock threshold, and add-ons.
- Add-ons are edited as one line per add-on: `Name | Price | available/unavailable`.
- Admin layout now includes Reports, Orders, Menu, and Categories navigation.

### Cloudinary Product Images

- Added optional product image file upload to the admin product form.
- Product create/update actions upload selected images to Cloudinary under `kanto-burger-co/products`.
- Manual `imageUrl` entry still works when no file is uploaded.
- Upload validation currently accepts image files up to 5MB.

### Admin Category Management

- Added protected admin categories page at `/admin/categories`.
- Admins can create categories and inline-edit category name, slug, and sort order.
- Admin navigation now includes Categories.

### Admin Reports

- Added protected reports dashboard at `/admin/reports`.
- `/admin` now redirects to reports.
- Reports show today/30-day sales and order counts, 7-day daily sales, payment status totals, top products, and low-stock products.
- Admin navigation now includes Reports, Orders, and Menu.

### Realtime Order Updates

- Added safe Pusher server/client helpers that no-op when Pusher env vars are missing.
- Checkout order creation triggers an `order-created` event on the `admin-orders` channel.
- Admin order/payment status updates trigger `order-updated` events on `admin-orders` and the matching customer order channel.
- Protected admin pages and customer order detail pages subscribe to relevant events and refresh server-rendered data.
- Customer order pages now require a private `trackingToken` query parameter and subscribe on token-based realtime channels.

### Checkout UX Hardening

- Cart items now store an optional `maxQuantity` from tracked stock.
- Product customization and cart quantity controls cap tracked-stock products at available stock.
- Checkout payment options now depend on order type: pickup supports Cash/GCash, delivery supports COD/GCash.
- Server checkout validation rejects incompatible order type/payment method combinations.
- Phone input strips unsupported characters and GCash checkout copy shows the configured store number when available.
- Checkout order creation now derives product and add-on names/prices from the database instead of trusting client cart prices.
- Checkout stock decrement now uses conditional in-transaction updates to reduce overselling risk.

### Auth Polish

- Admin layout shows the signed-in role and routes `/admin` based on role.
- `ADMIN` users can access Reports and Menu management.
- `STAFF` users can access order management and are redirected away from admin-only Reports/Menu routes.
- Product create/update/availability actions now require an `ADMIN` role on the server.
- `/admin/login` now redirects already-signed-in `ADMIN` users to Reports and `STAFF` users to Orders.
- Login callback URLs are sanitized to `/admin` or `/admin/...` paths only.

### Order Lifecycle Hardening

- Admin order status updates now enforce forward lifecycle transitions.
- Completed and cancelled orders are terminal states.
- Cancelling an active order restores tracked product stock once.
- Admin order status forms now show only the current status and valid next lifecycle transitions.
- Payment status updates now reject `PENDING` verification for non-GCash orders, and the admin UI hides that option for Cash/COD orders.
- Cleaned admin header mojibake to an ASCII separator.

### Automated Tests

- Added `npm.cmd test` using `tsx --test`.
- Added unit tests for order lifecycle transition rules.
- Added unit tests for checkout validation rules.
- Added unit tests for cart add/update/remove/subtotal behavior and tracked-stock quantity caps.
- Added testable admin order action handlers with dependency injection.
- Added unit tests for admin order auth guard short-circuiting, cancellation stock restoration, payment status updates, revalidation, and realtime event triggers.
- Added regression coverage for rejecting non-GCash `PENDING` payment verification.
- Added admin menu action helper tests for image URL validation, add-on parsing failures, generated slug safety, and strict availability toggle parsing.
- Added auth routing tests for admin callback URL sanitization.

### Admin Menu Hardening

- Moved admin menu/category form parsing helpers into `src/features/admin/menu/action-helpers.ts` so validation behavior is directly testable.
- Manual product image URLs now must be valid `http` or `https` URLs when provided.
- Invalid add-on lines now throw readable errors instead of being silently dropped.
- Generated slugs must include at least one letter or number.
- Product availability toggles now accept only explicit `true` or `false` values.

### Build / Generated Client Fixes

- Regenerated `src/generated/prisma` after the `trackingToken` migration so the customer order page type-checks in production builds.

## Current Route Map

- `/` storefront home.
- `/menu` menu browsing.
- `/cart` cart.
- `/checkout` checkout.
- `/order/[orderNumber]?token=...` customer order status.
- `/admin/login` staff login.
- `/admin` redirects to `/admin/reports`.
- `/admin/reports` protected reports dashboard.
- `/admin/orders` protected order list.
- `/admin/orders/[orderId]` protected order detail/status management.
- /admin/menu protected product/menu management.
- /admin/categories protected category management.
- /admin/menu/new protected product creation.
- `/admin/menu/[productId]/edit` protected product editing.
- `/api/auth/[...nextauth]` NextAuth route handler.

## Known Gaps / Backlog

1. 2026-06-02 audit pass completed: fixed issues found in admin menu validation, payment workflow rules, order status UI options, auth callback routing, admin login redirects, generated Prisma alignment, and admin header text.
2. Add automated tests for full admin menu/category actions, including `ADMIN`-only guards, DB writes, revalidation, redirects, and image upload behavior.
3. Add integration or database-backed tests for checkout/order workflows if a disposable test database becomes available.

## Next Recommended Step

Wait for user `GO`, then begin visual/product design polish from the current build-clean MVP baseline.

## Notes For Future AI Agents

- Avoid editing generated Prisma files under `src/generated/prisma` manually.
- This repo currently has many uncommitted files from the user/project work. Do not revert unrelated changes.
- Prefer `npm.cmd` / `npx.cmd` in PowerShell.
- Use `apply_patch` for manual edits.
- After each meaningful feature, update this file with what changed, checks run, and remaining gaps.





