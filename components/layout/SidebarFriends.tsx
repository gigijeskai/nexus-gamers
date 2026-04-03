// =============================================================================
// Nexus — components/layout/SidebarFriends.tsx
// Server Component — sidebar compatta per il layout dashboard
// =============================================================================

import Link from "next/link";
import { getFriendships, Friendship } from "@/lib/db/queries";

const TEST_USER_ID = "cfd7ca0f-c3fa-4393-88c5-989d63b4a20a";

// ── Logica core: chi è "l'amico" in questa riga? ────────────────────────────
// La Friendship row ha sempre due utenti: requester e addressee.
// "L'amico" è sempre quello che NON siamo noi.
function resolveFriend(friendship: Friendship, myId: string) {
  return friendship.requesterId === myId
    ? friendship.addressee  // ho mandato io → l'amico è il destinatario
    : friendship.requester; // ho ricevuto io → l'amico è il mittente
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  ONLINE:  { color: "bg-emerald-400", shadow: "shadow-[0_0_5px_theme(colors.emerald.400)]", label: "Online",   pulse: true  },
  IN_GAME: { color: "bg-purple-400",  shadow: "shadow-[0_0_5px_theme(colors.purple.400)]",  label: "In Game",  pulse: true  },
  AWAY:    { color: "bg-amber-400",   shadow: "",                                            label: "Away",     pulse: false },
  OFFLINE: { color: "bg-slate-600",   shadow: "",                                            label: "Offline",  pulse: false },
} as const;

type StatusKey = keyof typeof STATUS;

// ── Singola riga amico ────────────────────────────────────────────────────────
type Friend = ReturnType<typeof resolveFriend>;

function FriendRow({ friend }: { friend: Friend }) {
  const statusKey = (friend.status?.status ?? "OFFLINE") as StatusKey;
  const s = STATUS[statusKey] ?? STATUS.OFFLINE;
  const initials = friend.username.slice(0, 2).toUpperCase();
  const isOffline = statusKey === "OFFLINE";

  return (
    <Link
      href={`/profile/${friend.username}`}
      className={`
        group flex items-center gap-2.5 px-2 py-1.5 rounded-lg
        hover:bg-slate-800/70 transition-colors duration-150
        ${isOffline ? "opacity-50 hover:opacity-70" : ""}
      `}
    >
      {/* Avatar + dot */}
      <div className="relative shrink-0">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.username}
            className="w-7 h-7 rounded-md object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
            <span className="font-mono text-[9px] font-bold text-white/80">
              {initials}
            </span>
          </div>
        )}
        <span
          className={`
            absolute -bottom-px -right-px w-2 h-2 rounded-full
            border border-slate-900
            ${s.color} ${s.shadow}
            ${s.pulse ? "animate-pulse" : ""}
          `}
        />
      </div>

      {/* Testo */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-xs text-slate-200 truncate leading-tight group-hover:text-white transition-colors">
          {friend.username}
        </p>
        <p className="font-mono text-[10px] leading-tight truncate">
          {friend.status?.currentGame ? (
            <span className="text-purple-400">{friend.status.currentGame}</span>
          ) : (
            <span className="text-slate-600">{s.label}</span>
          )}
        </p>
      </div>
    </Link>
  );
}

// ── SidebarFriends (Server Component principale) ──────────────────────────────
export async function SidebarFriends() {
  const friendships = await getFriendships(TEST_USER_ID);

  // Estrai e risolvi gli amici
  const friends = friendships.map((f) => resolveFriend(f, TEST_USER_ID));

  // Ordina: online/in-game in cima, offline in fondo
  const online  = friends.filter((f) => f.status?.status !== "OFFLINE" && f.status?.status != null);
  const offline = friends.filter((f) => !f.status || f.status.status === "OFFLINE");

  return (
    <aside className="w-52 shrink-0 flex flex-col">
      {/* Header sezione */}
      <div className="flex items-center justify-between px-2 mb-2">
        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.15em]">
          Friends
        </span>
        {online.length > 0 && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            {online.length}
          </span>
        )}
      </div>

      {/* Lista */}
      {friends.length === 0 ? (
        <div className="px-2 py-4 text-center">
          <p className="font-mono text-xs text-slate-600 leading-relaxed">
            Nessun amico ancora.
          </p>
          <Link
            href="/search"
            className="mt-2 inline-block font-mono text-[10px] text-purple-500 hover:text-purple-400 underline underline-offset-2 transition-colors"
          >
            Cerca giocatori →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {/* Online prima */}
          {online.map((f) => (
            <FriendRow key={f.id} friend={f} />
          ))}

          {/* Separatore solo se ci sono entrambi */}
          {online.length > 0 && offline.length > 0 && (
            <div className="mx-2 my-1.5 h-px bg-slate-800" />
          )}

          {/* Offline dopo */}
          {offline.map((f) => (
            <FriendRow key={f.id} friend={f} />
          ))}
        </div>
      )}

      {/* Footer link */}
      {friends.length > 0 && (
        <Link
          href="/dashboard/friends"
          className="
            mt-3 mx-2 py-1.5 text-center
            font-mono text-[10px] text-slate-600 hover:text-slate-400
            border border-slate-800 hover:border-slate-700
            rounded-lg transition-all duration-150
          "
        >
          Vedi tutti ({friends.length})
        </Link>
      )}
    </aside>
  );
}