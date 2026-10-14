# KẾ HOẠCH CHI TIẾT REFACTOR TOÀN DIỆN & CHUẨN HÓA KIẾN TRÚC SOLID CHO FOOD GUESS

> **Tài liệu tham chiếu:** Kế hoạch nâng cấp kiến trúc mã nguồn toàn diện theo 5 nguyên lý **SOLID**, phân rã thành phần mô-đun hóa sạch (Clean Modular Architecture) và hoàn thiện giao diện thương mại chuẩn (Production-Ready Text-only UI).  
> **Ngày lập:** 13/10/2026  
> **Trạng thái:** Sẵn sàng thực thi

---

## 1. MỤC TIÊU & TẦM NHÌN REFACTOR

1. **Chuẩn hóa kiến trúc SOLID:**  
   Chuyển dịch toàn bộ codebase từ giai đoạn phát triển ban đầu sang kiến trúc hướng module chuyên nghiệp, đảm bảo tính dễ đọc (readability), dễ bảo trì (maintainability), dễ mở rộng (extensibility) và khả năng kiểm thử độc lập (testability).
2. **Xóa sạch dấu vết phát triển trên giao diện (UI Cleanliness):**  
   Loại bỏ 100% các nhãn thời điểm hoàn thiện kỹ thuật như `[ GIAI ĐOẠN 2: HUB SẢNH CHỜ ]`, `GIAI ĐOẠN 3: SẢNH CHỜ THI ĐẤU`, `FOOD GUESS KERNEL v2.4`, `FOOD GUESS KERNEL v2.6 // GIAI ĐOẠN 6: TRÒ CHUYỆN & HOÀN THIỆN`, v.v. mang đến trải nghiệm người dùng tự nhiên và đồng nhất.
3. **Bảo toàn 100% logic nghiệp vụ:**  
   Không làm thay đổi bất kỳ hợp đồng kết nối WebSocket, Redux State, Socket Middleware, Thunks, hay logic Game Rule nào đang vận hành trơn tru.
4. **Giữ vững phong cách thiết kế Text-Only UI:**  
   Không sử dụng biểu tượng đồ họa (icon fonts) hoặc emoji bên ngoài; toàn bộ badge, trạng thái, bộ đếm, switch đều duy trì phong cách văn bản tinh gọn với Dark Mode semantic tokens.

---

## 2. MÔ HÌNH KIẾN TRÚC SOLID TRONG FRONTEND REACT & NEXT.JS

Kiến trúc refactor của Food Guess được xây dựng dựa trên 5 nguyên lý SOLID được tinh chỉnh tối ưu cho hệ sinh thái React 19 + Next.js 16 + Redux Toolkit + TypeScript:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KIẾN TRÚC SOLID CHO FOOD GUESS                  │
├────────────────────────────────────────────────────────────────────────┤
│  [S] Single Responsibility  ─► Tách Smart Container vs Presentational  │
│  [O] Open/Closed Principle  ─► Mở rộng qua Composition & Renderer Map  │
│  [L] Liskov Substitution    ─► Chuẩn hóa Base Phase & Form Contracts   │
│  [I] Interface Segregation  ─► Thu hẹp Props, loại bỏ God Objects      │
│  [D] Dependency Inversion   ─► UI phụ thuộc Abstractions / Hooks       │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 2.1. [S] — Single Responsibility Principle (Đơn Trách Nhiệm)
> *"Một component hoặc module chỉ nên có duy nhất một lý do để thay đổi."*

#### Triển khai cụ thể:
1. **Phân tách Smart Container (Điều phối) vs Dumb Presentational (Hiển thị thuần túy):**
   - **Smart Container (`page.tsx`, `ChatBox.tsx`, `CreateRoomForm.tsx`):** Chỉ chịu trách nhiệm kết nối Redux Store, lắng nghe event, quản lý luồng điều hướng và phân phối dữ liệu.
   - **Presentational Component (`MiniScoreboard`, `RoundsConfigField`, `HubHeader`, `RoomNavbar`):** Chỉ nhận props, hiển thị giao diện và kích hoạt callback, không chứa logic gọi mạng hay dispatch Redux action trực tiếp.
