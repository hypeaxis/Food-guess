import { type ErrorCode, ERROR_MESSAGES } from "@/types";

// ---------------------------------------------------------------------------
// Error Mapping & Notification Helper
// Plan: section 2.1 & Giai đoạn 1 (Đầu việc 1)
// Docs: section 7 — "Bảng mã lỗi (Error Codes) & Gợi ý Toast UI"
// ---------------------------------------------------------------------------

export { ERROR_MESSAGES };
export type { ErrorCode };

const DEFAULT_ERROR_MESSAGE = "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";

/**
 * Type guard to check whether a string is a known BE ErrorCode.
 */
export function isErrorCode(code: string): code is ErrorCode {
  return Object.prototype.hasOwnProperty.call(ERROR_MESSAGES, code);
}

/**
 * Maps a backend error code or arbitrary error string to a friendly Vietnamese message.
 * Falls back to DEFAULT_ERROR_MESSAGE if code is missing or unknown.
 */
export function getErrorMessage(code?: string | null): string {
  if (!code) {
    return DEFAULT_ERROR_MESSAGE;
  }

  if (isErrorCode(code)) {
    return ERROR_MESSAGES[code];
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Custom error class for failed Socket.IO ack responses.
 * Carries both the raw error code from BE and the translated Vietnamese message.
 */
export class SocketAckError extends Error {
  readonly code: string;

  constructor(code: string, customMessage?: string) {
    const message = customMessage || getErrorMessage(code);
    super(message);
    this.name = "SocketAckError";
    this.code = code;
    Object.setPrototypeOf(this, SocketAckError.prototype);
  }
}
