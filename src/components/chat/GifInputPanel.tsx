"use client";

import { forwardRef } from "react";
import { isValidGifUrl } from "@/store/thunks";

export interface GifInputPanelProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * GifInputPanel — Ô nhập liệu URL ảnh GIF kèm chỉ dẫn domain hợp lệ (SRP & OCP)
 * Kiểm tra tính hợp lệ của domain whitelist (Tenor / Giphy) theo thời gian thực
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export const GifInputPanel = forwardRef<HTMLInputElement, GifInputPanelProps>(
  function GifInputPanel(
    {
      value,
      onChange,
      disabled = false,
      placeholder = "Dán URL ảnh GIF từ tenor.com hoặc giphy.com...",
    },
    ref
  ) {
    const isInvalid = value.trim().length > 0 && !isValidGifUrl(value.trim());

    return (
      <div className="flex flex-1 flex-col gap-1">
        <input
          ref={ref}
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full rounded-lg border bg-surface-sub px-3 py-2 text-base sm:text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 disabled:opacity-50 ${
            isInvalid
              ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500"
              : "border-border-subtle focus:border-primary-container focus:ring-primary-container"
          }`}
        />
        {isInvalid && (
          <span className="font-mono text-[10px] text-rose-400">
            [ CẢNH BÁO: Chỉ chấp nhận URL từ tenor.com hoặc giphy.com ]
          </span>
        )}
      </div>
    );
  }
);
