"use client";

// ---------------------------------------------------------------------------
// RoomClosedModal — Thông báo cho tất cả người chơi khi phòng bị đóng/giải tán
// Rule: Text-only UI, Dark Mode design tokens, modal backdrop
// ---------------------------------------------------------------------------

type RoomClosedModalProps = {
  isOpen: boolean;
  reason?: string | null;
  onConfirm: () => void;
};

export default function RoomClosedModal({
  isOpen,
  reason,
  onConfirm,
}: RoomClosedModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-rose-border bg-surface-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-center justify-between">
          <span className="rounded border border-rose-border bg-rose-bg px-2.5 py-1 font-mono text-[11px] font-bold text-rose-text uppercase">
            [ PHÒNG ĐÃ BỊ HỦY ]
          </span>
          <span className="font-mono text-xs text-on-surface-variant">
            {reason ?? "ROOM_CLOSED"}
          </span>
        </div>

        <div>
          <h2 className="font-mono text-lg font-black uppercase tracking-tight text-on-surface sm:text-xl">
            PHÒNG THI ĐẤU ĐÃ ĐÓNG
          </h2>
          <p className="mt-2 font-mono text-xs text-on-surface-variant leading-relaxed">
            Chủ phòng đã rời đi hoặc máy chủ đã giải tán phòng chơi này. Phiên đấu hiện tại không còn khả dụng để tiếp tục.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex w-full items-center justify-center rounded-xl bg-primary-container py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-brand-amber-hover shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            [ QUAY VỀ SẢNH CHỜ CHÍNH ]
          </button>
        </div>
      </div>
    </div>
  );
}
