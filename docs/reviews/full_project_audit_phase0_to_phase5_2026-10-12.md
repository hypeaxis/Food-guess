# 📋 Báo Cáo Rà Soát & Đánh Giá Toàn Diện Dự Án (Phase 0 ➔ Phase 5)

> **Dự án:** Food Guess Frontend (Next.js 16 App Router + Redux Toolkit + Socket.IO)  
> **Thời điểm review:** 12/10/2026 — 08:30 (Giờ địa phương)  
> **Phạm vi đánh giá:** Kiểm tra toàn diện toàn bộ các module và tính năng đã triển khai từ Giai đoạn 0 đến Giai đoạn 5  
> **Tình trạng tổng thể:** ✅ Đạt chuẩn 100% về TypeScript (`0 lỗi`), ESLint (`0 warning, 0 error`), Next.js Turbopack Build (`Exit Code: 0`)

---

## 1. BẢNG MA TRẬN TIẾN ĐỘ TỔNG THỂ DỰ ÁN

| Giai đoạn | Tên Module | Phạm vi & Tính năng đã hoàn thiện | Trạng thái | Đánh giá kỹ thuật |
|---|---|---|:---:|---|
| **Phase 0** | Khởi tạo & Kiến trúc lõi | Cấu hình Next.js 16, Redux Toolkit (5 slices), Types contract, Mock data, Design Tokens, fix render cascade `FoodImage` & `selectors` | ✅ Hoàn thành | Chuẩn React 19, không re-render thừa |
| **Phase 1** | Hạ tầng Socket & Session | Socket singleton (Render cold-start safe), Redux middleware (chống StrictMode duplicate), localStorage session, Reconnect & auto-resume, `ConnectionBanner` | ✅ Hoàn thành | Reconnect ổn định, listener duy nhất |
| **Phase 2** | Sảnh Hub & Tạo/Vào phòng | RTK Query 5s polling (`roomsApi`), `RoomList` & `RoomCard` (progress lấp đầy, badge), `CreateRoomForm`, `JoinForm`, `NameForm`, `ToastContainer` | ✅ Hoàn thành | Form validation chặt chẽ, text-only |
| **Phase 3** | Sảnh chờ Lobby & Host | Thunk `startGame`, `RoomConfigCard` (copy link fallback), `PlayerCard` & `PlayerList` (memoized), `HostControls`, `RoomClosedModal`, `LobbyView`, `leaveRoom` | ✅ Hoàn thành | Tối ưu 50 người chơi, quản lý phòng đóng |
| **Phase 4** | Gameplay Đoán Món Ăn | Thunk `submitAnswer` (toast điểm & combo), `skipRound`, `GuessTimer` (chính xác theo `deadlineAt`), `FoodDisplay`, `GuessInput`, `SuggestionChips`, `ScoreFeed`, `PlayingView` | ✅ Hoàn thành | Khóa input chống spam, feed realtime |
| **Phase 5** | Round Reveal & Finished | Hiển thị đáp án `foodName` & ảnh gốc `resourceUrl`, điểm & combo cá nhân, bảng điểm vòng `RoundResultsTable`, bục Top 3 `PodiumLeaderboard`, bảng tổng sắp `FinalLeaderboard`, lịch sử `PastRoundsAccordion`, thunk `nextRound`, `rematch` | ✅ Hoàn thành | Vòng đời trận đấu hoàn chỉnh 100% |
| **Phase 6** | Chatbox & Hoàn thiện | Chatbox realtime (`chat:send`, `chat:message`), xử lý rate limit (5 msg/10s), kiểm tra whitelist GIF, responsive mobile | ⏳ *Sẵn sàng làm* | Đã có kế hoạch chi tiết (`docs/phase6_plan.md`) |

---

## 2. RÀ SOÁT CHI TIẾT TỪNG TẦNG KIẾN TRÚC

