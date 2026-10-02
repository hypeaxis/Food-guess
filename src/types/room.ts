import type { FoodGuessRoundSnapshot, FoodGuessReveal, FoodGuessScoreEvent, FoodGuessRoundResult } from "./food-guess";

// ---------------------------------------------------------------------------
// Room configuration (sent when creating a room via room:create)
// Docs: section 5.2.1
// ---------------------------------------------------------------------------

export type FoodGuessConfig = {
  gameType: "food-guess";
  totalRounds: number;       // 5 – 50
  answerTimeSeconds: number; // 10 – 120
  autoNextRound: boolean;    // true: auto transition after 5s
  comboStreakEnabled: boolean;
};

// ---------------------------------------------------------------------------
// Phase — the four states a Food Guess room can be in
// Docs: section 4
// ---------------------------------------------------------------------------

export type RoomPhase = "lobby" | "playing" | "roundReveal" | "finished";

// ---------------------------------------------------------------------------
// Viewer — info about the current user viewing the room
// Docs: section 6.1
// ---------------------------------------------------------------------------

export type Viewer = {
  id: string;
  name: string;
  isHost: boolean;
};

// ---------------------------------------------------------------------------
// Participant — a single player in the room
// Docs: section 6.1
// ---------------------------------------------------------------------------

export type Participant = {
  id: string;
  name: string;
  isHost: boolean;
  isOnline: boolean;
  hasVoted: boolean;
  score?: number;
  correctAnswers?: number;
  streak?: number;
};

// ---------------------------------------------------------------------------
// Past round result entry (used in foodGuessPastResults)
// Docs: section 6.1
// ---------------------------------------------------------------------------

export type PastRoundEntry = {
  roundNumber: number;
  results: FoodGuessRoundResult[];
};

// ---------------------------------------------------------------------------
// RoomSnapshot — the main state object received via room:snapshot
// Docs: section 6.1
// ---------------------------------------------------------------------------

export type RoomSnapshot = {
  code: string;
  phase: RoomPhase;
  config: FoodGuessConfig;
  viewer: Viewer | null;
  participants: Participant[];
  foodGuessRound?: FoodGuessRoundSnapshot | null;
  foodGuessReveal?: FoodGuessReveal | null;
  foodGuessEvents?: FoodGuessScoreEvent[];
  foodGuessPastResults?: PastRoundEntry[];
  closedReason?: string | null;
  error?: string;
};

// ---------------------------------------------------------------------------
// RoomSummary — returned by GET /api/rooms (all game types)
// Docs: section 3
// ---------------------------------------------------------------------------

export type GameType = "food-guess" | "worldcup" | "song-guess" | "foodcup";

export type RoomSummaryPhase =
  | "lobby"
  | "playing"
  | "roundReveal"
  | "finished"
  | "voting"
  | "tieBreak";

export type RoomSummary = {
  code: string;
  gameType: GameType;
  phase: RoomSummaryPhase;
  participantCount: number;
  onlineCount: number;
  hostName: string | null;
  createdAt: number;
  /** Only present for some game types (e.g. worldcup) */
  round?: number;
  roundTotal?: number;
};
