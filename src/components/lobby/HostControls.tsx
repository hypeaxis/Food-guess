"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { startGame } from "@/store/thunks";

// ---------------------------------------------------------------------------
// HostControls — Nút bắt đầu ván chơi cho Host hoặc khung chờ cho Participant
// Rule: Text-only UI, Dark Mode design tokens, feedback trạng thái
// ---------------------------------------------------------------------------

type HostControlsProps = {
  isHost: boolean;
  participantCount: number;
};

export default function HostControls({
  isHost,
  participantCount,
}: HostControlsProps) {
  const dispatch = useAppDispatch();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartGame = async () => {
    if (isStarting) return;
    setIsStarting(true);
    try {
      await dispatch(startGame()).unwrap();
    } catch {
      // Error handled by thunk via toast
    } finally {
      setIsStarting(false);
    }
  };

  if (isHost) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-badge-amber-border/60 bg-surface-card p-6 shadow-xl backdrop-blur-sm sm:p-7">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-container">
            QUYỀN HẠN CHỦ PHÒNG (HOST)
          </span>
          <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2 py-0.5 font-mono text-[11px] font-bold text-badge-amber-text">
            [ SẴN SÀNG ]
          </span>
        </div>

        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
          Tất cả người chơi trong phòng sẽ đồng loạt nhận câu hỏi vòng 1 ngay khi bạn nhấn bắt đầu.
        </p>

        {participantCount <= 1 && (
          <div className="rounded-xl border border-border-interactive bg-surface-sub p-3 font-mono text-[11px] text-on-surface-variant leading-normal">
            <span className="text-primary-container font-bold">[ LƯU Ý: ]</span> Hiện phòng chỉ có 1 người chơi. Bạn có thể bấm bắt đầu để chơi thử nghiệm hoặc sao chép link mời thêm bạn bè.
          </div>
        )}

        <button
          type="button"
          onClick={handleStartGame}
          disabled={isStarting}
          className="mt-1 flex w-full items-center justify-center rounded-xl bg-primary-container py-4 font-mono text-sm font-black uppercase tracking-wider text-neutral-950 transition-all hover:bg-brand-amber-hover hover:shadow-lg hover:shadow-amber-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isStarting ? "[ ĐANG KHỞI TẠO VÁN CHƠI... ]" : "[ BẮT ĐẦU VÁN CHƠI ]"}
        </button>
      </div>
    );
  }

  // Participant view: Waiting indicator
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-6 text-center shadow-xl backdrop-blur-sm sm:p-7">
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        TRẠNG THÁI PHÒNG THI ĐẤU
      </span>

      <div className="my-2 rounded-xl border border-badge-amber-border/40 bg-surface-sub py-6 px-4">
        <div className="animate-pulse font-mono text-sm font-bold text-primary-container">
          [ ĐANG CHỜ CHỦ PHÒNG BẮT ĐẦU TRẬN ĐẤU... ]
        </div>
        <p className="mt-2 font-mono text-xs text-on-surface-variant leading-relaxed">
          Ván đấu sẽ tự động chuyển sang vòng 1 ngay khi Host kích hoạt. Hãy sẵn sàng đoán món ăn!
        </p>
      </div>
    </div>
  );
}
