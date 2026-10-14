"use client";

export interface RoundsConfigFieldProps {
  value: number;
  onChange: (rounds: number) => void;
  disabled?: boolean;
}

const PRESET_ROUNDS = [5, 10, 15, 20];

/**
 * RoundsConfigField — Thành phần cấu hình số vòng đấu (SRP & LSP)
 * Tuân thủ Text-only UI, cung cấp phím chọn nhanh và thanh trượt trực quan
 */
export function RoundsConfigField({
  value,
  onChange,
  disabled = false,
}: RoundsConfigFieldProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5">
      <div className="flex items-center justify-between font-mono text-xs">
        <label
          htmlFor="total-rounds"
          className="font-semibold uppercase text-on-surface-variant"
        >
          SỐ LƯỢNG VÒNG ĐẤU
        </label>
        <span className="rounded bg-surface-card border border-border-subtle px-2 py-0.5 font-bold text-primary">
          {value} VÒNG
        </span>
      </div>

      {/* Preset quick buttons */}
      <div className="flex flex-wrap gap-1.5 font-mono text-xs">
        {PRESET_ROUNDS.map((rounds) => (
          <button
            key={rounds}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rounds)}
            className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              value === rounds
                ? "bg-primary-container text-on-primary-container font-bold"
                : "border border-border-subtle bg-surface-card text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {rounds} vòng {rounds === 10 ? "(Chuẩn)" : ""}
          </button>
        ))}
      </div>

      <input
        id="total-rounds"
        type="range"
        min={5}
        max={50}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary-container disabled:opacity-50"
      />

      <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
        <span>Tối thiểu: 5 vòng</span>
        <span>Tối đa: 50 vòng</span>
      </div>
    </div>
  );
}
