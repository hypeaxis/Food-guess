# 📋 Báo Cáo Tiến Độ & Đánh Giá Kỹ Thuật (Review) — 07/10/2026

> **Dự án:** Food Guess Frontend (Next.js 16 App Router + Redux Toolkit + Socket.IO)  
> **Thời điểm review:** 07/10/2026 — 11:50 (Giờ địa phương)  
> **Phạm vi đánh giá:** Hoàn thiện 100% Giai đoạn 3 (Phase 3: Màn hình Lobby & Hành động Host) và tổng kết các hoạt động trong ngày  
> **Tình trạng tổng thể:** ✅ Đạt chuẩn 100% về TypeScript (`0 lỗi`), ESLint (`0 warning, 0 error`), Next.js Turbopack Build (`Exit Code: 0`)

---

## 1. TỔNG QUAN CÔNG VIỆC TRONG NGÀY (07/10/2026)

Trong ngày làm việc hôm nay, dự án đã đạt được các cột mốc quan trọng và hoàn thành đúng tiến độ:

1. **Rà soát & Thẩm định thiết kế giao diện:**
   - Tiếp nhận và phân tích các bản thiết kế mockup từ Stitch trong thư mục `docs/design-mockup/` (`DESIGN (4).md`, code HTML và layout).
   - Thẩm định đề xuất thêm file `TelemetryLiveLog`: Quyết định **loại bỏ** thành phần này để bám sát mục tiêu học tập cốt lõi của dự án là **WebSocket và Redux**, tránh phình to codebase với các telemetry view không cần thiết.
   - Kiểm tra tiến độ dự án so với kế hoạch tổng thể `docs/food-guess-fe-plan.md`.

