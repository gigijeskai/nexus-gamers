// =============================================================================
// Nexus — lib/db/queries.ts
// =============================================================================

import { prisma } from "./prisma";

// Tipo inferito direttamente da Prisma — nessuna ridefinizione manuale
export type UserWithStatus = Awaited<
  ReturnType<typeof getAllUsersWithStatus>
>[number];

export async function getAllUsersWithStatus() {
  return prisma.user.findMany({
    include: {
      status: true,
      gameIdentities: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