2. **Tách biệt Business Logic & Validation ra khỏi JSX:**
   - Đưa các logic phức tạp (như validate GIF domain, kiểm tra rate-limiting, tính toán thời gian đếm ngược, phân loại phòng) vào các helper thuần túy (pure functions) hoặc custom hooks riêng, không nhúng trực tiếp trong khối render của component.

#### Bảng đối chiếu Single Responsibility:
| Component Hiện Tại | Vấn đề ôm đồm | Phân rã theo SRP |
|---|---|---|
| `src/app/page.tsx` | Chứa cả Header, Hero, Tab switcher, Layout grid | ➔ `HubHeader` (Navbar & Telemetry)<br>➔ `HubHero` (Banner & Giới thiệu)<br>➔ `page.tsx` (Layout Controller) |
| `CreateRoomForm.tsx` | Chứa validation tên + 2 slider cấu hình + 2 switch nâng cao | ➔ `RoundsConfigField`<br>➔ `TimerConfigField`<br>➔ `RoomTogglesField`<br>➔ `CreateRoomForm` (Form submit orchestrator) |
| `PlayingView.tsx` | Vừa điều phối gameplay, vừa render inline bảng điểm 50 người | ➔ `MiniScoreboard` (Bảng điểm độc lập)<br>➔ `PlayingView` (Điều phối gameplay) |
| `RoomConfigCard.tsx` | Vừa chứa thông số game, vừa chứa logic clipboard copy | ➔ `RoomShareSection` (Quản lý mã & link)<br>➔ `RoomConfigCard` (Chỉ hiển thị thông số) |
| `ChatInput.tsx` | Vừa nhập text, vừa nhập GIF URL, vừa đếm cooldown | ➔ `GifInputPanel` (Giao diện nhập GIF & validate)<br>➔ `ChatInput` (Điều phối chế độ chat & timer) |

---

### 2.2. [O] — Open/Closed Principle (Mở Để Mở Rộng, Đóng Để Sửa Đổi)
> *"Phần mềm nên mở để mở rộng thêm tính năng mới, nhưng đóng trước việc sửa đổi mã nguồn đã chạy ổn định."*

#### Triển khai cụ thể:
1. **Compound Component & Slot Pattern:**
   - Thay vì hardcode mọi thành phần bên trong một card loading hay header, các component dùng chung như `RoomLoadingCard`, `RoomNavbar` sẽ hỗ trợ các "slots" (`children`, `badgeSlot`, `actionSlot`) để có thể tùy biến các trạng thái mới mà không sửa đổi cấu trúc lõi của card.
2. **Extensible Form Fields:**
   - `CreateRoomForm` được thiết kế theo dạng composable layout. Khi hệ thống bổ sung thêm cấu hình mới trong tương lai (ví dụ: `FoodCategoryField` - chọn chủ đề món ăn, hoặc `DifficultyField` - độ khó), chỉ cần import thêm field mới vào form mà không cần sửa logic của các trường số vòng hay thời gian hiện có.
3. **Renderer Strategy cho Chat Messages:**
   - `ChatMessageItem` phân chia render theo dạng Strategy/Dispatcher dựa trên `message.type` (`text` | `gif` | `system`). Khi cần bổ sung loại tin nhắn mới (ví dụ: `sticker`, `poll`, `announcement`), chỉ cần bổ sung sub-renderer tương ứng mà không làm xáo trộn rendering của các tin nhắn text hay gif.

---

### 2.3. [L] — Liskov Substitution Principle (Thay Thế Liskov)
> *"Các đối tượng hoặc component con phải có khả năng thay thế cho nhau mà không làm phá vỡ tính đúng đắn của chương trình."*

