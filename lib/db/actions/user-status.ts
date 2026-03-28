"use server" // Fondamentale: dice a Next.js che questo codice gira SOLO sul server (sicuro)
import { prisma } from "@/lib/db/prisma"; // Il nostro traduttore per il DB
import { revalidatePath } from "next/cache"; // Il comando per dire alla UI di aggiornarsi

export async function updateCurrentGame(userId: string, gameName: string) {
  // 1. Chiediamo a Prisma di aggiornare la tabella userStatus
  try {
  await prisma.userStatus.update({
    
    where: { userId: userId }, // "Trova la riga dove l'ID utente è questo"
    data: { 
      currentGame: gameName,   // "Cambia il nome del gioco"
      status: gameName ? "IN_GAME" : "OFFLINE"        // "Imposta lo stato su IN_GAME"
    }
  });

  // 2. Diciamo a Next.js di rinfrescare la dashboard
  revalidatePath("/dashboard");
  return { success: true };
  } catch (error) {
    return { success: false, error: "Impossibile aggiornare lo stato di gioco" };
  }
}