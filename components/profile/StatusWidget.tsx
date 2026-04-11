"use client";

// =============================================================================
// Nexus — components/profile/StatusWidget.tsx
// =============================================================================

import { useActionState, useRef, useState, useOptimistic } from "react";
import { updateStatus, clearStatus, UpdateStatusState } from "@/lib/actions/status";

const GAME_SUGGESTIONS = [
  "Valorant", "League of Legends", "Fortnite",
  "Minecraft", "Elden Ring", "Counter-Strike 2",
  "Apex Legends", "Overwatch 2",
];

type Props = { currentGame: string | null };

export function StatusWidget({ currentGame: initialGame }: Props) {
  // Stato iniziale piatto — stesso shape per success e error
  const INITIAL: UpdateStatusState = { success: true, currentGame: initialGame };

  const [state, formAction, isPending] = useActionState(updateStatus, INITIAL);
  const [clearing, setClearing] = useState(false);
  const formRef  = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gioco da mostrare: preferisce il valore aggiornato dalla action
  const displayGame = state.currentGame !== undefined ? state.currentGame : initialGame;

  // clearStatus è una Server Action con signature (prevState?) → non ha formData
  // La chiamiamo tramite un button type="button" per non triggerare il form
  async function handleClear() {
    setClearing(true);
    try {
      await clearStatus();
    } finally {
      setClearing(false);
      formRef.current?.reset();
    }
  }

  function applySuggestion(game: string) {
    if (inputRef.current) {
      inputRef.current.value = game;
      inputRef.current.focus();
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-sm font-semibold text-white">
          What are you playing?
        </h3>
        {displayGame && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse inline-block" />
            {displayGame}
          </span>
        )}
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            name="currentGame"
            type="text"
            defaultValue={displayGame ?? ""}
            placeholder="e.g. Valorant, Elden Ring…"
            maxLength={64}
            autoComplete="off"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors"
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-semibold disabled:opacity-40 transition-all duration-200"
          >
            {isPending ? "…" : "Set"}
          </button>
        </div>

        {/* Suggerimenti rapidi */}
        <div className="flex flex-wrap gap-1.5">
          {GAME_SUGGESTIONS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => applySuggestion(g)}
              className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/50 font-mono text-[10px] text-slate-500 hover:text-purple-400 hover:border-purple-500/30 transition-all duration-150"
            >
              {g}
            </button>
          ))}
        </div>

        {/* Clear — solo se c'è un gioco attivo */}
        {displayGame && (
          <button
            type="button"
            onClick={handleClear}
            disabled={clearing}
            className="text-left font-mono text-[10px] text-slate-600 hover:text-red-400 transition-colors"
          >
            {clearing ? "Clearing…" : "× Clear status"}
          </button>
        )}

        {/* Error feedback */}
        {!state.success && state.error && (
          <p className="font-mono text-xs text-red-400">{state.error}</p>
        )}
      </form>
    </div>
  );
}