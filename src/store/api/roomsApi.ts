import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "@/lib/config";
import type { RoomSummary } from "@/types";

// ---------------------------------------------------------------------------
// RTK Query API slice for fetching room list
// Docs: food-guess-docs.md section 3 & phase2_plan.md task 1
//
// Endpoint: GET /api/rooms
// Polling: Recommended 5s interval with skipPollingIfUnfocused
// Cache: keepUnusedDataFor: 0 (keep data fresh)
// ---------------------------------------------------------------------------

export interface GetRoomsResponse {
  rooms: RoomSummary[];
}

export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers) => {
      // Recommend no-cache to avoid browser-level caching of dynamic rooms
      headers.set("Cache-Control", "no-cache");
      return headers;
    },
  }),
  // Don't retain stale room data once components unmount
  keepUnusedDataFor: 0,
  endpoints: (builder) => ({
    getRooms: builder.query<GetRoomsResponse, void>({
      query: () => "/api/rooms",
    }),
  }),
});

export const { useGetRoomsQuery } = roomsApi;

// ---------------------------------------------------------------------------
// Room categorization helpers for Food Guess
// ---------------------------------------------------------------------------

/** Filter only food-guess rooms from backend response */
export function filterFoodGuessRooms(rooms: RoomSummary[]): RoomSummary[] {
  return rooms.filter((r) => r.gameType === "food-guess");
}

export interface CategorizedRooms {
  /** All food-guess rooms */
  all: RoomSummary[];
  /** Rooms currently accepting players (lobby or playing, < 50 participants) */
  joinable: RoomSummary[];
  /** Rooms that have reached max capacity (>= 50 participants) */
  full: RoomSummary[];
  /** Rooms that are finished */
  finished: RoomSummary[];
}

/** Categorize food-guess rooms into joinable, full, and finished groups */
export function categorizeRooms(rooms: RoomSummary[]): CategorizedRooms {
  const foodGuess = filterFoodGuessRooms(rooms);
  return {
    all: foodGuess,
    joinable: foodGuess.filter(
      (r) =>
        (r.phase === "lobby" || r.phase === "playing") &&
        r.participantCount < 50
    ),
    full: foodGuess.filter((r) => r.participantCount >= 50),
    finished: foodGuess.filter((r) => r.phase === "finished"),
  };
}
