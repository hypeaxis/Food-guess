# 🎨 Đặc Tả Thiết Kế Giao Diện Web (Screens, Forms & Modals Design Spec)

> **Tài liệu tham chiếu thiết kế cho Stitch / Mockup Generator**  
> **Dự án:** Food Guess (Đoán Món Ăn Trực Tuyến)  
> **Nền tảng:** Web Application (Responsive: Mobile 375px+ ➔ Tablet 768px+ ➔ Desktop 1200px+)  
> **Quy chuẩn mỹ thuật chủ đạo:** Dark Mode hiện đại, bảng màu ẩm thực tinh tế, **100% Text-Only UI** (không dùng icon SVG hay emoji; tất cả biểu thị trạng thái đều dùng chữ, huy hiệu text và khối hình học thuần CSS).

---

## 📐 1. DESIGN SYSTEM & DESIGN TOKENS (HỆ THỐNG QUY CHUẨN)

### 1.1. Bảng màu (Color Palette)
- **Background chính (Main Canvas):** `#0a0a0a` (Neutral 950 - Đen sâu lắng).
- **Background thẻ / Card / Khung chứa:** `#171717` (Neutral 900) với độ mờ `backdrop-blur-md` khi nổi trên nền.
- **Card lồng trong (Sub-container / Input):** `#0f0f0f` hoặc `#050505` (Neutral 950/900).
- **Đường viền (Borders):**
  - Viền mặc định: `#262626` (Neutral 800).
  - Viền hover / active: `#404040` (Neutral 700).
  - Viền tiêu điểm focus: `#f59e0b` (Amber 500).
- **Màu nhấn thương hiệu (Primary Accent):**
  - Màu chủ đạo: `#f59e0b` (Amber 500 - Màu vàng ẩm thực ấm áp, nổi bật).
  - Màu tương tác hover: `#fbbf24` (Amber 400).
  - Màu nền badge nhấn: `#451a03` (Amber 950/80) kèm viền `#92400e` (Amber 800/80).
- **Màu trạng thái (Semantic Colors):**
  - **Thành công / Đang chờ / Online (Emerald):** Nền `#022c22`, chữ `#34d399`, viền `#065f46`.
  - **Cảnh báo / Đang chơi (Amber/Orange):** Nền `#451a03`, chữ `#fcd34d`, viền `#92400e`.
  - **Lỗi / Phòng đầy / Đã hủy (Rose):** Nền `#4c0519`, chữ `#fda4af`, viền `#9f1239`.
  - **Tổng kết / Reveal (Purple/Indigo):** Nền `#2e1065`, chữ `#c084fc`, viền `#581c87`.
  - **Đã kết thúc / Vô hiệu hóa (Neutral Muted):** Nền `#171717`, chữ `#737373`, viền `#262626`.
- **Màu chữ (Typography Colors):**
  - Chữ tiêu đề nổi bật: `#ffffff` (Pure White) hoặc `#f5f5f5` (Neutral 100).
  - Chữ nội dung thông thường: `#d4d4d4` (Neutral 300).
  - Chữ chú thích, nhãn phụ: `#a3a3a3` (Neutral 400) đến `#737373` (Neutral 500).

### 1.2. Phông chữ (Typography)
- **Font nội dung chính:** Sans-serif hiện đại (`Geist Sans`, `Inter`, hoặc hệ font không chân sạch sẽ).
- **Font kỹ thuật (Mã code, số liệu, badge, đếm ngược):** Monospace (`Geist Mono`, `JetBrains Mono` hoặc font đơn cách nét dày).
- **Quy tắc hiển thị Text-only:** Không dùng emoji (như 👑, 🟢, 🍲...), thay bằng chữ viết rõ ràng:
  - Thay vì `🟢 12 Online` ➔ Hiển thị `Trực tuyến: 12` hoặc `[ Trực tuyến ]`.
  - Thay vì `👑 HostName` ➔ Hiển thị `Chủ phòng: HostName` hoặc badge `[ Chủ phòng ]`.
  - Thay vì icon tải quay ➔ Hiển thị text `[ Đang xử lý... ]` hoặc thanh loading bar CSS.

