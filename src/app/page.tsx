"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { selectIsConnected } from "@/store/selectors";
import { socket } from "@/lib/socket";
import {
  HubHeader,
  HubHero,
  RoomList,
  CreateRoomForm,
  JoinForm,
} from "@/components/hub";

// ---------------------------------------------------------------------------
// Hub Page — Main Entrypoint of Food Guess (SRP Layout Controller)
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
      {/* Top Navigation (SRP) */}
      <HubHeader isConnected={isConnected} />

      {/* Main Hub Body */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Hero Section (SRP) */}
        <HubHero />

        {/* 2-Column Responsive Layout: Actions Form (Left) & Room List (Right) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Create Room / Join Room Tabs & Forms */}
          <section className="space-y-4 lg:col-span-5">
            {/* Tab switchers */}
            <div className="flex rounded-xl border border-border-subtle bg-surface-card p-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("join")}
                className={`flex-1 rounded-lg py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
                className={`flex-1 rounded-lg py-2 font-mono text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
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
        FOOD GUESS // NỀN TẢNG ĐỐ VUI ẨM THỰC THỜI GIAN THỰC
      </footer>
    </div>
  );
}
