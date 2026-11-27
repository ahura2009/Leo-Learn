"use client";

import Link from "next/link";
import { useRequireProfile } from "../../hooks/useRequireProfile";
import type { ToolMeta } from "../../lib/tools";
import { ToolIcon } from "../ToolIcon";
import { TextCheck } from "./TextCheck";
import { Dictionary } from "./Dictionary";
import { Flashcards } from "./Flashcards";
import { Pronunciation } from "./Pronunciation";
import ui from "../../components/Ui.module.css";
import styles from "./tools-ui.module.css";

/* پوستهٔ صفحهٔ هر ابزار: بازگشت به فهرست، عنوان و بدنهٔ همان ابزار. */
export function ToolView({ tool }: { tool: ToolMeta }) {
  const { ready, profile } = useRequireProfile();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.page}>
      <Link href="/App/tools" className={styles.back}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
        ابزارها
      </Link>

      <header className={styles.head}>
        <span className={styles.headIcon}>
          <ToolIcon name={tool.slug} size={22} />
        </span>
        <div className={styles.headText}>
          <h1 className={styles.title}>{tool.name}</h1>
          <p className={styles.lead}>{tool.summary}</p>
        </div>
      </header>

      {tool.slug === "text" ? <TextCheck /> : null}
      {tool.slug === "dictionary" ? <Dictionary /> : null}
      {tool.slug === "cards" ? <Flashcards /> : null}
      {tool.slug === "pronounce" ? <Pronunciation /> : null}
    </div>
  );
}
