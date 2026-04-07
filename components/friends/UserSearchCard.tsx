"use client";

// =============================================================================
// Nexus — components/friends/UserSearchCard.tsx
// Client Component — card risultato di ricerca con bottone "Aggiungi amico".
// Gestisce tutti gli stati del bottone: none → sent, incoming, friends, blocked.
// Chiama sendFriendRequest dalla Server Action — nessuna API route custom.
// =============================================================================

import { useState, useTransition } from "react";
import { sendFriendRequest } from "@/lib/actions/friendship";
import { UserSearchResult } from "@/lib/db/queries";
import { FriendshipStatus } from "@prisma/client";

type Props = {
  user: UserSearchResult;
  currentUserId: string;
};

// ── Stato iniziale derivato dai dati della query ──────────────────────────────
// searchUsersByTag già porta con sé le friendship esistenti (select chirurgico).
// Questo evita una query separata al click — lo stato parte già corretto.
type ButtonState = "none" | "sent" | "incoming" | "friends" | "blocked" | "error";

function deriveInitialState(user: UserSearchResult): ButtonState {
  // receivedFriendships = richieste dove io (currentUser) sono il mittente
  const sent = user.receivedFriendships[0];
  if (sent) {
    if (sent.status === FriendshipStatus.ACCEPTED) return "friends";
    if (sent.status === FriendshipStatus.PENDING)  return "sent";
    if (sent.status === FriendshipStatus.BLOCKED)  return "blocked";
  }
  // sentFriendships = richieste dove io sono il destinatario
  const incoming = user.sentFriendships[0];
  if (incoming) {
    if (incoming.status === FriendshipStatus.ACCEPTED) return "friends";
    if (incoming.status === FriendshipStatus.PENDING)  return "incoming";
  }
  return "none";
}

// ── Config visiva per ogni stato ──────────────────────────────────────────────
const BTN: Record<ButtonState, { label: string; cls: string; disabled: boolean }> = {
  none:     { label: "Aggiungi",        disabled: false, cls: "border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/60" },
  sent:     { label: "Inviata \u2713",  disabled: true,  cls: "border-slate-700 text-slate-500 cursor-default" },
  incoming: { label: "Richiesta →",     disabled: true,  cls: "border-emerald-500/40 text-emerald-400 cursor-default" },
  friends:  { label: "Gi\u00e0 amici",  disabled: true,  cls: "border-slate-700 text-slate-500 cursor-default" },
  blocked:  { label: "Non disponibile", disabled: true,  cls: "border-slate-800 text-slate-700 cursor-default" },
  error:    { label: "Riprova",         disabled: false, cls: "border-red-500/40 text-red-400 hover:bg-red-500/10" },
};

// ── Status dot ────────────────────────────────────────────────────────────────
const DOT: Record<string, string> = {
  ONLINE:  "bg-emerald-400 shadow-[0_0_5px_theme(colors.emerald.400)]",
  IN_GAME: "bg-purple-400  shadow-[0_0_5px_theme(colors.purple.400)]",
  AWAY:    "bg-amber-400",
  OFFLINE: "bg-slate-600",
};

// ── Componente ────────────────────────────────────────────────────────────────
export function UserSearchCard({ user, currentUserId }: Props) {
  const [state, setState] = useState<ButtonState>(() => deriveInitialState(user));
  const [isPending, startTransition] = useTransition();

  const initials   = user.username.slice(0, 2).toUpperCase();
  const statusKey  = user.status?.status ?? "OFFLINE";
  const dotClass   = DOT[statusKey] ?? DOT.OFFLINE;
  const btn        = BTN[state];

  function handleAdd() {
    if (btn.disabled || isPending) return;

    startTransition(async () => {
      const result = await sendFriendRequest(currentUserId, user.id);

      if (result.success) {
        setState("sent");
        return;
      }

      // Mappa ogni codice di errore allo stato visivo corretto
      switch (result.code) {
        case "ALREADY_FRIENDS":   setState("friends");  break;
        case "ALREADY_EXISTS":    setState("sent");     break;
        case "PENDING_INCOMING":  setState("incoming"); break; // lui ha già mandato a noi
        case "SELF_REQUEST":      setState("blocked");  break;
        default:                  setState("error");
      }
    });
  }

  return (
    <article className="
      flex items-center gap-4 px-4 py-3
      bg-slate-900/70 border border-slate-800/60 rounded-2xl
      hover:border-slate-700/60 hover:bg-slate-900
      transition-all duration-200
    ">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-mono text-xs font-bold text-white/90">{initials}</span>
          )}
        </div>
        {/* Status dot */}
        <span
          className={`
            absolute -bottom-px -right-px
            w-3 h-3 rounded-full border-2 border-slate-900
            ${dotClass}
          `}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-white truncate">
          {user.username}
        </p>
        <p className="font-mono text-xs text-slate-500 truncate">
          {user.nexusTag}
          {user.status?.currentGame && (
            <span className="text-purple-400/80"> · {user.status.currentGame}</span>
          )}
        </p>
      </div>

      {/* Tooltip per stato incoming */}
      {state === "incoming" && (
        <span className="hidden sm:block font-mono text-[10px] text-emerald-600 shrink-0">
          Ha mandato a te
        </span>
      )}

      {/* Bottone */}
      <button
        onClick={handleAdd}
        disabled={btn.disabled || isPending}
        aria-label={`${btn.label} ${user.username}`}
        className={`
          shrink-0 px-3 py-1.5 rounded-xl
          border font-mono text-xs font-semibold uppercase tracking-wider
          transition-all duration-200
          disabled:opacity-60
          ${btn.cls}
          ${isPending ? "animate-pulse" : ""}
        `}
      >
        {isPending ? "…" : btn.label}
      </button>
    </article>
  );
}