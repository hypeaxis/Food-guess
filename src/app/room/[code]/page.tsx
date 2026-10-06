"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resumeRoom, leaveRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { socket } from "@/lib/socket";
import { NameForm } from "@/components/room";
import {
  selectSessionStatus,
  selectSnapshot,
  selectParticipants,
  selectIsHost,
} from "@/store/selectors";
import type { Participant } from "@/types";

// ---------------------------------------------------------------------------
// Dynamic Room Page: /room/[code]
// Phase 2: Resume room check, NameForm on needsName, Joined summary view
// Rule: Text-only UI (no icons or emojis), modern Tailwind styling
// ---------------------------------------------------------------------------

type RoomPageProps = {
  params: Promise<{ code: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { code: rawCode } = use(params);
  const code = rawCode.toUpperCase();

  const sessionStatus = useAppSelector(selectSessionStatus);
  const snapshot = useAppSelector(selectSnapshot);
  const participants = useAppSelector(selectParticipants);
  const isHost = useAppSelector(selectIsHost);

  // Auto-connect and trigger resume on mount
  useEffect(() => {
    if (!socket.connected) {
      dispatch(connectSocketAction());
    }
    dispatch(resumeRoom({ code }));
  }, [code, dispatch]);

  const handleLeaveRoom = async () => {
    await dispatch(leaveRoom({ code }));
    router.push("/");
  };

  // State 1: Resuming / Initial checking
  if (sessionStatus === "resuming" || sessionStatus === "idle") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-center text-neutral-100">
        <div className="max-w-md space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md">
          <span className="inline-block rounded border border-amber-800/80 bg-amber-950/60 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
            PHÒNG: {code}
          </span>
          <h1 className="text-lg font-bold text-neutral-100">
            Đang kiểm tra phiên chơi...
          </h1>
          <p className="text-xs text-neutral-400">
            Đang tìm kiếm thông tin đăng nhập đã lưu trong máy của bạn để khôi phục tự động.
          </p>
        </div>
      </main>
    );
  }

  // State 2: Needs player name (Direct link visitor or session expired)
  if (sessionStatus === "needsName") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-neutral-100">
        <div className="w-full max-w-md space-y-4">
          <NameForm code={code} />
          <div className="text-center">
            <Link
              href="/"
              className="font-mono text-xs text-neutral-400 transition-colors hover:text-white"
            >
              [ Quay lại trang chủ ]
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // State 3: Joining in progress
  if (sessionStatus === "joining") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-4 text-center text-neutral-100">
        <div className="max-w-md space-y-3 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-8 backdrop-blur-md">
          <span className="inline-block rounded border border-amber-800/80 bg-amber-950/60 px-2.5 py-1 font-mono text-xs font-bold text-amber-400">
            PHÒNG: {code}
          </span>
          <h1 className="text-lg font-bold text-neutral-100">
            Đang tham gia vào phòng...
          </h1>
          <p className="text-xs text-neutral-400">
            Đang xác thực thông tin và tải trạng thái phòng chơi từ máy chủ.
          </p>
        </div>
      </main>
    );
  }

  // State 4: Joined successfully (Phase 2 summary view — ready for Phase 3 Lobby)
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Room Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-amber-500 sm:text-lg">
              PHÒNG: {code}
            </span>
            <span className="rounded border border-neutral-700 bg-neutral-850 px-2 py-0.5 font-mono text-xs text-neutral-300">
              {snapshot?.phase === "lobby"
                ? "Giai đoạn: Chờ bắt đầu"
                : snapshot?.phase === "playing"
                ? "Giai đoạn: Đang chơi"
                : "Giai đoạn: " + (snapshot?.phase ?? "Đang tải")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 font-mono text-xs font-semibold text-rose-400 transition-colors hover:border-rose-900 hover:bg-rose-950/40"
            >
              [ Rời phòng ]
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 space-y-6">
        {/* Room Status Banner */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-400">
                Vai trò của bạn: {isHost ? "CHỦ PHÒNG (HOST)" : "NGƯỜI THAM GIA"}
              </span>
              <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">
                Phòng chơi {code}
              </h1>
              <p className="mt-1 text-xs text-neutral-400">
                {snapshot?.config
                  ? `Cấu hình: ${snapshot.config.totalRounds} vòng thi • ${snapshot.config.answerTimeSeconds}s mỗi câu`
                  : "Đang tải cấu hình phòng..."}
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-center sm:text-right">
              <span className="block text-xs font-medium text-neutral-400">
                Sĩ số phòng
              </span>
              <span className="font-mono text-2xl font-extrabold text-neutral-100">
                {participants.length} / 50
              </span>
            </div>
          </div>

          {/* Phase 2 milestone notification */}
          <div className="mt-6 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-4 text-xs text-emerald-300">
            <span className="block font-bold uppercase tracking-wider text-emerald-400">
              Giai đoạn 2: Tạo phòng & Vào phòng đã hoàn tất thành công
            </span>
            <p className="mt-1 leading-relaxed text-neutral-300">
              Bạn đã kết nối socket và đồng bộ snapshot thành công. Giao diện sảnh chờ chi tiết (danh sách người chơi realtime, nút bắt đầu của Host, cài đặt phòng) sẽ được hoàn thiện tại Giai đoạn 3 (Lobby).
            </p>
          </div>
        </section>

        {/* Participants Table / List */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-6 backdrop-blur-sm">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-base font-bold text-neutral-100">
              Danh sách người chơi trong phòng ({participants.length})
            </h2>
            <p className="text-xs text-neutral-400">
              Dữ liệu người chơi được cập nhật trực tiếp qua socket snapshot
            </p>
          </div>

          <div className="mt-4 divide-y divide-neutral-800/80">
            {participants.map((player: Participant) => (
              <div
                key={player.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-neutral-400">
                    ID: {player.id.slice(0, 6)}
                  </span>
                  <span className="font-semibold text-neutral-200">
                    {player.name}
                  </span>
                  {player.isHost && (
                    <span className="rounded border border-amber-800/80 bg-amber-950/60 px-2 py-0.5 text-[11px] font-bold text-amber-400">
                      Chủ phòng
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span
                    className={
                      player.isOnline ? "text-emerald-400" : "text-neutral-500"
                    }
                  >
                    {player.isOnline ? "[ Trực tuyến ]" : "[ Ngoại tuyến ]"}
                  </span>
                </div>
              </div>
            ))}

            {participants.length === 0 && (
              <div className="py-6 text-center text-xs text-neutral-500">
                Chưa có dữ liệu người chơi từ server.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-4 text-center font-mono text-xs text-neutral-500">
        Food Guess — Giai đoạn 2
      </footer>
    </div>
  );
}
