"use server";

// =============================================================================
// Nexus — lib/actions/onboarding.ts
// Server Action: completeOnboarding(tag)
//
// Sicurezza:
//   - L'userId viene sempre dalla sessione server (getCurrentUserId),
//     mai da un parametro passato dal client.
//   - La verifica di unicità è CASE-INSENSITIVE: "Shadow" e "shadow" sono uguali.
//   - Il check esclude l'utente stesso, così ricaricare la pagina non dà errore.
//
// Revalidation:
//   - Invalida navbar, sidebar e tutte le pagine del dashboard
//     così il nuovo tag appare immediatamente senza logout/reload manuale.
// =============================================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";

// ── Return type ───────────────────────────────────────────────────────────────
type Result =
  | { success: true; username: string; nexusTag: string }
  | { success: false; error: string; code: "INVALID_FORMAT" | "TAKEN" | "UNKNOWN" };

// ── Validazione formato ───────────────────────────────────────────────────────
function validateTag(raw: string): string | null {
  const t = raw.trim();
  if (t.length < 3)  return "Minimum 3 characters.";
  if (t.length > 20) return "Maximum 20 characters.";
  if (!/^[a-zA-Z0-9_]+$/.test(t))
    return "Only letters, numbers and underscore (_) are allowed.";
  return null;
}

// ── Server Action ─────────────────────────────────────────────────────────────
export async function completeOnboarding(tag: string): Promise<Result> {
  // 1. Legge l'ID dalla sessione server — il client non può falsificarlo
  const userId = await getCurrentUserId();

  // 2. Valida formato
  const formatError = validateTag(tag);
  if (formatError) {
    return { success: false, error: formatError, code: "INVALID_FORMAT" };
  }

  const clean = tag.trim().toLowerCase();

  // 3. Controllo unicità case-insensitive
  //    Esclude l'utente stesso → ricaricare la pagina non genera falso positivo
  const taken = await prisma.user.findFirst({
    where: {
      username: { equals: clean, mode: "insensitive" },
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (taken) {
    return {
      success: false,
      error: "This tag is already taken. Try another one.",
      code: "TAKEN",
    };
  }

  // 4. Genera nexusTag con suffisso numerico (stile Discord)
  //    Garantisce che due utenti con username identico abbiano tag distinti:
  //    "shadow#4291" vs "shadow#7823"
  const suffix   = Math.floor(1000 + Math.random() * 9000);
  const nexusTag = `${clean}#${suffix}`;

  // 5. Aggiorna il profilo
  try {
    await prisma.user.update({
      where: { id: userId },
      data:  { username: clean, nexusTag },
    });
  } catch {
    return {
      success: false,
      error: "Something went wrong. Please try again.",
      code: "UNKNOWN",
    };
  }

  // 6. Revalidation — aggiorna tutte le superfici che mostrano username/nexusTag
  //    senza costringere l'utente a fare logout/login.
  //    "/" invalida il root layout
  //    "/dashboard" invalida navbar, sidebar, tutti i componenti figli
  //    "/onboarding" resetta la pagina stessa
  revalidatePath("/", "layout");          // root layout (se esiste)
  revalidatePath("/dashboard", "layout"); // dashboard layout → navbar + sidebar
  revalidatePath("/dashboard");
  revalidatePath("/onboarding");

  return { success: true, username: clean, nexusTag };
}