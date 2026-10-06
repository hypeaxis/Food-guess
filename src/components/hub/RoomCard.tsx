"use client";

import type { RoomSummary, RoomSummaryPhase } from "@/types";

// ---------------------------------------------------------------------------
// RoomCard — Displays an individual room in the Hub room list
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export interface RoomCardProps {
  room: RoomSummary;
  onJoin: (code: string) => void;
  className?: string;
}

function getPhaseBadge(phase: RoomSummaryPhase): { label: string; style: string } {
  switch (phase) {
    case "lobby":
      return {
        label: "Đang chờ",
        style: "border-emerald-700/50 bg-emerald-950/60 text-emerald-300",
      };
    case "playing":
      return {
        label: "Đang chơi",
        style: "border-amber-700/50 bg-amber-950/60 text-amber-300",
      };
    case "roundReveal":
      return {
        label: "Tổng kết vòng",
        style: "border-purple-700/50 bg-purple-950/60 text-purple-300",
      };
    case "finished":
      return {
        label: "Đã kết thúc",
        style: "border-neutral-700/50 bg-neutral-900 text-neutral-400",
      };
    default:
      return {
        label: phase,
        style: "border-neutral-700/50 bg-neutral-900 text-neutral-300",
      };
  }
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return "";
  const now = Date.now();
  const diffMinutes = Math.floor((now - timestamp) / 60000);
  if (diffMinutes < 1) return "Vừa tạo";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return new Date(timestamp).toLocaleDateString("vi-VN");
}

export default function RoomCard({ room, onJoin, className = "" }: RoomCardProps) {
  const isFull = room.participantCount >= 50;
  const isFinished = room.phase === "finished";
  const canJoin = !isFull && !isFinished;

  const phaseBadge = getPhaseBadge(room.phase);
  const fillPercent = Math.min(100, Math.round((room.participantCount / 50) * 100));

  const progressColor =
    fillPercent >= 100
      ? "bg-rose-500"
      : fillPercent >= 80
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <article
      className={`flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-sm transition-all hover:border-neutral-700 hover:bg-neutral-900 ${className}`}
    >
      {/* Top bar: Room Code & Phase status badge */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Phòng
            </span>
            <span className="font-mono text-lg font-bold tracking-wider text-neutral-100">
              {room.code}
            </span>
          </div>

          <span
            className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${phaseBadge.style}`}
          >
            {phaseBadge.label}
          </span>
        </div>

        {/* Host name & Created time */}
        <div className="mt-3 space-y-1 text-sm text-neutral-300">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Chủ phòng:</span>
            <span className="font-medium text-neutral-200">
              {room.hostName || "Ẩn danh"}
            </span>
          </div>

          {room.createdAt > 0 && (
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span>Thời gian:</span>
              <span>{formatRelativeTime(room.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-neutral-800/80" />

        {/* Participant & Online stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Người chơi:</span>
            <span className="font-semibold text-neutral-200">
              {room.participantCount} / 50
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Trực tuyến:</span>
            <span className="font-medium text-emerald-400">
              {room.onlineCount} đang online
            </span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-5 pt-1">
        <button
          type="button"
          onClick={() => onJoin(room.code)}
          disabled={!canJoin}
          className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
            canJoin
              ? "bg-amber-500 text-neutral-950 hover:bg-amber-400 active:scale-[0.98]"
              : "cursor-not-allowed border border-neutral-800 bg-neutral-850 text-neutral-500"
          }`}
        >
          {isFinished
            ? "Đã kết thúc"
            : isFull
            ? "Phòng đã đầy"
            : "Vào phòng"}
        </button>
      </div>
    </article>
  );
}
