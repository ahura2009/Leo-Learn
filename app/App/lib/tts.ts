"use client";

import { useSyncExternalStore } from "react";

/* TTS مرورگر — فقط انگلیسی. اگر مرورگر پشتیبانی نکند، دکمه‌ای هم ساخته نمی‌شود. */

export function ttsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

const noopSubscribe = () => () => {};

/** پشتیبانی مرورگر فقط بعد از hydration خوانده می‌شود، بدون setState در effect. */
export function useTtsSupported(): boolean {
  return useSyncExternalStore(noopSubscribe, ttsSupported, () => false);
}

export function speak(text: string, rate = 0.92) {
  if (!ttsSupported()) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = rate;
    window.speechSynthesis.speak(utterance);
  } catch {
    /* بی‌صدا — تمرین نباید به‌خاطر صدا قطع شود */
  }
}

export function stopSpeaking() {
  if (!ttsSupported()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* بی‌صدا */
  }
}
