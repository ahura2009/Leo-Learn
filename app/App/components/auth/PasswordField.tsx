"use client";

import { useId, useState } from "react";
import {
  checkPassword,
  passwordIssueLabel,
  passwordStrength,
  type PasswordIssue,
} from "../../lib/auth/validation";
import styles from "./auth.module.css";

export function PasswordField({
  value,
  onChange,
  label,
  autoComplete,
  showRules = false,
  showStrength = false,
  phone,
  error,
  disabled,
  autoFocus,
  onBlur,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  autoComplete: "current-password" | "new-password";
  showRules?: boolean;
  showStrength?: boolean;
  phone?: string;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);
  const issues = new Set<PasswordIssue>(checkPassword(value, phone));

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.inputWrap}>
        <input
          id={id}
          className={`${styles.input} ${styles.passwordInput} ${
            error ? styles.invalid : ""
          }`}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder="••••••••"
          autoComplete={autoComplete}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error ? errorId : null, showRules ? `${id}-rules` : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          maxLength={72}
        />
        <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "مخفی‌کردن رمز عبور" : "نمایش رمز عبور"}
          aria-pressed={visible}
          tabIndex={disabled ? -1 : 0}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}

      {showStrength && value ? (
        <div className={styles.strength}>
          <div className={styles.strengthBars} aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`${styles.strengthSeg} ${
                  strength.score > index ? styles.strengthSegOn : ""
                }`}
              />
            ))}
          </div>
          <span className={styles.strengthLabel} aria-live="polite">
            قدرت رمز: {strength.label}
          </span>
        </div>
      ) : null}

      {showRules ? (
        <ul id={`${id}-rules`} className={styles.rules} aria-label="قوانین رمز عبور">
          {(["short", "no-letter", "no-digit", "same-as-phone"] as PasswordIssue[]).map(
            (issue) => {
              const done = !issues.has(issue);
              return (
                <li
                  key={issue}
                  className={`${styles.rule} ${done ? styles.ruleDone : ""}`}
                >
                  <span className={styles.ruleDot} aria-hidden="true" />
                  {passwordIssueLabel[issue]}
                </li>
              );
            },
          )}
        </ul>
      ) : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6 0 9.5 6 9.5 6a17.5 17.5 0 0 1-3.1 3.9" />
      <path d="M6.2 6.2C3.9 7.8 2.5 12 2.5 12S6 18 12 18a9.7 9.7 0 0 0 4.5-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
