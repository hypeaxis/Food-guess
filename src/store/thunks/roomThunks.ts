import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { socket } from "@/lib/socket";
import { emitWithAck } from "@/lib/emitWithAck";
import {
  getStoredParticipant,
  setStoredParticipant,
  clearStoredParticipant,
} from "@/lib/session";
import { SocketAckError } from "@/lib/errors";
import {
  setResuming,
  setNeedsName,
  setJoining,
  setJoined,
  clearSession,
} from "../slices/sessionSlice";
import { setSnapshot, clearRoom } from "../slices/roomSlice";
import { clearChat } from "../slices/chatSlice";
import type {
  FoodGuessConfig,
  JoinAckData,
  ResumeAckData,
  ResumeRoomPayload,
  JoinRoomPayload,
  CreateRoomPayload,
} from "@/types";

// ---------------------------------------------------------------------------
// Async Thunks — Room & Session Management
// Plan: section 2.2, 2.3 & Giai đoạn 1 (Đầu việc 5)
// Docs: section 2.3 (Reconnect/F5), 5.2.1-3 (create/join/resume), 5.2.9 (leave)
//
// All thunks follow the pattern:
//   1. Dispatch optimistic status action (e.g. setJoining)
//   2. Call emitWithAck → server ack
//   3. Save/clear localStorage
//   4. Dispatch final state (setJoined / setNeedsName / clearSession)
//
// Key design decisions:
// - resumeRoom: gracefully falls back to setNeedsName on RESUME_DENIED/ROOM_NOT_FOUND
//   instead of rejecting, so the UI shows the name form instead of an error.
// - leaveRoom: always cleans up locally, even if the server ack fails.
// - condition callback on resumeRoom prevents parallel resume calls during rapid reconnects.
// - All thunks use `import type` for RootState to avoid circular runtime dependency
//   with store/index.ts (which imports socketMiddleware → thunks).
// ---------------------------------------------------------------------------

/**
 * Attempt to resume a previous session from localStorage.
 *
 * Flow (Docs 2.3):
 * 1. Read `StoredParticipant` from localStorage via `getStoredParticipant(code)`
 * 2. If found → emit `room:resume` with { code, participantId, token }
 *    - ack ok → dispatch setSnapshot + setJoined (user re-enters game instantly)
 *    - ack error (RESUME_DENIED / ROOM_NOT_FOUND) → clear stale storage, show name form
 * 3. If not found → show name form immediately
 *
 * The `condition` callback prevents duplicate resume calls when socket reconnects
 * rapidly (Plan: "Tránh gọi song song").
 */
export const resumeRoom = createAsyncThunk<
  void,
  { code: string },
  { state: RootState; rejectValue: string }
>(
  "room/resume",
  async ({ code }, { dispatch, rejectWithValue }) => {
    const stored = getStoredParticipant(code);

    // No session in storage → need name input
    if (!stored) {
      dispatch(setNeedsName(code));
      return;
    }

    dispatch(setResuming(code));

    try {
      const payload: ResumeRoomPayload = {
        code,
        participantId: stored.participantId,
        token: stored.token,
      };

      const data = await emitWithAck<ResumeAckData, ResumeRoomPayload>(
        socket,
        "room:resume",
        payload,
      );

      // Success: update snapshot and mark session as joined
      dispatch(setSnapshot(data.snapshot));
      dispatch(setJoined({ participant: stored, roomCode: code }));
    } catch (error) {
      // Gracefully handle known recoverable errors
      if (error instanceof SocketAckError) {
        if (
          error.code === "RESUME_DENIED" ||
          error.code === "ROOM_NOT_FOUND"
        ) {
          clearStoredParticipant(code);
          dispatch(setNeedsName(code));
          return; // Not a rejection — UI should show name form
        }
      }

      // Unknown error → reject so the UI can show an error toast
      const message =
        error instanceof Error ? error.message : "Không thể khôi phục phiên.";
      return rejectWithValue(message);
    }
  },
  {
    // Prevent parallel resume calls (Plan: "Resume chạy lặp" guard)
    condition: (_, { getState }) => {
      const { session } = getState();
      return session.status !== "resuming";
    },
  },
);

