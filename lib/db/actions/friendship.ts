// =============================================================================
// Nexus — lib/actions/friendship.ts
// Server Actions per la gestione delle amicizie
// =============================================================================

"use server";

import { prisma } from "@/lib/db/prisma";
import { FriendshipStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ─── Tipi di ritorno ──────────────────────────────────────────────────────────
type ActionResult =
  | { success: true; data: unknown }
  | { success: false; error: string; code: ErrorCode; friendshipId?: string };

type ErrorCode =
  | "ALREADY_EXISTS"       // richiesta già inviata nella stessa direzione (A→B esiste, A riprova)
  | "ALREADY_FRIENDS"      // sono già amici
  | "PENDING_INCOMING"     // l'altro ha già mandato una richiesta a te — accetta o rifiuta quella
  | "SELF_REQUEST"         // un utente ha provato ad aggiungersi da solo
  | "NOT_FOUND"            // la friendship non esiste
  | "FORBIDDEN"            // l'utente non è il destinatario della richiesta
  | "UNKNOWN";

// =============================================================================
// sendFriendRequest
// =============================================================================
// Crea una nuova richiesta d'amicizia da senderId verso receiverId.
//
// Prisma gestisce il collegamento così:
//   - crea una riga in `friendships` con requesterId=senderId, addresseeId=receiverId
//   - i due FK puntano entrambi alla tabella `users`, ma con nomi diversi
//     ("FriendshipRequester" e "FriendshipAddressee")
//   - il vincolo @@unique([requesterId, addresseeId]) impedisce duplicati
//     nella stessa direzione — ma NON impedisce la direzione inversa,
//     quindi gestiamo noi il caso "già amici" con una query preventiva
// =============================================================================

export async function sendFriendRequest(
  senderId: string,
  receiverId: string
): Promise<ActionResult> {

  // ── Validazione base ────────────────────────────────────────────────────────
  if (senderId === receiverId) {
    return {
      success: false,
      error: "Non puoi inviare una richiesta d'amicizia a te stesso.",
      code: "SELF_REQUEST",
    };
  }

  try {
    // ── Controlla se esiste già una relazione in qualsiasi direzione ──────────
    // Dobbiamo cercare ENTRAMBE le direzioni perché il vincolo @@unique
    // copre solo (requesterId, addresseeId) — non la coppia inversa.
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId: senderId,   addresseeId: receiverId },
          { requesterId: receiverId, addresseeId: senderId   },
        ],
      },
    });

    if (existing) {
      // Caso 1: già amici
      if (existing.status === FriendshipStatus.ACCEPTED) {
        return {
          success: false,
          error: "Siete già amici.",
          code: "ALREADY_FRIENDS",
        };
      }

      // Caso 2: richiesta pending in arrivo da receiver verso sender
      // B prova ad aggiungere A, ma A ha già mandato una richiesta a B
      // → segnaliamo a B che ha già una richiesta in entrata da accettare o rifiutare
      if (
        existing.status === FriendshipStatus.PENDING &&
        existing.requesterId === receiverId &&
        existing.addresseeId === senderId
      ) {
        return {
          success: false,
          error: "Questo utente ti ha già inviato una richiesta d'amicizia. Accettala o rifiutala.",
          code: "PENDING_INCOMING",
          friendshipId: existing.id, // il frontend usa questo per mostrare Accetta/Rifiuta
        };
      }

      // Caso 3: richiesta pending nella stessa direzione (A riprova a mandare ad A→B)
      // oppure status BLOCKED — in entrambi i casi blocchiamo
      return {
        success: false,
        error: "Esiste già una richiesta d'amicizia tra questi due utenti.",
        code: "ALREADY_EXISTS",
      };
    }

    // ── Crea la richiesta ─────────────────────────────────────────────────────
    const friendship = await prisma.friendship.create({
      data: {
        requesterId: senderId,
        addresseeId: receiverId,
        status: FriendshipStatus.PENDING,
      },
      // Include i dati degli utenti collegati nella risposta
      include: {
        requester: {
          select: { id: true, username: true, nexusTag: true },
        },
        addressee: {
          select: { id: true, username: true, nexusTag: true },
        },
      },
    });

    // ── Crea la notifica per il destinatario ──────────────────────────────────
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: "FRIEND_REQUEST",
        payload: {
          friendshipId: friendship.id,
          fromUserId:   senderId,
          fromUsername: friendship.requester.username,
          fromNexusTag: friendship.requester.nexusTag,
        },
      },
    });

    // Invalida la cache della dashboard così i dati si aggiornano
    revalidatePath("/dashboard");
    revalidatePath("/friends");

    return { success: true, data: friendship };

  } catch (error) {
    // Prisma lancia P2002 se viola un unique constraint
    // (fallback nel caso la nostra check preventiva abbia una race condition)
    if (isPrismaUniqueError(error)) {
      return {
        success: false,
        error: "Richiesta già inviata.",
        code: "ALREADY_EXISTS",
      };
    }

    console.error("[sendFriendRequest]", error);
    return {
      success: false,
      error: "Errore imprevisto. Riprova più tardi.",
      code: "UNKNOWN",
    };
  }
}

