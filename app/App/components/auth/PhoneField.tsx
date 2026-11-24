"use client";

import { useId } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import {
  digitsOnly,
  formatNational,
  phoneExample,
  splitInternational,
} from "../../lib/auth/phone";
import { CountrySelect } from "./CountrySelect";
import styles from "./auth.module.css";

export function PhoneField({
  country,
  national,
  onCountryChange,
  onNationalChange,
  error,
  disabled,
  autoFocus,
  label = "شمارهٔ موبایل",
}: {
  country: CountryCode;
  national: string;
  onCountryChange: (code: CountryCode) => void;
  onNationalChange: (national: string) => void;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  label?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  const handleChange = (raw: string) => {
    const trimmed = raw.trim();

    /* چسباندن شمارهٔ کامل با + یا 00 — کشور و پیش‌شماره جدا می‌شوند. */
    if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
      const normalized = trimmed.startsWith("00")
        ? `+${trimmed.slice(2)}`
        : trimmed;
      const split = splitInternational(normalized);
      if (split) {
        onCountryChange(split.country);
        onNationalChange(split.national.slice(0, 15));
        return;
      }
    }

    onNationalChange(digitsOnly(trimmed).slice(0, 15));
  };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>

      <div className={styles.phoneRow}>
        <CountrySelect
          value={country}
          onChange={onCountryChange}
          disabled={disabled}
        />
        <input
          id={id}
          className={`${styles.input} ${error ? styles.invalid : ""}`}
          value={formatNational(national, country)}
          onChange={(event) => handleChange(event.target.value)}
          placeholder={phoneExample(country)}
          dir="ltr"
          inputMode="tel"
          type="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          maxLength={22}
        />
      </div>

      {error ? (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
