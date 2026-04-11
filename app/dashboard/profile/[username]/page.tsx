// =============================================================================
// Nexus — app/dashboard/profile/[username]/page.tsx
// Pagina profilo pubblica — visibile a chiunque nella dashboard.
//
// Logica owner vs visitor:
//   - Se sto guardando il MIO profilo → mostro AddGameForm + StatusWidget
//   - Se sto guardando il profilo di un ALTRO → mostro "Send Message" (placeholder)
// =============================================================================

import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db/prisma";
import { AddGameForm } from "@/components/profile/AddGameForm";
import { StatusWidget } from "@/components/profile/StatusWidget";

// Mappa piattaforma → icona/colore
const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  STEAM:       { label: "Steam",       color: "text-sky-400",    bg: "bg-sky-400/10 border-sky-400/20" },
  PLAYSTATION: { label: "PlayStation", color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20" },
  XBOX:        { label: "Xbox",        color: "text-emerald-400",bg: "bg-emerald-400/10 border-emerald-400/20" },
  RIOT:        { label: "Riot",        color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
  EPIC:        { label: "Epic",        color: "text-slate-300",  bg: "bg-slate-300/10 border-slate-300/20" },
  BATTLENET:   { label: "Battle.net",  color: "text-cyan-400",   bg: "bg-cyan-400/10 border-cyan-400/20" },
  NINTENDO:    { label: "Nintendo",    color: "text-red-400",    bg: "bg-red-400/10 border-red-400/20" },
  EA:          { label: "EA",          color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  UBISOFT:     { label: "Ubisoft",     color: "text-slate-400",  bg: "bg-slate-400/10 border-slate-400/20" },
};

// STATUS ─────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ONLINE:  { label: "Online",  dot: "bg-emerald-400", text: "text-emerald-400", pulse: true },
  IN_GAME: { label: "In Game", dot: "bg-purple-400",  text: "text-purple-400",  pulse: true },
  OFFLINE: { label: "Offline", dot: "bg-slate-600",   text: "text-slate-500",   pulse: false },
  AWAY:    { label: "Away",    dot: "bg-amber-400",   text: "text-amber-400",   pulse: false },
} as const;

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // Sessione corrente (chi sta guardando)
  const session = await requireSession();
  const viewerId = session.user.id;

  // Carica il profilo richiesto
  const profileUser = await prisma.user.findUnique({
    where: { username },
    include: {
      status: true,
      gameIdentities: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!profileUser) notFound();

  const isOwner = profileUser.id === viewerId;
  const statusKey = (profileUser.status?.status ?? "OFFLINE") as keyof typeof STATUS_CONFIG;
  const statusCfg = STATUS_CONFIG[statusKey];
  const initials  = (profileUser.username ?? "??").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "28px 28px" }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/5 blur-[120px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Header profilo ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
              {profileUser.avatarUrl ? (
                <img src={profileUser.avatarUrl} alt={profileUser.username ?? ""} className="w-full h-full object-cover" />
              ) : (
                <span className="font-mono text-2xl font-bold text-white/90">{initials}</span>
              )}
            </div>
            {/* Status dot */}
            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 ${statusCfg.dot} ${statusCfg.pulse ? "animate-pulse" : ""}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white font-mono tracking-tight">
                {profileUser.username}
              </h1>
              {isOwner && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 font-mono text-[10px] text-purple-400 uppercase tracking-widest">
                  You
                </span>
              )}
              <span className={`flex items-center gap-1.5 font-mono text-xs ${statusCfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${statusCfg.pulse ? "animate-pulse" : ""} inline-block`} />
                {statusCfg.label}
              </span>
            </div>

            <p className="font-mono text-sm text-slate-500 mt-1">
              {profileUser.nexusTag}
            </p>

            {/* Gioco corrente */}
            {profileUser.status?.currentGame && (
              <p className="mt-2 flex items-center gap-2 font-mono text-sm text-purple-400">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                  <rect x="1" y="4" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1"/>
                  <line x1="4" y1="6.5" x2="4" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <line x1="2.5" y1="7.75" x2="5.5" y2="7.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                  <circle cx="10" cy="6.75" r=".75" fill="currentColor"/>
                  <circle cx="9" cy="8.5" r=".75" fill="currentColor"/>
                </svg>
                Playing {profileUser.status.currentGame}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="shrink-0">
            {!isOwner && (
              <button
                disabled
                title="Coming soon"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700/60 font-mono text-sm text-slate-400 cursor-not-allowed opacity-60"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Send Message
                <span className="text-[9px] text-slate-600 uppercase tracking-widest ml-1">soon</span>
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-purple-500/30 via-slate-700/40 to-transparent mb-8" />

        {/* ── Layout: main + sidebar ───────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Colonna principale — Piattaforme ─────────────────────────── */}
          <main className="flex-1 min-w-0">
            <h2 className="font-mono text-xs text-slate-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
              Linked platforms
            </h2>

            {profileUser.gameIdentities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3 border border-dashed border-slate-800 rounded-2xl">
                <p className="font-mono text-sm text-slate-600">No platforms linked yet.</p>
                {isOwner && (
                  <p className="font-mono text-xs text-slate-700">
                    Use the form on the right to add your accounts.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {profileUser.gameIdentities.map((gi) => {
                  const cfg = PLATFORM_CONFIG[gi.platform] ?? { label: gi.platform, color: "text-slate-400", bg: "bg-slate-400/10 border-slate-400/20" };
                  return (
                    <div key={gi.id} className="flex items-center gap-4 px-4 py-3 bg-slate-900/70 border border-slate-800/60 rounded-2xl hover:border-slate-700/60 transition-colors">
                      <span className={`px-2.5 py-1 rounded-lg border font-mono text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="font-mono text-sm text-white flex-1 truncate">
                        {gi.platformUsername}
                      </span>
                      {gi.platformId && (
                        <span className="font-mono text-[10px] text-slate-600 truncate">
                          {gi.platformId}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ── Sidebar — Owner tools o visitor info ─────────────────────── */}
          <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            {isOwner ? (
              <>
                {/* Status widget — solo per il proprietario */}
                <StatusWidget currentGame={profileUser.status?.currentGame ?? null} />
                {/* Form per aggiungere piattaforme */}
                <AddGameForm />
              </>
            ) : (
              /* Vista visitor — statistiche pubbliche */
              <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5">
                <h3 className="font-mono text-xs text-slate-400 uppercase tracking-[0.15em] mb-4">
                  Player info
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-slate-600">Platforms</span>
                    <span className="font-mono text-sm text-white font-semibold">
                      {profileUser.gameIdentities.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-slate-600">Status</span>
                    <span className={`font-mono text-xs font-semibold ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                  {profileUser.status?.currentGame && (
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-slate-600">Playing</span>
                      <span className="font-mono text-xs text-purple-400 truncate max-w-[140px]">
                        {profileUser.status.currentGame}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}