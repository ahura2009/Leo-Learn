"use client";

import { useState, useSyncExternalStore } from "react";
import type { CountryCode } from "libphonenumber-js/min";
import {
  DEFAULT_COUNTRY,
  countries,
  formatNational,
  normalizePhone,
} from "./phone";

const COUNTRY_KEY = "leo-learn:country";
const known = new Set<CountryCode>(countries.map((item) => item.code));

/* انتخاب کشور یک تنظیم شخصی مرورگر است، نه دادهٔ حساب؛ در یک store
   کوچک نگه داشته می‌شود تا رندر سرور با کلاینت ناسازگار نشود. */
let cachedCountry: CountryCode | null = null;
const listeners = new Set<() => void>();

function readCountry(): CountryCode {
  if (cachedCountry) return cachedCountry;

  try {
    const saved = window.localStorage.getItem(COUNTRY_KEY);
    cachedCountry = saved && known.has(saved as CountryCode)
      ? (saved as CountryCode)
      : DEFAULT_COUNTRY;
  } catch {
    cachedCountry = DEFAULT_COUNTRY;
  }

  return cachedCountry;
}

function getCountrySnapshot(): CountryCode {
  return readCountry();
}

function getCountryServerSnapshot(): CountryCode {
  return DEFAULT_COUNTRY;
}

function subscribeCountry(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setCountryPreference(code: CountryCode) {
  cachedCountry = code;
  try {
    window.localStorage.setItem(COUNTRY_KEY, code);
  } catch {
    /* بی‌صدا */
  }
  for (const listener of listeners) listener();
}

/**
 * وضعیت فیلد موبایل: کشور، شمارهٔ ملی و نتیجهٔ اعتبارسنجی.
 * کشور آخر در همین مرورگر به یاد می‌ماند.
 */
export function usePhoneField(initialNational = "") {
  const country = useSyncExternalStore(
    subscribeCountry,
    getCountrySnapshot,
    getCountryServerSnapshot,
  );
  const [national, setNational] = useState(initialNational);

  return {
    country,
    national,
    setCountry: setCountryPreference,
    setNational,
    result: normalizePhone(national, country),
    display: formatNational(national, country),
  };
}
