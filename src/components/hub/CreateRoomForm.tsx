"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { addToast } from "@/store/slices/uiSlice";
import { socket } from "@/lib/socket";
import { getErrorMessage } from "@/lib/errors";
import type { FoodGuessConfig } from "@/types";

// ---------------------------------------------------------------------------
// CreateRoomForm — Form for creating a new Food Guess room
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export interface CreateRoomFormProps {
  onSuccess?: (code: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function CreateRoomForm({
  onSuccess,
  onCancel,
  className = "",
}: CreateRoomFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionStatus = useAppSelector((state) => state.session.status);

  // Form states
  const [name, setName] = useState("");
  const [totalRounds, setTotalRounds] = useState(10);
  const [answerTimeSeconds, setAnswerTimeSeconds] = useState(30);
  const [autoNextRound, setAutoNextRound] = useState(true);
  const [comboStreakEnabled, setComboStreakEnabled] = useState(true);

  // Status & validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = isSubmitting || sessionStatus === "joining";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 24) {
      setErrorMessage("Tên người chơi phải từ 2 đến 24 ký tự.");
      return;
    }

    if (totalRounds < 5 || totalRounds > 50) {
      setErrorMessage("Số vòng chơi phải từ 5 đến 50 vòng.");
      return;
    }

    if (answerTimeSeconds < 10 || answerTimeSeconds > 120) {
      setErrorMessage("Thời gian trả lời phải từ 10 đến 120 giây.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!socket.connected) {
        dispatch(connectSocketAction());
      }

      const config: FoodGuessConfig = {
        gameType: "food-guess",
        totalRounds,
        answerTimeSeconds,
        autoNextRound,
        comboStreakEnabled,
      };

      const result = await dispatch(
        createRoom({ config, name: trimmedName })
      ).unwrap();

      dispatch(
        addToast({
          id: String(Date.now()),
          type: "success",
          message: `Tạo phòng ${result.code} thành công!`,
        })
      );

      if (onSuccess) {
        onSuccess(result.code);
      } else {
        router.push(`/room/${result.code}`);
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "string" ? getErrorMessage(err) : "Không thể tạo phòng.";
      setErrorMessage(msg);
      dispatch(
        addToast({
          id: String(Date.now()),
          type: "error",
          message: msg,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-sm sm:p-8 ${className}`}
    >
      {/* Form header */}
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-neutral-100">
          Tạo phòng chơi mới
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Thiết lập cấu hình phòng và thời gian cho ván đoán món ăn
        </p>
      </div>

      {/* Error alert box */}
      {errorMessage && (
        <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3.5 text-xs font-medium text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Section 1: Player Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <label htmlFor="host-name">Tên của bạn</label>
          <span className="font-mono text-neutral-400">
            {name.trim().length} / 24
          </span>
        </div>
        <input
          id="host-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên hiển thị (2 - 24 ký tự)"
          maxLength={24}
          disabled={isLoading}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-amber-500 focus:outline-none disabled:opacity-50"
          autoComplete="off"
        />
      </div>

      {/* Section 2: Total Rounds */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <label htmlFor="total-rounds">Số vòng chơi</label>
          <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
            {totalRounds} vòng
          </span>
        </div>
        <input
          id="total-rounds"
          type="range"
          min={5}
          max={50}
          step={1}
          value={totalRounds}
          onChange={(e) => setTotalRounds(Number(e.target.value))}
          disabled={isLoading}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-amber-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>Tối thiểu: 5 vòng</span>
          <span>Tối đa: 50 vòng</span>
        </div>
      </div>

      {/* Section 3: Answer Time Seconds */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <label htmlFor="answer-time">Thời gian đoán mỗi câu</label>
          <span className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
            {answerTimeSeconds} giây
          </span>
        </div>
        <input
          id="answer-time"
          type="range"
          min={10}
          max={120}
          step={5}
          value={answerTimeSeconds}
          onChange={(e) => setAnswerTimeSeconds(Number(e.target.value))}
          disabled={isLoading}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-neutral-800 accent-amber-500 disabled:opacity-50"
        />
        <div className="flex justify-between text-[11px] text-neutral-400">
          <span>Nhanh: 10 giây</span>
          <span>Thong thả: 120 giây</span>
        </div>
      </div>

      {/* Section 4: Game Toggles (Text-only switches) */}
      <div className="space-y-3 pt-2">
        <span className="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
          Cài đặt nâng cao
        </span>

        {/* Toggle 1: Auto Next Round */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3">
          <div className="pr-4">
            <span className="block text-sm font-medium text-neutral-200">
              Tự động qua vòng mới
            </span>
            <span className="block text-xs text-neutral-400">
              Tự chuyển sang câu hỏi tiếp theo sau 5 giây tổng kết
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAutoNextRound(!autoNextRound)}
            disabled={isLoading}
            className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
              autoNextRound
                ? "border-emerald-700/80 bg-emerald-950/80 text-emerald-300"
                : "border-neutral-800 bg-neutral-900 text-neutral-400"
            }`}
          >
            {autoNextRound ? "Bật" : "Tắt"}
          </button>
        </div>

        {/* Toggle 2: Combo Streak */}
        <div className="flex items-center justify-between rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-3">
          <div className="pr-4">
            <span className="block text-sm font-medium text-neutral-200">
              Điểm thưởng chuỗi đúng (Combo)
            </span>
            <span className="block text-xs text-neutral-400">
              Cộng thêm điểm thưởng khi đoán đúng nhiều câu liên tiếp
            </span>
          </div>

          <button
            type="button"
            onClick={() => setComboStreakEnabled(!comboStreakEnabled)}
            disabled={isLoading}
            className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
              comboStreakEnabled
                ? "border-emerald-700/80 bg-emerald-950/80 text-emerald-300"
                : "border-neutral-800 bg-neutral-900 text-neutral-400"
            }`}
          >
            {comboStreakEnabled ? "Bật" : "Tắt"}
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800/80 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-neutral-700 disabled:opacity-50"
          >
            Hủy
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || name.trim().length < 2}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {isLoading ? "Đang tạo phòng..." : "Tạo phòng chơi"}
        </button>
      </div>
    </form>
  );
}
