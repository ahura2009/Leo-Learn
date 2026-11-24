"use client";

import { authApi } from "./client";
import {
  endDemoSession,
  getDemoUser,
  hasDemoSession,
} from "./demo";
import { AuthApiError, type AuthUser } from "./types";

/* وضعیت نشست در یک store کوچک بیرونی.
   AuthProvider با useSyncExternalStore به آن وصل می‌شود؛ خواندن
   کوکی/شبکه داخل رندر انجام نمی‌شود. */

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "anonymous"
  /** سرور در دسترس نیست یا تنظیم نشده — نه «مهمان» و نه «واردشده» */
  | "unavailable";

export type AuthSnapshot = {
  status: AuthStatus;
  user: AuthUser | null;
  error: AuthApiError | null;
};

const SERVER_SNAPSHOT: AuthSnapshot = {
  status: "loading",
  user: null,
  error: null,
};

let snapshot: AuthSnapshot = SERVER_SNAPSHOT;
let started = false;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function setSnapshot(next: AuthSnapshot) {
  snapshot = next;
  emit();
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  void refreshSession();
}

export function subscribeAuth(listener: () => void) {
  listeners.add(listener);
  ensureStarted();
  return () => {
    listeners.delete(listener);
  };
}

export function getAuthSnapshot(): AuthSnapshot {
  ensureStarted();
  return snapshot;
}

export function getAuthServerSnapshot(): AuthSnapshot {
  return SERVER_SNAPSHOT;
}

/** نشست را از سرور می‌خواند. اگر خطای شبکه/سرور بود، وضعیت «در دسترس نیست» می‌شود. */
export async function refreshSession(): Promise<void> {
  if (typeof window === "undefined") return;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const user = await authApi.session();
      if (user) {
        setSnapshot({ status: "authenticated", user, error: null });
      } else if (hasDemoSession()) {
        setSnapshot({ status: "authenticated", user: getDemoUser(), error: null });
      } else {
        setSnapshot({ status: "anonymous", user: null, error: null });
      }
    } catch (error) {
      const authError =
        error instanceof AuthApiError ? error : new AuthApiError("UNKNOWN");

      if (hasDemoSession()) {
        setSnapshot({ status: "authenticated", user: getDemoUser(), error: null });
      } else {
        setSnapshot({ status: "unavailable", user: null, error: authError });
      }
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** بعد از ورود/ثبت‌نام موفق، کاربر را بدون رفت‌وبرگشت دوباره ست می‌کند. */
export function setAuthUser(user: AuthUser) {
  setSnapshot({ status: "authenticated", user, error: null });
}

export function updateAuthUser(user: AuthUser) {
  if (snapshot.status === "authenticated") {
    setSnapshot({ status: "authenticated", user, error: null });
  }
}

export function clearAuthUser() {
  setSnapshot({ status: "anonymous", user: null, error: null });
}

export async function signOut(): Promise<void> {
  const demo = hasDemoSession();
  endDemoSession();

  if (!demo) await authApi.signOut();
  clearAuthUser();
}
