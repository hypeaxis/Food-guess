import { configureStore } from "@reduxjs/toolkit";
import connectionReducer from "./slices/connectionSlice";
import sessionReducer from "./slices/sessionSlice";
import roomReducer from "./slices/roomSlice";
import chatReducer from "./slices/chatSlice";
import uiReducer from "./slices/uiSlice";
import { socketMiddleware } from "./socketMiddleware";

// ---------------------------------------------------------------------------
// makeStore pattern for Next.js App Router
// Plan: section 2.2 & Giai đoạn 1 (Đầu việc 4)
//
// Each call creates a fresh store instance. This avoids sharing state
// between requests on the server and between different tests.
// socketMiddleware is attached to manage socket lifecycle and events.
// ---------------------------------------------------------------------------

export function makeStore() {
  return configureStore({
    reducer: {
      connection: connectionReducer,
      session: sessionReducer,
      room: roomReducer,
      chat: chatReducer,
      ui: uiReducer,
      // roomsApi reducer will be added in Phase 2 (RTK Query)
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(socketMiddleware),
  });
}

// Infer types from the store
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
