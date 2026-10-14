# TỔNG HỢP KIẾN TRÚC VÀ ĐIỂM SỬ DỤNG WEBSOCKET VÀ REDUX TRONG DỰ ÁN FOOD GUESS

Tài liệu này tổng hợp toàn bộ các vị trí, vai trò và cơ chế tích hợp giữa **WebSocket (Socket.IO client)** và **Redux Toolkit (State Management)** trong dự án Food Guess Frontend.

---

## 1. Kiến trúc Tổng thể (Architecture Overview)

Dự án áp dụng mô hình kiến trúc **Phân tầng đơn hướng (Unidirectional Layered Architecture)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                       SERVER (uwu-cup.onrender.com)                    │
└──────────────────┬─────────────────────────────────▲───────────────────┘
                   │                                 │
                   │ Server Push Events              │ Client Emitter (emitWithAck)
                   │ (room:snapshot, chat:message)   │ (room:create, room:join, ...)
                   ▼                                 │
┌──────────────────────────────────────┐  ┌──────────┴───────────────────┐
│     socketMiddleware.ts              │  │      Redux Thunks            │
│  - socket.on("room:snapshot")        │  │  - roomThunks (join/create)  │
│  - socket.on("connect"/"disconnect") │  │  - gameThunks (start/answer) │
│  - Reconnect & Auto-resume           │  │  - emitWithAck Promise       │
└──────────────────┬───────────────────┘  └──────────▲───────────────────┘
                   │                                 │
                   ▼ Dispatch Actions                │ Dispatch Thunks
┌────────────────────────────────────────────────────┴───────────────────┐
│                          REDUX STORE                                   │
│  - connectionSlice (trạng thái socket, socketId, reconnectAttempt)     │
│  - roomSlice       (snapshot phòng từ máy chủ, closedReason)           │
│  - sessionSlice    (phiên người chơi, token, participantId, status)    │
│  - chatSlice       (danh sách tin nhắn realtime)                       │
│  - uiSlice         (toasts thông báo kết quả trả về từ Ack)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼ Selectors (useAppSelector)
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT UI COMPONENTS                             │
│  - Page Hub (/)                 - LobbyView (phòng chờ)                │
│  - Dynamic Page (/room/[code])  - PlayingView (đoán món)               │
│  - Connection Badge             - RevealView & FinishedView            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Chi tiết từng tầng sử dụng WebSocket & Redux

### 2.1. Tầng Socket Singleton & Utilities (`src/lib/`)