---

## 🖥️ 2. MÀN HÌNH CHÍNH: HUB / TRANG CHỦ (`/`)

### 2.1. Cấu trúc tổng thể trang Hub
- **Thanh điều hướng trên cùng (Sticky Header):**
  - Bên trái: Text thương hiệu `FOOD GUESS` (Font Mono, đậm, màu Amber 500) + Phụ đề `Trò chơi đoán món ăn trực tuyến`.
  - Bên phải: Nút text `[ Dev Preview ]` dẫn sang chế độ kiểm thử 4 phase.
- **Khu vực Hero:**
  - Nhãn trên: `Giai đoạn 2: Hub phòng chơi` (Badge bo tròn, viền Neutral 800).
  - Tiêu đề chính lớn H1: `Sảnh chờ & Danh sách phòng`.
  - Đoạn mô tả: Tóm tắt trải nghiệm phòng chơi tối đa 50 người, cập nhật realtime.
- **Bố cục nội dung chính (2 Cột Responsive trên Desktop, 1 Cột xếp chồng trên Mobile):**
  - **Cột Trái (40% - 5/12):** Khung hành động chuyển đổi giữa 2 form: **Vào bằng mã** (`JoinForm`) và **Tạo phòng mới** (`CreateRoomForm`).
  - **Cột Phải (60% - 7/12):** Danh sách phòng công khai thời gian thực (`RoomList` & `RoomCard`).

---

### 2.2. Chi tiết Cột Trái — Form Hành Động

#### A. Thanh chuyển đổi chế độ (Form Mode Tabs)
- Khung pill chứa 2 nút bấm ngang hàng:
  - Nút 1: `VÀO BẰNG MÃ` (Active: nền Amber 500, chữ đen đậm; Inactive: chữ xám).
  - Nút 2: `TẠO PHÒNG MỚI` (Active: nền Amber 500, chữ đen đậm; Inactive: chữ xám).

#### B. Form 1: `JoinForm` (Vào phòng bằng mã)
- **Header:**
  - Tiêu đề H2: `Vào phòng bằng mã`.
  - Chú thích: `Nhập mã phòng và tên hiển thị để tham gia tranh tài`.
- **Hộp cảnh báo lỗi (chỉ hiện khi có lỗi):**
  - Khung viền đỏ Rose 900, nền tối Rose 950/30, text đỏ nhạt Rose 300 hiển thị lỗi chi tiết (vd: *Tên này đã được sử dụng*, *Phòng chơi không tồn tại hoặc đã kết thúc*).
- **Trường nhập 1: Mã phòng (`Room Code`)**
  - Nhãn trên: `MÃ PHÒNG` (bên phải có đếm ký tự: `X / 6`).
  - Ô input: Chiều cao lớn, font Monospace in hoa cỡ lớn, chữ Amber 400, khoảng cách ký tự rộng (`tracking-widest`), placeholder: `VD: HA29KD`.
  - Ràng buộc: Tự động viết hoa, chỉ cho nhập chữ và số (A-Z, 0-9), tối đa 6 ký tự.
  - Ghi chú chân input: `Mã phòng gồm 6 ký tự chữ hoa và số`.
- **Trường nhập 2: Tên người chơi (`Player Name`)**
  - Nhãn trên: `TÊN CỦA BẠN` (bên phải có đếm ký tự: `X / 24`).
  - Ô input: Placeholder `Nhập tên hiển thị (2 - 24 ký tự)`.
  - Ràng buộc: Giới hạn 24 ký tự.
- **Nút gửi (Submit Button):**
  - Text khi bình thường: `Vào phòng` (Nền Amber 500, chữ đen đậm, hover Amber 400).
  - Text khi đang gửi: `Đang vào phòng...` (Vô hiệu hóa click, nền tối, text xám).
  - Nút `Hủy` (chỉ hiện khi form được gọi dưới dạng modal/popup).

