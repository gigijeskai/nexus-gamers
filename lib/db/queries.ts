// =============================================================================
// Nexus — lib/db/queries.ts
// =============================================================================

import { prisma } from "./prisma";

// ── Tipi inferiti ─────────────────────────────────────────────────────────────
export type UserWithStatus    = Awaited<ReturnType<typeof getAllUsersWithStatus>>[number];
export type UserSearchResult  = Awaited<ReturnType<typeof searchUsersByTag>>[number];
export type AcceptedFriendship = Awaited<ReturnType<typeof getAcceptedFriends>>[number];
export type PendingRequest    = Awaited<ReturnType<typeof getPendingRequests>>[number];
export type SentRequest       = Awaited<ReturnType<typeof getSentRequests>>[number];

// ── Select chirurgico riutilizzato in più query ───────────────────────────────
// Centralizzarlo qui garantisce coerenza e nessun campo sensibile viaggia
// per sbaglio (email, hash password se ci fosse, ecc.).
const FRIEND_USER_SELECT = {
  id:       true,
  username: true,
  nexusTag: true,
  avatarUrl: true,
  status: {
    select: {
      status:      true,
      currentGame: true,
      lastSeen:    true,
    },
  },
  gameIdentities: {
    select: {
      platform:         true,
      platformUsername: true,
    },
  },
} as const;

// =============================================================================
// getAcceptedFriends
// =============================================================================
// Recupera tutte le Friendship con status ACCEPTED dove userId è coinvolto,
// sia come mittente (requesterId) che come destinatario (addresseeId).
// OR copre entrambe le direzioni in una singola query.
// =============================================================================
export async function getAcceptedFriends(userId: string) {
  return prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId },
        { addresseeId: userId },
      ],
    },
    include: {
      requester: { select: FRIEND_USER_SELECT },
      addressee: { select: FRIEND_USER_SELECT },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// =============================================================================
// getPendingRequests — richieste IN ENTRATA (io sono l'addressee)
// =============================================================================
export async function getPendingRequests(userId: string) {
  return prisma.friendship.findMany({
    where: {
      addresseeId: userId,
      status: "PENDING",
    },
    include: {
      requester: { select: FRIEND_USER_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });
}

// =============================================================================
// getSentRequests — richieste che HO MANDATO IO (ancora in attesa)
// =============================================================================
export async function getSentRequests(userId: string) {
  return prisma.friendship.findMany({
    where: {
      requesterId: userId,
      status: "PENDING",
    },
    include: {
      addressee: { select: FRIEND_USER_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });
}

// =============================================================================
// getAllUsersWithStatus
// =============================================================================
export async function getAllUsersWithStatus() {
  return prisma.user.findMany({
    include: {
      status: true,
      gameIdentities: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

// =============================================================================
// searchUsersByTag
// =============================================================================
export async function searchUsersByTag(query: string, currentUserId: string) {
  if (!query || query.trim().length < 2) return [];

  return prisma.user.findMany({
    where: {
      nexusTag: { contains: query.trim(), mode: "insensitive" },
      NOT: { id: currentUserId },
    },
    select: {
      id: true,
      username: true,
      nexusTag: true,
      avatarUrl: true,
      status: { select: { status: true, currentGame: true } },
      receivedFriendships: {
        where: { requesterId: currentUserId },
        select: { id: true, status: true },
      },
      sentFriendships: {
        where: { addresseeId: currentUserId },
        select: { id: true, status: true },
      },
    },
    take: 20,
  });
}

// =============================================================================
// getFriendshipStatus
// =============================================================================
export async function getFriendshipStatus(userAId: string, userBId: string) {
  return prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: userAId, addresseeId: userBId },
        { requesterId: userBId, addresseeId: userAId },
      ],
    },
    select: { id: true, status: true, requesterId: true, addresseeId: true },
  });
}

// =============================================================================
// getPendingRequestCount
// =============================================================================
// Conta le richieste IN ENTRATA non ancora gestite.
// Usato dal NotificationBell per il badge rosso.
// count() restituisce un numero intero, zero overhead di oggetti.
// =============================================================================
export async function getPendingRequestCount(userId: string): Promise<number> {
  return prisma.friendship.count({
    where: {
      addresseeId: userId,
      status: "PENDING",
    },
  });
}

// =============================================================================
// getFriendships
// =============================================================================
// Alias semantico di getAcceptedFriends — richiesto esplicitamente dalla spec.
// Restituisce tutte le Friendship ACCEPTED dove userId è coinvolto in
// qualsiasi direzione, con i dati di entrambi gli utenti.
// =============================================================================
export async function getFriendships(userId: string) {
  return prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [
        { requesterId: userId },
        { addresseeId: userId },
      ],
    },
    include: {
      requester: { select: FRIEND_USER_SELECT },
      addressee: { select: FRIEND_USER_SELECT },
    },
    orderBy: { updatedAt: "desc" },
  });
}

// Tipo per getFriendships (stessa forma di AcceptedFriendship)
export type Friendship = Awaited<ReturnType<typeof getFriendships>>[number];