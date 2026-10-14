"use client";

import FoodImage from "@/components/shared/FoodImage";

// ---------------------------------------------------------------------------
// FoodDisplay — Khung trình chiếu ảnh món ăn cần đoán của vòng chơi
// Rule: Text-only UI, Dark Mode design tokens, tỉ lệ cố định aspect-square
// ---------------------------------------------------------------------------

type FoodDisplayProps = {
  mediaUrl?: string | null;
  roundNumber: number;
  className?: string;
};

export default function FoodDisplay({
  mediaUrl,
  roundNumber,
  className = "",
}: FoodDisplayProps) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-xl backdrop-blur-sm sm:p-6 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          ẢNH MÓN ĂN BÍ ẨN
        </span>
        <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2 py-0.5 font-mono text-[11px] font-bold text-badge-amber-text">
          [ CÂU HỎI #{roundNumber} ]
        </span>
      </div>

      {/* Central Food Image with fixed aspect-square */}
      <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border-interactive/60 bg-surface-sub shadow-2xl">
        <FoodImage
          src={mediaUrl}
          alt={`Món ăn bí ẩn vòng ${roundNumber}`}
          className="w-full aspect-square object-cover"
        />
      </div>

      <div className="text-center font-mono text-[11px] text-on-surface-variant">
        Hãy quan sát kỹ hình ảnh và gõ tên món ăn hoặc chọn từ 3 gợi ý bên dưới
      </div>
    </div>
  );
}
