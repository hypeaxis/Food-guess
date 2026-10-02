import type { StoredParticipant } from "@/types";

// ---------------------------------------------------------------------------
// Session Storage Helper for Room Participants
// Plan: section 2.1, 2.2 & Giai đoạn 1 (Đầu việc 1)
// Docs: section 2.2 — "FE bắt buộc phải lưu 3 thông tin vào localStorage
//                       (theo key mã phòng room_participant_{code}) để hỗ trợ F5 / Reconnect"
//
// SSR Safe: Completely guarded with `typeof window !== "undefined"` and try/catch.
// ---------------------------------------------------------------------------

const STORAGE_PREFIX = "room_participant_";

/**
 * Returns the standardized storage key for a room code.
 */
function getStorageKey(code: string): string {
  return `${STORAGE_PREFIX}${code.trim().toUpperCase()}`;
}

/**
 * Retrieves the stored participant credentials for a given room code.
 * Returns null if not in browser, key not found, or data is invalid.
 */
export function getStoredParticipant(code: string): StoredParticipant | null {
  if (typeof window === "undefined" || !code) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(code));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.participantId === "string" &&
      typeof parsed.token === "string" &&
      typeof parsed.name === "string"
    ) {
      return {
        participantId: parsed.participantId,
        token: parsed.token,
        name: parsed.name,
      };
    }

    return null;
  } catch (error) {
    console.warn(`[Session] Failed to read session for room ${code}:`, error);
    return null;
  }
}

/**
 * Saves participant credentials to localStorage under key `room_participant_{code}`.
 */
export function setStoredParticipant(
  code: string,
  participant: StoredParticipant
): void {
  if (typeof window === "undefined" || !code) {
    return;
  }

  try {
    const key = getStorageKey(code);
    window.localStorage.setItem(key, JSON.stringify(participant));
  } catch (error) {
    console.warn(`[Session] Failed to save session for room ${code}:`, error);
  }
}

/**
 * Removes participant credentials for a given room code from localStorage.
 */
export function clearStoredParticipant(code: string): void {
  if (typeof window === "undefined" || !code) {
    return;
  }

  try {
    const key = getStorageKey(code);
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Session] Failed to clear session for room ${code}:`, error);
  }
}

/**
 * Checks whether a session exists for the specified room code.
 */
export function hasStoredParticipant(code: string): boolean {
  return getStoredParticipant(code) !== null;
}
