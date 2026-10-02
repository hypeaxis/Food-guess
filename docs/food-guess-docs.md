## 1. Khái quát luồng hoạt động

```
[FE: Client]                                                      [BE: Server]
     |                                                                 |
     |---- 0. GET /api/rooms (Lấy danh sách phòng sảnh chờ) ---------->|
     |<--- [ { code, gameType, phase, participantCount, ... } ] -------|
     |                                                                 |
     |---- 1. Kết nối Socket.io (/socket.io) ------------------------>|
     |<--- 2. "connect" event -----------------------------------------|
     |                                                                 |
     |---- 3. emit "room:join" / "room:create" / "room:resume" ------->|
     |<--- 4. ack({ ok: true, data: { code, participantId, token } }) -|
     |<--- 5. emit "room:snapshot" (Snapshot ban đầu) -----------------|
     |                                                                 |
     |    [Lobby] Host bấm bắt đầu                                     |
     |---- 6. emit "food-guess:start" -------------------------------->|
     |<--- 7. emit "room:snapshot" (phase: "playing", round 1) --------|
     |                                                                 |
     |    [Playing] Người chơi gõ đáp án / chọn gợi ý                  |
     |---- 8. emit "food-guess:answer" { roundId, answer } ----------->|
     |<--- 9. ack({ ok: true, data: { correct, points, streak } }) ---|
     |<--- 10. emit "room:snapshot" (cập nhật trạng thái đã nộp) ------|
     |                                                                 |
     |    [Hết giờ / Mọi người nộp xong / Host skip]                   |
     |<--- 11. emit "room:snapshot" (phase: "roundReveal") ------------|
     |                                                                 |
     |    [Hết 5s auto hoặc Host bấm Next]                             |
     |<--- 12. emit "room:snapshot" (phase: "playing", round tiếp) ----|
     |                                                                 |
     |    [Hết totalRounds]                                            |
     |<--- 13. emit "room:snapshot" (phase: "finished") ---------------|
```

---

## 2. Cơ chế kết nối & Xác thực phiên (Session Flow)

### 2.1. Cấu hình Socket.IO Client
FE khởi tạo kết nối socket trỏ tới endpoint `/socket.io`:
```typescript
import { io } from "socket.io-client"

const socket = io({
  path: "/socket.io",
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
})
```

### 2.2. Chiến lược lưu trữ Storage
Sau khi tạo phòng hoặc tham gia phòng thành công, FE **bắt buộc phải lưu 3 thông tin** vào `localStorage` (theo key mã phòng `room_participant_{code}`) để hỗ trợ F5 / Reconnect:
```typescript
type StoredParticipant = {
  participantId: string  // ID định danh duy nhất của người chơi
  token: string          // Secret token dùng để resume phiên
  name: string           // Tên hiển thị của người chơi
}
```

### 2.3. Quy trình Reconnect / Refresh trang (F5)
Khi component mount hoặc khi socket kết nối lại (`socket.on("connect")`):
1. Kiểm tra `localStorage` xem có `StoredParticipant` của mã phòng này không.
2. **Nếu CÓ**: Gọi `socket.emit("room:resume", { code, participantId, token }, ack)`.
   - Nếu `ack.ok === true`: Cập nhật `snapshot` mới, người chơi vào thẳng ván chơi không cần nhập lại tên.
   - Nếu `ack.ok === false` (lỗi `RESUME_DENIED` hoặc `ROOM_NOT_FOUND`): Xóa dữ liệu cũ trong `localStorage`, hiển thị form nhập tên để tham gia lại từ đầu.
3. **Nếu KHÔNG**: Hiển thị form nhập tên (`room:join`).

---

## 3. REST API: Lấy danh sách phòng (`GET /api/rooms`)

Trước khi kết nối Socket hoặc để hiển thị danh sách phòng công khai ở màn hình Lobby / Hub game, FE sử dụng API HTTP REST này để lấy danh sách các phòng đang mở.

### Thông tin Endpoint:
- **URL**: `/api/rooms`
- **Method**: `GET`
- **Header**: `{ "cache": "no-store" }` (Khuyến nghị để không bị browser cache)
- **Tần suất gọi gợi ý**: Polling định kỳ mỗi **5 giây** (`setInterval`) hoặc khi người dùng bấm nút làm mới (Refresh).

### Request:
Không cần truyền query parameters hoặc body.

