import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { socket } from "@/lib/socket";
import { emitWithAck } from "@/lib/emitWithAck";
import { SocketAckError, getErrorMessage } from "@/lib/errors";
import { addToast } from "../slices/uiSlice";
import type { EmptyAckData } from "@/types";

// ---------------------------------------------------------------------------
// Async Thunks — Game Actions
// Plan: Phase 3 (Host Actions) & Phase 4 (Playing Actions)
// Docs: section 5.2.4 (food-guess:start), 5.2.5 (food-guess:answer)
// ---------------------------------------------------------------------------

/**
 * Start the game in current room. Host only.
 *
 * Flow:
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
