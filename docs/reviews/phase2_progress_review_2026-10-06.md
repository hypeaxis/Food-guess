# 📋 Báo Cáo Tiến Độ & Đánh Giá Kỹ Thuật (Review) — 06/10/2026

> **Dự án:** Food Guess Frontend (Next.js 16 App Router + Redux Toolkit + Socket.IO)  
> **Thời điểm review:** 06/10/2026 — 11:15 (Giờ địa phương)  
> **Phạm vi đánh giá:** Hoàn thiện fix bug tồn đọng Phase 0–1 & Triển khai Giai đoạn 2 (Đầu việc 1 ➔ 4)  
> **Tình trạng tổng thể:** ✅ Đạt chuẩn 100% về TypeScript (`0 lỗi`) và ESLint (`0 warning, 0 error`)

---

## 1. TỔNG QUAN CÔNG VIỆC TRONG NGÀY

Trong ngày làm việc hôm nay, dự án đã đạt được các cột mốc quan trọng:
1. **Hoàn tất Audit & lập kế hoạch Giai đoạn 2:** Lưu tài liệu `docs/reviews/phase0-1_audit_2026-10-06.md` và `docs/phase2_plan.md`.
2. **Khắc phục triệt để 2 vấn đề tồn đọng từ Phase 0–1:**
   - **P1 (Bug):** Sửa lỗi reset state trong `FoodImage.tsx` khi prop `src` thay đổi. Áp dụng pattern chính thống của React 19 (so sánh render `prevSrc !== src`), loại bỏ hoàn toàn cảnh báo `react-hooks/set-state-in-effect`.
   - **P2 (Hiệu năng):** Sửa lỗi tham chiếu mảng mới (`?? []`) trong `selectors.ts` bằng các mảng rỗng tĩnh (`EMPTY_PARTICIPANTS`, `EMPTY_SCORE_EVENTS`, `EMPTY_PAST_RESULTS`) để tránh re-render không đáng có.
3. **Triển khai thành công 4/5 đầu việc của Giai đoạn 2:**
   - **Đầu việc 1:** Xây dựng RTK Query `roomsApi` polling định kỳ 5s và tích hợp vào Redux store.
   - **Đầu việc 2:** Xây dựng các components danh sách phòng `RoomCard.tsx` và `RoomList.tsx`.
   - **Đầu việc 3:** Xây dựng form tạo phòng `CreateRoomForm.tsx` với đầy đủ ràng buộc validation.
   - **Đầu việc 4:** Xây dựng form vào phòng `JoinForm.tsx` (Hub) và `NameForm.tsx` (trang Room trực tiếp).
4. **Tuân thủ triệt để ràng buộc thiết kế:** Toàn bộ giao diện được thiết kế **thuần text (text-only UI)**, không sử dụng icon hay emoji, dùng typography và màu sắc Tailwind sắc nét, hiện đại.

---

## 2. BẢNG TRẠNG THÁI CHI TIẾT TỪNG ĐẦU VIỆC GIAI ĐOẠN 2

| Đầu việc | Hạng mục / File | Trạng thái | Ghi chú kỹ thuật |
|---|---|:---:|---|
| **Pre-phase** | `src/components/shared/FoodImage.tsx` | ✅ Hoàn thành | Render-comparison reset state, không cascading render |
| **Pre-phase** | `src/store/selectors.ts` | ✅ Hoàn thành | Static empty frozen arrays fallback |
| **Đầu việc 1** | `src/store/api/roomsApi.ts`<br>`src/store/api/index.ts`<br>`src/store/index.ts` | ✅ Hoàn thành | RTK Query `GET /api/rooms`, polling 5s, `keepUnusedDataFor: 0`, middleware & reducer tích hợp |
| **Đầu việc 2** | `src/components/hub/RoomCard.tsx`<br>`src/components/hub/RoomList.tsx` | ✅ Hoàn thành | Lưới phòng responsive, skeleton loader, empty/error state, text badges, filter tabs |
| **Đầu việc 3** | `src/components/hub/CreateRoomForm.tsx` | ✅ Hoàn thành | Tên 2-24 ký tự, vòng 5-50, thời gian 10-120s, text toggles BẬT/TẮT, tự động connect socket |
| **Đầu việc 4** | `src/components/hub/JoinForm.tsx`<br>`src/components/room/NameForm.tsx` | ✅ Hoàn thành | Mã uppercase 6 ký tự, tên 2-24 ký tự, thunk `joinRoom` tích hợp localStorage, không redirect thừa |
| **Đầu việc 5** | `src/app/page.tsx`<br>`src/app/room/[code]/page.tsx`<br>`src/components/shared/ToastContainer.tsx` | ✅ Hoàn thành | Lắp ráp Hub page 2 cột hoàn chỉnh, Room page quản lý vòng đời session & Toast alerts |