### Response Body:
```json
{
  "rooms": [
    {
      "code": "HA29KD",
      "gameType": "food-guess",
      "phase": "lobby",
      "participantCount": 3,
      "onlineCount": 2,
      "hostName": "NguyenVanA",
      "createdAt": 1727756000000
    },
    {
      "code": "BX88KL",
      "gameType": "worldcup",
      "phase": "voting",
      "participantCount": 5,
      "onlineCount": 4,
      "hostName": "TranVanB",
      "createdAt": 1727755800000,
      "round": 2,
      "roundTotal": 4
    }
  ]
}
```

### Chi tiết các trường dữ liệu (`RoomSummary`):
| Trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `code` | `string` | Mã phòng gồm 6 ký tự viết hoa (A-Z, 2-9). |
| `gameType` | `"food-guess" \| "worldcup" \| "song-guess" \| "foodcup"` | Chế độ chơi của phòng. |
| `phase` | `"lobby" \| "playing" \| "roundReveal" \| "finished" \| "voting" \| "tieBreak"` | Giai đoạn hiện tại của phòng. |
| `participantCount` | `number` | Tổng số thành viên trong phòng (bao gồm cả offline). |
| `onlineCount` | `number` | Số thành viên hiện đang kết nối socket. |
| `hostName` | `string \| null` | Tên của chủ phòng (Host). |
| `createdAt` | `number` | Timestamp thời điểm tạo phòng (ms). |

### Lưu ý cho FE đối với chế độ Food Guess:
- **Lọc phòng Food Guess**: API trả về phòng của **tất cả** các chế độ chơi trong hệ thống. FE cần filter theo `gameType === "food-guess"`:
  ```typescript
  const foodGuessRooms = data.rooms.filter(room => room.gameType === "food-guess")
  ```
- **Phân loại phòng có thể vào ngay**:
  - `room.phase === "lobby"`: Phòng đang đợi người chơi, vào chơi từ đầu.
  - `room.phase === "playing"`: Phòng đang trong trận, người chơi vào sẽ tham gia từ các vòng tiếp theo.
  - `room.participantCount >= 50`: Phòng đã đầy (tối đa 50 người).

---

## 4. Bản đồ Render Giao Diện theo `snapshot.phase`

FE căn cứ vào giá trị `snapshot.phase` để quyết định render View nào:

| `snapshot.phase` | Màn hình tương ứng | Điều kiện dữ liệu đi kèm | Nội dung chính cần render |
| :--- | :--- | :--- | :--- |
| `"lobby"` | **Sảnh chờ (Lobby)** | `snapshot.participants` | - Danh sách người chơi tham gia.<br>- Cấu hình phòng (số round, thời gian, auto next).<br>- Nút **"Bắt đầu"** (chỉ hiển thị cho Host `snapshot.viewer.isHost`).<br>- Khung chat phòng. |
| `"playing"` | **Màn hình đoán món ăn** | `snapshot.foodGuessRound !== null` | - Header: Vòng đấu hiện tại `roundNumber / totalRounds`.<br>- Thanh đếm ngược `GuessTimer` dựa vào `deadlineAt`.<br>- Ảnh món ăn: `<img src={round.mediaUrl} />`.<br>- Ô nhập câu trả lời & 3 Chips gợi ý `round.suggestions`.<br>- Khóa input khi `round.viewerAnswered === true`.<br>- Nút "Kết thúc round sớm" (Host only). |
| `"roundReveal"` | **Công bố đáp án vòng** | `snapshot.foodGuessReveal !== null` | - Tên món ăn chính xác (`reveal.foodName`) kèm ảnh chuẩn.<br>- Điểm cá nhân đạt được (`reveal.viewerPoints`, `reveal.viewerStreak`).<br>- Bảng xếp hạng đáp án và điểm của toàn bộ người chơi trong vòng vừa xong (`reveal.results`).<br>- Nút **"Round tiếp theo"** (chỉ hiện khi `config.autoNextRound === false` và là Host). |
| `"finished"` | **Bảng tổng kết (Game Over)** | `snapshot.participants`, `snapshot.foodGuessPastResults` | - Bảng xếp hạng tổng điểm chung cuộc (Top 1, 2, 3, huân chương/danh hiệu).<br>- Lịch sử chi tiết tất cả các vòng đã chơi để người chơi review lại.<br>- Nút **"Chơi lại (Rematch)"** (Host only). |

