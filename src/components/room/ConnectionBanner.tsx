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
      className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-all duration-300 ${className} ${
        status === "waking"
          ? "bg-amber-950/90 border-amber-500/30 text-amber-200"
          : status === "reconnecting"
            ? "bg-orange-950/90 border-orange-500/30 text-orange-200"
            : status === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
              : status === "connecting"
                ? "bg-sky-950/90 border-sky-500/30 text-sky-200"
                : "bg-neutral-900/90 border-neutral-700/40 text-neutral-300"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left side: Icon + Message */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
          {/* Status Icon */}
          {status === "waking" && (
            <div className="relative flex items-center justify-center w-6 h-6 shrink-0">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75 animate-ping" />
              <svg
                className="w-5 h-5 text-amber-400 relative z-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          )}

          {status === "reconnecting" && (
            <svg
              className="w-5 h-5 text-orange-400 animate-spin shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          )}

          {status === "error" && (
            <svg
              className="w-5 h-5 text-rose-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          )}

          {status === "connecting" && (
            <svg
              className="w-5 h-5 text-sky-400 animate-spin shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          )}

          {status === "idle" && (
            <svg
              className="w-5 h-5 text-neutral-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a4 4 0 010-5.656m-7.072 0a4 4 0 010 5.656m-3.536 3.536a9 9 0 010-12.728"
              />
            </svg>
          )}

          {/* Text Content */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold">
              {status === "waking" &&
                "Đang đánh thức máy chủ (Cold start), vui lòng đợi giây lát..."}
              {status === "reconnecting" &&
                `Mất kết nối. Đang thử kết nối lại (lần ${attempt}/10)...`}
              {status === "error" &&
                (errorMessage || "Không thể kết nối tới server")}
              {status === "connecting" && "Đang kết nối tới máy chủ..."}
              {status === "idle" && "Chưa kết nối tới máy chủ."}
            </span>

            {/* Subtext info */}
            {status === "waking" && (
              <span className="text-[11px] text-amber-300/80 hidden md:inline">
                (Máy chủ Render gói miễn phí cần 30–50s để khởi động lần đầu)
              </span>
            )}
            {status === "reconnecting" && (
              <span className="text-[11px] text-orange-300/80 hidden md:inline">
                (Hệ thống tự động thử lại 10 lần với khoảng cách 1s)
              </span>
            )}
          </div>
        </div>

        {/* Right side: Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "error" && (
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              Thử lại
            </button>
          )}

          {status === "idle" && (
            <button
              onClick={handleRetry}
              className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-white font-medium text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-400"
            >
              Kết nối
            </button>
          )}

          {status === "reconnecting" && (
            <button
              onClick={handleRetry}
              className="px-2.5 py-1 bg-orange-600/40 hover:bg-orange-600/60 border border-orange-500/40 text-orange-100 font-medium text-xs rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
              title="Thử kết nối lại ngay lập tức"
            >
              Thử ngay
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
