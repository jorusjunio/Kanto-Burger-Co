import { prisma } from "@/server/db/prisma";
import { logger } from "@/lib/logger";

/** All staff/admin accounts, newest first — the team roster. */
export async function getStaffMembers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  } catch (error) {
    logger.error("Failed to fetch staff members", error);
    throw new Error("Unable to load staff. Please try again.");
  }
}
