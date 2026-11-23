"use client";

import { speak, useTtsSupported } from "../lib/tts";
import styles from "./SpeakButton.module.css";

type SpeakButtonProps = {
  text: string;
  label?: string;
  /** کوچک برای داخل کارت عبارت */
  compact?: boolean;
};

export function SpeakButton({
  text,
  label = "شنیدن",
  compact = false,
}: SpeakButtonProps) {
  /* فقط بعد از hydration معلوم می‌شود؛ وگرنه HTML سرور و کلاینت یکی نمی‌ماند */
  const supported = useTtsSupported();

  if (!supported) return null;

  return (
    <button
      type="button"
      className={`${styles.button} ${compact ? styles.compact : ""}`}
      onClick={() => speak(text)}
      aria-label={`${label}: ${text}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
      {compact ? null : <span>{label}</span>}
    </button>
  );
}
