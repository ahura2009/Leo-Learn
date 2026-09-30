import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";

type BottomNavigationItem = {
  label: "Home" | "Learn" | "Leo" | "Progress" | "Profile";
  href: string;
  icon: ReactNode;
};

const navigationItems: BottomNavigationItem[] = [
  {
    label: "Home",
    href: "/home",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M4 10.75 12 4l8 6.75V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.25Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Learn",
    href: "/learn",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5v-17Zm2.5-.5A.5.5 0 0 0 7 4.5v12.55c.16-.03.33-.05.5-.05H18V4H7.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Leo",
    href: "/leo",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6">
        <path
          d="M12 3a7 7 0 0 0-7 7v3.5A4.5 4.5 0 0 0 9.5 18H10l1.22 2.44a.87.87 0 0 0 1.56 0L14 18h.5a4.5 4.5 0 0 0 4.5-4.5V10a7 7 0 0 0-7-7Zm-2.75 7.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm5.5 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Zm-5.42 3.1a.75.75 0 0 1 1.04-.2c.47.32 1.02.48 1.63.48s1.16-.16 1.63-.48a.75.75 0 1 1 .84 1.24 4.33 4.33 0 0 1-4.94 0 .75.75 0 0 1-.2-1.04Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Progress",
    href: "/progress",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M5 20a1 1 0 0 1-1-1v-7h4v8H5Zm5 0V4h4v16h-4Zm6 0V8h4v11a1 1 0 0 1-1 1h-3Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    label: "Profile",
    href: "/profile",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
        <path
          d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

type BottomNavigationProps = {
  activeItem?: BottomNavigationItem["label"];
  className?: string;
};

export function BottomNavigation({
  activeItem = "Home",
  className = "",
}: BottomNavigationProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-white)] px-[var(--space-3)] pb-[max(var(--space-3),env(safe-area-inset-bottom))] pt-[var(--space-2)] ${className}`}
    >
      <Card
        variant="standard"
        className="mx-auto max-w-[390px] rounded-[var(--radius-lg)] p-[var(--space-2)] shadow-lg shadow-[#001a4d]/5"
      >
        <ul className="grid grid-cols-5 items-end gap-1">
        {navigationItems.map((item) => {
          const isActive = item.label === activeItem;
          const isLeo = item.label === "Leo";

          return (
            <li key={item.label} className="flex justify-center">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex min-h-[52px] min-w-[52px] flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-2 transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)] ${
                  isLeo
                    ? "-mt-7 h-16 w-16 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] text-[var(--color-white)] shadow-lg shadow-[#00256f]/20 hover:bg-[var(--color-dark-navy)] active:bg-[var(--color-dark-navy)]"
                    : isActive
                      ? "bg-[var(--color-navy-tint)] text-[var(--color-primary-navy)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-navy-tint)] hover:text-[var(--color-primary-navy)] active:bg-[#e2eaff]"
                }`}
              >
                {item.icon}
                <Typography
                  variant="label"
                  as="span"
                  className={isLeo ? "text-[10px] leading-none text-[var(--color-white)]" : "text-current"}
                >
                  {item.label}
                </Typography>
              </Link>
            </li>
          );
        })}
        </ul>
      </Card>
    </nav>
  );
}

export type { BottomNavigationItem, BottomNavigationProps };
