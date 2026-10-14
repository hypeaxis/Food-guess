"use client";

import { useState } from "react";
import type { PastRoundEntry } from "@/types";

// ---------------------------------------------------------------------------
// PastRoundsAccordion — Lịch sử chi tiết kết quả từng vòng đã diễn ra
// Phase 5: Finished Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type PastRoundsAccordionProps = {
  pastResults: PastRoundEntry[];
  viewerId?: string;
};

export function PastRoundsAccordion({
  pastResults,
  viewerId,
}: PastRoundsAccordionProps) {
  // Store which rounds are currently expanded
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>(() => {
    // Default: expand the first entry if available
    if (pastResults.length > 0) {
      return { [pastResults[0].roundNumber]: true };
    }
    return {};
  });

  const toggleRound = (roundNum: number) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNum]: !prev[roundNum],
    }));
  };

  if (!pastResults || pastResults.length === 0) {
    return (
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-xl text-center space-y-2">
        <span className="font-mono text-xs font-bold text-on-surface-variant block uppercase">
          [ LỊCH SỬ CÁC VÒNG ĐẤU ]
        </span>
        <p className="font-mono text-xs text-on-surface-variant">
          Không có dữ liệu lịch sử các vòng đấu cũ hoặc trận đấu chưa kết thúc vòng nào.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
          [ LỊCH SỬ CÁC VÒNG ĐÃ ĐẤU ]
        </span>
        <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
          {pastResults.length} vòng đấu
        </span>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {pastResults.map((entry) => {
          const isExpanded = Boolean(expandedRounds[entry.roundNumber]);
          const correctCount = entry.results.filter((r) => r.isCorrect).length;

          return (
            <div
              key={entry.roundNumber}
              className="rounded-xl border border-border-subtle bg-surface-sub overflow-hidden transition-all"
            >
              {/* Accordion Header (Click to toggle) */}
              <button
                type="button"
                onClick={() => toggleRound(entry.roundNumber)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-mono text-xs hover:bg-surface-card/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-bold text-badge-amber-text">
                    [ VÒNG {entry.roundNumber} ]
                  </span>
                  <span className="text-on-surface font-semibold">
                    {correctCount} / {entry.results.length} người đoán đúng
                  </span>
                </div>

                <span className="rounded border border-border-subtle bg-surface-card px-2 py-0.5 text-on-surface-variant text-[11px] font-bold">
                  {isExpanded ? "[ THU GỌN - ]" : "[ XEM CHI TIẾT + ]"}
                </span>
              </button>

              {/* Accordion Body */}
              {isExpanded && (
                <div className="border-t border-border-subtle/70 p-3 sm:p-4 bg-canvas-base/40">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle/50 text-on-surface-variant uppercase text-[10px]">
                          <th className="py-2 px-2">Người chơi</th>
                          <th className="py-2 px-2">Đáp án đã gửi</th>
                          <th className="py-2 px-2 text-center">Kết quả</th>
                          <th className="py-2 px-2 text-right">Điểm</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle/30">
                        {entry.results.map((res, idx) => {
                          const isViewer = viewerId && res.participantId === viewerId;

                          return (
                            <tr
                              key={res.participantId || `${res.participantName}-${idx}`}
                              className={`transition-colors ${
                                isViewer ? "bg-primary-container/10 font-bold" : ""
                              }`}
                            >
                              <td className="py-2 px-2 whitespace-nowrap">
                                <span className="text-on-surface">
                                  {res.participantName}
                                </span>
                                {isViewer && (
                                  <span className="ml-1.5 text-[10px] text-primary-container">
                                    [ BẠN ]
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2 text-on-surface-variant italic truncate max-w-[180px]">
                                {res.answer ? `"${res.answer}"` : "[ BỎ TRỐNG ]"}
                              </td>
                              <td className="py-2 px-2 text-center whitespace-nowrap">
                                {res.isCorrect ? (
                                  <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-400">
                                    [ ĐÚNG ]
                                  </span>
                                ) : (
                                  <span className="rounded border border-rose-500/30 bg-rose-500/10 px-1.5 py-0.2 text-[10px] text-rose-400">
                                    [ SAI ]
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-2 text-right whitespace-nowrap">
                                <span
                                  className={
                                    res.points > 0
                                      ? "text-emerald-400 font-bold"
                                      : "text-on-surface-variant"
                                  }
                                >
                                  {res.points > 0 ? `+${res.points}đ` : "0đ"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
