# Kế hoạch triển khai FE cho game "Food Guess"

> Nguồn: `food-guess-docs.md` (tài liệu hợp đồng FE ↔ BE).
> BE đã có sẵn, nên việc cần làm là **xây dựng phía Client (FE)**.
> **Stack đã chốt:** Next.js (App Router) + TypeScript + Tailwind CSS + Redux Toolkit + Socket.IO client.
> Các thư viện khác (toast, animation, form, icon...) sẽ được thêm vào sau, đúng thời điểm cần (gợi ý ở mục 9).

---

## 1. Phân tích: những gì cần làm

| #   | Mảng                      | Nguồn trong tài liệu | Bản chất                                        |
| --- | ------------------------- | -------------------- | ----------------------------------------------- |
| A   | Hạ tầng socket và session | Mục 2                | Kết nối, lưu phiên, reconnect / F5              |
| B   | Danh sách phòng (Hub)     | Mục 3                | REST polling 5s, lọc `food-guess`               |
| C   | Tạo và vào phòng          | Mục 5.2 (1-3)        | Form, ack, lưu storage                          |
| D   | 4 màn hình theo `phase`   | Mục 4                | Lobby, Playing, RoundReveal, Finished           |
| E   | Hành động trong game      | Mục 5.2 (4-10)       | start, answer, skip, next, rematch, leave, chat |
| F   | Lỗi, chat, feed realtime  | Mục 5.1, 6.4, 7      | Map lỗi sang toast, chat, feed nộp bài          |

---

## 2. Kiến trúc đề xuất (theo stack Next.js + Tailwind + Redux + Socket.IO)

### 2.1. Nguyên tắc

- **Server là nguồn sự thật duy nhất:** FE chỉ lưu `snapshot` nhận từ `room:snapshot`, không tự tính điểm hay tự chuyển phase.
- **Toàn bộ phòng chơi là Client Component:** màn hình `room/[code]` dùng `"use client"`, vì phụ thuộc socket, `localStorage` và timer. Server Component chỉ dùng cho layout tĩnh.
- **Socket chỉ nằm ở một nơi:** singleton trong `lib/socket.ts`, listener được đăng ký **một lần** trong Redux middleware. Không đăng ký trong `useEffect` của component, vì React StrictMode ở dev mount hai lần sẽ làm trùng listener và nhận snapshot hai lần.
- **Component không gọi `socket.emit` trực tiếp:** component dispatch thunk (`joinRoom`, `submitAnswer`...), thunk gọi `emitWithAck()` và xử lý ack.
- **`localStorage` chỉ đọc sau khi mount** (trong effect hoặc thunk), để tránh lỗi hydration mismatch của Next.js.
- **Dữ liệu tick theo thời gian không đưa vào Redux:** `GuessTimer` tự tính còn lại từ `deadlineAt` bằng state cục bộ, nếu không toàn bộ cây component sẽ render lại mỗi giây.

### 2.2. Redux store

| Slice / API            | Lưu gì                                                                              | Cập nhật bởi                                                        |
| ---------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `connectionSlice`      | `status`: `idle` / `connecting` / `waking` / `connected` / `reconnecting` / `error` | Middleware khi socket phát `connect`, `disconnect`, `connect_error` |
| `sessionSlice`         | `status`: `resuming` / `needsName` / `joined`, và `StoredParticipant` hiện tại      | Thunk `resumeRoom`, `joinRoom`, `createRoom`, `leaveRoom`           |
| `roomSlice`            | `snapshot: RoomSnapshot \| null`, `closedReason`                                    | Middleware khi nhận `room:snapshot`; ack của create/join/resume     |
| `chatSlice`            | `messages: ChatMessage[]` (giới hạn ví dụ 200 tin gần nhất)                         | Middleware khi nhận `chat:message`; thunk `sendChat`                |
| `uiSlice`              | Thông báo toast tạm thời (cho tới khi chọn thư viện toast)                          | `mapErrorToToast()` và các thunk                                    |
| `roomsApi` (RTK Query) | Danh sách phòng từ `GET /api/rooms`                                                 | `pollingInterval: 5000`, `skipPollingIfUnfocused: true`             |

Ghi chú:

- **RTK Query** đã nằm trong `@reduxjs/toolkit`, không cần cài thêm. Nó lo sẵn polling 5s, nút Refresh (`refetch`), trạng thái loading / error và dừng polling khi tab không focus.
- Dùng **typed hooks** `useAppDispatch` và `useAppSelector`, cộng với selector dùng chung: `selectPhase`, `selectIsHost`, `selectViewer`, `selectRound`, `selectReveal`.
- Dùng pattern `makeStore` + `StoreProvider` (client component, giữ store trong `useRef`) đặt ở `app/layout.tsx`, theo hướng dẫn Redux cho Next App Router.

