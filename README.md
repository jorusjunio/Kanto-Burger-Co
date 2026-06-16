# Kanto Burger Co.

A food-ordering e-commerce website for a local burger and snack shop. It has two
sides: a **public customer storefront** and a **protected admin/staff
dashboard**.

## Stack

```txt
Next.js 16 (App Router) + React 19 + TypeScript
Tailwind CSS + shadcn/ui
Neon Postgres + Prisma 7
NextAuth v4 (JWT) — email/password + optional Google
Zustand (cart state)
React Hook Form + Zod
Cloudinary (image uploads)
Pusher (realtime)
Recharts (reports)
Deployed on Vercel
```

## Architecture

The app is organized **by feature**, not by file type. Routes in `src/app` stay
thin and delegate to the matching module under `src/features`.

```txt
src/app
├── (customer)        Public storefront routes (home, menu, cart, checkout, order tracking)
├── admin
│   ├── login         Staff/admin sign-in
│   └── (protected)   Auth-gated dashboard (orders, menu, categories, reports)
└── api/auth          NextAuth route handler

src/features
├── cart              Zustand cart store (persisted to localStorage)
├── checkout          createOrder server action + Zod validation
├── menu              Product cards, category nav, menu queries
├── orders            Customer order tracking + realtime listener
└── admin
    ├── orders        Order management, status lifecycle (state machine)
    ├── menu          Product CRUD + Cloudinary upload
    ├── reports       Sales analytics queries (Recharts)
    └── auth          Login form, sign-out, routing helpers

src/server
├── auth              NextAuth config + session helpers
├── db                Prisma client (Neon adapter)
└── services          Cloudinary + Pusher integrations

src/lib                Shared utils: format, logger, rate-limiter, image, pusher-client
src/components         UI primitives (shadcn) + customer/admin shared components
src/generated/prisma   Generated Prisma client (git-ignored)
```

## How it works

**Customer flow:** browse the menu → add items (with add-ons) to the cart →
checkout. The `createOrder` server action runs in a single Prisma transaction
that re-reads prices and stock from the DB (never trusting the client), validates
add-ons, and atomically decrements stock to prevent overselling. A Pusher event
notifies the admin in realtime. The customer gets an order number + tracking
token to follow status updates live.

**Admin flow:** staff/admin sign in, then manage incoming orders through a fixed
status lifecycle (`PENDING → PREPARING → READY → OUT_FOR_DELIVERY → COMPLETED`,
or `CANCELLED`), manage the menu and categories, and view basic sales reports.

## Setup

See [docs/SETUP.md](docs/SETUP.md) for the full local setup flow.

Quick start:

```bash
npm install
cp .env.example .env   # then fill in the values
npm run db:migrate     # creates the schema
npm run db:seed        # seeds demo data (DESTRUCTIVE — wipes existing data)
npm run dev
```

On Windows PowerShell, use `npm.cmd` / `npx.cmd` if script execution blocks the
`.ps1` shims.

## Scripts

```txt
npm run dev          Start the dev server
npm run build        Production build
npm start            Run the production build
npm run lint         ESLint
npm test             Unit tests (Node test runner via tsx)
npm run db:generate  Regenerate the Prisma client
npm run db:migrate   prisma migrate dev
npm run db:seed      Seed demo data (DESTRUCTIVE)
npm run db:add-admin Register/promote a user (non-destructive)
```

## MVP scope

- Customer menu browsing
- Cart and checkout
- Pickup and delivery orders
- Cash, COD, and manual GCash
- Admin/staff login (email/password + optional Google)
- Realtime order updates
- Menu and category management
- Cloudinary product image upload
- Product-level stock tracking
- Basic sales reports
