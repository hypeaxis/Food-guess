"use client";

import type { Participant } from "@/types";

// ---------------------------------------------------------------------------
// PodiumLeaderboard — Bục vinh danh Top 3 người chơi có điểm cao nhất
// Phase 5: Finished Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type PodiumLeaderboardProps = {
  participants: Participant[];
  viewerId?: string;
  totalRounds: number;
};

export function PodiumLeaderboard({
  participants,
  viewerId,
  totalRounds,
}: PodiumLeaderboardProps) {
  // Sort participants by score descending, then correct answers descending
  const sorted = [...participants].sort((a, b) => {
    const scoreDiff = (b.score ?? 0) - (a.score ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return (b.correctAnswers ?? 0) - (a.correctAnswers ?? 0);
  });

  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  if (!first) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 sm:p-6 shadow-xl space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-3 py-1 font-mono text-xs font-bold text-badge-amber-text">
          [ VINH DANH NGƯỜI CHIẾN THẮNG ]
        </span>
        <h2 className="font-mono text-xl sm:text-2xl font-black uppercase tracking-wider text-on-surface pt-2">
          BỤC VINH QUANG TOP 3
        </h2>
        <p className="font-mono text-xs text-on-surface-variant">
          Tổng kết thành tích chung cuộc sau {totalRounds} vòng tranh tài
        </p>
      </div>

      {/* Podium Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4">
        {/* HẠNG 2 — Á Quân (Cột Trái) */}
        {second ? (
          <div className="order-2 sm:order-1 flex flex-col items-center justify-between rounded-2xl border border-zinc-500/60 bg-surface-sub p-4 text-center min-h-[190px] shadow-lg">
            <div className="space-y-2 w-full">
              <span className="inline-block rounded border border-zinc-500 bg-zinc-800/90 px-2.5 py-0.5 font-mono text-xs font-bold text-zinc-300">
                [ Á QUÂN - HẠNG 2 ]
              </span>
              <div className="pt-1">
                <span className="font-mono text-sm sm:text-base font-bold text-on-surface block truncate">
                  {second.name}
                </span>
                {viewerId && second.id === viewerId && (
                  <span className="rounded border border-primary-container/40 bg-primary-container/20 px-1.5 py-0.2 text-[10px] font-bold text-primary-container mt-1 inline-block">
                    [ BẠN ]
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-700/60 w-full pt-3 mt-3">
              <span className="font-mono text-xl sm:text-2xl font-black text-zinc-300 block">
                {second.score ?? 0}đ
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                {second.correctAnswers ?? 0}/{totalRounds} câu đúng
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block order-1 opacity-0 min-h-[190px]" />
        )}

        {/* HẠNG 1 — Quán Quân (Cột Giữa - Cao nhất & Nổi bật nhất) */}
        <div className="order-1 sm:order-2 flex flex-col items-center justify-between rounded-2xl border-2 border-primary-container bg-surface-sub p-5 text-center min-h-[230px] shadow-2xl shadow-amber-500/10 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="rounded-full border border-badge-amber-border bg-amber-500 px-3 py-0.5 font-mono text-[11px] font-black uppercase text-black tracking-wider shadow-md">
              [ QUÁN QUÂN ]
            </span>
          </div>

          <div className="space-y-2 w-full pt-2">
            <span className="inline-block rounded border border-badge-amber-border bg-badge-amber-bg px-3 py-0.5 font-mono text-xs font-bold text-badge-amber-text">
              [ VÔ ĐỊCH - HẠNG 1 ]
            </span>
            <div className="pt-1">
              <h3 className="font-mono text-base sm:text-lg font-black text-primary-container block truncate">
                {first.name}
              </h3>
              {viewerId && first.id === viewerId && (
                <span className="rounded border border-primary-container/40 bg-primary-container/20 px-2 py-0.5 text-xs font-bold text-primary-container mt-1 inline-block">
                  [ BẠN LÀ VÔ ĐỊCH! ]
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-primary-container/30 w-full pt-3 mt-3">
            <span className="font-mono text-2xl sm:text-3xl font-black text-primary-container block">
              {first.score ?? 0}đ
            </span>
            <span className="font-mono text-xs text-on-surface-variant">
              {first.correctAnswers ?? 0}/{totalRounds} câu đúng
            </span>
          </div>
        </div>

        {/* HẠNG 3 — Quý Quân (Cột Phải) */}
        {third ? (
          <div className="order-3 flex flex-col items-center justify-between rounded-2xl border border-amber-800/80 bg-surface-sub p-4 text-center min-h-[170px] shadow-lg">
            <div className="space-y-2 w-full">
              <span className="inline-block rounded border border-amber-800 bg-amber-950/80 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-500">
                [ QUÝ QUÂN - HẠNG 3 ]
              </span>
              <div className="pt-1">
                <span className="font-mono text-sm sm:text-base font-bold text-on-surface block truncate">
                  {third.name}
                </span>
                {viewerId && third.id === viewerId && (
                  <span className="rounded border border-primary-container/40 bg-primary-container/20 px-1.5 py-0.2 text-[10px] font-bold text-primary-container mt-1 inline-block">
                    [ BẠN ]
                  </span>
                )}
              </div>
            </div>

            <div className="border-t border-amber-900/60 w-full pt-3 mt-3">
              <span className="font-mono text-lg sm:text-xl font-black text-amber-500 block">
                {third.score ?? 0}đ
              </span>
              <span className="font-mono text-[11px] text-on-surface-variant">
                {third.correctAnswers ?? 0}/{totalRounds} câu đúng
              </span>
            </div>
          </div>
        ) : (
          <div className="hidden sm:block order-3 opacity-0 min-h-[170px]" />
        )}
      </div>
    </section>
  );
}
