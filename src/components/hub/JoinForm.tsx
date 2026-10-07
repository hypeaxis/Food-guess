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
      className={`flex flex-col gap-5 rounded-xl border border-border-subtle bg-surface-card p-6 shadow-md backdrop-blur-sm sm:p-8 ${className}`}
    >
      {/* Form header */}
      <div className="border-b border-border-subtle pb-4">
        <h2 className="text-lg font-bold tracking-tight text-on-surface sm:text-xl">
          Vào phòng bằng mã
        </h2>
        <p className="mt-1 text-xs text-on-surface-variant">
          Nhập mã phòng và tên hiển thị để tham gia tranh tài
        </p>
      </div>

      {/* Error alert box */}
      {errorMessage && (
        <div className="rounded-lg border border-rose-border bg-rose-bg p-3 font-mono text-xs font-medium text-rose-text">
          [ CẢNH BÁO: {errorMessage} ]
        </div>
      )}

      {/* Field 1: Room Code */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <label htmlFor="join-code" className="text-on-surface-variant font-semibold uppercase">
            MÃ PHÒNG ({code.length}/6)
          </label>
          <span className="text-primary-container text-[11px] font-bold">
            [ BẮT BUỘC ]
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
          className="w-full rounded-lg border border-border-subtle bg-surface-sub px-4 py-3 text-center font-mono text-2xl font-bold uppercase tracking-widest text-primary-container placeholder:text-surface-variant outline-none transition-all focus:border-primary-container focus:bg-surface-container-low disabled:opacity-50 sm:text-3xl"
          autoComplete="off"
        />
        <span className="font-mono text-[11px] text-on-surface-variant">
          Mã phòng gồm 6 ký tự chữ hoa và số
        </span>
      </div>

      {/* Field 2: Player Name */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-xs">
          <label htmlFor="join-name" className="text-on-surface-variant font-semibold uppercase">
            TÊN CỦA BẠN
          </label>
          <span className="text-on-surface-variant">
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
          className="w-full rounded-lg border border-border-subtle bg-surface-sub px-4 py-2.5 text-sm text-on-surface placeholder:text-surface-variant outline-none transition-all focus:border-primary-container focus:bg-surface-container-low disabled:opacity-50"
          autoComplete="off"
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center gap-3 pt-1">
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
          disabled={isLoading || code.trim().length !== 6 || name.trim().length < 2}
          className="flex-1 rounded-lg bg-primary-container px-4 py-3 font-mono text-sm font-bold tracking-wider text-on-primary-container shadow-sm transition-all hover:bg-brand-amber-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-neutral-500"
        >
          {isLoading ? "[ ĐANG VÀO PHÒNG... ]" : "[ VÀO PHÒNG ]"}
        </button>
      </div>

      {/* Fast Config Snapshot Display */}
      <div className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
          <span>[ CẤU HÌNH PHÒNG MẶC ĐỊNH ]</span>
          <span className="text-emerald-text">[ HỆ THỐNG SẴN SÀNG ]</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <div className="rounded border border-border-subtle bg-surface-card p-2.5">
            <div className="text-[10px] uppercase text-on-surface-variant">Số vòng đấu</div>
            <div className="mt-0.5 text-base font-bold text-primary">10 VÒNG</div>
          </div>
          <div className="rounded border border-border-subtle bg-surface-card p-2.5">
            <div className="text-[10px] uppercase text-on-surface-variant">Thời gian đoán</div>
            <div className="mt-0.5 text-base font-bold text-emerald-text">30S / LƯỢT</div>
          </div>
        </div>
      </div>
    </form>
  );
}