---

## 5. Đặc tả các Socket Events

### 5.1. Lắng nghe từ Server (Server-to-Client)

#### 1. `room:snapshot`
- **Tần suất**: Server phát ra mỗi khi có bất kỳ thay đổi nào trong phòng (người mới vào, rời phòng, đổi trạng thái online/offline, có câu trả lời mới, hết giờ, chuyển vòng...).
- **Xử lý FE**: Cập nhật trực tiếp vào State: `setSnapshot(newSnapshot)`.
- **Cấu trúc**: Xem mục [6.1. RoomSnapshot](#61-roomsnapshot).

#### 2. `chat:message`
- **Mô tả**: Nhận tin nhắn chat mới từ bất kỳ thành viên nào trong phòng.
- **Xử lý FE**: Append vào danh sách tin nhắn chat:
  ```typescript
  socket.on("chat:message", (message: ChatMessage) => {
    setChatMessages((prev) => [...prev, message])
  })
  ```

---

### 5.2. Gửi lệnh lên Server (Client-to-Server)

Tất cả các lệnh đều gửi kèm callback acknowledgment `ack?: (res: Ack<T>) => void`.

#### 1. Tạo phòng mới: `room:create`
- **Khi nào gọi**: Người dùng bấm "Tạo phòng" từ trang chủ.
- **Payload**:
  ```typescript
  {
    name: string, // 2 - 24 ký tự
    config: {
      gameType: "food-guess",
      totalRounds: number,       // 5 - 50 vòng (mặc định: 10 hoặc 15)
      answerTimeSeconds: number, // 10 - 120 giây (mặc định: 15 hoặc 20)
      autoNextRound: boolean,    // true: tự chuyển sau 5s; false: Host bấm tay
      comboStreakEnabled: boolean // true: nhân điểm khi đúng liên tiếp
    }
  }
  ```
- **Ack Response**:
  ```typescript
  {
    ok: true,
    data: {
      code: string,           // Mã phòng (6 ký tự, vd: "HA29KD")
      participantId: string,  // ID người chơi
      token: string,          // Secret token
      snapshot: RoomSnapshot  // Snapshot ban đầu
    }
  }
  ```

#### 2. Vào phòng: `room:join`
- **Khi nào gọi**: Người dùng nhập mã phòng và tên.
- **Payload**: `{ code: string, name: string }`
- **Ack Response**: Giống `room:create`.

#### 3. Khôi phục phiên: `room:resume`
- **Khi nào gọi**: Khi vừa tải lại trang hoặc vừa reconnect thành công và có dữ liệu trong storage.
- **Payload**: `{ code: string, participantId: string, token: string }`
- **Ack Response**: `{ ok: true, data: { snapshot: RoomSnapshot } }` hoặc `{ ok: false, error: "RESUME_DENIED" }`.

#### 4. Bắt đầu game: `food-guess:start`
- **Quyền**: Chỉ Host (`snapshot.viewer.isHost === true`).
- **Khi nào gọi**: Host bấm nút "Bắt đầu" tại màn hình Lobby.
- **Payload**: Không có (`socket.emit("food-guess:start", ack)`).
- **Ack Response**: `{ ok: true, data: {} }`.

#### 5. Nộp câu trả lời: `food-guess:answer`
- **Quyền**: Tất cả người chơi trong phòng.
- **Khi nào gọi**: 
  - Người chơi gõ text vào input và ấn Enter / bấm nút Gửi.
  - Người chơi click vào 1 trong 3 nút Gợi ý (Decoy Chip).
- **Payload**:
  ```typescript
  {
    roundId: string, // Lấy từ snapshot.foodGuessRound.id (vd: "HA29KD-fg-1")
    answer: string   // Tên món ăn đoán (1 - 200 ký tự)
  }
  ```
- **Ack Response**:
  ```typescript
  {
    ok: true,
    data: {
      correct: boolean,       // true: Đúng, false: Sai
      points: number,        // Điểm cộng được ở câu này (0 nếu sai)
      streak: number,        // Chuỗi trả lời đúng liên tiếp hiện tại
      comboApplied: boolean  // Có được nhân hệ số combo hay không
    }
  }
  ```
- **Gợi ý UI sau khi nhận Ack**:
  - `correct === true`: Hiển thị toast chúc mừng (nếu `comboApplied` thì toast: *"Chính xác! Combo x1.4 — +380đ"*).
  - `correct === false`: Hiển thị toast thông báo: *"Sai rồi! Chờ hết round để xem đáp án nhé."*.
  - Khóa ô input và nút gửi ngay lập tức.

#### 6. Bỏ qua vòng hiện tại: `food-guess:skip`
- **Quyền**: Chỉ Host.
- **Khi nào gọi**: Host bấm nút / gạt switch "Kết thúc round sớm".
- **Payload**: Không có.
- **Ack Response**: `{ ok: true, data: {} }`.

#### 7. Sang vòng kế tiếp: `food-guess:next`
- **Quyền**: Chỉ Host.
- **Khi nào gọi**: Host bấm "Round tiếp theo" khi đang ở màn hình reveal (chỉ cần thiết khi `config.autoNextRound === false`).
- **Payload**: Không có.
- **Ack Response**: `{ ok: true, data: {} }`.

#### 8. Chơi lại ván mới: `food-guess:rematch`
- **Quyền**: Chỉ Host.
- **Khi nào gọi**: Host bấm nút "Chơi lại" tại màn hình kết thúc (`finished`).
- **Payload**: Không có.
- **Ack Response**: `{ ok: true, data: {} }`.

#### 9. Rời phòng: `room:leave`
- **Khi nào gọi**: Người chơi bấm "Rời phòng".
- **Payload**: Không có.
- **Ack Response**: `{ ok: true, data: {} }`. (FE xóa storage và navigate về trang chủ).

#### 10. Gửi tin nhắn chat: `chat:send`
- **Payload**: `{ text: string }` (1 - 300 ký tự) HOẶC `{ gifUrl: string }`.
- **Ack Response**: `{ ok: true, data: ChatMessage }`.

---

## 6. Cấu trúc dữ liệu chi tiết (Payload Models)

### 6.1. `RoomSnapshot`
Snapshot tổng quan nhận từ sự kiện `room:snapshot`:

```typescript
type RoomSnapshot = {
  code: string                                    // Mã phòng (vd: "ABCDEF")
  phase: "lobby" | "playing" | "roundReveal" | "finished" // Trạng thái phòng
  config: FoodGuessConfig                         // Cấu hình phòng
  viewer: {                                       // Thông tin người xem hiện tại
    id: string
    name: string
    isHost: boolean                               // Có phải chủ phòng hay không
  } | null
  participants: Array<{                           // Danh sách người chơi trong phòng
    id: string
    name: string
    isHost: boolean
    isOnline: boolean                             // Đang online hay mất kết nối
    hasVoted: boolean
    score?: number                                // Tổng điểm hiện tại
    correctAnswers?: number                       // Số câu đã trả lời đúng
    streak?: number                               // Chuỗi đúng hiện tại
  }>
  foodGuessRound?: FoodGuessRoundSnapshot | null  // Dữ liệu câu hỏi vòng hiện tại
  foodGuessReveal?: FoodGuessReveal | null        // Dữ liệu đáp án vòng vừa xong
  foodGuessEvents?: FoodGuessScoreEvent[]         // Feed thông báo nộp bài real-time
  foodGuessPastResults?: Array<{                  // Lịch sử các vòng đã qua
    roundNumber: number
    results: FoodGuessRoundResult[]
  }>
  closedReason?: string | null                    // "ROOM_CLOSED" nếu host hủy phòng
  error?: string
}
```

### 6.2. `FoodGuessRoundSnapshot` (Dữ liệu vòng đang chơi)
Có giá trị khi `phase === "playing"`:

```typescript
type FoodGuessRoundSnapshot = {
  id: string                     // Mã định danh vòng (vd: "ABCDEF-fg-1")
  roundNumber: number            // Thứ tự vòng hiện tại (1, 2, 3...)
  totalRounds: number            // Tổng số vòng chơi của ván
  mediaUrl: string               // URL hình ảnh món ăn cần đoán
  startedAt: number              // Timestamp (ms) thời điểm bắt đầu vòng
  deadlineAt: number             // Timestamp (ms) thời điểm kết thúc đếm ngược
  submittedCount: number         // Số người đã nộp câu trả lời trong vòng này
  viewerAnswered: boolean        // Người xem hiện tại đã nộp câu trả lời chưa
  viewerResult: "correct" | "incorrect" | null // Kết quả của người xem
  viewerStreak?: number          // Streak hiện tại của người xem
  suggestions: string[]          // Danh sách 3 món ăn gợi ý đánh lạc hướng (Decoy)
}
```

### 6.3. `FoodGuessReveal` (Dữ liệu công bố đáp án)
Có giá trị khi `phase === "roundReveal"`:

```typescript
type FoodGuessReveal = {
  roundNumber: number            // Vòng vừa kết thúc
  foodName: string               // Tên chuẩn của món ăn (Đáp án đúng)
  resourceUrl: string            // Ảnh món ăn
  viewerPoints?: number          // Số điểm người xem nhận được ở vòng này
  viewerCorrect?: boolean        // Người xem trả lời đúng hay không
  viewerStreak?: number          // Streak mới nhất của người xem
  results: FoodGuessRoundResult[] // Bảng kết quả câu trả lời của tất cả mọi người
}

type FoodGuessRoundResult = {
  participantId: string
  participantName: string
  answer: string                 // Câu trả lời người chơi đã nộp
  isCorrect: boolean             // Đúng hay sai
  points: number                 // Điểm cộng được
  streak?: number                // Chuỗi streak sau vòng này
  comboApplied?: boolean         // Có được nhân hệ số combo không
}
```

### 6.4. `FoodGuessScoreEvent` (Feed thông báo trực tiếp)
Danh sách sự kiện nộp bài theo thời gian thực (hiển thị danh sách trượt dạng toast/feed ở sidebar):

```typescript
type FoodGuessScoreEvent = {
  id: string                     // Unique id của event
  roundNumber: number
  participantName: string        // Tên người vừa nộp
  answer: string                 // Câu trả lời
  isCorrect: boolean
  points: number
  streak?: number
  comboApplied?: boolean
  at: number                     // Timestamp lúc nộp
}
```

---

## 7. Bảng mã lỗi (Error Codes) & Gợi ý Toast UI

Khi `ack.ok === false`, `ack.error` sẽ trả về các mã sau, FE nên map ra câu thông báo thân thiện với người dùng:

| `ack.error` | Ý nghĩa từ BE | Gợi ý câu thông báo Toast UI |
| :--- | :--- | :--- |
| `ROOM_NOT_FOUND` | Phòng không tồn tại hoặc đã bị đóng. | *"Phòng chơi không tồn tại hoặc đã kết thúc."* |
| `ROOM_FULL` | Phòng đã đạt tối đa 50 người. | *"Phòng đã đầy người chơi (tối đa 50)."* |
| `NAME_TAKEN` | Tên đã có người khác dùng trong phòng. | *"Tên này đã được sử dụng, vui lòng chọn tên khác."* |
| `RESUME_DENIED` | Token hoặc ID người chơi không khớp. | *"Phiên đăng nhập đã hết hạn, vui lòng nhập lại tên."* |
| `INVALID_PAYLOAD` | Schema payload gửi lên bị sai kiểu dữ liệu. | *"Dữ liệu gửi lên không hợp lệ."* |
| `INVALID_PHASE` | Thao tác sai thời điểm (vd: bấm start khi đang chơi). | *"Thao tác không hợp lệ ở thời điểm này."* |
| `ROUND_MISMATCH` | `roundId` gửi lên không khớp với vòng hiện tại. | *"Vòng chơi đã thay đổi, vui lòng nộp lại câu hỏi mới."* |
| `TOO_LATE` | Gửi đáp án khi đồng hồ server đã hết giờ. | *"Rất tiếc! Đã hết thời gian trả lời câu này."* |
| `ALREADY_ANSWERED` | Người chơi đã nộp câu trả lời vòng này rồi. | *"Bạn đã nộp đáp án cho vòng này rồi."* |
| `HOST_ONLY` | Người chơi thường cố tình gọi lệnh của Host. | *"Chỉ chủ phòng (Host) mới có quyền thực hiện thao tác này."* |
| `NOT_IN_ROOM` | Socket chưa tham gia phòng nào. | *"Bạn chưa tham gia vào phòng chơi."* |
| `RATE_LIMITED` | Spam chat quá 5 tin trong 10 giây. | *"Bạn đang gửi tin nhắn quá nhanh, vui lòng chờ ít giây."* |
| `INVALID_GIF_URL` | Link GIF không nằm trong whitelist Tenor/Giphy. | *"Đường dẫn GIF không được hỗ trợ."* |
