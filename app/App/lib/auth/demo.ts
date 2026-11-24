"use client";

import type { AuthUser } from "./types";

/* حساب نمایشی برای ارائه — فقط همین شماره و رمز، به‌صورت محلی.
   این حساب به سرور وصل نیست و برای جایگزینی احراز هویت واقعی نیست.
   پیش از انتشار عمومی باید حذف شود. */

export const DEMO_ACCOUNT = {
  name: "Ahura",
  phone: "+989902155997",
  password: "ahura2009",
} as const;

export const DEMO_USER: AuthUser = {
  id: "demo-ahura",
  phone: DEMO_ACCOUNT.phone,
  name: DEMO_ACCOUNT.name,
  level: "A2",
  goal: "travel",
  createdAt: "2026-01-01T00:00:00.000Z",
  onboardedAt: "2026-01-01T00:00:00.000Z",
};

const DEMO_KEY = "leo-learn:demo-session";
const DEMO_PROFILE_KEY = "leo-learn:demo-profile";

export function isDemoLogin(phoneE164: string, password: string): boolean {
  return (
    phoneE164 === DEMO_ACCOUNT.phone && password === DEMO_ACCOUNT.password
  );
}

/** مشخصات نمایشی؛ ویرایش‌های نام/سطح/هدف در همین مرورگر می‌مانند. */
export function getDemoUser(): AuthUser {
  try {
    const raw = window.localStorage.getItem(DEMO_PROFILE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AuthUser>;
      return {
        ...DEMO_USER,
        name: typeof saved.name === "string" ? saved.name : DEMO_USER.name,
        level:
          saved.level === "A1" || saved.level === "A2" || saved.level === "B1"
            ? saved.level
            : DEMO_USER.level,
        goal:
          saved.goal === "travel" ||
          saved.goal === "work" ||
          saved.goal === "daily"
            ? saved.goal
            : DEMO_USER.goal,
      };
    }
  } catch {
    /* بی‌صدا */
  }

  return DEMO_USER;
}

export function saveDemoProfile(patch: {
  name?: string;
  level?: string;
  goal?: string;
}) {
  const next = { ...getDemoUser(), ...patch };
  try {
    window.localStorage.setItem(
      DEMO_PROFILE_KEY,
      JSON.stringify({ name: next.name, level: next.level, goal: next.goal }),
    );
  } catch {
    /* بی‌صدا */
  }
}

export function hasDemoSession(): boolean {
  try {
    return window.localStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}

export function startDemoSession() {
  try {
    window.localStorage.setItem(DEMO_KEY, "1");
  } catch {
    /* بی‌صدا */
  }
}

export function endDemoSession() {
  try {
    window.localStorage.removeItem(DEMO_KEY);
  } catch {
    /* بی‌صدا */
  }
}