#### C. Form 2: `CreateRoomForm` (Tạo phòng chơi mới)
- **Header:**
  - Tiêu đề H2: `Tạo phòng chơi mới`.
  - Chú thích: `Thiết lập cấu hình phòng và thời gian cho ván đoán món ăn`.
- **Trường nhập 1: Tên chủ phòng (`Host Name`)**
  - Tương tự input tên của `JoinForm` (giới hạn 2-24 ký tự).
- **Trường nhập 2: Số vòng chơi (`Total Rounds Slider`)**
  - Nhãn trên: `SỐ VÒNG CHƠI`, góc phải có badge hiển thị số: `[ 10 vòng ]` (Font mono Amber 400).
  - Thanh trượt Slider (Range input): Dải từ `5` đến `50` vòng, bước nhảy `1`.
  - Chú thích bên dưới: Trái: `Tối thiểu: 5 vòng`, Phải: `Tối đa: 50 vòng`.
- **Trường nhập 3: Thời gian đoán mỗi câu (`Answer Time Slider`)**
  - Nhãn trên: `THỜI GIAN ĐOÁN MỖI CÂU`, góc phải có badge: `[ 30 giây ]` (Font mono Amber 400).
  - Thanh trượt Slider: Dải từ `10` đến `120` giây, bước nhảy `5`.
  - Chú thích bên dưới: Trái: `Nhanh: 10 giây`, Phải: `Thong thả: 120 giây`.
- **Khu vực Cài đặt nâng cao (Advanced Toggles):**
  - Tiêu đề con: `CÀI ĐẶT NÂNG CAO`.
  - **Mục 1 — Tự động chuyển vòng:**
    - Bên trái: Tiêu đề `Tự động qua vòng mới`, phụ đề `Tự chuyển sang câu hỏi tiếp theo sau 5 giây tổng kết`.
    - Bên phải: Nút text toggle `[ BẬT ]` (viền xanh Emerald, nền đậm) hoặc `[ TẮT ]` (viền xám Neutral).
  - **Mục 2 — Điểm thưởng chuỗi đúng (Combo Streak):**
    - Bên trái: Tiêu đề `Điểm thưởng chuỗi đúng (Combo)`, phụ đề `Cộng thêm điểm thưởng khi đoán đúng nhiều câu liên tiếp`.
    - Bên phải: Nút text toggle `[ BẬT ]` hoặc `[ TẮT ]`.
- **Nút gửi:**
  - `Tạo phòng chơi` (Nền Amber 500, chữ đen đậm) / `Đang tạo phòng...` khi đang kết nối.

---

### 2.3. Chi tiết Cột Phải — `RoomList` & `RoomCard`

#### A. Thanh công cụ & Bộ lọc (Toolbar & Tabs)
- **Hàng nút lọc theo danh mục (Filter Tabs):**
  - Tab 1: `TẤT CẢ (X)` (Đang chọn: nền Amber 500, chữ đen; Chưa chọn: viền Neutral 800, nền 900).
  - Tab 2: `ĐANG CHỜ (Y)` (Đang chọn: nền Emerald 600, chữ trắng).
  - Tab 3: `ĐANG CHƠI (Z)` (Đang chọn: nền Amber 600, chữ trắng).
- **Góc phải:**
  - Nhãn text thời gian: `Cập nhật lúc: HH:MM:SS` (Font nhỏ, màu xám nhạt).
  - Nút bấm thủ công: `[ Làm mới ]` (hoặc `[ Đang làm mới... ]` khi đang fetch ngầm).

