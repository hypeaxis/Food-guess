"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { clearChat } from "@/store/slices/chatSlice";
import { ChatBox } from "@/components/chat";

export interface ChatSimulatorBenchProps {
  onInjectMockMessages: () => void;
  onSimulateIncomingText: () => void;
  onSimulateIncomingGif: () => void;
  onSimulateRateLimitToast: () => void;
  onSimulateInvalidGifToast: () => void;
}

/**
 * ChatSimulatorBench — Khu vực giả lập tin nhắn chat thời gian thực (SRP)
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function ChatSimulatorBench({
  onInjectMockMessages,
  onSimulateIncomingText,
  onSimulateIncomingGif,
  onSimulateRateLimitToast,
  onSimulateInvalidGifToast,
}: ChatSimulatorBenchProps) {
  const dispatch = useAppDispatch();
  const [showEmbeddedChat, setShowEmbeddedChat] = useState(false);

  return (
    <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">
          Kiểm Thử Chatbox Thời Gian Thực
        </span>
        <span className="text-[10px] text-amber-400 font-mono font-bold">
          Hộp Trò Chuyện
        </span>
      </div>
      <p className="text-[11px] text-neutral-400">
        Thử nghiệm gửi/nhận tin nhắn, kiểm tra Rate-limit và Whitelist GIF
      </p>

      {/* Simulation Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
        <button
          type="button"
          onClick={onInjectMockMessages}
          className="rounded border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-300 hover:border-amber-500/50 hover:text-white cursor-pointer"
        >
          Nạp 4 tin mẫu
        </button>
        <button
          type="button"
          onClick={onSimulateIncomingText}
          className="rounded border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-300 hover:border-amber-500/50 hover:text-white cursor-pointer"
        >
          Giả lập tin nhắn
        </button>
        <button
          type="button"
          onClick={onSimulateIncomingGif}
          className="rounded border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-300 hover:border-amber-500/50 hover:text-white cursor-pointer"
        >
          Giả lập ảnh GIF
        </button>
        <button
          type="button"
          onClick={onSimulateRateLimitToast}
          className="rounded border border-amber-500/30 bg-amber-500/10 p-1.5 text-amber-300 hover:bg-amber-500/20 cursor-pointer"
        >
          Test Rate-limit
        </button>
        <button
          type="button"
          onClick={onSimulateInvalidGifToast}
          className="rounded border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20 cursor-pointer"
        >
          Test Link GIF sai
        </button>
        <button
          type="button"
          onClick={() => dispatch(clearChat())}
          className="rounded border border-neutral-700 bg-neutral-900 p-1.5 text-neutral-400 hover:border-rose-500/50 hover:text-rose-400 cursor-pointer"
        >
          Xóa sạch chat
        </button>
      </div>

      {/* Embedded Chat Preview Box Toggle */}
      <button
        type="button"
        onClick={() => setShowEmbeddedChat(!showEmbeddedChat)}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 font-mono text-[11px] font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white cursor-pointer"
      >
        {showEmbeddedChat
          ? "[-] Ẩn khung Chat nhúng"
          : "[+] Xem khung Chat nhúng trực tiếp"}
      </button>

      {showEmbeddedChat && (
        <div className="pt-2">
          <ChatBox className="h-[400px] w-full" />
        </div>
      )}
    </div>
  );
}
