// =============================================================================
// Nexus — auth.config.ts
// Configurazione Auth.js EDGE-COMPATIBLE.
// Nessun import da Prisma, pg, crypto o qualsiasi modulo Node.js.
// Questo file è importato dal middleware.ts che gira nell'Edge Runtime.
// =============================================================================

import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

export const authConfig = {
  providers: [
    // GitHub non ha dipendenze Node.js — è solo configurazione
    GitHub,
  ],

  pages: {
    signIn: "/login",
    error:  "/login?error=true",
  },

  callbacks: {
    // authorized() viene chiamato nel middleware per ogni request protetta.
    // Riceve solo token/session — nessuna query al DB, Edge-safe.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn   = !!auth?.user;
      const isDashboard  = nextUrl.pathname.startsWith("/dashboard");

      if (isDashboard) {
        if (isLoggedIn) return true;          // ha la sessione → ok
        return false;                          // non loggato → redirect a /login
      }

      return true; // tutte le altre route sono pubbliche
    },
  },
} satisfies NextAuthConfig;