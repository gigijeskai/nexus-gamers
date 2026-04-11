// =============================================================================
// Nexus — components/layout/SidebarFriends.tsx
// Server Component — riceve userId dalla sessione reale (passato dal layout).
// =============================================================================

import Link from "next/link";
import { getFriendships, Friendship } from "@/lib/db/queries";

type Props = { userId: string };

function resolveFriend(f: Friendship, myId: string) {
  return f.requesterId === myId ? f.addressee : f.requester;
}

const STATUS = {
  ONLINE:  { color: "bg-emerald-400", shadow: "shadow-[0_0_5px_theme(colors.emerald.400)]", pulse: true  },
  IN_GAME: { color: "bg-purple-400",  shadow: "shadow-[0_0_5px_theme(colors.purple.400)]",  pulse: true  },
  AWAY:    { color: "bg-amber-400",   shadow: "",                                            pulse: false },
  OFFLINE: { color: "bg-slate-600",   shadow: "",                                            pulse: false },
} as const;

type Friend = ReturnType<typeof resolveFriend>;

function FriendRow({ friend }: { friend: Friend }) {
  const statusKey = (friend.status?.status ?? "OFFLINE") as keyof typeof STATUS;
  const s = STATUS[statusKey] ?? STATUS.OFFLINE;
  const initials = friend.username.slice(0, 2).toUpperCase();
  const isOffline = statusKey === "OFFLINE";

  return (
    <Link href={`/dashboard/profile/${friend.username}`}
      className={`group flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/70 transition-colors duration-150 ${isOffline ? "opacity-50 hover:opacity-70" : ""}`}>
      <div className="relative shrink-0">
        <div className="w-7 h-7 rounded-md overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
          {friend.avatarUrl
            ? <img src={friend.avatarUrl} alt={friend.username} className="w-full h-full object-cover" />
            : <span className="font-mono text-[9px] font-bold text-white/80">{initials}</span>
          }
        </div>
        <span className={`absolute -bottom-px -right-px w-2 h-2 rounded-full border border-slate-900 ${s.color} ${s.shadow} ${s.pulse ? "animate-pulse" : ""}`} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-slate-200 truncate leading-tight group-hover:text-white transition-colors">
          {friend.username}
        </p>
        <p className="font-mono text-[10px] leading-tight truncate">
          {friend.status?.currentGame
            ? <span className="text-purple-400">{friend.status.currentGame}</span>
            : <span className="text-slate-600">{isOffline ? "Offline" : "Online"}</span>
          }
        </p>
      </div>
    </Link>
  );
}

export async function SidebarFriends({ userId }: Props) {
  const friendships = await getFriendships(userId);
  const friends = friendships.map((f) => resolveFriend(f, userId));
  const online  = friends.filter((f) => f.status?.status !== "OFFLINE" && f.status?.status != null);
  const offline = friends.filter((f) => !f.status || f.status.status === "OFFLINE");

  return (
    <aside className="w-full flex flex-col">
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.15em]">Friends</span>
        {online.length > 0 && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            {online.length}
          </span>
        )}
      </div>

      {friends.length === 0 ? (
        <div className="px-2 py-4 text-center">
          <p className="font-mono text-xs text-slate-600">Nessun amico ancora.</p>
          <Link href="/dashboard/search" className="mt-1 inline-block font-mono text-[10px] text-purple-500 hover:text-purple-400 underline underline-offset-2 transition-colors">
            Cerca giocatori →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {online.map((f) => <FriendRow key={f.id} friend={f} />)}
          {online.length > 0 && offline.length > 0 && <div className="mx-2 my-1.5 h-px bg-slate-800" />}
          {offline.map((f) => <FriendRow key={f.id} friend={f} />)}
        </div>
      )}

      {friends.length > 0 && (
        <Link href="/dashboard/friends"
          className="mt-3 mx-2 py-1.5 text-center font-mono text-[10px] text-slate-600 hover:text-slate-400 border border-slate-800 hover:border-slate-700 rounded-lg transition-all duration-150">
          Vedi tutti ({friends.length})
        </Link>
      )}
    </aside>
  );
}