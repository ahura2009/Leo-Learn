"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { assetPath } from "@/lib/asset-path";
import styles from "./auth.module.css";

/* قاب مشترک همهٔ صفحه‌های ورود/ثبت‌نام.
   ستون برند در سمت چپ (دسکتاپ) و فرم در سمت راست؛ در موبایل فقط فرم. */

export function AuthScreen({
  children,
  aside = true,
}: {
  children: ReactNode;
  aside?: boolean;
}) {
  return (
    <div className={styles.screen}>
      <div className={`${styles.frame} ${aside ? "" : styles.frameSingle}`}>
        <div className={styles.formPanel}>
          <div className={styles.card}>
            <div className={styles.compactBrand}>
              <span className={styles.logoMark}>L</span>
              <span className={styles.logoWord}>Leo Learn</span>
            </div>
            {children}
          </div>
        </div>
        {aside ? <BrandPanel /> : null}
      </div>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className={styles.brandPanel} aria-label="دربارهٔ Leo Learn">
      <div>
        <div className={styles.brandTop}>
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoWord}>Leo Learn</span>
        </div>

        <h2 className={styles.brandTitle}>
          انگلیسی را
          <br />
          در زندگی واقعی تمرین کن
        </h2>
        <p className={styles.brandLead}>
          لئو موقعیت‌های واقعی را جلوی تو می‌آورد؛ از سفارش در کافه تا
          گفت‌وگو با همکار.
        </p>

        <ul className={styles.brandList}>
          <li className={styles.brandItem}>
            <span className={styles.brandBullet} aria-hidden="true">
              <CheckIcon />
            </span>
            تمرین کوتاه روزانه، بدون کتاب و کلاس
          </li>
          <li className={styles.brandItem}>
            <span className={styles.brandBullet} aria-hidden="true">
              <CheckIcon />
            </span>
            پیشرفت و زنجیرهٔ روزهایت در حساب خودت
          </li>
          <li className={styles.brandItem}>
            <span className={styles.brandBullet} aria-hidden="true">
              <CheckIcon />
            </span>
            ورود امن با موبایل و کد پیامکی
          </li>
        </ul>
      </div>

      <div className={styles.leoWrap}>
        <span className={styles.leo}>
          <Image
            src={assetPath("/images/leo-avatar.webp")}
            alt=""
            width={160}
            height={160}
            className={styles.leoImage}
          />
        </span>
        <div className={styles.leoBubble}>
          <p className={styles.leoName}>لئو</p>
          <p className={styles.leoText}>
            نگران اشتباه نباش؛ من همین‌جا هستم تا با هم تمرین کنیم.
          </p>
        </div>
      </div>
    </aside>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m4 12.5 5 5L20 6.5" />
    </svg>
  );
}
