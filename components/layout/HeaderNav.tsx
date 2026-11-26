"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";

const navItems = [
  { label: "قابلیت‌ها", href: "#features" },
  { label: "روش آموزشی", href: "#how" },
  { label: "لئو", href: "#leo" },
  { label: "سناریوها", href: "#scenarios" },
  { label: "سؤالات متداول", href: "#faq" },
];

/* برابر scroll-margin-top بخش‌ها در globals.css (ارتفاع هدر + ۲۸px) */
const SCROLL_MARGIN = 104;
/* کمی پایین‌تر از خطِ شروع بخش‌ها؛ اختلاف اعشاریِ اسکرولِ نرم را هم پوشش می‌دهد */
const ACTIVE_LINE = SCROLL_MARGIN + 16;
/* بیشترین زمانی که بعد از کلیک، لینکِ کلیک‌شده فعال می‌ماند */
const CLICK_LOCK_MS = 1500;

export function HeaderNav() {
  const [activeHref, setActiveHref] = useState(navItems[0].href);
  /* هنگام اسکرولِ نرمِ بعد از کلیک، اسکرول‌اسپای را قفل می‌کند تا هایلایت بین بخش‌ها نپرد */
  const pending = useRef<{ href: string; until: number } | null>(null);

  useEffect(() => {
    const sections = navItems.flatMap((item) => {
      const el = document.getElementById(item.href.slice(1));
      return el ? [{ href: item.href, el }] : [];
    });

    if (sections.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      /* تا وقتی مقصدِ کلیک نرسیده، همان لینکِ کلیک‌شده فعال بماند */
      if (pending.current) {
        const target = sections.find((s) => s.href === pending.current?.href);
        const arrived =
          !target || target.el.getBoundingClientRect().top <= ACTIVE_LINE;

        if (arrived || Date.now() > pending.current.until) {
          pending.current = null;
        } else {
          return;
        }
      }

      if (atBottom) {
        setActiveHref(sections[sections.length - 1].href);
        return;
      }

      /* بخشی که تازه از خطِ بالای صفحه رد شده، همان بخشی است که کاربر در آن است.
         بالای هیرو هنوز هیچ بخشی شروع نشده؛ در این حالت اولین تب فعال می‌ماند. */
      let current = sections[0].href;
      for (const { href, el } of sections) {
        if (el.getBoundingClientRect().top <= ACTIVE_LINE) {
          current = href;
        }
      }

      setActiveHref(current);
    };

    const scheduleUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    /* اسکرول دستیِ کاربر قفلِ کلیک را لغو می‌کند */
    const cancelPending = () => {
      pending.current = null;
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("wheel", cancelPending, { passive: true });
    window.addEventListener("touchstart", cancelPending, { passive: true });
    window.addEventListener("keydown", cancelPending);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("wheel", cancelPending);
      window.removeEventListener("touchstart", cancelPending);
      window.removeEventListener("keydown", cancelPending);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav className={styles.nav} aria-label="منوی اصلی">
      {navItems.map((item) => {
        const isActive = item.href === activeHref;

        return (
          <a
            key={item.href}
            href={item.href}
            className={`${styles.navLink} ${
              isActive ? styles.navLinkActive : ""
            }`}
            aria-current={isActive ? "location" : undefined}
            onClick={() => {
              setActiveHref(item.href);
              pending.current = {
                href: item.href,
                until: Date.now() + CLICK_LOCK_MS,
              };
            }}
          >
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
