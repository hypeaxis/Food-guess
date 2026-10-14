"use client";

import GuessTimer from "./GuessTimer";

// ---------------------------------------------------------------------------
// PlayingHeader — Header hiển thị thông tin vòng đấu, tiến độ và điều khiển Host
// Rule: Text-only UI, Dark Mode design tokens
// ---------------------------------------------------------------------------

type PlayingHeaderProps = {
  roundNumber: number;
  totalRounds: number;
  submittedCount: number;
  participantCount: number;
  deadlineAt: number;
  startedAt?: number;
  isHost: boolean;
  onSkipRound: () => void;
  isSkipping?: boolean;
  onTimerExpire?: () => void;
};

export default function PlayingHeader({
  roundNumber,
  totalRounds,
  submittedCount,
  participantCount,
  deadlineAt,
  startedAt,
  isHost,
  onSkipRound,
  isSkipping = false,
  onTimerExpire,
}: PlayingHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-6">
      {/* Top row: Round progress & Host Skip button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-lg border border-badge-amber-border bg-badge-amber-bg px-3 py-1 font-mono text-xs font-bold text-badge-amber-text uppercase tracking-wider">
            [ VÒNG {roundNumber} / {totalRounds} ]
          </span>

          <span className="rounded-lg border border-border-interactive bg-surface-sub px-3 py-1 font-mono text-xs font-semibold text-on-surface">
            ĐÃ NỘP: {submittedCount} / {participantCount} NGƯỜI
          </span>
        </div>

        {isHost && (
          <div>
            <button
              type="button"
              onClick={onSkipRound}
              disabled={isSkipping}
              className="rounded-lg border border-rose-border bg-rose-bg/60 px-3 py-1.5 font-mono text-xs font-semibold text-rose-text transition-all hover:bg-rose-bg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {isSkipping ? "[ ĐANG KẾT THÚC... ]" : "[ KẾT THÚC VÒNG SỚM (HOST) ]"}
            </button>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <GuessTimer
        deadlineAt={deadlineAt}
        startedAt={startedAt}
        onExpire={onTimerExpire}
      />
    </div>
  );
}