#### B. Component thẻ phòng: `RoomCard`
Mỗi phòng được biểu diễn bằng một thẻ Card hình chữ nhật đứng/ngang bo góc `rounded-xl`, viền Neutral 800:
- **Đầu Card (Header):**
  - Bên trái: Nhãn `PHÒNG` nhỏ + Mã phòng lớn in đậm `HA29KD` (Font mono).
  - Bên phải: Badge trạng thái text có màu:
    - Nếu là lobby: Badge `[ Đang chờ ]` (viền/chữ xanh lá Emerald).
    - Nếu là playing: Badge `[ Đang chơi ]` (viền/chữ vàng Amber).
    - Nếu là roundReveal: Badge `[ Tổng kết vòng ]` (viền/chữ tím Purple).
    - Nếu là finished: Badge `[ Đã kết thúc ]` (viền/chữ xám Neutral).
- **Thân Card (Body):**
  - Dòng 1: `Chủ phòng: [Tên Host]` (Nếu không có hiển thị `Ẩn danh`).
  - Dòng 2: `Thời gian: [Vừa tạo / X phút trước]`.
  - Đường kẻ mờ phân cách.
  - Dòng 3: `Người chơi: 3 / 50` kèm thanh tiến độ phân đoạn màu:
    - Xanh lá nếu < 40 người.
    - Vàng cam nếu 40–49 người.
    - Đỏ nếu 50 người.
  - Dòng 4: `Trực tuyến: 3 đang online` (Text xanh Emerald).
- **Chân Card (Footer Button):**
  - Nếu phòng còn chỗ: Nút `Vào phòng` (Màu vàng Amber, bấm vào sẽ tự động điền mã vào cột trái).
  - Nếu phòng đủ 50 người: Nút bị khóa, text `Phòng đã đầy` (Màu xám tối).
  - Nếu phòng kết thúc: Nút bị khóa, text `Đã kết thúc`.

#### C. Các trạng thái khác của RoomList
- **Trạng thái đang tải (Loading Skeleton):** Lưới 6 thẻ hình chữ nhật xám mờ hiệu ứng chớp tắt (`animate-pulse`) giữ nguyên bố cục.
- **Trạng thái lỗi đường truyền (Error State):** Khung thông báo viền đỏ `Không thể tải danh sách phòng` kèm nút bấm `Thử lại`.
- **Trạng thái trống (Empty State):** Khung viền nét đứt `Chưa có phòng nào đang mở. Bạn hãy là người đầu tiên tạo phòng!`.

---

## 🚪 3. MÀN HÌNH PHÒNG CHƠI DYNAMIC (`/room/[code]`)

Trang này tự động chuyển đổi giao diện dựa trên 4 trạng thái vòng đời của người chơi:

### 3.1. Trạng thái 1: Kiểm tra phiên cũ (`resuming` / `idle`)
- **Bố cục:** Một card thông báo đặt chính giữa màn hình (Center Screen Card).
- **Nội dung:**
  - Badge: `PHÒNG: HA29KD`.
  - Tiêu đề: `Đang kiểm tra phiên chơi...`.
  - Mô tả: `Đang tìm kiếm thông tin đăng nhập đã lưu trong máy của bạn để khôi phục tự động.`
  - Vạch tiến độ chạy vô tận màu hổ phách.

---

### 3.2. Trạng thái 2: Form nhập tên tham gia (`needsName` - Component `NameForm`)
Dành cho người chơi truy cập bằng link chia sẻ trực tiếp (chưa có tên) hoặc khi phiên cũ bị từ chối (`RESUME_DENIED`):
- **Bố cục:** Form card đặt chính giữa màn hình (Max width 420px).
- **Nội dung:**
  - Badge trên cùng: `PHÒNG: HA29KD` (Font mono vàng Amber).
  - Tiêu đề H2: `Nhập tên tham gia`.
  - Mô tả: `Bạn đang truy cập phòng qua liên kết. Vui lòng chọn tên để bắt đầu.`
  - Hộp cảnh báo lỗi (nếu tên trùng `NAME_TAKEN` hoặc phòng đầy `ROOM_FULL`).
  - Ô nhập: `TÊN CỦA BẠN` (2 - 24 ký tự), auto-focus ngay khi vào trang.
  - Nút bấm: `Vào phòng chơi` (Nền vàng Amber) / `Đang tham gia...`.
  - Link phụ chân trang: `[ Quay lại trang chủ ]`.