// =============================================================================
// acceptFriendRequest
// =============================================================================
// Cambia lo status di una friendship da PENDING → ACCEPTED.
//
// Prisma usa `update` con `where: { id }` per trovare la riga esatta.
// Passiamo anche `addresseeId` nel where per sicurezza: solo il destinatario
// può accettare — se l'ID non corrisponde Prisma non trova la riga e lancia
// un errore P2025 (record not found), che gestiamo come FORBIDDEN.
// =============================================================================

export async function acceptFriendRequest(
  friendshipId: string,
  currentUserId: string  // chi sta accettando — deve essere l'addressee
): Promise<ActionResult> {

  try {
    const friendship = await prisma.friendship.update({
      where: {
        id: friendshipId,
        addresseeId: currentUserId,      // ← sicurezza: solo il destinatario può accettare
        status: FriendshipStatus.PENDING, // ← accetta solo se ancora in attesa
      },
      data: {
        status: FriendshipStatus.ACCEPTED,
      },
      include: {
        requester: {
          select: { id: true, username: true, nexusTag: true },
        },
        addressee: {
          select: { id: true, username: true, nexusTag: true },
        },
      },
    });

    // ── Notifica chi aveva inviato la richiesta ────────────────────────────────
    await prisma.notification.create({
      data: {
        userId: friendship.requesterId,
        type: "FRIEND_ACCEPTED",
        payload: {
          friendshipId:  friendship.id,
          fromUserId:    currentUserId,
          fromUsername:  friendship.addressee.username,
          fromNexusTag:  friendship.addressee.nexusTag,
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/friends");

    return { success: true, data: friendship };

  } catch (error) {
    // P2025 = record non trovato → o l'ID è sbagliato o currentUserId non è l'addressee
    if (isPrismaNotFoundError(error)) {
      return {
        success: false,
        error: "Richiesta non trovata o non sei autorizzato ad accettarla.",
        code: "FORBIDDEN",
      };
    }

    console.error("[acceptFriendRequest]", error);
    return {
      success: false,
      error: "Errore imprevisto. Riprova più tardi.",
      code: "UNKNOWN",
    };
  }
}

// =============================================================================
// rejectFriendRequest
// =============================================================================
// Elimina la richiesta. Non cambia lo status — la riga sparisce del tutto.
// Stesso pattern di sicurezza: solo l'addressee può rifiutare.
// =============================================================================

export async function rejectFriendRequest(
  friendshipId: string,
  currentUserId: string
): Promise<ActionResult> {

  try {
    const friendship = await prisma.friendship.delete({
      where: {
        id: friendshipId,
        addresseeId: currentUserId,
        status: FriendshipStatus.PENDING,
      },
    });

    revalidatePath("/friends");

    return { success: true, data: friendship };

  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return {
        success: false,
        error: "Richiesta non trovata o non sei autorizzato.",
        code: "FORBIDDEN",
      };
    }

    console.error("[rejectFriendRequest]", error);
    return { success: false, error: "Errore imprevisto.", code: "UNKNOWN" };
  }
}

// =============================================================================
// Possibilita' di estensione futura: cancellare una richiesta inviata (se è ancora pending)
// =============================================================================

export async function cancelFriendRequest(
  friendshipId: string,
  currentUserId: string  // deve essere il requester, non l'addressee
): Promise<ActionResult> {
  try {
    const friendship = await prisma.friendship.delete({
      where: {
        id: friendshipId,
        requesterId: currentUserId,        // ← solo chi ha inviato può annullare
        status: FriendshipStatus.PENDING,  // ← solo se ancora in attesa
      },
    });

    revalidatePath("/friends");
    return { success: true, data: friendship };

  } catch (error) {
    if (isPrismaNotFoundError(error)) {
      return {
        success: false,
        error: "Richiesta non trovata o non sei autorizzato ad annullarla.",
        code: "FORBIDDEN",
      };
    }
    console.error("[cancelFriendRequest]", error);
    return { success: false, error: "Errore imprevisto.", code: "UNKNOWN" };
  }
}
// =============================================================================
// Helpers — type guard per gli errori Prisma
// =============================================================================

function isPrismaUniqueError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

function isPrismaNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2025"
  );
}