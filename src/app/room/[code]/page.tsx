"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resumeRoom, leaveRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { socket } from "@/lib/socket";
import { NameForm } from "@/components/room";
import { LobbyView } from "@/components/lobby";
import {
  selectSessionStatus,
  selectSnapshot,
  selectIsHost,
  selectClosedReason,
  selectPhase,
} from "@/store/selectors";

// ---------------------------------------------------------------------------
// Dynamic Room Page: /room/[code]
// Phase 3: Resume room check, NameForm on needsName, LobbyView when joined
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
  const isHost = useAppSelector(selectIsHost);
  const closedReason = useAppSelector(selectClosedReason);
  const phase = useAppSelector(selectPhase);

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-base p-4 text-center text-on-surface">
        <div className="max-w-md space-y-3 rounded-2xl border border-border-subtle bg-surface-card p-8 shadow-2xl backdrop-blur-md">
          <span className="inline-block rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
            PHÒNG: {code}
          </span>
          <h1 className="font-mono text-lg font-bold uppercase tracking-tight text-on-surface">
            [ ĐANG KIỂM TRA PHIÊN CHƠI... ]
          </h1>
          <p className="font-mono text-xs text-on-surface-variant leading-relaxed">
            Đang tìm kiếm thông tin phiên chơi đã lưu trên thiết bị để khôi phục tự động.
          </p>
        </div>
      </main>
    );
  }

  // State 2: Needs player name (Direct link visitor or session expired)
  if (sessionStatus === "needsName") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-base p-4 text-on-surface">
        <NameForm code={code} />
      </main>
    );
  }

  // State 3: Joining in progress
  if (sessionStatus === "joining") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-canvas-base p-4 text-center text-on-surface">
        <div className="max-w-md space-y-3 rounded-2xl border border-border-subtle bg-surface-card p-8 shadow-2xl backdrop-blur-md">
          <span className="inline-block rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
            PHÒNG: {code}
          </span>
          <h1 className="font-mono text-lg font-bold uppercase tracking-tight text-on-surface">
            [ ĐANG THAM GIA VÀO PHÒNG... ]
          </h1>
          <p className="font-mono text-xs text-on-surface-variant leading-relaxed">
            Đang xác thực thông tin và đồng bộ trạng thái phòng từ máy chủ.
          </p>
        </div>
      </main>
    );
  }

  // State 4: Joined successfully (Phase 3 Lobby View or Active Gameplay)
  return (
    <div className="flex min-h-screen flex-col bg-canvas-base text-on-surface font-sans selection:bg-primary-container/30 selection:text-primary-container">
      {/* Room Header */}
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-canvas-base/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-primary-container sm:text-lg">
              PHÒNG: {code}
            </span>
            <span className="rounded border border-border-subtle bg-surface-sub px-2.5 py-0.5 font-mono text-xs text-on-surface-variant">
              {phase === "lobby"
                ? "[ SẢNH CHỜ ]"
                : phase === "playing"
                ? "[ ĐANG TRANH TÀI ]"
                : phase === "roundReveal"
                ? "[ TỔNG KẾT VÒNG ]"
                : phase === "finished"
                ? "[ KẾT THÚC ]"
                : `[ GIAI ĐOẠN: ${phase ?? "ĐANG TẢI"} ]`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 cursor-pointer"
            >
              [ RỜI PHÒNG ]
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {snapshot && (!phase || phase === "lobby") ? (
          <LobbyView
            code={code}
            snapshot={snapshot}
            isHost={isHost}
            onLeaveRoom={handleLeaveRoom}
            closedReason={closedReason}
            onDismissClosedRoom={handleLeaveRoom}
          />
        ) : snapshot && phase === "playing" ? (
          <div className="flex flex-col gap-6">
            <section className="rounded-2xl border border-badge-amber-border bg-surface-card p-8 text-center shadow-xl">
              <span className="rounded border border-badge-amber-border bg-badge-amber-bg px-2.5 py-1 font-mono text-xs font-bold text-badge-amber-text">
                [ VÒNG {snapshot.foodGuessRound?.roundNumber ?? 1} / {snapshot.config?.totalRounds ?? 10} ]
              </span>
              <h2 className="mt-3 font-mono text-xl font-bold uppercase tracking-tight text-on-surface">
                [ VÁN ĐẤU ĐÃ BẮT ĐẦU ]
              </h2>
              <p className="mt-2 font-mono text-xs text-on-surface-variant">
                Màn hình câu hỏi đoán món ăn đang được khởi tạo. Sẵn sàng cho Giai đoạn 4 (Playing)!
              </p>
            </section>
          </div>
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <span className="font-mono text-xs text-on-surface-variant animate-pulse">
              [ ĐANG ĐỒNG BỘ TRẠNG THÁI TỪ MÁY CHỦ... ]
            </span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 text-center font-mono text-xs text-on-surface-variant">
        FOOD GUESS KERNEL v2.4 // GIAI ĐOẠN 3: SẢNH CHỜ THI ĐẤU
      </footer>
    </div>
  );
}
