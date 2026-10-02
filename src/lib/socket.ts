import { io, type Socket } from "socket.io-client";
import { API_URL } from "./config";

// ---------------------------------------------------------------------------
// Socket.IO Client Singleton
// Plan: section 2.1, 8.1, 8.3 & Giai đoạn 1 (Đầu việc 2)
// Docs: section 2.1 — "FE khởi tạo kết nối socket trỏ tới endpoint /socket.io"
//
// Key architectural decisions:
// 1. Explicit URL: io(API_URL) because backend is hosted on a different origin (Render)
// 2. autoConnect: false — Connection lifecycle is driven by Redux middleware/thunks,
//    preventing accidental background connections during SSR or initial static render.
// 3. timeout: 30000ms — Render free tier servers can spin down when idle. 30s timeout
//    ensures the client doesn't abort prematurely while the server wakes up.
// 4. transports: ["websocket", "polling"] — Tries fast WebSocket first, falls back
//    to HTTP long-polling if corporate firewalls or proxies block WebSockets.
// 5. reconnection: 10 attempts with 1000ms delay as specified in BE contract.
// ---------------------------------------------------------------------------

export const socket: Socket = io(API_URL, {
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: false,
  timeout: 30000,
});

/**
 * Returns the singleton socket instance.
 */
export function getSocket(): Socket {
  return socket;
}

/**
 * Connects the socket if it is currently disconnected.
 */
export function connectSocket(): Socket {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

/**
 * Disconnects the socket if it is currently connected.
 */
export function disconnectSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}
