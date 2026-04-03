"use client";

// =============================================================================
// Nexus — components/friends/UserSearchCard.tsx
// Client Component — gestisce lo stato del bottone dopo il click
// =============================================================================

import { useState, useTransition } from "react";
import { sendFriendRequest } from "@/lib/actions/friendship";
import { UserSearchResult } from "@/lib/db/queries";
import { FriendshipStatus } from "@prisma/client";

type Props = {
  user: UserSearchResult;
  currentUserId: string;
};

// ─── Deriva lo stato iniziale del bottone dai dati della query ────────────────
function getInitialButtonState(user: UserSearchResult, currentUserId: string) {
  // Ho già mandato una richiesta a questo utente
  const sent = user.receivedFriendships[0];
  if (sent) {
    if (sent.status === FriendshipStatus.ACCEPTED) return "friends"   as const;
    if (sent.status === FriendshipStatus.PENDING)  return "sent"      as const;
    if (sent.status === FriendshipStatus.BLOCKED)  return "blocked"   as const;
  }
  // Questo utente mi ha già mandato una richiesta
  const incoming = user.sentFriendships[0];
  if (incoming) {
    if (incoming.status === FriendshipStatus.ACCEPTED) return "friends"  as const;
    if (incoming.status === FriendshipStatus.PENDING)  return "incoming" as const;
  }
  return "none" as const;
}

type ButtonState = "none" | "sent" | "incoming" | "friends" | "blocked" | "error";

// ─── Configurazione visiva per ogni stato ────────────────────────────────────
const BUTTON_CONFIG: Record<
  ButtonState,
  { label: string; className: string; disabled: boolean }
> = {
  none: {
    label: "Aggiungi",
    className:
      "border-violet-400/40 text-violet-400 hover:bg-violet-400/10 hover:border-violet-400/70 cursor-pointer",
    disabled: false,
  },
  sent: {
    label: "Inviata ✓",
    className: "border-zinc-700 text-zinc-500 cursor-default",
    disabled: true,
  },
  incoming: {
    label: "Rispendi →",
    className: "border-emerald-400/40 text-emerald-400 cursor-default",
    disabled: true,
  },
  friends: {
    label: "Già amici ✓",
    className: "border-zinc-700 text-zinc-500 cursor-default",
    disabled: true,
  },
  blocked: {
    label: "Non disponibile",
    className: "border-zinc-800 text-zinc-700 cursor-default",
    disabled: true,
  },
  error: {
    label: "Riprova",
    className:
      "border-red-400/40 text-red-400 hover:bg-red-400/10 cursor-pointer",
    disabled: false,
  },
};

// ─── Status dot ──────────────────────────────────────────────────────────────
const STATUS_DOT: Record<string, string> = {
  ONLINE:  "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,.5)]",
  IN_GAME: "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,.6)]",
  OFFLINE: "bg-zinc-600",
  AWAY:    "bg-amber-400",
};

// ─── Component ────────────────────────────────────────────────────────────────
export function UserSearchCard({ user, currentUserId }: Props) {
  const [buttonState, setButtonState] = useState<ButtonState>(
    () => getInitialButtonState(user, currentUserId)
  );
  const [isPending, startTransition] = useTransition();

  const initials = user.username.slice(0, 2).toUpperCase();
  const statusKey = user.status?.status ?? "OFFLINE";
  const dotClass = STATUS_DOT[statusKey] ?? STATUS_DOT.OFFLINE;
  const cfg = BUTTON_CONFIG[buttonState];

  async function handleAddFriend() {
    if (cfg.disabled || isPending) return;

    startTransition(async () => {
      const result = await sendFriendRequest(currentUserId, user.id);

      if (result.success) {
        setButtonState("sent");
        return;
      }

      switch (result.code) {
        case "ALREADY_FRIENDS":
          setButtonState("friends");
          break;
        case "ALREADY_EXISTS":
          setButtonState("sent");
          break;
        case "PENDING_INCOMING":
          // L'altro ci ha già mandato una richiesta — segnalalo
          setButtonState("incoming");
          break;
        default:
          setButtonState("error");
      }
    });
  }

  return (
    <article className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/60 hover:border-zinc-700/60 transition-all duration-200">

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-violet-900 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-10 h-10 rounded-xl object-cover"
            />
          ) : (
            <span className="font-mono text-xs font-bold text-white/90">
              {initials}
            </span>
          )}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-900 ${dotClass}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-white truncate">
          {user.username}
        </p>
        <p className="font-mono text-xs text-zinc-500 truncate">
          {user.nexusTag}
          {user.status?.currentGame && (
            <span className="text-violet-400/80">
              {" "}· {user.status.currentGame}
            </span>
          )}
        </p>
      </div>

      {/* Bottone */}
      <button
        onClick={handleAddFriend}
        disabled={cfg.disabled || isPending}
        className={`
          shrink-0 px-3 py-1.5 rounded-lg
          border font-mono text-xs font-semibold uppercase tracking-widest
          transition-all duration-200
          ${cfg.className}
          ${isPending ? "opacity-50" : ""}
        `}
      >
        {isPending ? "..." : cfg.label}
      </button>
    </article>
  );
}