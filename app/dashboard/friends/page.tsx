// =============================================================================
// Nexus — app/dashboard/friends/page.tsx
// Server Component — tab via searchParams, fetch parallelo, zero waterfall
// =============================================================================

import Link from "next/link";
import {
  getFriendships,
  getPendingRequests,
  getSentRequests,
  Friendship,
  PendingRequest,
  SentRequest,
} from "@/lib/db/queries";
import { FriendActions } from "@/components/friends/FriendActions";
import { requireSession } from "@/lib/session";

type Tab = "online" | "all" | "pending";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

// ── Helper: risolve l'amico dalla riga Friendship ────────────────────────────
function resolveFriend(f: Friendship, myId: string) {
  return f.requesterId === myId ? f.addressee : f.requester;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  ONLINE:  { dot: "bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]", text: "text-emerald-400", label: "Online",  pulse: true  },
  IN_GAME: { dot: "bg-purple-400  shadow-[0_0_6px_theme(colors.purple.400)]",  text: "text-purple-400", label: "In Game", pulse: true  },
  AWAY:    { dot: "bg-amber-400",                                               text: "text-amber-400",  label: "Away",    pulse: false },
  OFFLINE: { dot: "bg-slate-600",                                               text: "text-slate-500",  label: "Offline", pulse: false },
} as const;

