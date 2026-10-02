import { createAction, type Middleware } from "@reduxjs/toolkit";
import { socket } from "@/lib/socket";
import {
  setConnected,
  setDisconnected,
  setReconnecting,
  setConnectionError,
  setConnecting,
} from "./slices/connectionSlice";
import { setSnapshot } from "./slices/roomSlice";
import { addChatMessage } from "./slices/chatSlice";
import type { RoomSnapshot, ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// Redux Socket.IO Middleware
// Plan: section 2.1, 2.3 & Giai đoạn 1 (Đầu việc 3 & 4)
//
// Key principles:
// 1. Single Listener Registration:
//    Listener registration is protected by `isInitialized` to guarantee
//    that listeners are registered EXACTLY ONCE, preventing duplicate
//    room:snapshot or chat:message handlers caused by React StrictMode mounting twice.
// 2. Unidirectional Data Flow:
//    Socket events -> Middleware -> Dispatch Action -> Reducer -> UI.
// ---------------------------------------------------------------------------

/**
 * Action to explicitly trigger socket connection via Redux.
 */
export const connectSocketAction = createAction("socket/connect");

/**
 * Action to explicitly trigger socket disconnection via Redux.
 */
export const disconnectSocketAction = createAction("socket/disconnect");

let isInitialized = false;

export const socketMiddleware: Middleware = (store) => {
  return (next) => (action) => {
    // Register socket listeners once on the client side
    if (!isInitialized && typeof window !== "undefined") {
      isInitialized = true;

      // Socket lifecycle events
      socket.on("connect", () => {
        store.dispatch(setConnected({ socketId: socket.id || undefined }));
      });

      socket.on("disconnect", (reason) => {
        store.dispatch(setDisconnected({ reason }));
      });

      socket.on("connect_error", (error) => {
        store.dispatch(
          setConnectionError(error.message || "Lỗi kết nối Socket.IO")
        );
      });

      // Manager reconnect events (from socket.io manager)
      socket.io.on("reconnect_attempt", (attempt: number) => {
        store.dispatch(setReconnecting({ attempt }));
      });

      socket.io.on("reconnect_failed", () => {
        store.dispatch(
          setConnectionError("Không thể kết nối lại máy chủ sau 10 lần thử.")
        );
      });

      // Business domain events from server
      socket.on("room:snapshot", (snapshot: RoomSnapshot) => {
        store.dispatch(setSnapshot(snapshot));
      });

      socket.on("chat:message", (message: ChatMessage) => {
        store.dispatch(addChatMessage(message));
      });
    }

    // Intercept client-driven socket control actions
    if (connectSocketAction.match(action)) {
      if (!socket.connected) {
        store.dispatch(setConnecting());
        socket.connect();
      }
    } else if (disconnectSocketAction.match(action)) {
      if (socket.connected) {
        socket.disconnect();
      }
    }

    return next(action);
  };
};

/**
 * Helper to reset the middleware initialization state (useful for tests and hot-reloads).
 */
export function resetSocketMiddleware(): void {
  isInitialized = false;
  socket.removeAllListeners();
}