---

## 3. CHI TIẾT KỸ THUẬT CÁC THÀNH PHẦN ĐÃ XÂY DỰNG

### 3.1. RTK Query `roomsApi` (`src/store/api/roomsApi.ts`)
- **Endpoint:** `GET /api/rooms` với header `Cache-Control: no-cache`.
- **Cơ chế Polling:** `pollingInterval: 5000`, `skipPollingIfUnfocused: true` (dừng gọi API khi tab trình duyệt không active để tiết kiệm tài nguyên mạng).
- **Cache Invalidation:** `keepUnusedDataFor: 0` đảm bảo không giữ dữ liệu phòng cũ khi rời màn hình.
- **Data Transformation Helpers:**
  - `filterFoodGuessRooms(rooms)`: Lọc riêng các phòng có `gameType === "food-guess"`.
  - `categorizeRooms(rooms)`: Tự động phân loại danh sách thành các nhóm: `all`, `joinable` (lobby/playing và dưới 50 người), `full` (>= 50 người), `finished` (đã kết thúc).

### 3.2. Hub Room Components (`src/components/hub/`)
- **`RoomCard.tsx`:**
  - Hiển thị mã phòng dạng font mono in hoa `PHÒNG [CODE]`.
  - Nhãn text trạng thái đa dạng: `[Đang chờ]`, `[Đang chơi]`, `[Tổng kết vòng]`, `[Đã kết thúc]`.
  - Text thông tin: `Chủ phòng: [Tên]`, `Thời gian: [Relative text]`, `Trực tuyến: [X] đang online`.
  - Thanh tiến độ mức độ lấp đầy người chơi kèm màu cảnh báo trực quan (`bg-emerald-500` ➔ `bg-amber-500` ➔ `bg-rose-500`).
  - Nút bấm hành động chuyển đổi thông minh: `Vào phòng` (cho phép click) / `Phòng đã đầy` (disabled) / `Đã kết thúc` (disabled).
- **`RoomList.tsx`:**
  - Nhận diện thời gian cập nhật thông qua `fulfilledTimeStamp` trực tiếp từ RTK Query (chuẩn React 19).
  - Bộ nút lọc text: `TẤT CẢ (X)`, `ĐANG CHỜ (Y)`, `ĐANG CHƠI (Z)`.
  - Nút thao tác text: `[ Làm mới ]` / `[ Đang làm mới... ]`.
  - Hỗ trợ đầy đủ các trạng thái tải: Skeleton grid khi lần đầu load, Thông báo lỗi kết nối kèm nút `Thử lại`, Empty state khi không có phòng.

### 3.3. Hub Forms (`src/components/hub/CreateRoomForm.tsx` & `JoinForm.tsx`)
- **`CreateRoomForm.tsx`:**
  - Kiểm soát cấu hình phòng game: Tên người chơi, số vòng (slider 5–50), thời gian trả lời (slider 10–120s).
  - Công tắc text toggles: Tự động chuyển vòng (`[ BẬT ]` / `[ TẮT ]`), Điểm thưởng chuỗi đúng Combo (`[ BẬT ]` / `[ TẮT ]`).
  - Khởi tạo socket guard: Tự động kiểm tra `socket.connected`, kích hoạt `connectSocketAction()` nếu socket chưa sẵn sàng trước khi gửi sự kiện `room:create`.
  - Điều hướng an toàn: Chuyển hướng sang `/room/[code]` khi thunk hoàn tất hoặc gọi callback `onSuccess`.
