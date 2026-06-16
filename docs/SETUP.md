# Kanto Burger Co. Setup

## 1. Install dependencies

```bash
npm install
```

If PowerShell blocks `npm`, use:

```bash
npm.cmd install
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
NEXT_PUBLIC_APP_URL="http://localhost:3000"
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

## 8. (Optional) Enable Google login for the admin

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
