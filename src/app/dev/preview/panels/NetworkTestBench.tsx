"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  connectSocketAction,
  disconnectSocketAction,
} from "@/store/socketMiddleware";
import { resumeRoom } from "@/store/thunks";
import {
  setStoredParticipant,
  clearStoredParticipant,
} from "@/lib/session";
import type { ConnectionStatus } from "@/store/slices/connectionSlice";

export interface NetworkTestBenchProps {
  testRoomCode: string;
  setTestRoomCode: (code: string) => void;
  syncStorage: (code: string) => void;
  storedSessionInfo: string | null;
  bannerSimulation: ConnectionStatus | "live";
  setBannerSimulation: (mode: ConnectionStatus | "live") => void;
}

/**
 * NetworkTestBench — Khu vực kiểm thử kết nối Socket & khôi phục phiên (SRP)
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function NetworkTestBench({
  testRoomCode,
  setTestRoomCode,
  syncStorage,
  storedSessionInfo,
  bannerSimulation,
  setBannerSimulation,
}: NetworkTestBenchProps) {
  const dispatch = useAppDispatch();
  const connection = useAppSelector((state) => state.connection);
  const session = useAppSelector((state) => state.session);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          Giao Thức Mạng & Phiên Chơi
        </h3>
        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">
          Socket.IO
        </span>
      </div>

      {/* Live Connection Status */}
      <div className="space-y-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Connection Status:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              connection.status === "connected"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : connection.status === "reconnecting"
                ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                : connection.status === "waking"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : connection.status === "error"
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {connection.status.toUpperCase()}
            {connection.reconnectAttempt > 0 &&
              ` (${connection.reconnectAttempt}/10)`}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Socket ID:</span>
          <span className="font-mono text-neutral-300">
            {connection.socketId || "null"}
          </span>
        </div>
        {connection.errorMessage && (
          <div className="text-[11px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-900/50">
            {connection.errorMessage}
          </div>
        )}
      </div>

      {/* Live Session Status */}
      <div className="space-y-2 p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Session Status:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              session.status === "joined"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : session.status === "resuming" ||
                  session.status === "joining"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : session.status === "needsName"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                : "bg-neutral-800 text-neutral-400"
            }`}
          >
            {session.status}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Mã phòng:</span>
          <span className="font-mono font-bold text-amber-400">
            {session.roomCode || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Người chơi:</span>
          <span className="text-neutral-300">
            {session.participant?.name || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-neutral-400">Participant ID:</span>
          <span className="font-mono text-neutral-400 text-[10px] truncate max-w-[140px]">
            {session.participant?.participantId || "—"}
          </span>
        </div>
      </div>

      {/* Socket Control Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => dispatch(connectSocketAction())}
          className="py-2 px-3 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
        >
          Connect Socket
        </button>
        <button
          onClick={() => dispatch(disconnectSocketAction())}
          className="py-2 px-3 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>

      {/* Auto-Resume & LocalStorage Test Bench */}
      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
        <div className="text-xs font-semibold text-white flex items-center justify-between">
          <span>Auto-Resume Test</span>
          <span className="text-[10px] text-neutral-400">localStorage</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={testRoomCode}
            onChange={(e) => {
              const code = e.target.value.toUpperCase();
              setTestRoomCode(code);
              syncStorage(code);
            }}
            placeholder="Mã phòng"
            className="w-24 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => {
              dispatch(resumeRoom({ code: testRoomCode }));
              syncStorage(testRoomCode);
            }}
            className="flex-1 py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Test Resume
          </button>
        </div>

        <div className="text-[10px] text-neutral-400 space-y-1">
          <div>
            Key:{" "}
            <code className="text-neutral-300 font-mono">
              room_participant_{testRoomCode}
            </code>
          </div>
          <div className="truncate text-neutral-400 bg-neutral-900 p-1 rounded font-mono">
            {storedSessionInfo ? storedSessionInfo : "(Chưa có trong localStorage)"}
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              setStoredParticipant(testRoomCode, {
                participantId: "test_part_123",
                token: "test_token_xyz",
                name: "Tester Dev",
              });
              syncStorage(testRoomCode);
            }}
            className="flex-1 py-1 text-[11px] bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded font-medium transition-colors cursor-pointer"
          >
            Set Fake Storage
          </button>
          <button
            onClick={() => {
              clearStoredParticipant(testRoomCode);
              syncStorage(testRoomCode);
            }}
            className="py-1 px-2 text-[11px] bg-rose-950/50 hover:bg-rose-900/50 text-rose-300 border border-rose-800/40 rounded font-medium transition-colors cursor-pointer"
          >
            Xóa
          </button>
        </div>
      </div>

      {/* ConnectionBanner Visual Simulator */}
      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
        <div className="text-xs font-semibold text-white">
          Simulate ConnectionBanner
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              "live",
              "waking",
              "reconnecting",
              "error",
              "connecting",
            ] as const
          ).map((mode) => (
            <button
              key={mode}
              onClick={() => setBannerSimulation(mode)}
              className={`py-1 px-2 text-[11px] rounded font-medium border capitalize transition-all cursor-pointer ${
                bannerSimulation === mode
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold"
                  : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white"
              }`}
            >
              {mode === "live" ? "Live Redux" : mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
