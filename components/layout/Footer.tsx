import Link from "next/link";
import styles from "./Footer.module.css";

const columns = [
  {
    title: "محصول",
    links: [
      { label: "قابلیت‌ها", href: "#features" },
      { label: "روش آموزشی", href: "#how" },
      { label: "سناریوها", href: "#scenarios" },
    ],
  },
  {
    title: "یادگیری",
    links: [
      { label: "مسیر یادگیری", href: "#path" },
      { label: "آشنایی با لئو", href: "#leo" },
      { label: "سؤالات متداول", href: "#faq" },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* برند — ستون پهن */}
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>L</span>
            <span className={styles.logoBlock}>
              <span className={styles.logoText}>Leo Learn</span>
              <span className={styles.logoTagline}>انگلیسی رو زندگی کن</span>
            </span>
          </div>

          <p className={styles.about}>
            با لئو موقعیت‌های واقعی زندگی را تمرین کن — از سفارش در کافه تا
            مصاحبهٔ کاری — و از همان روز اول انگلیسی حرف بزن.
          </p>

          <Link href="/App/sign-up" className={styles.cta}>
            شروع رایگان
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* ستون‌های لینک */}
        <nav className={styles.columns} aria-label="لینک‌های پانوشت">
          {columns.map((column) => (
            <div key={column.title} className={styles.column}>
              <h2 className={styles.columnTitle}>{column.title}</h2>

              <ul className={styles.list}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* نوار پایانی */}
      <div className={styles.bottom}>
        <div className={styles.bottomInner}>
          <p className={styles.copyright}>
            © ۲۰۲۶ Leo Learn — همهٔ حقوق محفوظ است.
          </p>

          <a href="#top" className={styles.toTop}>
            بازگشت به بالا
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