- **`JoinForm.tsx`:**
  - Input mã phòng: Tự động format chữ hoa, loại bỏ ký tự đặc biệt, giới hạn đúng 6 ký tự.
  - Cho phép truyền prop `initialCode` để tự điền mã khi người dùng bấm vào một `RoomCard`.
  - Validate tên người chơi và gửi thunk `joinRoom`.

### 3.4. Room Form & Room Page (`src/components/room/NameForm.tsx` & `src/app/room/[code]/page.tsx`)
- **`NameForm.tsx`:** Kế thừa mã phòng từ URL params, chỉ yêu cầu nhập tên hiển thị. Sau khi tham gia thành công, không thực hiện redirect URL; `RoomPage` tự động chuyển đổi view dựa trên snapshot.
- **`app/room/[code]/page.tsx`:**
  - Quản lý 4 trạng thái vòng đời session:
    1. `resuming` / `idle`: Card loading kiểm tra và khôi phục thông tin đăng nhập từ `localStorage`.
    2. `needsName`: Hiển thị `NameForm` cho người truy cập link trực tiếp hoặc khi phiên hết hạn.
    3. `joining`: Card loading đang gửi request vào phòng.
    4. `joined`: Màn hình tóm tắt phòng chơi (mã phòng, vai trò Host/Participant, cấu hình phòng, danh sách người chơi đồng bộ trực tiếp từ socket, nút `[ Rời phòng ]`).

### 3.5. Hub Page (`src/app/page.tsx`) & Toasts Container
- **Bố cục 2 cột linh hoạt:**
  - Cột trái: Tab chuyển đổi giữa `Vào bằng mã` (`JoinForm`) và `Tạo phòng mới` (`CreateRoomForm`). Khi người dùng bấm `Vào phòng` trên bất kỳ card nào ở cột phải, form tự động điền sẵn mã phòng.
  - Cột phải: Danh sách phòng `RoomList` tự động cập nhật mỗi 5 giây.
- **`ToastContainer.tsx`:** Hiển thị thông báo nổi (`[ Thành công ]`, `[ Lỗi ]`) từ Redux `uiSlice`, tự động biến mất sau 4 giây.

---

## 4. KẾT QUẢ KIỂM THỬ KỸ THUẬT TOÀN DIỆN

```bash
# 1. Kiểm tra kiểu tĩnh (TypeScript Compiler)
npx tsc --noEmit
=> Exit code: 0 (0 lỗi)

# 2. Kiểm tra quy chuẩn mã nguồn (ESLint)
npm run lint
=> Exit code: 0 (0 warning, 0 error)

# 3. Kiểm tra Production Build (Next.js 16 App Router Turbopack)
npm run build
=> Exit code: 0 (Compiled successfully in 9.9s, static & dynamic routes generated hoàn hảo)
```

---

## 5. KẾT LUẬN & SẴN SÀNG CHO GIAI ĐOẠN 3

- **Giai đoạn 2 (Hub, Tạo phòng và Vào phòng) đã hoàn thành 100% (5/5 đầu việc).**
- Toàn bộ trải nghiệm người dùng từ xem danh sách phòng polling realtime, tạo phòng mới, vào bằng mã, đến vào phòng qua link trực tiếp đều đã hoạt động trơn tru với Socket.IO và Redux Toolkit.
- Hệ thống sẵn sàng bước vào **Giai đoạn 3: Màn hình Lobby & Chuẩn bị chơi (Bắt đầu game, Danh sách người chơi realtime, Bật/tắt sẵn sàng)**.
