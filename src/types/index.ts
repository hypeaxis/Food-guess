// Barrel export — import everything from "@/types"

export type { Ack } from "./ack";

export type {
  FoodGuessConfig,
  RoomPhase,
  Viewer,
  Participant,
  PastRoundEntry,
  RoomSnapshot,
  GameType,
  RoomSummaryPhase,
  RoomSummary,
} from "./room";

export type {
  FoodGuessRoundSnapshot,
  FoodGuessRoundResult,
  FoodGuessReveal,
  FoodGuessScoreEvent,
} from "./food-guess";

export type { ChatMessage } from "./chat";

export type { StoredParticipant } from "./session";

export type {
  CreateRoomPayload,
  JoinRoomPayload,
  ResumeRoomPayload,
  AnswerPayload,
  ChatSendPayload,
  JoinAckData,
  ResumeAckData,
  AnswerAckData,
  ChatSendAckData,
  EmptyAckData,
} from "./events";

export type { ErrorCode } from "./errors";
export { ERROR_MESSAGES } from "./errors";