#### Triển khai cụ thể:
1. **Chuẩn hóa Hợp đồng Giao diện cho các Game Phase Views:**
   - Cả 4 màn hình trạng thái game: `LobbyView`, `PlayingView`, `RevealView`, `FinishedView` đều kế thừa hoặc tuân theo một hợp đồng dữ liệu chuẩn (`BasePhaseViewProps`):
     ```typescript
     export interface BasePhaseViewProps {
       snapshot: RoomSnapshot;
       isHost: boolean;
       onLeaveRoom?: () => void;
     }
     ```
   - Nhờ đó, cả `src/app/room/[code]/page.tsx` lẫn `PhasePreviewPanel` (trong Dev Preview) đều có thể hoán đổi các view này một cách an toàn mà không phải ép kiểu hoặc xử lý các ngoại lệ bất thường.
2. **Chuẩn hóa Hợp đồng Form Field:**
   - Các field cấu hình (`RoundsConfigField`, `TimerConfigField`) tuân thủ giao diện chuẩn của một controlled field component:
     ```typescript
     export interface FormFieldControlProps<T> {
       value: T;
       onChange: (val: T) => void;
       disabled?: boolean;
     }
     ```
   - Đảm bảo tính nhất quán về hành vi, xử lý disabled và trạng thái cập nhật trên toàn bộ ứng dụng.

---

### 2.4. [I] — Interface Segregation Principle (Phân Tách Giao Diện / Props)
> *"Không ép buộc component phải phụ thuộc vào những thuộc tính (props) mà nó không sử dụng."*

#### Triển khai cụ thể:
1. **Loại bỏ "God Props" (`snapshot: RoomSnapshot` lạm dụng):**
   - Hiện tại, một số component con nhận nguyên cả object `RoomSnapshot` khổng lồ dù chỉ dùng đúng 1 mảng dữ liệu. Điều này dẫn đến coupling không cần thiết và khiến component bị re-render vô lý khi các phần khác của snapshot thay đổi.
   - **Tái cấu trúc props hẹp & chuyên biệt:**
     * `MiniScoreboard`: Chỉ nhận `participants: Participant[]`, `viewerId?: string` (thay vì nhận cả `snapshot`).
     * `RoomNavbar`: Chỉ nhận `code: string`, `phase?: RoomPhase`, `onLeaveRoom: () => void`.
     * `RoomShareSection`: Chỉ nhận `code: string`.
     * `RoomFilterTabs`: Chỉ nhận `activeTab: FilterTab`, `onTabChange: (t: FilterTab) => void`, `counts: Record<FilterTab, number>`.
2. **Tối ưu hóa khả năng ghi nhớ (React.memo):**
   - Khi props được thu hẹp đúng phạm vi, `React.memo` sẽ hoạt động hiệu quả tối đa vì component chỉ re-render khi chính xác dữ liệu nó quan tâm thay đổi, giúp bảng điểm 50 người chơi mượt mà ở tốc độ 120 FPS.

---

### 2.5. [D] — Dependency Inversion Principle (Đảo Ngược Phụ Thuộc)
> *"Các module cấp cao không nên phụ thuộc trực tiếp vào các module cấp thấp; cả hai nên phụ thuộc vào Abstractions."*

#### Triển khai cụ thể:
1. **Trừu tượng hóa Web API (Browser APIs Abstraction):**
   - Các component không tương tác trực tiếp với các API trình duyệt cấp thấp như `navigator.clipboard` hay `localStorage`.
   - Tạo custom hook `useClipboard` đóng gói logic copy, clipboard fallback và timeout hiển thị trạng thái sao chép, cung cấp interface sạch: `{ copy, copied, isSupported }`.
