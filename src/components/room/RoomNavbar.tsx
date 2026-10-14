"use client";

import type { RoomPhase } from "@/types";

export interface RoomNavbarProps {
  code: string;
  phase?: RoomPhase | null;
  onLeaveRoom: () => void;
}

/**
 * RoomNavbar — Thanh điều hướng trên cùng của phòng thi đấu (SRP & ISP)
 * Chịu trách nhiệm hiển thị mã phòng, badge trạng thái vòng chơi và nút rời phòng
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function RoomNavbar({ code, phase, onLeaveRoom }: RoomNavbarProps) {
  const getPhaseText = (p?: RoomPhase | null) => {
    switch (p) {
      case "lobby":
        return "[ SẢNH CHỜ ]";
      case "playing":
        return "[ ĐANG TRANH TÀI ]";
      case "roundReveal":
        return "[ TỔNG KẾT VÒNG ]";
      case "finished":
        return "[ KẾT THÚC ]";
      default:
        return `[ TRẠNG THÁI: ${p ?? "ĐANG TẢI"} ]`;
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-canvas-base/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-base font-bold text-primary-container sm:text-lg">
            PHÒNG: {code}
          </span>
          <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
            {getPhaseText(phase)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLeaveRoom}
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 cursor-pointer"
          >
            [ RỜI PHÒNG ]
          </button>
        </div>
      </div>
    </header>
  );
}