### 2.1. Tầng Dữ liệu & Quản lý State (Redux Toolkit & RTK Query)
- **Hệ thống Redux Slices ([src/store/slices/](file:///d:/project/Food-guess/src/store/slices)):**
  - `connectionSlice`: Quản lý 5 trạng thái kết nối (`idle`, `connecting`, `connected`, `reconnecting`, `error`, `waking`).
  - `sessionSlice`: Quản lý vòng đời người chơi (`idle`, `resuming`, `needsName`, `joining`, `joined`).
  - `roomSlice`: Lưu trữ snapshot mới nhất từ máy chủ theo nguyên tắc immutable replace, không merge state cũ, theo dõi `closedReason`.
  - `chatSlice`: Lưu trữ mảng tin nhắn chat (giới hạn 200 tin gần nhất), hỗ trợ thêm tin mới từ sự kiện `chat:message`.
  - `uiSlice`: Quản lý hàng đợi thông báo toast tạm thời, tự động đóng sau 4 giây.
- **Tối ưu hóa Redux Selectors ([src/store/selectors.ts](file:///d:/project/Food-guess/src/store/selectors.ts)):**
  - Triệt tiêu hoàn toàn nguy cơ render cascade bằng các mảng rỗng tĩnh đóng băng:
    ```typescript
    const EMPTY_PARTICIPANTS: never[] = [];
    const EMPTY_SCORE_EVENTS: never[] = [];
    const EMPTY_PAST_RESULTS: never[] = [];
    ```
- **RTK Query Polling ([src/store/api/roomsApi.ts](file:///d:/project/Food-guess/src/store/api/roomsApi.ts)):**
  - Endpoint `GET /api/rooms` polling 5000ms một lần.
  - Cấu hình `skipPollingIfUnfocused: true` giúp tạm dừng gọi API khi người dùng chuyển sang tab khác để tiết kiệm tài nguyên mạng và pin thiết bị.
  - Cấu hình `keepUnusedDataFor: 0` đảm bảo không lưu cache cũ khi rời sảnh Hub.

---

### 2.2. Tầng Mạng & Đồng bộ Thời gian thực (Socket.IO)
- **Singleton Client ([src/lib/socket.ts](file:///d:/project/Food-guess/src/lib/socket.ts)):**
  - `autoConnect: false`: Vòng đời kết nối do Redux điều khiển hoàn toàn, không kết nối ngầm khi render SSR.
  - `timeout: 30000ms`: Phù hợp với đặc thù máy chủ Render free tier (cần thời gian đánh thức khi cold start).
  - `reconnectionAttempts: 10`, `reconnectionDelay: 1000ms`.
  - Hỗ trợ fallback: `transports: ["websocket", "polling"]`.
- **Socket Middleware ([src/store/socketMiddleware.ts](file:///d:/project/Food-guess/src/store/socketMiddleware.ts)):**
  - Sử dụng cờ `isInitialized` đảm bảo các listener (`room:snapshot`, `chat:message`, `connect`, `disconnect`) chỉ được gán đúng 1 lần duy nhất, kháng hoàn toàn hành vi mount hai lần của React StrictMode.
  - Tự động kích hoạt lại `resumeRoom` khi socket kết nối lại sau khi rớt mạng.
- **Promise Wrapper ([src/lib/emitWithAck.ts](file:///d:/project/Food-guess/src/lib/emitWithAck.ts)):**
  - Biến đổi socket callback thành Promise có định kiểu TypeScript.
  - Có safety timeout 10s ngăn chặn treo Promise nếu máy chủ không phản hồi.
  - Bắt lỗi qua class tùy chỉnh `SocketAckError` và ánh xạ sang 13 thông điệp tiếng Việt thân thiện ([src/lib/errors.ts](file:///d:/project/Food-guess/src/lib/errors.ts)).
- **Danh mục 9 Thunks Đã Hoàn Thiện ([src/store/thunks/](file:///d:/project/Food-guess/src/store/thunks)):**
  1. `resumeRoom`: Khôi phục phiên từ `localStorage`, có condition guard chống chạy lặp song song.
  2. `joinRoom`: Gửi `room:join`, lưu storage và cập nhật snapshot.
  3. `createRoom`: Gửi `room:create`, lưu storage và chuyển hướng vào phòng.
  4. `leaveRoom`: Gửi `room:leave`, luôn dọn dẹp sạch sẽ `session`, `room`, `chat` và `localStorage` kể cả khi ack lỗi.
  5. `startGame`: Gửi `food-guess:start` (Host only).
  6. `submitAnswer`: Gửi `food-guess:answer`, tự động kích hoạt toast thông báo điểm, chuỗi combo hoặc cảnh báo sai.
  7. `skipRound`: Gửi `food-guess:skip` (Host only).
  8. `nextRound`: Gửi `food-guess:next` (Host only).
  9. `rematch`: Gửi `food-guess:rematch` (Host only).

---

### 2.3. Tầng Giao diện & Trải nghiệm Người dùng (UI/UX)
- **100% Tuân thủ Quy chuẩn Text-only UI:**
  - Không sử dụng bất kỳ icon bên ngoài hay emoji nào. Mọi trạng thái và hành động đều được thể hiện qua các khối bracket text font monospace sắc nét:
    `[ SẢNH CHỜ ]`, `[ ĐANG TRANH TÀI ]`, `[ TỔNG KẾT VÒNG ]`, `[ KẾT THÚC ]`, `[ VÔ ĐỊCH - HẠNG 1 ]`, `[ Á QUÂN - HẠNG 2 ]`, `[ QUÝ QUÂN - HẠNG 3 ]`, `[ CHƠI LẠI TRẬN MỚI (REMATCH) ]`.
- **Hệ thống Design Tokens Dark Mode ([src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css)):**
  - Màu nền: `canvas-base` (`#0a0a0a`), `surface-card` (`#171717`), `surface-sub` (`#0f0f0f`).
  - Màu viền: `border-subtle` (`#262626`), `border-interactive` (`#404040`).
  - Màu điểm nhấn: `primary-container` (`#f59e0b`), `badge-amber`, `emerald` (trực tuyến / đúng), `rose` (hủy / sai / hết giờ).
- **Bộ Component Đã Hoàn Thiện:**
  - **Sảnh Hub ([src/components/hub/](file:///d:/project/Food-guess/src/components/hub)):** `CreateRoomForm`, `JoinForm`, `RoomCard`, `RoomList`.
  - **Sảnh Chờ Lobby ([src/components/lobby/](file:///d:/project/Food-guess/src/components/lobby)):** `LobbyView`, `RoomConfigCard`, `PlayerCard`, `PlayerList`, `HostControls`, `RoomClosedModal`.
  - **Màn Chơi Gameplay ([src/components/playing/](file:///d:/project/Food-guess/src/components/playing)):** `GuessTimer`, `PlayingHeader`, `FoodDisplay`, `GuessInput`, `SuggestionChips`, `ScoreFeed`, `PlayingView`.
  - **Màn Công Bố Đáp Án ([src/components/reveal/](file:///d:/project/Food-guess/src/components/reveal)):** `AnswerDisplay`, `ViewerRoundSummary`, `RoundResultsTable`, `RevealControls`, `RevealView`.
  - **Màn Kết Thúc Trận ([src/components/finished/](file:///d:/project/Food-guess/src/components/finished)):** `PodiumLeaderboard`, `FinalLeaderboard`, `PastRoundsAccordion`, `FinishedControls`, `FinishedView`.
  - **Trang Xem Thử & Kiểm Thử ([src/app/dev/preview/page.tsx](file:///d:/project/Food-guess/src/app/dev/preview/page.tsx)):** Đầy đủ cả 4 phase thực tế, chuyển đổi vai trò Host / Người chơi và giả lập mạng.

---

## 3. KẾT QUẢ KIỂM THỬ KỸ THUẬT TOÀN BỘ CODEBASE

```bash
# 1. Kiểm tra Type-Safety (TypeScript Compiler)
$ npx tsc --noEmit
=> Exit code: 0 (0 lỗi)

# 2. Kiểm tra Quy chuẩn Code (ESLint)
$ npm run lint
=> Exit code: 0 (0 warning, 0 error)

# 3. Kiểm tra Biên dịch Production (Next.js Turbopack)
$ npm run build
▲ Next.js 16.3.8 (Turbopack)
✓ Compiled successfully in 9.2s
  Running TypeScript ...
  Finished TypeScript in 1909ms
✓ Generating static pages (5/5) in 321ms

Route (app)
┌ ○ /              (Static - Hub)
├ ○ /_not-found    (Static)
├ ○ /dev/preview   (Static - Dev Preview)
└ ƒ /room/[code]   (Dynamic - Room App)

=> Exit code: 0 (Thành công 100%)
```

---

## 4. KẾ HOẠCH BƯỚC TIẾP THEO (GIAI ĐOẠN 6)

Hiện tại toàn bộ vòng đời ván chơi đã hoàn thành. Bước tiếp theo là **Giai đoạn 6 (Chatbox, Xử lý lỗi & Tối ưu UX)** theo [docs/phase6_plan.md](file:///d:/project/Food-guess/docs/phase6_plan.md):
1. **Thunk `sendChatMessage`:** Hỗ trợ text (1–300 ký tự) và GIF, chặn spam client rate-limit (5 tin/10s), kiểm duyệt whitelist GIF Tenor/Giphy.
2. **Bộ Component Chat (`src/components/chat/`):** `ChatMessageItem`, `ChatInput`, `ChatBox`, `ChatDrawer` (responsive mobile bottom-sheet & desktop dock).
3. **Tích hợp vào `/room/[code]`:** Cho phép chat ở mọi phase của game.
4. **Kiểm thử toàn diện.**
