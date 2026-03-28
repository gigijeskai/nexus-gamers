"use client";

// =============================================================================
// Nexus — components/friends/SearchBar.tsx
// Client Component — aggiorna i searchParams nell'URL (no fetch diretto)
// Il Server Component padre legge i searchParams e fa la query
// =============================================================================

import { useRouter, usePathname } from "next/navigation";
import { useTransition, useState, useRef } from "react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 300); // debounce 300ms — non spariamo una richiesta per ogni carattere
  }

  return (
    <div className="relative">
      {/* Icona search */}
      <svg
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
        width="16" height="16" viewBox="0 0 16 16" fill="none"
      >
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
        <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Cerca per NexusTag... es. GamerOne#1234"
        className={`
          w-full pl-10 pr-4 py-3
          bg-zinc-900/80 border border-zinc-800/80 rounded-xl
          font-mono text-sm text-white placeholder-zinc-600
          focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20
          transition-all duration-200
          ${isPending ? "opacity-70" : ""}
        `}
      />

      {/* Spinner di caricamento */}
      {isPending && (
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}