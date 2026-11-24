"use client";

import type { Challenge, ChallengePurpose } from "./types";

/* چالش در جریان (ثبت‌نام/بازیابی رمز) بین صفحه‌ها با sessionStorage
   منتقل می‌شود و مثل یک store کوچک بیرونی خوانده می‌شود تا صفحه
   بدون setState داخل effect به آن برسد. خودِ کد یک‌بارمصرف هرگز
   این‌جا نمی‌آید؛ فقط شناسهٔ چالش که سرور صادر کرده است. */

export type PendingFlow = {
  challenge: Challenge;
  /** ms — زمان آزادشدن ارسال دوباره */
  resendAt: number;
  /** ms — زمان ساخت، برای پاک‌کردن چالش‌های کهنه */
  savedAt: number;
};

export type PendingSnapshot = PendingFlow | null;

const prefix = "leo-learn:auth-flow:";

function key(purpose: ChallengePurpose) {
  return `${prefix}${purpose}`;
}

function isChallenge(value: unknown): value is Challenge {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Challenge>;
  return (
    (item.purpose === "signup" || item.purpose === "reset") &&
    typeof item.challengeId === "string" &&
    item.challengeId.length > 0 &&
    typeof item.phone === "string" &&
    typeof item.expiresAt === "string" &&
    typeof item.resendAfterSeconds === "number" &&
    typeof item.codeLength === "number"
  );
}

function readFromStorage(purpose: ChallengePurpose): PendingSnapshot {
  try {
    const raw = window.sessionStorage.getItem(key(purpose));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<PendingFlow>;
    if (
      !isChallenge(value.challenge) ||
      value.challenge.purpose !== purpose ||
      typeof value.resendAt !== "number" ||
      typeof value.savedAt !== "number"
    ) {
      return null;
    }

    /* چالش بیش از دو ساعت کهنه است — سرور هم آن را منقضی می‌کند. */
    if (Date.now() - value.savedAt > 2 * 60 * 60 * 1000) return null;

    return value as PendingFlow;
  } catch {
    return null;
  }
}

const cache = new Map<ChallengePurpose, PendingSnapshot>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function snapshot(purpose: ChallengePurpose): PendingSnapshot {
  if (!cache.has(purpose)) cache.set(purpose, readFromStorage(purpose));
  return cache.get(purpose) ?? null;
}

export function subscribePending(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSignupPending(): PendingSnapshot {
  return snapshot("signup");
}

export function getResetPending(): PendingSnapshot {
  return snapshot("reset");
}

/** در رندر سرور هیچ چالشی نمی‌شناسیم؛ hydrating در کلاینت مقدار واقعی را می‌آورد. */
export function getPendingServerSnapshot(): undefined {
  return undefined;
}

export function savePending(flow: { challenge: Challenge; resendAt: number }) {
  const value: PendingFlow = { ...flow, savedAt: Date.now() };

  try {
    window.sessionStorage.setItem(
      key(flow.challenge.purpose),
      JSON.stringify(value),
    );
  } catch {
    /* حالت خصوصی — صفحه با نبود چالش به شروع جریان برمی‌گردد */
  }

  cache.set(flow.challenge.purpose, value);
  emit();
}

export function clearPending(purpose: ChallengePurpose) {
  try {
    window.sessionStorage.removeItem(key(purpose));
  } catch {
    /* بی‌صدا */
  }

  cache.set(purpose, null);
  emit();
}