2. **Inversion of Control (IoC) cho Presentational Components:**
   - Các component hiển thị không trực tiếp import hay phụ thuộc vào Redux thunks / dispatchers. Thay vào đó, chúng nhận các hàm callback trừu tượng (`onSubmit`, `onLeaveRoom`, `onSkipRound`) từ container cha.
   - Điều này giúp các component hoàn toàn độc lập, dễ dàng được test tự động (Unit Test / Storybook) và chạy ổn định với dữ liệu giả lập trong Dev Preview mà không cần mount Redux Provider thật.

---

## 3. HẠNG MỤC 1: XÓA BỎ VÀ CHUẨN HÓA CÁC NỘI DUNG MỐC HOÀN THIỆN TRÊN UI

Dưới đây là danh sách quét toàn diện các vị trí text mốc thời điểm / giai đoạn đang hiển thị trên giao diện người dùng và giải pháp thay thế chuẩn thương mại:

| Vị trí file | Dòng | Nội dung hiện tại (Chứa mốc hoàn thiện) | Nội dung mới chuẩn hóa (Production Ready) | Ý nghĩa / Ghi chú |
|---|---|---|---|---|
| `src/app/page.tsx` | 98 | `[ GIAI ĐOẠN 2: HUB SẢNH CHỜ ]` | `[ SẢNH TRÒ CHƠI ]` | Badge nhận diện khu vực sảnh chính trang chủ |
| `src/app/page.tsx` | 174 | `FOOD GUESS KERNEL v2.4 // NEXT.JS 16 • REDUX TOOLKIT • WEBSOCKET • TAILWIND CSS` | `FOOD GUESS // NỀN TẢNG ĐỐ VUI ẨM THỰC THỜI GIAN THỰC` | Footer trang chủ chuyên nghiệp, sạch sẽ |
| `src/components/lobby/LobbyView.tsx` | 39 | `GIAI ĐOẠN 3: SẢNH CHỜ THI ĐẤU` | `KHU VỰC CHỜ THI ĐẤU` | Nhãn trạng thái phòng trong sảnh chờ |
| `src/components/room/NameForm.tsx` | 213 | `FOOD GUESS KERNEL v2.4 // PROTOCOL_ID: WS_STITCH_FOOD` | `FOOD GUESS // HỆ THỐNG XÁC THỰC PHIÊN CHƠI` | Chân trang biểu mẫu nhập tên trực tiếp |
| `src/app/room/[code]/page.tsx` | 124 | `[ GIAI ĐOẠN: ${phase ?? "ĐANG TẢI"} ]` | `[ TRẠNG THÁI: ${phase ?? "ĐANG TẢI"} ]` | Trạng thái phòng trên Top Header |
| `src/app/room/[code]/page.tsx` | 184 | `FOOD GUESS KERNEL v2.6 // GIAI ĐOẠN 6: TRÒ CHUYỆN & HOÀN THIỆN` | `FOOD GUESS // PHÒNG: ${code} • ĐỒNG BỘ THỜI GIAN THỰC` | Chân trang màn hình phòng đấu |
| `src/app/dev/preview/page.tsx` | 196 | `Phần preview & nghiệm thu Giai đoạn 0 & Giai đoạn 1 (Đầu việc 6)` | `Khu vực kiểm thử giao diện & giả lập trạng thái thi đấu` | Chuẩn hóa trang công cụ Dev |
| `src/app/dev/preview/page.tsx` | 351 | `Giai đoạn 1` | `Giao thức Mạng` | Tab kiểm thử kết nối Socket & Session |
| `src/app/dev/preview/page.tsx` | 657 | `Phase 6` | `Hộp Trò Chuyện` | Tab kiểm thử tính năng Chatbox |

---

## 4. HẠNG MỤC 2: PHÂN RÃ COMPONENT THEO NGUYÊN TẮC SOLID

### 4.1. Phân rã Trang chủ & Hub (`src/app/page.tsx` & `src/components/hub/`)