### 2.3. Luồng dữ liệu

```
Component ──dispatch(thunk)──▶ emitWithAck(socket) ──▶ Server
                                                         │
Server ──room:snapshot / chat:message──▶ socketMiddleware ──dispatch(action)──▶ Reducer ──▶ UI
```

### 2.4. Tailwind

- Đặt design token (màu, bo góc, bóng đổ) trong cấu hình Tailwind để dùng nhất quán. Gợi ý nhóm màu: trạng thái đúng / sai, màu huy chương top 1-2-3, trạng thái online / offline.
- Làm **mobile-first**, vì game này nhiều khả năng được chơi trên điện thoại: ô nhập đáp án và 3 chip gợi ý phải đủ lớn để bấm, bàn phím ảo không che nút Gửi.
- Tách các khối lặp lại (nút, thẻ người chơi, badge) thành component nhỏ thay vì lặp chuỗi class dài.

### 2.5. Cấu trúc thư mục

```
src/
├─ app/
│   ├─ layout.tsx               # StoreProvider, font, globals.css (Tailwind)
│   ├─ page.tsx                 # Hub: danh sách phòng + tạo phòng + vào bằng mã
│   └─ room/[code]/page.tsx     # "use client" → RoomView (chọn View theo phase)
├─ store/
│   ├─ index.ts                 # makeStore
│   ├─ StoreProvider.tsx
│   ├─ hooks.ts                 # useAppDispatch, useAppSelector
│   ├─ selectors.ts
│   ├─ socketMiddleware.ts      # đăng ký listener 1 lần, dispatch action
│   ├─ slices/                  # connection, session, room, chat, ui
│   ├─ api/roomsApi.ts          # RTK Query: GET /api/rooms
│   └─ thunks/                  # roomThunks, gameThunks, chatThunks
├─ lib/
│   ├─ config.ts                # API_URL từ NEXT_PUBLIC_API_URL
│   ├─ socket.ts                # singleton
│   ├─ session.ts               # get/set/clear room_participant_{code}
│   ├─ emitWithAck.ts           # Promise wrapper + timeout
│   └─ errors.ts                # map ack.error → thông báo tiếng Việt
├─ types/                       # RoomSnapshot, FoodGuess*, Ack<T>, RoomSummary
└─ components/
    ├─ hub/                     # RoomList, RoomCard, CreateRoomForm, JoinForm
    ├─ room/                    # RoomView, ConnectionBanner, NameForm
    ├─ lobby/  playing/  reveal/  finished/
    └─ shared/                  # GuessTimer, SuggestionChips, ScoreFeed, Leaderboard, ChatBox
```

---

## 3. Kế hoạch theo giai đoạn

### Giai đoạn 0: Khởi tạo dự án (1 ngày)

- [x] Tạo dự án Next.js (App Router, TypeScript, Tailwind), cài `@reduxjs/toolkit`, `react-redux`, `socket.io-client` (bản 4.x, khớp Engine.IO v4 của server).
- [x] Khai báo toàn bộ TypeScript types từ mục 5 và 6 của tài liệu, gồm `Ack<T> = { ok: true; data: T } | { ok: false; error: string }`.
- [x] Tạo `.env.local` với `NEXT_PUBLIC_API_URL=https://uwu-cup.onrender.com`, dùng cho cả socket lẫn REST (mục 8).
- [x] Dựng `StoreProvider`, typed hooks và store rỗng.
- [x] Dùng thẻ `<img>` thường cho ảnh món ăn (chưa có nguồn ảnh nên chưa biết domain, xem mục 7.1). Không cấu hình `images.remotePatterns` ở giai đoạn này.
- [x] Dựng cấu trúc thư mục hoàn chỉnh theo mục 2.5 của plan.
- [x] Dựng **chế độ mock**: thư mục `mocks/` chứa snapshot mẫu cho 4 phase (lobby, playing, roundReveal, finished) cùng vài ảnh placeholder đặt trong `public/`, và một route chỉ chạy ở môi trường dev (ví dụ `/dev/preview`) để dựng UI mà không cần phòng thật hay ảnh thật.
- [x] Đã xác minh handshake Socket.IO và `/api/rooms` với server thật (mục 8.2).
- [x] Kiểm tra CORS từ `localhost:3000` và từ domain FE (mục 8.2).

