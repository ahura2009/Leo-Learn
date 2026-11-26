"use client";

import { useSyncExternalStore, useEffect, type ReactNode } from "react";
import { authApi } from "../lib/auth/client";
import { DEMO_USER, saveDemoProfile } from "../lib/auth/demo";
import { updateAuthUser } from "../lib/auth/session";
import { profileFromUser } from "../lib/auth/user";
import { useAuth } from "./AuthProvider";
import {
  activateUser,
  completeScenario,
  getServerSnapshot,
  getSnapshot,
  patchScenario,
  resetProgress,
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
  const { status, user } = useAuth();
  const userId = status === "authenticated" && user ? user.id : null;

  /* پیشرفت هر حساب جدا است؛ با تغییر نشست، storage همان کاربر فعال می‌شود. */
  useEffect(() => {
    if (status === "loading") return;
    activateUser(userId);
  }, [status, userId]);

  const profile = profileFromUser(
    status === "authenticated" ? user : null,
  );

  const saveProfile: AppContextValue["saveProfile"] = async (patch) => {
    if (status !== "authenticated" || !user) throw new Error("not signed in");

    /* حساب نمایشی سرور ندارد؛ ویرایش در همین مرورگر می‌ماند. */
    if (user.id === DEMO_USER.id) {
      saveDemoProfile(patch);
      updateAuthUser({
        ...user,
        name: patch.name ?? user.name,
        level: patch.level ?? user.level,
        goal: patch.goal ?? user.goal,
        avatar: patch.avatar ?? user.avatar,
        bio: patch.bio ?? user.bio,
        dailyMinutes: patch.dailyMinutes ?? user.dailyMinutes,
      });
      return;
    }

    const next = await authApi.updateProfile(patch);
    updateAuthUser(next);
  };

  const value: AppContextValue = {
    ready: snapshot.ready,
    profile,
    progress: snapshot.progress,
    saveProfile,
    resetAll: resetProgress,
    updateProgress,
    patchScenario,
    completeScenario,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/* بقیهٔ کامپوننت‌ها از همین مسیر هوک را می‌گیرند */
export { useApp } from "./app-context";
