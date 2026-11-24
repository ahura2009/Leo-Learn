"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { messageFor } from "../lib/auth/types";
import { useAuth } from "./AuthProvider";
import { useApp } from "./AppProvider";
import { AppNav } from "./AppNav";
import styles from "./AppShell.module.css";

/* شل اپ: هدر بالا، ستون ناوبری راست، محتوا وسط.
   صفحه‌های درس، onboarding و احراز هویت بدون ناوبری و بدون قاب
   نمایش داده می‌شوند. تا نشست روشن نشود، محتوای حساب‌دار رندر نمی‌شود. */

const barePaths = [
  "/App/onboarding",
  "/lesson",
  "/App/sign-in",
  "/App/sign-up",
  "/App/verify",
  "/App/forgot-password",
  "/App/reset-password",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useApp();
  const { status, error, refresh } = useAuth();

  const bare = barePaths.some((path) => pathname.includes(path));

  /* چون تا روشن‌شدن نشست، صفحهٔ فرزند رندر نمی‌شود، خود شل باید
     مهمان را به ورود بفرستد. */
  useEffect(() => {
    if (!bare && status === "anonymous") router.replace("/App/sign-in");
  }, [bare, status, router]);

  if (bare) {
    return <div className={styles.bare}>{children}</div>;
  }

  if (status === "loading" || status === "anonymous") {
    return (
      <StatusScreen
        title="در حال بررسی نشست…"
        text="یک لحظه؛ در حال بررسی ورود تو."
        loading
      />
    );
  }

  if (status === "unavailable") {
    return (
      <StatusScreen
        title="سرور احراز هویت در دسترس نیست"
        text={messageFor(error)}
        onRetry={refresh}
      />
    );
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

function StatusScreen({
  title,
  text,
  loading = false,
  onRetry,
}: {
  title: string;
  text: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.status}>
      <div className={styles.statusCard}>
        {loading ? (
          <span className={styles.statusSpinner} aria-hidden="true" />
        ) : (
          <span className={styles.statusIcon} aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3.6 21 20H3z" />
              <path d="M12 9.4v4.4" />
              <path d="M12 16.8h.01" />
            </svg>
          </span>
        )}

        <h1 className={styles.statusTitle}>{title}</h1>
        <p className={styles.statusText}>{text}</p>

        <div className={styles.statusActions}>
          {onRetry ? (
            <button type="button" className={styles.retry} onClick={onRetry}>
              تلاش دوباره
            </button>
          ) : null}
          <Link href="/App/sign-in" className={styles.statusLink}>
            صفحهٔ ورود
          </Link>
        </div>
      </div>
    </div>
  );
}
