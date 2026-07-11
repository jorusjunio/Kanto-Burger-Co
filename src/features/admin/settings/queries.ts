import { prisma } from "@/server/db/prisma";

/**
 * Read the singleton store settings row, creating it with schema defaults on
 * first access — no seed step required.
 */
export function getStoreSettings() {
  return prisma.storeSettings.upsert({
    where: { id: "store" },
    update: {},
    create: { id: "store" },
  });
}
