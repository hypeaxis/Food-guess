"use client";

import { useState } from "react";
import type { RoomSnapshot } from "@/types";
import { PodiumLeaderboard } from "./PodiumLeaderboard";
import { FinalLeaderboard } from "./FinalLeaderboard";
import { PastRoundsAccordion } from "./PastRoundsAccordion";
import { FinishedControls } from "./FinishedControls";

// ---------------------------------------------------------------------------
// FinishedView — Toàn bộ giao diện màn hình kết thúc trận đấu Finished
// Phase 5: Finished Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type FinishedViewProps = {
  snapshot: RoomSnapshot;
  isHost: boolean;
  onLeaveRoom: () => void;
};

type FinishedTab = "leaderboard" | "history";

export function FinishedView({
  snapshot,
  isHost,
  onLeaveRoom,
}: FinishedViewProps) {
  const [activeTab, setActiveTab] = useState<FinishedTab>("leaderboard");

  const participants = snapshot.participants ?? [];
  const pastResults = snapshot.foodGuessPastResults ?? [];
  const config = snapshot.config;
  const viewer = snapshot.viewer;

  const totalRounds = config?.totalRounds ?? 10;

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-badge-amber-border/40 bg-surface-card p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
            [ TRẬN ĐẤU HOÀN TẤT ]
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-on-surface">
            KẾT THÚC {totalRounds} VÒNG TRANH TÀI
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewer && (
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-1 font-mono text-xs text-on-surface-variant">
              {isHost ? "[ BẠN: CHỦ PHÒNG ]" : "[ BẠN: NGƯỜI CHƠI ]"}
            </span>
          )}
        </div>
      </section>

      {/* Top 3 Podium Section */}
      <PodiumLeaderboard
        participants={participants}
        viewerId={viewer?.id}
        totalRounds={totalRounds}
      />

      {/* Tabs Navigation: Bảng tổng sắp vs Lịch sử các vòng */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("leaderboard")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "leaderboard"
                ? "bg-primary-container text-black shadow-md"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ BẢNG TỔNG SẮP ({participants.length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === "history"
                ? "bg-primary-container text-black shadow-md"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ LỊCH SỬ CÁC VÒNG ({pastResults.length}) ]
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "leaderboard" ? (
          <FinalLeaderboard
            participants={participants}
            viewerId={viewer?.id}
            totalRounds={totalRounds}
          />
        ) : (
          <PastRoundsAccordion
            pastResults={pastResults}
            viewerId={viewer?.id}
          />
        )}
      </div>

      {/* Finished Controls (Rematch & Leave) */}
      <FinishedControls isHost={isHost} onLeaveRoom={onLeaveRoom} />
    </div>
  );
}
