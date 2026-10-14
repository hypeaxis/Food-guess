"use client";

export interface RoomTogglesFieldProps {
  autoNextRound: boolean;
  onToggleAutoNextRound: () => void;
  comboStreakEnabled: boolean;
  onToggleComboStreak: () => void;
  disabled?: boolean;
}

/**
 * RoomTogglesField — Thành phần cài đặt nâng cao switch Text-only (SRP)
 * Tuân thủ Text-only UI: [ BẬT ] / [ TẮT ]
 */
export function RoomTogglesField({
  autoNextRound,
  onToggleAutoNextRound,
  comboStreakEnabled,
  onToggleComboStreak,
  disabled = false,
}: RoomTogglesFieldProps) {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
        CÀI ĐẶT NÂNG CAO
      </span>

      {/* Toggle 1: Auto Next Round */}
      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sub p-3">
        <div className="pr-4">
          <span className="block text-sm font-medium text-on-surface">
            Tự động qua vòng mới
          </span>
          <span className="block text-xs text-on-surface-variant">
            Tự chuyển sang câu hỏi tiếp theo sau 5 giây tổng kết
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleAutoNextRound}
          disabled={disabled}
          className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
            autoNextRound
              ? "border-emerald-border bg-emerald-bg text-emerald-text"
              : "border-border-subtle bg-surface-card text-on-surface-variant"
          }`}
        >
          {autoNextRound ? "[ BẬT ]" : "[ TẮT ]"}
        </button>
      </div>

      {/* Toggle 2: Combo Streak */}
      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sub p-3">
        <div className="pr-4">
          <span className="block text-sm font-medium text-on-surface">
            Điểm thưởng chuỗi đúng (Combo)
          </span>
          <span className="block text-xs text-on-surface-variant">
            Cộng thêm điểm thưởng khi đoán đúng nhiều câu liên tiếp
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleComboStreak}
          disabled={disabled}
          className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
            comboStreakEnabled
              ? "border-emerald-border bg-emerald-bg text-emerald-text"
              : "border-border-subtle bg-surface-card text-on-surface-variant"
          }`}
        >
          {comboStreakEnabled ? "[ BẬT ]" : "[ TẮT ]"}
        </button>
      </div>
    </div>
  );
}
