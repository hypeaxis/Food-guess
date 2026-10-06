"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppDispatch } from "@/store/hooks";
import { connectSocketAction } from "@/store/socketMiddleware";
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
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-lg font-black tracking-wider text-amber-500 sm:text-xl">
              FOOD GUESS
            </span>
            <span className="hidden text-xs font-semibold uppercase tracking-widest text-neutral-400 sm:inline-block">
              Trò chơi đoán món ăn trực tuyến
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dev/preview"
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs font-semibold text-neutral-300 transition-colors hover:border-neutral-700 hover:bg-neutral-850 hover:text-white"
            >
              [ Dev Preview ]
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero Section */}
        <section className="mb-10 text-center sm:text-left">
          <div className="inline-block rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
            Giai đoạn 2: Hub phòng chơi
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Sảnh chờ & Danh sách phòng
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400 sm:text-base">
            Tham gia phòng có sẵn hoặc tự tạo phòng thi đấu riêng. Đoán tên các món ăn đặc sắc qua hình ảnh thời gian thực cùng bạn bè.
          </p>
        </section>

        {/* 2-Column Responsive Layout: Actions Form (Left) & Room List (Right) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Create Room / Join Room Tabs & Forms */}
          <section className="space-y-4 lg:col-span-5">
            {/* Tab switchers */}
            <div className="flex rounded-xl border border-neutral-800 bg-neutral-900/90 p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("join")}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "join"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Vào bằng mã
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("create")}
                className={`flex-1 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                  activeTab === "create"
                    ? "bg-amber-500 text-neutral-950"
                    : "text-neutral-400 hover:text-neutral-200"
                }`}
              >
                Tạo phòng mới
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
            <div className="border-b border-neutral-800 pb-3">
              <h2 className="text-lg font-bold tracking-tight text-neutral-100">
                Phòng đang mở (Tự động cập nhật 5s)
              </h2>
              <p className="text-xs text-neutral-400">
                Nhấp vào phòng bất kỳ để tự động điền mã và tham gia
              </p>
            </div>

            <RoomList onJoinRoom={handleSelectRoomToJoin} />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 text-center font-mono text-xs text-neutral-500">
        Food Guess Frontend — Next.js 16 • Redux Toolkit • Socket.IO • Tailwind CSS
      </footer>
    </div>
  );
}
