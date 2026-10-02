"use client";

import { useState } from "react";
import type { RoomPhase, RoomSnapshot } from "@/types";
import {
  mockLobbySnapshot,
  mockPlayingSnapshot,
  mockRevealSnapshot,
  mockFinishedSnapshot,
  mockRoomSummaries,
} from "@/mocks";
import FoodImage from "@/components/shared/FoodImage";

// ---------------------------------------------------------------------------
// Dev Preview Route — /dev/preview
// Plan: section 3 (Giai đoạn 0 — chế độ mock)
// Allows visual inspection and interaction testing for all 4 game phases
// without needing a real backend connection or live room.
// ---------------------------------------------------------------------------

const MOCK_MAP: Record<RoomPhase, RoomSnapshot> = {
  lobby: mockLobbySnapshot,
  playing: mockPlayingSnapshot,
  roundReveal: mockRevealSnapshot,
  finished: mockFinishedSnapshot,
};

export default function DevPreviewPage() {
  const [selectedPhase, setSelectedPhase] = useState<RoomPhase>("playing");
  const [isHostView, setIsHostView] = useState(true);
  const [showRawJson, setShowRawJson] = useState(false);
  const [foodImageTestState, setFoodImageTestState] = useState<"normal" | "broken" | "empty">("normal");

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
      {/* Header bar */}
      <header className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
              Dev Mode Only
            </span>
            <span className="text-xs text-neutral-500">Phần preview cho Giai đoạn 0 (Đầu việc 7)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-2 text-white">
            Food Guess — State & UI Preview
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Kiểm thử giao diện 4 phase của game độc lập với Server Backend
          </p>
        </div>

        {/* Phase selector tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-neutral-900/90 p-1.5 rounded-xl border border-neutral-800">
          {(["lobby", "playing", "roundReveal", "finished"] as RoomPhase[]).map((phase) => {
            const labelMap: Record<RoomPhase, string> = {
              lobby: "1. Lobby (Chờ)",
              playing: "2. Playing (Đoán)",
              roundReveal: "3. Reveal (Đáp án)",
              finished: "4. Finished (Kết thúc)",
            };
            const active = selectedPhase === phase;
            return (
              <button
                key={phase}
                onClick={() => setSelectedPhase(phase)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                  active
                    ? "bg-amber-500 text-neutral-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {labelMap[phase]}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Dev Console Grid */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Visual Game Preview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Room info header bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-400 uppercase tracking-wider font-medium">Mã phòng</div>
              <div className="text-2xl font-black text-amber-400 tracking-wider">
                {currentSnapshot.code}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
                <span className="text-neutral-400">Vòng: </span>
                <span className="font-semibold text-white">
                  {currentSnapshot.foodGuessRound?.roundNumber ||
                    currentSnapshot.foodGuessReveal?.roundNumber ||
                    1}
                  /{currentSnapshot.config.totalRounds}
                </span>
              </div>

              <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
                <span className="text-neutral-400">Thời gian: </span>
                <span className="font-semibold text-white">
                  {currentSnapshot.config.answerTimeSeconds}s
                </span>
              </div>

              <div className="bg-neutral-800/80 px-3 py-1.5 rounded-lg border border-neutral-700/50">
                <span className="text-neutral-400">Combo: </span>
                <span
                  className={`font-semibold ${
                    currentSnapshot.config.comboStreakEnabled ? "text-emerald-400" : "text-neutral-500"
                  }`}
                >
                  {currentSnapshot.config.comboStreakEnabled ? "Bật" : "Tắt"}
                </span>
              </div>
            </div>
          </div>

          {/* Phase 1: LOBBY VIEW PREVIEW */}
          {selectedPhase === "lobby" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">Phòng chờ (Lobby)</h2>
                  <p className="text-xs text-neutral-400">
                    Đang chờ người chơi tham gia ({currentSnapshot.participants.length}/50)
                  </p>
                </div>
                {isHostView && (
                  <span className="px-3 py-1 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-medium">
                    Bạn là Trưởng phòng (Host)
                  </span>
                )}
              </div>

              {/* Player list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentSnapshot.participants.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-neutral-950 text-sm">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                          {player.name}
                          {player.isHost && (
                            <span className="text-[10px] bg-amber-500 text-neutral-950 px-1.5 py-0.5 rounded font-bold">
                              HOST
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {player.isOnline ? (
                            <span className="text-emerald-400 inline-flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-neutral-500">Mất kết nối</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Host actions */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <button
                  disabled
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-800 text-neutral-400 cursor-not-allowed"
                >
                  Rời phòng
                </button>
                {isHostView ? (
                  <button
                    disabled
                    className="px-6 py-2.5 text-sm font-bold rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-lg shadow-amber-500/20 cursor-not-allowed"
                  >
                    Bắt đầu chơi (Host)
                  </button>
                ) : (
                  <span className="text-xs text-neutral-400 italic">
                    Chờ Host bấm bắt đầu...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Phase 2: PLAYING VIEW PREVIEW */}
          {selectedPhase === "playing" && currentSnapshot.foodGuessRound && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Vòng {currentSnapshot.foodGuessRound.roundNumber} /{" "}
                    {currentSnapshot.foodGuessRound.totalRounds}
                  </h2>
                  <p className="text-xs text-neutral-400">
                    Đã nộp bài: {currentSnapshot.foodGuessRound.submittedCount} /{" "}
                    {currentSnapshot.participants.length} người
                  </p>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-xs font-bold animate-pulse">
                  ⏱ Còn 25s
                </div>
              </div>

              {/* Food image section */}
              <div className="max-w-md mx-auto">
                <FoodImage
                  src={currentSnapshot.foodGuessRound.mediaUrl}
                  alt="Ảnh món ăn cần đoán"
                  className="shadow-2xl border border-neutral-800"
                />
              </div>

              {/* Suggestion decoy chips */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-neutral-400">
                  Gợi ý món ăn (bấm để điền nhanh):
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentSnapshot.foodGuessRound.suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      className="px-3.5 py-1.5 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700/50 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input simulator */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập tên món ăn tiếng Việt..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  defaultValue=""
                />
                <button className="px-6 py-2.5 text-sm font-bold bg-amber-500 text-neutral-950 rounded-xl hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                  Gửi
                </button>
              </div>

              {/* Live submissions feed */}
              {currentSnapshot.foodGuessEvents && currentSnapshot.foodGuessEvents.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 space-y-2">
                  <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Feed nộp bài thời gian thực
                  </div>
                  <div className="space-y-1.5">
                    {currentSnapshot.foodGuessEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="text-xs flex items-center justify-between p-2 rounded-lg bg-neutral-950/40 border border-neutral-800/60"
                      >
                        <span className="font-medium text-white">{evt.participantName}</span>
                        <span
                          className={`font-semibold ${
                            evt.isCorrect ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {evt.isCorrect ? `+${evt.points} điểm` : "Chưa chính xác"}
                          {evt.comboApplied && " (Combo 🔥)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Phase 3: REVEAL VIEW PREVIEW */}
          {selectedPhase === "roundReveal" && currentSnapshot.foodGuessReveal && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Đáp án Vòng {currentSnapshot.foodGuessReveal.roundNumber}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {currentSnapshot.foodGuessReveal.foodName}
                </h2>
              </div>

              <div className="max-w-xs mx-auto">
                <FoodImage
                  src={currentSnapshot.foodGuessReveal.resourceUrl}
                  alt={currentSnapshot.foodGuessReveal.foodName}
                  className="shadow-2xl border border-neutral-800"
                />
              </div>

              {/* Viewer result badge */}
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center space-y-1">
                <div className="text-xs text-neutral-400">Kết quả của bạn</div>
                <div className="text-lg font-bold text-emerald-400">
                  +{currentSnapshot.foodGuessReveal.viewerPoints} điểm 🎉
                </div>
                <div className="text-xs text-amber-400 font-medium">
                  Chuỗi đúng (Streak): {currentSnapshot.foodGuessReveal.viewerStreak} liên tiếp!
                </div>
              </div>

              {/* Round results table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Kết quả các người chơi
                </div>
                <div className="space-y-1.5">
                  {currentSnapshot.foodGuessReveal.results.map((res) => (
                    <div
                      key={res.participantId}
                      className="text-xs flex items-center justify-between p-2.5 rounded-lg bg-neutral-950/50 border border-neutral-800"
                    >
                      <div>
                        <span className="font-semibold text-white">{res.participantName}</span>
                        <span className="text-neutral-500 ml-2">đoán: &ldquo;{res.answer}&rdquo;</span>
                      </div>
                      <div className="font-bold">
                        {res.isCorrect ? (
                          <span className="text-emerald-400">
                            +{res.points} đ {res.comboApplied && "🔥"}
                          </span>
                        ) : (
                          <span className="text-neutral-500">0 đ</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Phase 4: FINISHED VIEW PREVIEW */}
          {selectedPhase === "finished" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  Trò chơi kết thúc
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Bảng Vinh Danh</h2>
                <p className="text-xs text-neutral-400">Tổng kết sau 10 vòng thi đấu gay cấn</p>
              </div>

              {/* Podium Top 3 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 text-center">
                {/* 2nd place */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🥈</div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-200">
                    {currentSnapshot.participants[1]?.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {currentSnapshot.participants[1]?.score} đ
                  </div>
                  <div className="w-full h-20 bg-neutral-800 rounded-t-xl mt-2 flex items-center justify-center font-black text-neutral-500 text-lg">
                    2
                  </div>
                </div>

                {/* 1st place */}
                <div className="flex flex-col items-center">
                  <div className="text-3xl mb-1 animate-bounce">👑 🥇</div>
                  <div className="font-extrabold text-xs sm:text-sm text-amber-400">
                    {currentSnapshot.participants[0]?.name}
                  </div>
                  <div className="text-xs text-amber-300 font-semibold">
                    {currentSnapshot.participants[0]?.score} đ
                  </div>
                  <div className="w-full h-28 bg-gradient-to-t from-amber-600/30 to-amber-500/30 border-t-2 border-amber-400 rounded-t-xl mt-2 flex items-center justify-center font-black text-amber-400 text-2xl">
                    1
                  </div>
                </div>

                {/* 3rd place */}
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🥉</div>
                  <div className="font-bold text-xs sm:text-sm text-neutral-200">
                    {currentSnapshot.participants[2]?.name}
                  </div>
                  <div className="text-xs text-neutral-400">
                    {currentSnapshot.participants[2]?.score} đ
                  </div>
                  <div className="w-full h-14 bg-neutral-800 rounded-t-xl mt-2 flex items-center justify-center font-black text-neutral-500 text-base">
                    3
                  </div>
                </div>
              </div>

              {/* Full Leaderboard */}
              <div className="space-y-1.5 pt-4 border-t border-neutral-800">
                <div className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                  Bảng tổng sắp chi tiết
                </div>
                {currentSnapshot.participants.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/80 text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-bold text-neutral-400">#{idx + 1}</span>
                      <span className="font-semibold text-white">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-400">
                        {player.correctAnswers} câu đúng
                      </span>
                      <span className="font-black text-amber-400">{player.score} điểm</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Dev Controls & Test Bench (1 col) */}
        <div className="space-y-6">
          {/* Controls Box */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🛠️</span> Tuỳ chọn giả lập
            </h3>

            {/* Role switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950 border border-neutral-800">
              <div>
                <div className="text-xs font-semibold text-white">Chế độ Viewer</div>
                <div className="text-[11px] text-neutral-400">
                  {isHostView ? "Đang đóng vai Host" : "Đang đóng vai Người chơi"}
                </div>
              </div>
              <button
                onClick={() => setIsHostView(!isHostView)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  isHostView
                    ? "bg-amber-500 text-neutral-950 border-amber-400"
                    : "bg-neutral-800 text-neutral-300 border-neutral-700"
                }`}
              >
                {isHostView ? "Host" : "Player"}
              </button>
            </div>

            {/* FoodImage test bench */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="text-xs font-semibold text-white">Test component FoodImage</div>
              <div className="text-[11px] text-neutral-400">Kiểm thử skeleton & fallback</div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setFoodImageTestState("normal")}
                  className={`px-2 py-1 text-[11px] rounded font-medium border ${
                    foodImageTestState === "normal"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  Ảnh chuẩn
                </button>
                <button
                  onClick={() => setFoodImageTestState("broken")}
                  className={`px-2 py-1 text-[11px] rounded font-medium border ${
                    foodImageTestState === "broken"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  Ảnh lỗi (404)
                </button>
                <button
                  onClick={() => setFoodImageTestState("empty")}
                  className={`px-2 py-1 text-[11px] rounded font-medium border ${
                    foodImageTestState === "empty"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  }`}
                >
                  Trống src
                </button>
              </div>

              <div className="pt-2">
                <FoodImage
                  src={foodImageSrc}
                  alt="Ảnh test bench"
                  className="w-full max-w-[140px] mx-auto border border-neutral-800 shadow"
                />
              </div>
            </div>

            {/* Hub rooms preview */}
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Danh sách phòng Hub (Mock)</span>
                <span className="text-[10px] text-neutral-400">{mockRoomSummaries.length} phòng</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {mockRoomSummaries.map((room) => (
                  <div
                    key={room.code}
                    className="text-[11px] flex items-center justify-between p-1.5 rounded bg-neutral-900 border border-neutral-800/80"
                  >
                    <div>
                      <span className="font-bold text-amber-400">{room.code}</span>
                      <span className="text-neutral-500 ml-1.5">({room.gameType})</span>
                    </div>
                    <span className="text-neutral-400">{room.participantCount}/50</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle Raw JSON */}
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
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
    </div>
  );
}
