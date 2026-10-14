"use client";

import { useState } from "react";
import type { RoomPhase, RoomSnapshot } from "@/types";
import {
  mockLobbySnapshot,
  mockPlayingSnapshot,
  mockRevealSnapshot,
  mockFinishedSnapshot,
  mockChatMessages,
} from "@/mocks";
import { ConnectionBanner } from "@/components/room";
import { ChatDrawer } from "@/components/chat";
import { addChatMessage } from "@/store/slices/chatSlice";
import { addToast } from "@/store/slices/uiSlice";
import { useAppDispatch } from "@/store/hooks";
import { getStoredParticipant } from "@/lib/session";
import type { ConnectionStatus } from "@/store/slices/connectionSlice";
import {
  PhasePreviewPanel,
  NetworkTestBench,
  FoodImageTestBench,
  ChatSimulatorBench,
} from "./panels";

// ---------------------------------------------------------------------------
// Dev Preview Route — /dev/preview (Modular Clean Architecture)
// Cung cấp bảng điều khiển kiểm thử trực quan:
// 1. 4 màn hình trạng thái game (Lobby, Playing, Reveal, Finished)
// 2. Kiểm thử kết nối Socket.IO & khôi phục phiên chơi tự động
// 3. Giả lập ảnh món ăn, chatbox thời gian thực và chống spam rate-limiting
// ---------------------------------------------------------------------------

const MOCK_MAP: Record<RoomPhase, RoomSnapshot> = {
  lobby: mockLobbySnapshot,
  playing: mockPlayingSnapshot,
  roundReveal: mockRevealSnapshot,
  finished: mockFinishedSnapshot,
};

