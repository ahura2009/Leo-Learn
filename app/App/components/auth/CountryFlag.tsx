"use client";

import { useState } from "react";
import styles from "./auth.module.css";

/* پرچم کوچک کشور — از CDN پرچم‌ها (PNG سبک) خوانده می‌شود.
   کد کشور همان کد دوسطحی libphonenumber است؛ برای کدهایی که پرچم
   ندارند (مثل AC/TA) تصویر بی‌خطا حذف می‌شود تا جای خالی نماند. */

const FLAG_CDN = "https://flagcdn.com/w40";

export function CountryFlag({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element -- پرچم‌های کوچک خارجی، بدون بهینه‌سازی Next
    <img
      src={`${FLAG_CDN}/${code.toLowerCase()}.png`}
      alt=""
      width={20}
      height={15}
      loading="lazy"
      decoding="async"
      className={styles.countryFlag}
      onError={() => setFailed(true)}
    />
  );
}
