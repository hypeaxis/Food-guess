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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "all"
                ? "bg-amber-500 text-neutral-950"
                : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Tất cả ({categorized.all.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("lobby")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "lobby"
                ? "bg-emerald-600 text-white"
                : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Đang chờ ({lobbyCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("playing")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              activeTab === "playing"
                ? "bg-amber-600 text-white"
                : "border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            Đang chơi ({playingCount})
          </button>
        </div>

        {/* Right side: Refresh button & Timestamp */}
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          {lastUpdatedText && (
            <span className="hidden sm:inline">
              Cập nhật lúc: {lastUpdatedText}
            </span>
          )}

          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs font-medium text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-700 disabled:opacity-60"
          >
            {isFetching ? "Đang làm mới..." : "Làm mới"}
          </button>
        </div>
      </div>

      {/* Main Content Areas */}

      {/* 1. Initial Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex h-56 flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 animate-pulse"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-24 rounded bg-neutral-800" />
                  <div className="h-5 w-20 rounded bg-neutral-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-neutral-800" />
                  <div className="h-4 w-28 rounded bg-neutral-800" />
                </div>
                <div className="h-2 w-full rounded bg-neutral-800" />
              </div>
              <div className="h-10 w-full rounded-lg bg-neutral-800" />
            </div>
          ))}
        </div>
      )}

      {/* 2. Error State */}
      {!isLoading && isError && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-8 text-center">
          <p className="font-semibold text-rose-300">
            Không thể tải danh sách phòng
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra lại đường truyền mạng.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 3. Empty State */}
      {!isLoading && !isError && displayedRooms.length === 0 && (
        <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/30 p-12 text-center">
          <p className="text-base font-medium text-neutral-300">
            Chưa có phòng nào đang mở
          </p>
          <p className="mt-1 text-sm text-neutral-400">
            {activeTab === "all"
              ? "Hiện tại không có phòng nào. Bạn hãy là người đầu tiên tạo phòng!"
              : "Không có phòng nào trong danh mục đã chọn. Hãy chuyển bộ lọc hoặc tạo phòng mới."}
          </p>
        </div>
      )}

      {/* 4. Success Grid */}
      {!isLoading && !isError && displayedRooms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
