"use client";

import { useState, useMemo } from "react";
import { useGetRoomsQuery, categorizeRooms } from "@/store/api";
import type { RoomSummary } from "@/types";
import RoomCard from "./RoomCard";

// ---------------------------------------------------------------------------
// RoomList — Container component managing room fetching, polling, and filtering
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export interface RoomListProps {
  onJoinRoom: (code: string) => void;
  className?: string;
}

type FilterTab = "all" | "lobby" | "playing";

export default function RoomList({ onJoinRoom, className = "" }: RoomListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data, isLoading, isFetching, isError, refetch, fulfilledTimeStamp } =
    useGetRoomsQuery(undefined, {
      pollingInterval: 5000,
      skipPollingIfUnfocused: true,
    });

  const lastUpdatedText = useMemo(() => {
    if (!fulfilledTimeStamp) return "";
    return new Date(fulfilledTimeStamp).toLocaleTimeString("vi-VN");
  }, [fulfilledTimeStamp]);

  // Categorize rooms using helper
  const categorized = useMemo(() => {
    return categorizeRooms(data?.rooms ?? []);
  }, [data]);

  // Filtered rooms based on active tab
  const displayedRooms = useMemo(() => {
    switch (activeTab) {
      case "lobby":
        return categorized.all.filter((r) => r.phase === "lobby");
      case "playing":
        return categorized.all.filter(
          (r) => r.phase === "playing" || r.phase === "roundReveal"
        );
      case "all":
      default:
        return categorized.all;
    }
  }, [categorized, activeTab]);

  const lobbyCount = useMemo(
    () => categorized.all.filter((r) => r.phase === "lobby").length,
    [categorized]
  );

  const playingCount = useMemo(
    () =>
      categorized.all.filter(
        (r) => r.phase === "playing" || r.phase === "roundReveal"
      ).length,
    [categorized]
  );

  return (
    <section className={`w-full space-y-6 ${className}`}>
      {/* Header controls: Filter tabs + Refresh & status */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border-subtle bg-surface-card p-3.5">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "all"
                ? "bg-primary-container text-on-primary-container"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ TẤT CẢ ({categorized.all.length}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lobby")}
            className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "lobby"
                ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ ĐANG CHỜ ({lobbyCount}) ]
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("playing")}
            className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "playing"
                ? "border border-badge-amber-border bg-badge-amber-bg text-badge-amber-text"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ ĐANG CHƠI ({playingCount}) ]
          </button>
        </div>

        {/* Right side: Refresh button & Timestamp */}
        <div className="flex items-center gap-4 font-mono text-xs text-on-surface-variant">
          {lastUpdatedText && (
            <span className="hidden sm:inline">
              Cập nhật lúc: {lastUpdatedText}
            </span>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-border-subtle bg-surface-sub px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-on-surface transition-colors hover:bg-surface-container disabled:opacity-60"
          >
            {isFetching ? "[ ĐANG TẢI... ]" : "[ LÀM MỚI ]"}
          </button>
        </div>
      </div>

      {/* Main Content Areas */}

      {/* 1. Initial Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex h-56 animate-pulse flex-col justify-between rounded-xl border border-border-subtle bg-surface-card p-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded bg-surface-sub" />
                  <div className="h-5 w-20 rounded bg-surface-sub" />
                </div>
                <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-sub p-3">
                  <div className="h-4 w-36 rounded bg-surface-container" />
                  <div className="h-4 w-28 rounded bg-surface-container" />
                </div>
                <div className="h-2 w-full rounded-full bg-surface-sub" />
              </div>
              <div className="h-10 w-full rounded-lg bg-surface-sub" />
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-8 text-center font-mono">
          <p className="font-semibold text-rose-400">
            [ LỖI KẾT NỐI: KHÔNG THỂ TẢI DANH SÁCH PHÒNG ]
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra lại đường truyền mạng.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/30"
          >
            [ THỬ LẠI ]
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && displayedRooms.length === 0 && (
        <div className="rounded-xl border border-dashed border-border-subtle bg-surface-sub/50 p-12 text-center font-mono">
          <p className="text-sm font-semibold text-on-surface">
            [ CHƯA CÓ PHÒNG NÀO TRONG DANH SÁCH ]
          </p>
          <p className="mt-2 text-xs text-on-surface-variant">
            {activeTab === "all"
              ? "Hiện tại không có phòng nào. Bạn hãy là người đầu tiên khởi tạo phòng!"
              : "Không có phòng nào trong danh mục đã chọn. Hãy chuyển bộ lọc hoặc khởi tạo phòng mới."}
          </p>
        </div>
      )}

      {/* 4. Success Grid */}
      {!isLoading && !isError && displayedRooms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {displayedRooms.map((room: RoomSummary) => (
            <RoomCard
              key={room.code}
              room={room}
              onJoin={onJoinRoom}
            />
          ))}
        </div>
      )}
    </section>
  );
}
