"use client";

import { useState, useMemo } from "react";
import type { ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// ChatMessageItem Component
// Phase 6 (Đầu việc 2): Thành phần hiển thị tin nhắn đơn lẻ trong ChatBox
// Rule: Text-only UI (no icons or emojis), modern Tailwind Dark Mode styling
// ---------------------------------------------------------------------------

export interface ChatMessageItemProps {
  message: ChatMessage;
  isSelf?: boolean;
  className?: string;
}

export default function ChatMessageItem({
  message,
  isSelf = false,
  className = "",
}: ChatMessageItemProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedTime = useMemo(() => {
    try {
      return new Date(message.sentAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [message.sentAt]);

  return (
    <article
      aria-label={`Tin nhắn từ ${message.participantName}`}
      className={`rounded-xl border p-3 font-mono transition-all ${
        isSelf
          ? "border-primary-container/40 bg-surface-card/90 border-l-4 border-l-primary-container"
          : "border-border-subtle bg-surface-sub/60 border-l-4 border-l-border-interactive"
      } ${className}`}
    >
      {/* Header: Sender Name, Self Badge & Timestamp */}
      <header className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <span
            className={`font-bold truncate ${
              isSelf ? "text-primary-container" : "text-on-surface"
            }`}
          >
            {message.participantName}
          </span>
          {isSelf && (
            <span className="shrink-0 rounded border border-primary-container/40 bg-primary-container/10 px-1 py-0.5 text-[10px] font-semibold text-primary-container">
              [ BẠN ]
            </span>
          )}
        </div>

        {formattedTime && (
          <time
            dateTime={new Date(message.sentAt).toISOString()}
            className="shrink-0 text-[10px] text-on-surface-variant/80"
          >
            {formattedTime}
          </time>
        )}
      </header>

      {/* Message Content: Text */}
      {message.text && (
        <p className="mt-1.5 text-xs text-on-surface leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>
      )}

      {/* Message Content: GIF Image */}
      {message.gifUrl && (
        <div className="mt-2">
          {!imageError ? (
            <div className="relative inline-block overflow-hidden rounded-lg border border-border-subtle bg-canvas-base max-w-[240px]">
              {/* Skeleton loading indicator */}
              {!imageLoaded && (
                <div className="flex h-32 w-48 items-center justify-center bg-surface-sub animate-pulse text-[10px] text-on-surface-variant">
                  [ ĐANG TẢI ẢNH GIF... ]
                </div>
              )}
              {/* Native img tag matching FoodImage pattern */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={message.gifUrl}
                alt={`Ảnh GIF từ ${message.participantName}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                className={`max-h-40 w-auto rounded-lg object-contain transition-opacity duration-200 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                loading="lazy"
              />
              <span className="absolute bottom-1 right-1 rounded bg-canvas-base/80 px-1 py-0.5 text-[9px] font-bold text-on-surface-variant">
                [ GIF ]
              </span>
            </div>
          ) : (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-[11px] text-rose-300">
              <span className="font-semibold">[ LỖI TẢI ẢNH GIF ]</span>
              <p className="mt-0.5 text-[10px] text-on-surface-variant truncate">
                {message.gifUrl}
              </p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
