# Kế hoạch Hoàn thiện Phase 5: Reveal và Finished (Màn hình Tổng kết & Kết thúc)

> **Tài liệu tham chiếu:**
> - [docs/food-guess-fe-plan.md](file:///d:/project/Food-guess/docs/food-guess-fe-plan.md) (Giai đoạn 5)
> - [docs/ui_screens_design_spec.md](file:///d:/project/Food-guess/docs/ui_screens_design_spec.md) (Mục 4.3 & 4.4)
> - [src/app/globals.css](file:///d:/project/Food-guess/src/app/globals.css) (Bộ Design Tokens & Dark Mode)

---

## 1. Mục tiêu và Phạm vi (Scope & Objectives)

Phase 5 hiện thực hóa 2 màn hình chuyển tiếp và kết thúc ván đấu của Food Guess, được kích hoạt khi máy chủ phát tán snapshot có `snapshot.phase === "roundReveal"` hoặc `snapshot.phase === "finished"`.

### Các tính năng cốt lõi:
1. **Màn hình Round Reveal (Tổng kết kết quả vòng thi - `phase === "roundReveal"`):**
   - **Công bố đáp án chính thức:** Hiển thị tên món ăn chuẩn `foodName` và ảnh chất lượng cao `resourceUrl` (dùng thẻ ảnh có tỉ lệ cố định, skeleton, fallback).
   - **Kết quả cá nhân (`ViewerRoundSummary`):** Hiển thị điểm số vòng này (`viewerPoints`), trạng thái đúng/sai (`viewerCorrect`), chuỗi combo hiện tại (`viewerStreak`).
   - **Bảng điểm vòng thi cả phòng (`RoundResultsTable`):** Liệt kê toàn bộ người chơi trong phòng từ `results: FoodGuessRoundResult[]`, sắp xếp theo điểm số đạt được trong vòng và trạng thái đúng/sai, hiển thị đáp án mỗi người đã nộp.
   - **Chuyển vòng tiếp theo (`RevealControls`):**
     - Nếu `autoNextRound === true`: Hiển thị bộ đếm ngược 5 giây tự động (`[ TỰ ĐỘNG QUA VÒNG MỚI SAU 5S... ]`).
     - Nếu `autoNextRound === false` và là Host: Nút bấm `[ VÒNG TIẾP THEO ]` (gọi sự kiện `food-guess:next`).
     - Nếu `autoNextRound === false` và là người chơi thông thường: Dòng chữ `[ ĐANG CHỜ CHỦ PHÒNG CHUYỂN VÒNG... ]`.
2. **Màn hình Finished (Vinh danh & Bảng xếp hạng chung cuộc - `phase === "finished"`):**
   - **Bục vinh danh Top 3 (`PodiumLeaderboard`):** Thiết kế bục 3 bậc Text-only (Hạng 1 - Quán quân viền vàng Amber, Hạng 2 - Á quân viền bạc Zinc, Hạng 3 - Quý quân viền đồng Amber-700).
   - **Bảng tổng sắp toàn bộ phòng (`FinalLeaderboard`):** Bảng xếp hạng từ hạng 1 đến 50, hiển thị thứ tự, tên người chơi, huy hiệu Host, số câu đúng (`correctAnswers / totalRounds`), tổng điểm (`score`).
   - **Lịch sử các vòng đấu (`PastRoundsAccordion`):** Xem lại toàn bộ dữ liệu lịch sử các vòng từ `foodGuessPastResults` (từng vòng có danh sách người đoán đúng, điểm thưởng).
   - **Bảng điều khiển kết thúc (`FinishedControls`):**
     - Dành cho Host: Nút `[ CHƠI LẠI TRẬN MỚI (REMATCH) ]` gửi sự kiện `food-guess:rematch`.
     - Nút `[ RỜI PHÒNG ]` cho tất cả người chơi.

---

## 2. Kiến trúc & Dòng Dữ Liệu (Architecture & Data Flow)

```
[ Máy chủ ] ── snapshot.phase === "roundReveal" ──► socketMiddleware -> Redux roomSlice
     │
     ├─► snapshot.foodGuessReveal { roundNumber, foodName, resourceUrl, results, ... }
     │
     ├─► Nếu autoNextRound === true ──► Đếm ngược 5s ──► Server tự động chuyển vòng mới
     │
     └─► Nếu autoNextRound === false ──► Host bấm [ VÒNG TIẾP THEO ] ──► emitWithAck("food-guess:next")

[ Máy chủ ] ── snapshot.phase === "finished" ──► socketMiddleware -> Redux roomSlice
     │
     ├─► snapshot.participants (Tổng điểm, số câu đúng, xếp hạng Top 1, 2, 3)
     ├─► snapshot.foodGuessPastResults (Lịch sử các vòng)
     │
     └─► Host bấm [ CHƠI LẠI (REMATCH) ] ──► emitWithAck("food-guess:rematch")
               │
               └─► Server reset ván đấu về phase "lobby", giữ nguyên người chơi trong phòng
```

---

## 3. Danh sách Đầu việc Chi tiết (Work Breakdown Structure)

### Đầu việc 1: Bổ sung Thunks Điều khiển Trận đấu (`gameThunks.ts`) — [x] ĐÃ HOÀN THÀNH
- **Tập tin:**
  - Chỉnh sửa: `src/store/thunks/gameThunks.ts`
  - Chỉnh sửa: `src/store/thunks/index.ts`
- **Mô tả công việc:**
  1. [x] Viết thunk `nextRound = createAsyncThunk("game/next", ...)`:
     - Gửi socket event `food-guess:next` qua `emitWithAck<EmptyAckData>`.
     - Bắt lỗi `HOST_ONLY`, `INVALID_PHASE` và dispatch toast cảnh báo nếu thất bại.
  2. [x] Viết thunk `rematch = createAsyncThunk("game/rematch", ...)`:
     - Gửi socket event `food-guess:rematch` qua `emitWithAck<EmptyAckData>`.
     - Bắt lỗi `HOST_ONLY`, `INVALID_PHASE` và dispatch toast cảnh báo nếu thất bại.
  3. [x] Re-export `nextRound` và `rematch` trong `src/store/thunks/index.ts`.
- **Kết quả kiểm thử:** `npx tsc --noEmit` (0 lỗi), `npm run lint` (0 warning, 0 error).

---

### Đầu việc 2: Xây dựng Bộ Component Round Reveal (`src/components/reveal/`) — [x] ĐÃ HOÀN THÀNH
Tuân thủ nghiêm ngặt nguyên tắc **Text-only UI** (không icon, không emoji), Design Tokens Dark Mode [globals.css](file:///d:/project/Food-guess/src/app/globals.css).

1. [x] **`AnswerDisplay.tsx`:**
   - Hiển thị tên món ăn chính thức `foodName` in hoa cỡ lớn với khung viền amber nổi bật: `[ ĐÁP ÁN CHÍNH XÁC: {foodName} ]`.
   - Hiển thị ảnh chuẩn `resourceUrl` qua component [FoodImage.tsx](file:///d:/project/Food-guess/src/components/shared/FoodImage.tsx) với khung cố định `aspect-square`, skeleton loading và fallback khi lỗi.
2. [x] **`ViewerRoundSummary.tsx`:**
   - Card tóm tắt thành tích của người xem trong vòng vừa qua:
     - Nếu `viewerCorrect === true`: Viền xanh Emerald, nhãn `[ ĐOÁN CHÍNH XÁC ]`, điểm cộng `+{viewerPoints}đ`, chuỗi thắng `[ CHUỖI ĐÚNG: {viewerStreak} ]`.
     - Nếu `viewerCorrect === false` hoặc không nộp: Viền xám/đỏ nhạt, nhãn `[ CHƯA CHÍNH XÁC / HẾT GIỜ ]`, `+0đ`.
3. [x] **`RoundResultsTable.tsx`:**
   - Bảng kết quả vòng của phòng từ `reveal.results`:
     - Sắp xếp theo điểm số (`points` giảm dần) và trạng thái đúng/sai.
     - Các cột: Thứ hạng (`#1`, `#2`), Tên người chơi, Đáp án đã nộp, Trạng thái `[ ĐÚNG ]` / `[ SAI ]`, Điểm số `+{points}đ`, Huy hiệu `[ COMBO ]` nếu có.
     - Tối ưu `React.memo` cho phòng đông tới 50 người.
4. [x] **`RevealControls.tsx`:**
   - Xử lý chuyển vòng:
     - Khi `autoNextRound === true`: Đếm ngược cục bộ 5 giây với thanh tiến độ mini: `[ TỰ ĐỘNG CHUYỂN VÒNG TIẾP THEO SAU {seconds}S ]`.
     - Khi `autoNextRound === false`:
       - Nếu là Host: Nút bấm `[ VÒNG TIẾP THEO ]` (gọi thunk `nextRound`, có trạng thái loading khi đang gửi).
       - Nếu là người chơi: Thông báo `[ ĐANG CHỜ CHỦ PHÒNG CHUYỂN VÒNG... ]`.
5. [x] **`RevealView.tsx`:**
   - Ghép nối bố cục 2 cột cân xứng:
     - **Cột Trái (Ưu tiên thị giác):** `AnswerDisplay` + `ViewerRoundSummary` + `RevealControls`.
     - **Cột Phải:** `RoundResultsTable` (Bảng điểm vòng thi cả phòng).
   - Export tại `src/components/reveal/index.ts`.
- **Kết quả kiểm thử:** `npx tsc --noEmit` (0 lỗi), `npm run lint` (0 warning, 0 error).

---

### Đầu việc 3: Xây dựng Bộ Component Finished (`src/components/finished/`) — [x] ĐÃ HOÀN THÀNH
Tuân thủ nghiêm ngặt nguyên tắc **Text-only UI**, phân cấp thứ hạng bằng màu viền và font monospace.

1. [x] **`PodiumLeaderboard.tsx` (Bục vinh danh Top 3):**
   - Thiết kế 3 bục Text-only cân đối (Thứ tự bục: Hạng 2 [Trái] - Hạng 1 [Giữa, cao nhất] - Hạng 3 [Phải]):
     - **Hạng 1 (Quán quân):** Viền vàng Amber sáng (`border-primary-container`), nhãn `[ VÔ ĐỊCH - HẠNG 1 ]`, Tên hiển thị to đậm, Tổng điểm, Số câu đúng.
     - **Hạng 2 (Á quân):** Viền bạc xám kim (`border-zinc-400`), nhãn `[ Á QUÂN - HẠNG 2 ]`, Tên hiển thị, Tổng điểm.
     - **Hạng 3 (Quý quân):** Viền đồng (`border-amber-700/80`), nhãn `[ QUÝ QUÂN - HẠNG 3 ]`, Tên hiển thị, Tổng điểm.
   - Xử lý linh hoạt trường hợp phòng chỉ có 1 hoặc 2 người chơi.
2. [x] **`FinalLeaderboard.tsx` (Bảng tổng sắp toàn phòng):**
   - Bảng danh sách đầy đủ tất cả người chơi sắp xếp theo `score` giảm dần:
     - Cột: Hạng (`#1`, `#2`, ...), Người chơi (kèm badge `[ CHỦ PHÒNG ]` và `[ BẠN ]`), Số câu đúng (`{correctAnswers}/{totalRounds}`), Điểm tổng kết (`{score}đ`).
3. [x] **`PastRoundsAccordion.tsx` (Lịch sử các vòng đấu):**
   - Sử dụng `snapshot.foodGuessPastResults`:
     - Danh sách thẻ có thể bấm mở/gập (Accordion) theo từng vòng: `[ VÒNG 1 ]`, `[ VÒNG 2 ]`, ...
     - Mở ra xem chi tiết: Ai đã đoán đúng, đáp án đã gửi, điểm số đạt được của vòng đó.
     - Xử lý empty state khi máy chủ chưa gửi lịch sử vòng cũ.
4. [x] **`FinishedControls.tsx`:**
   - Dành cho Host: Nút nổi bật `[ CHƠI LẠI TRẬN MỚI (REMATCH) ]` (gọi thunk `rematch`) để đưa cả phòng về Lobby bắt đầu ván mới.
   - Nút `[ RỜI PHÒNG ]` cho tất cả người chơi.
   - Dành cho người chơi thường: Dòng chữ `[ ĐANG CHỜ CHỦ PHÒNG BẮT ĐẦU LẠI HOẶC RỜI PHÒNG ]`.
5. [x] **`FinishedView.tsx`:**
   - Layout tổng hợp màn hình kết thúc trận đấu:
     - Phía trên: Tiêu đề vinh danh + `PodiumLeaderboard`.
     - Phía dưới chia 2 tab: `FinalLeaderboard` và `PastRoundsAccordion`.
     - Dưới cùng: `FinishedControls`.
   - Export tại `src/components/finished/index.ts`.
- **Kết quả kiểm thử:** `npx tsc --noEmit` (0 lỗi), `npm run lint` (0 warning, 0 error).

---

### Đầu việc 4: Tích hợp vào dynamic page `/room/[code]` & Mock/Preview — [x] ĐÃ HOÀN THÀNH
- **Tập tin:**
  - Chỉnh sửa: `src/app/room/[code]/page.tsx`
  - Chỉnh sửa: `src/mocks/roomSnapshots.ts`
  - Chỉnh sửa: `src/app/dev/preview/page.tsx`
- **Mô tả công việc:**
  1. [x] Trong `src/app/room/[code]/page.tsx`:
     - Render `<RevealView snapshot={snapshot} isHost={isHost} />` khi `phase === "roundReveal"`.
     - Render `<FinishedView snapshot={snapshot} isHost={isHost} onLeaveRoom={handleLeaveRoom} />` khi `phase === "finished"`.
  2. [x] Trong `src/mocks/roomSnapshots.ts`:
     - Bổ sung mock data chi tiết cho `mockFinishedSnapshot.foodGuessPastResults` để test trọn vẹn tab lịch sử vòng đấu.
  3. [x] Trong `src/app/dev/preview/page.tsx`:
     - Cập nhật tab `roundReveal` render trực tiếp `RevealView`.
     - Cập nhật tab `finished` render trực tiếp `FinishedView`.

---

### Đầu việc 5: Kiểm thử Toàn diện Codebase — [x] ĐÃ HOÀN THÀNH
- [x] Chạy `npx tsc --noEmit` (0 lỗi type).
- [x] Chạy `npm run lint` (0 warning, 0 error).
- [x] Chạy `npm run build` (Next.js Turbopack biên dịch thành công 100% trong 1.3s).

---

## 4. Bảng Phân Công Tập Tin (File Map)

| Tập tin | Hành động | Mục đích |
|---|:---:|---|
| `src/store/thunks/gameThunks.ts` | Chỉnh sửa | Bổ sung thunk `nextRound` và `rematch` |
| `src/store/thunks/index.ts` | Chỉnh sửa | Re-export `nextRound` và `rematch` |
| `src/components/reveal/AnswerDisplay.tsx` | Tạo mới | Hiển thị đáp án đúng và ảnh món ăn chính thức |
| `src/components/reveal/ViewerRoundSummary.tsx` | Tạo mới | Tóm tắt điểm số & combo cá nhân trong vòng |
| `src/components/reveal/RoundResultsTable.tsx` | Tạo mới | Bảng điểm kết quả vòng của cả phòng |
| `src/components/reveal/RevealControls.tsx` | Tạo mới | Bộ đếm 5s tự động hoặc nút chuyển vòng cho Host |
| `src/components/reveal/RevealView.tsx` | Tạo mới | Layout tổng hợp màn hình Round Reveal |
| `src/components/reveal/index.ts` | Chỉnh sửa | Re-export các component của Reveal |
| `src/components/finished/PodiumLeaderboard.tsx` | Tạo mới | Bục vinh danh Top 3 phong cách Text-only |
| `src/components/finished/FinalLeaderboard.tsx` | Tạo mới | Bảng tổng sắp toàn bộ người chơi trong phòng |
| `src/components/finished/PastRoundsAccordion.tsx` | Tạo mới | Lịch sử chi tiết kết quả từng vòng đã đấu |
| `src/components/finished/FinishedControls.tsx` | Tạo mới | Nút chơi lại (rematch) cho Host & nút rời phòng |
| `src/components/finished/FinishedView.tsx` | Tạo mới | Layout tổng hợp màn hình Finished |
| `src/components/finished/index.ts` | Chỉnh sửa | Re-export các component của Finished |
| `src/mocks/roomSnapshots.ts` | Chỉnh sửa | Bổ sung mock data `foodGuessPastResults` cho finished |
| `src/app/room/[code]/page.tsx` | Chỉnh sửa | Render `RevealView` và `FinishedView` khi khớp phase |
| `src/app/dev/preview/page.tsx` | Chỉnh sửa | Tích hợp Reveal & Finished vào preview tương tác |

---

## 5. Tiêu chí Hoàn thành (Definition of Done)

- [x] Thunk `nextRound` (`food-guess:next`) và `rematch` (`food-guess:rematch`) hoạt động chuẩn xác, xử lý lỗi ack bằng toast tiếng Việt.
- [x] Màn hình `RevealView` hiển thị đúng đáp án `foodName`, ảnh chuẩn `resourceUrl`, kết quả cá nhân (`viewerPoints`, `viewerStreak`), và bảng điểm của cả phòng.
- [x] Cơ chế chuyển vòng hoạt động đúng theo cấu hình: tự đếm 5s khi `autoNextRound === true`, hoặc nút bấm Host khi `autoNextRound === false`.
- [x] Màn hình `FinishedView` vinh danh Top 3 trên bục danh dự Text-only nổi bật, hiển thị bảng tổng sắp đầy đủ từ 1 đến 50.
- [x] Xem lại được lịch sử các vòng từ `foodGuessPastResults` qua Accordion gập/mở trực quan.
- [x] Host có nút `[ CHƠI LẠI TRẬN MỚI (REMATCH) ]` để đưa phòng về trạng thái Lobby.
- [x] Giao diện 100% Text-only (không dùng icon hay emoji ngoại trừ nhãn `[ ... ]`), chuẩn màu Dark Mode.
- [x] Không có lỗi TypeScript (`npx tsc --noEmit`), không có cảnh báo ESLint (`npm run lint`), `npm run build` thành công 100%.
