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
AUTH_URL="http://localhost:3000"
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