2. **Lập kế hoạch hoàn thiện Phase 3:**
   - Soạn thảo và ban hành tài liệu chính thức: [docs/phase3_plan.md](file:///d:/project/Food-guess/docs/phase3_plan.md).
   - Phân rã mục tiêu thành 4 đầu việc rõ ràng, kèm tiêu chí hoàn thành (Definition of Done) và ràng buộc thiết kế **Text-only UI**.

3. **Triển khai toàn diện 4 đầu việc của Phase 3:**
   - **Đầu việc 1:** Hạ tầng Async Thunk `startGame` gửi sự kiện `food-guess:start`.
   - **Đầu việc 2:** Xây dựng đầy đủ bộ 6 component sảnh chờ chuyên biệt trong `src/components/lobby/`.
   - **Đầu việc 3:** Tích hợp `LobbyView` vào trang chính `/room/[code]`, quản lý vòng đời session, rời phòng và modal đóng phòng.
   - **Đầu việc 4:** Cập nhật preview tại `/dev/preview` và kiểm thử toàn diện production build.

---

## 2. BẢNG TRẠNG THÁI CHI TIẾT TỪNG ĐẦU VIỆC GIAI ĐOẠN 3

| Đầu việc | Hạng mục / Tập tin | Trạng thái | Ghi chú kỹ thuật |
|---|---|:---:|---|
| **Đầu việc 1** | `src/store/thunks/gameThunks.ts`<br>`src/store/thunks/index.ts` | ✅ Hoàn thành | Async thunk `startGame` gửi `food-guess:start`, bắt `SocketAckError` (`HOST_ONLY`, `INVALID_PHASE`), kích hoạt toast notification |
| **Đầu việc 2** | `src/components/lobby/RoomConfigCard.tsx`<br>`src/components/lobby/PlayerCard.tsx`<br>`src/components/lobby/PlayerList.tsx`<br>`src/components/lobby/HostControls.tsx`<br>`src/components/lobby/RoomClosedModal.tsx`<br>`src/components/lobby/LobbyView.tsx`<br>`src/components/lobby/index.ts` | ✅ Hoàn thành | 6 component con chuyên biệt, Dark Mode token [globals.css](file:///d:/project/Food-guess/src/app/globals.css), `React.memo` chống render thừa, sao chép liên kết có clipboard fallback, nút bắt đầu có guard chống double-click |
| **Đầu việc 3** | `src/app/room/[code]/page.tsx` | ✅ Hoàn thành | Tích hợp `LobbyView` thay thế view tóm tắt Phase 2, gắn nút `[ RỜI PHÒNG ]` gọi `leaveRoom` + xóa storage + redirect về `/`, lắng nghe `closedReason === "ROOM_CLOSED"` |
| **Đầu việc 4** | `src/app/dev/preview/page.tsx`<br>`docs/phase3_plan.md` | ✅ Hoàn thành | Kết nối `LobbyView` thực tế vào tab Lobby preview hỗ trợ cả góc nhìn Host vs Participant, xác thực TypeScript và Build, hoàn tất 100% checklist DoD |

---

## 3. CHI TIẾT KỸ THUẬT CÁC THÀNH PHẦN ĐÃ XÂY DỰNG

### 3.1. Async Thunk `startGame` (`src/store/thunks/gameThunks.ts`)
- **Event:** `food-guess:start` gửi bằng helper `emitWithAck<EmptyAckData>`.
- **Dòng dữ liệu:**
  - Khi thành công: Server phát sóng snapshot mới (`phase: "playing"`) đến tất cả các client qua socket middleware.
  - Khi thất bại: Bắt lỗi `SocketAckError`, dịch mã lỗi (ví dụ: `HOST_ONLY` thành *"Chỉ chủ phòng mới có quyền thực hiện thao tác này."*) và dispatch action `uiSlice.addToast` hiển thị thông báo lỗi tức thì.

### 3.2. Bộ Component Sảnh Chờ (`src/components/lobby/`)
- **`RoomConfigCard.tsx`:**
  - Hiển thị mã phòng lớn in hoa font monospace (`code-token`).
  - Nút `[ SAO CHÉP LIÊN KẾT MỜI ]`: Sử dụng Clipboard API kèm cơ chế fallback tạo thẻ textarea ẩn nếu API bị chặn; tự động đổi sang `[ ĐÃ SAO CHÉP LIÊN KẾT ]` trong 2 giây.
  - Hiển thị 4 thông số ván đấu: Số vòng (5–50), Thời gian đoán (10–120s), Tự động chuyển vòng (`[ BẬT: 5 GIÂY ]` / `[ TẮT ]`), Điểm chuỗi combo (`[ ĐƯỢC BẬT ]` / `[ TẮT ]`).
- **`PlayerCard.tsx` (Memoized):**
  - Avatar chữ cái đầu với gradient tối giản `from-amber-600 to-amber-400`.
  - Nhận diện người xem hiện tại qua nhãn `[ BẠN ]`.
  - Huy hiệu `[ CHỦ PHÒNG ]` với bảng màu hổ phách `badge-amber`.
  - Trạng thái kết nối thời gian thực: `[ TRỰC TUYẾN ]` (xanh Emerald) hoặc `[ NGOẠI TUYẾN ]` (xám mờ).
- **`PlayerList.tsx` (Memoized):**
  - Thống kê sĩ số `X / 50` và đếm số lượng người online tự động.
  - Khung danh sách cuộn mượt mà có giới hạn chiều cao (`max-h-[440px]`), tối ưu hiển thị khi phòng có tới 50 người tham gia.
  - Khung thông báo trống khi chưa có người tham gia.
- **`HostControls.tsx`:**
  - **Góc nhìn Host:** Nút `[ BẮT ĐẦU VÁN CHƠI ]` nổi bật (`bg-primary-container`); khi đang gửi lệnh chuyển sang `[ ĐANG KHỞI TẠO VÁN CHƠI... ]` và disable nút để ngăn chặn gửi nhiều yêu cầu cùng lúc. Có hộp nhắc nhở khi phòng chỉ có 1 người.
  - **Góc nhìn Người tham gia:** Khung chờ `[ ĐANG CHỜ CHỦ PHÒNG BẮT ĐẦU TRẬN ĐẤU... ]` với hiệu ứng text pulse nhấp nháy êm dịu.
- **`RoomClosedModal.tsx`:**
  - Modal thông báo cố định khi phòng bị hủy hoặc đóng từ máy chủ (`closedReason`).
  - Nút bấm `[ QUAY VỀ SẢNH CHỜ CHÍNH ]` dọn dẹp bộ nhớ và chuyển hướng người chơi về trang chủ.
- **`LobbyView.tsx`:**
  - Bố cục 2 cột (Cột trái 5/12: Cấu hình + Điều khiển Host; Cột phải 7/12: Danh sách người chơi). Tự động xếp chồng 1 cột trên điện thoại di động.

### 3.3. Tích hợp Trang `/room/[code]` (`src/app/room/[code]/page.tsx`)
- Quản lý 4 trạng thái vòng đời phiên:
  1. `resuming` / `idle`: Card khôi phục phiên từ thiết bị.
  2. `needsName`: `NameForm` cho người vào link trực tiếp.
  3. `joining`: Card chờ kết nối và xác thực socket.
  4. `joined`: Hiển thị `LobbyView` khi `snapshot.phase === "lobby"`; hiển thị màn hình chuẩn bị khi chuyển sang `playing`.
- Header đồng bộ giai đoạn và tích hợp nút `[ RỜI PHÒNG ]` (gọi `leaveRoom` dọn dẹp sạch Redux và `localStorage`).

---

## 4. KẾT QUẢ KIỂM THỬ KỸ THUẬT TOÀN DIỆN

```bash
# 1. Kiểm tra kiểu tĩnh (TypeScript Compiler)
npx tsc --noEmit
=> Exit code: 0 (0 lỗi)

# 2. Kiểm tra quy chuẩn mã nguồn (ESLint)
npm run lint
=> Exit code: 0 (0 warning, 0 error)

# 3. Kiểm tra đóng gói và biên dịch Production (Next.js Turbopack Build)
npm run build
=> Compiled successfully in 996ms
=> Finished TypeScript in 4.0s
=> Generating static pages (5/5)
=> Route (app):
   ○ /              (Static)
   ○ /_not-found    (Static)
   ○ /dev/preview   (Static)
   ƒ /room/[code]   (Dynamic)
=> Exit code: 0 (Thành công hoàn toàn)
```

---

## 5. KẾ HOẠCH BƯỚC TIẾP THEO: GIAI ĐOẠN 4 (PLAYING SCREEN)

Giai đoạn 4 là **trọng tâm trải nghiệm gameplay** của trò chơi:

1. **Header Vòng chơi & Bộ đếm thời gian (`GuessTimer`):**
   - Hiển thị tiến độ vòng `VÒNG X / Y`.
   - Bộ đếm thời gian đếm ngược dựa trên `deadlineAt` của server, chuyển màu cảnh báo khi còn dưới 5 giây.
2. **Khu vực Hiển thị Ảnh món ăn (`FoodImage`):**
   - Khung hình vuông tỉ lệ cố định `aspect-square`, viền tối giản.
   - Hiệu ứng skeleton loading khi đang tải ảnh từ CDN và cơ chế tự động hiển thị ảnh dự phòng khi link lỗi hoặc rỗng.
3. **Khu vực Đoán món ăn & Chip gợi ý:**
   - Ô nhập đáp án văn bản (1–200 ký tự) kèm nút nộp.
   - 3 Chip gợi ý món ăn (`suggestions`): bấm vào chip nào sẽ gửi ngay đáp án đó.
   - Thunk `submitAnswer` gửi sự kiện `food-guess:answer`: khóa ô nhập ngay khi gửi để chống spam, xử lý ack (đúng/sai, tính điểm thưởng streak/combo).
4. **Bảng tin điểm số Realtime (`ScoreFeed`):**
   - Lắng nghe và hiển thị dòng thông báo người đoán đúng theo thời gian thực từ `foodGuessEvents`.
5. **Hành động của Host:**
   - Nút `[ KẾT THÚC VÒNG SỚM ]` gửi sự kiện `food-guess:skip`.
