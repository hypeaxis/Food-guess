import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatMessage } from "@/types";

// ---------------------------------------------------------------------------
// Chat state — stores recent chat messages (capped at 200)
// Plan: section 2.2 — "messages: ChatMessage[] (giới hạn 200 tin gần nhất)"
// ---------------------------------------------------------------------------

const MAX_MESSAGES = 200;

type ChatState = {
  messages: ChatMessage[];
};

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addChatMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
      // Keep only the latest MAX_MESSAGES
      if (state.messages.length > MAX_MESSAGES) {
        state.messages = state.messages.slice(-MAX_MESSAGES);
      }
    },
    clearChat(state) {
      state.messages = [];
    },
  },
});

export const { addChatMessage, clearChat } = chatSlice.actions;

export default chatSlice.reducer;
