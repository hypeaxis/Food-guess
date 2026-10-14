"use client";

import Link from "next/link";

export interface HubHeaderProps {
  isConnected: boolean;
}

/**
 * HubHeader — Top Navigation Bar cho trang chủ Hub (SRP)
 * Chịu trách nhiệm hiển thị logo Food Guess, Telemetry badge kết nối và Navigation links
 * Tuân thủ Text-only UI, Dark Mode semantic design tokens
 */
export function HubHeader({ isConnected }: HubHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-canvas-base/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand & Connection Status */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/"
            className="font-mono text-lg font-black tracking-wider text-primary-container sm:text-xl"
          >
            FOOD GUESS
          </Link>

          {/* Connection Telemetry Badge */}
          <div
            className={`hidden sm:inline-flex items-center rounded-full border px-3 py-1 font-mono text-xs ${
              isConnected
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                : "border-badge-amber-border bg-badge-amber-bg text-badge-amber-text"
            }`}
          >
            {isConnected
              ? "[ KẾT NỐI: MÁY CHỦ SẴN SÀNG ]"
              : "[ KẾT NỐI: ĐANG KẾT NỐI... ]"}
          </div>
        </div>

        {/* Nav Links & Controls */}
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="hidden items-center gap-4 font-mono text-xs md:flex">
            <span className="font-semibold text-primary-container">
              [ SẢNH CHỜ ]
            </span>
            <Link
              href="/dev/preview"
              className="text-on-surface-variant transition-colors hover:text-on-surface"
            >
              [ DEV PREVIEW ]
            </Link>
          </nav>

          <Link
            href="/dev/preview"
            className="rounded-lg border border-border-subtle bg-surface-sub px-3 py-1.5 font-mono text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container md:hidden"
          >
            [ DEV ]
          </Link>

          <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-1 font-mono text-xs font-bold text-primary-container">
            FG
          </span>
        </div>
      </div>
    </header>
  );
}
