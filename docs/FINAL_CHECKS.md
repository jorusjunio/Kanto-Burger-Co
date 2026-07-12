# Final Checks — Kanto Burger Co.

Codebase cleanup + full verification pass. Last run: **2026-07-12**.

## 1. Static checks — all green

| Check | Command | Result |
| --- | --- | --- |
| Types | `npx tsc --noEmit` | 0 errors |
| Lint | `npx eslint .` | 0 problems |
| Unit tests | `npm test` | 37 / 37 passing |
| Production build | `npm run build` | Compiled successfully, all 21 routes |

## 2. Bugs found & fixed this pass

### a. `/kitchen` had no auth guard (security) — FIXED
The live kitchen board exposes customer names, phone numbers, and order
contents, but `/kitchen` had **no page guard** and sat **outside** the
`proxy.ts` matcher (which only covered `/admin`). Anyone could open it.
- Added `await requireStaffPage("/kitchen")` to `src/app/kitchen/page.tsx`.
- Extended `src/proxy.ts` matcher to `["/admin/:path*", "/kitchen/:path*"]`
  for edge-level defense-in-depth.
- Verified: unauthenticated `GET /kitchen` → `307 → /admin/login?callbackUrl=%2Fkitchen`.

### b. `/checkout` was statically prerendered while reading live settings — FIXED
The page reads `getStoreSettings()` (delivery fee + accepting-orders toggle) but
Next prerendered it as **static**, so it could serve a stale fee / miss a
"closed for orders" toggle until a rebuild.
- Added `export const dynamic = "force-dynamic"` to
  `src/app/(customer)/checkout/page.tsx`.
- Verified: route now builds as `ƒ (Dynamic)`.

### c. Lint cleanup — FIXED
- `staff-manager.tsx` — removed unused `DialogFooter` import.
- `kitchen-board.tsx` / `connection-indicator.tsx` — the hydration-safe
  client-clock and Pusher-connection `setState`-in-effect now carry the
  repo-standard `eslint-disable react-hooks/set-state-in-effect` (matches
  `page-loader.tsx` / `site-header.tsx`).
- `pusher.ts` — swapped `console.warn/error` for the shared `logger`.

## 3. Functional verification

- **Auth boundaries:** `/admin` and `/kitchen` redirect anonymous visitors to
  login; `/menu` and storefront render publicly (200). Manager-only pages
  (`requireManagerPage`) bounce STAFF to `/kitchen`.
- **Route inventory:** old `/admin/categories` redirects to
  `/admin/menu?tab=categories` (Categories merged into Menu tabs). `/admin/reports`
  retired → redirects to `/admin`.
- **Customer flow** (menu → cart → checkout → pay → track) and admin/kitchen
  flows verified in prior sessions; static + build + guard checks re-confirmed
  here.

## 4. Notes / follow-ups (not blocking)

- **Leftover test orders** remain in the dev DB from Playwright E2E runs
  ("Scroll Repro", "Toast Test", "Checkout Redesign Test"). Harmless demo data —
  clear from the admin Orders view if you want a clean slate. Not present in prod.
- **`npm run db:seed` is destructive** (wipes data) — use `npm run db:add-admin`
  for non-destructive admin setup.
