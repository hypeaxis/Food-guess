# 📋 Báo Cáo Rà Soát & Đánh Giá Toàn Diện Dự Án (Phase 0 ➔ Phase 4)

> **Dự án:** Food Guess Frontend (Next.js 16 App Router + Redux Toolkit + Socket.IO)  
> **Thời điểm review:** 08/10/2026 — 09:35 (Giờ địa phương)  
> **Phạm vi đánh giá:** Kiểm tra toàn diện toàn bộ các module và tính năng đã triển khai từ Giai đoạn 0 đến Giai đoạn 4  
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
| **Phase 5** | Round Reveal & Finished | Hiển thị đáp án, điểm & streak cá nhân, kết quả toàn phòng, bảng xếp hạng chung cuộc, thunk `nextRound`, `rematch` | ⏳ *Kế tiếp* | Đã chuẩn bị sẵn luồng chuyển tiếp |
| **Phase 6** | Chatbox & Hoàn thiện | Chatbox realtime (`chat:send`, `chat:message`), xử lý rate limit (5 msg/10s), kiểm tra whitelist GIF, responsive mobile | ⏳ *Chưa làm* | Theo lộ trình |

---

## 2. RÀ SOÁT CHI TIẾT TỪNG TẦNG KIẾN TRÚC

### 2.1. Tầng Dữ liệu & Quản lý State (Redux Toolkit & RTK Query)
- **Hệ thống Redux Slices ([src/store/slices/](file:///d:/project/Food-guess/src/store/slices)):**
  - `connectionSlice`: Quản lý 5 trạng thái kết nối (`idle`, `connecting`, `connected`, `reconnecting`, `error`, `waking`).
  - `sessionSlice`: Quản lý vòng đời người chơi (`idle`, `resuming`, `needsName`, `joining`, `joined`).
  - `roomSlice`: Lưu trữ snapshot mới nhất từ máy chủ theo nguyên tắc immutable replace, không merge state cũ, theo dõi `closedReason`.
  - `chatSlice`: Lưu trữ mảng tin nhắn chat, hỗ trợ thêm tin nhắn mới từ sự kiện `chat:message`.
  - `uiSlice`: Quản lý hàng đợi thông báo toast tạm thời, tự động đóng sau 4 giây.
- **Tối ưu hóa Redux Selectors ([src/store/selectors.ts](file:///d:/project/Food-guess/src/store/selectors.ts)):**
  - Triệt tiêu hoàn toàn nguy cơ render loop bằng các mảng rỗng tĩnh đóng băng:
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
- **Danh mục Thunks Đã Hoàn Thiện ([src/store/thunks/](file:///d:/project/Food-guess/src/store/thunks)):**
  1. `resumeRoom`: Khôi phục phiên từ `localStorage`, có condition guard chống chạy lặp song song.
  2. `joinRoom`: Gửi `room:join`, lưu storage và cập nhật snapshot.
  3. `createRoom`: Gửi `room:create`, lưu storage và chuyển hướng vào phòng.
  4. `leaveRoom`: Gửi `room:leave`, luôn dọn dẹp sạch sẽ `session`, `room`, `chat` và `localStorage` kể cả khi ack lỗi.
  5. `startGame`: Gửi `food-guess:start` (Host only).
  6. `submitAnswer`: Gửi `food-guess:answer`, tự động kích hoạt toast thông báo điểm, chuỗi combo hoặc cảnh báo sai.
  7. `skipRound`: Gửi `food-guess:skip` (Host only).

---

### 2.3. Tầng Giao diện & Trải nghiệm Người dùng (UI/UX)
- **100% Tuân thủ Quy chuẩn Text-only UI:**
  - Không sử dụng icon bên ngoài hay emoji. Mọi trạng thái và hành động đều được thể hiện qua các khối bracket text font monospace sắc nét:
    `[ SẢNH CHỜ ]`, `[ ĐANG TRANH TÀI ]`, `[ TRỰC TUYẾN ]`, `[ NGOẠI TUYẾN ]`, `[ CHỦ PHÒNG ]`, `[ BẮT ĐẦU VÁN CHƠI ]`, `[ GỬI ĐÁP ÁN ]`, `[ HẾT GIỜ ]`.
- **Hệ thống Design Tokens Dark Mode ([src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css)):**
  - Màu nền: `canvas-base` (`#0a0a0a`), `surface-card` (`#171717`), `surface-sub` (`#0f0f0f`).
  - Màu viền: `border-subtle` (`#262626`), `border-interactive` (`#404040`).
  - Màu điểm nhấn: `primary-container` (`#f59e0b`), `badge-amber`, `emerald` (trực tuyến / đúng), `rose` (hủy / sai / hết giờ).
- **Bộ Component Gameplay ([src/components/playing/](file:///d:/project/Food-guess/src/components/playing)):**
  - `GuessTimer.tsx`: Đếm ngược dựa trên `deadlineAt` của máy chủ, thanh progress co lại mượt mà, chuyển cảnh báo đỏ nhấp nháy khi `<= 5s`.
  - `PlayingHeader.tsx`: Thống kê tiến độ vòng và số người nộp bài, tích hợp nút skip cho Host.
  - `FoodDisplay.tsx`: Tỉ lệ cố định `aspect-square`, skeleton loading khi tải và ảnh dự phòng khi lỗi.
  - `GuessInput.tsx`: Khóa input ngay khi gửi, khi `viewerAnswered === true` (áp dụng cả khi F5 sau khi đã nộp), hoặc khi hết giờ.
  - `SuggestionChips.tsx`: 3 gợi ý món ăn, bấm là gửi ngay lập tức.
  - `ScoreFeed.tsx`: Bảng tin realtime các người chơi đoán đúng từ `foodGuessEvents`.
  - `PlayingView.tsx`: Bố cục 2 cột cân đối và tích hợp bảng điểm phòng thi trực tiếp.

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
=> Compiled successfully in 969ms
=> Finished TypeScript in 1.9s
=> Generating static pages (5/5) in 373ms
=> Route (app):
   ○ /              (Static - Hub)
   ○ /_not-found    (Static)
   ○ /dev/preview   (Static - Dev Preview)
   ƒ /room/[code]   (Dynamic - Room / Lobby / Playing)
=> Exit code: 0 (Thành công 100%)
```

---

## 4. KẾ HOẠCH BƯỚC TIẾP THEO (GIAI ĐOẠN 5)

Mọi nền tảng từ **Phase 0 đến Phase 4 đã hoàn thành vững chắc**. Khi bạn sẵn sàng, chúng ta có thể bước vào **Giai đoạn 5 (Round Reveal & Finished)**:
1. **Màn hình Round Reveal (Tổng kết vòng):**
   - Hiển thị tên món ăn chính thức `foodName` và ảnh chuẩn `resourceUrl`.
   - Hiển thị điểm số đạt được và chuỗi combo của người chơi.
   - Bảng kết quả vòng thi của cả phòng (`results`).
   - Đếm ngược 5 giây tự động qua vòng (nếu `autoNextRound === true`) hoặc nút `[ VÒNG TIẾP THEO ]` của Host (nếu `autoNextRound === false`).
2. **Màn hình Finished (Kết thúc toàn trận):**
   - Bảng vàng vinh danh top 1, 2, 3 nổi bật.
   - Lịch sử chi tiết các vòng thi từ `foodGuessPastResults`.
   - Nút `[ CHƠI LẠI VÁN MỚI (REMATCH) ]` của Host.
