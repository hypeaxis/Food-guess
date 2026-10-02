import type { RoomSummary } from "@/types";

// ---------------------------------------------------------------------------
// Mock RoomSummaries for Hub (GET /api/rooms) testing
// Plan: section 3 (Giai đoạn 0 & Giai đoạn 2)
// ---------------------------------------------------------------------------

export const mockRoomSummaries: RoomSummary[] = [
  {
    code: "FOOD88",
    gameType: "food-guess",
    phase: "lobby",
    participantCount: 4,
    onlineCount: 3,
    hostName: "Quốc An",
    createdAt: Date.now() - 120000,
  },
  {
    code: "BANHMI",
    gameType: "food-guess",
    phase: "playing",
    participantCount: 8,
    onlineCount: 8,
    hostName: "Hương Giang",
    createdAt: Date.now() - 300000,
  },
  {
    code: "FULL50",
    gameType: "food-guess",
    phase: "playing",
    participantCount: 50,
    onlineCount: 48,
    hostName: "Minh Tuấn",
    createdAt: Date.now() - 600000,
  },
  {
    code: "MUSIC1",
    gameType: "song-guess",
    phase: "lobby",
    participantCount: 6,
    onlineCount: 6,
    hostName: "Văn Hùng",
    createdAt: Date.now() - 900000,
  },
  {
    code: "CUPVN",
    gameType: "worldcup",
    phase: "voting",
    participantCount: 12,
    onlineCount: 10,
    hostName: "Đức Trọng",
    createdAt: Date.now() - 1500000,
  },
];