**Đầu ra:** dự án chạy được, store và types sẵn sàng, gọi được server thật từ trình duyệt.

### Giai đoạn 1: Hạ tầng socket, Redux và session (1.5 ngày)

- [x] `lib/socket.ts`: singleton theo mục 2.1 của tài liệu: `path: "/socket.io"`, transports `websocket` + `polling`, reconnect 10 lần, delay 1s. **Lưu ý:** server khác origin nên phải truyền URL tường minh `io(API_URL, {...})`, không dùng `io({...})` như ví dụ trong tài liệu (mục 8.1).
- [x] `lib/emitWithAck.ts` (Promise + timeout) và `lib/errors.ts` (map 12 mã lỗi).
- [x] `lib/session.ts` lưu / đọc key `room_participant_{code}` với `{ participantId, token, name }`.
- [x] `connectionSlice`, `sessionSlice`, `roomSlice`.
- [x] `socketMiddleware`: đăng ký listener `connect`, `disconnect`, `connect_error`, `room:snapshot` đúng một lần.
- [x] Thunk `resumeRoom` / `joinRoom` / `createRoom` / `leaveRoom`:
  - Có storage thì gọi `room:resume`. Ack `ok` thì cập nhật snapshot. Ack lỗi (`RESUME_DENIED` hoặc `ROOM_NOT_FOUND`) thì xóa storage và chuyển `sessionSlice` sang `needsName`.
  - Không có storage thì hiện form nhập tên rồi gọi `room:join`.
  - Chạy lại logic resume mỗi lần socket `connect`, vì reconnect cũng cần resume.
- [x] `ConnectionBanner` hiển thị trạng thái kết nối ("Đang kết nối lại...").

**Tiêu chí hoàn thành:** F5 giữa ván vẫn vào lại đúng phòng mà không phải nhập tên. Ngắt mạng rồi bật lại thì tự resume. Ở dev (StrictMode) mỗi `room:snapshot` chỉ được xử lý một lần.

### Giai đoạn 2: Hub, tạo phòng và vào phòng (1 ngày)

- [ ] `roomsApi` (RTK Query): `getRooms` gọi `GET {API_URL}/api/rooms` với `cache: "no-store"`, `pollingInterval: 5000`, `skipPollingIfUnfocused: true`, kèm nút Refresh (`refetch`).
- [ ] Lọc `gameType === "food-guess"`, gắn nhãn trạng thái từng phòng:
  - `lobby`: vào chơi từ đầu
  - `playing`: vào và tham gia từ các vòng sau
  - `participantCount >= 50`: đầy, vô hiệu hóa nút vào
- [ ] Form tạo phòng (`room:create`) với các giới hạn:
  - Tên: 2-24 ký tự
  - `totalRounds`: 5-50
  - `answerTimeSeconds`: 10-120
  - Hai công tắc: `autoNextRound`, `comboStreakEnabled`
- [ ] Form vào phòng (`room:join`) gồm mã phòng và tên. Ack thành công thì lưu session và điều hướng sang `/room/{code}` bằng `useRouter().push`.
- [ ] Trang `room/[code]` lấy `code` bằng `useParams()`. Khi vào bằng link trực tiếp mà chưa có session thì hiện `NameForm`.

**Tiêu chí hoàn thành:** tạo được phòng và vào được phòng từ danh sách hoặc bằng mã.

### Giai đoạn 3: Màn hình Lobby và hành động Host (1 ngày)

- [ ] Danh sách người chơi, hiện trạng thái online / offline, huy hiệu Host.
- [ ] Hiển thị cấu hình phòng (số vòng, thời gian, auto next, combo).
- [ ] Nút "Bắt đầu" gọi `food-guess:start`, chỉ hiện khi `viewer.isHost`.
- [ ] Nút "Rời phòng" gọi `room:leave`, xóa storage rồi về trang chủ.
- [ ] Xử lý `closedReason === "ROOM_CLOSED"`: thông báo phòng đã bị hủy và chuyển về Hub.

### Giai đoạn 4: Màn hình Playing, phần cốt lõi (2 ngày)

