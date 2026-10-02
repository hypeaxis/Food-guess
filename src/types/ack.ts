/**
 * Generic acknowledgment type for all Socket.IO event responses.
 * Server always returns one of two shapes:
 * - Success: { ok: true, data: T }
 * - Error:   { ok: false, error: string }
 */
export type Ack<T> = { ok: true; data: T } | { ok: false; error: string };
