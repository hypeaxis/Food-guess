"use client";

export interface RoomLoadingCardProps {
  code: string;
  title: string;
  description: string;
}

/**
 * RoomLoadingCard — Card hiển thị trạng thái chờ tải của phòng đấu (SRP & OCP)
 * Tái sử dụng cho cả trạng thái 'resuming' (khôi phục phiên) và 'joining' (đang vào phòng)
 * Tuân thủ Text-only UI, Dark Mode card styling
 */
export function RoomLoadingCard({
  code,
  title,
  description,
}: RoomLoadingCardProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-base p-4 text-center text-on-surface">
      <div className="max-w-md space-y-3 rounded-2xl border border-border-subtle bg-surface-card p-8 shadow-2xl backdrop-blur-md">
        <span className="inline-block rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
          PHÒNG: {code}
        </span>
        <h1 className="font-mono text-lg font-bold uppercase tracking-tight text-on-surface">
          {title}
        </h1>
        <p className="font-mono text-xs text-on-surface-variant leading-relaxed">
          {description}
        </p>
      </div>
    </main>
  );
}
