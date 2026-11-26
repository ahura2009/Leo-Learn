import Link from "next/link";
import { HeaderNav } from "./HeaderNav";
import styles from "./Header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* لوگو — سمت راست (شروع در RTL) */}
        <Link href="/" className={styles.logo} aria-label="Leo Learn">
          <span className={styles.logoMark}>L</span>
          <span className={styles.logoBlock}>
            <span className={styles.logoText}>Leo Learn</span>
            <span className={styles.logoTagline}>انگلیسی رو زندگی کن</span>
          </span>
        </Link>

        {/* منو — وسط */}
        <HeaderNav />

        {/* دکمه‌ها — سمت چپ */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            aria-label="حالت روشن و تاریک"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <Link href="/App/sign-in" className={styles.cta}>
            ثبت‌نام / ورود
          </Link>
        </div>
      </div>
    </header>
  );
}
