// =============================================================================
// Nexus — components/layout/NotificationBell.tsx
// Server Component — fetch diretto, zero JS nel bundle client
// =============================================================================

import Link from "next/link";
import { getPendingRequestCount } from "@/lib/db/queries";

// ID di test — sostituire con session.user.id quando l'auth sarà integrata
const TEST_USER_ID = "18442f59-e165-46f6-86f4-26ed6ecb281f";

export async function NotificationBell() {
  const count = await getPendingRequestCount(TEST_USER_ID);

  return (
    <Link
      href="/dashboard/friends?tab=pending"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-xl
                 text-slate-400 hover:text-white hover:bg-slate-800
                 transition-all duration-200"
      title={
        count > 0
          ? `${count} friend request${count > 1 ? "s" : ""} pending`
          : "No pending requests"
      }
    >
      {/* Icona campana SVG — niente emoji, rendering coerente cross-platform */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {/* Badge rosso — visibile solo se count > 0 */}
      {count > 0 && (
        <span
          className="
            absolute -top-0.5 -right-0.5
            min-w-[16px] h-4 px-1
            flex items-center justify-center
            bg-red-500 rounded-full
            font-mono text-[9px] font-bold text-white
            ring-2 ring-slate-900
            animate-pulse
          "
          aria-label={`${count} pending`}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}