// =============================================================================
// Nexus — components/layout/NotificationBell.tsx
// Server Component — riceve userId dalla sessione reale (passato dal layout).
// =============================================================================

import Link from "next/link";
import { getPendingRequestCount } from "@/lib/db/queries";

type Props = { userId: string };

export async function NotificationBell({ userId }: Props) {
  const count = await getPendingRequestCount(userId);

  return (
    <Link
      href="/dashboard/friends?tab=pending"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl
                 text-slate-400 hover:text-white hover:bg-slate-800
                 transition-all duration-200"
      title={count > 0 ? `${count} richiesta${count > 1 ? "e" : ""} in attesa` : "Nessuna richiesta"}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>

      {count > 0 && (
        <span className="
          absolute -top-0.5 -right-0.5
          min-w-[16px] h-4 px-1
          flex items-center justify-center
          bg-red-500 rounded-full
          font-mono text-[9px] font-bold text-white
          ring-2 ring-slate-950
          animate-pulse
        ">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}