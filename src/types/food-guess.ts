// ---------------------------------------------------------------------------
// FoodGuessRoundSnapshot — data for the current playing round
// Available when phase === "playing"
// Docs: section 6.2
// ---------------------------------------------------------------------------

export type FoodGuessRoundSnapshot = {
  id: string;                                    // e.g. "ABCDEF-fg-1"
  roundNumber: number;                           // Current round (1, 2, 3...)
  totalRounds: number;                           // Total rounds in the game
  mediaUrl: string;                              // URL of the food image to guess
  startedAt: number;                             // Timestamp (ms) when round started
  deadlineAt: number;                            // Timestamp (ms) when countdown ends
  submittedCount: number;                        // How many players have submitted
  viewerAnswered: boolean;                       // Has current viewer submitted?
  viewerResult: "correct" | "incorrect" | null;  // Viewer's result for this round
  viewerStreak?: number;                         // Viewer's current streak
  suggestions: string[];                         // 3 decoy suggestions
};

// ---------------------------------------------------------------------------
// FoodGuessRoundResult — individual player's result for a round
// Docs: section 6.3
// ---------------------------------------------------------------------------

export type FoodGuessRoundResult = {
  participantId: string;
  participantName: string;
  answer: string;           // The answer the player submitted
  isCorrect: boolean;
  points: number;           // Points earned (0 if incorrect)
  streak?: number;          // Streak count after this round
  comboApplied?: boolean;   // Whether combo multiplier was applied
};

// ---------------------------------------------------------------------------
// FoodGuessReveal — answer reveal data after a round ends
// Available when phase === "roundReveal"
// Docs: section 6.3
// ---------------------------------------------------------------------------

export type FoodGuessReveal = {
  roundNumber: number;
  foodName: string;              // Correct answer (food name)
  resourceUrl: string;           // Reference image URL
  viewerPoints?: number;         // Points the viewer earned this round
  viewerCorrect?: boolean;       // Did the viewer answer correctly?
  viewerStreak?: number;         // Viewer's updated streak
  results: FoodGuessRoundResult[];
};

// ---------------------------------------------------------------------------
// FoodGuessScoreEvent — real-time feed of answer submissions
// Displayed as a live toast/feed sidebar during playing phase
// Docs: section 6.4
// ---------------------------------------------------------------------------

export type FoodGuessScoreEvent = {
  id: string;                // Unique event ID
  roundNumber: number;
  participantName: string;   // Who submitted
  answer: string;
  isCorrect: boolean;
  points: number;
  streak?: number;
  comboApplied?: boolean;
  at: number;                // Timestamp (ms) when submitted
};
