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
        style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      };
    case "playing":
      return {
        label: "Đang chơi",
        style: "border-badge-amber-border bg-badge-amber-bg text-badge-amber-text",
      };
    case "roundReveal":
      return {
        label: "Tổng kết vòng",
        style: "border-purple-500/30 bg-purple-500/10 text-purple-400",
      };
    case "finished":
      return {
        label: "Đã kết thúc",
        style: "border-border-subtle bg-surface-sub text-on-surface-variant",
      };
    default:
      return {
        label: phase,
        style: "border-border-subtle bg-surface-sub text-on-surface-variant",
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
      className={`group flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-card p-5 transition-all hover:bg-surface-container ${className}`}
    >
      {/* Top section */}
      <div>
        {/* Header: Room Code & Phase Badge */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
              MÃ PHÒNG
            </span>
            <span className="font-mono text-xl font-bold tracking-widest text-primary-container">
              {room.code}
            </span>
          </div>

          <span
            className={`rounded px-2.5 py-0.5 font-mono text-[11px] font-medium border ${phaseBadge.style}`}
          >
            {phaseBadge.label}
          </span>
        </div>

        {/* Metadata sub-card */}
        <div className="mb-4 space-y-2 rounded-lg border border-border-subtle bg-surface-sub p-3 font-mono text-xs">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span>CHỦ PHÒNG:</span>
            <span className="font-semibold text-on-surface">
              {room.hostName || "Ẩn danh"}
            </span>
          </div>

          {room.createdAt > 0 && (
            <div className="flex items-center justify-between text-on-surface-variant">
              <span>THỜI GIAN:</span>
              <span className="text-on-surface">{formatRelativeTime(room.createdAt)}</span>
            </div>
          )}
        </div>

        {/* Participant & Online stats */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-on-surface-variant">NGƯỜI CHƠI:</span>
            <span className="font-semibold text-on-surface">
              {room.participantCount} / 50
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 w-full overflow-hidden rounded-full border border-border-subtle bg-surface-sub">
            <div
              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
            <span>TRỰC TUYẾN:</span>
            <span className="font-semibold text-emerald-400">
              {room.onlineCount} đang online
            </span>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => onJoin(room.code)}
          disabled={!canJoin}
          className={`w-full rounded-lg px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all active:scale-[0.98] ${
            canJoin
              ? "border border-border-subtle bg-surface-container-high text-primary-container hover:bg-primary-container hover:text-on-primary-container"
              : "cursor-not-allowed border border-border-subtle bg-surface-sub text-neutral-600"
          }`}
        >
          {isFinished
            ? "[ ĐÃ KẾT THÚC ]"
            : isFull
            ? "[ PHÒNG ĐÃ ĐẦY ]"
            : "[ VÀO PHÒNG ]"}
        </button>
      </div>
    </article>
  );
}
