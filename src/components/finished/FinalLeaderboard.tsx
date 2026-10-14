"use client";

import { memo, useMemo } from "react";
import type { Participant } from "@/types";

// ---------------------------------------------------------------------------
// FinalLeaderboard — Bảng tổng sắp xếp hạng chung cuộc toàn phòng (1 - 50)
// Phase 5: Finished Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens, React.memo
// ---------------------------------------------------------------------------

type FinalLeaderboardProps = {
  participants: Participant[];
  viewerId?: string;
  totalRounds: number;
};

export const FinalLeaderboard = memo(function FinalLeaderboard({
  participants,
  viewerId,
  totalRounds,
}: FinalLeaderboardProps) {
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      const correctDiff = (b.correctAnswers ?? 0) - (a.correctAnswers ?? 0);
      if (correctDiff !== 0) return correctDiff;
      return a.name.localeCompare(b.name);
    });
  }, [participants]);

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-3">
        <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider">
          [ BẢNG TỔNG SẮP CHUNG CUỘC ]
        </span>
        <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
          {participants.length} người tham gia
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-border-subtle text-on-surface-variant uppercase text-[11px]">
              <th className="py-2.5 px-3">Hạng</th>
              <th className="py-2.5 px-3">Người chơi</th>
              <th className="py-2.5 px-3 text-center">Câu đúng</th>
              <th className="py-2.5 px-3 text-center">Chuỗi cao nhất</th>
              <th className="py-2.5 px-3 text-right">Tổng điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/50">
            {sortedParticipants.map((p, index) => {
              const rank = index + 1;
              const isViewer = viewerId && p.id === viewerId;

              return (
                <tr
                  key={p.id}
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
                      <span className="text-on-surface-variant px-1 font-mono">
                        #{rank}
                      </span>
                    )}
                  </td>

                  {/* Player Name & Badges */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-on-surface">
                        {p.name}
                      </span>

                      {p.isHost && (
                        <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-1.5 py-0.2 text-[10px] font-bold text-badge-amber-text">
                          [ CHỦ PHÒNG ]
                        </span>
                      )}

                      {isViewer && (
                        <span className="rounded border border-primary-container/40 bg-primary-container/20 px-1.5 py-0.2 text-[10px] font-bold text-primary-container">
                          [ BẠN ]
                        </span>
                      )}

                      {!p.isOnline && (
                        <span className="rounded border border-border-subtle bg-surface-sub px-1.5 py-0.2 text-[10px] text-on-surface-variant">
                          [ NGOẠI TUYẾN ]
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Correct Answers */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="font-bold text-on-surface">
                      {p.correctAnswers ?? 0}
                    </span>
                    <span className="text-on-surface-variant">
                      /{totalRounds}
                    </span>
                  </td>

                  {/* Best Streak */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {(p.streak ?? 0) > 1 ? (
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400">
                        [ x{p.streak} ]
                      </span>
                    ) : (
                      <span className="text-on-surface-variant">
                        {p.streak ?? 0}
                      </span>
                    )}
                  </td>

                  {/* Total Score */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <span
                      className={`font-mono text-sm font-black ${
                        rank === 1
                          ? "text-primary-container"
                          : rank <= 3
                          ? "text-on-surface"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {p.score ?? 0}đ
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
});
