"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// GuessInput — Ô nhập và gửi đáp án đoán món ăn của người chơi
// Rule: Text-only UI, Dark Mode design tokens, khóa khi đã nộp hoặc hết giờ
// ---------------------------------------------------------------------------

type GuessInputProps = {
  roundId: string;
  viewerAnswered: boolean;
  viewerResult?: "correct" | "incorrect" | null;
  isExpired?: boolean;
  onSubmit: (answer: string) => Promise<void> | void;
  isSubmitting?: boolean;
};

export default function GuessInput({
  viewerAnswered,
  viewerResult,
  isExpired = false,
  onSubmit,
  isSubmitting = false,
}: GuessInputProps) {
  const [answer, setAnswer] = useState("");
  const [localError, setLocalError] = useState("");

  const isLocked = viewerAnswered || isExpired || isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const trimmed = answer.trim();
    if (!trimmed) {
      setLocalError("Vui lòng nhập tên món ăn bạn đoán.");
      return;
    }

    if (trimmed.length > 200) {
      setLocalError("Đáp án không được vượt quá 200 ký tự.");
      return;
    }

    setLocalError("");
    onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-6">
      <div className="flex items-center justify-between">
        <label
          htmlFor="guess-input-field"
          className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface"
        >
          NHẬP ĐÁP ÁN CỦA BẠN
        </label>
        <span className="font-mono text-[11px] text-on-surface-variant">
          (1 - 200 KÝ TỰ)
        </span>
      </div>

      {/* Answer Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            id="guess-input-field"
            type="text"
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              if (localError) setLocalError("");
            }}
            disabled={isLocked}
            placeholder={
              isExpired
                ? "Đã hết thời gian vòng này"
                : viewerAnswered
                ? "Bạn đã nộp đáp án cho vòng này"
                : "Gõ tên món ăn (ví dụ: Phở bò, Bánh mì...)"
            }
            className="w-full rounded-xl border border-border-interactive bg-surface-sub px-4 py-3.5 font-sans text-base sm:text-sm text-on-surface placeholder:text-surface-variant outline-none transition-all focus:border-primary-container focus:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isLocked || !answer.trim()}
          className="flex items-center justify-center rounded-xl bg-primary-container px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-neutral-950 transition-all hover:bg-brand-amber-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shrink-0"
        >
          {isSubmitting ? "[ ĐANG NỘP... ]" : "[ GỬI ĐÁP ÁN ]"}
        </button>
      </form>

      {/* Local validation error */}
      {localError && (
        <span className="font-mono text-xs text-rose-text bg-rose-bg/60 border border-rose-border px-3 py-1.5 rounded-lg">
          [ CẢNH BÁO: {localError} ]
        </span>
      )}

      {/* Submitted status banner */}
      {viewerAnswered && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3 font-mono text-xs ${
            viewerResult === "correct"
              ? "border-emerald-border bg-emerald-bg text-emerald-text"
              : viewerResult === "incorrect"
              ? "border-rose-border bg-rose-bg text-rose-text"
              : "border-badge-amber-border bg-badge-amber-bg text-badge-amber-text"
          }`}
        >
          <span>
            {viewerResult === "correct"
              ? "[ BẠN ĐÃ ĐOÁN CHÍNH XÁC! ]"
              : viewerResult === "incorrect"
              ? "[ ĐÁP ÁN CHƯA ĐÚNG. HÃY CHỜ VÒNG TIẾP THEO! ]"
              : "[ BẠN ĐÃ NỘP BÀI. ĐANG CHỜ TỔNG KẾT VÒNG... ]"}
          </span>
          <span className="text-[11px] opacity-80">
            {viewerResult === "correct" ? "ĐƯỢC CỘNG ĐIỂM" : "KHOÁ INPUT"}
          </span>
        </div>
      )}
    </div>
  );
}
