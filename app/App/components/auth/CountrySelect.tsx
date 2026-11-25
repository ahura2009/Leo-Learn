"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import { countries, countryOption } from "../../lib/auth/phone";
import { CountryFlag } from "./CountryFlag";
import styles from "./auth.module.css";

/* انتخاب پیش‌شماره — قابل جست‌وجو با نام فارسی/انگلیسی، کد دوحرفی یا +کد. */

export function CountrySelect({
  value,
  onChange,
  disabled,
}: {
  value: CountryCode;
  onChange: (code: CountryCode) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = countryOption(value);

  useEffect(() => {
    if (!open) return;

    const close = () => {
      setOpen(false);
      setQuery("");
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return countries;

    const compact = needle.replace(/\s/g, "");
    return countries.filter(
      (item) =>
        item.nameFa.toLowerCase().includes(needle) ||
        item.nameEn.toLowerCase().includes(needle) ||
        item.code.toLowerCase() === compact ||
        item.dial.replace("+", "").startsWith(compact.replace("+", "")),
    );
  }, [query]);

  return (
    <div ref={anchorRef} className={styles.countryAnchor}>
      <button
        type="button"
        className={styles.countryButton}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`پیش‌شمارهٔ کشور: ${selected.nameFa} ${selected.dial}`}
        disabled={disabled}
        onClick={() => {
          setQuery("");
          setOpen((current) => !current);
        }}
      >
        <span className={styles.countrySelected}>
          <CountryFlag code={selected.code} />
          <span className={styles.countryDial} dir="ltr">
            {selected.dial}
          </span>
        </span>
        <Chevron />
      </button>

      {open ? (
        <div className={styles.countryPanel} role="dialog" aria-label="انتخاب کشور">
          <input
            ref={searchRef}
            className={styles.countrySearch}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجوی کشور…"
            aria-label="جست‌وجوی کشور"
            autoComplete="off"
          />
          <ul className={styles.countryList} role="listbox">
            {results.slice(0, 80).map((item) => (
              <li key={item.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={item.code === value}
                  className={`${styles.countryOption} ${
                    item.code === value ? styles.countryActive : ""
                  }`}
                  onClick={() => {
                    onChange(item.code);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <span className={styles.countryOptionName}>
                    <CountryFlag code={item.code} />
                    <span>{item.nameFa}</span>
                  </span>
                  <span dir="ltr">{item.dial}</span>
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className={styles.countryEmpty}>کشوری پیدا نشد.</li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
