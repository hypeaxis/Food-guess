"use client";

import { useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { joinRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { selectIsConnected } from "@/store/selectors";
import { addToast } from "@/store/slices/uiSlice";
import { useGetRoomsQuery } from "@/store/api";
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
  const isConnected = useAppSelector(selectIsConnected);

  // Fetch rooms list to display current room metadata in direct entry
  const { data: roomsData } = useGetRoomsQuery();
  const targetRoom = roomsData?.rooms.find(
    (r) => r.code.toUpperCase() === code.toUpperCase()
  );

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
    <div className={`mx-auto w-full max-w-lg space-y-4 ${className}`}>
      {/* Network Telemetry Status Bar */}
      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface-sub px-3.5 py-2 font-mono text-xs">
        <span
          className={
            isConnected ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"
          }
        >
          {isConnected
            ? "[ MẠNG: ĐÃ KẾT NỐI SOCKET ]"
            : "[ MẠNG: ĐANG KẾT NỐI... ]"}
        </span>
        <span className="text-on-surface-variant">PORT: 8082 // TLS_v1.3</span>
      </div>

      {/* Main Container Card with Amber Glow */}
      <div className="relative">
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-primary-container/10 blur-xl" />

        <div className="relative rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header: Room badge & Title */}
            <div className="border-b border-border-subtle pb-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
                  PHÒNG THI ĐẤU: {code.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-on-surface-variant uppercase">
                  {targetRoom?.phase === "lobby"
                    ? "ĐANG CHỜ"
                    : targetRoom?.phase === "playing"
                    ? "ĐANG CHƠI"
                    : "SẴN SÀNG"}
                </span>
              </div>
              <h1 className="text-xl font-bold uppercase tracking-tight text-on-surface sm:text-2xl">
                NHẬP TÊN THAM GIA
              </h1>
              <p className="mt-1 font-mono text-xs text-on-surface-variant">
                Bạn đang truy cập phòng qua liên kết trực tiếp. Vui lòng thiết lập danh tính.
              </p>
            </div>

            {/* Room Metadata Telemetry Block */}
            <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-sub p-3.5 font-mono text-xs">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>CHỦ PHÒNG:</span>
                <span className="font-semibold text-on-surface">
                  {targetRoom?.hostName || "Chủ phòng"}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>SĨ SỐ HIỆN TẠI:</span>
                <span className="font-semibold text-primary-container">
                  {targetRoom
                    ? `${targetRoom.participantCount} / 50 NGƯỜI CHƠI`
                    : "ĐANG CẬP NHẬT..."}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>THỂ THỨC:</span>
                <span className="text-on-surface">TIÊU CHUẨN // 10 VÒNG // 30S</span>
              </div>
            </div>

            {/* Error alert box */}
            {errorMessage && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3.5 font-mono text-xs font-medium text-rose-300">
                [ LỖI ]: {errorMessage}
              </div>
            )}

            {/* Field: Player Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-mono text-xs font-semibold uppercase tracking-wider text-on-surface">
                <label htmlFor="direct-player-name">TÊN CỦA BẠN</label>
                <span className="text-on-surface-variant">
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
                className="w-full rounded-lg border border-border-subtle bg-surface-sub px-4 py-2.5 font-mono text-sm text-on-surface placeholder:text-neutral-500 transition-colors focus:border-primary-container focus:outline-none disabled:opacity-50"
                autoComplete="off"
                autoFocus
              />
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading || name.trim().length < 2}
              className="w-full rounded-lg bg-primary-container py-3 font-mono text-sm font-bold uppercase tracking-wider text-on-primary-container transition-all hover:bg-amber-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-surface-sub disabled:text-neutral-600"
            >
              {isLoading ? "[ ĐANG THAM GIA... ]" : "[ VÀO PHÒNG CHƠI ]"}
            </button>

            {/* Navigation back */}
            <div className="pt-1 text-center">
              <Link
                href="/"
                className="font-mono text-xs text-on-surface-variant transition-colors hover:text-primary-container"
              >
                [ ← Quay lại sảnh chờ trang chủ ]
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Sub Telemetry Info */}
      <div className="text-center font-mono text-[11px] text-on-surface-variant">
        FOOD GUESS KERNEL v2.4 // PROTOCOL_ID: WS_STITCH_FOOD
      </div>
    </div>
  );
}
