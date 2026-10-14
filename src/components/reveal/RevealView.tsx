"use client";

import type { RoomSnapshot } from "@/types";
import { AnswerDisplay } from "./AnswerDisplay";
import { ViewerRoundSummary } from "./ViewerRoundSummary";
import { RoundResultsTable } from "./RoundResultsTable";
import { RevealControls } from "./RevealControls";

// ---------------------------------------------------------------------------
// RevealView — Toàn bộ giao diện màn hình Round Reveal
// Phase 5: Round Reveal Phase
// Rule: Text-only UI (no icons/emojis), 2-column balanced layout
// ---------------------------------------------------------------------------

type RevealViewProps = {
  snapshot: RoomSnapshot;
  isHost: boolean;
};

export function RevealView({ snapshot, isHost }: RevealViewProps) {
  const reveal = snapshot.foodGuessReveal;
  const config = snapshot.config;
  const viewer = snapshot.viewer;

  const currentRound = reveal?.roundNumber ?? snapshot.foodGuessRound?.roundNumber ?? 1;
  const totalRounds = config?.totalRounds ?? 10;
  const autoNextRound = config?.autoNextRound ?? true;

  if (!reveal) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface-card p-8 text-center space-y-3">
        <span className="rounded border border-purple-border bg-purple-bg px-2.5 py-1 font-mono text-xs font-bold text-purple-text">
          [ ĐANG CHỜ DỮ LIỆU ĐÁP ÁN ]
        </span>
        <h2 className="font-mono text-lg font-bold uppercase text-on-surface">
          [ ĐANG TẢI KẾT QUẢ VÒNG THI... ]
        </h2>
        <p className="font-mono text-xs text-on-surface-variant max-w-md">
          Máy chủ đang hoàn tất chấm điểm và gửi dữ liệu tổng kết vòng đấu. Vui lòng đợi trong giây lát.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-border/40 bg-surface-card p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="rounded border border-purple-border bg-purple-bg px-2.5 py-1 font-mono text-xs font-bold text-purple-text">
            [ TỔNG KẾT VÒNG {currentRound} / {totalRounds} ]
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-on-surface">
            {currentRound >= totalRounds ? "HẾT VÒNG THI CUỐI" : "KẾT QUẢ VÒNG ĐẤU"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewer && (
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-1 font-mono text-xs text-on-surface-variant">
              {isHost ? "[ BẠN: CHỦ PHÒNG ]" : "[ BẠN: NGƯỜI CHƠI ]"}
            </span>
          )}
        </div>
      </section>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Answer & Personal Result & Controls */}
        <div className="lg:col-span-5 space-y-5">
          <AnswerDisplay
            foodName={reveal.foodName}
            resourceUrl={reveal.resourceUrl}
            roundNumber={currentRound}
          />

          <ViewerRoundSummary
            correct={reveal.viewerCorrect}
            points={reveal.viewerPoints}
            streak={reveal.viewerStreak}
          />

          <RevealControls
            autoNextRound={autoNextRound}
            isHost={isHost}
            currentRound={currentRound}
            totalRounds={totalRounds}
          />
        </div>

        {/* Right Column: Full-Room Round Results Table */}
        <div className="lg:col-span-7">
          <RoundResultsTable
            results={reveal.results ?? []}
            viewerId={viewer?.id}
          />
        </div>
      </div>
    </div>
  );
}
