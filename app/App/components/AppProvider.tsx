"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  completeScenario,
  getServerSnapshot,
  getSnapshot,
  patchScenario,
  resetAll,
  saveProfile,
  subscribe,
  updateProgress,
} from "../lib/store";
import { AppContext, type AppContextValue } from "./app-context";

export function AppProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const value: AppContextValue = {
    ready: snapshot.ready,
    profile: snapshot.profile,
    progress: snapshot.progress,
    saveProfile,
    resetAll,
    updateProgress,
    patchScenario,
    completeScenario,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* بقیهٔ کامپوننت‌ها از همین مسیر هوک را می‌گیرند */
export { useApp } from "./app-context";
