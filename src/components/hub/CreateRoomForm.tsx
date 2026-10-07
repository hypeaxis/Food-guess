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
      className={`flex flex-col gap-5 rounded-xl border border-border-subtle bg-surface-card p-6 shadow-md backdrop-blur-sm sm:p-8 ${className}`}
    >
      {/* Form header */}
      <div className="border-b border-border-subtle pb-4">
        <h2 className="text-lg font-bold tracking-tight text-on-surface sm:text-xl">
          Tạo phòng thi đấu mới
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Khởi tạo bàn cược ẩm thực đa người chơi thời gian thực
        </p>
      </div>

      {/* Error alert box */}
      {errorMessage && (
        <div className="rounded-lg border border-rose-border bg-rose-bg p-3 font-mono text-xs font-medium text-rose-text">
          [ CẢNH BÁO: {errorMessage} ]
        </div>
      )}

      {/* Section 1: Host Name */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <label htmlFor="host-name" className="font-semibold uppercase text-on-surface-variant">
            TÊN CHỦ PHÒNG
          </label>
          <span className="text-on-surface-variant">
            {name.trim().length} / 24
          </span>
        </div>
        <input
          id="host-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="VD: MasterChef_VN"
          maxLength={24}
          disabled={isLoading}
          className="w-full rounded-lg border border-border-subtle bg-surface-sub px-4 py-2.5 text-sm text-on-surface placeholder:text-surface-variant outline-none transition-all focus:border-primary-container focus:bg-surface-container-low disabled:opacity-50"
          autoComplete="off"
        />
      </div>

      {/* Section 2: Total Rounds */}
      <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <label htmlFor="total-rounds" className="font-semibold uppercase text-on-surface-variant">
            SỐ LƯỢNG VÒNG ĐẤU
          </label>
          <span className="rounded bg-surface-card border border-border-subtle px-2 py-0.5 font-bold text-primary">
            {totalRounds} VÒNG
          </span>
        </div>
        {/* Preset quick buttons */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {[5, 10, 15, 20].map((rounds) => (
            <button
              key={rounds}
              type="button"
              disabled={isLoading}
              onClick={() => setTotalRounds(rounds)}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                totalRounds === rounds
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "border border-border-subtle bg-surface-card text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {rounds} vòng {rounds === 10 ? "(Chuẩn)" : ""}
            </button>
          ))}
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
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary-container disabled:opacity-50"
        />
        <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
          <span>Tối thiểu: 5 vòng</span>
          <span>Tối đa: 50 vòng</span>
        </div>
      </div>

      {/* Section 3: Answer Time Seconds */}
      <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <label htmlFor="answer-time" className="font-semibold uppercase text-on-surface-variant">
            THỜI GIAN ĐOÁN MỖI CÂU
          </label>
          <span className="rounded bg-surface-card border border-border-subtle px-2 py-0.5 font-bold text-emerald-text">
            {answerTimeSeconds}S / LƯỢT
          </span>
        </div>
        {/* Preset quick buttons */}
        <div className="flex flex-wrap gap-1.5 font-mono text-xs">
          {[15, 20, 30, 45].map((seconds) => (
            <button
              key={seconds}
              type="button"
              disabled={isLoading}
              onClick={() => setAnswerTimeSeconds(seconds)}
              className={`rounded px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                answerTimeSeconds === seconds
                  ? "bg-primary-container text-on-primary-container font-bold"
                  : "border border-border-subtle bg-surface-card text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {seconds}s {seconds === 30 ? "(Chuẩn)" : ""}
            </button>
          ))}
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
          className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary-container disabled:opacity-50"
        />
        <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
          <span>Nhanh: 10 giây</span>
          <span>Thong thả: 120 giây</span>
        </div>
      </div>

      {/* Section 4: Game Toggles (Text-only switches) */}
      <div className="flex flex-col gap-2.5 pt-1">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
          CÀI ĐẶT NÂNG CAO
        </span>

        {/* Toggle 1: Auto Next Round */}
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sub p-3">
          <div className="pr-4">
            <span className="block text-sm font-medium text-on-surface">
              Tự động qua vòng mới
            </span>
            <span className="block text-xs text-on-surface-variant">
              Tự chuyển sang câu hỏi tiếp theo sau 5 giây tổng kết
            </span>
          </div>

          <button
            type="button"
            onClick={() => setAutoNextRound(!autoNextRound)}
            disabled={isLoading}
            className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
              autoNextRound
                ? "border-emerald-border bg-emerald-bg text-emerald-text"
                : "border-border-subtle bg-surface-card text-on-surface-variant"
            }`}
          >
            {autoNextRound ? "[ BẬT ]" : "[ TẮT ]"}
          </button>
        </div>

        {/* Toggle 2: Combo Streak */}
        <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sub p-3">
          <div className="pr-4">
            <span className="block text-sm font-medium text-on-surface">
              Điểm thưởng chuỗi đúng (Combo)
            </span>
            <span className="block text-xs text-on-surface-variant">
              Cộng thêm điểm thưởng khi đoán đúng nhiều câu liên tiếp
            </span>
          </div>

          <button
            type="button"
            onClick={() => setComboStreakEnabled(!comboStreakEnabled)}
            disabled={isLoading}
            className={`rounded-md border px-3 py-1 font-mono text-xs font-bold uppercase transition-colors ${
              comboStreakEnabled
                ? "border-emerald-border bg-emerald-bg text-emerald-text"
                : "border-border-subtle bg-surface-card text-on-surface-variant"
            }`}
          >
            {comboStreakEnabled ? "[ BẬT ]" : "[ TẮT ]"}
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-border-interactive bg-surface-sub px-4 py-3 font-mono text-xs font-semibold text-on-surface-variant transition-colors hover:text-on-surface disabled:opacity-50"
          >
            [ HỦY ]
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading || name.trim().length < 2}
          className="flex-1 rounded-lg bg-primary-container px-4 py-3 font-mono text-sm font-bold tracking-wider text-on-primary-container shadow-sm transition-all hover:bg-brand-amber-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-neutral-500"
        >
          {isLoading ? "[ ĐANG KHỞI TẠO... ]" : "[ KHỞI TẠO PHÒNG ]"}
        </button>
      </div>
    </form>
  );
}
