"use client";

import FoodImage from "@/components/shared/FoodImage";
import { mockRoomSummaries } from "@/mocks";

export interface FoodImageTestBenchProps {
  isHostView: boolean;
  setIsHostView: (isHost: boolean) => void;
  foodImageTestState: "normal" | "broken" | "empty";
  setFoodImageTestState: (state: "normal" | "broken" | "empty") => void;
  foodImageSrc: string;
}

/**
 * FoodImageTestBench — Khu vực kiểm thử hiển thị ảnh món ăn và mock phòng (SRP)
 * Tuân thủ Text-only UI, Dark Mode tokens
 */
export function FoodImageTestBench({
  isHostView,
  setIsHostView,
  foodImageTestState,
  setFoodImageTestState,
  foodImageSrc,
}: FoodImageTestBenchProps) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
        Tuỳ Chọn Giả Lập UI
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
          className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
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
        <div className="text-xs font-semibold text-white">
          Test component FoodImage
        </div>
        <div className="text-[11px] text-neutral-400">
          Kiểm thử skeleton & fallback
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => setFoodImageTestState("normal")}
            className={`px-2 py-1 text-[11px] rounded font-medium border cursor-pointer ${
              foodImageTestState === "normal"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            }`}
          >
            Ảnh chuẩn
          </button>
          <button
            onClick={() => setFoodImageTestState("broken")}
            className={`px-2 py-1 text-[11px] rounded font-medium border cursor-pointer ${
              foodImageTestState === "broken"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                : "bg-neutral-800 text-neutral-400 border-neutral-700"
            }`}
          >
            Ảnh lỗi (404)
          </button>
          <button
            onClick={() => setFoodImageTestState("empty")}
            className={`px-2 py-1 text-[11px] rounded font-medium border cursor-pointer ${
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
          <span className="text-xs font-semibold text-white">
            Danh sách phòng Hub (Mock)
          </span>
          <span className="text-[10px] text-neutral-400">
            {mockRoomSummaries.length} phòng
          </span>
        </div>
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {mockRoomSummaries.map((room) => (
            <div
              key={room.code}
              className="text-[11px] flex items-center justify-between p-1.5 rounded bg-neutral-900 border border-neutral-800/80"
            >
              <div>
                <span className="font-bold text-amber-400">{room.code}</span>
                <span className="text-neutral-500 ml-1.5">
                  ({room.gameType})
                </span>
              </div>
              <span className="text-neutral-400">
                {room.participantCount}/50
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
