"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { joinRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { addToast } from "@/store/slices/uiSlice";
import { socket } from "@/lib/socket";
import { getErrorMessage } from "@/lib/errors";

// ---------------------------------------------------------------------------
// NameForm — Used on direct room URL visit (/room/[code]) when player needs name
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export interface NameFormProps {
  code: string;
  onSuccess?: () => void;
  className?: string;
}

export default function NameForm({
  code,
  onSuccess,
  className = "",
}: NameFormProps) {
  const dispatch = useAppDispatch();
  const sessionStatus = useAppSelector((state) => state.session.status);

  const [name, setName] = useState("");
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

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      if (!socket.connected) {
        dispatch(connectSocketAction());
      }

      await dispatch(
        joinRoom({ code: code.toUpperCase(), name: trimmedName })
      ).unwrap();

      dispatch(
        addToast({
          id: String(Date.now()),
          type: "success",
          message: `Chào mừng ${trimmedName} vào phòng chơi!`,
        })
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg =
        typeof err === "string" ? getErrorMessage(err) : "Không thể tham gia phòng.";
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
    <div
      className={`mx-auto w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-sm sm:p-8 ${className}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form header */}
        <div className="border-b border-neutral-800 pb-4 text-center">
          <span className="inline-block rounded-md border border-amber-800/60 bg-amber-950/40 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
            PHÒNG: {code.toUpperCase()}
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-neutral-100">
            Nhập tên tham gia
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            Bạn đang truy cập phòng qua liên kết. Vui lòng chọn tên để bắt đầu.
          </p>
        </div>

        {/* Error alert box */}
        {errorMessage && (
          <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3.5 text-xs font-medium text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Field: Player Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
            <label htmlFor="direct-player-name">Tên của bạn</label>
            <span className="font-mono text-neutral-400">
              {name.trim().length} / 24
            </span>
          </div>
          <input
            id="direct-player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên hiển thị (2 - 24 ký tự)"
            maxLength={24}
            disabled={isLoading}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 transition-colors focus:border-amber-500 focus:outline-none disabled:opacity-50"
            autoComplete="off"
            autoFocus
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading || name.trim().length < 2}
          className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {isLoading ? "Đang tham gia..." : "Vào phòng chơi"}
        </button>
      </form>
    </div>
  );
}
