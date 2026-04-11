// =============================================================================
// Nexus — lib/auth.ts
// =============================================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db/prisma";

export const auth = betterAuth({
  advanced: {
    database: {
      generateId: "uuid",
    },
  },

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Dichiara i campi custom del model User a Better Auth.
  // Senza questo, auth.$Infer.Session.user non include username/nexusTag/avatarUrl.
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: false, // non accettato dall'utente in fase di signup
      },
      nexusTag: {
        type: "string",
        required: false,
        input: false,
        fieldName: "nexusTag", // nome del campo nel DB (camelCase → Prisma)
      },
      avatarUrl: {
        type: "string",
        required: false,
        input: false,
        fieldName: "avatarUrl",
      },
    },
  },

  socialProviders: {
    github: {
      clientId:     process.env.AUTH_GITHUB_ID     as string,
      clientSecret: process.env.AUTH_GITHUB_SECRET as string,
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    // cookieCache disabilitata: la cache conserva username=null per 5 minuti
    // dopo l'onboarding, causando un loop /onboarding → /dashboard → /onboarding.
    // Senza cache, ogni request legge la sessione aggiornata dal DB.
    cookieCache: { enabled: false },
  },

  plugins: [nextCookies()],
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
});

export type Session = typeof auth.$Infer.Session;

// Tipo utente con i campi custom inclusi
export type User = typeof auth.$Infer.Session.user;