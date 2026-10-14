"use client";

import React from "react";
import type { FoodGuessScoreEvent } from "@/types";

// ---------------------------------------------------------------------------
// ScoreFeed — Bảng tin sự kiện nộp bài thời gian thực của cả phòng
// Rule: Text-only UI, Dark Mode design tokens, React.memo
// ---------------------------------------------------------------------------

type ScoreFeedProps = {
  events?: FoodGuessScoreEvent[];
  viewerStreak?: number;
  className?: string;
};

function ScoreFeedComponent({
  events = [],
  viewerStreak = 0,
  className = "",
}: ScoreFeedProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-6 ${className}`}
    >
      {/* Header and Personal Streak */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
            BẢNG TIN VÒNG ĐẤU
          </span>
          <span className="rounded border border-emerald-border bg-emerald-bg px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-text">
            [ TRỰC TIẾP ]
          </span>
        </div>

        {viewerStreak > 0 && (
          <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2 py-0.5 font-mono text-[11px] font-bold text-badge-amber-text">
            CHUỖI ĐÚNG: x{viewerStreak}
          </span>
        )}
      </div>

      {/* Events Feed List */}
      <div className="flex max-h-[320px] flex-col gap-2 overflow-y-auto pr-1">
        {events.length > 0 ? (
          events.map((evt) => (
            <div
              key={evt.id}
              className="flex items-center justify-between rounded-xl border border-border-interactive/40 bg-surface-sub p-2.5 font-mono text-xs transition-colors hover:border-primary-container/40"
            >
              <div className="flex items-center gap-2">
                <span className="font-bold text-on-surface">
                  {evt.participantName}
                </span>
                <span
                  className={
                    evt.isCorrect ? "text-emerald-text" : "text-rose-text"
                  }
                >
                  {evt.isCorrect ? "[ ĐOÁN ĐÚNG ]" : "[ ĐOÁN SAI ]"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {evt.comboApplied && (
                  <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-1.5 py-0.5 text-[10px] font-bold text-badge-amber-text">
                    COMBO x{evt.streak}
                  </span>
                )}
                {evt.points > 0 && (
                  <span className="font-bold text-primary-container">
                    +{evt.points}đ
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border-subtle p-6 text-center font-mono text-xs text-on-surface-variant">
            [ CHƯA CÓ AI NỘP ĐÁP ÁN TRONG VÒNG NÀY ]
          </div>
        )}
      </div>

      <div className="pt-2 text-right font-mono text-[10px] text-on-surface-variant">
        CẬP NHẬT TỰ ĐỘNG QUA WEBSOCKET
      </div>
    </div>
  );
}

export const ScoreFeed = React.memo(ScoreFeedComponent);
export default ScoreFeed;
