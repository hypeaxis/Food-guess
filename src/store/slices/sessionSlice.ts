import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { StoredParticipant } from "@/types";

// ---------------------------------------------------------------------------
// Session status for the current player's room participation
// Plan: section 2.2 & Giai đoạn 1 (Đầu việc 4)
// Docs: section 2.2 & 2.3 (Session flow: none/idle -> resuming/needsName -> joining -> joined)
// ---------------------------------------------------------------------------

export type SessionStatus =
  | "idle"       // Chưa tham gia phòng nào
  | "resuming"   // Đang thử resume từ localStorage
  | "needsName"  // Cần nhập tên để vào phòng
  | "joining"    // Đang gửi room:join hoặc room:create
  | "joined";    // Đã vào phòng thành công

export type SessionState = {
  status: SessionStatus;
  /** Current participant info (set after successful join/resume) */
  participant: StoredParticipant | null;
  /** Room code the session belongs to */
  roomCode: string | null;
};

const initialState: SessionState = {
  status: "idle",
  participant: null,
  roomCode: null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSessionStatus(state, action: PayloadAction<SessionStatus>) {
      state.status = action.payload;
    },
    setResuming(state, action: PayloadAction<string>) {
      state.status = "resuming";
      state.roomCode = action.payload.trim().toUpperCase();
    },
    setNeedsName(state, action: PayloadAction<string>) {
      state.status = "needsName";
      state.roomCode = action.payload.trim().toUpperCase();
      state.participant = null;
    },
    setJoining(state, action: PayloadAction<string>) {
      state.status = "joining";
      state.roomCode = action.payload.trim().toUpperCase();
    },
    setJoined(
      state,
      action: PayloadAction<{
        participant: StoredParticipant;
        roomCode: string;
      }>
    ) {
      state.status = "joined";
      state.participant = action.payload.participant;
      state.roomCode = action.payload.roomCode.trim().toUpperCase();
    },
    clearSession(state) {
      state.status = "idle";
      state.participant = null;
      state.roomCode = null;
    },
  },
});

export const {
  setSessionStatus,
  setResuming,
  setNeedsName,
  setJoining,
  setJoined,
  clearSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