- [ ] Header hiển thị `roundNumber / totalRounds`.
- [ ] `GuessTimer` đếm ngược theo `deadlineAt`.
- [ ] Ảnh món ăn từ `mediaUrl` bằng thẻ `<img>`: khung tỉ lệ cố định (Tailwind `aspect-*`) để bố cục không nhảy khi ảnh tải xong, skeleton khi đang tải, ảnh dự phòng khi `onError` hoặc `mediaUrl` rỗng.
- [ ] Ô nhập đáp án (1-200 ký tự) và 3 chip gợi ý `suggestions`. Click chip thì gửi luôn.
- [ ] Gửi `food-guess:answer` với `{ roundId, answer }` và khóa input ngay khi bấm.
- [ ] Xử lý ack:
  - Đúng: toast "Chính xác!". Nếu `comboApplied` thì ghi thêm hệ số và điểm (ví dụ _"Chính xác! Combo x1.4 — +380đ"_).
  - Sai: toast "Sai rồi! Chờ hết round để xem đáp án nhé."
- [ ] Khóa input khi `viewerAnswered === true` (bao phủ cả trường hợp F5 sau khi đã nộp).
- [ ] Hiển thị `submittedCount` và `ScoreFeed` từ `foodGuessEvents`.
- [ ] Nút "Kết thúc round sớm" (Host) gọi `food-guess:skip`.

### Giai đoạn 5: Reveal và Finished (1 ngày)

**Reveal**

- [ ] Hiển thị `foodName` và `resourceUrl`.
- [ ] Hiển thị điểm cá nhân (`viewerPoints`) và streak (`viewerStreak`).
- [ ] Bảng `results` của cả phòng, sắp xếp theo điểm.
- [ ] Nút "Round tiếp theo" (`food-guess:next`) chỉ hiện khi `autoNextRound === false` và là Host.
- [ ] Nếu auto next, hiển thị đếm ngược 5s.

**Finished**

- [ ] Bảng xếp hạng chung cuộc, nổi bật top 1, 2, 3.
- [ ] Lịch sử các vòng từ `foodGuessPastResults` (accordion hoặc tab).
- [ ] Nút "Chơi lại" (Host) gọi `food-guess:rematch`.

### Giai đoạn 6: Chat, lỗi và hoàn thiện (1 ngày)

- [ ] `ChatBox`: lắng nghe `chat:message`, gửi `chat:send` với `text` (1-300 ký tự) hoặc `gifUrl`. Tự cuộn xuống tin mới nhất.
- [ ] Xử lý `RATE_LIMITED` (quá 5 tin trong 10s) và `INVALID_GIF_URL` (chỉ Tenor / Giphy).
- [ ] Map đủ 12 mã lỗi ở mục 7 sang toast tiếng Việt, dùng chung toàn app.
- [ ] Responsive cho mobile, xử lý trạng thái loading / empty / error.

### Giai đoạn 7: Kiểm thử và hoàn thiện (1 ngày)

Xem checklist ở mục 5.

**Tổng ước tính: khoảng 9-10 ngày công** cho một dev, chưa tính thiết kế UI chi tiết. (Con số này đã tính thêm công dựng Redux và middleware, và sửa lại phép cộng của bản trước.)

---

## 4. Rủi ro và điểm cần lưu ý

| Vấn đề                                                                              | Cách xử lý                                                                                                                  |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Lệch đồng hồ** giữa client và server khiến timer sai so với `deadlineAt`          | Hỏi BE có trả `serverTime` không. Nếu không, dùng `TOO_LATE` làm chốt chặn cuối và để timer chỉ mang tính hiển thị.         |
| **Nộp trùng hoặc nộp muộn** khi nhấn nhanh                                          | Khóa input ngay lập tức. Coi `ALREADY_ANSWERED`, `TOO_LATE`, `ROUND_MISMATCH` là lỗi bình thường, không phải sự cố.         |
| **Snapshot ghi đè** (ack của create/join và `room:snapshot` cùng đến)               | Luôn lấy snapshot mới nhất, không merge.                                                                                    |
| **Resume chạy lặp** mỗi lần reconnect                                               | Chỉ resume khi socket đã kết nối và chưa có phiên hợp lệ. Tránh gọi song song.                                              |
| **Phòng 50 người** gây snapshot lớn và render lại liên tục                          | Memo hóa các component danh sách và bảng xếp hạng.                                                                          |
| **Ảnh lỗi, rỗng hoặc chậm** (chưa có nguồn ảnh cố định)                             | Khung tỉ lệ cố định, skeleton, ảnh dự phòng. Ảnh nên là `https`, vì trang `https` sẽ chặn ảnh `http` (mixed content).       |
| **StrictMode (dev) mount hai lần** làm trùng listener socket                        | Đăng ký listener trong middleware, không trong `useEffect`.                                                                 |
| **Hydration mismatch** khi đọc `localStorage` lúc render                            | Chỉ đọc sau khi mount; trước đó hiển thị trạng thái `resuming`.                                                             |
| **Redux render lại liên tục** khi snapshot thay đổi theo từng câu trả lời           | Dùng selector hẹp (`selectRound`, `selectParticipants`), `React.memo` cho thẻ người chơi và bảng xếp hạng.                  |
| **Token trong localStorage**                                                        | Chỉ lưu những gì tài liệu yêu cầu, xóa khi rời phòng hoặc khi bị từ chối resume.                                            |
| **Cold start trên Render** (gói free có thể ngủ sau một thời gian không có request) | Hiển thị màn hình "Đang đánh thức server...", tăng timeout kết nối lần đầu, và cân nhắc "ping" server khi mở Hub (mục 8.3). |
| **CORS** khi FE và BE khác origin                                                   | Cần BE cho phép origin của FE. Nếu bị chặn, dùng proxy cùng origin (mục 8.1).                                               |
| **`localStorage` theo origin**                                                      | Session lưu theo origin của FE nên đổi domain FE sẽ mất phiên. Cố định domain trước khi test.                               |

