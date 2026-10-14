"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  sendChatMessage,
  isValidGifUrl,
  checkClientRateLimit,
  getRemainingRateLimitTimeMs,
} from "@/store/thunks";
import { GifInputPanel } from "./GifInputPanel";

// ---------------------------------------------------------------------------
// ChatInput Component
// Phase 6 (Đầu việc 2): Khung nhập liệu tin nhắn (Text / GIF URL) và chống spam
// Rule: Text-only UI (no icons or emojis), modern Tailwind Dark Mode styling
// ---------------------------------------------------------------------------

export interface ChatInputProps {
  className?: string;
  disabled?: boolean;
}

type InputMode = "text" | "gif";

export default function ChatInput({
  className = "",
  disabled = false,
}: ChatInputProps) {
  const dispatch = useAppDispatch();

  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [gifUrl, setGifUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const textInputRef = useRef<HTMLInputElement>(null);
  const gifInputRef = useRef<HTMLInputElement>(null);

  // Monitor and tick cooldown seconds
  useEffect(() => {
    if (cooldownSeconds <= 0) return;

    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  const handleStartCooldown = (ms: number) => {
    const sec = Math.ceil(ms / 1000);
    setCooldownSeconds(Math.max(1, sec));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSubmitting || cooldownSeconds > 0) return;

    // Check rate limit before proceeding
    const remainingMs = getRemainingRateLimitTimeMs();
    if (remainingMs > 0 || !checkClientRateLimit()) {
      handleStartCooldown(remainingMs || 10000);
      return;
    }

    if (mode === "text") {
      const trimmed = text.trim();
      if (!trimmed || trimmed.length > 300) return;

      setIsSubmitting(true);
      try {
        await dispatch(sendChatMessage({ text: trimmed })).unwrap();
        setText("");
        textInputRef.current?.focus();
      } catch {
        // If rejected by server with RATE_LIMITED, start cooldown
        const waitMs = getRemainingRateLimitTimeMs();
        if (waitMs > 0) handleStartCooldown(waitMs);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const trimmedUrl = gifUrl.trim();
      if (!trimmedUrl || !isValidGifUrl(trimmedUrl)) return;

      setIsSubmitting(true);
      try {
        await dispatch(sendChatMessage({ gifUrl: trimmedUrl })).unwrap();
        setGifUrl("");
        setMode("text"); // Return to text mode after sending GIF
      } catch {
        const waitMs = getRemainingRateLimitTimeMs();
        if (waitMs > 0) handleStartCooldown(waitMs);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const isGifValid = mode === "gif" && gifUrl.trim().length > 0 && isValidGifUrl(gifUrl.trim());
  const isTextValid = mode === "text" && text.trim().length >= 1 && text.trim().length <= 300;
  const canSend = !disabled && !isSubmitting && cooldownSeconds === 0 && (mode === "text" ? isTextValid : isGifValid);

  return (
    <form
      onSubmit={handleSubmit}
      className={`border-t border-border-subtle bg-surface-card p-3 font-mono ${className}`}
      aria-label="Khung gửi tin nhắn"
    >
      {/* Mode Selector Tabs & Character / Link Counter */}
      <div className="mb-2 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode("text");
              setTimeout(() => textInputRef.current?.focus(), 50);
            }}
            className={`rounded px-2 py-0.5 font-bold transition-colors ${
              mode === "text"
                ? "border border-primary-container/40 bg-primary-container/10 text-primary-container"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ VĂN BẢN ]
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("gif");
              setTimeout(() => gifInputRef.current?.focus(), 50);
            }}
            className={`rounded px-2 py-0.5 font-bold transition-colors ${
              mode === "gif"
                ? "border border-badge-amber-border bg-badge-amber-bg text-badge-amber-text"
                : "border border-border-subtle bg-surface-sub text-on-surface-variant hover:text-on-surface"
            }`}
          >
            [ DÁN LINK GIF ]
          </button>
        </div>

        {/* Counter or Whitelist Badge */}
        {mode === "text" ? (
          <span
            className={`text-[10px] ${
              text.length > 280
                ? "font-bold text-rose-400"
                : "text-on-surface-variant/80"
            }`}
          >
            {text.length}/300
          </span>
        ) : (
          <span className="text-[9px] text-badge-amber-text">
            [ TENOR / GIPHY ]
          </span>
        )}
      </div>

      {/* Input Field & Submit Action */}
      <div className="flex items-center gap-2">
        {mode === "text" ? (
          <input
            ref={textInputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={disabled || isSubmitting || cooldownSeconds > 0}
            maxLength={300}
            placeholder={
              cooldownSeconds > 0
                ? `Vui lòng chờ ${cooldownSeconds}s (chống spam)...`
                : "Nhập tin nhắn trò chuyện (tối đa 300 ký tự)..."
            }
            className="flex-1 rounded-lg border border-border-subtle bg-surface-sub px-3 py-2 text-base sm:text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-container focus:outline-none focus:ring-1 focus:ring-primary-container disabled:opacity-50"
          />
        ) : (
          <GifInputPanel
            ref={gifInputRef}
            value={gifUrl}
            onChange={setGifUrl}
            disabled={disabled || isSubmitting || cooldownSeconds > 0}
          />
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!canSend}
          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-bold transition-all ${
            canSend
              ? "border-primary-container/40 bg-primary-container/20 text-primary-container hover:bg-primary-container/30 active:scale-95"
              : "cursor-not-allowed border-border-subtle bg-surface-sub text-on-surface-variant/40"
          }`}
        >
          {isSubmitting
            ? "[ ĐANG GỬI... ]"
            : cooldownSeconds > 0
              ? `[ CHỜ (${cooldownSeconds}s) ]`
              : "[ GỬI ]"}
        </button>
      </div>

      {/* Helper text for GIF mode */}
      {mode === "gif" && gifUrl.trim().length > 0 && !isValidGifUrl(gifUrl.trim()) && (
        <p className="mt-1.5 text-[10px] text-rose-400">
          * Chỉ chấp nhận liên kết an toàn từ Tenor (tenor.com) hoặc Giphy (giphy.com).
        </p>
      )}
    </form>
  );
}
