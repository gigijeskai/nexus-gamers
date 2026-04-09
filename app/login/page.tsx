"use client";

// =============================================================================
// Nexus — app/login/page.tsx
// Pagina di login con Better Auth — Client Component per usare authClient
// =============================================================================

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGitHubLogin() {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });

    if (result.error) {
      setError("Errore durante il login. Riprova.");
      setLoading(false);
    }
    // Se ok, Better Auth redirecta automaticamente a callbackURL
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Dot pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Purple glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-purple-600/8 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
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
          <h1 className="font-mono text-2xl font-bold text-white tracking-tight">NEXUS</h1>
          <p className="mt-1 font-mono text-sm text-slate-500">
            Ritrova i tuoi amici, ovunque giochino
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="font-mono text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <p className="font-mono text-xs text-slate-500 uppercase tracking-[0.15em] text-center mb-6">
            Accedi con
          </p>

          <button
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 font-mono text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            {loading ? "Reindirizzamento..." : "Continua con GitHub"}
          </button>

          <p className="mt-6 font-mono text-[10px] text-slate-600 text-center leading-relaxed">
            Accedendo accetti i nostri Termini di Servizio.
          </p>
        </div>
      </div>
    </div>
  );
}