| Tệp tin | Vai trò kỹ thuật | Liên kết với Redux |
| :--- | :--- | :--- |
| [`src/lib/socket.ts`](file:///d:/project/Food-guess/src/lib/socket.ts) | Khởi tạo client Socket.IO Singleton (`io(API_URL)`). Cấu hình quan trọng:<br>- `autoConnect: false`: Ngăn socket tự kết nối ngầm khi SSR.<br>- `transports: ["websocket", "polling"]`<br>- `reconnectionAttempts: 10`, `timeout: 30000ms`. | Không trực tiếp can thiệp vào Redux; cung cấp instance `socket` duy nhất cho `socketMiddleware` và các async thunks. |
| [`src/lib/emitWithAck.ts`](file:///d:/project/Food-guess/src/lib/emitWithAck.ts) | Bọc hàm callback `socket.emit(event, payload, ack)` thành một `Promise` có timeout an toàn (10s) và ném lỗi có kiểu `SocketAckError` khi `ack.ok === false`. | Được gọi bên trong tất cả các `createAsyncThunk` của Redux khi client chủ động gửi lệnh lên server. |

---

### 2.2. Tầng Middleware Redux (`src/store/socketMiddleware.ts`)

`socketMiddleware` là **cầu nối chủ đạo** giữa WebSocket events từ server với Redux state.

#### Cơ chế hoạt động:
1. **Đăng ký Event duy nhất (`isInitialized`):** Bảo vệ chống việc React 19 / StrictMode mount 2 lần làm lặp listener.
2. **Lắng nghe Lifecycle Events của Socket:**
   * `connect`: Gửi action `setConnected({ socketId })`. Đồng thời **tự động gọi `resumeRoom`** nếu người chơi bị rớt mạng và kết nối lại thành công.
   * `disconnect`: Gửi action `setDisconnected({ reason })`.
   * `connect_error`: Gửi action `setConnectionError(message)`.
   * `reconnect_attempt`: Gửi action `setReconnecting({ attempt })`.
   * `reconnect_failed`: Gửi action `setConnectionError("Không thể kết nối lại máy chủ sau 10 lần thử")`.
3. **Lắng nghe Business Events từ Server (Server Push):**
   * `room:snapshot`: Máy chủ broadcast trạng thái mới $\rightarrow$ dispatch `setSnapshot(snapshot)` vào `roomSlice`.
   * `chat:message`: Máy chủ broadcast tin nhắn $\rightarrow$ dispatch `addChatMessage(message)` vào `chatSlice`.
4. **Bắt các Action điều khiển Socket từ Redux:**
   * `connectSocketAction`: Khi component dispatch action này $\rightarrow$ gọi `socket.connect()` và dispatch `setConnecting()`.
   * `disconnectSocketAction`: Khi component dispatch action này $\rightarrow$ gọi `socket.disconnect()`.

---

### 2.3. Tầng Redux Async Thunks (`src/store/thunks/`)

Các thunk phụ trách hành động người dùng chủ động tương tác với phòng và trò chơi:

#### A. Quản lý phòng & Phiên chơi ([`src/store/thunks/roomThunks.ts`](file:///d:/project/Food-guess/src/store/thunks/roomThunks.ts))
* **`createRoom`**:
  * Phát socket event: `room:create` kèm cấu hình phòng (`FoodGuessConfig`).
  * Khi nhận Ack thành công: lưu `participantId` & `token` vào `localStorage`, cập nhật `sessionSlice` (`setJoined`) và `roomSlice` (`setSnapshot`).
* **`joinRoom`**:
  * Phát socket event: `room:join` kèm mã phòng (`code`) và tên người chơi (`name`).
  * Khi nhận Ack: lưu phiên vào `localStorage`, cập nhật `sessionSlice` (`setJoined`) và `roomSlice` (`setSnapshot`).
* **`resumeRoom`**:
  * Đọc `localStorage`. Nếu có phiên, phát `room:resume` kèm `{ code, participantId, token }`.
  * Nếu thành công: cập nhật ngay snapshot và khôi phục màn hình chơi (`setJoined`).
  * Nếu token không hợp lệ (`RESUME_DENIED` / `ROOM_NOT_FOUND`): tự động xóa lưu trữ cũ và chuyển trạng thái `setNeedsName` để người dùng nhập tên mới mà không bị crash.
* **`leaveRoom`**:
  * Phát socket event: `room:leave`.
  * Dọn dẹp `localStorage`, dispatch `clearRoom`, `clearSession`, `clearChat`.

#### B. Thao tác Trận đấu ([`src/store/thunks/gameThunks.ts`](file:///d:/project/Food-guess/src/store/thunks/gameThunks.ts))
* **`startGame`**: Chủ phòng phát `food-guess:start`. Khi server phản hồi ack ok, server sẽ broadcast `room:snapshot` chuyển phase sang `playing`.
* **`submitAnswer`**: Người chơi phát `food-guess:answer` kèm `{ roundId, answer }`. Nhận kết quả qua Ack `{ correct, points, streak, comboApplied }` và dispatch toast điểm thưởng.
* **`skipRound`**: Chủ phòng phát `food-guess:skip` để kết thúc sớm câu hỏi hiện tại.
* **`nextRound`**: Chủ phòng phát `food-guess:next` để chuyển từ vòng giải đáp (`roundReveal`) sang vòng tiếp theo.
* **`rematch`**: Chủ phòng phát `food-guess:rematch` để bắt đầu lại trận mới từ màn hình kết thúc (`finished`).

---

### 2.4. Tầng Redux Slices (`src/store/slices/`)

Dữ liệu nhận từ WebSocket được phân bổ vào 5 slices chuyên biệt:

1. [`connectionSlice.ts`](file:///d:/project/Food-guess/src/store/slices/connectionSlice.ts):
   * Lưu trữ: `status` (`idle`, `connecting`, `connected`, `reconnecting`, `error`), `socketId`, `reconnectAttempt`, `errorMessage`.
2. [`roomSlice.ts`](file:///d:/project/Food-guess/src/store/slices/roomSlice.ts):
   * Lưu trữ: `snapshot: RoomSnapshot | null` và `closedReason: string | null`.
   * **Nguyên tắc:** Server là nguồn chân lý duy nhất (Single Source of Truth), toàn bộ snapshot được ghi đè mới hoàn toàn mỗi khi nhận `room:snapshot`.
3. [`sessionSlice.ts`](file:///d:/project/Food-guess/src/store/slices/sessionSlice.ts):
   * Quản lý vòng đời gia nhập của người chơi: `status` (`idle`, `resuming`, `needsName`, `joining`, `joined`), `participant` (chứa token định danh), `roomCode`.
4. [`chatSlice.ts`](file:///d:/project/Food-guess/src/store/slices/chatSlice.ts):
   * Lưu trữ danh sách tin nhắn chat realtime: `messages: ChatMessage[]`.
5. [`uiSlice.ts`](file:///d:/project/Food-guess/src/store/slices/uiSlice.ts):
   * Nhận các thông báo Toasts phát sinh từ kết quả Socket Ack (đoán đúng, đoán sai, lỗi hết giờ, lỗi quyền host).

---

### 2.5. Tầng Giao diện UI: Nơi gọi và sử dụng (`src/app/` & `src/components/`)

| Vị trí Tệp tin | Mục đích sử dụng WebSocket & Redux |
| :--- | :--- |
| [`src/app/page.tsx`](file:///d:/project/Food-guess/src/app/page.tsx) (Trang Hub) | - Kiểm tra `if (!socket.connected) dispatch(connectSocketAction())` ngay khi mount.<br>- Đọc `selectIsConnected` từ Redux để hiển thị Badge trạng thái kết nối máy chủ. |
| [`src/app/room/[code]/page.tsx`](file:///d:/project/Food-guess/src/app/room/%5Bcode%5D/page.tsx) | - Kích hoạt socket connection và gọi `dispatch(resumeRoom({ code }))`.<br>- Lắng nghe `sessionStatus` và `phase` từ Redux để điều hướng hiển thị: Đang kiểm tra $\rightarrow$ Nhập tên (`needsName`) $\rightarrow$ Sảnh (`lobby`) $\rightarrow$ Chơi (`playing`) $\rightarrow$ Kết quả (`roundReveal`) $\rightarrow$ Tổng kết (`finished`). |
| [`src/components/hub/CreateRoomForm.tsx`](file:///d:/project/Food-guess/src/components/hub/CreateRoomForm.tsx) | Đảm bảo socket đã kết nối trước khi dispatch `createRoom(payload)` thunk. |
| [`src/components/hub/JoinForm.tsx`](file:///d:/project/Food-guess/src/components/hub/JoinForm.tsx) | Đảm bảo socket đã kết nối trước khi dispatch `joinRoom({ code, name })` thunk. |
| [`src/components/room/NameForm.tsx`](file:///d:/project/Food-guess/src/components/room/NameForm.tsx) | Đảm bảo socket đã kết nối và dispatch `joinRoom` khi người dùng nhập tên tại URL phòng trực tiếp. |
| [`src/components/lobby/LobbyControls.tsx`](file:///d:/project/Food-guess/src/components/lobby/LobbyControls.tsx) | Chủ phòng nhấn "Bắt đầu trò chơi" $\rightarrow$ dispatch thunk `startGame()`. |
| [`src/components/playing/GuessInput.tsx`](file:///d:/project/Food-guess/src/components/playing/GuessInput.tsx) | Người chơi nhập đáp án và submit $\rightarrow$ dispatch thunk `submitAnswer({ roundId, answer })`. |
| [`src/components/playing/HostControls.tsx`](file:///d:/project/Food-guess/src/components/playing/HostControls.tsx) | Chủ phòng nhấn "Bỏ qua vòng này" $\rightarrow$ dispatch thunk `skipRound()`. |
| [`src/components/reveal/RevealControls.tsx`](file:///d:/project/Food-guess/src/components/reveal/RevealControls.tsx) | Chủ phòng nhấn "Vòng tiếp theo" $\rightarrow$ dispatch thunk `nextRound()`. |
| [`src/components/finished/FinishedControls.tsx`](file:///d:/project/Food-guess/src/components/finished/FinishedControls.tsx) | Chủ phòng nhấn "Chơi lại ván mới" $\rightarrow$ dispatch thunk `rematch()`. |

---

## 3. Ma trận tổng hợp các Socket Events và Redux Action tương ứng

| Tên Socket Event | Hướng | Cơ chế | Xử lý tại | Tác động State trong Redux |
| :--- | :---: | :---: | :--- | :--- |
| `connect` | Server $\to$ Client | Lifecycle | `socketMiddleware` | `connection.status = "connected"`, `socketId`, tự động resume nếu có `roomCode` |
| `disconnect` | Server $\to$ Client | Lifecycle | `socketMiddleware` | `connection.status = "reconnecting"` hoặc `"idle"` |
| `connect_error` | Server $\to$ Client | Lifecycle | `socketMiddleware` | `connection.status = "error"`, lưu `errorMessage` |
| `reconnect_attempt` | Server $\to$ Client | Lifecycle | `socketMiddleware` | `connection.reconnectAttempt` tăng dần (tối đa 10) |
| `room:snapshot` | Server $\to$ Client | Broadcast | `socketMiddleware` | `room.snapshot` cập nhật toàn diện dữ liệu phòng |
| `chat:message` | Server $\to$ Client | Broadcast | `socketMiddleware` | `chat.messages` append thêm tin nhắn mới |
| `room:create` | Client $\to$ Server | Emit + Ack | `roomThunks.createRoom` | `session.participant`, `session.roomCode`, `room.snapshot` |
| `room:join` | Client $\to$ Server | Emit + Ack | `roomThunks.joinRoom` | `session.participant`, `session.roomCode`, `room.snapshot` |
| `room:resume` | Client $\to$ Server | Emit + Ack | `roomThunks.resumeRoom` | `session.status = "joined"`, `room.snapshot` (hoặc fallback `needsName`) |
| `room:leave` | Client $\to$ Server | Emit + Ack | `roomThunks.leaveRoom` | `clearRoom`, `clearSession`, `clearChat` |
| `food-guess:start` | Client $\to$ Server | Emit + Ack | `gameThunks.startGame` | Đợi broadcast `room:snapshot` (phase $\to$ `playing`) |
| `food-guess:answer` | Client $\to$ Server | Emit + Ack | `gameThunks.submitAnswer`| `ui.toasts` hiển thị điểm thưởng và thông báo kết quả |
| `food-guess:skip` | Client $\to$ Server | Emit + Ack | `gameThunks.skipRound` | Đợi broadcast `room:snapshot` (phase $\to$ `roundReveal`) |
| `food-guess:next` | Client $\to$ Server | Emit + Ack | `gameThunks.nextRound` | Đợi broadcast `room:snapshot` (round tiếp theo hoặc `finished`) |
| `food-guess:rematch` | Client $\to$ Server | Emit + Ack | `gameThunks.rematch` | Đợi broadcast `room:snapshot` (phase $\to$ `lobby`) |

---

## 4. Các điểm kỹ thuật nổi bật

1. **Không tạo socket trong React Component:**
   * Không dùng `useEffect` tạo `io()` cục bộ để tránh memory leak và duplicate kết nối khi component re-render.
   * Toàn bộ socket được cô lập thành **Singleton** tại `src/lib/socket.ts` và quản lý thông qua **Redux Middleware**.
2. **Khắc phục lỗi React 19 StrictMode Mount Twice:**
   * Middleware sử dụng cờ `isInitialized` để chỉ đăng ký các event listener một lần duy nhất trên môi trường client (`typeof window !== "undefined"`).
3. **Mô hình Snapshot không trộn lẫn (No Merge Drift):**
   * Redux `roomSlice` không lưu trữ logic tính điểm hoặc thời gian thủ công; mỗi khi nhận `room:snapshot`, state được gán đè trực tiếp để đồng bộ 100% với máy chủ.
4. **Phục hồi phiên liền mạch (Auto-Resume):**
   * Lưu `token` và `participantId` an toàn trong `localStorage`.
   * Khi mất kết nối hoặc người dùng F5 tải lại trang, socket reconnect sẽ tự động kích hoạt `resumeRoom` giúp người chơi tiếp tục ván đấu mà không bị văng ra sảnh.
