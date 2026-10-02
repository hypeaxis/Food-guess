// ---------------------------------------------------------------------------
// Error codes returned by BE in ack.error
// Docs: section 7
// ---------------------------------------------------------------------------

export type ErrorCode =
  | "ROOM_NOT_FOUND"
  | "ROOM_FULL"
  | "NAME_TAKEN"
  | "RESUME_DENIED"
  | "INVALID_PAYLOAD"
  | "INVALID_PHASE"
  | "ROUND_MISMATCH"
  | "TOO_LATE"
  | "ALREADY_ANSWERED"
  | "HOST_ONLY"
  | "NOT_IN_ROOM"
  | "RATE_LIMITED"
  | "INVALID_GIF_URL";

/**
 * Map of error codes to user-friendly Vietnamese messages.
 * Used by lib/errors.ts for toast notifications.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  ROOM_NOT_FOUND: "Phòng chơi không tồn tại hoặc đã kết thúc.",
  ROOM_FULL: "Phòng đã đầy người chơi (tối đa 50).",
  NAME_TAKEN: "Tên này đã được sử dụng, vui lòng chọn tên khác.",
  RESUME_DENIED: "Phiên đăng nhập đã hết hạn, vui lòng nhập lại tên.",
  INVALID_PAYLOAD: "Dữ liệu gửi lên không hợp lệ.",
  INVALID_PHASE: "Thao tác không hợp lệ ở thời điểm này.",
  ROUND_MISMATCH: "Vòng chơi đã thay đổi, vui lòng nộp lại câu hỏi mới.",
  TOO_LATE: "Rất tiếc! Đã hết thời gian trả lời câu này.",
  ALREADY_ANSWERED: "Bạn đã nộp đáp án cho vòng này rồi.",
  HOST_ONLY: "Chỉ chủ phòng (Host) mới có quyền thực hiện thao tác này.",
  NOT_IN_ROOM: "Bạn chưa tham gia vào phòng chơi.",
  RATE_LIMITED: "Bạn đang gửi tin nhắn quá nhanh, vui lòng chờ ít giây.",
  INVALID_GIF_URL: "Đường dẫn GIF không được hỗ trợ.",
};
