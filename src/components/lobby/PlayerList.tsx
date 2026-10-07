"use client";

import React, { useMemo } from "react";
import type { Participant } from "@/types";
import PlayerCard from "./PlayerCard";

// ---------------------------------------------------------------------------
// PlayerList — Danh sách toàn bộ người chơi tham gia trong phòng
// Rule: Text-only UI, responsive, scrollable up to 50 players, React.memo
// ---------------------------------------------------------------------------

type PlayerListProps = {
  participants: Participant[];
  viewerId?: string;
};

function PlayerListComponent({ participants, viewerId }: PlayerListProps) {
  const onlineCount = useMemo(() => {
    return participants.filter((p) => p.isOnline).length;
  }, [participants]);

  return (
    <div className="flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-xl backdrop-blur-sm sm:p-7">
      {/* Header & Stats */}
      <div className="flex flex-col gap-2 pb-4 border-b border-border-subtle sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
              DANH SÁCH NGƯỜI CHƠI
            </h2>
            <span className="font-mono text-xs font-bold text-primary-container">
              ({participants.length}/50)
            </span>
          </div>
          <p className="mt-0.5 font-mono text-[11px] text-on-surface-variant">
            Đồng bộ trạng thái người chơi tự động qua máy chủ
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded border border-emerald-border bg-emerald-bg px-2.5 py-1 font-semibold text-emerald-text">
            [ {onlineCount} TRỰC TUYẾN ]
          </span>
          {participants.length - onlineCount > 0 && (
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-1 text-neutral-400">
              [ {participants.length - onlineCount} NGOẠI TUYẾN ]
            </span>
          )}
        </div>
      </div>

      {/* Players List */}
      <div className="mt-4 flex flex-col gap-2.5 max-h-[440px] overflow-y-auto pr-1">
        {participants.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            isViewer={viewerId === player.id}
          />
        ))}

        {participants.length === 0 && (
          <div className="rounded-xl border border-dashed border-border-subtle p-8 text-center font-mono text-xs text-on-surface-variant">
            [ CHƯA CÓ DỮ LIỆU NGƯỜI CHƠI NÀO TRONG PHÒNG ]
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
        <span>SỨC CHỨA TỐI ĐA: 50 NGƯỜI</span>
        <span>TRẠNG THÁI: {participants.length >= 50 ? "[ ĐÃ ĐẦY ]" : "[ CÒN CHỖ ]"}</span>
      </div>
    </div>
  );
}

export const PlayerList = React.memo(PlayerListComponent);
export default PlayerList;
