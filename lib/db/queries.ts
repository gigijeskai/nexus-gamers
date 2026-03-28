// =============================================================================
// Nexus — lib/db/queries.ts
// =============================================================================

import { prisma } from "./prisma";

// Tipi inferiti direttamente da Prisma — nessuna ridefinizione manuale
export type UserWithStatus = Awaited<
  ReturnType<typeof getAllUsersWithStatus>
>[number];

export type UserSearchResult = Awaited<
  ReturnType<typeof searchUsersByTag>
>[number];

// ─── getAllUsersWithStatus ────────────────────────────────────────────────────
export async function getAllUsersWithStatus() {
  return prisma.user.findMany({
    include: {
      status: true,
      gameIdentities: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

// ─── searchUsersByTag ─────────────────────────────────────────────────────────
// Cerca utenti per nexusTag con match parziale case-insensitive.
// Porta già con sé lo stato della friendship con currentUserId,
// così il componente sa quale bottone mostrare senza query aggiuntive.
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
      status: {
        select: { status: true, currentGame: true },
      },
      // Friendship dove currentUser è il mittente (ha già mandato richiesta a questo utente)
      receivedFriendships: {
        where: { requesterId: currentUserId },
        select: { id: true, status: true },
      },
      // Friendship dove currentUser è il destinatario (questo utente gli ha mandato una richiesta)
      sentFriendships: {
        where: { addresseeId: currentUserId },
        select: { id: true, status: true },
      },
    },
    take: 20,
  });
}

// ─── getFriendshipStatus ──────────────────────────────────────────────────────
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