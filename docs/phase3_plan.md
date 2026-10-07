# Kế hoạch Hoàn thiện Phase 3: Màn hình Lobby & Hành động Host

> **Tài liệu tham chiếu:**
> - [docs/food-guess-fe-plan.md](file:///d:/project/Food-guess/docs/food-guess-fe-plan.md) (Giai đoạn 3)
> - [docs/ui_screens_design_spec.md](file:///d:/project/Food-guess/docs/ui_screens_design_spec.md) (Mục 4.1)
> - [src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css) (Bộ Design Tokens & Màu sắc)

---

## 1. Mục tiêu và Phạm vi (Scope & Objectives)

Phase 3 tập trung vào màn hình **Sảnh chờ thi đấu (Lobby View)** khi người chơi đã vào phòng thành công (`sessionStatus === "joined"` và `snapshot.phase === "lobby"`).

### Các tính năng cốt lõi:
1. **Thông tin cấu hình phòng:** Hiển thị mã phòng, số vòng, thời gian đoán, cài đặt auto-next và combo streak.
2. **Tiện ích mời bạn bè:** Nút sao chép liên kết phòng thi đấu kèm phản hồi tức thì `[ ĐÃ SAO CHÉP ]`.
3. **Danh sách người chơi realtime:** Cập nhật liên tục trạng thái trực tuyến / ngoại tuyến, số lượng người tham gia (`X / 50`), và nhãn `[ CHỦ PHÒNG ]`.
4. **Quyền hạn Host:**
   - Chỉ Host mới thấy và bấm được nút `[ BẮT ĐẦU VÁN CHƠI ]`.
   - Gửi sự kiện socket `food-guess:start`.
5. **Rời phòng:** Nút `[ RỜI PHÒNG ]` gửi `room:leave`, dọn dẹp `localStorage` và chuyển về Hub (`/`).
6. **Xử lý phòng bị đóng:** Lắng nghe `closedReason === "ROOM_CLOSED"` để hiển thị thông báo giải tán phòng và đưa người chơi về Hub.

---

## 2. Kiến trúc & Dòng dữ liệu (Architecture & Data Flow)

```
[ Người chơi / Host ]
        │
        ├── Bấm "Bắt đầu" (Chỉ Host) ────────► emitWithAck("food-guess:start")
        │                                             │
        │                                             ▼
        │                                    Server phát tán snapshot mới:
        │                                    phase: "playing"
        │                                             │
        ├── Bấm "Rời phòng" ─────────────────► dispatch(leaveRoom({ code }))
        │                                             │
        │                                             ▼
        │                                    Xóa localStorage + reset Redux
        │                                    router.push("/")
        │
        └── Server đóng phòng ───────────────► snapshot.closedReason: "ROOM_CLOSED"
                                                      │
                                                      ▼
                                             Hiện Modal thông báo giải tán
```

---

## 3. Danh sách Đầu việc Chi tiết (Work Breakdown Structure)

### Đầu việc 1: Hạ tầng Async Thunk & Quản lý Action (`gameThunks.ts`)
- **Tập tin:**
  - Tạo mới: `src/store/thunks/gameThunks.ts`
  - Chỉnh sửa: `src/store/thunks/index.ts`
- **Mô tả công việc:**
  1. Tạo thunk `startGame = createAsyncThunk("game/start", ...)`:
     - Gửi socket event `food-guess:start` thông qua hàm `emitWithAck<EmptyAckData>(socket, "food-guess:start")`.
     - Xử lý Ack thành công: Server sẽ phát snapshot với `phase: "playing"` tới tất cả client qua middleware socket.
     - Xử lý lỗi: Bắt `SocketAckError` (ví dụ `HOST_ONLY` nếu không có quyền), dispatch toast thông báo lỗi qua `uiSlice.addToast`.
  2. Export `startGame` từ `src/store/thunks/index.ts`.

---

### Đầu việc 2: Xây dựng các Component con cho Lobby (`src/components/lobby/`)
Tuân thủ nguyên tắc thiết kế **Text-only UI** (không dùng icon hay emoji ngoại trừ các khối bracket chuẩn `[ ... ]`), màu sắc Dark Mode theo token [globals.css](file:///d:/project/Food-guess/src/app/globals.css).

1. **`RoomConfigCard.tsx` (Khối cấu hình & Thông tin phòng):**
   - Hiển thị mã phòng lớn in hoa font monospace (`code-token` / amber).
   - Nút `[ SAO CHÉP LIÊN KẾT MỜI ]`:
     - Sao chép `${window.location.origin}/room/${code}` vào clipboard.
     - Đổi text sang `[ ĐÃ SAO CHÉP ]` trong 2 giây rồi hoàn lại.
   - Bảng thông số từ `snapshot.config`:
     - Số vòng thi: `X vòng` (5–50).
     - Thời gian mỗi câu: `Y giây` (10–120s).
     - Tự động chuyển vòng: `[ BẬT ]` / `[ TẮT ]`.
     - Điểm thưởng combo: `[ BẬT ]` / `[ TẮT ]`.

2. **`PlayerCard.tsx` (Thẻ người chơi đơn lẻ):**
   - Avatar ký tự đầu tiên của tên (chữ nhật bo góc `rounded-lg`, nền gradient hổ phách tối giản).
   - Tên người chơi: Nếu là người dùng hiện tại (`viewer.id === player.id`), thêm nhãn `(Bạn)`.
   - Huy hiệu `[ CHỦ PHÒNG ]`: Viền hổ phách, chữ amber đậm.
   - Trạng thái mạng: Text `[ TRỰC TUYẾN ]` (xanh lá Emerald) hoặc `[ NGOẠI TUYẾN ]` (xám mờ).

3. **`PlayerList.tsx` (Danh sách người chơi trong phòng):**
   - Header sĩ số: `DANH SÁCH NGƯỜI CHƠI (X/50)` và `SỐ NGƯỜI ONLINE: Y`.
   - Grid / danh sách các thẻ `PlayerCard` (memoized để tránh render thừa khi có nhiều cập nhật snapshot).
   - Thanh cuộn tối giản cho phòng đông người.
   - Trạng thái rỗng (fallback khi chưa có danh sách).

4. **`HostControls.tsx` (Khối điều khiển bắt đầu trận đấu):**
   - **Góc nhìn Host (`viewer.isHost === true`):**
     - Nút hành động chính: `[ BẮT ĐẦU VÁN CHƠI ]` (`bg-primary-container`, font-mono bold uppercase).
     - Trạng thái đang gửi lệnh: `[ ĐANG KHỞI TẠO VÁN CHƠI... ]` (disable nút tránh click đúp).
     - Thông báo trạng thái nếu chỉ có 1 người: dòng text nhỏ nhắc nhở host có thể chờ thêm bạn bè cùng chơi.
   - **Góc nhìn Người tham gia (`viewer.isHost === false`):**
     - Khung thông báo trạng thái: `[ ĐANG CHỜ CHỦ PHÒNG BẮT ĐẦU TRẬN ĐẤU... ]` kèm hiệu ứng text pulse nhấp nháy nhẹ.

5. **`RoomClosedModal.tsx` (Xử lý khi phòng bị hủy/giải tán):**
   - Kích hoạt khi `closedReason === "ROOM_CLOSED"`.
   - Thông báo: `[ PHÒNG CHƠI ĐÃ ĐƯỢC GIẢI TÁN HOẶC ĐÓNG BỞI CHỦ PHÒNG ]`.
   - Nút hành động: `[ QUAY VỀ SẢNH CHỜ CHÍNH ]` (gọi cleanup session và điều hướng về `/`).

6. **`LobbyView.tsx` (Component tổng hợp sảnh chờ):**
   - Bố cục 2 cột (hoặc xếp chồng trên thiết bị di động):
     - Cột trái (hoặc trên): `RoomConfigCard` + `HostControls`.
     - Cột phải (hoặc dưới): `PlayerList`.
   - Xuất khẩu tại `src/components/lobby/index.ts`.

---

### Đầu việc 3: Tích hợp `LobbyView` vào trang `/room/[code]`
- **Tập tin:** `src/app/room/[code]/page.tsx`
- **Mô tả công việc:**
  1. Khi `sessionStatus === "joined"` và `snapshot?.phase === "lobby"`, chuyển toàn bộ nội dung tạm thời sang `LobbyView`.
  2. Nút `[ RỜI PHÒNG ]` trên header:
     - Gọi `dispatch(leaveRoom({ code }))`.
     - Xóa dữ liệu phiên trong thiết bị và điều hướng về `/`.
  3. Xử lý khi `snapshot?.phase === "playing"`: Hiển thị trạng thái chuyển tiếp mượt mà để chuẩn bị đón nhận Phase 4.
  4. Lắng nghe `selectClosedReason` để hiển thị `RoomClosedModal`.

---

### Đầu việc 4: Cập nhật Dev Preview & Kiểm thử
- **Tập tin:** `src/app/dev/preview/page.tsx`
- **Mô tả công việc:**
  1. Cập nhật preview của Phase Lobby tại `/dev/preview` để kiểm tra trực quan cả 2 góc nhìn:
     - Góc nhìn Host (thấy nút bắt đầu).
     - Góc nhìn Người chơi thường (thấy hộp chờ chủ phòng).
  2. Kiểm thử nút sao chép link mời trên trình duyệt.
  3. Kiểm thử đóng phòng (`closedReason`).
  4. Chạy kiểm tra TypeScript (`tsc --noEmit` hoặc `npm run build`) để đảm bảo không có lỗi kiểu dữ liệu.

---

## 4. Bảng phân công Tập tin (File Map)

| Tập tin | Hành động | Mục đích |
|---|:---:|---|
| `src/store/thunks/gameThunks.ts` | Tạo mới | Thunk `startGame` gửi `food-guess:start` |
| `src/store/thunks/index.ts` | Chỉnh sửa | Re-export `startGame` |
| `src/components/lobby/PlayerCard.tsx` | Tạo mới | Thẻ thông tin người chơi đơn lẻ |
| `src/components/lobby/PlayerList.tsx` | Tạo mới | Danh sách cuộn toàn bộ người chơi realtime |
| `src/components/lobby/RoomConfigCard.tsx` | Tạo mới | Cấu hình phòng thi đấu & Nút copy link |
| `src/components/lobby/HostControls.tsx` | Tạo mới | Nút bắt đầu (Host) / Khung chờ (Người chơi) |
| `src/components/lobby/RoomClosedModal.tsx` | Tạo mới | Modal thông báo khi phòng bị đóng |
| `src/components/lobby/LobbyView.tsx` | Tạo mới | Container ghép nối toàn bộ giao diện Lobby |
| `src/components/lobby/index.ts` | Chỉnh sửa | Barrel export các component của Lobby |
| `src/app/room/[code]/page.tsx` | Chỉnh sửa | Tích hợp `LobbyView` và xử lý lifecycle |
| `src/app/dev/preview/page.tsx` | Chỉnh sửa | Cập nhật dev preview cho Lobby |

---

## 5. Tiêu chí Hoàn thành (Definition of Done)

- [x] Host thấy cấu hình phòng, danh sách người chơi và nút `[ BẮT ĐẦU VÁN CHƠI ]`.
- [x] Người chơi thường thấy cấu hình phòng, danh sách người chơi và trạng thái `[ ĐANG CHỜ CHỦ PHÒNG... ]`.
- [x] Danh sách người chơi hiển thị đúng số lượng, trạng thái Online/Offline và huy hiệu Host.
- [x] Sao chép được link mời với thông báo phản hồi `[ ĐÃ SAO CHÉP ]`.
- [x] Bấm `[ RỜI PHÒNG ]` dọn dẹp sạch sẽ session và quay về trang chủ.
- [x] Khi phòng bị đóng (`closedReason === "ROOM_CLOSED"`), hiển thị modal thông báo và nút quay về Hub.
- [x] Build dự án sạch sẽ, không có cảnh báo hay lỗi lint/TypeScript (`npm run build` exit code 0).