#### A. Trang chủ `src/app/page.tsx` (Hiện tại 179 dòng ➔ < 60 dòng)
* **Áp dụng SOLID:** SRP & DIP.
* **Thành phần phân rã:**
  1. `src/components/hub/HubHeader.tsx`: Presentational component hiển thị Logo, Connection Telemetry badge và Navigation links.
  2. `src/components/hub/HubHero.tsx`: Presentational component hiển thị tiêu đề thương hiệu, slogan và thông tin kết nối WebSocket.
  3. `src/app/page.tsx`: Chỉ đóng vai trò Page Container điều phối logic kết nối Socket và active tab (`join` | `create`).

#### B. Biểu mẫu tạo phòng `src/components/hub/CreateRoomForm.tsx` (Hiện tại 330 dòng ➔ < 110 dòng)
* **Áp dụng SOLID:** SRP, OCP, LSP & ISP.
* **Thành phần phân rã:**
  1. `src/components/hub/create-room/RoundsConfigField.tsx`: Quản lý riêng slider số vòng (5–50) và preset buttons, nhận chuẩn props `FormFieldControlProps<number>`.
  2. `src/components/hub/create-room/TimerConfigField.tsx`: Quản lý riêng slider thời gian đoán (10s–120s) và preset buttons, nhận chuẩn props `FormFieldControlProps<number>`.
  3. `src/components/hub/create-room/RoomTogglesField.tsx`: Quản lý riêng cụm switch Text-only "Tự động qua vòng" và "Chuỗi Combo", nhận `autoNextRound`, `comboStreakEnabled`, và các callback tương ứng.
  4. `CreateRoomForm.tsx`: Tập trung duy nhất vào việc quản lý state form, submit handler, validation và gọi Redux thunk.

#### C. Danh sách phòng `src/components/hub/RoomList.tsx` (Hiện tại 204 dòng ➔ < 120 dòng)
* **Áp dụng SOLID:** SRP & ISP.
* **Thành phần phân rã:**
  1. `src/components/hub/room-list/RoomFilterTabs.tsx`: Component nhận `activeTab`, `onSelectTab`, và `counts: { all, lobby, playing }` để render bộ lọc tab.
  2. `RoomList.tsx`: Chỉ tập trung vào hook `useGetRoomsQuery`, logic lọc dữ liệu và map ra danh sách `RoomCard`.

---

### 4.2. Phân rã Màn hình Phòng thi đấu (`src/app/room/[code]/`, `playing`, `lobby`)

#### A. Trang động `src/app/room/[code]/page.tsx` (Hiện tại 189 dòng ➔ < 100 dòng)
* **Áp dụng SOLID:** SRP, OCP & ISP.
* **Thành phần phân rã:**
  1. `src/components/room/RoomNavbar.tsx`: Nhận `{ code, phase, onLeaveRoom }`, quản lý thanh top header và nút rời phòng.
  2. `src/components/room/RoomLoadingCard.tsx`: Component loading dạng Card tái sử dụng (hỗ trợ slot title, message, badge) cho cả `resuming` và `joining`.
  3. `src/app/room/[code]/page.tsx`: Điều phối chuyển đổi giữa các phase views.

#### B. Màn thi đấu `src/components/playing/PlayingView.tsx` (Hiện tại 169 dòng ➔ < 95 dòng)
* **Áp dụng SOLID:** SRP & ISP.
* **Thành phần phân rã:**
  1. `src/components/playing/MiniScoreboard.tsx`: Bảng điểm trực tiếp 50 người, nhận props hẹp `participants: Participant[]`, `viewerId?: string`. Áp dụng `React.memo` chống re-render thừa.
  2. `PlayingView.tsx`: Layout điều phối sạch sẽ, phối hợp giữa Header, FoodDisplay, SuggestionChips, GuessInput, ScoreFeed và MiniScoreboard.

