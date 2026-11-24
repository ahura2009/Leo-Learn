"use client";

import { useId, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { digitsOnly } from "../../lib/auth/phone";
import styles from "./auth.module.css";

/* ورودی کد یک‌بارمصرف — جعبه‌های جدا، چسباندن و جای‌گذاری خودکار. */

export function OtpField({
  value,
  onChange,
  length = 6,
  invalid = false,
  disabled = false,
  autoFocus = false,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  onComplete?: (value: string) => void;
}) {
  const groupId = useId();
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const focusCell = (index: number) => {
    const target = refs.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
    target?.select();
  };

  const commit = (next: string, focusIndex?: number) => {
    onChange(next);
    if (next.length === length) {
      onComplete?.(next);
      focusCell(length - 1);
    } else if (focusIndex !== undefined) {
      focusCell(focusIndex);
    }
  };

  const handleChange = (index: number, raw: string) => {
    const digits = digitsOnly(raw).slice(0, length);

    if (!digits) {
      commit(value.slice(0, index), index);
      return;
    }

    /* پر شدن یک‌جا (چسباندن یا پیشنهاد خودکار پیامک) */
    if (digits.length > 1) {
      const next = (value.slice(0, index) + digits).slice(0, length);
      commit(next, next.length);
      return;
    }

    const next =
      index >= value.length
        ? (value + digits).slice(0, length)
        : value.slice(0, index) + digits + value.slice(index + 1);

    commit(next, index + 1);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (index < value.length) {
        commit(value.slice(0, index), Math.max(0, index - 1));
      } else if (index > 0) {
        commit(value.slice(0, index - 1), index - 1);
      }
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusCell(index - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusCell(index + 1);
    }
  };

  const handlePaste = (index: number, event: ClipboardEvent<HTMLInputElement>) => {
    const digits = digitsOnly(event.clipboardData.getData("text")).slice(0, length);
    if (!digits) return;
    event.preventDefault();
    const next = (value.slice(0, index) + digits).slice(0, length);
    commit(next, next.length);
  };

  return (
    <div
      className={styles.otpRow}
      role="group"
      aria-label="کد تأیید پیامکی"
      id={groupId}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          className={`${styles.otpCell} ${
            index < value.length ? styles.otpFilled : ""
          } ${invalid ? styles.otpInvalid : ""}`}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.currentTarget.select()}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          disabled={disabled}
          maxLength={1}
          aria-label={`رقم ${index + 1} از ${length}`}
          aria-invalid={invalid}
        />
      ))}
    </div>
  );
}
