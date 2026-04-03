"use client";

// =============================================================================
// Nexus — components/friends/FriendActions.tsx
// Client Component — useTransition per i bottoni Accept / Reject
// Separato dalla pagina padre che rimane Server Component
// =============================================================================

import { useTransition } from "react";
import { acceptFriendRequest, rejectFriendRequest } from "@/lib/actions/friendship";

type Props = {
  friendshipId: string;
  currentUserId: string;
};

export function FriendActions({ friendshipId, currentUserId }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      await acceptFriendRequest(friendshipId, currentUserId);
      // revalidatePath è chiamato dentro acceptFriendRequest —
      // la pagina si aggiorna automaticamente senza codice aggiuntivo qui
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectFriendRequest(friendshipId, currentUserId);
    });
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="
          px-3 py-1.5 rounded-xl
          border border-emerald-500/40 text-emerald-400
          hover:bg-emerald-500/10 hover:border-emerald-500/60
          font-mono text-xs font-semibold
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {isPending ? "..." : "Accetta"}
      </button>

      <button
        onClick={handleReject}
        disabled={isPending}
        className="
          px-3 py-1.5 rounded-xl
          border border-slate-700 text-slate-500
          hover:bg-slate-800 hover:text-slate-300 hover:border-slate-600
          font-mono text-xs font-semibold
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        Rifiuta
      </button>
    </div>
  );
}