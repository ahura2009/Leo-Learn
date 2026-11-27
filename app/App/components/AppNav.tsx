"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppNav.module.css";

/* شش مقصد اپ. روی دسکتاپ ستونِ کناری راست، روی باریک‌تر
   نوار پایین — همان لندینگ، فقط جای دیگر. */

const items = [
  { href: "/App", label: "امروز", icon: "home" },
  { href: "/App/practice", label: "تمرین", icon: "practice" },
  { href: "/App/grammar", label: "گرامر", icon: "grammar" },
  { href: "/App/tools", label: "ابزارها", icon: "tools" },
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
  if (name === "practice") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8.4" />
        <circle cx="12" cy="12" r="4.4" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
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
  if (name === "grammar") {
    return (
      <svg {...common}>
        <path d="M12 6.6C10.2 5.2 7.8 4.6 5 4.6v13c2.8 0 5.2.6 7 2" />
        <path d="M12 6.6c1.8-1.4 4.2-2 7-2v13c-2.8 0-5.2.6-7 2" />
        <path d="M12 6.6v13" />
      </svg>
    );
  }
  if (name === "tools") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
        <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
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
