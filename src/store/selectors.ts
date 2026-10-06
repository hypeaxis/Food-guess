import type { RootState } from "./index";

// ---------------------------------------------------------------------------
// Shared selectors — narrow selectors to avoid unnecessary re-renders
// Plan: section 2.2 — "selectPhase, selectIsHost, selectViewer, selectRound,
//                       selectReveal"
// ---------------------------------------------------------------------------

// Connection
export const selectConnectionStatus = (state: RootState) =>
  state.connection.status;
export const selectConnectionError = (state: RootState) =>
  state.connection.errorMessage;
export const selectSocketId = (state: RootState) => state.connection.socketId;
export const selectReconnectAttempt = (state: RootState) =>
  state.connection.reconnectAttempt;
export const selectIsConnected = (state: RootState) =>
  state.connection.status === "connected";
export const selectIsReconnecting = (state: RootState) =>
  state.connection.status === "reconnecting";

// Session
export const selectSessionStatus = (state: RootState) => state.session.status;
export const selectSessionParticipant = (state: RootState) =>
  state.session.participant;
export const selectRoomCode = (state: RootState) => state.session.roomCode;

// Room snapshot — narrow selectors to minimize re-renders
export const selectSnapshot = (state: RootState) => state.room.snapshot;
export const selectPhase = (state: RootState) => state.room.snapshot?.phase ?? null;
export const selectConfig = (state: RootState) => state.room.snapshot?.config ?? null;
export const selectViewer = (state: RootState) => state.room.snapshot?.viewer ?? null;
export const selectIsHost = (state: RootState) =>
  state.room.snapshot?.viewer?.isHost ?? false;
const EMPTY_PARTICIPANTS: never[] = [];
const EMPTY_SCORE_EVENTS: never[] = [];
const EMPTY_PAST_RESULTS: never[] = [];

export const selectParticipants = (state: RootState) =>
  state.room.snapshot?.participants ?? EMPTY_PARTICIPANTS;
export const selectClosedReason = (state: RootState) => state.room.closedReason;

// Food Guess — round & reveal
export const selectRound = (state: RootState) =>
  state.room.snapshot?.foodGuessRound ?? null;
export const selectReveal = (state: RootState) =>
  state.room.snapshot?.foodGuessReveal ?? null;
export const selectScoreEvents = (state: RootState) =>
  state.room.snapshot?.foodGuessEvents ?? EMPTY_SCORE_EVENTS;
export const selectPastResults = (state: RootState) =>
  state.room.snapshot?.foodGuessPastResults ?? EMPTY_PAST_RESULTS;

// Chat
export const selectChatMessages = (state: RootState) => state.chat.messages;

// UI
export const selectToasts = (state: RootState) => state.ui.toasts;
