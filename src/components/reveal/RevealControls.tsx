"use client";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { nextRound } from "@/store/thunks/gameThunks";

// ---------------------------------------------------------------------------
// RevealControls — Điều khiển chuyển vòng (Tự động 5s hoặc nút bấm của Host)
// Phase 5: Round Reveal Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type RevealControlsProps = {
  autoNextRound: boolean;
  isHost: boolean;
  currentRound: number;
  totalRounds: number;
};

export function RevealControls({
  autoNextRound,
  isHost,
  currentRound,
  totalRounds,
}: RevealControlsProps) {
  const dispatch = useAppDispatch();
  const [prevRound, setPrevRound] = useState<number>(currentRound);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isFinalRound = currentRound >= totalRounds;

  // Reset secondsLeft during render when round changes (React recommended pattern)
  if (prevRound !== currentRound) {
    setPrevRound(currentRound);
    setSecondsLeft(5);
  }

  // Auto next round countdown (5s)
  useEffect(() => {
    if (!autoNextRound) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoNextRound, currentRound]);

  const handleNextRound = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await dispatch(nextRound()).unwrap();
    } catch {
      // Error is caught and toasted by gameThunks
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-on-surface-variant uppercase tracking-wider">
          Điều hướng vòng đấu:
        </span>
        <span className="text-primary-container font-bold">
          {isFinalRound ? "[ VÒNG CUỐI CÙNG ]" : `[ TIẾP TỤC: VÒNG ${currentRound + 1} ]`}
        </span>
      </div>

      {autoNextRound ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-on-surface">
              {secondsLeft > 0
                ? `[ TỰ ĐỘNG CHUYỂN VÒNG SAU ${secondsLeft}S ]`
                : "[ ĐANG CHỜ MÁY CHỦ BẮT ĐẦU VÒNG MỚI... ]"}
            </span>
            <span className="font-bold text-primary-container">
              {secondsLeft}s / 5s
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sub border border-border-subtle">
            <div
              className="h-full bg-primary-container transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / 5) * 100}%` }}
            />
          </div>
        </div>
      ) : isHost ? (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleNextRound}
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-xl font-mono text-sm font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isSubmitting
                ? "bg-surface-sub border border-border-subtle text-on-surface-variant cursor-not-allowed opacity-60"
                : "bg-primary-container text-black hover:bg-amber-400 active:scale-[0.99] shadow-lg shadow-amber-500/10"
            }`}
          >
            {isSubmitting
              ? "[ ĐANG GỬI LỆNH... ]"
              : isFinalRound
              ? "[ XEM BẢNG XẾP HẠNG CHUNG CUỘC ]"
              : "[ VÒNG TIẾP THEO ]"}
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border-interactive bg-surface-sub py-3 px-4 text-center">
          <p className="font-mono text-xs text-on-surface-variant animate-pulse">
            [ ĐANG CHỜ CHỦ PHÒNG CHUYỂN TIẾP VÒNG MỚI... ]
          </p>
        </div>
      )}
    </div>
  );
}
