"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppNav.module.css";

/* چهار مقصد اپ. روی دسکتاپ ستونِ کناری راست، روی باریک‌تر
   نوار پایین — همان لندینگ، فقط جای دیگر. */

const items = [
  { href: "/App", label: "امروز", icon: "home" },
  { href: "/App/path", label: "مسیر", icon: "path" },
  { href: "/App/progress", label: "پیشرفت", icon: "chart" },
  { href: "/App/profile", label: "پروفایل", icon: "user" },
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      </svg>
    );
  }
  if (name === "path") {
    return (
      <svg {...common}>
        <path d="M5 4v9a4 4 0 0 0 4 4h10" />
        <path d="m15 13 4 4-4 4" />
      </svg>
    );
  }
  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 20V10" />
        <path d="M10 20V4" />
        <path d="M16 20v-7" />
        <path d="M22 20H2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

export function AppNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/App"
      ? /\/App\/?$/.test(pathname)
      : pathname.includes(href);

  return (
    <nav className={styles.nav} aria-label="منوی اپ">
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`${styles.item} ${
                isActive(item.href) ? styles.active : ""
              }`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <Icon name={item.icon} />
              <span className={styles.label}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
