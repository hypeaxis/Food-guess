"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectChatMessages,
  selectSessionParticipant,
  selectSessionStatus,
  selectIsConnected,
} from "@/store/selectors";
import ChatMessageItem from "./ChatMessageItem";
import ChatInput from "./ChatInput";

// ---------------------------------------------------------------------------
// ChatBox Component
// Phase 6 (Đầu việc 2): Khung trò chuyện hoàn chỉnh gồm header, danh sách và ô nhập
// Rule: Text-only UI (no icons or emojis), modern Tailwind Dark Mode styling
// ---------------------------------------------------------------------------

export interface ChatBoxProps {
  className?: string;
  onClose?: () => void;
  isDrawer?: boolean;
}

export default function ChatBox({
  className = "",
  onClose,
  isDrawer = false,
}: ChatBoxProps) {
  const messages = useAppSelector(selectChatMessages);
  const currentParticipant = useAppSelector(selectSessionParticipant);
  const sessionStatus = useAppSelector(selectSessionStatus);
  const isConnected = useAppSelector(selectIsConnected);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever a new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const isJoined = sessionStatus === "joined";
  const canChat = isConnected && isJoined;

  return (
    <div
      className={`flex flex-col overflow-hidden border border-border-subtle bg-surface-card/95 shadow-2xl backdrop-blur-md ${
        isDrawer ? "rounded-xl sm:rounded-2xl" : "rounded-2xl"
      } ${className}`}
      aria-label="Cửa sổ trò chuyện"
    >
      {/* 1. Header */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border-subtle bg-surface-sub/80 px-4 font-mono">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-wider text-primary-container">
            [ TRÒ CHUYỆN TRONG PHÒNG ]
          </span>
          <span className="rounded border border-border-subtle bg-canvas-base px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant">
            {messages.length}
          </span>
        </div>

        {/* Close Button if rendered inside Drawer or Modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-border-subtle bg-surface-card px-2 py-1 text-xs font-bold text-on-surface-variant transition-colors hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-300"
            aria-label="Đóng khung trò chuyện"
          >
            [ ĐÓNG ]
          </button>
        )}
      </header>

      {/* 2. Messages Scroll Area */}
      <div
        className="flex-1 overflow-y-auto p-3 space-y-2.5 font-mono selection:bg-primary-container/30 selection:text-primary-container min-h-[220px]"
        tabIndex={0}
        aria-label="Danh sách tin nhắn"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs">
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-1 text-[11px] font-bold text-on-surface-variant">
              [ CHƯA CÓ TIN NHẮN NÀO ]
            </span>
            <p className="mt-2 max-w-[240px] text-[11px] text-on-surface-variant/70 leading-relaxed">
              Hãy là người đầu tiên bắt đầu cuộc trò chuyện với mọi người trong phòng!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              isSelf={currentParticipant?.participantId === msg.participantId}
            />
          ))
        )}
        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* 3. Footer: Chat Input or Status Notice */}
      {canChat ? (
        <ChatInput disabled={!canChat} />
      ) : (
        <div className="border-t border-border-subtle bg-surface-sub/90 p-3 text-center font-mono text-xs text-on-surface-variant">
          {!isConnected
            ? "[ ĐANG MẤT KẾT NỐI VỚI MÁY CHỦ ]"
            : "[ BẠN CẦN THAM GIA PHÒNG ĐỂ TRÒ CHUYỆN ]"}
        </div>
      )}
    </div>
  );
}
