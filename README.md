# Food Guess — Realtime Multiplayer Web Game (Frontend)

Game show đoán tên món ăn qua hình ảnh realtime nhiều người chơi (hỗ trợ tối đa 50 người/phòng).

## 🚀 Công nghệ sử dụng

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Ngôn ngữ:** TypeScript 5
- **Giao diện & Styling:** Tailwind CSS 4
- **State Management:** Redux Toolkit & React-Redux
- **Realtime Networking:** Socket.IO Client v4

## 📦 Bắt đầu phát triển

1. Cài đặt dependencies:
```bash
npm install
```

2. Khởi chạy development server:
```bash
npm run dev
```

3. Mở trình duyệt:
- **Trang chủ (Hub):** [http://localhost:3000](http://localhost:3000)
- **Chế độ Dev Preview (Xem 4 Phase):** [http://localhost:3000/dev/preview](http://localhost:3000/dev/preview)

## 📁 Cấu trúc thư mục

```
src/
├── app/
│   ├── dev/preview/page.tsx    # Chế độ xem trước 4 phase & test bench FoodImage
│   ├── room/[code]/page.tsx    # Dynamic route cho phòng chơi ("use client")
│   ├── layout.tsx              # StoreProvider, font Geist, metadata
│   ├── page.tsx                # Trang chủ (Hub game)
│   └── globals.css             # Tailwind CSS tokens & dark theme
├── components/
│   ├── hub/                    # RoomList, RoomCard, CreateRoomForm, JoinForm
│   ├── room/                   # RoomView, ConnectionBanner, NameForm
│   ├── lobby/                  # Màn hình phòng chờ (LobbyView, PlayerList, HostControls)
│   ├── playing/                # Màn hình chơi (GuessInput, SuggestionChips)
│   ├── reveal/                 # Màn hình công bố đáp án (RoundResult)
│   ├── finished/               # Màn hình kết thúc (Podium, FinalLeaderboard)
│   └── shared/                 # FoodImage, GuessTimer, ChatBox...
├── store/
│   ├── slices/                 # connection, session, room, chat, ui
│   ├── api/                    # RTK Query (GET /api/rooms)
│   ├── thunks/                 # roomThunks, gameThunks, chatThunks
│   ├── index.ts                # makeStore
│   ├── StoreProvider.tsx       # Client wrapper (React 19 compliant)
│   ├── hooks.ts                # useAppDispatch, useAppSelector
│   └── selectors.ts            # Shared narrow selectors
├── lib/
│   ├── config.ts               # API_URL từ NEXT_PUBLIC_API_URL
│   └── index.ts                # Barrel export lib
├── mocks/                      # Snapshots mẫu 4 phase, room summaries, chat
└── types/                      # Toàn bộ hợp đồng TypeScript BE ↔ FE
```

## 🛠️ Lệnh kiểm tra chất lượng mã nguồn

- **Kiểm tra TypeScript:** `npx tsc --noEmit`
- **Lint mã nguồn:** `npm run lint`
- **Build production bundle:** `npm run build`
