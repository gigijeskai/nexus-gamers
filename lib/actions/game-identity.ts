"use server";

// =============================================================================
// Nexus — lib/actions/game-identity.ts
// userId letto dalla sessione — mai passato come prop dal client.
// =============================================================================

import { revalidatePath } from "next/cache";
import { Platform } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUserId } from "@/lib/session";

export type LinkGameAccountState = {
  success: boolean;
  error?: string;
  fieldError?: {
    platform?: string;
    platformUsername?: string;
  };
};

export async function linkGameAccount(
  prevState: LinkGameAccountState,
  formData: FormData
): Promise<LinkGameAccountState> {
  // ID dalla sessione — il client non può falsificarlo
  const userId = await getCurrentUserId();

  const rawPlatform      = formData.get("platform")?.toString().trim();
  const platformUsername = formData.get("platformUsername")?.toString().trim();

  const fieldError: LinkGameAccountState["fieldError"] = {};

  if (!rawPlatform || !(rawPlatform in Platform)) {
    fieldError.platform = "Select a valid platform.";
  }
  if (!platformUsername || platformUsername.length < 2) {
    fieldError.platformUsername = "Username must be at least 2 characters.";
  }
  if (platformUsername && platformUsername.length > 64) {
    fieldError.platformUsername = "Username cannot exceed 64 characters.";
  }
  if (Object.keys(fieldError).length > 0) {
    return { success: false, fieldError };
  }

  const platform = rawPlatform as Platform;

  try {
    await prisma.gameIdentity.create({
      data: { userId, platform, platformUsername: platformUsername! },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/profile`);

    return { success: true };
  } catch (error: unknown) {
    if (
      typeof error === "object" && error !== null &&
      "code" in error && (error as { code: string }).code === "P2002"
    ) {
      return {
        success: false,
        error: `You already have a ${platform.toLowerCase()} account linked. Remove it first.`,
      };
    }
    return { success: false, error: "Internal error. Please try again." };
  }
}

// ── removeGameAccount ─────────────────────────────────────────────────────────
export async function removeGameAccount(
  identityId: string
): Promise<{ success: boolean; error?: string }> {
  const userId = await getCurrentUserId();

  try {
    // Verifica che la game identity appartenga all'utente corrente
    const identity = await prisma.gameIdentity.findUnique({
      where: { id: identityId },
      select: { userId: true },
    });

    if (!identity || identity.userId !== userId) {
      return { success: false, error: "Not authorized." };
    }

    await prisma.gameIdentity.delete({ where: { id: identityId } });
    revalidatePath("/dashboard/profile");

    return { success: true };
  } catch {
    return { success: false, error: "Could not remove account." };
  }
}