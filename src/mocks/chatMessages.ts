import type { ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// Mock Chat messages for testing chat component
// Plan: section 3 (Giai đoạn 0 & Giai đoạn 1)
// ---------------------------------------------------------------------------

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    participantId: "system",
    participantName: "Hệ thống",
    text: "Chào mừng các bạn đến với phòng FOOD88!",
    sentAt: Date.now() - 60000,
  },
  {
    id: "msg-2",
    participantId: "p2",
    participantName: "Bảo Bình",
    text: "Món này nhìn quen quá mà chưa nhớ tên 🤤",
    sentAt: Date.now() - 40000,
  },
  {
    id: "msg-3",
    participantId: "p3",
    participantName: "Khánh Chi",
    text: "Nhìn như phở bò tái nạm ấy!",
    sentAt: Date.now() - 25000,
  },
  {
    id: "msg-4",
    participantId: "p1",
    participantName: "Quốc An (Host)",
    text: "Mọi người sẵn sàng chưa nào?",
    sentAt: Date.now() - 10000,
  },
];
