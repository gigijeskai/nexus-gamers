// =============================================================================
// Nexus — app/dashboard/layout.tsx
// Layout condiviso per tutte le pagine sotto /dashboard
// Contiene la Navbar persistente (search + notifiche) e la sidebar
// =============================================================================

import Link from "next/link";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SidebarFriends } from "@/components/layout/SidebarFriends";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Navbar globale ───────────────────────────────────────────────────── */}
      <header className="
        sticky top-0 z-50
        flex items-center gap-4 px-4 sm:px-6 h-14
        bg-slate-950/80 backdrop-blur-md
        border-b border-slate-800/60
      ">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 group"
        >
          {/* Icona controller SVG */}
          <svg
            width="20" height="20" viewBox="0 0 24 24" fill="none"
            className="text-purple-400 group-hover:text-purple-300 transition-colors"
          >
            <rect x="2" y="6" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="7" y1="10" x2="7" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4.5" y1="12.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="17" cy="10.5" r="1" fill="currentColor"/>
            <circle cx="15" cy="13.5" r="1" fill="currentColor"/>
          </svg>
          <span className="font-mono text-sm font-bold text-white hidden sm:block tracking-tight">
            NEXUS
          </span>
        </Link>

        {/* Separatore verticale */}
        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* Search bar — occupa lo spazio centrale disponibile */}
        <div className="flex-1 max-w-sm">
          <GlobalSearchBar />
        </div>

        {/* Spacer per spingere le icone a destra */}
        <div className="flex-1" />

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150"
          >
            Home
          </Link>
          <Link
            href="/dashboard/friends"
            className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150"
          >
            Amici
          </Link>
          <Link
            href="/dashboard/search"
            className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150"
          >
            Cerca
          </Link>
        </nav>

        {/* Notification bell — Server Component */}
        <NotificationBell />

        {/* Avatar placeholder utente */}
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shrink-0">
          <span className="font-mono text-[10px] font-bold text-white/80">ME</span>
        </div>
      </header>

      {/* ── Body: sidebar + contenuto principale ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar sinistra — visibile da md in su */}
        <aside className="
          hidden md:flex flex-col
          w-56 shrink-0
          pt-6 px-3 pb-6
          border-r border-slate-800/60
          sticky top-14 h-[calc(100vh-3.5rem)]
          overflow-y-auto
        ">
          {/* Link di navigazione sidebar */}
          <nav className="flex flex-col gap-0.5 mb-6">
            {[
              { href: "/dashboard",         label: "Home",     icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { href: "/dashboard/friends", label: "Friends",    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { href: "/dashboard/search",  label: "Search",    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={icon}/>
                </svg>
                {label}
              </Link>
            ))}
          </nav>

          {/* Separatore */}
          <div className="h-px bg-slate-800/80 mb-4" />

          {/* Lista amici rapida */}
          <SidebarFriends />
        </aside>

        {/* Contenuto principale */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}