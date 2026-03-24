// =============================================================================
// Nexus — lib/db/prisma.ts
// Singleton PrismaClient con adapter PrismaPg (obbligatorio in Prisma 7)
// =============================================================================

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// In sviluppo Next.js ricarica i moduli ad ogni hot-reload.
// Senza il singleton finiresti con decine di pool aperti contemporaneamente.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}