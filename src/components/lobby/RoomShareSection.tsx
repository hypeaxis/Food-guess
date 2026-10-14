"use client";

import { useClipboard } from "@/hooks/useClipboard";

export interface RoomShareSectionProps {
  code: string;
}

/**
 * RoomShareSection — Hiển thị mã phòng và nút sao chép liên kết mời (SRP, DIP)
 * Sử dụng hook useClipboard trừu tượng hóa API sao chép
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function RoomShareSection({ code }: RoomShareSectionProps) {
  const { copy, copied } = useClipboard({ timeout: 2000 });

  const handleCopyLink = async () => {
    const inviteUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/room/${code}`
        : `/room/${code}`;
    await copy(inviteUrl);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          MÃ PHÒNG THI ĐẤU
        </span>
        <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2 py-0.5 font-mono text-[11px] font-bold text-badge-amber-text">
          [ SẢNH CHỜ ]
        </span>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-3xl font-black tracking-widest text-primary-container sm:text-4xl">
          {code}
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`rounded-lg border px-3.5 py-2 font-mono text-xs font-bold transition-all cursor-pointer ${
            copied
              ? "border-emerald-border bg-emerald-bg text-emerald-text"
              : "border-border-interactive bg-surface-sub text-on-surface hover:border-primary-container hover:text-primary-container"
          }`}
        >
          {copied ? "[ ĐÃ SAO CHÉP LIÊN KẾT ]" : "[ SAO CHÉP LIÊN KẾT MỜI ]"}
        </button>
      </div>
    </div>
  );
}
