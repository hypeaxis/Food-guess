// Barrel export for lib utilities
// Plan: section 2.5 & Giai đoạn 1 (Đầu việc 1 & 2)

export { API_URL } from "./config";

export {
  socket,
  getSocket,
  connectSocket,
  disconnectSocket,
} from "./socket";

export {
  getStoredParticipant,
  setStoredParticipant,
  clearStoredParticipant,
  hasStoredParticipant,
} from "./session";

export {
  getErrorMessage,
  isErrorCode,
  SocketAckError,
  ERROR_MESSAGES,
} from "./errors";
export type { ErrorCode } from "./errors";

export { emitWithAck } from "./emitWithAck";
export type { EmitWithAckOptions } from "./emitWithAck";
