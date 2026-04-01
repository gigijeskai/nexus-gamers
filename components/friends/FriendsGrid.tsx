"use client";

// =============================================================================
// Nexus — components/friends/FriendsGrid.tsx
// Client Component — solo per la griglia e le azioni sui pending
// Il fetching rimane nel Server Component padre
// =============================================================================

import { AcceptedFriendship, PendingRequest, SentRequest } from "@/lib/db/queries";
import { acceptFriendRequest, rejectFriendRequest } from "@/lib/db/actions/friendship";
import { useTransition } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────
type Friend = AcceptedFriendship["requester"]; // stesso tipo per requester e addressee

const STATUS_CONFIG = {
  ONLINE:  { dot: "bg-emerald-400", glow: "shadow-[0_0_8px_rgba(52,211,153,.5)]",  text: "text-emerald-400", badge: "bg-emerald-400/10 border-emerald-400/20", pulse: true },
  IN_GAME: { dot: "bg-violet-400",  glow: "shadow-[0_0_8px_rgba(167,139,250,.6)]", text: "text-violet-400",  badge: "bg-violet-400/10 border-violet-400/20",   pulse: true },
  OFFLINE: { dot: "bg-zinc-600",    glow: "",                                       text: "text-zinc-500",    badge: "bg-zinc-600/10 border-zinc-700/40",        pulse: false },
  AWAY:    { dot: "bg-amber-400",   glow: "shadow-[0_0_8px_rgba(251,191,36,.4)]",  text: "text-amber-400",  badge: "bg-amber-400/10 border-amber-400/20",      pulse: false },
} as const;

// ── FriendCard accettato ──────────────────────────────────────────────────────
function AcceptedFriendCard({ friend }: { friend: Friend }) {
  const status = friend.status?.status ?? "OFFLINE";
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.OFFLINE;
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <article className="flex flex-col gap-3 p-4 bg-zinc-900/70 border border-zinc-800/60 rounded-2xl hover:border-zinc-700/60 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {friend.avatarUrl ? (
            <img src={friend.avatarUrl} alt={friend.username} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-white/90">{initials}</span>
            </div>
          )}
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${cfg.dot} ${cfg.glow} ${cfg.pulse ? "animate-pulse" : ""}`} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-white truncate">{friend.username}</p>
          <p className="font-mono text-xs text-zinc-500 truncate">{friend.nexusTag}</p>
        </div>

        <span className={`shrink-0 px-2 py-0.5 rounded-full border font-mono text-[10px] font-medium ${cfg.badge} ${cfg.text}`}>
          {status === "IN_GAME" ? "In Game" : status.charAt(0) + status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Gioco corrente */}
      <div className="h-6 flex items-center">
        {friend.status?.currentGame ? (
          <div className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className={`shrink-0 ${cfg.text}`}>
              <rect x="1" y="4" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1"/>
              <line x1="4" y1="6.5" x2="4" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <line x1="2.5" y1="7.75" x2="5.5" y2="7.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="10" cy="6.75" r=".75" fill="currentColor"/>
              <circle cx="9" cy="8.5" r=".75" fill="currentColor"/>
            </svg>
            <span className={`font-mono text-xs font-medium truncate ${cfg.text}`}>{friend.status.currentGame}</span>
          </div>
        ) : (
          <span className="font-mono text-xs text-zinc-600 italic">
            {status === "OFFLINE" ? "Last seen recently" : "Idle"}
          </span>
        )}
      </div>

      {/* Piattaforme */}
      {friend.gameIdentities.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-zinc-800/60">
          {friend.gameIdentities.map((gi, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 font-mono text-[9px] text-zinc-500 uppercase tracking-widest">
              {gi.platform.toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Pending card ──────────────────────────────────────────────────────────────
function PendingCard({
  friendship,
  currentUserId,
  direction,
}: {
  friendship: PendingRequest | SentRequest;
  currentUserId: string;
  direction: "incoming" | "sent";
}) {
  const [isPending, startTransition] = useTransition();

  const friend =
    direction === "incoming"
      ? (friendship as PendingRequest).requester
      : (friendship as SentRequest).addressee;

  const initials = friend.username.slice(0, 2).toUpperCase();

  function handleAccept() {
    startTransition(async () => {
      await acceptFriendRequest(friendship.id, currentUserId);
    });
  }

  function handleReject() {
    startTransition(async () => {
      await rejectFriendRequest(friendship.id, currentUserId);
    });
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/70 border border-zinc-800/60 rounded-2xl">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center shrink-0">
        {friend.avatarUrl ? (
          <img src={friend.avatarUrl} alt={friend.username} className="w-9 h-9 rounded-xl object-cover" />
        ) : (
          <span className="font-mono text-xs font-bold text-zinc-300">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-white truncate">{friend.username}</p>
        <p className="font-mono text-xs text-zinc-500 truncate">{friend.nexusTag}</p>
      </div>

      {/* Azioni */}
      {direction === "incoming" ? (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleAccept}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-400 font-mono text-xs font-semibold hover:bg-emerald-400/10 transition-colors disabled:opacity-50"
          >
            {isPending ? "..." : "Accept"}
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-500 font-mono text-xs font-semibold hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      ) : (
        <span className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
          Pending
        </span>
      )}
    </div>
  );
}

// ── FriendsGrid (exported) ────────────────────────────────────────────────────
export function FriendsGrid({
  friends,
  filter,
}: {
  friends: Friend[];
  filter: "all" | "online";
}) {
  const filtered =
    filter === "online"
      ? friends.filter((f) => f.status?.status === "ONLINE" || f.status?.status === "IN_GAME")
      : friends;

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none" className="text-zinc-600">
            <rect x="2" y="8" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="8" y1="13" x2="8" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="5.5" y1="15.5" x2="10.5" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="19" cy="13.5" r="1.5" fill="currentColor"/>
            <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <p className="font-mono text-zinc-500 text-sm">
          {filter === "online" ? "No friends online right now." : "No friends yet."}
        </p>
        <p className="font-mono text-zinc-700 text-xs mt-1">
          {filter === "online" ? "Check back later." : "Search for players to add."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {filtered.map((f) => (
        <AcceptedFriendCard key={f.id} friend={f} />
      ))}
    </div>
  );
}

// ── PendingList (exported) ────────────────────────────────────────────────────
export function PendingList({
  incoming,
  sent,
  currentUserId,
}: {
  incoming: PendingRequest[];
  sent: SentRequest[];
  currentUserId: string;
}) {
  if (incoming.length === 0 && sent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="font-mono text-zinc-500 text-sm">No pending requests.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Richieste in entrata */}
      {incoming.length > 0 && (
        <section>
          <h3 className="font-mono text-xs text-zinc-400 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" />
            Incoming ({incoming.length})
          </h3>
          <div className="flex flex-col gap-2">
            {incoming.map((f) => (
              <PendingCard
                key={f.id}
                friendship={f}
                currentUserId={currentUserId}
                direction="incoming"
              />
            ))}
          </div>
        </section>
      )}

      {/* Richieste inviate */}
      {sent.length > 0 && (
        <section>
          <h3 className="font-mono text-xs text-zinc-500 uppercase tracking-[0.15em] mb-3">
            Sent ({sent.length})
          </h3>
          <div className="flex flex-col gap-2">
            {sent.map((f) => (
              <PendingCard
                key={f.id}
                friendship={f}
                currentUserId={currentUserId}
                direction="sent"
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}