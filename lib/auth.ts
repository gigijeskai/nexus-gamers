// =============================================================================
// Nexus — lib/auth.ts
// Utility per ottenere l'utente corrente dalla sessione Auth.js.
// Sostituisce tutti i TEST_CURRENT_USER_ID hardcoded nel progetto.
//
// Utilizzo nei Server Components e Server Actions:
//   const user = await getCurrentUser();
//   if (!user) redirect("/login");
// =============================================================================

import { auth } from "@/auth";
import { redirect } from "next/navigation";

// ── getCurrentUser ────────────────────────────────────────────────────────────
// Ritorna l'oggetto sessione utente o null se non autenticato.
// Non fa redirect — lascia al chiamante la decisione.
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// ── requireUser ───────────────────────────────────────────────────────────────
// Come getCurrentUser ma fa redirect se l'utente non è autenticato.
// Usa questa nei Server Components dove l'utente DEVE essere loggato.
// Il middleware è la prima linea di difesa, questa è la seconda.
export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user;
}

// ── getCurrentUserId ──────────────────────────────────────────────────────────
// Shorthand per ottenere solo l'ID. Usata nelle Server Actions.
// Lancia redirect se non autenticato — mai fidarsi dell'ID che arriva dal client.
export async function getCurrentUserId(): Promise<string> {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return session.user.id;
}