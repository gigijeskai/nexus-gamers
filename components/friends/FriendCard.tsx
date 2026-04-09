// =============================================================================
// Nexus — components/friends/FriendCard.tsx
// =============================================================================

import { UserWithStatus } from "@/lib/db/queries";

type Props = {
  user: UserWithStatus;
};

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ONLINE: {
    label: "Online",
    dotClass: "bg-emerald-400",
    textClass: "text-emerald-400",
    glowClass: "shadow-[0_0_8px_rgba(52,211,153,0.5)]",
    badgeBg: "bg-emerald-400/10 border-emerald-400/20",
    cardBorder: "hover:border-emerald-400/30",
    cardGlow: "hover:shadow-[0_0_20px_rgba(52,211,153,0.07)]",
  },
  IN_GAME: {
    label: "In Game",
    dotClass: "bg-violet-400",
    textClass: "text-violet-400",
    glowClass: "shadow-[0_0_8px_rgba(167,139,250,0.6)]",
    badgeBg: "bg-violet-400/10 border-violet-400/20",
    cardBorder: "hover:border-violet-400/40",
    cardGlow: "hover:shadow-[0_0_24px_rgba(167,139,250,0.1)]",
  },
  OFFLINE: {
    label: "Offline",
    dotClass: "bg-zinc-500",
    textClass: "text-zinc-500",
    glowClass: "",
    badgeBg: "bg-zinc-500/10 border-zinc-500/20",
    cardBorder: "hover:border-zinc-600/50",
    cardGlow: "",
  },
  AWAY: {
    label: "Away",
    dotClass: "bg-amber-400",
    textClass: "text-amber-400",
    glowClass: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
    badgeBg: "bg-amber-400/10 border-amber-400/20",
    cardBorder: "hover:border-amber-400/30",
    cardGlow: "hover:shadow-[0_0_20px_rgba(251,191,36,0.07)]",
  },
} as const;

// ─── Avatar con iniziali ──────────────────────────────────────────────────────
function Avatar({ user }: { user: UserWithStatus }) {
  const initials = (user.username ?? user.email ?? "??").slice(0, 2).toUpperCase();
  const status = user.status?.status ?? "OFFLINE";
  const cfg = STATUS_CONFIG[status];

  // Colore di sfondo avatar deterministico basato sull'username
  const avatarColors = [
    "from-violet-600 to-violet-800",
    "from-blue-600 to-blue-800",
    "from-emerald-600 to-emerald-800",
    "from-rose-600 to-rose-800",
    "from-amber-600 to-amber-800",
    "from-cyan-600 to-cyan-800",
  ];
  const colorIndex =
    (user.username ?? user.email ?? "?").charCodeAt(0) % avatarColors.length;
  const gradientClass = avatarColors[colorIndex];

  return (
    <div className="relative shrink-0">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.username}
          className="w-12 h-12 rounded-xl object-cover"
        />
      ) : (
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}
        >
          <span className="font-mono text-sm font-bold text-white/90 tracking-wider">
            {initials}
          </span>
        </div>
      )}
      {/* Status dot */}
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-900 ${cfg.dotClass} ${cfg.glowClass}`}
      />
    </div>
  );
}

// ─── FriendCard ───────────────────────────────────────────────────────────────
export function FriendCard({ user }: Props) {
  const status = user.status?.status ?? "OFFLINE";
  const cfg = STATUS_CONFIG[status];
  const currentGame = user.status?.currentGame;
  const isOffline = status === "OFFLINE";

  return (
    <article
      className={`
        group relative flex flex-col gap-4 p-4
        bg-zinc-900/80 backdrop-blur-sm
        border border-zinc-800/60 rounded-2xl
        transition-all duration-300 cursor-pointer
        ${cfg.cardBorder} ${cfg.cardGlow}
        hover:-translate-y-0.5
      `}
    >
      {/* Header: avatar + nome + stato */}
      <div className="flex items-center gap-3">
        <Avatar user={user} />

        <div className="flex-1 min-w-0">
          <p className="font-mono text-sm font-semibold text-white truncate tracking-tight">
            {user.username}
          </p>
          <p className="font-mono text-xs text-zinc-500 truncate">
            {user.nexusTag}
          </p>
        </div>

        {/* Badge stato */}
        <span
          className={`
            shrink-0 inline-flex items-center gap-1.5 px-2 py-0.5
            rounded-full border text-xs font-mono font-medium
            ${cfg.badgeBg} ${cfg.textClass}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass} ${status !== "OFFLINE" ? "animate-pulse" : ""}`} />
          {cfg.label}
        </span>
      </div>

      {/* Gioco corrente */}
      <div className="h-8 flex items-center">
        {currentGame ? (
          <div className="flex items-center gap-2 w-full">
            {/* Icona controller pixel-art SVG inline */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`shrink-0 ${cfg.textClass} opacity-80`}
            >
              <rect x="1" y="4" width="12" height="7" rx="2" stroke="currentColor" strokeWidth="1" />
              <line x1="4" y1="6.5" x2="4" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <line x1="2.5" y1="7.75" x2="5.5" y2="7.75" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              <circle cx="10" cy="6.75" r="0.75" fill="currentColor" />
              <circle cx="9" cy="8.5" r="0.75" fill="currentColor" />
            </svg>
            <span className={`font-mono text-xs font-medium truncate ${cfg.textClass}`}>
              {currentGame}
            </span>
          </div>
        ) : (
          <span className="font-mono text-xs text-zinc-600 italic">
            {isOffline ? "Last seen recently" : "Idle"}
          </span>
        )}
      </div>

      {/* Identità di gioco (piattaforme) */}
      {user.gameIdentities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-zinc-800/60">
          {user.gameIdentities.map((identity) => (
            <span
              key={identity.id}
              className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-zinc-400 font-mono text-[10px] uppercase tracking-widest"
            >
              {identity.platform.toLowerCase()}
            </span>
          ))}
        </div>
      )}

      {/* Bottone azione — visibile su hover */}
      <button
        className={`
          w-full py-2 rounded-xl font-mono text-xs font-semibold uppercase tracking-widest
          border transition-all duration-200 opacity-0 group-hover:opacity-100
          ${isOffline
            ? "border-zinc-700 text-zinc-500 hover:bg-zinc-800"
            : `border-current ${cfg.textClass} hover:bg-current/10`
          }
        `}
      >
        {isOffline ? "Send message" : "Join game"}
      </button>
    </article>
  );
}