---

## 5. Checklist kiểm thử

- [ ] Tạo phòng, vào phòng, tên trùng (`NAME_TAKEN`), phòng đầy (`ROOM_FULL`).
- [ ] F5 ở từng phase (lobby, playing, roundReveal, finished) đều resume đúng.
- [ ] Tắt mạng 10s rồi bật lại, kiểm tra resume tự động.
- [ ] Xóa hoặc sửa sai token trong storage, kỳ vọng `RESUME_DENIED` và hiện form nhập tên.
- [ ] Nộp đáp án bằng gõ tay và bằng chip; đúng / sai; có / không combo.
- [ ] Nộp khi hết giờ (`TOO_LATE`) và nộp hai lần (`ALREADY_ANSWERED`).
- [ ] Host: skip, next, rematch. Người thường gọi lệnh Host phải nhận `HOST_ONLY`.
- [ ] Host hủy phòng thì tất cả client được đưa về Hub.
- [ ] Chat: spam để thử rate limit, gửi GIF link ngoài whitelist.
- [ ] Mở 2-3 tab giả lập nhiều người chơi trong một ván hoàn chỉnh.
- [ ] Kết nối tới `https://uwu-cup.onrender.com` từ domain FE đã deploy, không có lỗi CORS ở cả socket và `/api/rooms`.
- [ ] Ảnh lỗi / `mediaUrl` rỗng: giao diện vẫn dùng được, hiện ảnh dự phòng và vẫn nhập được đáp án.
- [ ] Để server ngủ rồi mở lại, kiểm tra màn hình chờ cold start và nút "Thử lại".

---

## 6. Bảng map Event ↔ Màn hình (tham chiếu nhanh)

| Hành động         | Event                | Quyền     | Phase hợp lệ                                  |
| ----------------- | -------------------- | --------- | --------------------------------------------- |
| Tạo phòng         | `room:create`        | Mọi người | -                                             |
| Vào phòng         | `room:join`          | Mọi người | -                                             |
| Khôi phục phiên   | `room:resume`        | Mọi người | -                                             |
| Bắt đầu           | `food-guess:start`   | Host      | `lobby`                                       |
| Nộp đáp án        | `food-guess:answer`  | Mọi người | `playing`                                     |
| Kết thúc vòng sớm | `food-guess:skip`    | Host      | `playing`                                     |
| Vòng tiếp theo    | `food-guess:next`    | Host      | `roundReveal` (khi `autoNextRound === false`) |
| Chơi lại          | `food-guess:rematch` | Host      | `finished`                                    |
| Rời phòng         | `room:leave`         | Mọi người | Mọi phase                                     |
| Chat              | `chat:send`          | Mọi người | Mọi phase                                     |

---

## 7. Điểm chưa rõ trong tài liệu (cần xác nhận)

