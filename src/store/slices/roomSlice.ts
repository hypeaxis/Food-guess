import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RoomSnapshot } from "@/types";

// ---------------------------------------------------------------------------
// Room state — stores the latest snapshot from server
// Plan: section 2.2 — "snapshot: RoomSnapshot | null, closedReason"
// Principle: Server is the single source of truth. FE just stores snapshot.
// ---------------------------------------------------------------------------

type RoomState = {
  /** Latest snapshot received from room:snapshot or ack */
  snapshot: RoomSnapshot | null;
  /** Set when room is closed (e.g. "ROOM_CLOSED" when host cancels) */
  closedReason: string | null;
};

const initialState: RoomState = {
  snapshot: null,
  closedReason: null,
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    /** Replace snapshot entirely — always take the newest, never merge */
    setSnapshot(state, action: PayloadAction<RoomSnapshot>) {
      state.snapshot = action.payload;
      // Check if room was closed
      if (action.payload.closedReason) {
        state.closedReason = action.payload.closedReason;
      }
    },
    setClosedReason(state, action: PayloadAction<string>) {
      state.closedReason = action.payload;
    },
    clearRoom(state) {
      state.snapshot = null;
      state.closedReason = null;
    },
  },
});

export const { setSnapshot, setClosedReason, clearRoom } = roomSlice.actions;

export default roomSlice.reducer;