---

### 3.3. Trạng thái 3: Đang kết nối xác thực (`joining`)
- **Bố cục:** Card căn giữa màn hình.
- **Nội dung:** `Đang tham gia vào phòng...` + `Đang xác thực thông tin và tải trạng thái phòng chơi từ máy chủ.`

---

### 3.4. Trạng thái 4: Đã vào phòng thành công (`joined` - Màn hình tóm tắt Phase 2)
Màn hình xác nhận đã vào phòng an toàn (chuẩn bị kích hoạt Lobby ở Giai đoạn 3):
- **Header phòng (Sticky Header):**
  - Bên trái: `PHÒNG: HA29KD` + Badge giai đoạn `Giai đoạn: Chờ bắt đầu`.
  - Bên phải: Nút text đỏ `[ Rời phòng ]` (Bấm vào sẽ gọi lệnh thoát, xóa session và quay về Hub).
- **Thẻ thông tin phòng (Room Status Card):**
  - Nhãn vai trò: `VAI TRÒ CỦA BẠN: CHỦ PHÒNG (HOST)` hoặc `NGƯỜI THAM GIA`.
  - Tiêu đề H1: `Phòng chơi HA29KD`.
  - Cấu hình tóm tắt: `Cấu hình: 10 vòng thi • 30s mỗi câu`.
  - Khối sĩ số góc phải: `3 / 50 người chơi`.
  - Hộp thông báo xanh: `Giai đoạn 2: Tạo phòng & Vào phòng đã hoàn tất thành công. Dữ liệu socket snapshot đã đồng bộ.`
- **Bảng danh sách người chơi trong phòng (Participants List):**
  - Tiêu đề: `Danh sách người chơi trong phòng (3)`.
  - Danh sách từng hàng:
    - ID người chơi: `ID: 9a2b1c`.
    - Tên người chơi: `NguyenVanA`.
    - Badge nếu là Host: `[ Chủ phòng ]` (Màu vàng hổ phách).
    - Trạng thái mạng: Text `[ Trực tuyến ]` (Xanh lá) hoặc `[ Ngoại tuyến ]` (Xám mờ).

---

## 🎮 4. CÁC MÀN HÌNH GAME CHƠI THEO 4 PHASE (ĐÃ CÓ TRONG DEV PREVIEW)

Đây là 4 màn hình cốt lõi của gameplay (được preview tại `/dev/preview`):

### 4.1. Phase 1: Màn hình Lobby (Sảnh chờ thi đấu — Giai đoạn 3)
- **Cột 1: Thông tin phòng & Cài đặt:**
  - Mã phòng to bản, nút `[ Sao chép liên kết mời ]`.
  - Danh sách cấu hình: Số vòng chơi, Thời gian mỗi câu, Tự động qua câu, Điểm chuỗi combo.
  - **Khu vực dành riêng cho Chủ phòng (Host):** Nút hành động lớn `BẮT ĐẦU VÁN CHƠI` (Màu vàng Amber nổi bật, chỉ Host mới có quyền bấm).
  - Người chơi thông thường: Dòng chữ thông báo `Đang chờ chủ phòng bắt đầu trận đấu...`.
- **Cột 2: Danh sách người tham gia realtime:**
  - Lưới các thẻ người chơi (Avatar hình chữ nhật chứa chữ cái đầu của tên, Tên hiển thị, nhãn `Host`, nhãn `Online/Offline`).

---

### 4.2. Phase 2: Màn hình Playing (Đang đoán ảnh món ăn — Giai đoạn 4)
- **Thanh tiến trình trên cùng:**
  - Dòng thông tin: `VÒNG 1 / 10`.
  - **Bộ đếm thời gian (`GuessTimer`):** Hiển thị số giây còn lại `18s` (chuyển sang màu đỏ nhấp nháy khi còn dưới 5 giây) kèm thanh progress bar co ngắn lại theo thời gian thực.
  - Sĩ số đã nộp: `Đã nộp: 4 / 8 người`.
