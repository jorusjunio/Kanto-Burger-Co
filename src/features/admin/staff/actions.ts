"use server";

import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { UserRole } from "@/generated/prisma/enums";
import { logger } from "@/lib/logger";
import { requireAdminRoleSession } from "@/server/auth/session";
import { prisma } from "@/server/db/prisma";

export type StaffActionState = {
  ok: boolean;
  message: string;
};

const addStaffSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address."),
  name: z.string().trim().min(1, "Name is required."),
  role: z.enum(UserRole),
});

/**
 * Register a Google account as staff/admin. The auth signIn callback only lets
 * a Google login through if its email already exists as a User, so creating the
 * row here is what grants access. An unusable random password keeps password
 * login disabled — Google is the way in.
 */
export async function addStaffMember(
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  await requireAdminRoleSession();

  const parsed = addStaffSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid details.",
    };
  }

  const { email, name, role } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return {
        ok: false,
        message: `${email} is already on the team.`,
      };
    }

    await prisma.user.create({
      data: {
        email,
        name,
        role,
        passwordHash: await bcrypt.hash(randomUUID(), 12),
      },
    });

    revalidatePath("/admin/staff");
    return {
      ok: true,
      message: `${name} can now sign in with Google as ${role}.`,
    };
  } catch (error) {
    logger.error("Failed to add staff member", error, { email });
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}

const roleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(UserRole),
});

/** Promote/demote a teammate. Guards against an admin changing their own role. */
export async function setStaffRole(formData: FormData) {
  const session = await requireAdminRoleSession();

  const parsed = roleSchema.parse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (parsed.userId === session.user.id) {
    throw new Error("You can't change your own role.");
  }

  await prisma.user.update({
    where: { id: parsed.userId },
    data: { role: parsed.role },
  });

  revalidatePath("/admin/staff");
}

const removeSchema = z.object({
  userId: z.string().min(1),
});

/** Revoke access by removing the account. Can't remove yourself. */
export async function removeStaffMember(formData: FormData) {
  const session = await requireAdminRoleSession();

  const parsed = removeSchema.parse({ userId: formData.get("userId") });

  if (parsed.userId === session.user.id) {
    throw new Error("You can't remove your own account.");
  }

  await prisma.user.delete({ where: { id: parsed.userId } });

  revalidatePath("/admin/staff");
}
