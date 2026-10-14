"use client";

export interface TimerConfigFieldProps {
  value: number;
  onChange: (seconds: number) => void;
  disabled?: boolean;
}

const PRESET_SECONDS = [15, 20, 30, 45];

/**
 * TimerConfigField — Thành phần cấu hình thời gian trả lời mỗi câu (SRP & LSP)
 * Tuân thủ Text-only UI, cung cấp phím chọn nhanh và thanh trượt trực quan
 */
export function TimerConfigField({
  value,
  onChange,
  disabled = false,
}: TimerConfigFieldProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <label
          htmlFor="answer-time"
          className="font-semibold uppercase text-on-surface-variant"
        >
          THỜI GIAN ĐOÁN MỖI CÂU
        </label>
        <span className="rounded bg-surface-card border border-border-subtle px-2 py-0.5 font-bold text-emerald-text">
          {value}S / LƯỢT
        </span>
      </div>

      {/* Preset quick buttons */}
      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
        {PRESET_SECONDS.map((seconds) => (
          <button
            key={seconds}
            type="button"
            disabled={disabled}
            onClick={() => onChange(seconds)}
            className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              value === seconds
                ? "bg-primary-container text-on-primary-container font-bold"
                : "border border-border-subtle bg-surface-card text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {seconds}s {seconds === 30 ? "(Chuẩn)" : ""}
          </button>
        ))}
      </div>

      <input
        id="answer-time"
        type="range"
        min={10}
        max={120}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary-container disabled:opacity-50"
      />

      <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
        <span>Nhanh: 10 giây</span>
        <span>Thong thả: 120 giây</span>
      </div>
    </div>
  );
}