- **Khu vực trung tâm — Ảnh món ăn (`FoodImage`):**
  - Khung ảnh hình vuông cố định tỉ lệ 1:1 (`aspect-square`), bo góc mềm mại, viền Neutral 800.
  - Có khung xương xám (`Skeleton pulse`) khi ảnh đang tải từ CDN.
  - Tự động thay thế ảnh dự phòng khi link ảnh bị lỗi hoặc không tải được.
- **Khu vực tương tác nhập đáp án:**
  - Ô input đáp án: `Nhập tên món ăn bạn đoán...`.
  - Nút nộp đáp án: `Gửi đáp án` (Bị khóa ngay lập tức sau khi bấm để tránh spam).
  - Khi đã nộp: Input bị khóa và hiển thị nhãn `Bạn đã nộp đáp án. Đang chờ hết giờ...`.
- **3 Chip gợi ý nhanh (`Suggestion Chips`):**
  - 3 nút bấm chứa 3 phương án gợi ý của hệ thống (vd: `[ Phở Bò ]`, `[ Bún Bò Huế ]`, `[ Bánh Mì ]`). Bấm vào chip nào sẽ tự động nộp ngay phương án đó.
- **Bảng thông báo điểm số trực tiếp (`ScoreFeed`):**
  - Dòng sự kiện trôi lên khi có người đoán đúng: `Player B đã đoán đúng! (+250đ)`.

---

### 4.3. Phase 3: Màn hình Round Reveal (Công bố đáp án vòng — Giai đoạn 5)
- **Khu vực đáp án chính thức:**
  - Ảnh món ăn gốc.
  - Tên món ăn công bố: Chữ to bản `PHỞ BÒ HÀ NỘI`.
- **Kết quả cá nhân của người xem:**
  - Nếu đoán đúng: Khung xanh rực rỡ `CHÍNH XÁC! +350 Điểm` (Kèm hệ số combo nếu có: `Combo chuỗi đúng x1.4`).
  - Nếu đoán sai / không kịp: Khung xám `SAI RỒI! Hãy cố gắng ở vòng sau`.
- **Bảng điểm xếp hạng của vòng vừa qua:**
  - Danh sách người chơi sắp xếp theo thời gian nộp nhanh nhất và điểm số đạt được trong vòng.
- **Điều hướng vòng tiếp theo:**
  - Nếu bật tự động: Dòng chữ `Tự động chuyển câu tiếp theo sau 5 giây...` (Đếm ngược 5.. 4.. 3..).
  - Nếu tắt tự động: Nút dành cho Host `[ VÒNG TIẾP THEO ]`.

---

### 4.4. Phase 4: Màn hình Finished (Vinh danh & Bảng xếp hạng chung cuộc — Giai đoạn 5)
- **Khu vực bục vinh danh (Top 3 Podium):**
  - 3 khối bục danh dự:
    - Bục 1 (Giữa - Cao nhất): Quán quân `Hạng 1` (Khung màu vàng kim, vương miện text `[ VÔ ĐỊCH ]`, Tên, Tổng điểm).
    - Bục 2 (Trái): Á quân `Hạng 2` (Khung màu bạc, Tên, Tổng điểm).
    - Bục 3 (Phải): Quý quân `Hạng 3` (Khung màu đồng, Tên, Tổng điểm).
- **Bảng tổng sắp toàn bộ phòng:**
  - Danh sách đầy đủ thứ hạng từ 1 đến 50 kèm số câu đoán đúng và tổng điểm.
- **Lịch sử các vòng đấu (`Past Results Accordion`):**
  - Danh sách có thể bấm mở để xem lại từng vòng thi đấu món gì và ai trả lời đúng.
- **Nút hành động cuối:**
  - Nút dành cho Host: `[ CHƠI LẠI TRẬN MỚI ]`.
  - Nút cho tất cả: `[ RỜI PHÒNG ]`.

---

## 🔔 5. CÁC THÀNH PHẦN MODAL, BANNER & OVERLAYS DÙNG CHUNG

