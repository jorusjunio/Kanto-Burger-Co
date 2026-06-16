# Kanto Burger Co. — Claude Code guide

Food-ordering web app for a local burger shop. Customer storefront + protected
admin/staff dashboard.

## This is NOT the Next.js you know

This project uses a newer Next.js (16) with breaking changes — APIs,
conventions, and file structure may differ from older knowledge. Read the
relevant guide in `node_modules/next/dist/docs/` before writing Next.js code,
and heed deprecation notices.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Neon Postgres + Prisma 7 ·
NextAuth v4 (JWT) · Zustand · React Hook Form + Zod · Tailwind + shadcn/ui ·
Cloudinary · Pusher · deployed on Vercel.

## Conventions

- **Feature-based layout.** Code lives in `src/features/<feature>/`, not grouped
  by type. Each feature owns its `actions.ts` (server actions), `queries.ts`
  (DB reads), `validation.ts` (Zod), `types.ts`, and components.
- **Server-side trust.** Never trust prices/availability from the client.
  Re-read them from the DB inside the server action (see
  `src/features/checkout/actions.ts`).
- **Order status is a state machine.** Use the guards in
  `src/features/admin/orders/lifecycle.ts` — don't move status freely.
- **Prisma client is generated** to `src/generated/prisma` (git-ignored). Run
  `npm run db:generate` after schema changes.
- **Tests** use the Node test runner via `tsx`: `npm test`. Co-locate as
  `*.test.ts` next to the logic.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm test             # unit tests
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed demo data (DESTRUCTIVE — wipes data)
npm run db:add-admin # non-destructive: register/promote a user
```
