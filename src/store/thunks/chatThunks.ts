import { createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import { socket } from "@/lib/socket";
import { emitWithAck } from "@/lib/emitWithAck";
import { SocketAckError, getErrorMessage } from "@/lib/errors";
import { ERROR_MESSAGES } from "@/types";
import { addToast } from "../slices/uiSlice";
import type { ChatSendPayload, ChatSendAckData } from "@/types";

// ---------------------------------------------------------------------------
// Async Thunks & Helpers — Chat Management
// Phase 6 (Đầu việc 1): Chatbox thời gian thực & Chống spam client
// Docs: section 5.1 (chat:message), 5.2.10 (chat:send), section 7 (RATE_LIMITED, INVALID_GIF_URL)
// ---------------------------------------------------------------------------

/** Allowed hostnames for Tenor and Giphy GIF links */
const ALLOWED_GIF_DOMAINS = [
  "tenor.com",
  "www.tenor.com",
  "c.tenor.com",
  "media.tenor.com",
  "giphy.com",
  "www.giphy.com",
  "media.giphy.com",
  "i.giphy.com",
];

/**
 * Validates whether a URL points to an approved Tenor or Giphy GIF.
 * Strictly checks protocol and domain whitelist to prevent malicious links.
 */
export function isValidGifUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (ALLOWED_GIF_DOMAINS.includes(host)) {
      return true;
    }
    // Allow subdomains like media0..media4.giphy.com or sub.tenor.com
    if (host.endsWith(".tenor.com") || host.endsWith(".giphy.com")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Client-side Rate Limiter
// Specification: Max 5 messages in 10 seconds (RATE_LIMITED)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
const RATE_LIMIT_MAX_COUNT = 5;      // 5 messages
let recentMessageTimestamps: number[] = [];

/**
 * Checks client rate limit against sliding window.
 * Returns true if allowed (and registers timestamp), false if rate-limited.
 */
export function checkClientRateLimit(now: number = Date.now()): boolean {
  // Prune timestamps older than the sliding window
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  recentMessageTimestamps = recentMessageTimestamps.filter((t) => t > cutoff);

  if (recentMessageTimestamps.length >= RATE_LIMIT_MAX_COUNT) {
    return false;
  }

  recentMessageTimestamps.push(now);
  return true;
}

/**
 * Calculates remaining milliseconds before the client can send another message.
 * Returns 0 if not currently rate-limited.
 */
export function getRemainingRateLimitTimeMs(now: number = Date.now()): number {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  recentMessageTimestamps = recentMessageTimestamps.filter((t) => t > cutoff);

  if (recentMessageTimestamps.length < RATE_LIMIT_MAX_COUNT) {
    return 0;
  }

  const oldest = recentMessageTimestamps[0];
  const waitMs = oldest + RATE_LIMIT_WINDOW_MS - now;
  return Math.max(0, waitMs);
}

/**
 * Resets the in-memory rate limit history (useful for tests or reconnection).
 */
export function resetClientRateLimit(): void {
  recentMessageTimestamps = [];
}

// ---------------------------------------------------------------------------
// sendChatMessage Thunk
// ---------------------------------------------------------------------------

/**
 * Send a chat message (text or GIF) to the current room.
 *
 * Flow (Docs 5.2.10 & Phase 6 Plan):
 * 1. Client-side validation:
 *    - Rate limit: max 5 messages in 10s
 *    - Text: 1 to 300 characters
 *    - GIF: Whitelist Tenor / Giphy domains
 * 2. emit `chat:send` via emitWithAck
 * 3. On ack ok -> returns ChatSendAckData (ChatMessage)
 *    (Server then broadcasts `chat:message` to all participants via socketMiddleware)
 * 4. On ack error (RATE_LIMITED, INVALID_GIF_URL, NOT_IN_ROOM) ->
 *    catches SocketAckError and dispatches friendly toast notification
 */
export const sendChatMessage = createAsyncThunk<
  ChatSendAckData,
  ChatSendPayload,
  { state: RootState; rejectValue: string }
>(
  "chat/send",
  async (payload, { dispatch, rejectWithValue }) => {
    // 1. Client-side Rate Limit check
    if (!checkClientRateLimit()) {
      const remainingSec = Math.ceil(getRemainingRateLimitTimeMs() / 1000);
      const message = `${ERROR_MESSAGES.RATE_LIMITED} (Thử lại sau ${remainingSec}s)`;

      dispatch(
        addToast({
          id: `chat-rate-limit-${Date.now()}`,
          type: "warning",
          message,
        })
      );

      return rejectWithValue(message);
    }

    // 2. Validate content type and payload
    let sanitizedPayload: ChatSendPayload;

    if ("text" in payload) {
      const text = payload.text?.trim() ?? "";
      if (text.length < 1 || text.length > 300) {
        const message = "Nội dung tin nhắn phải từ 1 đến 300 ký tự.";
        dispatch(
          addToast({
            id: `chat-text-length-${Date.now()}`,
            type: "warning",
            message,
          })
        );
        return rejectWithValue(message);
      }
      sanitizedPayload = { text };
    } else if ("gifUrl" in payload) {
      const gifUrl = payload.gifUrl?.trim() ?? "";
      if (!isValidGifUrl(gifUrl)) {
        const message = ERROR_MESSAGES.INVALID_GIF_URL;
        dispatch(
          addToast({
            id: `chat-invalid-gif-${Date.now()}`,
            type: "error",
            message,
          })
        );
        return rejectWithValue(message);
      }
      sanitizedPayload = { gifUrl };
    } else {
      const message = "Tin nhắn không hợp lệ.";
      dispatch(
        addToast({
          id: `chat-invalid-payload-${Date.now()}`,
          type: "error",
          message,
        })
      );
      return rejectWithValue(message);
    }

    // 3. Emit socket event with acknowledgement
    try {
      const data = await emitWithAck<ChatSendAckData, ChatSendPayload>(
        socket,
        "chat:send",
        sanitizedPayload
      );
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
          id: `chat-send-error-${Date.now()}`,
          type: "error",
          message,
        })
      );

      return rejectWithValue(message);
    }
  }
);
