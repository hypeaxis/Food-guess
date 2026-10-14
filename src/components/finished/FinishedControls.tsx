"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { rematch } from "@/store/thunks/gameThunks";

// ---------------------------------------------------------------------------
// FinishedControls — Nút điều khiển kết thúc (Rematch cho Host & Rời phòng)
// Phase 5: Finished Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type FinishedControlsProps = {
  isHost: boolean;
  onLeaveRoom: () => void;
};

export function FinishedControls({
  isHost,
  onLeaveRoom,
}: FinishedControlsProps) {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleRematch = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dispatch(rematch()).unwrap();
    } catch {
      // Error handled by gameThunks toast
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left: Info or Waiting notice */}
        <div>
          <span className="font-mono text-xs text-on-surface-variant block uppercase tracking-wider">
            Điều hướng kết thúc trận đấu:
          </span>
          {isHost ? (
            <p className="font-mono text-xs text-primary-container font-semibold mt-0.5">
              Bạn là Chủ phòng. Bạn có thể khởi động lại ván đấu mới giữ nguyên người chơi.
            </p>
          ) : (
            <p className="font-mono text-xs text-on-surface-variant mt-0.5 animate-pulse">
              [ ĐANG CHỜ CHỦ PHÒNG KHỞI TẠO LẠI HOẶC BẠN CÓ THỂ RỜI PHÒNG ]
            </p>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Host Rematch button */}
          {isHost && (
            <button
              type="button"
              onClick={handleRematch}
              disabled={isSubmitting}
              className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isSubmitting
                  ? "bg-surface-sub border border-border-subtle text-on-surface-variant cursor-not-allowed opacity-60"
                  : "bg-primary-container text-black hover:bg-amber-400 active:scale-[0.99] shadow-lg shadow-amber-500/10"
              }`}
            >
              {isSubmitting
                ? "[ ĐANG KHỞI TẠO LẠI... ]"
                : "[ CHƠI LẠI TRẬN MỚI (REMATCH) ]"}
            </button>
          )}

          {/* Leave room button for everyone */}
          <button
            type="button"
            onClick={onLeaveRoom}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-rose-500/40 bg-rose-500/10 font-mono text-xs sm:text-sm font-semibold text-rose-400 hover:bg-rose-500/20 active:scale-[0.99] transition-all cursor-pointer"
          >
            [ RỜI PHÒNG ]
          </button>
        </div>
      </div>
    </div>
  );
}
