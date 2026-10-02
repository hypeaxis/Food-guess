// ---------------------------------------------------------------------------
// StoredParticipant — saved to localStorage under key `room_participant_{code}`
// Used for F5 / reconnect / resume flow
// Docs: section 2.2
// ---------------------------------------------------------------------------

export type StoredParticipant = {
  participantId: string;  // Unique player ID
  token: string;          // Secret token for session resume
  name: string;           // Display name
};
