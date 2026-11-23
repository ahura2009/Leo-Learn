"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "./AppProvider";
import { AppNav } from "./AppNav";
import styles from "./AppShell.module.css";

/* شل اپ: هدر بالا، ستون ناوبری راست، محتوا وسط.
   صفحهٔ درس و onboarding بدون ناوبری و بدون قاب نمایش داده می‌شوند. */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile } = useApp();

  const bare =
    pathname.includes("/App/onboarding") || pathname.includes("/lesson");

  if (bare) {
    return <div className={styles.bare}>{children}</div>;
  }

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="Leo Learn">
          <span className={styles.mark}>L</span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>Leo Learn</span>
            <span className={styles.brandTag}>اپ تمرین</span>
          </span>
        </Link>

        {profile ? (
          <span className={styles.greeting}>سلام، {profile.name}</span>
        ) : null}
      </header>

      <div className={styles.body}>
        <aside className={styles.side}>
          <AppNav />
        </aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
