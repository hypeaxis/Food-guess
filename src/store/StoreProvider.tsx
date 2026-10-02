"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "./index";

// ---------------------------------------------------------------------------
// StoreProvider — Client Component that wraps the app with Redux Provider
// Plan: section 2.2 — makeStore + StoreProvider (client component)
//
// Uses lazy useState initialization to ensure the store is created exactly once
// per client lifecycle without violating React 19's react-hooks/refs rules.
// ---------------------------------------------------------------------------

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
