import "dotenv/config";

import { randomUUID } from "node:crypto";

import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

import { PrismaClient, UserRole } from "../src/generated/prisma/client";

/**
 * Register (or promote) an admin/staff user by email — non-destructive upsert.
 *
 * Use this to allow a Google account into the admin: the auth `signIn` callback
 * only lets a Google login through if its email already exists as a User. This
 * script creates that row without wiping data (unlike `db:seed`).
 *
 *   npm run db:add-admin -- you@gmail.com "Your Name"        # defaults to ADMIN
 *   npm run db:add-admin -- staff@gmail.com "Staff" STAFF
 *
 * A random password hash is set so password login stays disabled for the
 * account while Google sign-in works. Existing users keep their password.
 */

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const [, , emailArg, nameArg, roleArg] = process.argv;

  const email = emailArg?.trim().toLowerCase();
  if (!email) {
    throw new Error(
      'Usage: npm run db:add-admin -- <email> ["Full Name"] [ADMIN|STAFF]',
    );
  }

  const name = nameArg?.trim() || email.split("@")[0];
  const role =
    roleArg?.trim().toUpperCase() === "STAFF" ? UserRole.STAFF : UserRole.ADMIN;

  const user = await prisma.user.upsert({
    where: { email },
    update: { role, name },
    create: {
      email,
      name,
      role,
      // Random, unusable password — Google login is the way in for this user.
      passwordHash: await bcrypt.hash(randomUUID(), 12),
    },
  });

  console.log(`✓ ${user.email} is now ${user.role} (id: ${user.id})`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Done. This email can now sign in with Google.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
