"use client";

// =============================================================================
// Nexus — components/profile/AddGameForm.tsx
// Non riceve più userId come prop — la Server Action lo legge dalla sessione.
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

export function AddGameForm() {
  const [state, formAction, isPending] = useActionState(linkGameAccount, INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="bg-slate-900/80 border border-slate-800/60 rounded-2xl p-5">
      <h3 className="font-mono text-sm font-semibold text-white mb-1">
        Link gaming account
      </h3>
      <p className="font-mono text-xs text-slate-500 mb-5">
        Add your accounts to show where you play.
      </p>

      <form ref={formRef} action={formAction} className="flex flex-col gap-4">
        {/* Platform */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="platform" className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            Platform
          </label>
          <select id="platform" name="platform" defaultValue="" disabled={isPending}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white font-mono text-sm focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 transition-colors">
            <option value="" disabled className="text-slate-500">Select platform…</option>
            {Object.entries(PLATFORM_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-slate-800 text-white">{label}</option>
            ))}
          </select>
          {state.fieldError?.platform && (
            <p className="font-mono text-xs text-red-400">{state.fieldError.platform}</p>
          )}
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="platformUsername" className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            Nickname / Gamertag
          </label>
          <input id="platformUsername" name="platformUsername" type="text"
            placeholder="e.g. GamerOne#EUW" autoComplete="off" disabled={isPending}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-white font-mono text-sm placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/30 disabled:opacity-50 transition-colors"
          />
          {state.fieldError?.platformUsername && (
            <p className="font-mono text-xs text-red-400">{state.fieldError.platformUsername}</p>
          )}
        </div>

        {/* Feedback */}
        {state.error && (
          <div className="px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="font-mono text-xs text-red-400">{state.error}</p>
          </div>
        )}
        {state.success && (
          <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="font-mono text-xs text-emerald-400">✓ Account linked!</p>
          </div>
        )}

        <button type="submit" disabled={isPending}
          className="w-full py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-widest border border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2">
          {isPending ? (
            <>
              <span className="w-3 h-3 border border-purple-400/40 border-t-purple-400 rounded-full animate-spin" />
              Linking…
            </>
          ) : "Link account"}
        </button>
      </form>
    </div>
  );
}