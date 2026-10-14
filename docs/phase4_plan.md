# Kế hoạch Hoàn thiện Phase 4: Màn hình Playing & Gameplay Đoán Món Ăn

> **Tài liệu tham chiếu:**
> - [docs/food-guess-fe-plan.md](file:///d:/project/Food-guess/docs/food-guess-fe-plan.md) (Giai đoạn 4)
> - [docs/ui_screens_design_spec.md](file:///d:/project/Food-guess/docs/ui_screens_design_spec.md) (Mục 4.2)
> - [src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css) (Bộ Design Tokens & Màu sắc)

---

## 1. Mục tiêu và Phạm vi (Scope & Objectives)

Phase 4 là **trọng tâm gameplay cốt lõi** của Food Guess, được kích hoạt khi máy chủ phát tán snapshot có `snapshot.phase === "playing"`.

### Các tính năng cốt lõi:
1. **Thông tin tiến độ & Bộ đếm thời gian:**
   - Hiển thị tiến trình vòng đấu `VÒNG X / Y` và sĩ số đã nộp `ĐÃ NỘP: M / N NGƯỜI`.
   - Bộ đếm thời gian `GuessTimer` đếm ngược chính xác theo mốc `deadlineAt`, đổi màu cảnh báo nhấp nháy khi còn dưới 5 giây.
2. **Khung hiển thị ảnh món ăn (`FoodDisplay`):**
   - Khung hình vuông cố định tỉ lệ `aspect-square` tránh layout shift.
   - Hiệu ứng skeleton loading mượt mà và tự động thay thế ảnh dự phòng khi URL lỗi hoặc rỗng.
3. **Cơ chế nộp đáp án:**
   - Ô nhập văn bản hỗ trợ gõ tiếng Việt (1–200 ký tự).
   - 3 Chip gợi ý nhanh (`suggestions`): bấm vào chip sẽ **gửi ngay lập tức** đáp án đó lên máy chủ.
   - Thunk `submitAnswer` gửi sự kiện `food-guess:answer` kèm `{ roundId, answer }`.
   - Khóa input ngay khi bấm gửi hoặc khi `viewerAnswered === true` (bao phủ cả trường hợp F5 sau khi đã nộp).
4. **Phản hồi kết quả tức thì (Toast Feedback):**
   - Đúng: Toast thông báo chúc mừng kèm điểm số và hệ số combo (nếu `comboApplied` thì ghi rõ ví dụ: `[ CHÍNH XÁC: +350đ // COMBO x1.4 ]`).
   - Sai: Toast thông báo `[ CHƯA CHÍNH XÁC: Chờ hết giờ để xem đáp án ]`.
5. **Bảng tin điểm số thời gian thực (`ScoreFeed`):**
   - Hiển thị các sự kiện trôi lên từ `foodGuessEvents` khi có người chơi trong phòng nộp bài đúng.
6. **Quyền hạn Host:**
   - Nút `[ KẾT THÚC VÒNG SỚM ]` gửi sự kiện `food-guess:skip` dành riêng cho Host.

---

## 2. Kiến trúc & Dòng dữ liệu (Architecture & Data Flow)

```
[ Người chơi ] ── Gõ đáp án / Bấm Chip ──► emitWithAck("food-guess:answer", { roundId, answer })
     │                                                    │
     │ ◄── Trả về Ack { correct, points, streak, ... } ────┘
     │     Dispatch Toast (Điểm / Combo) & Khóa Input
     │
[ Host ] ──────── Bấm "Kết thúc vòng sớm" ──► emitWithAck("food-guess:skip")
     │                                                    │
     │ ◄── Server chuyển sang roundReveal ────────────────┘
     │
[ Server ] ────── Phát snapshot / scoreEvents ──► socketMiddleware -> Redux
     │
     └── Cập nhật: submittedCount, ScoreFeed, phase
```

---

## 3. Danh sách Đầu việc Chi tiết (Work Breakdown Structure)

### Đầu việc 1: Hạ tầng Async Thunk & Quản lý Action (`gameThunks.ts`)
- **Tập tin:**
  - Chỉnh sửa: `src/store/thunks/gameThunks.ts`
  - Chỉnh sửa: `src/store/thunks/index.ts`
- **Mô tả công việc:**
  1. Viết thunk `submitAnswer = createAsyncThunk("game/answer", ...)`:
     - Nhận tham số `{ roundId: string, answer: string }`.
     - Gửi socket event `food-guess:answer` qua `emitWithAck<AnswerAckData, AnswerPayload>`.
     - Ack thành công: Bắn toast kết quả (đúng/sai, cộng điểm, combo) qua `uiSlice.addToast`.
     - Ack thất bại: Bắt `SocketAckError` (`TOO_LATE`, `ALREADY_ANSWERED`, `ROUND_MISMATCH`), thông báo lỗi tương ứng.
  2. Viết thunk `skipRound = createAsyncThunk("game/skip", ...)`:
     - Gửi socket event `food-guess:skip` qua `emitWithAck<EmptyAckData>`.
     - Bắt lỗi `HOST_ONLY` nếu không có quyền.
  3. Export `submitAnswer` và `skipRound` từ `src/store/thunks/index.ts`.

---

### Đầu việc 2: Xây dựng Bộ Component Gameplay (`src/components/playing/`)
Tuân thủ nghiêm ngặt nguyên tắc **Text-only UI** (không dùng icon hay emoji ngoại trừ các khối bracket chuẩn `[ ... ]`), màu sắc Dark Mode theo token [globals.css](file:///d:/project/Food-guess/src/app/globals.css).

1. **`GuessTimer.tsx` (Bộ đếm thời gian đếm ngược):**
   - Đếm ngược dựa trên mốc thời gian máy chủ `deadlineAt`: `remaining = Math.max(0, Math.ceil((deadlineAt - Date.now()) / 1000))`.
   - Thanh tiến độ (Progress bar) co ngắn lại theo % thời gian còn lại.
   - Nhãn thời gian: `[ THỜI GIAN: 18S ]`.
   - Cảnh báo trực quan khi `<= 5s`: Text đổi sang đỏ nhấp nháy (`text-rose-400 font-bold animate-pulse`).
   - Khi hết giờ (0s): Hiển thị `[ ĐÃ HẾT GIỜ ]`.
   - Dọn dẹp interval an toàn khi unmount.

2. **`PlayingHeader.tsx` (Thanh điều hướng thông tin vòng):**
   - Hiển thị: `VÒNG {roundNumber} / {totalRounds}`.
   - Thống kê nộp bài: `ĐÃ NỘP: {submittedCount} / {participantCount} NGƯỜI`.
   - Tích hợp `GuessTimer`.
   - Nút dành cho Host: `[ KẾT THÚC VÒNG SỚM ]` (kèm trạng thái loading khi đang gửi lệnh).

3. **`FoodDisplay.tsx` (Khung trình chiếu ảnh món ăn):**
   - Sử dụng [FoodImage.tsx](file:///d:/project/Food-guess/src/components/shared/FoodImage.tsx) với khung cố định tỉ lệ `aspect-square`.
   - Khung viền kỹ thuật, nhãn `[ MÓN ĂN BÍ ẨN #{roundNumber} ]`.
   - Tích hợp skeleton loading và ảnh dự phòng tự động khi URL lỗi hoặc rỗng.

4. **`GuessInput.tsx` (Ô nhập đáp án):**
   - Input văn bản hỗ trợ gõ tiếng Việt có dấu, giới hạn 1–200 ký tự.
   - Nút nộp: `[ GỬI ĐÁP ÁN ]` (hoặc `[ ĐANG NỘP... ]`).
   - Khóa ô nhập (`disabled`):
     - Khi người chơi bấm gửi (tránh spam / double-click).
     - Khi `viewerAnswered === true` từ server snapshot (bảo đảm cả khi F5 sau khi đã nộp).
     - Khi bộ đếm thời gian chạm mốc 0 giây.
   - Khi đã nộp: Hiển thị thông báo trạng thái `[ ĐÃ NỘP ĐÁP ÁN: ĐANG CHỜ TỔNG KẾT VÒNG... ]`.

5. **`SuggestionChips.tsx` (3 Chip gợi ý nhanh):**
   - 3 chip text chứa 3 gợi ý món ăn từ `snapshot.foodGuessRound.suggestions`.
   - Bấm vào bất kỳ chip nào sẽ **tự động nộp luôn** đáp án đó mà không cần gõ tay.
   - Tự động vô hiệu hóa các chip khi người chơi đã nộp bài hoặc hết giờ.

6. **`ScoreFeed.tsx` (Bảng tin nộp bài thời gian thực):**
   - Hiển thị danh sách sự kiện từ `snapshot.foodGuessEvents`.
   - Định dạng text: `[ {participantName}: ĐOÁN ĐÚNG! (+{points}đ) ]` kèm nhãn combo nếu có.
   - Cuộn tự động mượt mà, giới hạn số lượng tin hiển thị gần nhất.

7. **`PlayingView.tsx` (Component tổng hợp sảnh thi đấu):**
   - Ghép nối toàn bộ các component trên thành bố cục cân đối 2 cột:
     - **Phía trên:** `PlayingHeader`.
     - **Cột chính (Trái/Trên):** `FoodDisplay` ➔ `SuggestionChips` ➔ `GuessInput`.
     - **Cột phụ (Phải/Dưới):** `ScoreFeed` + Tóm tắt điểm số & streak cá nhân.
   - Xuất khẩu tại `src/components/playing/index.ts`.

---

### Đầu việc 3: Tích hợp `PlayingView` vào trang `/room/[code]`
- **Tập tin:** `src/app/room/[code]/page.tsx`
- **Mô tả công việc:**
  1. Khi `sessionStatus === "joined"` và `snapshot?.phase === "playing"`, chuyển sang render `PlayingView` thay thế cho khối placeholder hiện tại.
  2. Giữ nguyên các chức năng Header phòng (Mã phòng, Nút `[ RỜI PHÒNG ]`, Modal đóng phòng).
  3. Xử lý chuyển tiếp mượt mà khi vòng đấu kết thúc (server chuyển phase sang `roundReveal`).

---

### Đầu việc 4: Cập nhật Dev Preview & Kiểm thử Toàn diện
- **Tập tin:** `src/app/dev/preview/page.tsx`
- **Mô tả công việc:**
  1. Tích hợp `PlayingView` thực tế vào tab preview `playing`.
  2. Kiểm thử các trạng thái: Đang đếm ngược, còn < 5s, đã nộp bài, ảnh tải chậm / ảnh lỗi, bấm chip gợi ý.
  3. Chạy `npx tsc --noEmit`, `npm run lint` và `npm run build` đảm bảo 100% không lỗi.

---

## 4. Bảng phân công Tập tin (File Map)

| Tập tin | Hành động | Mục đích |
|---|:---:|---|
| `src/store/thunks/gameThunks.ts` | Chỉnh sửa | Bổ sung thunk `submitAnswer` và `skipRound` |
| `src/store/thunks/index.ts` | Chỉnh sửa | Re-export `submitAnswer` và `skipRound` |
| `src/components/playing/GuessTimer.tsx` | Tạo mới | Bộ đếm ngược thời gian từ `deadlineAt` |
| `src/components/playing/PlayingHeader.tsx` | Tạo mới | Header thông tin vòng chơi & nút skip của Host |
| `src/components/playing/FoodDisplay.tsx` | Tạo mới | Khung hiển thị ảnh món ăn và skeleton |
| `src/components/playing/SuggestionChips.tsx` | Tạo mới | 3 nút chip gợi ý nộp bài nhanh |
| `src/components/playing/GuessInput.tsx` | Tạo mới | Ô nhập và gửi đáp án đoán món ăn |
| `src/components/playing/ScoreFeed.tsx` | Tạo mới | Bảng tin realtime sự kiện nộp bài |
| `src/components/playing/PlayingView.tsx` | Tạo mới | Layout tổng hợp màn hình thi đấu Phase 4 |
| `src/components/playing/index.ts` | Chỉnh sửa | Barrel export các component playing |
| `src/app/room/[code]/page.tsx` | Chỉnh sửa | Render `PlayingView` khi `phase === "playing"` |
| `src/app/dev/preview/page.tsx` | Chỉnh sửa | Cập nhật tab preview playing thực tế |

---

## 5. Tiêu chí Hoàn thành (Definition of Done)

- [x] Hiển thị đầy đủ tiến độ vòng `VÒNG X / Y` và số người đã nộp.
- [x] Timer đếm ngược chính xác theo `deadlineAt`, chuyển cảnh báo màu đỏ khi còn <= 5 giây.
- [x] Ảnh món ăn hiển thị đúng tỉ lệ cố định `aspect-square`, có skeleton loading và fallback khi lỗi.
- [x] Nộp đáp án thành công bằng cả 2 cách: Gõ tay vào ô input hoặc Bấm trực tiếp vào 1 trong 3 chip gợi ý.
- [x] Khóa input và các chip gợi ý ngay lập tức sau khi nộp (cả khi F5 lại trang).
- [x] Hiển thị thông báo Toast kết quả đúng/sai kèm điểm số và hệ số combo chính xác.
- [x] Bảng tin `ScoreFeed` hiển thị các sự kiện nộp bài realtime từ phòng chơi.
- [x] Host có quyền bấm `[ KẾT THÚC VÒNG SỚM ]` gọi `skipRound`.
- [x] Toàn bộ dự án vượt qua kiểm tra TypeScript (`0 lỗi`), ESLint (`0 warning`) và build production sạch sẽ (`npm run build` exit code 0).
