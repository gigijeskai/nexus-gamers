// =============================================================================
// Nexus — lib/session.ts
// Utility server-side per ottenere la sessione corrente.
// Sostituisce lib/auth.ts (che ora è la config di Better Auth).
// =============================================================================

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// ── getSession ────────────────────────────────────────────────────────────────
// Ritorna la sessione o null. Non fa redirect.
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

// ── requireSession ────────────────────────────────────────────────────────────
// Ritorna la sessione o redirecta a /login.
// Usa questa nei Server Components e layouts protetti.
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// ── getCurrentUserId ──────────────────────────────────────────────────────────
// Shorthand per ottenere solo l'ID nelle Server Actions.
export async function getCurrentUserId(): Promise<string> {
  const session = await getSession();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}