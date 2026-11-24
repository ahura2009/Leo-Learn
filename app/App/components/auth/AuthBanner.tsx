"use client";

import type { ReactNode } from "react";
import styles from "./auth.module.css";

type Variant = "error" | "warning" | "success";

const iconPath: Record<Variant, ReactNode> = {
  error: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.2" />
      <path d="M12 16.4h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.6 21 20H3z" />
      <path d="M12 9.4v4.4" />
      <path d="M12 16.8h.01" />
    </>
  ),
  success: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.4 2.7 2.7L16 9.8" />
    </>
  ),
};

export function AuthBanner({
  variant = "error",
  children,
  action,
}: {
  variant?: Variant;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={`${styles.banner} ${styles[`banner${capitalize(variant)}`]}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <svg
        className={styles.bannerIcon}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {iconPath[variant]}
      </svg>
      <span>{children}</span>
      {action}
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
