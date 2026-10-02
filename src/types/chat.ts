// ---------------------------------------------------------------------------
// ChatMessage — received via chat:message and returned by chat:send ack
// Docs: section 5.1 (listener) and 5.2.10 (sender)
//
// Structure inferred from docs: chat:send accepts { text } or { gifUrl },
// and ack returns ChatMessage. The server likely adds metadata fields.
// ---------------------------------------------------------------------------

export type ChatMessage = {
  id: string;
  participantId: string;
  participantName: string;
  text?: string;          // Present when sending a text message
  gifUrl?: string;        // Present when sending a GIF (Tenor/Giphy only)
  sentAt: number;         // Timestamp (ms)
};
