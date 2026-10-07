"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectToasts } from "@/store/selectors";
import { removeToast } from "@/store/slices/uiSlice";

// ---------------------------------------------------------------------------
// ToastContainer — Displays floating toast alerts from Redux uiSlice
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export default function ToastContainer() {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectToasts);

  useEffect(() => {
    if (toasts.length === 0) return;

    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 4000)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, dispatch]);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex max-w-sm flex-col gap-2.5 sm:bottom-6 sm:right-6"
    >
      {toasts.map((toast) => {
        const isError = toast.type === "error";
        const isSuccess = toast.type === "success";

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all ${
              isError
                ? "border-rose-500/40 bg-surface-card text-rose-300"
                : isSuccess
                ? "border-emerald-500/40 bg-surface-card text-emerald-300"
                : "border-border-subtle bg-surface-card text-on-surface"
            }`}
          >
            <div className="space-y-1">
              <span className="block font-mono text-[11px] font-bold uppercase tracking-wider opacity-90">
                {isError
                  ? "[ LỖI HỆ THỐNG ]"
                  : isSuccess
                  ? "[ THÀNH CÔNG ]"
                  : "[ THÔNG BÁO ]"}
              </span>
              <p className="font-mono text-xs leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(removeToast(toast.id))}
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs text-on-surface-variant hover:bg-surface-sub hover:text-on-surface"
            >
              [X]
            </button>
          </div>
        );
      })}
    </div>
  );
}