#### C. Thẻ cấu hình phòng `src/components/lobby/RoomConfigCard.tsx` (Hiện tại 143 dòng ➔ < 90 dòng)
* **Áp dụng SOLID:** SRP, DIP & ISP.
* **Thành phần phân rã:**
  1. `src/components/lobby/RoomShareSection.tsx`: Hiển thị mã phòng cỡ lớn, sử dụng hook `useClipboard` để sao chép liên kết mời.
  2. `RoomConfigCard.tsx`: Chỉ tập trung hiển thị bảng 4 thông số ván đấu.

---

### 4.3. Phân rã Khung Trò chuyện Chatbox (`src/components/chat/ChatInput.tsx`)

#### A. Ô nhập liệu tin nhắn `src/components/chat/ChatInput.tsx` (Hiện tại 228 dòng ➔ < 120 dòng)
* **Áp dụng SOLID:** SRP & OCP.
* **Thành phần phân rã:**
  1. `src/components/chat/GifInputPanel.tsx`: Form nhập URL ảnh GIF, xem trước ảnh động, gợi ý domain whitelist và nút gửi/hủy GIF.
  2. `ChatInput.tsx`: Quản lý state chuyển đổi chế độ Text/GIF, đếm lùi cooldown chống spam, và gửi tin nhắn text thông thường.

---

### 4.4. Mô-đun hóa Trang Công cụ Dev Preview (`src/app/dev/preview/`)
* **Áp dụng SOLID:** SRP, OCP & LSP.
* **Thành phần phân rã (thư mục `src/app/dev/preview/panels/`):**
  1. `PhasePreviewPanel.tsx`: Bộ preview các màn chơi (Lobby, Playing, Reveal, Finished) và toggle Host/Viewer.
  2. `NetworkTestBench.tsx`: Bảng kiểm thử kết nối Socket.IO, Session Storage.
  3. `FoodImageTestBench.tsx`: Kiểm thử các trạng thái ảnh món ăn (loading, error, success).
  4. `ChatSimulatorBench.tsx`: Trình giả lập tin nhắn chat thời gian thực.
  5. `src/app/dev/preview/page.tsx`: Master layout dashboard gọn nhẹ (< 100 dòng).

---

## 5. BẢNG TỔNG HỢP CẤU TRÚC FILE SAU KHI REFACTOR

```
src/
├── app/
│   ├── page.tsx                     (Rút gọn < 60 dòng — Page Layout Controller)
│   ├── room/[code]/
│   │   └── page.tsx                 (Rút gọn < 100 dòng — Phase Coordinator)
│   └── dev/preview/
│       ├── page.tsx                 (Rút gọn < 110 dòng — Master Playground)
│       └── panels/                  (MỚI — Các module test tách biệt [SRP])
│           ├── PhasePreviewPanel.tsx
│           ├── NetworkTestBench.tsx
│           ├── FoodImageTestBench.tsx
│           └── ChatSimulatorBench.tsx
├── hooks/                           (MỚI — Tách các Custom Hooks [DIP])
│   ├── useClipboard.ts              (Trừu tượng hóa thao tác copy clipboard)
│   └── index.ts
├── components/
│   ├── hub/
│   │   ├── HubHeader.tsx            (MỚI — Top Navigation trang chủ [SRP])
│   │   ├── HubHero.tsx              (MỚI — Hero Banner trang chủ [SRP])
│   │   ├── CreateRoomForm.tsx       (Rút gọn < 110 dòng [SRP])
│   │   ├── JoinForm.tsx
│   │   ├── RoomCard.tsx
│   │   ├── RoomList.tsx             (Rút gọn < 120 dòng [SRP])
│   │   ├── create-room/             (MỚI — Subcomponents tạo phòng [OCP/LSP/ISP])
│   │   │   ├── RoundsConfigField.tsx
│   │   │   ├── TimerConfigField.tsx
│   │   │   └── RoomTogglesField.tsx
│   │   └── room-list/               (MỚI — Subcomponents danh sách phòng [ISP])
│   │       └── RoomFilterTabs.tsx
│   ├── lobby/
│   │   ├── LobbyView.tsx            (Xóa sạch text mốc giai đoạn)
│   │   ├── RoomConfigCard.tsx       (Rút gọn [ISP])
│   │   ├── RoomShareSection.tsx     (MỚI — Cụm sao chép mã phòng [SRP/DIP])
│   │   ├── HostControls.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerList.tsx
│   │   └── RoomClosedModal.tsx
│   ├── playing/
│   │   ├── PlayingView.tsx          (Rút gọn < 95 dòng [SRP])
│   │   ├── MiniScoreboard.tsx       (MỚI — Bảng điểm trực tiếp 50 người [SRP/ISP])
│   │   ├── PlayingHeader.tsx
│   │   ├── FoodDisplay.tsx
│   │   ├── SuggestionChips.tsx
│   │   ├── GuessInput.tsx
│   │   └── ScoreFeed.tsx
│   ├── room/
│   │   ├── RoomNavbar.tsx           (MỚI — Top Header phòng đấu [SRP/ISP])
│   │   ├── RoomLoadingCard.tsx      (MỚI — Card loading tái sử dụng [OCP])
│   │   ├── NameForm.tsx             (Chuẩn hóa footer sạch)
│   │   └── ConnectionBanner.tsx
│   └── chat/
│       ├── ChatInput.tsx            (Rút gọn < 120 dòng [SRP])
│       ├── GifInputPanel.tsx        (MỚI — Form nhập & gửi ảnh GIF [SRP/OCP])
│       ├── ChatBox.tsx
│       ├── ChatDrawer.tsx
│       └── ChatMessageItem.tsx
```

