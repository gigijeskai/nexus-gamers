"use client";

// =============================================================================
// Nexus — components/layout/GlobalSearchBar.tsx
// Client Component — naviga SEMPRE verso /search?q=...
// Differente da SearchBar.tsx che aggiorna il pathname corrente.
// =============================================================================

import { useRouter } from "next/navigation";
import { useState, useRef, useTransition } from "react";

export function GlobalSearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setValue(q);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        if (q.trim().length >= 2) {
          router.push(`/dashboard/search?q=${encodeURIComponent(q.trim())}`);
        } else if (q.trim() === "") {
          // Se l'utente cancella tutto, torna alla search vuota
          router.push("/dashboard/search");
        }
      });
    }, 350);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && value.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      router.push(`/dashboard/search?q=${encodeURIComponent(value.trim())}`);
    }
    if (e.key === "Escape") {
      setValue("");
    }
  }

  return (
    <div className="relative w-full max-w-sm">
      {/* Icona lente */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        width="14" height="14" viewBox="0 0 16 16" fill="none"
      >
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
        <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Cerca giocatori…"
        className={`
          w-full pl-9 pr-4 py-2
          bg-slate-800/60 border border-slate-700/60 rounded-xl
          font-mono text-sm text-white placeholder-slate-600
          focus:outline-none focus:border-purple-500/50 focus:bg-slate-800
          focus:ring-1 focus:ring-purple-500/20
          transition-all duration-200
          ${isPending ? "opacity-60" : ""}
        `}
      />

      {/* Spinner */}
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-3.5 h-3.5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}