// ── Tab link ──────────────────────────────────────────────────────────────────
function TabButton({
  href,
  label,
  count,
  active,
  alert,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-4 py-2 rounded-xl
        font-mono text-xs font-semibold uppercase tracking-wider
        transition-all duration-200
        ${active
          ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
          : "text-slate-500 hover:text-slate-300 border border-transparent hover:bg-slate-800/60"}
      `}
    >
      {label}
      <span
        className={`
          inline-flex items-center justify-center
          min-w-[18px] h-[18px] px-1 rounded-full
          font-mono text-[9px] font-bold
          ${active
            ? "bg-purple-500/30 text-purple-200"
            : alert && count > 0
              ? "bg-red-500/80 text-white animate-pulse"
              : "bg-slate-800 text-slate-500"}
        `}
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}

// ── Griglia amici accettati ───────────────────────────────────────────────────
function FriendCard({ friend }: { friend: ReturnType<typeof resolveFriend> }) {
  const statusKey = (friend.status?.status ?? "OFFLINE") as keyof typeof STATUS;
  const s = STATUS[statusKey] ?? STATUS.OFFLINE;
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <article className="
      flex flex-col gap-3 p-4
      bg-slate-900/80 border border-slate-800/60 rounded-2xl
      hover:border-purple-500/30 hover:bg-slate-900
      hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(168,85,247,.07)]
      transition-all duration-200
    ">
      {/* Avatar + stato */}
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          {friend.avatarUrl ? (
            <img src={friend.avatarUrl} alt={friend.username} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              <span className="font-mono text-xs font-bold text-white/90">{initials}</span>
            </div>
          )}
          <span
            className={`
              absolute -bottom-px -right-px w-3 h-3 rounded-full
              border-2 border-slate-900
              ${s.dot} ${s.pulse ? "animate-pulse" : ""}
            `}
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-white truncate">{friend.username}</p>
          <p className="font-mono text-[11px] text-slate-500 truncate">{friend.nexusTag}</p>
        </div>
      </div>

      {/* Gioco corrente */}
      <div className="flex items-center gap-2 h-5">
        {friend.status?.currentGame ? (
          <>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className={`shrink-0 ${s.text}`}>
              <rect x="1" y="4" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1"/>
              <line x1="4" y1="6.5" x2="4" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <line x1="2.5" y1="7.75" x2="5.5" y2="7.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
              <circle cx="10" cy="6.75" r=".75" fill="currentColor"/>
              <circle cx="9" cy="8.5" r=".75" fill="currentColor"/>
            </svg>
            <span className={`font-mono text-xs truncate ${s.text}`}>{friend.status.currentGame}</span>
          </>
        ) : (
          <span className="font-mono text-xs text-slate-600 italic">{s.label}</span>
        )}
      </div>

      {/* Piattaforme */}
      {friend.gameIdentities.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
          {friend.gameIdentities.map((gi, i) => (
            <span key={i} className="px-1.5 py-px rounded bg-slate-800 border border-slate-700/50 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
              {gi.platform.toLowerCase()}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// ── Empty state generico ──────────────────────────────────────────────────────
function EmptyState({ message, cta }: { message: string; cta?: { label: string; href: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <p className="font-mono text-sm text-slate-500">{message}</p>
      {cta && (
        <Link href={cta.href} className="font-mono text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/60 px-4 py-2 rounded-xl transition-all duration-200">
          {cta.label}
        </Link>
      )}
    </div>
  );
}

// ── Tab: All / Online ─────────────────────────────────────────────────────────
function FriendsGrid({
  friendships,
  myId,
  filter,
}: {
  friendships: Friendship[];
  myId: string;
  filter: "all" | "online";
}) {
  let friends = friendships.map((f) => resolveFriend(f, myId));
  if (filter === "online") {
    friends = friends.filter(
      (f) => f.status?.status === "ONLINE" || f.status?.status === "IN_GAME"
    );
  }

  if (friends.length === 0) {
    return filter === "online" ? (
      <EmptyState message="Nessun amico online in questo momento." />
    ) : (
      <EmptyState
        message="Non hai ancora amici su Nexus."
        cta={{ label: "Cerca giocatori →", href: "/search" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {friends.map((f) => (
        <FriendCard key={f.id} friend={f} />
      ))}
    </div>
  );
}

// ── Tab: Pending ──────────────────────────────────────────────────────────────
function PendingSection({
  incoming,
  sent,
  myId,
}: {
  incoming: PendingRequest[];
  sent: SentRequest[];
  myId: string;
}) {
  if (incoming.length === 0 && sent.length === 0) {
    return <EmptyState message="Nessuna richiesta in attesa." />;
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Richieste in entrata */}
      {incoming.length > 0 && (
        <section>
          <h3 className="font-mono text-xs text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            Richieste ricevute ({incoming.length})
          </h3>
          <div className="flex flex-col gap-2">
            {incoming.map((f) => (
              <IncomingCard key={f.id} friendship={f} myId={myId} />
            ))}
          </div>
        </section>
      )}

      {/* Richieste inviate */}
      {sent.length > 0 && (
        <section>
          <h3 className="font-mono text-xs text-slate-600 uppercase tracking-[0.15em] mb-4">
            Richieste inviate ({sent.length})
          </h3>
          <div className="flex flex-col gap-2">
            {sent.map((f) => (
              <SentCard key={f.id} friendship={f} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Pending card: in entrata ──────────────────────────────────────────────────
function IncomingCard({ friendship, myId }: { friendship: PendingRequest; myId: string }) {
  const friend = friendship.requester;
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-900/80 border border-slate-800/60 rounded-2xl hover:border-purple-500/20 transition-colors">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center shrink-0">
        {friend.avatarUrl
          ? <img src={friend.avatarUrl} alt={friend.username} className="w-9 h-9 rounded-xl object-cover" />
          : <span className="font-mono text-xs font-bold text-white/80">{initials}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-white truncate">{friend.username}</p>
        <p className="font-mono text-xs text-slate-500 truncate">{friend.nexusTag}</p>
      </div>

      {/* Azioni — Client Component separato per useTransition */}
      <FriendActions friendshipId={friendship.id} currentUserId={myId} />
    </div>
  );
}

// ── Pending card: inviata ─────────────────────────────────────────────────────
function SentCard({ friendship }: { friendship: SentRequest }) {
  const friend = friendship.addressee;
  const initials = friend.username.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-900/60 border border-slate-800/40 rounded-2xl opacity-70">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shrink-0">
        {friend.avatarUrl
          ? <img src={friend.avatarUrl} alt={friend.username} className="w-9 h-9 rounded-xl object-cover" />
          : <span className="font-mono text-xs font-bold text-slate-400">{initials}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-slate-300 truncate">{friend.username}</p>
        <p className="font-mono text-xs text-slate-600 truncate">{friend.nexusTag}</p>
      </div>

      <span className="shrink-0 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/50 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
        In attesa
      </span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Page (Server Component)
// ═════════════════════════════════════════════════════════════════════════════
export default async function FriendsPage({ searchParams }: Props) {
  // Sessione reale — mai ID hardcoded
  const session = await requireSession();
  const myId    = session.user.id;

  const { tab } = await searchParams;
  const activeTab: Tab =
    tab === "online" ? "online" : tab === "pending" ? "pending" : "all";

  // Fetch parallelo: tre query, un roundtrip concettuale
  const [friendships, pendingIn, pendingSent] = await Promise.all([
    getFriendships(myId),
    getPendingRequests(myId),
    getSentRequests(myId),
  ]);

  const totalFriends = friendships.length;
  const onlineCount = friendships.filter((f) => {
    const friend = resolveFriend(f, myId);
    return friend.status?.status === "ONLINE" || friend.status?.status === "IN_GAME";
  }).length;
  const pendingTotal = pendingIn.length + pendingSent.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dot pattern bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }}
      />
      {/* Purple ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-purple-400/80 uppercase tracking-[0.2em] mb-1.5">
                Nexus // Amici
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                La tua rete
              </h1>
              <p className="mt-1 font-mono text-sm text-slate-500">
                {totalFriends} amico{totalFriends !== 1 ? "" : ""} · {onlineCount} online
              </p>
            </div>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400">
                <span className="font-mono text-base font-bold leading-none">{onlineCount}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700 bg-slate-800/40 text-slate-400">
                <span className="font-mono text-base font-bold leading-none">{totalFriends}</span>
                <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Totale</span>
              </div>
              {pendingIn.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-400/20 bg-purple-400/5 text-purple-400">
                  <span className="font-mono text-base font-bold leading-none">{pendingIn.length}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest opacity-80">Richieste</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 h-px bg-gradient-to-r from-purple-500/40 via-slate-700/40 to-transparent" />
        </header>

        {/* ── Tab bar ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 mb-8 flex-wrap">
          <TabButton href="/dashboard/friends?tab=all"     label="Tutti"    count={totalFriends} active={activeTab === "all"}     />
          <TabButton href="/dashboard/friends?tab=online"  label="Online"   count={onlineCount}  active={activeTab === "online"}  />
          <TabButton href="/dashboard/friends?tab=pending" label="In Attesa" count={pendingTotal} active={activeTab === "pending"} alert />
        </nav>

        {/* ── Contenuto tab ────────────────────────────────────────────────── */}
        {activeTab === "all" && (
          <FriendsGrid friendships={friendships} myId={myId} filter="all" />
        )}

        {activeTab === "online" && (
          <FriendsGrid friendships={friendships} myId={myId} filter="online" />
        )}

        {activeTab === "pending" && (
          <PendingSection
            incoming={pendingIn}
            sent={pendingSent}
            myId={myId}
          />
        )}
      </div>
    </div>
  );
}