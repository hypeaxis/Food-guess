"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resumeRoom, leaveRoom } from "@/store/thunks/roomThunks";
import { connectSocketAction } from "@/store/socketMiddleware";
import { socket } from "@/lib/socket";
import { NameForm, RoomNavbar, RoomLoadingCard } from "@/components/room";
import { LobbyView, RoomClosedModal } from "@/components/lobby";
import { PlayingView } from "@/components/playing";
import { RevealView } from "@/components/reveal";
import { FinishedView } from "@/components/finished";
import { ChatDrawer } from "@/components/chat";
import {
  selectSessionStatus,
  selectSnapshot,
  selectIsHost,
  selectClosedReason,
  selectPhase,
} from "@/store/selectors";

// ---------------------------------------------------------------------------
// Dynamic Room Page: /room/[code] (SRP Phase Coordinator)
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

  // State 1: Resuming / Initial checking (OCP & SRP)
  if (sessionStatus === "resuming" || sessionStatus === "idle") {
    return (
      <RoomLoadingCard
        code={code}
        title="[ ĐANG KIỂM TRA PHIÊN CHƠI... ]"
        description="Đang tìm kiếm thông tin phiên chơi đã lưu trên thiết bị để khôi phục tự động."
      />
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

  // State 3: Joining in progress (OCP & SRP)
  if (sessionStatus === "joining") {
    return (
      <RoomLoadingCard
        code={code}
        title="[ ĐANG THAM GIA VÀO PHÒNG... ]"
        description="Đang xác thực thông tin và đồng bộ trạng thái phòng từ máy chủ."
      />
    );
  }

  // State 4: Joined successfully (Phase-based rendering)
  return (
    <div className="flex min-h-screen flex-col bg-canvas-base text-on-surface font-sans selection:bg-primary-container/30 selection:text-primary-container">
      {/* Room Header (SRP & ISP) */}
      <RoomNavbar code={code} phase={phase} onLeaveRoom={handleLeaveRoom} />

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
          <PlayingView snapshot={snapshot} isHost={isHost} />
        ) : snapshot && phase === "roundReveal" ? (
          <RevealView snapshot={snapshot} isHost={isHost} />
        ) : snapshot && phase === "finished" ? (
          <FinishedView
            snapshot={snapshot}
            isHost={isHost}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center">
            <span className="font-mono text-xs text-on-surface-variant animate-pulse">
              [ ĐANG ĐỒNG BỘ TRẠNG THÁI TỪ MÁY CHỦ... ]
            </span>
          </div>
        )}
      </main>

      {/* Closed Room Alert Modal when not in Lobby */}
      {phase !== "lobby" && (
        <RoomClosedModal
          isOpen={Boolean(closedReason || snapshot?.closedReason)}
          reason={closedReason || snapshot?.closedReason}
          onConfirm={handleLeaveRoom}
        />
      )}

      {/* Floating Chat Drawer — accessible across all phases */}
      <ChatDrawer />

      {/* Footer */}
      <footer className="border-t border-border-subtle py-4 text-center font-mono text-xs text-on-surface-variant">
        FOOD GUESS // PHÒNG: {code} • ĐỒNG BỘ THỜI GIAN THỰC
      </footer>
    </div>
  );
}