export default function DevPreviewPage() {
  const dispatch = useAppDispatch();

  // UI state for game preview
  const [selectedPhase, setSelectedPhase] = useState<RoomPhase>("playing");
  const [isHostView, setIsHostView] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [foodImageTestState, setFoodImageTestState] = useState<
    "normal" | "broken" | "empty"
  >("normal");

  // State for Socket & Session testing
  const [testRoomCode, setTestRoomCode] = useState("TEST01");
  const [storedSessionInfo, setStoredSessionInfo] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        const stored = getStoredParticipant("TEST01");
        return stored ? JSON.stringify(stored) : null;
      }
      return null;
    }
  );
  const [bannerSimulation, setBannerSimulation] = useState<
    "live" | ConnectionStatus
  >("live");

  const handleInjectMockMessages = () => {
    mockChatMessages.forEach((msg) => {
      dispatch(addChatMessage({ ...msg, sentAt: Date.now() }));
    });
    dispatch(
      addToast({
        id: `mock-injected-${Date.now()}`,
        type: "success",
        message: "Đã nạp 4 tin nhắn mẫu vào ChatBox!",
      })
    );
  };

  const handleSimulateIncomingText = () => {
    dispatch(
      addChatMessage({
        id: `sim-msg-${Date.now()}`,
        participantId: "p2",
        participantName: "Bảo Bình",
        text: "Món này nhìn quen quá mà chưa đoán ra! Ai biết không?",
        sentAt: Date.now(),
      })
    );
  };

  const handleSimulateIncomingGif = () => {
    dispatch(
      addChatMessage({
        id: `sim-gif-${Date.now()}`,
        participantId: "p3",
        participantName: "Khánh Chi",
        gifUrl: "https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif",
        sentAt: Date.now(),
      })
    );
  };

  const handleSimulateRateLimitToast = () => {
    dispatch(
      addToast({
        id: `sim-rate-limit-${Date.now()}`,
        type: "warning",
        message:
          "Bạn đang gửi tin nhắn quá nhanh, vui lòng chờ ít giây. (Mô phỏng RATE_LIMITED)",
      })
    );
  };

  const handleSimulateInvalidGifToast = () => {
    dispatch(
      addToast({
        id: `sim-invalid-gif-${Date.now()}`,
        type: "error",
        message:
          "Đường dẫn GIF không được hỗ trợ. (Mô phỏng INVALID_GIF_URL)",
      })
    );
  };

  const syncStorage = (code: string) => {
    const stored = getStoredParticipant(code);
    setStoredSessionInfo(stored ? JSON.stringify(stored) : null);
  };

  const baseSnapshot = MOCK_MAP[selectedPhase];

  // Modify snapshot dynamically based on isHostView toggle
  const currentSnapshot: RoomSnapshot = {
    ...baseSnapshot,
    viewer: baseSnapshot.viewer
      ? {
          ...baseSnapshot.viewer,
          isHost: isHostView,
          name: isHostView ? "Quốc An (Host)" : "Bảo Bình",
        }
      : null,
  };

  const foodImageSrc =
    foodImageTestState === "normal"
      ? "/food-placeholder.jpg"
      : foodImageTestState === "broken"
      ? "https://invalid-domain.example/non-existent.jpg"
      : "";

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 font-sans">
      {/* Simulation ConnectionBanner directly at the top of preview page */}
      {bannerSimulation !== "live" ? (
        <div className="mb-6 rounded-xl overflow-hidden border border-amber-500/30">
          <div className="bg-amber-500/10 px-4 py-1.5 text-[11px] font-semibold text-amber-400 flex items-center justify-between border-b border-amber-500/20">
            <span>
              ⚡ Đang giả lập ConnectionBanner: &ldquo;{bannerSimulation}&rdquo;
            </span>
            <button
              onClick={() => setBannerSimulation("live")}
              className="text-xs underline hover:text-amber-300 cursor-pointer"
            >
              Trở về Live
            </button>
          </div>
          <ConnectionBanner
            forcedStatus={bannerSimulation}
            forcedAttempt={3}
            forcedErrorMessage="Lỗi kết nối Socket.IO: WebSocket connection timeout"
            showWhenIdle={true}
          />
        </div>
      ) : null}

      {/* Header bar */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-mono">
              DEV BENCH
            </span>
            <span className="text-xs text-neutral-500">
              Khu vực kiểm thử giao diện & giả lập trạng thái thi đấu
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Food Guess — Playground & Test Bench
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Kiểm thử giao diện 4 phase của game và tương tác Socket / Session thực tế
          </p>
        </div>

        {/* Phase selector tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-900/90 p-1.5 rounded-xl border border-neutral-800">
          {(["lobby", "playing", "roundReveal", "finished"] as RoomPhase[]).map(
            (phase) => {
              const labelMap: Record<RoomPhase, string> = {
                lobby: "1. Sảnh chờ",
                playing: "2. Đoán món",
                roundReveal: "3. Tổng kết",
                finished: "4. Kết thúc",
              };
              const active = selectedPhase === phase;
              return (
                <button
                  key={phase}
                  onClick={() => setSelectedPhase(phase)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer ${
                    active
                      ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                  }`}
                >
                  {labelMap[phase]}
                </button>
              );
            }
          )}
        </div>
      </header>

      {/* Main Dev Console Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Visual Game Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <PhasePreviewPanel
            selectedPhase={selectedPhase}
            currentSnapshot={currentSnapshot}
            isHostView={isHostView}
            testRoomCode={testRoomCode}
          />
        </div>

        {/* Right column: Dev Controls & Test Bench (1 col) */}
        <div className="space-y-6">
          {/* 1. Socket & Session Bench (SRP) */}
          <NetworkTestBench
            testRoomCode={testRoomCode}
            setTestRoomCode={setTestRoomCode}
            syncStorage={syncStorage}
            storedSessionInfo={storedSessionInfo}
            bannerSimulation={bannerSimulation}
            setBannerSimulation={setBannerSimulation}
          />

          {/* 2. Controls & FoodImage Test Bench (SRP) */}
          <FoodImageTestBench
            isHostView={isHostView}
            setIsHostView={setIsHostView}
            foodImageTestState={foodImageTestState}
            setFoodImageTestState={setFoodImageTestState}
            foodImageSrc={foodImageSrc}
          />

          {/* 3. Chatbox Test Bench & Simulator (SRP) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <ChatSimulatorBench
              onInjectMockMessages={handleInjectMockMessages}
              onSimulateIncomingText={handleSimulateIncomingText}
              onSimulateIncomingGif={handleSimulateIncomingGif}
              onSimulateRateLimitToast={handleSimulateRateLimitToast}
              onSimulateInvalidGifToast={handleSimulateInvalidGifToast}
            />

            {/* Toggle Raw JSON */}
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
            >
              {showRawJson ? "Ẩn snapshot JSON" : "Xem snapshot JSON chi tiết"}
            </button>
          </div>

          {/* Raw JSON View */}
          {showRawJson && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                RoomSnapshot JSON
              </div>
              <pre className="text-[11px] bg-neutral-950 p-3 rounded-xl border border-neutral-800 overflow-x-auto max-h-96 text-emerald-400 font-mono">
                {JSON.stringify(currentSnapshot, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </main>

      {/* Floating Chat Drawer Test Component */}
      <ChatDrawer />
    </div>
  );
}