### 5.1. `ConnectionBanner` (Thanh cảnh báo mạng trên cùng - Sticky Top)
Tự động xuất hiện ở mép trên cùng màn hình khi socket gặp sự cố, che phủ toàn chiều ngang:
- **Trạng thái 1: Đánh thức server (`waking` - Cold start):** Nền vàng hổ phách tối `#451a03`, text `Đang đánh thức máy chủ (Cold start), vui lòng đợi giây lát...`.
- **Trạng thái 2: Thử kết nối lại (`reconnecting`):** Nền cam tối `#431407`, text `Mất kết nối mạng. Đang thử kết nối lại (Lần 2/10)...`.
- **Trạng thái 3: Mất kết nối hoàn toàn (`error`):** Nền đỏ tối `#4c0519`, text `Không thể kết nối đến máy chủ` kèm nút bấm text `[ Thử lại ]`.
- **Trạng thái 4: Đã kết nối (`connected`):** Tự động ẩn hoàn toàn (không chiếm diện tích).

### 5.2. `ToastContainer` (Hộp thông báo nổi góc dưới phải)
Khung thông báo xếp tầng góc dưới bên phải màn hình, tự động ẩn sau 4 giây:
- **Thông báo Thành công:** Viền xanh `#065f46`, nền `#022c22`, nhãn `[ THÀNH CÔNG ]`, dòng nội dung (vd: `Tạo phòng HA29KD thành công!`), nút `[X]`.
- **Thông báo Lỗi:** Viền đỏ `#9f1239`, nền `#4c0519`, nhãn `[ LỖI ]`, dòng nội dung (vd: `Tên này đã được sử dụng, vui lòng chọn tên khác`), nút `[X]`.
- **Thông báo Chung:** Viền xám `#404040`, nền `#171717`, nhãn `[ THÔNG BÁO ]`.

### 5.3. `ChatBox` (Khung trò chuyện trong phòng)
Có thể hiển thị dạng cột cạnh màn hình trên Desktop hoặc nút mở ngăn kéo (Drawer/Modal) trên Mobile:
- **Đầu khung chat:** Tiêu đề `Trò chuyện trong phòng` kèm số tin nhắn.
- **Khung nội dung tin nhắn:** Cuộn tự động, giới hạn tối đa 200 tin nhắn gần nhất. Mỗi tin hiển thị tên người gửi, thời gian gửi, và nội dung văn bản (hoặc link ảnh GIF Tenor/Giphy).
- **Khung nhập liệu:** Ô input `Nhập tin nhắn (tối đa 300 ký tự)...` + Nút text `[ Gửi ]`.
- **Cơ chế giới hạn:** Khóa gửi và báo lỗi nếu spam quá 5 tin trong 10 giây (`RATE_LIMITED`).

---

## 📐 6. SƠ ĐỒ BỐ CỤC KHÔNG GIAN (ASCII LAYOUT BLUEPRINT)

