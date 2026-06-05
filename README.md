# Kanto Burger Co.

A food ordering e-commerce website for a local burger and snack shop.

## Stack

```txt
Next.js + TypeScript
Tailwind CSS + shadcn/ui
Neon Postgres + Prisma
Auth.js / NextAuth
Zustand
React Hook Form + Zod
Cloudinary
Pusher
Recharts
Vercel
```

## Architecture

```txt
src/app
├── (customer)       Public storefront routes
├── admin            Protected admin/staff routes
└── api              Route handlers

src/features
├── cart             Zustand cart state
├── customer         Customer-facing feature modules
├── admin            Admin dashboard feature modules
├── menu             Menu/product feature modules
└── orders           Order feature modules

src/server
├── auth             Auth configuration
├── db               Prisma client
└── services         Cloudinary, Pusher, and other integrations
```

## Setup

Read [docs/SETUP.md](docs/SETUP.md) for the full local setup flow.

Quick start:

```bash
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

On Windows PowerShell, use `npm.cmd` / `npx.cmd` if script execution blocks `npm.ps1`.

## MVP Scope

- Customer menu browsing
- Cart and checkout
- Pickup and delivery orders
- Cash, COD, and manual GCash
- Admin/staff login
- Realtime order updates
- Menu management
- Cloudinary product image upload
- Product-level stock tracking
- Basic reports