1. **`hasVoted` trong `participants`** không được giải thích cho Food Guess. Có thể là trường dùng chung với game khác; đề xuất bỏ qua.
2. **`mediaUrl` và `resourceUrl`** là hai tên khác nhau cho ảnh ở vòng chơi và ở reveal. Cần xác nhận hai URL có thể khác nhau không (ví dụ ảnh chơi bị che tên, ảnh reveal là ảnh chuẩn).
3. **Giá trị mặc định** của `totalRounds` ("10 hoặc 15") và `answerTimeSeconds` ("15 hoặc 20") cần chốt một giá trị.
4. **Phase `voting` và `tieBreak`** xuất hiện trong `RoomSummary` nhưng không có trong `RoomSnapshot.phase`. Có vẻ thuộc game khác, FE Food Guess không cần xử lý.
5. **Header `{ "cache": "no-store" }`** ở mục 3 không phải header HTTP chuẩn. Có lẽ ý là option `cache: "no-store"` của `fetch`.
6. Có cần chức năng **kick người chơi** hoặc **đổi cấu hình trong Lobby** không? Tài liệu nhắc "cấu hình phòng" ở Lobby nhưng không có event nào để sửa.
7. **CORS** của server `https://uwu-cup.onrender.com` chưa kiểm tra được (cần thử từ domain FE thật, xem mục 8.2). Server và `/api/rooms` đã được xác minh hoạt động.
8. **Nguồn ảnh món ăn:** chưa có. Xem hướng xử lý ở mục 7.1.
9. **Nơi deploy FE:** chưa chốt. Không chặn việc phát triển, xem mục 7.2 và 8.5.

### 7.1. Nguồn ảnh món ăn (chưa có)

Ảnh do BE gửi qua `mediaUrl` (vòng chơi) và `resourceUrl` (reveal), cùng `foodName` là đáp án đúng. FE không chọn nguồn ảnh, nhưng game chưa chơi thật được nếu BE chưa có dữ liệu món ăn và ảnh.

**Với FE (không bị chặn):**

- Dựng UI bằng chế độ mock và ảnh placeholder (Giai đoạn 0).
- Dùng `<img>` thường, không phụ thuộc domain. Khi có nguồn ảnh, chỉ cần đổi sang `next/image` nếu muốn (khi đó thêm `images.remotePatterns`). Không phải sửa kiến trúc.

**Cần làm rõ với phía BE / dữ liệu:**

- BE hiện đã có danh sách món ăn và ảnh chưa, hay đang chờ bạn cung cấp? Nếu bạn cũng quản lý BE, cần biết dữ liệu được nạp bằng cách nào (file seed, database, upload).
- Ảnh nên được lưu ở storage riêng của dự án thay vì nhúng trực tiếp từ website khác (link nhúng có thể chết hoặc bị chặn).

**Một số hướng tìm nguồn ảnh (cần tự kiểm tra điều khoản từng nguồn trước khi dùng):**

| Hướng                                                     | Ưu điểm                                  | Lưu ý                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tự chụp hoặc tự sưu tầm có quyền sử dụng                  | Kiểm soát chất lượng, không lo bản quyền | Tốn công, ít ảnh                                                                                        |
| Kho ảnh miễn phí (Unsplash, Pexels, Wikimedia Commons...) | Nhiều ảnh, chất lượng khá                | Mỗi nguồn có điều khoản riêng, có nơi yêu cầu ghi công; ảnh Wikimedia có nhiều loại giấy phép khác nhau |
| Ảnh do AI tạo                                             | Dễ có đủ số lượng và đồng nhất           | Kiểm tra điều khoản công cụ; món ăn có thể sai chi tiết so với món thật                                 |

**Tiêu chí ảnh phù hợp cho game đoán món:** mỗi ảnh một món rõ ràng, tỉ lệ khung hình thống nhất, đủ độ phân giải để xem trên điện thoại, và **không có chữ hoặc logo lộ đáp án**.

### 7.2. Nơi deploy FE (chưa chốt)

Chưa cần chốt vì đã có URL API cố định. FE gọi thẳng `https://uwu-cup.onrender.com` qua biến môi trường, nên đổi nơi deploy không phải sửa code. Điều duy nhất phụ thuộc là **domain nào được BE cho phép (CORS)**, xem mục 8.5.

---

## 8. Kết nối tới server thực tế

**Server được cung cấp:** `https://uwu-cup.onrender.com/socket.io`

### 8.1. Cách cấu hình

Origin của server là `https://uwu-cup.onrender.com`, còn `/socket.io` chỉ là `path`. Ví dụ `io({ path: "/socket.io" })` trong tài liệu chỉ đúng khi FE và BE cùng origin, nên với server này cần sửa như sau:

