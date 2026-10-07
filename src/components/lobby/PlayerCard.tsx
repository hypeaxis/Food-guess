"use client";

import React from "react";
import type { Participant } from "@/types";

// ---------------------------------------------------------------------------
// PlayerCard — Thẻ hiển thị một người chơi trong danh sách phòng
// Rule: Text-only UI (no icons/emojis), Dark Mode design tokens, React.memo
// ---------------------------------------------------------------------------

type PlayerCardProps = {
  player: Participant;
  isViewer?: boolean;
};

function PlayerCardComponent({ player, isViewer = false }: PlayerCardProps) {
  const initialLetter = player.name ? player.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3.5 transition-all ${
        isViewer
          ? "border-primary-container/40 bg-surface-sub shadow-sm"
          : "border-border-subtle bg-surface-card hover:border-border-interactive"
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Text Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 font-mono text-sm font-black text-neutral-950 shadow">
          {initialLetter}
        </div>

        {/* Player Name and Badges */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-bold text-on-surface">
              {player.name}
            </span>
            {isViewer && (
              <span className="rounded border border-primary-container/40 bg-primary-container/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-container">
                [ BẠN ]
              </span>
            )}
            {player.isHost && (
              <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-1.5 py-0.5 font-mono text-[10px] font-bold text-badge-amber-text">
                [ CHỦ PHÒNG ]
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant">
            ID: {player.id.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Online / Offline status */}
      <div className="shrink-0 font-mono text-xs">
        <span
          className={
            player.isOnline
              ? "text-emerald-text font-semibold"
              : "text-neutral-500 font-normal"
          }
        >
          {player.isOnline ? "[ TRỰC TUYẾN ]" : "[ NGOẠI TUYẾN ]"}
        </span>
      </div>
    </div>
  );
}

export const PlayerCard = React.memo(PlayerCardComponent);
export default PlayerCard;
