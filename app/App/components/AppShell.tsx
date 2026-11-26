"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { messageFor } from "../lib/auth/types";
import { useAuth } from "./AuthProvider";
import { useApp } from "./AppProvider";
import { AppNav } from "./AppNav";
import { Avatar } from "./Avatar";
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
      <aside className={styles.side}>
        <div className={styles.sideTop}>
          <Link href="/" className={styles.brand} aria-label="Leo Learn">
            <span className={styles.mark}>L</span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Leo Learn</span>
              <span className={styles.brandTag}>اپ تمرین</span>
            </span>
          </Link>

          {profile ? (
            <div className={styles.who}>
              <Avatar
                id={profile.avatar}
                name={profile.name}
                size={26}
              />
              <p className={styles.greeting}>
                سلام، <strong>{profile.name}</strong>
              </p>
            </div>
          ) : null}
        </div>

        <AppNav />

        <SideStats />
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}

/* آمار کوتاه پایین ستون — فضای خالی ستون را با چیزی مفید پر می‌کند. */
function SideStats() {
  const { progress } = useApp();
  const words = Object.keys(progress.words).length;
  const finished = Object.values(progress.scenarios).filter(
    (item) => item.completedAt,
  ).length;

  const rows = [
    { label: "روز پیوسته", value: progress.streak, icon: "flame" },
    { label: "درس تمام‌شده", value: finished, icon: "check" },
    { label: "واژه در دفتر", value: words, icon: "book" },
  ];

  return (
    <dl className={styles.stats}>
      {rows.map((row) => (
        <div key={row.label} className={styles.statRow}>
          <dt className={styles.statLabel}>
            <StatIcon name={row.icon} />
            {row.label}
          </dt>
          <dd className={styles.statValue}>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StatIcon({ name }: { name: string }) {
  const common = {
    width: 15,
    height: 15,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "flame") {
    return (
      <svg {...common}>
        <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.7-2.9 1.5-3.9C9 9.8 10 11 10 12c0-3 2-5.5 2-9z" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m4 12.5 5 5L20 6.5" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </svg>
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
