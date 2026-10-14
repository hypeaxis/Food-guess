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
import {
  RoundsConfigField,
  TimerConfigField,
  RoomTogglesField,
} from "./create-room";

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
          className="w-full rounded-lg border border-border-subtle bg-surface-sub px-4 py-2.5 text-base sm:text-sm text-on-surface placeholder:text-surface-variant outline-none transition-all focus:border-primary-container focus:bg-surface-container-low disabled:opacity-50"
          autoComplete="off"
        />
      </div>

      {/* Section 2: Total Rounds (SRP) */}
      <RoundsConfigField
        value={totalRounds}
        onChange={setTotalRounds}
        disabled={isLoading}
      />

      {/* Section 3: Answer Time Seconds (SRP) */}
      <TimerConfigField
        value={answerTimeSeconds}
        onChange={setAnswerTimeSeconds}
        disabled={isLoading}
      />

      {/* Section 4: Game Toggles (SRP) */}
      <RoomTogglesField
        autoNextRound={autoNextRound}
        onToggleAutoNextRound={() => setAutoNextRound(!autoNextRound)}
        comboStreakEnabled={comboStreakEnabled}
        onToggleComboStreak={() => setComboStreakEnabled(!comboStreakEnabled)}
        disabled={isLoading}
      />

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
