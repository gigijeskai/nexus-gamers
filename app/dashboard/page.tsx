// =============================================================================
// Nexus — app/dashboard/friends/page.tsx
// Server Component — legge ?tab= dai searchParams, fa tutte le query in parallelo
// =============================================================================

import Link from "next/link";
import {
  getAcceptedFriends,
  getPendingRequests,
  getSentRequests,
  AcceptedFriendship,
} from "@/lib/db/queries";
import { FriendsGrid, PendingList } from "@/components/friends/FriendsGrid";

// ID utente di test — sostituire con sessione reale
const TEST_USER_ID = "cfd7ca0f-c3fa-4393-88c5-989d63b4a20a";

type Tab = "all" | "online" | "pending";

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

// ── Helper: estrae l'amico dalla riga ────────────────────────────────────────
function getFriend(friendship: AcceptedFriendship, myId: string) {
  return friendship.requesterId === myId
    ? friendship.addressee
    : friendship.requester;
}

// ── Tab link component ────────────────────────────────────────────────────────
function TabLink({
  href,
  label,
  badge,
  active,
}: {
  href: string;
  label: string;
  badge?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        relative flex items-center gap-2 px-4 py-2 font-mono text-xs font-semibold
        uppercase tracking-[0.12em] rounded-xl transition-all duration-200
        ${
          active
            ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
            : "text-zinc-500 hover:text-zinc-300 border border-transparent hover:bg-zinc-800/50"
        }
      `}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`
            inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold
            ${active ? "bg-violet-500/30 text-violet-300" : "bg-zinc-700 text-zinc-400"}
          `}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function FriendsPage({ searchParams }: Props) {
  const { tab } = await searchParams;
  const activeTab: Tab =
    tab === "online" ? "online" : tab === "pending" ? "pending" : "all";

  // Fetch parallelo — Promise.all evita waterfall sequenziali
  const [friendships, pendingIn, pendingSent] = await Promise.all([
    getAcceptedFriends(TEST_USER_ID),
    getPendingRequests(TEST_USER_ID),
    getSentRequests(TEST_USER_ID),
  ]);

  // Estrai gli amici dalla struttura Friendship
  const friends = friendships.map((f) => getFriend(f, TEST_USER_ID));
  const onlineCount = friends.filter(
    (f) => f.status?.status === "ONLINE" || f.status?.status === "IN_GAME"
  ).length;
  const pendingTotal = pendingIn.length + pendingSent.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Dot pattern bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-violet-400 uppercase tracking-[0.2em] mb-2">
                Nexus // Friends
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Your Network
              </h1>
              <p className="mt-1 text-sm text-zinc-500 font-mono">
                {friends.length} friend{friends.length !== 1 ? "s" : ""} ·{" "}
                {onlineCount} online
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 text-emerald-400">
                <span className="font-mono text-lg font-bold leading-none">{onlineCount}</span>
                <span className="font-mono text-xs uppercase tracking-widest opacity-70">Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/40 text-zinc-400">
                <span className="font-mono text-lg font-bold leading-none">{friends.length}</span>
                <span className="font-mono text-xs uppercase tracking-widest opacity-70">Total</span>
              </div>
              {pendingIn.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-400/20 bg-violet-400/5 text-violet-400">
                  <span className="font-mono text-lg font-bold leading-none">{pendingIn.length}</span>
                  <span className="font-mono text-xs uppercase tracking-widest opacity-70">Requests</span>
                </div>
              )}
            </div>
          </div>

          {/* Gradient divider */}
          <div className="mt-6 h-px bg-gradient-to-r from-violet-500/40 via-zinc-700/40 to-transparent" />
        </header>

        {/* ── Tab navigation ───────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 mb-8 flex-wrap">
          <TabLink
            href="/dashboard/friends?tab=all"
            label="All Friends"
            badge={friends.length}
            active={activeTab === "all"}
          />
          <TabLink
            href="/dashboard/friends?tab=online"
            label="Online"
            badge={onlineCount}
            active={activeTab === "online"}
          />
          <TabLink
            href="/dashboard/friends?tab=pending"
            label="Pending"
            badge={pendingTotal}
            active={activeTab === "pending"}
          />
        </nav>

        {/* ── Tab content ──────────────────────────────────────────────────── */}
        {activeTab === "all" && (
          <FriendsGrid friends={friends} filter="all" />
        )}

        {activeTab === "online" && (
          <FriendsGrid friends={friends} filter="online" />
        )}

        {activeTab === "pending" && (
          <PendingList
            incoming={pendingIn}
            sent={pendingSent}
            currentUserId={TEST_USER_ID}
          />
        )}
      </div>
    </div>
  );
}