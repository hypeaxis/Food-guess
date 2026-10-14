"use client";

// ---------------------------------------------------------------------------
// ViewerRoundSummary — Tóm tắt thành tích cá nhân của người xem trong vòng
// Phase 5: Round Reveal Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type ViewerRoundSummaryProps = {
  correct?: boolean;
  points?: number;
  streak?: number;
};

export function ViewerRoundSummary({
  correct,
  points = 0,
  streak = 0,
}: ViewerRoundSummaryProps) {
  const isCorrect = Boolean(correct);

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 shadow-lg transition-all ${
        isCorrect
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-300"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <span
          className={`rounded border px-2.5 py-0.5 font-mono text-xs font-bold ${
            isCorrect
              ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
              : "border-rose-500/40 bg-rose-500/20 text-rose-400"
          }`}
        >
          {isCorrect
            ? "[ KẾT QUẢ: ĐOÁN CHÍNH XÁC ]"
            : "[ KẾT QUẢ: CHƯA ĐOÁN ĐÚNG ]"}
        </span>

        {isCorrect && streak > 1 && (
          <span className="rounded border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
            [ CHUỖI ĐÚNG: x{streak} ]
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider block">
            Điểm nhận được vòng này:
          </span>
          <span
            className={`font-mono text-2xl sm:text-3xl font-black ${
              isCorrect ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {isCorrect ? `+${points}đ` : "+0đ"}
          </span>
        </div>

        <p className="font-mono text-xs text-on-surface-variant text-right max-w-[200px]">
          {isCorrect
            ? streak > 1
              ? "Tuyệt vời! Bạn đang duy trì chuỗi đoán đúng."
              : "Chúc mừng! Bạn đã ghi điểm thành công."
            : "Đừng nản lòng, hãy bứt phá ở vòng tiếp theo nhé!"}
        </p>
      </div>
    </div>
  );
}
