"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocketAction } from "@/store/socketMiddleware";
import type { ConnectionStatus } from "@/store/slices/connectionSlice";

// ---------------------------------------------------------------------------
// ConnectionBanner Component
// Plan: section 2.5 & Giai đoạn 1 (Đầu việc 6)
// Docs: section 2.1 & 8.3 (Render cold start handling & reconnect UI)
//
// Automatically displays a smart, non-intrusive notification banner at the top
// of the viewport when socket connection is not in "connected" state:
// - waking: "Đang đánh thức server (Cold start), vui lòng đợi giây lát..." (pulse)
// - reconnecting: "Mất kết nối. Đang thử kết nối lại (lần x/10)..." (spin)
// - error: "Không thể kết nối tới server" with "Thử lại" action button
// - connecting: "Đang kết nối tới máy chủ..."
// ---------------------------------------------------------------------------

export interface ConnectionBannerProps {
  className?: string;
  /**
   * Whether to display banner when connection status is "idle".
   * Defaults to false (hidden during normal page visits before socket is initiated).
   */
  showWhenIdle?: boolean;
  /**
   * Forced status override for previewing or unit testing.
   */
  forcedStatus?: ConnectionStatus;
  /**
   * Forced reconnect attempt count for previewing.
   */
  forcedAttempt?: number;
  /**
   * Forced error message for previewing.
   */
  forcedErrorMessage?: string;
  /**
   * Custom retry handler. If not provided, dispatches `connectSocketAction()`.
   */
  onRetry?: () => void;
}

export default function ConnectionBanner({
  className = "",
  showWhenIdle = false,
  forcedStatus,
  forcedAttempt,
  forcedErrorMessage,
  onRetry,
}: ConnectionBannerProps) {
  const dispatch = useAppDispatch();
  const realConnection = useAppSelector((state) => state.connection);

  const status = forcedStatus ?? realConnection.status;
  const attempt = forcedAttempt ?? realConnection.reconnectAttempt;
  const errorMessage = forcedErrorMessage ?? realConnection.errorMessage;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      dispatch(connectSocketAction());
    }
  };

  // If connected, hide banner completely
  if (status === "connected") {
    return null;
  }

  // If idle and not explicitly configured to show, hide banner
  if (status === "idle" && !showWhenIdle) {
    return null;
  }

  return (
    <aside
      role="alert"
      aria-live={status === "error" ? "assertive" : "polite"}
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-300 ${className} ${
        status === "waking"
          ? "border-badge-amber-border bg-badge-amber-bg/90 text-badge-amber-text"
          : status === "reconnecting"
            ? "border-badge-amber-border bg-badge-amber-bg/90 text-badge-amber-text"
            : status === "error"
              ? "border-rose-500/40 bg-surface-card text-rose-300"
              : status === "connecting"
                ? "border-sky-500/30 bg-surface-card text-sky-300"
                : "border-border-subtle bg-surface-card text-on-surface-variant"
      }`}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6">
        {/* Left side: Text Tag + Message */}
        <div className="flex min-w-[260px] flex-1 items-center gap-2.5 font-mono">
          {/* Status Text Tag */}
          <span className="shrink-0 rounded border border-current px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {status === "waking" && "[ ĐÁNH THỨC SERVER ]"}
            {status === "reconnecting" && "[ MẤT KẾT NỐI ]"}
            {status === "error" && "[ LỖI KẾT NỐI ]"}
            {status === "connecting" && "[ ĐANG KẾT NỐI ]"}
            {status === "idle" && "[ CHƯA KẾT NỐI ]"}
          </span>

          {/* Text Content */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="font-semibold">
              {status === "waking" &&
                "Đang đánh thức máy chủ (Cold start), vui lòng đợi giây lát..."}
              {status === "reconnecting" &&
                `Đang thử kết nối lại (lần ${attempt}/10)...`}
              {status === "error" &&
                (errorMessage || "Không thể kết nối tới server")}
              {status === "connecting" && "Đang kết nối tới máy chủ..."}
              {status === "idle" && "Chưa kết nối tới máy chủ."}
            </span>

            {/* Subtext info */}
            {status === "waking" && (
              <span className="hidden text-[11px] opacity-75 md:inline">
                (Máy chủ Render gói miễn phí cần 30–50s để khởi động lần đầu)
              </span>
            )}
            {status === "reconnecting" && (
              <span className="hidden text-[11px] opacity-75 md:inline">
                (Hệ thống tự động thử lại 10 lần với khoảng cách 1s)
              </span>
            )}
          </div>
        </div>

        {/* Right side: Action Button */}
        <div className="flex shrink-0 items-center gap-2">
          {status === "error" && (
            <button
              onClick={handleRetry}
              className="rounded-lg border border-rose-500/40 bg-rose-500/20 px-3 py-1 font-mono text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/30"
            >
              [ THỬ LẠI ]
            </button>
          )}

          {status === "idle" && (
            <button
              onClick={handleRetry}
              className="rounded-lg border border-border-subtle bg-surface-sub px-3 py-1 font-mono text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
            >
              [ KẾT NỐI ]
            </button>
          )}

          {status === "reconnecting" && (
            <button
              onClick={handleRetry}
              className="rounded-lg border border-badge-amber-border bg-primary-container px-2.5 py-1 font-mono text-xs font-bold text-on-primary-container transition-colors hover:bg-amber-400"
              title="Thử kết nối lại ngay lập tức"
            >
              [ THỬ NGAY ]
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
