// =============================================================================
// Nexus — lib/auth-client.ts
// Better Auth client-side SDK.
// Importa questo file nei Client Components ("use client").
// NON importare nei Server Components — usa lib/session.ts invece.
// =============================================================================

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;