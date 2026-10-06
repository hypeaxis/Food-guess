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
            className={`flex items-start justify-between gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all ${
              isError
                ? "border-rose-800/80 bg-rose-950/90 text-rose-200"
                : isSuccess
                ? "border-emerald-800/80 bg-emerald-950/90 text-emerald-200"
                : "border-neutral-700 bg-neutral-900/95 text-neutral-200"
            }`}
          >
            <div className="space-y-1">
              <span className="block font-mono text-[11px] font-bold uppercase tracking-wider opacity-80">
                {isError
                  ? "[ Lỗi ]"
                  : isSuccess
                  ? "[ Thành công ]"
                  : "[ Thông báo ]"}
              </span>
              <p className="text-xs font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => dispatch(removeToast(toast.id))}
              className="shrink-0 rounded px-1.5 py-0.5 font-mono text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              [X]
            </button>
          </div>
        );
      })}
    </div>
  );
}
