// =============================================================================
// Nexus — auth.ts
// Configurazione Auth.js per il SERVER (Node.js runtime).
// Usa PrismaAdapter → richiede Node.js → NON può girare nell'Edge Runtime.
// Importa questo file solo in Server Components, Server Actions, Route Handlers.
// Per il middleware usa invece auth.config.ts (Edge-compatible).
// =============================================================================

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,                        // eredita provider, pages, callbacks base
  adapter: PrismaAdapter(prisma),       // solo qui — non nell'edge config
  session: { strategy: "database" },   // sessione nel DB, non JWT

  callbacks: {
    // Estende il callback base di authConfig aggiungendo i dati Nexus
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        const nexusUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { username: true, nexusTag: true, avatarUrl: true },
        });

        if (nexusUser) {
          session.user.username  = nexusUser.username;
          session.user.nexusTag  = nexusUser.nexusTag;
          session.user.avatarUrl = nexusUser.avatarUrl ?? undefined;
        }
      }
      return session;
    },
  },

  events: {
    // Al primo login OAuth, crea username/nexusTag/UserStatus automaticamente
    async createUser({ user }) {
      if (!user.id || !user.name) return;

      const base = (user.name ?? user.email ?? "gamer")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 16) || "gamer";

      const suffix   = Math.floor(1000 + Math.random() * 9000);
      const username = `${base}${suffix}`;
      const nexusTag = `${username}#${suffix}`;

      await Promise.all([
        prisma.user.update({
          where: { id: user.id },
          data: { username, nexusTag, avatarUrl: user.image ?? null },
        }),
        prisma.userStatus.create({
          data: { userId: user.id, status: "OFFLINE", lastSeen: new Date() },
        }),
      ]);
    },
  },
});