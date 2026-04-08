// =============================================================================
// Nexus — types/next-auth.d.ts
// Estende i tipi di Auth.js per includere i campi custom che aggiungiamo
// nell'oggetto sessione (username, nexusTag, avatarUrl).
// Senza questo file TypeScript non riconosce session.user.username etc.
// =============================================================================

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:        string;
      username:  string;
      nexusTag:  string;
      avatarUrl?: string;
    } & DefaultSession["user"]; // mantiene email, name, image di default
  }
}