"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { joinRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { addToast } from "@/store/slices/uiSlice";
import { socket } from "@/lib/socket";
import { getErrorMessage } from "@/lib/errors";

// ---------------------------------------------------------------------------
// JoinForm — Form for entering a room from the Hub by code and player name
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

export interface JoinFormProps {
  initialCode?: string;
  onSuccess?: (code: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function JoinForm({
  initialCode = "",
  onSuccess,
  onCancel,
  className = "",
}: JoinFormProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sessionStatus = useAppSelector((state) => state.session.status);

  const [code, setCode] = useState(initialCode.toUpperCase().slice(0, 6));
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isLoading = isSubmitting || sessionStatus === "joining";

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow alphanumeric characters, uppercase, max 6
    const cleanCode = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setCode(cleanCode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (cleanCode.length !== 6) {
      setErrorMessage("Mã phòng phải gồm đúng 6 ký tự chữ hoặc số.");
      return;
    }

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
        joinRoom({ code: cleanCode, name: trimmedName })
      ).unwrap();

      dispatch(
        addToast({
          id: String(Date.now()),
          type: "success",
          message: `Tham gia phòng ${cleanCode} thành công!`,
        })
      );

      if (onSuccess) {
        onSuccess(cleanCode);
      } else {
        router.push(`/room/${cleanCode}`);
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
    <form
      onSubmit={handleSubmit}
      className={`space-y-6 rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-sm sm:p-8 ${className}`}
    >
      {/* Form header */}
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-neutral-100">
          Vào phòng bằng mã
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Nhập mã phòng và tên hiển thị để tham gia tranh tài
        </p>
      </div>

      {/* Error alert box */}
      {errorMessage && (
        <div className="rounded-lg border border-rose-900/60 bg-rose-950/30 p-3.5 text-xs font-medium text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Field 1: Room Code */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <label htmlFor="join-code">Mã phòng</label>
          <span className="font-mono text-neutral-400">
            {code.length} / 6
          </span>
        </div>
        <input
          id="join-code"
          type="text"
          value={code}
          onChange={handleCodeChange}
          placeholder="VD: HA29KD"
          maxLength={6}
          disabled={isLoading}
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 font-mono text-base font-bold uppercase tracking-widest text-amber-400 placeholder-neutral-600 transition-colors focus:border-amber-500 focus:outline-none disabled:opacity-50"
          autoComplete="off"
        />
        <p className="text-[11px] text-neutral-400">
          Mã phòng gồm 6 ký tự chữ hoa và số
        </p>
      </div>

      {/* Field 2: Player Name */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <label htmlFor="join-name">Tên của bạn</label>
          <span className="font-mono text-neutral-400">
            {name.trim().length} / 24
          </span>
        </div>
        <input
          id="join-name"
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

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-2">
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
          disabled={isLoading || code.trim().length !== 6 || name.trim().length < 2}
          className="flex-1 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-neutral-950 transition-all hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          {isLoading ? "Đang vào phòng..." : "Vào phòng"}
        </button>
      </div>
    </form>
  );
}
