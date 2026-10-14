"use client";

import { memo, useMemo } from "react";
import type { Participant } from "@/types";

export interface MiniScoreboardProps {
  participants: Participant[];
  viewerId?: string;
  className?: string;
}

/**
 * MiniScoreboard — Bảng điểm trực tiếp thu nhỏ trong màn thi đấu (SRP & ISP)
 * Hiển thị xếp hạng tối đa 50 người, sắp xếp điểm giảm dần
 * Áp dụng React.memo để ngăn re-render không cần thiết khi bộ đếm câu hỏi chạy
 */
export const MiniScoreboard = memo(function MiniScoreboard({
  participants,
  viewerId,
  className = "",
}: MiniScoreboardProps) {
  // Sắp xếp người chơi theo điểm giảm dần
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }, [participants]);

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-3 font-mono text-xs">
        <span className="font-bold uppercase tracking-wider text-on-surface">
          BẢNG ĐIỂM PHÒNG THI
        </span>
        <span className="text-on-surface-variant">
          ({participants.length} NGƯỜI)
        </span>
      </div>

      <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1">
        {sortedParticipants.map((p, idx) => (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-xl border p-2.5 font-mono text-xs transition-colors ${
              p.id === viewerId
                ? "border-primary-container/40 bg-surface-sub"
                : "border-border-interactive/30 bg-surface-sub/60"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-5 font-bold text-on-surface-variant">
                #{idx + 1}
              </span>
              <span className="font-semibold text-on-surface">{p.name}</span>
              {p.id === viewerId && (
                <span className="rounded border border-primary-container/40 bg-primary-container/10 px-1 py-0.2 text-[10px] font-bold text-primary-container">
                  BẠN
                </span>
              )}
            </div>

            <span className="font-bold text-primary-container">
              {p.score ?? 0}đ
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});
