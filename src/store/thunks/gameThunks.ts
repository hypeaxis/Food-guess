import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { socket } from "@/lib/socket";
import { emitWithAck } from "@/lib/emitWithAck";
import { SocketAckError, getErrorMessage } from "@/lib/errors";
import { addToast } from "../slices/uiSlice";
import type { EmptyAckData, AnswerAckData, AnswerPayload } from "@/types";

// ---------------------------------------------------------------------------
// Async Thunks — Game Actions
// Plan: Phase 3 (Host Actions), Phase 4 (Playing Actions), Phase 5 (Next/Rematch)
// Docs: section 5.2.4 (start), 5.2.5 (answer), 5.2.6 (skip)
// ---------------------------------------------------------------------------

/**
 * Start the game in current room. Host only.
 *
 * Flow (Docs 5.2.4):
 * 1. emit `food-guess:start` via emitWithAck
 * 2. On server ack success (EmptyAckData) -> server broadcasts new snapshot
 *    with phase: "playing" to all clients in the room via socketMiddleware
 * 3. On server ack error (e.g. HOST_ONLY, INVALID_PHASE) -> catch SocketAckError
 *    and dispatch toast notification
 */
export const startGame = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>(
  "game/start",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await emitWithAck<EmptyAckData>(socket, "food-guess:start");
    } catch (error) {
      const message =
        error instanceof SocketAckError
          ? error.message
          : error instanceof Error
            ? error.message
            : getErrorMessage();

      dispatch(
        addToast({
          id: `start-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);

/**
 * Submit an answer for the current round.
 *
 * Flow (Docs 5.2.5):
 * 1. emit `food-guess:answer` { roundId, answer } via emitWithAck
 * 2. On ack success -> returns AnswerAckData { correct, points, streak, comboApplied }
 *    - If correct: dispatch success toast with points and combo info
 *    - If incorrect: dispatch warning toast
 * 3. On ack error (e.g. TOO_LATE, ALREADY_ANSWERED, ROUND_MISMATCH):
 *    dispatch error toast notification
 */
export const submitAnswer = createAsyncThunk<
  AnswerAckData,
  AnswerPayload,
  { state: RootState; rejectValue: string }
>(
  "game/answer",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const data = await emitWithAck<AnswerAckData, AnswerPayload>(
        socket,
        "food-guess:answer",
        payload
      );

      if (data.correct) {
        const comboText =
          data.comboApplied && data.streak > 1
            ? ` [ COMBO x${data.streak} ]`
            : "";
        dispatch(
          addToast({
            id: `answer-correct-${Date.now()}`,
            type: "success",
            message: `Chính xác! +${data.points}đ${comboText}`,
          })
        );
      } else {
        dispatch(
          addToast({
            id: `answer-incorrect-${Date.now()}`,
            type: "warning",
            message: "Chưa chính xác! Chờ hết vòng để xem đáp án nhé.",
          })
        );
      }

      return data;
    } catch (error) {
      const message =
        error instanceof SocketAckError
          ? error.message
          : error instanceof Error
            ? error.message
            : getErrorMessage();

      dispatch(
        addToast({
          id: `answer-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);

/**
 * Skip the current playing round early. Host only.
 *
 * Flow (Docs 5.2.6):
 * 1. emit `food-guess:skip` via emitWithAck
 * 2. On ack ok -> server ends round early and broadcasts roundReveal snapshot
 * 3. On ack error -> catches SocketAckError (e.g. HOST_ONLY, INVALID_PHASE)
 */
export const skipRound = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>(
  "game/skip",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await emitWithAck<EmptyAckData>(socket, "food-guess:skip");
    } catch (error) {
      const message =
        error instanceof SocketAckError
          ? error.message
          : error instanceof Error
            ? error.message
            : getErrorMessage();

      dispatch(
        addToast({
          id: `skip-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);

/**
 * Advance to the next round. Host only.
 * Valid when phase === "roundReveal" and autoNextRound === false (or manual override).
 *
 * Flow (Docs 5.2.7):
 * 1. emit `food-guess:next` via emitWithAck
 * 2. On ack ok (EmptyAckData) -> server broadcasts new round snapshot (phase: "playing" or "finished")
 * 3. On ack error (e.g. HOST_ONLY, INVALID_PHASE) -> catches SocketAckError and dispatches error toast
 */
export const nextRound = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>(
  "game/next",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await emitWithAck<EmptyAckData>(socket, "food-guess:next");
    } catch (error) {
      const message =
        error instanceof SocketAckError
          ? error.message
          : error instanceof Error
            ? error.message
            : getErrorMessage();

      dispatch(
        addToast({
          id: `next-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);

/**
 * Restart the game with the same participants. Host only.
 * Valid when phase === "finished".
 *
 * Flow (Docs 5.2.8):
 * 1. emit `food-guess:rematch` via emitWithAck
 * 2. On ack ok (EmptyAckData) -> server resets game and broadcasts new snapshot with phase: "lobby"
 * 3. On ack error (e.g. HOST_ONLY, INVALID_PHASE) -> catches SocketAckError and dispatches error toast
 */
export const rematch = createAsyncThunk<
  void,
  void,
  { state: RootState; rejectValue: string }
>(
  "game/rematch",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await emitWithAck<EmptyAckData>(socket, "food-guess:rematch");
    } catch (error) {
      const message =
        error instanceof SocketAckError
          ? error.message
          : error instanceof Error
            ? error.message
            : getErrorMessage();

      dispatch(
        addToast({
          id: `rematch-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);