// ---------------------------------------------------------------------------

/**
 * Join an existing room with a display name.
 *
 * Flow (Docs 5.2.2):
 * 1. dispatch setJoining
 * 2. emit `room:join` { code, name }
 * 3. ack → save { participantId, token, name } to localStorage
 * 4. dispatch setSnapshot + setJoined
 *
 * On failure: reverts to needsName so the user can try again or fix the error
 * (e.g. NAME_TAKEN → pick a different name).
 */
export const joinRoom = createAsyncThunk<
  JoinAckData,
  { code: string; name: string },
  { state: RootState; rejectValue: string }
>(
  "room/join",
  async ({ code, name }, { dispatch, rejectWithValue }) => {
    dispatch(setJoining(code));

    try {
      const payload: JoinRoomPayload = { code, name };

      const data = await emitWithAck<JoinAckData, JoinRoomPayload>(
        socket,
        "room:join",
        payload,
      );

      // Persist session credentials for F5/reconnect
      setStoredParticipant(data.code, {
        participantId: data.participantId,
        token: data.token,
        name,
      });

      dispatch(setSnapshot(data.snapshot));
      dispatch(
        setJoined({
          participant: {
            participantId: data.participantId,
            token: data.token,
            name,
          },
          roomCode: data.code,
        }),
      );

      return data;
    } catch (error) {
      // Revert to name form so user can retry
      dispatch(setNeedsName(code));

      const message =
        error instanceof Error ? error.message : "Không thể vào phòng.";
      return rejectWithValue(message);
    }
  },
);

// ---------------------------------------------------------------------------

/**
 * Create a new room and become its host.
 *
 * Flow (Docs 5.2.1):
 * 1. dispatch setJoining (no code yet — will receive from ack)
 * 2. emit `room:create` { name, config }
 * 3. ack → save { participantId, token, name } with new room code
 * 4. dispatch setSnapshot + setJoined
 *
 * On failure: clears session entirely since there's no room to fall back to.
 */
export const createRoom = createAsyncThunk<
  JoinAckData,
  { config: FoodGuessConfig; name: string },
  { state: RootState; rejectValue: string }
>(
  "room/create",
  async ({ config, name }, { dispatch, rejectWithValue }) => {
    dispatch(setJoining("")); // No code yet, will receive from server ack

    try {
      const payload: CreateRoomPayload = { config, name };

      const data = await emitWithAck<JoinAckData, CreateRoomPayload>(
        socket,
        "room:create",
        payload,
      );

      // Persist session credentials for F5/reconnect
      setStoredParticipant(data.code, {
        participantId: data.participantId,
        token: data.token,
        name,
      });

      dispatch(setSnapshot(data.snapshot));
      dispatch(
        setJoined({
          participant: {
            participantId: data.participantId,
            token: data.token,
            name,
          },
          roomCode: data.code,
        }),
      );

      return data;
    } catch (error) {
      // No room to return to, clear everything
      dispatch(clearSession());

      const message =
        error instanceof Error ? error.message : "Không thể tạo phòng.";
      return rejectWithValue(message);
    }
  },
);

// ---------------------------------------------------------------------------

/**
 * Leave the current room and clean up all session data.
 *
 * Flow (Docs 5.2.9):
 * 1. emit `room:leave` (no payload — server knows which room via socket)
 * 2. Clear localStorage for this room code
 * 3. dispatch clearSession + clearRoom + clearChat
 *
 * Note: Cleanup is always performed even if the server ack fails,
 * because the user's intent to leave should be respected.
 * The server will detect the disconnect eventually anyway.
 */
export const leaveRoom = createAsyncThunk<
  void,
  { code: string },
  { state: RootState; rejectValue: string }
>(
  "room/leave",
  async ({ code }, { dispatch }) => {
    // Best-effort server notification — don't block cleanup on failure
    try {
      await emitWithAck(socket, "room:leave");
    } catch {
      // Server ack failed, but we still clean up locally
    }

    // Always clean up regardless of server response
    clearStoredParticipant(code);
    dispatch(clearSession());
    dispatch(clearRoom());
    dispatch(clearChat());
  },
);
