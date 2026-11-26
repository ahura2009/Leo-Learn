"use client";

import { createContext, useContext } from "react";
import type { Phrase, Profile, Progress, ScenarioProgress } from "../lib/types";

export type ProfilePatch = Partial<
  Pick<Profile, "name" | "level" | "goal" | "avatar" | "bio" | "dailyMinutes">
>;

export type AppContextValue = {
  /** تا وقتی پیشرفت کاربر جاری خوانده نشده، هیچ صفحه‌ای تصمیم نگیرد */
  ready: boolean;
  /** فقط بعد از اتمام onboarding مقدار دارد */
  profile: Profile | null;
  progress: Progress;
  /** نام/سطح/هدف را در حساب ذخیره می‌کند (سرور منبع حقیقت است) */
  saveProfile: (patch: ProfilePatch) => Promise<void>;
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
