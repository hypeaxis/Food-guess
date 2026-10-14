"use client";

import { useState, useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectChatMessages } from "@/store/selectors";
import ChatBox from "./ChatBox";

// ---------------------------------------------------------------------------
// ChatDrawer Component
// Phase 6 (Đầu việc 2): Nút mở khung chat và ngăn kéo trượt (Mobile / Desktop)
// Rule: Text-only UI (no icons or emojis), modern Tailwind Dark Mode styling
// ---------------------------------------------------------------------------

export interface ChatDrawerProps {
  className?: string;
}

export default function ChatDrawer({ className = "" }: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messages = useAppSelector(selectChatMessages);
  const previousCountRef = useRef(messages.length);

  // Track unread messages when drawer is closed
  useEffect(() => {
    if (!isOpen) {
      const added = messages.length - previousCountRef.current;
      if (added > 0) {
        setUnreadCount((prev) => prev + added);
      }
    } else {
      // Clear unread when drawer is open
      setUnreadCount(0);
    }
    previousCountRef.current = messages.length;
  }, [messages.length, isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setUnreadCount(0);
      }
      return next;
    });
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <aside
      className={`font-mono ${className}`}
      aria-label="Tiện ích trò chuyện trực tiếp"
    >
      {/* 1. Floating Toggle Button */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <button
          type="button"
          onClick={handleToggle}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold shadow-2xl backdrop-blur-md transition-all active:scale-95 ${
            isOpen
              ? "border-primary-container bg-primary-container text-on-primary-container"
              : unreadCount > 0
                ? "border-primary-container bg-surface-card text-primary-container shadow-primary-container/20 ring-2 ring-primary-container/30"
                : "border-border-subtle bg-surface-card/90 text-on-surface hover:border-primary-container hover:text-primary-container"
          }`}
          aria-expanded={isOpen}
          aria-controls="chat-drawer-panel"
        >
          <span>{isOpen ? "[ ĐÓNG CHAT ]" : "[ TRÒ CHUYỆN ]"}</span>
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
              isOpen
                ? "bg-canvas-base/30 text-on-primary-container"
                : unreadCount > 0
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-sub text-on-surface-variant"
            }`}
          >
            {unreadCount > 0 ? `+${unreadCount}` : messages.length}
          </span>
        </button>
      </div>

      {/* 2. Drawer Panel (Open State) */}
      {isOpen && (
        <div id="chat-drawer-panel" className="relative z-50">
          {/* Mobile Backdrop Overlay */}
          <div
            onClick={handleClose}
            className="fixed inset-0 bg-canvas-base/70 backdrop-blur-sm sm:hidden"
            aria-hidden="true"
          />

          {/* Mobile Bottom-sheet / Full-height Container */}
          <div className="fixed inset-x-2 bottom-2 top-14 flex flex-col sm:hidden">
            <ChatBox
              className="h-full w-full"
              onClose={handleClose}
              isDrawer
            />
          </div>

          {/* Desktop Floating Docked Window */}
          <div className="hidden sm:flex fixed bottom-20 right-6 h-[560px] w-[380px] flex-col">
            <ChatBox
              className="h-full w-full"
              onClose={handleClose}
              isDrawer
            />
          </div>
        </div>
      )}
    </aside>
  );
}
