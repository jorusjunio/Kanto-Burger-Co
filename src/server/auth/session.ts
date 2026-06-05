import { getServerSession } from "next-auth";

import { UserRole } from "@/generated/prisma/enums";

import { authOptions } from "./config";

export function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return session;
}

export async function requireAdminRoleSession() {
  const session = await requireAdminSession();

  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden");
  }

  return session;
}