```typescript
// lib/config.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://uwu-cup.onrender.com";

// lib/socket.ts  (chỉ import trong code chạy ở client)
import { io, Socket } from "socket.io-client";
import { API_URL } from "./config";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 30000, // tăng timeout cho lần kết nối đầu (cold start)
      autoConnect: false, // chủ động connect sau khi đã "đánh thức" server
    });
  }
  return socket;
}

// store/api/roomsApi.ts  (RTK Query)
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const roomsApi = createApi({
  reducerPath: "roomsApi",
  baseQuery: fetchBaseQuery({ baseUrl: API_URL, cache: "no-store" }),
  endpoints: (b) => ({
    getRooms: b.query<{ rooms: RoomSummary[] }, void>({
      query: () => "/api/rooms",
    }),
  }),
});
```

Hai hướng xử lý CORS:

| Hướng                 | Cách làm                                                                                                                                             | Khi nào chọn                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Gọi trực tiếp**     | `io(API_URL)` và `fetch(API_URL + "/api/rooms")`. BE phải bật CORS cho domain FE.                                                                    | BE đã cấu hình CORS (cần xác nhận).           |
| **Proxy cùng origin** | Dùng `rewrites` trong `next.config` để chuyển `/api/*` và `/socket.io/*` sang `uwu-cup.onrender.com`. Khi đó có thể giữ `io({ path })` như tài liệu. | BE chưa bật CORS, hoặc muốn tránh lỗi origin. |

Lưu ý: với proxy kiểu rewrite, WebSocket thường không đi qua được (ví dụ khi deploy Next.js lên Vercel). Khi đó Socket.IO sẽ rơi về polling, hiệu năng kém hơn. Vì vậy gọi trực tiếp kèm CORS là hướng ưu tiên.

### 8.2. Kết quả kiểm tra URL (ngày 01/10/2026)

Đã xác minh bằng cách gọi trực tiếp từ trình duyệt:

| Phép thử                                  | Kết quả                                                                                                                  | Kết luận                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `GET /socket.io/?EIO=4&transport=polling` | `0{"sid":"qj1-W-FUrVlYVnA4AAAG","upgrades":["websocket"],"pingInterval":25000,"pingTimeout":20000,"maxPayload":1000000}` | Server Socket.IO (protocol v4) chạy đúng tại `path: "/socket.io"` |
| `GET /api/rooms`                          | `{"rooms":[]}`                                                                                                           | REST hoạt động, cùng origin với socket, hiện chưa có phòng nào    |

Ý nghĩa của từng thông số trong handshake:

| Thông số                  | Giá trị                         | Tác động tới FE                                                                                    |
| ------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------- |
| `EIO=4`                   | Engine.IO v4                    | Dùng `socket.io-client` bản 4.x (khớp với phiên bản server)                                        |
| `upgrades: ["websocket"]` | Cho phép nâng cấp lên WebSocket | Giữ `transports: ["websocket", "polling"]` như tài liệu                                            |
| `pingInterval: 25000`     | Server ping mỗi 25 giây         | Mất kết nối có thể mất tới ~45 giây mới bị phát hiện (25s + 20s); cần banner "Đang kết nối lại..." |
| `pingTimeout: 20000`      | Chờ pong tối đa 20 giây         | Như trên                                                                                           |
| `maxPayload: 1000000`     | Tối đa ~1MB mỗi gói             | Đủ cho snapshot phòng 50 người; chat chỉ gửi `gifUrl` chứ không gửi file                           |

Server đang chạy tốt nên các phép thử bên dưới là việc còn lại cần kiểm tra:

1. **CORS:** chạy đoạn thử nhanh trong Console của trang FE (hoặc `localhost` khi dev). Lỗi CORS chỉ lộ ra khi gọi từ trình duyệt ở origin khác.

```javascript
import("https://cdn.socket.io/4.7.5/socket.io.esm.min.js").then(({ io }) => {
  const s = io("https://uwu-cup.onrender.com", {
    path: "/socket.io",
    transports: ["websocket"],
  });
  s.on("connect", () => console.log("OK connect", s.id));
  s.on("connect_error", (e) => console.log("LỖI", e.message));
});
```

Lưu ý: chạy đoạn này từ tab đang mở trang khác origin sẽ cho biết đúng tình trạng CORS. Thử cả `fetch("https://uwu-cup.onrender.com/api/rooms")` để kiểm tra CORS của REST. 2. **Luồng nghiệp vụ:** `/api/rooms` đang rỗng nên chưa kiểm chứng được cấu trúc `RoomSummary` và việc lọc `food-guess`. Sau khi tạo một phòng thử (`room:create`), gọi lại `/api/rooms` để đối chiếu với mục 3 của tài liệu. 3. **Cold start:** xem mục 8.3.

### 8.3. Xử lý cold start của Render

