"use client";

import { useState } from "react";
import type { FoodGuessConfig } from "@/types";

// ---------------------------------------------------------------------------
// RoomConfigCard — Hiển thị mã phòng, nút copy link và cấu hình thi đấu
// Rule: Text-only UI (no icons/emojis), Dark Mode design tokens
// ---------------------------------------------------------------------------

type RoomConfigCardProps = {
  code: string;
  config?: FoodGuessConfig | null;
};

export default function RoomConfigCard({ code, config }: RoomConfigCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const inviteUrl = `${window.location.origin}/room/${code}`;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        // Fallback for non-secure or older contexts
        const textArea = document.createElement("textarea");
        textArea.value = inviteUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-xl backdrop-blur-sm sm:p-7">
      {/* Room Code Badge & Big Title */}
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
            className={`rounded-lg border px-3.5 py-2 font-mono text-xs font-bold transition-all ${
              copied
                ? "border-emerald-border bg-emerald-bg text-emerald-text"
                : "border-border-interactive bg-surface-sub text-on-surface hover:border-primary-container hover:text-primary-container"
            }`}
          >
            {copied ? "[ ĐÃ SAO CHÉP LIÊN KẾT ]" : "[ SAO CHÉP LIÊN KẾT MỜI ]"}
          </button>
        </div>
      </div>

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
