"use client";

import Link from "next/link";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { dueWords, glossary, tools, type ToolSlug } from "../lib/tools";
import { ToolIcon } from "./ToolIcon";
import ui from "../components/Ui.module.css";
import styles from "./tools.module.css";

/* فهرست ابزارها — چهار ابزار مستقل، همه روی همین دستگاه.
   هر کارت یک صفحهٔ کامل دارد: /App/tools/<slug> */

export default function ToolsPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const totalWords = Object.keys(progress.words).length;
  const due = dueWords(progress.words).length;

  const metaFor = (slug: ToolSlug): string => {
    if (slug === "cards") {
      if (due > 0) return `${due} واژه آمادهٔ مرور`;
      if (totalWords > 0) return `${totalWords} واژه در دفتر`;
      return "دفترت خالی است";
    }
    if (slug === "dictionary") {
      return `${glossary.length} واژه + دفتر تو`;
    }
    if (slug === "text") {
      return "نمرهٔ خوانایی و سطح تخمینی";
    }
    return "آهسته، طبیعی و تند";
  };

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={ui.eyebrow}>ابزارها</span>
        <h1 className={styles.title}>چهار ابزار برای کار روزمره</h1>
        <p className={styles.lead}>
          متن انگلیسی‌ات را بسنج، واژه‌ای را معنی کن، واژه‌های دفترت را مرور
          کن یا تلفظشان را بشنو. هیچ‌کدام به اینترنت نیاز ندارند.
        </p>
      </header>

      <p className={styles.note}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
          <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
        </svg>
        متن‌ها و واژه‌هایت از همین دستگاه بیرون نمی‌روند.
      </p>

      <ul className={styles.grid}>
        {tools.map((tool) => (
          <li key={tool.slug} className={styles.item}>
            <Link href={`/App/tools/${tool.slug}`} className={styles.card}>
              <span className={styles.icon}>
                <ToolIcon name={tool.slug} size={22} />
              </span>

              <span className={styles.names}>
                <span className={styles.name}>{tool.name}</span>
                <span className={styles.en} dir="ltr">
                  {tool.en}
                </span>
              </span>

              <span className={styles.summary}>{tool.summary}</span>

              <span className={styles.foot}>
                <span className={styles.meta}>{metaFor(tool.slug)}</span>
                <span className={styles.open}>
                  باز کن
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
