"use client";

import { use } from "react";

// ---------------------------------------------------------------------------
// Dynamic room page for /room/[code]
// Plan: section 2.1 & 2.5
// "Toàn bộ phòng chơi là Client Component: màn hình room/[code] dùng 'use client',
// vì phụ thuộc socket, localStorage và timer."
//
// In Next.js 15+, params is an async Promise.
// ---------------------------------------------------------------------------

type RoomPageProps = {
  params: Promise<{ code: string }>;
};

export default function RoomPage({ params }: RoomPageProps) {
  const { code } = use(params);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-neutral-950 text-white">
      <div className="w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Phòng: {code.toUpperCase()}</h1>
        <p className="text-sm text-neutral-400">
          Giao diện phòng chơi sẽ được tích hợp với RoomView theo từng phase (Lobby, Playing, Reveal, Finished).
        </p>
      </div>
    </main>
  );
}