---

## 6. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC (5 BƯỚC AN TOÀN)

```
Bước 1: Chuẩn hóa & Dọn sạch toàn bộ UI Text mốc hoàn thiện (page, room, lobby, nameform)
         └── Kiểm tra: npx tsc --noEmit (0 lỗi) • npm run lint (0 lỗi)

Bước 2: Xây dựng Hook useClipboard & Tách nhỏ Component tại Hub & Trang Chủ (src/components/hub/)
         └── Kiểm tra: npx tsc --noEmit (0 lỗi) • npm run lint (0 lỗi)

Bước 3: Tách nhỏ Component khu vực phòng đấu (MiniScoreboard, RoomNavbar, RoomLoadingCard, RoomShareSection)
         └── Kiểm tra: npx tsc --noEmit (0 lỗi) • npm run lint (0 lỗi)

Bước 4: Tách nhỏ Component ChatInput (GifInputPanel)
         └── Kiểm tra: npx tsc --noEmit (0 lỗi) • npm run lint (0 lỗi)

Bước 5: Mô-đun hóa trang Dev Preview thành các Panels độc lập & Build Test toàn diện (npm run build)
         └── Nghiệm thu hoàn tất 100%
```

---

## 7. TIÊU CHUẨN NGHIỆM THU (ACCEPTANCE CRITERIA)
- [ ] Tuân thủ đầy đủ 5 nguyên lý SOLID (SRP, OCP, LSP, ISP, DIP).
- [ ] Giao diện người dùng không còn bất kỳ chữ `Giai đoạn X`, `Phase X`, `Kernel v2.x` nào trên trang chủ, sảnh chờ, và phòng đấu.
- [ ] Mọi component đều tuân thủ độ dài hợp lý (< 120–150 dòng), cấu trúc modular rõ ràng.
- [ ] Giữ vững phong cách thiết kế Text-Only UI tối giản, tương thích hoàn toàn chế độ Dark Mode.
- [ ] Toàn bộ luồng chơi hoạt động trơn tru: Tạo phòng, vào phòng, thi đấu, tính điểm, chatbox, GIF, kết nối WebSocket.
- [ ] `npx tsc --noEmit` đạt 0 lỗi.
- [ ] `npm run lint` đạt 0 cảnh báo, 0 lỗi.
- [ ] `npm run build` biên dịch thành công 100%.
