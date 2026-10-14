"use client";

import type { RoomPhase, RoomSnapshot } from "@/types";
import { LobbyView } from "@/components/lobby";
import { PlayingView } from "@/components/playing";
import { RevealView } from "@/components/reveal";
import { FinishedView } from "@/components/finished";

export interface PhasePreviewPanelProps {
  selectedPhase: RoomPhase;
  currentSnapshot: RoomSnapshot;
  isHostView: boolean;
  testRoomCode: string;
}

/**
 * PhasePreviewPanel — Khu vực hiển thị trực quan các phase của game (SRP & LSP)
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function PhasePreviewPanel({
  selectedPhase,
  currentSnapshot,
  isHostView,
  testRoomCode,
}: PhasePreviewPanelProps) {
  return (
    <div className="space-y-6">
      {/* Room info header bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">
            Mã phòng
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-wider">
            {currentSnapshot.code}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
            <span className="text-neutral-400">Vòng: </span>
            <span className="font-semibold text-white">
              {currentSnapshot.foodGuessRound?.roundNumber ||
                currentSnapshot.foodGuessReveal?.roundNumber ||
                1}
              /{currentSnapshot.config.totalRounds}
            </span>
          </div>

          <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
            <span className="text-neutral-400">Thời gian: </span>
            <span className="font-semibold text-white">
              {currentSnapshot.config.answerTimeSeconds}s
            </span>
          </div>

          <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
            <span className="text-neutral-400">Combo: </span>
            <span
              className={`font-semibold ${
                currentSnapshot.config.comboStreakEnabled
                  ? "text-emerald-400"
                  : "text-neutral-500"
              }`}
            >
              {currentSnapshot.config.comboStreakEnabled ? "Bật" : "Tắt"}
            </span>
          </div>
        </div>
      </div>

      {/* Phase 1: LOBBY VIEW PREVIEW */}
      {selectedPhase === "lobby" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-badge-amber-border bg-badge-amber-bg p-3 font-mono text-xs text-badge-amber-text flex items-center justify-between">
            <span>[ DEV PREVIEW: COMPONENT SẢNH CHỜ LOBBY ]</span>
            <span>
              GÓC NHÌN: {isHostView ? "[ CHỦ PHÒNG (HOST) ]" : "[ NGƯỜI CHƠI THƯỜNG ]"}
            </span>
          </div>
          <LobbyView
            code={testRoomCode || "TEST01"}
            snapshot={currentSnapshot}
            isHost={isHostView}
            onLeaveRoom={() => {
              alert("[ DEV PREVIEW: Đã gọi hành động Rời phòng ]");
            }}
            closedReason={null}
            onDismissClosedRoom={() => {}}
          />
        </div>
      )}

      {/* Phase 2: PLAYING VIEW PREVIEW */}
      {selectedPhase === "playing" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-badge-amber-border bg-badge-amber-bg p-3 font-mono text-xs text-badge-amber-text flex items-center justify-between">
            <span>[ DEV PREVIEW: COMPONENT TRANH TÀI PLAYING ]</span>
            <span>
              GÓC NHÌN: {isHostView ? "[ CHỦ PHÒNG (HOST) ]" : "[ NGƯỜI CHƠI THƯỜNG ]"}
            </span>
          </div>
          <PlayingView snapshot={currentSnapshot} isHost={isHostView} />
        </div>
      )}

      {/* Phase 3: REVEAL VIEW PREVIEW */}
      {selectedPhase === "roundReveal" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-purple-border/60 bg-purple-bg p-3 font-mono text-xs text-purple-text flex items-center justify-between">
            <span>[ DEV PREVIEW: COMPONENT TỔNG KẾT VÒNG REVEAL ]</span>
            <span>
              GÓC NHÌN: {isHostView ? "[ CHỦ PHÒNG (HOST) ]" : "[ NGƯỜI CHƠI THƯỜNG ]"}
            </span>
          </div>
          <RevealView snapshot={currentSnapshot} isHost={isHostView} />
        </div>
      )}

      {/* Phase 4: FINISHED VIEW PREVIEW */}
      {selectedPhase === "finished" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-badge-amber-border bg-badge-amber-bg p-3 font-mono text-xs text-badge-amber-text flex items-center justify-between">
            <span>[ DEV PREVIEW: COMPONENT KẾT THÚC FINISHED ]</span>
            <span>
              GÓC NHÌN: {isHostView ? "[ CHỦ PHÒNG (HOST) ]" : "[ NGƯỜI CHƠI THƯỜNG ]"}
            </span>
          </div>
          <FinishedView
            snapshot={currentSnapshot}
            isHost={isHostView}
            onLeaveRoom={() => {}}
          />
        </div>
      )}
    </div>
  );
}
