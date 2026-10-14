"use client";

// ---------------------------------------------------------------------------
// SuggestionChips — 3 chip gợi ý món ăn, bấm vào sẽ nộp luôn đáp án
// Rule: Text-only UI, Dark Mode design tokens, disabled khi đã nộp hoặc hết giờ
// ---------------------------------------------------------------------------

type SuggestionChipsProps = {
  suggestions: string[];
  disabled?: boolean;
  onSelectChip: (answer: string) => void;
};

export default function SuggestionChips({
  suggestions,
  disabled = false,
  onSelectChip,
}: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          GỢI Ý NHANH TỪ HỆ THỐNG
        </span>
        <span className="font-mono text-[11px] text-primary-container">
          [ BẤM ĐỂ NỘP NGAY ]
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            type="button"
            disabled={disabled}
            onClick={() => onSelectChip(suggestion)}
            className="flex items-center justify-center rounded-xl border border-border-interactive bg-surface-sub px-4 py-3 font-mono text-xs font-bold text-on-surface transition-all hover:border-primary-container hover:bg-surface-card hover:text-primary-container active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer text-center"
          >
            [ {suggestion} ]
          </button>
        ))}
      </div>
    </div>
  );
}
