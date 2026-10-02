import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ---------------------------------------------------------------------------
// Connection status for the Socket.IO connection
// Plan: section 2.2, 8.3 & Giai đoạn 1 (Đầu việc 4)
// Docs: section 2.1 & 8.3 (Render cold start handling)
// ---------------------------------------------------------------------------

export type ConnectionStatus =
  | "idle"          // Chưa kết nối
  | "connecting"    // Đang bắt đầu kết nối
  | "waking"        // Server cold start (chờ Render thức dậy)
  | "connected"     // Đã kết nối thành công
  | "reconnecting"  // Mất kết nối, đang thử lại (tối đa 10 lần)
  | "error";        // Hết lượt thử hoặc lỗi nghiêm trọng

export type ConnectionState = {
  status: ConnectionStatus;
  /** Active Socket.IO ID */
  socketId: string | null;
  /** Current reconnect attempt count (1..10) */
  reconnectAttempt: number;
  /** Error message when status is "error" */
  errorMessage: string | null;
};

const initialState: ConnectionState = {
  status: "idle",
  socketId: null,
  reconnectAttempt: 0,
  errorMessage: null,
};

const connectionSlice = createSlice({
  name: "connection",
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<ConnectionStatus>) {
      state.status = action.payload;
      if (action.payload !== "error") {
        state.errorMessage = null;
      }
    },
    setConnecting(state) {
      state.status = "connecting";
      state.errorMessage = null;
    },
    setWaking(state) {
      state.status = "waking";
      state.errorMessage = null;
    },
    setConnected(
      state,
      action: PayloadAction<{ socketId?: string } | undefined>
    ) {
      state.status = "connected";
      state.socketId = action?.payload?.socketId ?? null;
      state.reconnectAttempt = 0;
      state.errorMessage = null;
    },
    setDisconnected(
      state,
      action: PayloadAction<{ reason?: string } | undefined>
    ) {
      const reason = action?.payload?.reason;
      state.socketId = null;
      if (reason === "io client disconnect") {
        state.status = "idle";
        state.reconnectAttempt = 0;
      } else {
        state.status = "reconnecting";
      }
    },
    setReconnecting(
      state,
      action: PayloadAction<{ attempt?: number } | undefined>
    ) {
      state.status = "reconnecting";
      state.reconnectAttempt =
        action?.payload?.attempt ?? state.reconnectAttempt + 1;
    },
    setConnectionError(state, action: PayloadAction<string>) {
      state.status = "error";
      state.errorMessage = action.payload;
    },
    resetConnection(state) {
      state.status = "idle";
      state.socketId = null;
      state.reconnectAttempt = 0;
      state.errorMessage = null;
    },
  },
});

export const {
  setConnectionStatus,
  setConnecting,
  setWaking,
  setConnected,
  setDisconnected,
  setReconnecting,
  setConnectionError,
  resetConnection,
} = connectionSlice.actions;

export default connectionSlice.reducer;
