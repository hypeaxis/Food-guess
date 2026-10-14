"use client";

import { useEffect, useState, useRef } from "react";

// ---------------------------------------------------------------------------
// GuessTimer — Bộ đếm thời gian đếm ngược chính xác theo deadlineAt
// Rule: Text-only UI, Dark Mode design tokens, cảnh báo <= 5s
// ---------------------------------------------------------------------------

type GuessTimerProps = {
  startedAt?: number;
  deadlineAt: number;
  onExpire?: () => void;
  className?: string;
};

export default function GuessTimer({
  startedAt,
  deadlineAt,
  onExpire,
  className = "",
}: GuessTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    return Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000));
  });

  const hasExpiredRef = useRef(false);

  // Total duration in seconds for progress bar calculation
  const totalDuration = startedAt
    ? Math.max(1, Math.round((deadlineAt - startedAt) / 1000))
    : Math.max(1, remainingSeconds);

  useEffect(() => {
    hasExpiredRef.current = false;

    const updateTimer = () => {
      const now = Date.now();
      const diffMs = deadlineAt - now;
      const seconds = Math.max(0, Math.ceil(diffMs / 1000));
      setRemainingSeconds(seconds);

      if (seconds <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        if (onExpire) {
          onExpire();
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 200);

    return () => {
      clearInterval(interval);
    };
  }, [deadlineAt, onExpire]);

  const isLowTime = remainingSeconds <= 5 && remainingSeconds > 0;
  const isExpired = remainingSeconds <= 0;
  const percent = Math.max(
    0,
    Math.min(100, (remainingSeconds / totalDuration) * 100)
  );

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-on-surface-variant uppercase">
          THỜI GIAN CÒN LẠI
        </span>

        <span
          className={`rounded px-2 py-0.5 font-bold uppercase transition-colors ${
            isExpired
              ? "border border-rose-border bg-rose-bg text-rose-text"
              : isLowTime
              ? "border border-rose-border bg-rose-bg text-rose-text animate-pulse"
              : "border border-badge-amber-border bg-badge-amber-bg text-primary-container"
          }`}
        >
          {isExpired
            ? "[ HẾT GIỜ ]"
            : `[ CÒN: ${remainingSeconds}S ]`}
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-sub">
        <div
          className={`h-full transition-all duration-200 ${
            isExpired || isLowTime ? "bg-rose-500" : "bg-primary-container"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
