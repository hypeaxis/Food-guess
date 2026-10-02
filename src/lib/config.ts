/**
 * Centralized config for the API URL.
 * Used by both lib/socket.ts and store/api/roomsApi.ts.
 *
 * Reads from NEXT_PUBLIC_API_URL environment variable,
 * falls back to the production server URL.
 * Docs: plan section 8.1
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://uwu-cup.onrender.com";
