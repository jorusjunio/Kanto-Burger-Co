# Kanto Burger Co. Setup

## 1. Install dependencies

```bash
npm install
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
```

Then create your env file from the template and fill it in as you go:

```bash
cp .env.example .env
```

## 2. Create a Neon database

1. Go to Neon and create a new project.
2. Create or select a Postgres database.
3. Copy the pooled connection string.
4. Paste it into `.env` as `DATABASE_URL`.

Use this shape:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DBNAME?sslmode=require"
```

## 3. Add Cloudinary keys

From Cloudinary Dashboard, copy:

```env
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

## 4. Add Pusher keys

Create a Pusher Channels app, then copy:

```env
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

`NEXT_PUBLIC_PUSHER_KEY` should be the same value as `PUSHER_KEY`.
`NEXT_PUBLIC_PUSHER_CLUSTER` should be the same value as `PUSHER_CLUSTER`.

## 5. Add Auth settings

Generate a secret:

```bash
node -e "console.log(crypto.randomUUID() + crypto.randomUUID())"
```

Then set:

```env
AUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"
```

## 6. Run database migration

```bash
npx prisma migrate dev --name init
```

Then generate the Prisma client:

```bash
npx prisma generate
```

## 7. Run the app

Seed demo data:

```bash
npm run db:seed
```

Demo admin credentials:

```txt
Email: admin@kantoburger.test
Password: password123
```

Then start the dev server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## 8. Rate limiter (Upstash Redis)

Checkout and admin login are rate-limited. The limiter has two backends and
picks one automatically at startup:

- **Local dev / tests:** if `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN` are **not** set, it falls back to an in-memory Map.
  No setup needed — but note this state is per-process, so it only limits within
  a single instance.
- **Vercel production:** serverless runs many isolated instances, so the
  in-memory Map is ineffective. Set both env vars to enable the durable Upstash
  Redis backend and get correct **cross-instance** limiting.

Create a database at [Upstash](https://upstash.com/) (Redis) and copy the REST
credentials:

```env
UPSTASH_REDIS_REST_URL="https://YOUR-DB.upstash.io"
UPSTASH_REDIS_REST_TOKEN="..."
```

If the backend is ever unreachable, the limiter **fails open** (allows the
request) so a Redis hiccup never blocks legitimate checkout or login traffic.

## 9. Payments (automated gateway)

GCash orders settle through an automated payment gateway instead of a manual
reference number. The provider is pluggable — `mock` (built-in simulation) ships
by default; real providers (Maya, Stripe, Xendit) can be added later behind the
same `PaymentProvider` interface in `src/features/payments/`.

```env
PAYMENT_PROVIDER="mock"
PAYMENT_SIGNING_SECRET="a-long-random-string"
```

- `PAYMENT_SIGNING_SECRET` is **required**: settlement callbacks are HMAC-signed
  so an order can't be marked paid without a valid signature. Generate one with
  the same command as `AUTH_SECRET`.
- **Flow:** placing a GCash order redirects to `/checkout/pay/[intentId]` (the
  mock gateway), where **Pay now** / **Simulate failure** POST to
  `/api/payments/callback`. A successful callback auto-transitions the order from
  `PENDING` → `PAID` (no staff action) and pushes the update live to the admin
  dashboard and the customer's order tracker.

## 10. Observability & Log Drains

The app logs through `src/lib/logger.ts`. In development you get readable
console lines; in production every log is emitted as a **single-line JSON object**
(`level`, `message`, `timestamp`, `context`, and a serialized `error`) on
stdout/stderr. Vercel automatically parses this JSON into queryable fields — so
no logging library or agent is needed.

To forward those logs to an aggregator (Axiom, Better Stack, Datadog, etc.):

1. In the Vercel dashboard, open **Project → Settings → Log Drains**.
2. **Add a Log Drain**, choose your provider (or a generic HTTPS/JSON endpoint),
   and paste the destination URL/token from that provider.
3. Save. New logs stream to the aggregator automatically — no code or redeploy
   required.

Log Drains are a Pro/Enterprise feature; on Hobby you can still read the JSON
logs under the project's **Logs** tab.

## 11. (Optional) Enable Google login for the admin

Admins/staff can sign in with Google. The "Continue with Google" button on
`/admin/login` appears only when both Google env vars are set, and a Google
account is allowed in **only if its email is already a registered `User`**.

### a. Create OAuth credentials (Google Cloud Console)

1. console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen** → External. Add app name + support
   email. While the app is in **Testing**, add each Gmail under **Test users**
   (or **Publish** the app for open access — sign-in is still gated by the DB).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID →
   Web application**.
4. Add **Authorized redirect URIs** (one per environment):
   - `http://localhost:3000/api/auth/callback/google`
   - `https://YOUR-PROD-DOMAIN/api/auth/callback/google`
5. Copy the **Client ID** and **Client secret**.

### b. Environment variables

```env
NEXTAUTH_URL="http://localhost:3000"   # production: your https domain
GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."
```

> NextAuth v4 reads `NEXTAUTH_URL` (not `AUTH_URL`) for OAuth callback URLs.

### c. Register the Google email as admin

The sign-in gate requires a matching `User` row. Add one without wiping data:

```bash
npm run db:add-admin -- you@gmail.com "Your Name"        # defaults to ADMIN
npm run db:add-admin -- staff@gmail.com "Staff" STAFF
```

(Alternative: `npx prisma studio` → add a `User` with `role=ADMIN` and any
`passwordHash`.) Do **not** use `npm run db:seed` for this — it deletes all data.

### d. Verify

1. `npm run dev` → `/admin/login` shows **Continue with Google**.
2. Sign in with the registered Gmail → redirected in (role from the DB).
3. An unregistered Gmail is bounced back with an "not authorized" message.