### A. Layout Hub Page (`app/page.tsx`)
```
+-------------------------------------------------------------------------------+
| [FOOD GUESS]  Trò chơi đoán món ăn trực tuyến                [ Dev Preview ] |
+-------------------------------------------------------------------------------+
|                                                                               |
| Giai đoạn 2: Hub phòng chơi                                                   |
| SẢNH CHỜ & DANH SÁCH PHÒNG                                                    |
| Tham gia phòng có sẵn hoặc tự tạo phòng thi đấu riêng cùng bạn bè...         |
|                                                                               |
| +-----------------------------------+ +-------------------------------------+ |
| | CỘT TRÁI: FORM ĐIỀU KHIỂN         | | CỘT PHẢI: DANH SÁCH PHÒNG (POLLING) | |
| | [ VÀO BẰNG MÃ ] [ TẠO PHÒNG MỚI ] | | [TẤT CẢ (3)] [ĐANG CHỜ] [ĐANG CHƠI] | |
| |-----------------------------------| | Cập nhật lúc: 08:45    [ Làm mới ]  | |
| |                                   | |-------------------------------------| |
| | [Nếu chọn Vào bằng mã]:           | | +---------------------------------+ | |
| | - Mã phòng: [______] (0/6)        | | | PHÒNG HA29KD       [ Đang chờ ] | | |
| | - Tên của bạn: [______] (0/24)    | | | Chủ: NguyenA  |  Vừa tạo        | | |
| | - Nút: [   VÀO PHÒNG   ]          | | | Người chơi: 3/50 [======        ] | | |
| |                                   | | | Trực tuyến: 3 online            | | |
| | [Nếu chọn Tạo phòng mới]:         | | | Nút: [      VÀO PHÒNG      ]    | | |
| | - Tên của bạn: [______]           | | +---------------------------------+ | |
| | - Số vòng: [ 10 vòng ] (Slider)   | | +---------------------------------+ | |
| | - Thời gian: [ 30 giây ] (Slider) | | | PHÒNG BX88KL       [ Đang chơi ]| | |
| | - Tự động qua câu: [ BẬT ]        | | | Chủ: TranB    |  5 phút trước   | | |
| | - Chuỗi Combo:     [ BẬT ]        | | | Người chơi: 50/50 [=============] | | |
| | - Nút: [  TẠO PHÒNG CHƠI  ]       | | | Nút: [    PHÒNG ĐÃ ĐẦY    ]     | | |
| +-----------------------------------+ | +---------------------------------+ | |
|                                       +-------------------------------------+ |
+-------------------------------------------------------------------------------+
|                                                [ LỖI ]                        |
|                                                Tên này đã được sử dụng    [X] |
+-------------------------------------------------------------------------------+
```

### B. Layout Room Page (`app/room/[code]/page.tsx` - Khi chưa có tên)
```
+-------------------------------------------------------------------------------+
|                                                                               |
|                      +----------------------------------+                     |
|                      |         PHÒNG: HA29KD            |                     |
|                      |                                  |                     |
|                      |        NHẬP TÊN THAM GIA         |                     |
|                      |  Bạn đang truy cập phòng qua     |                     |
|                      |  liên kết. Vui lòng chọn tên...  |                     |
|                      |                                  |                     |
|                      |  TÊN CỦA BẠN (0/24)              |                     |
|                      |  [ Nhập tên hiển thị...        ] |                     |
|                      |                                  |                     |
|                      |  [       VÀO PHÒNG CHƠI       ]  |                     |
|                      +----------------------------------+                     |
|                                                                               |
|                             [ Quay lại trang chủ ]                            |
|                                                                               |
+-------------------------------------------------------------------------------+
```

---

## 🎯 7. GỢI Ý PROMPT KHI NẠP VÀO STITCH

Khi đưa tài liệu này vào công cụ Stitch để render mockups, bạn có thể sử dụng cấu trúc prompt mẫu sau:

```text
Create a modern, sleek web application UI mockup based on this specification:
- Theme: Deep dark mode (#0a0a0a canvas, #171717 cards, amber-500 accent #f59e0b).
- Style: 100% text-only UI without emojis or icon fonts. Use crisp typography (Inter/Geist Sans) and monospaced badges for status tags like [ Đang chờ ], [ Đang chơi ], [ Trực tuyến ].
- Screens to mock:
  1. Main Hub (/): 2-column layout. Left column has interactive tabs switching between "Join by Code" form (6-character uppercase input) and "Create Room" form (sliders for rounds & timers, text toggles for Auto-next & Combo). Right column has a real-time room list with category tabs, refresh button, and room cards showing participant progress bars.
  2. Room Join by Link (/room/CODE): Minimalist centered modal/card asking the player for their display name with an amber submit button.
  3. Room Gameplay (Playing Phase): Clean split layout with countdown timer, square 1:1 food image container, answer input, 3 suggestion chips, and realtime score feed.
Ensure all elements have high contrast, rounded-2xl cards, and subtle dark borders (#262626).
```
