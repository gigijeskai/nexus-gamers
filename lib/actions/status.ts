"use server";

// =============================================================================
// Nexus — lib/actions/status.ts
// Server Action: updateStatus
// Aggiorna lo stato di gioco dell'utente corrente nella tabella user_status.
// userId sempre dalla sessione — mai dal client.
// =============================================================================

import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { UserStatusType } from "@prisma/client";

export type UpdateStatusState = {
  success: boolean;
  currentGame?: string | null;
  error?: string;
};

export async function updateStatus(
  prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  // ID sempre dalla sessione server
  const userId = await getCurrentUserId();

  const currentGame = formData.get("currentGame")?.toString().trim() || null;

  // Se c'è un gioco → stato IN_GAME, altrimenti ONLINE
  const status: UserStatusType = currentGame ? "IN_GAME" : "ONLINE";

  try {
    await prisma.userStatus.upsert({
      where:  { userId },
      create: { userId, status, currentGame, lastSeen: new Date() },
      update: { status, currentGame, lastSeen: new Date() },
    });
  } catch {
    return { success: false, error: "Could not update status. Try again." };
  }

  // Invalida tutte le superfici che mostrano lo status
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/friends");

  return { success: true, currentGame };
}

// ── clearStatus ───────────────────────────────────────────────────────────────
// Riporta l'utente a ONLINE senza gioco corrente.
export async function clearStatus(_prevState?: UpdateStatusState): Promise<UpdateStatusState> {
  const userId = await getCurrentUserId();

  try {
    await prisma.userStatus.upsert({
      where:  { userId },
      create: { userId, status: "ONLINE", currentGame: null, lastSeen: new Date() },
      update: { status: "ONLINE", currentGame: null, lastSeen: new Date() },
    });
  } catch {
    return { success: false, error: "Could not clear status." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/friends");

  return { success: true, currentGame: null };
}