Dịch vụ trên Render gói miễn phí có thể ngủ khi không có request, và lần gọi đầu có thể mất khá lâu. Việc cần làm ở FE:

- [ ] Khi mở Hub, gọi `GET /api/rooms` trước. Chỉ gọi `socket.connect()` sau khi request này thành công hoặc timeout hợp lý.
- [ ] Hiển thị trạng thái "Đang đánh thức server, vui lòng chờ..." nếu request đầu mất hơn khoảng 3 giây.
- [ ] Đặt `timeout` kết nối socket cao hơn mặc định (gợi ý 30000ms) và có nút "Thử lại" khi `connect_error`.
- [ ] Giữ `reconnectionAttempts: 10` như tài liệu, nhưng thêm giao diện báo lỗi rõ ràng khi hết lượt thử.
- [ ] Nếu server có endpoint health-check, ping định kỳ khi tab đang mở để tránh server ngủ giữa ván.

### 8.4. Việc bổ sung vào kế hoạch

| Giai đoạn | Việc thêm                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | Biến môi trường `NEXT_PUBLIC_API_URL`, kiểm tra CORS (handshake và `/api/rooms` đã xác minh)                                           |
| 1         | Socket dùng URL tường minh, `autoConnect: false`, timeout dài, trạng thái `waking` trong `connectionSlice` cho màn hình chờ cold start |
| 2         | Hub gọi `/api/rooms` bằng `API_URL`, xử lý lỗi mạng và lỗi CORS                                                                        |
| 7         | Kiểm thử trên domain FE thật (deploy), vì lỗi CORS và `localStorage` theo origin chỉ lộ ra ở đó                                        |

### 8.5. Deploy chưa chốt: cách giữ FE linh hoạt

Cách làm hiện tại (gọi thẳng BE, cấu hình bằng biến môi trường) hoạt động giống nhau trên mọi nơi deploy. Việc cần làm:

- [ ] Không phụ thuộc `rewrites` hay proxy trong `next.config`, vì WebSocket thường không đi qua proxy của nền tảng serverless.
- [ ] Giữ `NEXT_PUBLIC_API_URL` là biến môi trường duy nhất cho địa chỉ BE.
- [ ] Giai đoạn dev: đảm bảo BE cho phép origin `http://localhost:3000`. Đây là việc kiểm tra CORS ở Giai đoạn 0.
- [ ] Khi chọn được nơi deploy: gửi domain đó cho người quản lý BE để thêm vào danh sách origin cho phép (kể cả domain preview nếu nền tảng tạo URL riêng cho mỗi lần deploy).

Hai điều cần nhớ khi chọn nơi deploy sau này:

- **Phiên chơi lưu theo domain** (`localStorage`), nên đổi domain FE sẽ làm mất phiên đang chơi.
- **Server Render có thể ngủ** (mục 8.3), nên việc deploy FE ở đâu không giải quyết được cold start của BE.

---

## 9. Thư viện sẽ bổ sung sau (gợi ý theo thời điểm)

Chỉ là gợi ý, chọn khi tới đúng giai đoạn. Phần lõi của dự án (Next.js, Tailwind, Redux Toolkit, `socket.io-client`) đã đủ để làm Giai đoạn 0 đến 3.

| Nhu cầu                    | Khi nào cần                     | Ghi chú                                                                                |
| -------------------------- | ------------------------------- | -------------------------------------------------------------------------------------- |
| Toast / thông báo          | Giai đoạn 2 trở đi              | Trước đó có thể dùng `uiSlice` tạm. Cần cho 12 mã lỗi và toast đúng/sai ở màn Playing. |
| Validate form              | Giai đoạn 2                     | Form tạo phòng có nhiều giới hạn số (5-50, 10-120, 2-24 ký tự).                        |
| Icon                       | Giai đoạn 2-3                   | Huy hiệu Host, trạng thái online, nút hành động.                                       |
| Hỗ trợ ghép class Tailwind | Khi component có nhiều biến thể | Tránh chuỗi class dài và xung đột class.                                               |
| Animation / hiệu ứng       | Giai đoạn 5                     | Công bố đáp án, top 3, pháo giấy ở màn Finished.                                       |
| Chọn GIF / emoji           | Giai đoạn 6                     | Chat nhận `gifUrl` chỉ từ Tenor / Giphy (mã lỗi `INVALID_GIF_URL`).                    |
| Kiểm thử                   | Giai đoạn 7                     | Unit test cho reducer và selector; E2E cho luồng F5 / resume.                          |
