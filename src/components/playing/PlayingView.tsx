"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { submitAnswer, skipRound } from "@/store/thunks";
import type { RoomSnapshot } from "@/types";
import PlayingHeader from "./PlayingHeader";
import FoodDisplay from "./FoodDisplay";
import GuessInput from "./GuessInput";
import SuggestionChips from "./SuggestionChips";
import ScoreFeed from "./ScoreFeed";
import { MiniScoreboard } from "./MiniScoreboard";

// ---------------------------------------------------------------------------
// PlayingView — Màn hình thi đấu đoán món ăn tổng thể (Phase 4)
// Rule: Text-only UI (no icons/emojis), Dark Mode design tokens, 2-column layout
// ---------------------------------------------------------------------------

type PlayingViewProps = {
  snapshot: RoomSnapshot;
  isHost: boolean;
};

export default function PlayingView({ snapshot, isHost }: PlayingViewProps) {
  const dispatch = useAppDispatch();
  const round = snapshot.foodGuessRound;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // If no round data available yet
  if (!round) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border-subtle bg-surface-card p-8 text-center font-mono text-xs text-on-surface-variant">
        [ ĐANG TẢI DỮ LIỆU CÂU HỎI VÒNG ĐẤU TỪ MÁY CHỦ... ]
      </div>
    );
  }

  const handleSubmitAnswer = async (answer: string) => {
    if (isSubmitting || round.viewerAnswered || isExpired) return;
    setIsSubmitting(true);
    try {
      await dispatch(
        submitAnswer({
          roundId: round.id,
          answer,
        })
      ).unwrap();
    } catch {
      // Handled via toast in thunk
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipRound = async () => {
    if (isSkipping) return;
    setIsSkipping(true);
    try {
      await dispatch(skipRound()).unwrap();
    } catch {
      // Handled via toast in thunk
    } finally {
      setIsSkipping(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 1. Header with round progress, timer and Host skip */}
      <PlayingHeader
        roundNumber={round.roundNumber}
        totalRounds={round.totalRounds}
        submittedCount={round.submittedCount}
        participantCount={snapshot.participants.length}
        deadlineAt={round.deadlineAt}
        startedAt={round.startedAt}
        isHost={isHost}
        onSkipRound={handleSkipRound}
        isSkipping={isSkipping}
        onTimerExpire={() => setIsExpired(true)}
      />

      {/* 2. Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Left Column (7/12): Food Image, Suggestion Chips, Guess Input */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          <FoodDisplay
            mediaUrl={round.mediaUrl}
            roundNumber={round.roundNumber}
          />

          <SuggestionChips
            suggestions={round.suggestions}
            disabled={round.viewerAnswered || isExpired || isSubmitting}
            onSelectChip={handleSubmitAnswer}
          />

          <GuessInput
            roundId={round.id}
            viewerAnswered={round.viewerAnswered}
            viewerResult={round.viewerResult}
            isExpired={isExpired}
            onSubmit={handleSubmitAnswer}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Right Column (5/12): Live Score Feed & Mini Leaderboard */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <ScoreFeed
            events={snapshot.foodGuessEvents}
            viewerStreak={round.viewerStreak}
          />

          {/* Mini Live Scoreboard (SRP & ISP) */}
          <MiniScoreboard
            participants={snapshot.participants}
            viewerId={snapshot.viewer?.id}
          />
        </div>
      </div>
    </div>
  );
}
