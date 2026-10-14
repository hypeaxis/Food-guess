import type { FoodGuessConfig } from "@/types";
import { RoomShareSection } from "./RoomShareSection";

// ---------------------------------------------------------------------------
// RoomConfigCard — Hiển thị mã phòng, nút copy link và cấu hình thi đấu
// Rule: Text-only UI (no icons/emojis), Dark Mode design tokens
// ---------------------------------------------------------------------------

type RoomConfigCardProps = {
  code: string;
  config?: FoodGuessConfig | null;
};

export default function RoomConfigCard({ code, config }: RoomConfigCardProps) {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-xl backdrop-blur-sm sm:p-7">
      {/* Room Code Badge & Share Actions (SRP & DIP) */}
      <RoomShareSection code={code} />

      <div className="h-px w-full bg-border-subtle" />

      {/* Room Configuration Overview */}
      <div className="flex flex-col gap-3">
        <span className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface">
          THÔNG SỐ VÁN ĐẤU
        </span>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
          {/* Total Rounds */}
          <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-sub p-3.5">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase">
              SỐ VÒNG CHƠI
            </span>
            <span className="mt-1 font-mono text-lg font-bold text-primary-container">
              {config ? `${config.totalRounds} VÒNG` : "—"}
            </span>
          </div>

          {/* Answer Time */}
          <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-sub p-3.5">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase">
              THỜI GIAN ĐOÁN
            </span>
            <span className="mt-1 font-mono text-lg font-bold text-primary-container">
              {config ? `${config.answerTimeSeconds}S / CÂU` : "—"}
            </span>
          </div>

          {/* Auto Next Round */}
          <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-sub p-3.5">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase">
              TỰ ĐỘNG QUA VÒNG
            </span>
            <div className="mt-1">
              <span
                className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-bold ${
                  config?.autoNextRound
                    ? "border border-emerald-border bg-emerald-bg text-emerald-text"
                    : "border border-border-interactive bg-surface-card text-on-surface-variant"
                }`}
              >
                {config?.autoNextRound ? "[ BẬT: 5 GIÂY ]" : "[ TẮT ]"}
              </span>
            </div>
          </div>

          {/* Combo Streak */}
          <div className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface-sub p-3.5">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase">
              ĐIỂM CHUỖI COMBO
            </span>
            <div className="mt-1">
              <span
                className={`inline-block rounded px-2 py-0.5 font-mono text-xs font-bold ${
                  config?.comboStreakEnabled
                    ? "border border-emerald-border bg-emerald-bg text-emerald-text"
                    : "border border-border-interactive bg-surface-card text-on-surface-variant"
                }`}
              >
                {config?.comboStreakEnabled ? "[ ĐƯỢC BẬT ]" : "[ TẮT ]"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
