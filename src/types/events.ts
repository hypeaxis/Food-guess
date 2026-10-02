import type { FoodGuessConfig } from "./room";
import type { RoomSnapshot } from "./room";
import type { ChatMessage } from "./chat";

// ---------------------------------------------------------------------------
// Client → Server event payloads
// Docs: section 5.2
// ---------------------------------------------------------------------------

/** room:create — payload */
export type CreateRoomPayload = {
  name: string;            // 2 – 24 chars
  config: FoodGuessConfig;
};

/** room:join — payload */
export type JoinRoomPayload = {
  code: string;
  name: string;            // 2 – 24 chars
};

/** room:resume — payload */
export type ResumeRoomPayload = {
  code: string;
  participantId: string;
  token: string;
};

/** food-guess:answer — payload */
export type AnswerPayload = {
  roundId: string;         // from snapshot.foodGuessRound.id
  answer: string;          // 1 – 200 chars
};

/** chat:send — payload */
export type ChatSendPayload =
  | { text: string }       // 1 – 300 chars
  | { gifUrl: string };    // Tenor / Giphy URLs only

// ---------------------------------------------------------------------------
// Server → Client ack data (the T in Ack<T>)
// Docs: section 5.2
// ---------------------------------------------------------------------------

/** Ack data for room:create and room:join */
export type JoinAckData = {
  code: string;
  participantId: string;
  token: string;
  snapshot: RoomSnapshot;
};

/** Ack data for room:resume */
export type ResumeAckData = {
  snapshot: RoomSnapshot;
};

/** Ack data for food-guess:answer */
export type AnswerAckData = {
  correct: boolean;
  points: number;
  streak: number;
  comboApplied: boolean;
};

/** Ack data for chat:send */
export type ChatSendAckData = ChatMessage;

/** Ack data for commands that return empty: start, skip, next, rematch, leave */
export type EmptyAckData = Record<string, never>;
