# Kế hoạch Hoàn thiện Phase 6: Chatbox, Xử lý Lỗi & Tối ưu Trải nghiệm

> **Tài liệu tham chiếu:**
> - [docs/food-guess-fe-plan.md](file:///d:/project/Food-guess/docs/food-guess-fe-plan.md) (Giai đoạn 6)
> - [docs/ui_screens_design_spec.md](file:///d:/project/Food-guess/docs/ui_screens_design_spec.md) (Mục 5.3)
> - [src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css) (Bộ Design Tokens & Dark Mode)
> - [src/types/chat.ts](file:///d:/project/Food-guess/src/types/chat.ts) & [src/types/errors.ts](file:///d:/project/Food-guess/src/types/errors.ts)

---

## 1. Mục tiêu và Phạm vi (Scope & Objectives)

Phase 6 tập trung vào tính năng **Tương tác xã hội & Hoàn thiện trải nghiệm (UX)**, cho phép người chơi trò chuyện trong phòng thi đấu ở mọi giai đoạn (`lobby`, `playing`, `roundReveal`, `finished`), đồng thời tối ưu hóa khả năng chống spam tin nhắn, kiểm duyệt liên kết GIF an toàn và hoàn thiện giao diện responsive trên thiết bị di động.

### Các tính năng cốt lõi:
1. **Chatbox Thời Gian Thực (`ChatBox`):**
   - Lắng nghe sự kiện `chat:message` từ máy chủ (đã có trong `socketMiddleware`).
   - Gửi tin nhắn văn bản (1–300 ký tự) qua socket event `chat:send` kèm `{ text }`.
   - Gửi ảnh GIF động qua `{ gifUrl }` (chỉ chấp nhận liên kết từ Tenor hoặc Giphy).
   - Tự động cuộn xuống tin nhắn mới nhất khi có tin đến.
   - Giới hạn lưu trữ 200 tin nhắn gần nhất (`chatSlice`).
2. **Cơ chế Chống Spam & Giới hạn Tần suất (Rate-Limiting):**
   - Giới hạn: Tối đa 5 tin nhắn trong vòng 10 giây (`RATE_LIMITED`).
   - Xử lý chặn ngay tại client-side và bắt mã lỗi `RATE_LIMITED` từ server ack để phát toast cảnh báo.
3. **Kiểm tra Whitelist GIF (`INVALID_GIF_URL`):**
   - Xác thực biểu thức chính quy (Regex) các domain hợp lệ của Tenor (`tenor.com`, `media.tenor.com`) và Giphy (`giphy.com`, `media.giphy.com`).
   - Cảnh báo người dùng nếu dán link ngoài danh sách cho phép.
4. **Bố cục Thích Ứng (Responsive Mobile Drawer / Desktop Dock):**
   - **Desktop (Màn hình lớn):** Khung chat dạng cột cạnh màn hình hoặc drawer trượt có thể ẩn/hiện để không che khuất màn thi đấu đoán ảnh.
   - **Mobile (Màn hình nhỏ):** Nút nổi tiện ích `[ CHAT (X) ]` góc dưới màn hình, bấm vào sẽ mở ngăn kéo Bottom-Sheet / Drawer trượt toàn màn hình.
5. **Rà soát & Hoàn thiện Toàn bộ 13 Mã Lỗi:**
   - Đảm bảo toàn bộ 13 mã lỗi trong [src/lib/errors.ts](file:///d:/project/Food-guess/src/lib/errors.ts) đều được hiển thị Toast tiếng Việt đồng bộ và nhất quán.

---

## 2. Kiến trúc & Dòng Dữ Liệu (Architecture & Data Flow)

```
[ Người chơi ] ── Nhập text / Link GIF ──► Validate Client (1-300 ký tự, Rate limit 5msg/10s, Tenor/Giphy)
      │                                                │
      │ ◄── Báo lỗi Toast nếu vi phạm ─────────────────┘
      │
      └── Hợp lệ ──► emitWithAck("chat:send", { text } hoặc { gifUrl })
                          │
                          ├─► Ack Ok: Máy chủ broadcast `chat:message`
                          │            └─► socketMiddleware -> chatSlice.addChatMessage -> ChatBox
                          │
                          └─► Ack Lỗi (RATE_LIMITED, INVALID_GIF_URL)
                                       └─► Bắt SocketAckError -> Bắn Toast thông báo
```

---

## 3. Danh sách Đầu việc Chi tiết (Work Breakdown Structure)

### Đầu việc 1: Hạ tầng Async Thunk & Client Rate-Limiter (`chatThunks.ts`)
- **Tập tin:**
  - Tạo mới: `src/store/thunks/chatThunks.ts`
  - Chỉnh sửa: `src/store/thunks/index.ts`
- **Mô tả công việc:**
  1. Xây dựng utility kiểm tra URL GIF hợp lệ `isValidGifUrl(url: string): boolean`:
     - Kiểm tra whitelist tên miền: Tenor (`tenor.com`, `c.tenor.com`, `media.tenor.com`) và Giphy (`giphy.com`, `media.giphy.com`, `i.giphy.com`).
  2. Xây dựng bộ đếm tin nhắn phía client `checkClientRateLimit(): boolean`:
     - Ghi nhận timestamp của 5 tin nhắn gần nhất.
     - Nếu gửi quá 5 tin trong 10 giây ➔ từ chối gửi ngay tại client và báo toast cảnh báo: `[ BẠN ĐANG GỬI QUÁ NHANH: Vui lòng chờ ít giây... ]`.
  3. Viết thunk `sendChatMessage = createAsyncThunk("chat/send", ...)`:
     - Nhận payload `{ text?: string; gifUrl?: string }`.
     - Validate text: trim chuỗi, độ dài từ 1 đến 300 ký tự.
     - Validate gifUrl: kiểm tra định dạng whitelist.
     - Gửi socket event `chat:send` qua `emitWithAck<ChatSendAckData, ChatSendPayload>`.
     - Bắt `SocketAckError` (`RATE_LIMITED`, `INVALID_GIF_URL`, `NOT_IN_ROOM`) và dispatch toast lỗi.
  4. Export `sendChatMessage` từ `src/store/thunks/index.ts`.

---

### Đầu việc 2: Xây dựng Bộ Component Chatbox (`src/components/chat/`)
Tuân thủ nghiêm ngặt nguyên tắc **Text-only UI** (không icon, không emoji), Design Tokens Dark Mode [globals.css](file:///d:/project/Food-guess/src/app/globals.css).

1. **`ChatMessageItem.tsx` (Thành phần tin nhắn đơn lẻ):**
   - Hiển thị tên người gửi, thời gian gửi `HH:MM`.
   - Nếu là tin nhắn của bản thân: Highlight badge `[ BẠN ]` màu Amber.
   - Nội dung tin nhắn:
     - Dạng văn bản: Text hiển thị rõ ràng, wrap từ ngữ chống tràn khung.
     - Dạng ảnh GIF: Thẻ ảnh với khung giới hạn chiều cao `max-h-40`, bo góc, có skeleton loading và fallback khi lỗi.
2. **`ChatInput.tsx` (Thanh nhập liệu và gửi tin nhắn):**
   - Hỗ trợ 2 chế độ nhập Text-only qua nút chuyển đổi: `[ TIN NHẮN ]` và `[ DÁN LINK GIF ]`.
   - Chế độ Text: Input văn bản (1–300 ký tự), đếm ký tự `X / 300`, hỗ trợ bấm phím `Enter` để gửi ngay.
   - Chế độ GIF: Input dán URL Tenor/Giphy kèm hướng dẫn ngắn.
   - Nút gửi: `[ GỬI ]` (chuyển sang `[ ĐANG GỬI... ]` khi đang gửi ack).
   - Vô hiệu hóa nút và hiển thị đếm ngược nếu bị rơi vào trạng thái rate limit.
3. **`ChatBox.tsx` (Khung chat chính):**
   - Header: `[ TRÒ CHUYỆN TRONG PHÒNG ]` + tổng số tin nhắn.
   - Danh sách tin nhắn:
     - Sử dụng `useAppSelector(selectChatMessages)`.
     - Tự động cuộn xuống đáy khi có tin nhắn mới qua `useRef`.
     - Trạng thái rỗng: `[ CHƯA CÓ TIN NHẮN NÀO. HÃY LÀ NGƯỜI ĐẦU TIÊN TRÒ CHUYỆN! ]`.
   - Chân khung: Tích hợp `ChatInput`.
4. **`ChatDrawer.tsx` (Ngăn kéo / Bảng nổi hỗ trợ Mobile & Desktop):**
   - Nút kích hoạt: Nút cố định `[ TRÒ CHUYỆN ({unreadCount}) ]` có badge số tin nhắn.
   - Drawer container:
     - Desktop: Cột trượt bên phải hoặc panel gập/mở cạnh màn chơi.
     - Mobile: Bottom-sheet hoặc full-height modal trượt từ cạnh phải, có nút `[ ĐÓNG ]`.
5. **`src/components/chat/index.ts`:**
   - Barrel export: `ChatBox`, `ChatDrawer`, `ChatInput`, `ChatMessageItem`.

---

### Đầu việc 3: Tích hợp ChatBox vào Trang Phòng Chơi (`/room/[code]`)
- **Tập tin:** `src/app/room/[code]/page.tsx`
- **Mô tả công việc:**
  1. Tích hợp `ChatDrawer` vào layout chính của trang phòng chơi.
  2. Đảm bảo khung chat có thể mở và tương tác thông suốt ở mọi giai đoạn:
     - Sảnh chờ (`lobby`)
     - Đang thi đấu (`playing`)
     - Công bố đáp án (`roundReveal`)
     - Kết thúc trận đấu (`finished`)
  3. Bố cục không xung đột hay che khuất các nút hành động cốt lõi (nhập đáp án, skip, next, rematch).

---

### Đầu việc 4: Rà soát 13 Mã Lỗi & Tối ưu Trải nghiệm Mobile Responsive
- **Tập tin:**
  - `src/lib/errors.ts`
  - Các màn hình `Hub`, `Lobby`, `Playing`, `Reveal`, `Finished`
- **Mô tả công việc:**
  1. Kiểm tra bao phủ đủ 13 mã lỗi trong [src/lib/errors.ts](file:///d:/project/Food-guess/src/lib/errors.ts):
     - `ROOM_NOT_FOUND`, `ROOM_FULL`, `NAME_TAKEN`, `RESUME_DENIED`, `INVALID_PAYLOAD`, `INVALID_PHASE`, `ROUND_MISMATCH`, `TOO_LATE`, `ALREADY_ANSWERED`, `HOST_ONLY`, `NOT_IN_ROOM`, `RATE_LIMITED`, `INVALID_GIF_URL`.
  2. Kiểm tra giao diện trên kích thước màn hình nhỏ (Mobile 360px - 414px):
     - Đảm bảo không bị vỡ layout, các ô input không bị zoom ngoài ý muốn, các bảng điểm cuộn ngang mượt mà.

---

### Đầu việc 5: Cập nhật Dev Preview & Kiểm thử Toàn diện Codebase
- **Tập tin:** `src/app/dev/preview/page.tsx`
- **Mô tả công việc:**
  1. Bổ sung khu vực thử nghiệm Chat vào `/dev/preview`:
     - Giả lập gửi tin nhắn text, tin nhắn GIF, thử spam để kiểm tra thông báo `RATE_LIMITED`.
  2. Chạy kiểm tra kỹ thuật:
     - `npx tsc --noEmit` (0 lỗi type).
     - `npm run lint` (0 warning, 0 error).
     - `npm run build` (Next.js Turbopack biên dịch thành công 100%).

---

## 4. Bảng Phân Công Tập Tin (File Map)

| Tập tin | Hành động | Mục đích |
|---|:---:|---|
| `src/store/thunks/chatThunks.ts` | Tạo mới | Thunk `sendChatMessage`, client rate limiter & GIF validator |
| `src/store/thunks/index.ts` | Chỉnh sửa | Re-export `sendChatMessage` |
| `src/components/chat/ChatMessageItem.tsx` | Tạo mới | Component hiển thị từng tin nhắn text/GIF |
| `src/components/chat/ChatInput.tsx` | Tạo mới | Ô nhập tin nhắn text và link GIF |
| `src/components/chat/ChatBox.tsx` | Tạo mới | Khung danh sách tin nhắn và auto-scroll |
| `src/components/chat/ChatDrawer.tsx` | Tạo mới | Ngăn kéo trượt responsive cho mobile & desktop |
| `src/components/chat/index.ts` | Tạo mới | Barrel export toàn bộ component chat |
| `src/app/room/[code]/page.tsx` | Chỉnh sửa | Tích hợp `ChatDrawer` vào toàn bộ vòng đời phòng |
| `src/app/dev/preview/page.tsx` | Chỉnh sửa | Bổ sung khu vực test bench cho Chat realtime |

---

## 5. Tiêu chí Hoàn thành (Definition of Done)

- [x] Thunk `sendChatMessage` gửi được cả tin nhắn văn bản (1–300 ký tự) và ảnh GIF qua `chat:send`.
- [x] Chống spam hiệu quả: Chặn phía client và xử lý mã lỗi `RATE_LIMITED` từ server ack khi gửi quá 5 tin trong 10s.
- [x] Kiểm duyệt đúng whitelist GIF Tenor & Giphy, từ chối link không hợp lệ (`INVALID_GIF_URL`).
- [x] Khung chat tự động cuộn xuống tin nhắn mới nhất khi nhận sự kiện `chat:message`.
- [x] `ChatDrawer` hoạt động mượt mà trên cả Desktop (dạng dock/cột) và Mobile (dạng drawer trượt).
- [x] Có thể trò chuyện ở mọi phase (`lobby`, `playing`, `roundReveal`, `finished`).
- [x] 100% Text-only UI (không emoji, không icon ngoại trừ nhãn `[ ... ]`), chuẩn màu Dark Mode.
- [x] Không có lỗi TypeScript (`npx tsc --noEmit`), không có cảnh báo ESLint (`npm run lint`), `npm run build` thành công 100%.
