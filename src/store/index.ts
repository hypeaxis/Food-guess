import { configureStore } from "@reduxjs/toolkit";
import connectionReducer from "./slices/connectionSlice";
import sessionReducer from "./slices/sessionSlice";
import roomReducer from "./slices/roomSlice";
import chatReducer from "./slices/chatSlice";
import uiReducer from "./slices/uiSlice";
import { socketMiddleware } from "./socketMiddleware";
import { roomsApi } from "./api/roomsApi";

// ---------------------------------------------------------------------------
// makeStore pattern for Next.js App Router
// Plan: section 2.2 & Giai đoạn 1 (Đầu việc 4) & Giai đoạn 2 (Đầu việc 1)
//
// Each call creates a fresh store instance. This avoids sharing state
// between requests on the server and between different tests.
// socketMiddleware is attached to manage socket lifecycle and events.
// roomsApi middleware is attached for RTK Query caching and polling.
// ---------------------------------------------------------------------------

export function makeStore() {
  return configureStore({
    reducer: {
      connection: connectionReducer,
      session: sessionReducer,
      room: roomReducer,
      chat: chatReducer,
      ui: uiReducer,
      [roomsApi.reducerPath]: roomsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(socketMiddleware)
        .concat(roomsApi.middleware),
  });
}

// Infer types from the store
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
