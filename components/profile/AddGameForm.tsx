"use client";

// =============================================================================
// Nexus — components/profile/AddGameForm.tsx
// =============================================================================

import { useActionState, useEffect, useRef } from "react";
import { Platform } from "@prisma/client";
import { linkGameAccount, LinkGameAccountState } from "@/lib/actions/game-identity";

const PLATFORM_LABELS: Record<Platform, string> = {
  STEAM:       "Steam",
  PLAYSTATION: "PlayStation Network",
  XBOX:        "Xbox Live",
  RIOT:        "Riot Games",
  EPIC:        "Epic Games",
  BATTLENET:   "Battle.net",
  NINTENDO:    "Nintendo",
  EA:          "EA App",
  UBISOFT:     "Ubisoft Connect",
};

const INITIAL_STATE: LinkGameAccountState = { success: false };

const selectClass = "w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-white font-mono text-sm focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const inputClass = "w-full px-3 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const btnClass = "w-full py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-widest border border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2";

type Props = { userId: string };

export function AddGameForm({ userId }: Props) {
  const boundAction = linkGameAccount.bind(null, userId);
  const [state, formAction, isPending] = useActionState(boundAction, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="bg-zinc-900/80 border border-zinc-800/60 rounded-2xl p-5">
      <h3 className="font-mono text-sm font-semibold text-white mb-1">
        Collega account di gioco
      </h3>
      <p className="font-mono text-xs text-zinc-500 mb-5">
        Aggiungi i tuoi account per mostrare dove giochi.
      </p>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label htmlFor="platform" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
            Piattaforma
          </label>
          <select id="platform" name="platform" defaultValue="" className={selectClass} disabled={isPending}>
            <option value="" disabled className="text-zinc-500">Seleziona piattaforma…</option>
            {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-zinc-800 text-white">{label}</option>
            ))}
          </select>
          {state.fieldError?.platform && (
            <p className="font-mono text-xs text-red-400">{state.fieldError.platform}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="platformUsername" className="font-mono text-xs text-zinc-400 uppercase tracking-widest">
            Nickname / Gamertag
          </label>
          <input
            id="platformUsername"
            name="platformUsername"
            type="text"
            placeholder="es. GamerOne#EUW"
            autoComplete="off"
            disabled={isPending}
            className={inputClass}
          />
          {state.fieldError?.platformUsername && (
            <p className="font-mono text-xs text-red-400">{state.fieldError.platformUsername}</p>
          )}
        </div>

        {state.error && (
          <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-mono text-xs text-red-400">{state.error}</p>
          </div>
        )}

        {state.success && (
          <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="font-mono text-xs text-emerald-400">✓ Account collegato!</p>
          </div>
        )}

        <button type="submit" disabled={isPending} className={btnClass}>
          {isPending ? (
            <>
              <span className="w-3 h-3 border border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
              Collegamento…
            </>
          ) : (
            "Collega account"
          )}
        </button>
      </form>
    </div>
  );
}