"use client";

/**
 * HubHero — Hero Banner chào mừng tại trang chủ Hub (SRP)
 * Chịu trách nhiệm hiển thị tiêu đề, mô tả nền tảng và badge trạng thái WebSocket
 * Tuân thủ Text-only UI, loại bỏ hoàn toàn các mốc giai đoạn cũ
 */
export function HubHero() {
  return (
    <section className="mb-8 border-b border-border-subtle pb-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="rounded border border-border-subtle bg-surface-card px-2.5 py-0.5 font-mono text-xs font-semibold text-primary-container">
          [ SẢNH TRÒ CHƠI ]
        </span>
        <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
          [ WEBSOCKET: 120 FPS // STABLE ]
        </span>
      </div>
      <h1 className="text-2xl font-black uppercase tracking-tight text-on-surface sm:text-3xl lg:text-4xl">
        HỆ THỐNG PHÒNG THI ĐẤU TRỰC TUYẾN
      </h1>
      <p className="mt-2 max-w-3xl font-mono text-xs leading-relaxed text-on-surface-variant sm:text-sm">
        Hạ tầng đồng bộ thời gian thực qua WebSocket. Tạo phòng thi đấu, cấu hình thể thức hoặc tham gia sảnh chờ cùng người chơi khác.
      </p>
    </section>
  );
}
