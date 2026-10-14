"use client";

import { memo, useMemo } from "react";
import type { FoodGuessRoundResult } from "@/types";

// ---------------------------------------------------------------------------
// RoundResultsTable — Bảng điểm và kết quả của toàn phòng trong vòng vừa qua
// Phase 5: Round Reveal Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens, React.memo for up to 50 players
// ---------------------------------------------------------------------------

type RoundResultsTableProps = {
  results: FoodGuessRoundResult[];
  viewerId?: string;
};

export const RoundResultsTable = memo(function RoundResultsTable({
  results,
  viewerId,
}: RoundResultsTableProps) {
  // Sort descending by points, then correct status, then player name
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1;
      return a.participantName.localeCompare(b.participantName);
    });
  }, [results]);

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
          [ BẢNG KẾT QUẢ VÒNG NÀY ]
        </span>
        <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
          {results.length} người tham gia
        </span>
      </div>

      {sortedResults.length === 0 ? (
        <div className="py-8 text-center">
          <p className="font-mono text-xs text-on-surface-variant">
            [ KHÔNG CÓ DỮ LIỆU KẾT QUẢ VÒNG NÀY ]
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-on-surface-variant uppercase text-[11px]">
                <th className="py-2.5 px-3">Hạng</th>
                <th className="py-2.5 px-3">Người chơi</th>
                <th className="py-2.5 px-3">Đáp án nộp</th>
                <th className="py-2.5 px-3 text-center">Trạng thái</th>
                <th className="py-2.5 px-3 text-right">Điểm cộng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50">
              {sortedResults.map((item, index) => {
                const rank = index + 1;
                const isViewer = viewerId && item.participantId === viewerId;

                return (
                  <tr
                    key={item.participantId || `${item.participantName}-${index}`}
                    className={`transition-colors ${
                      isViewer
                        ? "bg-primary-container/10 border-l-2 border-primary-container"
                        : "hover:bg-surface-sub/50"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {rank === 1 ? (
                        <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2 py-0.5 text-xs font-bold text-badge-amber-text">
                          #1
                        </span>
                      ) : rank === 2 ? (
                        <span className="rounded border border-zinc-600 bg-zinc-800/80 px-2 py-0.5 text-xs font-semibold text-zinc-300">
                          #2
                        </span>
                      ) : rank === 3 ? (
                        <span className="rounded border border-amber-900 bg-amber-950/60 px-2 py-0.5 text-xs font-semibold text-amber-500">
                          #3
                        </span>
                      ) : (
                        <span className="text-on-surface-variant font-mono px-1">
                          #{rank}
                        </span>
                      )}
                    </td>

                    {/* Participant Name */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-on-surface">
                          {item.participantName}
                        </span>
                        {isViewer && (
                          <span className="rounded border border-primary-container/40 bg-primary-container/20 px-1.5 py-0.2 text-[10px] font-bold text-primary-container">
                            [ BẠN ]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Submitted Answer */}
                    <td className="py-3 px-3">
                      <span className="text-on-surface-variant italic truncate block max-w-[150px] sm:max-w-[220px]">
                        {item.answer ? `"${item.answer}"` : "[ BỎ TRỐNG ]"}
                      </span>
                    </td>

                    {/* Correct Status & Combo */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.isCorrect ? (
                          <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-400">
                            [ ĐÚNG ]
                          </span>
                        ) : (
                          <span className="rounded border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-rose-400">
                            [ SAI ]
                          </span>
                        )}

                        {item.comboApplied && item.streak && item.streak > 1 && (
                          <span className="hidden sm:inline-block rounded border border-badge-amber-border bg-badge-amber-bg px-1.5 py-0.5 text-[10px] text-badge-amber-text">
                            [ x{item.streak} ]
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          item.points > 0
                            ? "text-emerald-400 font-mono"
                            : "text-on-surface-variant font-mono"
                        }`}
                      >
                        {item.points > 0 ? `+${item.points}đ` : "0đ"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});
