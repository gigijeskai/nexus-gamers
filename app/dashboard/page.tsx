// =============================================================================
// Nexus — app/dashboard/page.tsx
// Server Component — feed amici dell'utente corrente.
//
// Strategia tipi:
//   getFriendships(myId)      → lista degli ID degli amici
//   getAllUsersWithStatus()    → dati completi UserWithStatus (richiesti da FriendCard)
//   Intersezione dei due      → solo gli amici, con il tipo corretto
// =============================================================================

import Link from "next/link";
import { requireSession } from "@/lib/session";
import { getFriendships, getAllUsersWithStatus } from "@/lib/db/queries";
import { FriendCard } from "@/components/friends/FriendCard";
import type { Friendship } from "@/lib/db/queries";

// ── Helper: estrae l'ID dell'amico dalla riga ─────────────────────────────────
function getFriendId(f: Friendship, myId: string): string {
  return f.requesterId === myId ? f.addresseeId : f.requesterId;
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${color}`}>
      <span className="font-mono text-lg font-bold leading-none">{value}</span>
      <span className="font-mono text-xs uppercase tracking-widest opacity-70">{label}</span>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ dotClass, label, pulse = false }: { dotClass: string; label: string; pulse?: boolean }) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-[0.15em] mb-4 flex items-center gap-2 text-slate-400">
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass} ${pulse ? "animate-pulse" : ""}`} />
      {label}
    </h2>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await requireSession();
  const myId    = session.user.id;

  // Fetch parallelo: lista amicizie + tutti gli utenti con status completo
  const [friendships, allUsers] = await Promise.all([
    getFriendships(myId),
    getAllUsersWithStatus(),
  ]);

  // Costruisce un Set degli ID degli amici accettati per lookup O(1)
  const friendIds = new Set(friendships.map((f) => getFriendId(f, myId)));

  // Filtra allUsers per ottenere solo gli amici — con il tipo UserWithStatus completo
  // Questo è il tipo che FriendCard si aspetta
  const friends = allUsers.filter((u) => friendIds.has(u.id));

  const online  = friends.filter((f) => f.status?.status === "ONLINE" || f.status?.status === "IN_GAME");
  const offline = friends.filter((f) => !f.status || f.status.status === "OFFLINE" || f.status.status === "AWAY");
  const inGame  = friends.filter((f) => f.status?.status === "IN_GAME").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }}
      />
      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-purple-400/80 uppercase tracking-[0.2em] mb-1.5">
                Nexus // Dashboard
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Hey, {session.user.username ?? session.user.name ?? "Gamer"} 👋
              </h1>
              <p className="mt-1 font-mono text-sm text-slate-500">
                {friends.length} friend{friends.length !== 1 ? "s" : ""} in your network
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatPill value={online.length}  label="Online"  color="text-emerald-400 border-emerald-400/20 bg-emerald-400/5" />
              <StatPill value={inGame}          label="In Game" color="text-purple-400 border-purple-400/20 bg-purple-400/5" />
              <StatPill value={offline.length}  label="Offline" color="text-slate-500 border-slate-700 bg-slate-800/40" />
            </div>
          </div>
          <div className="mt-6 h-px bg-gradient-to-r from-purple-500/40 via-slate-700/40 to-transparent" />
        </header>

        {/* ── Feed ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-10">

          {/* Online / In Game */}
          {online.length > 0 && (
            <section>
              <SectionLabel dotClass="bg-emerald-400" label="Active now" pulse />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {online.map((u) => (
                  <FriendCard key={u.id} user={u} />
                ))}
              </div>
            </section>
          )}

          {/* Offline */}
          {offline.length > 0 && (
            <section>
              <SectionLabel dotClass="bg-slate-600" label="Offline" />
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 opacity-60">
                {offline.map((u) => (
                  <FriendCard key={u.id} user={u} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {friends.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div>
                <p className="font-mono text-sm text-slate-500">No friends yet.</p>
                <p className="font-mono text-xs text-slate-700 mt-1">
                  Search for players and send friend requests.
                </p>
              </div>
              <Link
                href="/dashboard/search"
                className="px-4 py-2 rounded-xl border border-purple-500/30 text-purple-400 font-mono text-xs hover:bg-purple-500/10 transition-colors"
              >
                Search players →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}