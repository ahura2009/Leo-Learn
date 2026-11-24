"use client";

import type { Progress } from "./types";

/* ذخیره‌سازی محلی — بدون سرور. هر خواندن/نوشتن داخل try/catch است،
   چون حالت خصوصی مرورگر می‌تواند دسترسی را با خطا رد کند.
   پیشرفت هر حساب با شناسهٔ کاربر جدا می‌شود تا حساب‌های یک مرورگر
   پیشرفت همدیگر را نبینند. */

const LEGACY_PROGRESS_KEY = "leo-learn:progress";
const LEGACY_PROFILE_KEY = "leo-learn:profile";

function progressKey(userId: string): string {
  return `leo-learn:progress:${userId}`;
}

export function emptyProgress(): Progress {
  return { version: 2, scenarios: {}, words: {}, days: [], streak: 0 };
}

function readJSON<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* فضا پر یا دسترسی بسته — صفحه باید بی‌صدا ادامه بدهد */
  }
}

export function readProgress(userId: string): Progress {
  const raw = readJSON<Progress & { version?: number }>(progressKey(userId));
  /* نسخهٔ قدیمی دموی لندینگ نسخه نداشت؛ مهاجرت نمی‌کنیم و از صفر می‌شود. */
  if (!raw || raw.version !== 2) return emptyProgress();

  return {
    version: 2,
    scenarios: raw.scenarios ?? {},
    words: raw.words ?? {},
    days: Array.isArray(raw.days) ? raw.days : [],
    streak: typeof raw.streak === "number" ? raw.streak : 0,
  };
}

export function writeProgress(userId: string, progress: Progress) {
  writeJSON(progressKey(userId), progress);
}

export function clearProgress(userId: string) {
  try {
    window.localStorage.removeItem(progressKey(userId));
  } catch {
    /* بی‌صدا */
  }
}

/* بعد از انتقال به حساب، دادهٔ محلی نسخهٔ بدون حساب دیگر خوانده نمی‌شود.
   فقط در لحظهٔ خروج از حساب اولیه پاک می‌شود تا مرورگر تمیز بماند. */
export function clearLegacyStorage() {
  try {
    window.localStorage.removeItem(LEGACY_PROGRESS_KEY);
    window.localStorage.removeItem(LEGACY_PROFILE_KEY);
  } catch {
    /* بی‌صدا */
  }
}

/* ---------- تاریخ و روز پیوسته ---------- */

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayBefore(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return todayKey(date);
}

/** یک روز تمرین را ثبت می‌کند؛ تکرار همان روز زنجیره را بالا نمی‌برد. */
export function markPracticed(progress: Progress, date = new Date()): Progress {
  const key = todayKey(date);
  if (progress.days.includes(key)) return progress;

  const streak = progress.days.includes(dayBefore(key))
    ? progress.streak + 1
    : 1;

  return { ...progress, days: [...progress.days, key], streak };
}

/** زنجیرهٔ فعلی را نسبت به «امروز» می‌سنجد تا عدد قدیمی نمایش داده نشود. */
export function currentStreak(progress: Progress, date = new Date()): number {
  const key = todayKey(date);
  if (progress.days.includes(key)) return progress.streak;
  if (progress.days.includes(dayBefore(key))) return progress.streak;
  return 0;
}
