"use client";

// =============================================================================
// Nexus — components/friends/SearchBar.tsx
// Client Component — aggiorna ?q= sul pathname corrente (usato in /search)
// Diverso da GlobalSearchBar che naviga sempre verso /search
// =============================================================================

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useTransition } from "react";

type Props = {
  defaultValue?: string;
  placeholder?: string;
};

export function SearchBar({
  defaultValue = "",
  placeholder = "Cerca per NexusTag... es. GamerOne#1234",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(defaultValue);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        // Aggiorna il pathname corrente — il Server Component padre
        // rileva il cambio di searchParams e ri-esegue la query Prisma
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setValue("");
      startTransition(() => router.replace(pathname));
    }
  }

  return (
    <div className="relative w-full">
      {/* Icona lente */}
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3" />
        <line
          x1="10" y1="10" x2="14" y2="14"
          stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
        />
      </svg>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={`
          w-full pl-10 pr-10 py-3
          bg-slate-900/80 border border-slate-700/60 rounded-xl
          font-mono text-sm text-white placeholder-slate-600
          focus:outline-none focus:border-purple-500/50
          focus:ring-1 focus:ring-purple-500/20
          transition-all duration-200
          ${isPending ? "opacity-60" : ""}
        `}
      />

      {/* Spinner mentre Next.js aggiorna la pagina */}
      {isPending && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}

      {/* X per svuotare — solo se c'è testo e non sta caricando */}
      {value && !isPending && (
        <button
          onClick={() => {
            setValue("");
            startTransition(() => router.replace(pathname));
          }}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
          aria-label="Svuota ricerca"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}