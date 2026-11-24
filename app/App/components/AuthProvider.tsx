"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  clearAuthUser,
  getAuthServerSnapshot,
  getAuthSnapshot,
  refreshSession,
  signOut as signOutSession,
  subscribeAuth,
} from "../lib/auth/session";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot,
  );

  const signOut = async () => {
    try {
      await signOutSession();
    } catch (error) {
      /* اگر سرور خروج را تأیید نکرد، وضعیت محلی را هم عوض نمی‌کنیم؛
         وگرنه کاربر فکر می‌کند خارج شده در حالی که نشست زنده است. */
      throw error;
    }
  };

  const value: AuthContextValue = {
    status: snapshot.status,
    user: snapshot.user,
    error: snapshot.error,
    refresh: refreshSession,
    signOut,
    clearLocalSession: clearAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { useAuth } from "./auth-context";
