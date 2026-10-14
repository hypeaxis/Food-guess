"use client";

import { FoodImage } from "@/components/shared";

// ---------------------------------------------------------------------------
// AnswerDisplay — Hiển thị tên món ăn chính thức và ảnh món ăn chuẩn
// Phase 5: Round Reveal Phase
// Rule: Text-only UI (no icons/emojis), dark theme tokens
// ---------------------------------------------------------------------------

type AnswerDisplayProps = {
  foodName: string;
  resourceUrl: string;
  roundNumber: number;
};

export function AnswerDisplay({
  foodName,
  resourceUrl,
  roundNumber,
}: AnswerDisplayProps) {
  return (
    <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-xl space-y-4">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-3">
        <span className="font-mono text-xs font-bold text-primary-container">
          [ ĐÁP ÁN CHÍNH XÁC // VÒNG {roundNumber} ]
        </span>
        <span className="rounded border border-purple-border bg-purple-bg px-2 py-0.5 font-mono text-[10px] font-bold text-purple-text">
          [ CÔNG BỐ ĐÁP ÁN ]
        </span>
      </div>

      {/* Official Food Name */}
      <div className="text-center py-1">
        <h2 className="font-mono text-2xl sm:text-3xl font-black uppercase tracking-wider text-primary-container">
          {foodName || "[ CHƯA XÁC ĐỊNH ]"}
        </h2>
        <p className="mt-1 font-mono text-xs text-on-surface-variant">
          Đáp án chính thức được xác nhận bởi hệ thống máy chủ
        </p>
      </div>

      {/* Food Image Container */}
      <div className="relative w-full aspect-square max-h-[360px] mx-auto rounded-xl overflow-hidden border border-border-interactive bg-surface-sub shadow-inner">
        <FoodImage
          src={resourceUrl}
          alt={foodName || "Ảnh món ăn"}
        />
      </div>
    </section>
  );
}
