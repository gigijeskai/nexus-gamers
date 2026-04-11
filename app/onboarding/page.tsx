"use client";

// =============================================================================
// Nexus — app/onboarding/page.tsx
// Client Component — form per scegliere il NexusTag al primo login.
//
// Chi arriva qui:
//   - proxy.ts rileva: cookie sessione OK + header x-needs-onboarding → redirect qui
//   - dashboard/layout.tsx rileva: user.username === null → redirect qui
//
// Chi NON deve stare qui:
//   - Utenti non loggati → proxy.ts li manda a /login prima
//   - Utenti con username già impostato → proxy.ts / layout li bypassa
// =============================================================================

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding } from "@/lib/actions/onboarding";

const SUGGESTIONS = ["shadow", "pixel", "nova", "frost", "void", "apex", "echo"];

export default function OnboardingPage() {
  const router = useRouter();
  const [tag, setTag]               = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const clean    = tag.trim();
  const isValid  = /^[a-zA-Z0-9_]{3,20}$/.test(clean);
  const charCount = clean.length;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTag(e.target.value);
    setError(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  function handleSubmit() {
    if (!isValid || isPending) return;
    setError(null);

    startTransition(async () => {
      const result = await completeOnboarding(clean);
      if (result.success) {
        // Hard redirect — forza una nuova richiesta HTTP completa.
        // router.push usa navigazione client-side e la sessione Better Auth
        // (con cookieCache) potrebbe restituire ancora username=null.
        // window.location.href forza il browser a rileggere la sessione dal DB.
        window.location.href = "/dashboard";
        return;
      }
      setError(result.error);
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Dot pattern bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-purple-400">
              <rect x="2" y="6" width="20" height="13" rx="4" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="7" y1="10" x2="7" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="4.5" y1="12.5" x2="9.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="17" cy="10.5" r="1" fill="currentColor"/>
              <circle cx="15" cy="13.5" r="1" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="font-mono text-2xl font-bold text-white tracking-tight">
            Welcome to NEXUS
          </h1>
          <p className="mt-2 font-mono text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Before you enter, claim your NexusTag — your unique identity on the platform.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">

          {/* Label + counter */}
          <div className="flex items-center justify-between mb-2">
            <label className="font-mono text-xs text-slate-400 uppercase tracking-[0.15em]">
              Your NexusTag
            </label>
            <span className={`font-mono text-xs transition-colors ${
              charCount > 20 ? "text-red-400" : charCount >= 3 ? "text-slate-500" : "text-slate-700"
            }`}>
              {charCount}/20
            </span>
          </div>

          {/* Input */}
          <div className="relative mb-2">
            <input
              type="text"
              value={tag}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g. shadowhunter"
              maxLength={25}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className={`
                w-full px-4 py-3 rounded-xl
                bg-slate-800/60 border font-mono text-sm text-white
                placeholder-slate-600 transition-all duration-200
                focus:outline-none focus:ring-1
                ${error
                  ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20"
                  : isValid
                    ? "border-purple-500/40 focus:border-purple-500/60 focus:ring-purple-500/20"
                    : "border-slate-700/60 focus:border-purple-500/40 focus:ring-purple-500/10"
                }
              `}
            />
          </div>

          {/* Preview tag finale */}
          <p className="font-mono text-[10px] text-slate-600 mb-5">
            Your final tag will look like:{" "}
            <span className="text-slate-400">
              {clean.length >= 3 ? clean : "yourname"}#XXXX
            </span>
            {" "}— the suffix is auto-generated for uniqueness.
          </p>

          {/* Chips suggerimento */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="font-mono text-[10px] text-slate-700 self-center mr-1">
              Try:
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setTag(s); setError(null); }}
                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700/50 font-mono text-[10px] text-slate-500 hover:text-purple-400 hover:border-purple-500/30 transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Errore */}
          {error && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="font-mono text-xs text-red-400">{error}</p>
            </div>
          )}

          {/* Regole formato */}
          <ul className="mb-6 space-y-1">
            {[
              { rule: "3–20 characters", ok: charCount >= 3 && charCount <= 20 },
              { rule: "Letters, numbers and _ only", ok: /^[a-zA-Z0-9_]*$/.test(clean) && clean.length > 0 },
            ].map(({ rule, ok }) => (
              <li key={rule} className="flex items-center gap-2 font-mono text-[10px]">
                <span className={ok ? "text-emerald-400" : "text-slate-700"}>
                  {ok ? "✓" : "○"}
                </span>
                <span className={ok ? "text-slate-500" : "text-slate-700"}>{rule}</span>
              </li>
            ))}
          </ul>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="w-full py-3 rounded-xl font-mono text-sm font-semibold text-white bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isPending ? "Saving..." : "Claim my tag →"}
          </button>
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-slate-700">
          You can change your tag later from your profile settings.
        </p>
      </div>
    </div>
  );
}