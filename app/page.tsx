// =============================================================================
// Nexus — app/dashboard/page.tsx
// Server Component — fetch diretto, zero waterfall
// Layout: sidebar destra con AddGameForm + main con friends grid
// =============================================================================

import { getAllUsersWithStatus } from "@/lib/db/queries";
import { FriendCard } from "@/components/friends/FriendCard";
import { AddGameForm } from "@/components/friends/AddGameForm";
import { SidebarFriends } from "@/components/layout/SidebarFriends";

// ─── TODO: sostituire con userId dalla sessione auth ──────────────────────────
// Quando implementeremo NextAuth, questo verrà da: getServerSession() → session.user.id
const TEMP_USER_ID = "cfd7ca0f-c3fa-4393-88c5-989d63b4a20a";

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${color}`}>
      <span className="font-mono text-lg font-bold leading-none">{value}</span>
      <span className="font-mono text-xs uppercase tracking-widest opacity-70">{label}</span>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({
  dotClass,
  label,
  pulse = false,
}: {
  dotClass: string;
  label: string;
  pulse?: boolean;
}) {
  return (
    <h2 className="font-mono text-xs uppercase tracking-[0.15em] mb-4 flex items-center gap-2 text-zinc-400">
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass} ${
          pulse ? "animate-pulse" : ""
        }`}
      />
      {label}
    </h2>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const users = await getAllUsersWithStatus();

  const activeUsers = users.filter(
    (u) => u.status?.status === "ONLINE" || u.status?.status === "IN_GAME"
  );
  const offlineUsers = users.filter(
    (u) => !u.status || u.status.status === "OFFLINE" || u.status.status === "AWAY"
  );

  const inGameCount = users.filter((u) => u.status?.status === "IN_GAME").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* ── Sfondo dot pattern ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* ── Glow ambientale ────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-xs text-violet-400 uppercase tracking-[0.2em] mb-2">
                Nexus // Dashboard
              </p>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Friends
              </h1>
              <p className="mt-1 text-sm text-zinc-500 font-mono">
                {users.length} gamer{users.length !== 1 ? "s" : ""} in your network
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatPill
                value={activeUsers.length}
                label="Online"
                color="text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
              />
              <StatPill
                value={inGameCount}
                label="In Game"
                color="text-violet-400 border-violet-400/20 bg-violet-400/5"
              />
              <StatPill
                value={offlineUsers.length}
                label="Offline"
                color="text-zinc-500 border-zinc-700 bg-zinc-800/40"
              />
            </div>
          </div>
          <div className="mt-8 h-px bg-gradient-to-r from-violet-500/40 via-zinc-700/40 to-transparent" />
        </header>

        {/* ── Layout: main + sidebar ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
        <SidebarFriends />

          {/* ── MAIN — lista amici ────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Active now */}
            {activeUsers.length > 0 && (
              <section>
                <SectionLabel
                  dotClass="bg-emerald-400"
                  label="Active now"
                  pulse
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {activeUsers.map((user) => (
                    <FriendCard key={user.id} user={user} />
                  ))}
                </div>
              </section>
            )}

            {/* Offline */}
            {offlineUsers.length > 0 && (
              <section>
                <SectionLabel dotClass="bg-zinc-600" label="Offline" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {offlineUsers.map((user) => (
                    <FriendCard key={user.id} user={user} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty state */}
            {users.length === 0 && (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-zinc-600">
                    <rect x="2" y="8" width="24" height="14" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="8" y1="13" x2="8" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <line x1="5.5" y1="15.5" x2="10.5" y2="15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="19" cy="13.5" r="1.5" fill="currentColor"/>
                    <circle cx="17" cy="17" r="1.5" fill="currentColor"/>
                  </svg>
                </div>
                <p className="font-mono text-zinc-500 text-sm">No friends yet.</p>
                <p className="font-mono text-zinc-700 text-xs mt-1">
                  Add some friends to get started.
                </p>
              </div>
            )}
          </main>
          {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
          <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4">

            {/* Form collega account */}
            <AddGameForm userId={TEMP_USER_ID} />

            {/* Info box — rimosso quando arriverà l'auth */}
            <div className="px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
              <p className="font-mono text-[10px] text-amber-500/70 leading-relaxed">
                ⚠ userId hardcoded — da sostituire con la sessione auth
                prima del deploy.
              </p>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}