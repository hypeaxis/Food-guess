import type { Socket } from "socket.io-client";
import type { Ack } from "@/types";
import { SocketAckError } from "./errors";

// ---------------------------------------------------------------------------
// Promise Wrapper for Socket.IO emitWithAck
// Plan: section 2.1, 2.3 & Giai đoạn 1 (Đầu việc 1)
//
// Converts callback-based socket.emit into a typed Promise.
// Rejects if the server responds with ack.ok === false or if the call times out.
// ---------------------------------------------------------------------------

const DEFAULT_TIMEOUT_MS = 10000; // 10 seconds

export type EmitWithAckOptions = {
  /** Timeout in milliseconds before rejecting with a timeout error (default: 10000ms) */
  timeoutMs?: number;
};

/**
 * Emits a Socket.IO event with acknowledgement and returns a Promise.
 *
 * @param socket - Socket.IO client instance
 * @param event - Name of the event to emit
 * @param payload - Optional data payload
 * @param options - Timeout configuration
 * @returns Promise resolving to the data returned in ack.data
 * @throws {SocketAckError} when ack.ok === false
 * @throws {Error} on timeout or communication failure
 */
export function emitWithAck<TData = unknown, TPayload = unknown>(
  socket: Socket,
  event: string,
  payload?: TPayload,
  options: EmitWithAckOptions = {}
): Promise<TData> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return new Promise<TData>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isSettled = false;

    // Safety timeout in case the server never responds or network drops
    timer = setTimeout(() => {
      if (isSettled) return;
      isSettled = true;
      reject(
        new Error(
          `Yêu cầu '${event}' quá thời gian phản hồi (${Math.round(
            timeoutMs / 1000
          )}s). Vui lòng thử lại.`
        )
      );
    }, timeoutMs);

    const handleAck = (ack: Ack<TData>) => {
      if (isSettled) return;
      isSettled = true;
      if (timer) clearTimeout(timer);

      if (!ack || typeof ack !== "object") {
        reject(new Error("Phản hồi từ máy chủ không hợp lệ."));
        return;
      }

      if (ack.ok) {
        resolve(ack.data);
      } else {
        reject(new SocketAckError(ack.error));
      }
    };

    try {
      if (payload !== undefined) {
        socket.emit(event, payload, handleAck);
      } else {
        socket.emit(event, handleAck);
      }
    } catch (error) {
      if (isSettled) return;
      isSettled = true;
      if (timer) clearTimeout(timer);
      reject(error);
    }
  });
}
