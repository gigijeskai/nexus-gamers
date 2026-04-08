// =============================================================================
// Nexus — app/dashboard/layout.tsx
// Layout condiviso per tutte le route sotto /dashboard.
// Il middleware garantisce che qui si arrivi solo se autenticati,
// ma requireUser() è una seconda linea di difesa.
// =============================================================================

import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/auth";
import { GlobalSearchBar } from "@/components/layout/GlobalSearchBar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { SidebarFriends } from "@/components/layout/SidebarFriends";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // requireUser() fa redirect a /login se la sessione non esiste
  const user = await requireUser();

  const initials = (user.username ?? user.name ?? "ME")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="
        sticky top-0 z-50
        flex items-center gap-4 px-4 sm:px-6 h-14
        bg-slate-950/80 backdrop-blur-md
        border-b border-slate-800/60
      ">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 group">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            className="text-purple-400 group-hover:text-purple-300 transition-colors">
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

        <div className="h-5 w-px bg-slate-800 hidden sm:block" />

        {/* GlobalSearchBar */}
        <div className="flex-1 max-w-sm">
          <GlobalSearchBar />
        </div>

        <div className="flex-1" />

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/dashboard",         label: "Home"  },
            { href: "/dashboard/friends", label: "Amici" },
            { href: "/dashboard/search",  label: "Cerca" },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-3 py-1.5 rounded-lg font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150">
              {label}
            </Link>
          ))}
        </nav>

        {/* NotificationBell — passa l'ID reale dalla sessione */}
        <NotificationBell userId={user.id} />

        {/* Avatar utente */}
        <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center shrink-0">
          {user.image ? (
            <img src={user.image} alt={user.username ?? "avatar"} className="w-full h-full object-cover" />
          ) : (
            <span className="font-mono text-[10px] font-bold text-white/80">{initials}</span>
          )}
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="
          hidden md:flex flex-col
          w-56 shrink-0 pt-6 px-3 pb-6
          border-r border-slate-800/60
          sticky top-14 h-[calc(100vh-3.5rem)]
          overflow-y-auto
        ">
          {/* Info utente */}
          <div className="flex items-center gap-2.5 px-2 py-2 mb-4 rounded-xl bg-slate-800/40">
            <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 shrink-0">
              {user.image
                ? <img src={user.image} alt="" className="w-full h-full object-cover" />
                : <span className="flex items-center justify-center w-full h-full font-mono text-[9px] font-bold text-white/80">{initials}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-xs font-semibold text-white truncate">
                {user.username ?? user.name}
              </p>
              <p className="font-mono text-[10px] text-slate-500 truncate">
                {user.nexusTag ?? user.email}
              </p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 mb-6">
            {[
              { href: "/dashboard",         label: "Home",  d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
              { href: "/dashboard/friends", label: "Amici", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
              { href: "/dashboard/search",  label: "Cerca", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
            ].map(({ href, label, d }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl font-mono text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all duration-150">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={d}/>
                </svg>
                {label}
              </Link>
            ))}
          </nav>

          <div className="h-px bg-slate-800/80 mb-4" />

          {/* Lista amici — ID reale dalla sessione */}
          <SidebarFriends userId={user.id} />

          {/* Logout — in fondo alla sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-800/60">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-xl
                  font-mono text-xs text-slate-500
                  hover:text-red-400 hover:bg-red-500/5
                  transition-all duration-150
                "
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Logout
              </button>
            </form>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}