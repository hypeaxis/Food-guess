"use client";

import type { RoomSnapshot } from "@/types";
import RoomConfigCard from "./RoomConfigCard";
import HostControls from "./HostControls";
import PlayerList from "./PlayerList";
import RoomClosedModal from "./RoomClosedModal";

// ---------------------------------------------------------------------------
// LobbyView — Sảnh chờ thi đấu tổng hợp (Phase 3)
// Rule: Text-only UI (no icons/emojis), Dark Mode design tokens, 2-column layout
// ---------------------------------------------------------------------------

type LobbyViewProps = {
  code: string;
  snapshot: RoomSnapshot;
  isHost: boolean;
  onLeaveRoom?: () => void;
  closedReason?: string | null;
  onDismissClosedRoom: () => void;
};

export default function LobbyView({
  code,
  snapshot,
  isHost,
  onLeaveRoom,
  closedReason,
  onDismissClosedRoom,
}: LobbyViewProps) {
  const isRoomClosed = Boolean(closedReason || snapshot.closedReason);

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Telemetry Indicator Sub-Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-container-low px-3 py-1 font-mono text-[11px] text-on-surface-variant">
            GIAI ĐOẠN 3: SẢNH CHỜ THI ĐẤU
          </span>
          <span className="rounded border border-emerald-border bg-emerald-bg px-2.5 py-1 font-mono text-[11px] font-semibold text-emerald-text">
            [ TRẠNG THÁI: SẴN SÀNG ]
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant">
            VAI TRÒ:
          </span>
          <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-0.5 font-mono text-xs font-bold text-badge-amber-text">
            {isHost ? "[ CHỦ PHÒNG (HOST) ]" : "[ NGƯỜI CHƠI ]"}
          </span>
          {onLeaveRoom && (
            <button
              type="button"
              onClick={onLeaveRoom}
              className="rounded border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer sm:hidden"
            >
              [ RỜI ]
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column (5/12): Room Config & Host Actions */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <RoomConfigCard code={code} config={snapshot.config} />
          <HostControls
            isHost={isHost}
            participantCount={snapshot.participants.length}
          />
        </div>

        {/* Right Column (7/12): Realtime Participants List */}
        <div className="lg:col-span-7">
          <PlayerList
            participants={snapshot.participants}
            viewerId={snapshot.viewer?.id}
          />
        </div>
      </div>

      {/* Closed Room Alert Modal */}
      <RoomClosedModal
        isOpen={isRoomClosed}
        reason={closedReason || snapshot.closedReason}
        onConfirm={onDismissClosedRoom}
      />
    </div>
  );
}
