"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { selectIsConnected } from "@/store/selectors";
import { socket } from "@/lib/socket";
import { RoomList, CreateRoomForm, JoinForm } from "@/components/hub";

// ---------------------------------------------------------------------------
// Hub Page — Main entrypoint of Food Guess
// Phase 2: Hub, Room List (5s polling), Create Room & Join Room
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

type HubTab = "create" | "join";

export default function Home() {
  const dispatch = useAppDispatch();
  const isConnected = useAppSelector(selectIsConnected);
  const [activeTab, setActiveTab] = useState<HubTab>("join");
  const [joinInitialCode, setJoinInitialCode] = useState<string>("");

  // Connect socket on mount if not already connected
  useEffect(() => {
    if (!socket.connected) {
      dispatch(connectSocketAction());
    }
  }, [dispatch]);

  // Handler when clicking "Vào phòng" from any RoomCard
  const handleSelectRoomToJoin = (code: string) => {
    setJoinInitialCode(code);
    setActiveTab("join");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-canvas-base text-on-surface font-sans selection:bg-primary-container/30 selection:text-primary-container">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border-subtle bg-canvas-base/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Brand & Connection Status */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/" className="font-mono text-lg font-black tracking-wider text-primary-container sm:text-xl">
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

      {/* Main Hub Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Hero Section */}
        <section className="mb-8 border-b border-border-subtle pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="rounded border border-border-subtle bg-surface-card px-2.5 py-0.5 font-mono text-xs font-semibold text-primary-container">
              [ GIAI ĐOẠN 2: HUB SẢNH CHỜ ]
            </span>
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
              [ WEBSOCKET: 120 FPS // STABLE ]
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-on-surface sm:text-3xl lg:text-4xl">
            HỆ THỐNG PHÒNG THI ĐẤU TRỰC TUYẾN
          </h1>
          <p className="mt-2 max-w-3xl font-mono text-xs leading-relaxed text-on-surface-variant sm:text-sm">
            Hạ tầng đồng bộ thời gian thực qua WebSocket. Tạo phòng thi đấu, cấu hình thể thức hoặc tham gia sảnh chờ cùng người chơi khác.
          </p>
        </section>

        {/* 2-Column Responsive Layout: Actions Form (Left) & Room List (Right) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Create Room / Join Room Tabs & Forms */}
          <section className="space-y-4 lg:col-span-5">
            {/* Tab switchers */}
            <div className="flex rounded-xl border border-border-subtle bg-surface-card p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("join")}
                className={`flex-1 rounded-lg py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "join"
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                [ VÀO BẰNG MÃ ]
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`flex-1 rounded-lg py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "create"
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                [ TẠO PHÒNG MỚI ]
              </button>
            </div>

            {/* Active Form */}
            {activeTab === "join" ? (
              <JoinForm
                key={joinInitialCode}
                initialCode={joinInitialCode}
              />
            ) : (
              <CreateRoomForm />
            )}
          </section>

          {/* Right Column: Realtime Room List */}
          <section className="space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div>
                <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-on-surface">
                  DANH SÁCH PHÒNG ĐANG MỞ
                </h2>
                <p className="font-mono text-xs text-on-surface-variant">
                  Tự động cập nhật HTTP 5s • Bấm &quot;Vào phòng&quot; để chọn mã nhanh
                </p>
              </div>
            </div>

            <RoomList onJoinRoom={handleSelectRoomToJoin} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-6 text-center font-mono text-xs text-on-surface-variant">
        FOOD GUESS KERNEL v2.4 // NEXT.JS 16 • REDUX TOOLKIT • WEBSOCKET • TAILWIND CSS
      </footer>
    </div>
  );
}
