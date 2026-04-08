// =============================================================================
// Nexus — app/search/page.tsx
// Server Component — legge searchParams.q, chiama searchUsersByTag,
// mostra UserSearchCard per ogni risultato.
//
// NOTA: questa pagina NON ha il suo layout (no header, no sidebar).
// Deve essere spostata dentro app/dashboard/search/page.tsx
// così eredita automaticamente app/dashboard/layout.tsx
// con GlobalSearchBar e NotificationBell già presenti.
//
// Struttura corretta:
//   app/
//   └── dashboard/
//       ├── layout.tsx          ← navbar + sidebar + GlobalSearchBar
//       ├── page.tsx            ← home
//       ├── friends/page.tsx
//       └── search/page.tsx     ← QUESTA PAGINA
// =============================================================================

import { searchUsersByTag } from "@/lib/db/queries";
import { UserSearchCard } from "@/components/friends/UserSearchCard";

const TEST_CURRENT_USER_ID = "cfd7ca0f-c3fa-4393-88c5-989d63b4a20a";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  // Minimo 2 caratteri per evitare query inutili sul DB
  const users =
    query.length >= 2
      ? await searchUsersByTag(query, TEST_CURRENT_USER_ID)
      : [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <header className="mb-8">
        <p className="font-mono text-xs text-purple-400/80 uppercase tracking-[0.2em] mb-1.5">
          Nexus // Cerca
        </p>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Cerca giocatori
        </h1>
        <p className="mt-1 font-mono text-sm text-slate-500">
          Usa la barra in alto per cercare per NexusTag
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-purple-500/30 via-slate-700/40 to-transparent" />
      </header>

      {/* Risultati */}
      {query.length >= 2 ? (
        users.length > 0 ? (
          <section>
            <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.15em] mb-4">
              {users.length} risultat{users.length === 1 ? "o" : "i"} per &ldquo;{query}&rdquo;
            </p>
            <div className="flex flex-col gap-2">
              {users.map((user) => (
                <UserSearchCard
                  key={user.id}
                  user={user}
                  currentUserId={TEST_CURRENT_USER_ID}
                />
              ))}
            </div>
          </section>
        ) : (
          <EmptyState
            icon="search-x"
            title={`Nessun giocatore trovato per "${query}"`}
            subtitle="Controlla il NexusTag e riprova"
          />
        )
      ) : (
        <EmptyState
          icon="search"
          title="Digita nella barra in alto per cercare"
          subtitle="Almeno 2 caratteri per avviare la ricerca"
        />
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon: "search" | "search-x";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col items-center py-24 text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
        {icon === "search" ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <circle cx="11" cy="11" r="7"/>
            <line x1="16.5" y1="16.5" x2="22" y2="22"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
            <circle cx="11" cy="11" r="7"/>
            <line x1="16.5" y1="16.5" x2="22" y2="22"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        )}
      </div>
      <p className="font-mono text-sm text-slate-500">{title}</p>
      <p className="font-mono text-xs text-slate-700">{subtitle}</p>
    </div>
  );
}