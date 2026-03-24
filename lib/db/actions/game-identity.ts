// =============================================================================
// Nexus — lib/actions/game-identity.ts
// Server Actions — girano sul server, mai esposte al client
// =============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

// ─── Tipi ─────────────────────────────────────────────────────────────────────

export type LinkGameAccountState = {
  success: boolean;
  error?: string;
  fieldError?: {
    platform?: string;
    platformUsername?: string;
  };
};

// ─── Action ───────────────────────────────────────────────────────────────────

export async function linkGameAccount(
  userId: string,
  prevState: LinkGameAccountState,
  formData: FormData
): Promise<LinkGameAccountState> {

  // ── 1. Estrai i dati dal form ──────────────────────────────────────────────
  const rawPlatform = formData.get("platform")?.toString().trim();
  const platformUsername = formData.get("platformUsername")?.toString().trim();

  // ── 2. Validazione ────────────────────────────────────────────────────────
  const fieldError: LinkGameAccountState["fieldError"] = {};

  if (!rawPlatform || !(rawPlatform in Platform)) {
    fieldError.platform = "Seleziona una piattaforma valida.";
  }

  if (!platformUsername || platformUsername.length < 2) {
    fieldError.platformUsername = "Il nickname deve avere almeno 2 caratteri.";
  }

  if (platformUsername && platformUsername.length > 64) {
    fieldError.platformUsername = "Il nickname non può superare i 64 caratteri.";
  }

  if (Object.keys(fieldError).length > 0) {
    return { success: false, fieldError };
  }

  const platform = rawPlatform as Platform;

  // ── 3. Salva nel DB ───────────────────────────────────────────────────────
  try {
    await prisma.gameIdentity.create({
      data: {
        userId,
        platform,
        platformUsername: platformUsername!,
      },
    });

    // ── 4. Invalida la cache della dashboard ─────────────────────────────────
    revalidatePath("/dashboard");

    return { success: true };

  } catch (error: unknown) {
    // Prisma lancia questo codice quando viola un @@unique
    // Nel nostro caso: stesso utente + stessa piattaforma
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: `Hai già collegato un account ${platform.toLowerCase()}. Rimuovilo prima di aggiungerne un altro.`,
      };
    }

    console.error("[linkGameAccount]", error);
    return {
      success: false,
      error: "Errore interno. Riprova tra qualche secondo.",
    };
  }
}