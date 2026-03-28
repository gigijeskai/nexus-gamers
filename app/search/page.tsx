// =============================================================================
// Nexus — app/search/page.tsx
// Server Component — legge ?q= dai searchParams e fa la query sul DB
// La SearchBar (Client) aggiorna l'URL → Next.js re-renderizza questa pagina
// =============================================================================

import { searchUsersByTag } from "@/lib/db/queries";
import { SearchBar } from "@/components/friends/SearchBar";
import { UserSearchCard } from "@/components/friends/UserSearchCard";

// ID fisso di test — sostituire con la sessione reale (es. auth session) in futuro
const TEST_CURRENT_USER_ID = "ed6cb7c9-bd82-4285-a4dd-4868a013d417";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const users = query.length >= 2
    ? await searchUsersByTag(query, TEST_CURRENT_USER_ID)
    : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Sfondo dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Glow ambientale */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-violet-600/5 blur-[100px] pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12">

        {/* Header */}
        <header className="mb-8">
          <p className="font-mono text-xs text-violet-400 uppercase tracking-[0.2em] mb-2">
            Nexus // Trova amici
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Cerca giocatori
          </h1>
          <p className="mt-1 text-sm text-zinc-500 font-mono">
            Trova i tuoi amici tramite NexusTag
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-violet-500/40 via-zinc-700/40 to-transparent" />
        </header>

        {/* Search bar */}
        <div className="mb-8">
          <SearchBar defaultValue={query} />
        </div>

        {/* Risultati */}
        {query.length >= 2 ? (
          users.length > 0 ? (
            <section>
              <p className="font-mono text-xs text-zinc-500 uppercase tracking-[0.15em] mb-4">
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
            /* Empty state — nessun risultato */
            <div className="flex flex-col items-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-600">
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
                  <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <p className="font-mono text-zinc-500 text-sm">
                Nessun giocatore trovato per &ldquo;{query}&rdquo;
              </p>
              <p className="font-mono text-zinc-700 text-xs mt-1">
                Controlla il NexusTag e riprova
              </p>
            </div>
          )
        ) : (
          /* Stato iniziale — prompt a scrivere */
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-zinc-700">
                <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
                <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-mono text-zinc-600 text-sm">
              Digita almeno 2 caratteri per cercare
            </p>
          </div>
        )}
      </div>
    </div>
  );
}