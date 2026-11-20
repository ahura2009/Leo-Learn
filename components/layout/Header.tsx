import Link from "next/link";
import styles from "./Header.module.css";

const navItems = [
  { label: "قابلیت‌ها", href: "#features" },
  { label: "روش آموزشی", href: "#how" },
  { label: "لئو", href: "#leo" },
  { label: "سناریوها", href: "#scenarios" },
  { label: "سؤالات متداول", href: "#faq" },
];

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
        <nav className={styles.nav} aria-label="منوی اصلی">
          {navItems.map((item, index) => (
            <a
              key={item.href}
              href={item.href}
              className={`${styles.navLink} ${
                index === 0 ? styles.navLinkActive : ""
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>

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

          <Link href="#scenarios" className={styles.cta}>
            ثبت‌نام / ورود
          </Link>
        </div>
      </div>
    </header>
  );
}
