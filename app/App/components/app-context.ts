"use client";

import { createContext, useContext } from "react";
import type { Phrase, Profile, Progress, ScenarioProgress } from "../lib/types";

export type AppContextValue = {
  /** تا وقتی localStorage خوانده نشده، هیچ صفحه‌ای تصمیم نگیرد */
  ready: boolean;
  profile: Profile | null;
  progress: Progress;
  saveProfile: (profile: Profile) => void;
  resetAll: () => void;
  updateProgress: (updater: (current: Progress) => Progress) => void;
  patchScenario: (
    slug: string,
    updater: (current: ScenarioProgress) => ScenarioProgress,
  ) => void;
  completeScenario: (slug: string, words: Phrase[]) => void;
};

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}
