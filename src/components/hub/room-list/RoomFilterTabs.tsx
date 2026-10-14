"use client";

export type RoomFilterType = "all" | "lobby" | "playing";

export interface RoomFilterTabsProps {
  activeTab: RoomFilterType;
  onSelectTab: (tab: RoomFilterType) => void;
  counts: {
    all: number;
    lobby: number;
    playing: number;
  };
}

/**
 * RoomFilterTabs — Bộ lọc danh sách phòng theo trạng thái (SRP & ISP)
 * Text-only styling: [ TẤT CẢ ], [ ĐANG CHỜ ], [ ĐANG CHƠI ]
 */
export function RoomFilterTabs({
  activeTab,
  onSelectTab,
  counts,
}: RoomFilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelectTab("all")}
        className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
          activeTab === "all"
            ? "bg-primary-container text-on-primary-container"
            : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
        }`}
      >
        [ TẤT CẢ ({counts.all}) ]
      </button>

      <button
        type="button"
        onClick={() => onSelectTab("lobby")}
        className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
          activeTab === "lobby"
            ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
            : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
        }`}
      >
        [ ĐANG CHỜ ({counts.lobby}) ]
      </button>

      <button
        type="button"
        onClick={() => onSelectTab("playing")}
        className={`rounded-lg px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
          activeTab === "playing"
            ? "border border-badge-amber-border bg-badge-amber-bg text-badge-amber-text"
            : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
        }`}
      >
        [ ĐANG CHƠI ({counts.playing}) ]
      </button>
    </div>
  );
}
