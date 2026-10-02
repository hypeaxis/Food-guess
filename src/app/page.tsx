import Link from "next/link";

// ---------------------------------------------------------------------------
// Hub Page — Main entrypoint of the application
// Plan: section 2.5 & Giai đoạn 2
// Provides Hub overview: danh sách phòng, tạo phòng, vào bằng mã
// ---------------------------------------------------------------------------

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navbar */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍲</span>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
              Food Guess
            </span>
          </div>

          <Link
            href="/dev/preview"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all"
          >
            <span>🛠️</span>
            <span>Dev Preview</span>
          </Link>
        </div>
      </header>

      {/* Hero & Hub Placeholder */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Giai đoạn 0: Khởi tạo dự án hoàn tất
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Đoán Món Ăn Realtime
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed">
            Game show đoán tên món ăn qua hình ảnh cực vui cùng bạn bè. Hỗ trợ tối đa 50 người chơi trong một phòng với bảng xếp hạng realtime.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              href="/dev/preview"
              className="px-6 py-3 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-lg shadow-amber-500/20 transition-all"
            >
              Mở Dev Preview (4 Phase) →
            </Link>
          </div>
        </section>

        {/* Feature Cards Grid (Phase Roadmap) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="text-2xl">⚡</div>
            <h3 className="font-bold text-white text-base">Hạ tầng Realtime</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Socket.IO v4 singleton, kết nối server tự động reconnect và resume phiên chơi khi F5 hoặc chuyển mạng.
            </p>
            <div className="text-[11px] font-semibold text-amber-400">Giai đoạn 1</div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="text-2xl">🎮</div>
            <h3 className="font-bold text-white text-base">Hub & Tạo phòng</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Duyệt danh sách phòng tự động cập nhật mỗi 5 giây, tạo phòng tuỳ chỉnh số vòng và thời gian trả lời.
            </p>
            <div className="text-[11px] font-semibold text-neutral-400">Giai đoạn 2</div>
          </div>

          <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
            <div className="text-2xl">🏆</div>
            <h3 className="font-bold text-white text-base">4 Màn hình chơi</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Lobby chờ, đoán ảnh món ăn với bộ đếm ngược, công bố đáp án vòng, và bục vinh danh quán quân.
            </p>
            <div className="text-[11px] font-semibold text-neutral-400">Giai đoạn 3 - 6</div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-6 text-center text-xs text-neutral-500">
        Food Guess Frontend — Next.js 16 • Redux Toolkit • Socket.IO Client • Tailwind CSS 4
      </footer>
    </div>
  );
}
