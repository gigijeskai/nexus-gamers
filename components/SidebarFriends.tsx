// =============================================================================
// Nexus — components/SidebarFriends.tsx
// Server Component — nessun 'use client', fetch diretto da server
// =============================================================================

import Link from "next/link";
import { getAcceptedFriends } from "@/lib/db/queries";
import { AcceptedFriendship } from "@/lib/db/queries";

// ID utente di test — sostituire con la sessione reale
const TEST_USER_ID = "cfd7ca0f-c3fa-4393-88c5-989d63b4a20a";

// ── Helper: estrae l'amico dalla riga (chi dei due NON siamo noi) ─────────────
function getFriendFromRow(friendship: AcceptedFriendship, myId: string) {
  return friendship.requesterId === myId
    ? friendship.addressee
    : friendship.requester;
}

// ── Status dot config ─────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, { dot: string; pulse: boolean }> = {
  ONLINE:  { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.5)]", pulse: true },
  IN_GAME: { dot: "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,.5)]", pulse: true },
  OFFLINE: { dot: "bg-zinc-500", pulse: false },
  AWAY:    { dot: "bg-amber-400", pulse: false },
};

// ── Singola riga amico ────────────────────────────────────────────────────────
function FriendRow({ friend }: { friend: AcceptedFriendship["requester"] }) {
  const statusKey = friend.status?.status ?? "OFFLINE";
  const { dot, pulse } = STATUS_DOT[statusKey] ?? STATUS_DOT.OFFLINE;
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <Link
      href={`/profile/${friend.username}`}
      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-zinc-800/60 transition-colors duration-150 group"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.username}
            className="w-8 h-8 rounded-lg object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center">
            <span className="font-mono text-[10px] font-bold text-white/90">
              {initials}
            </span>
          </div>
        )}
        {/* Status dot */}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${dot} ${pulse ? "animate-pulse" : ""}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">
          {friend.username}
        </p>
        {friend.status?.currentGame ? (
          <p className="font-mono text-[10px] text-violet-400 truncate">
            {friend.status.currentGame}
          </p>
        ) : (
          <p className="font-mono text-[10px] text-zinc-600 truncate">
            {statusKey === "OFFLINE" ? "Offline" : "Online"}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── SidebarFriends (Server Component) ────────────────────────────────────────
export async function SidebarFriends() {
  const friendships = await getAcceptedFriends(TEST_USER_ID);

  // Separa online dagli offline per l'ordinamento visivo
  const friends = friendships.map((f) => getFriendFromRow(f, TEST_USER_ID));
  const online  = friends.filter((f) => f.status?.status !== "OFFLINE");
  const offline = friends.filter((f) => !f.status || f.status.status === "OFFLINE");

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-1 py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-3 mb-1">
        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-[0.15em]">
          Friends
        </span>
        <span className="font-mono text-[10px] text-zinc-600">
          {online.length} online
        </span>
      </div>

      {friends.length === 0 ? (
        <p className="px-3 font-mono text-xs text-zinc-600 italic">
          No friends yet — go search!
        </p>
      ) : (
        <>
          {/* Online / In Game */}
          {online.length > 0 && (
            <div className="flex flex-col gap-0.5">
              {online.map((f) => (
                <FriendRow key={f.id} friend={f} />
              ))}
            </div>
          )}

          {/* Divider tra online e offline */}
          {online.length > 0 && offline.length > 0 && (
            <div className="mx-3 my-1 h-px bg-zinc-800/80" />
          )}

          {/* Offline */}
          {offline.length > 0 && (
            <div className="flex flex-col gap-0.5 opacity-60">
              {offline.map((f) => (
                <FriendRow key={f.id} friend={f} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Link alla pagina completa */}
      <Link
        href="/dashboard/friends"
        className="mt-2 mx-3 py-1.5 font-mono text-[10px] text-zinc-600 hover:text-zinc-400 uppercase tracking-[0.15em] text-center border border-zinc-800/60 rounded-lg hover:border-zinc-700/60 transition-colors"
      >
        View all
      </Link>
    </aside>
  );
}