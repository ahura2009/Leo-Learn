"use client";

import Link from "next/link";
import { useRequireProfile } from "../hooks/useRequireProfile";
import {
  grammarGroups,
  grammarTopics,
  groupLabel,
  totalCards,
  type GrammarTopic,
} from "../lib/grammar";
import ui from "../components/Ui.module.css";
import styles from "./grammar.module.css";

/* فهرست گرامر — هر موضوع یک کارت است: نام، سطح، یک خط توضیح و یک
   نمونهٔ کاربرد. کارت به صفحهٔ همان موضوع می‌رود. محتوای درس هنوز
   نوشته نشده، پس هیچ وضعیت «تمام‌شده»ای اینجا نمایش داده نمی‌شود. */

function TopicCard({ topic }: { topic: GrammarTopic }) {
  return (
    <li className={styles.item}>
      <Link href={`/App/grammar/${topic.slug}`} className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.names}>
            <span className={styles.name}>{topic.name}</span>
            <span className={styles.nameFa}>{topic.fa}</span>
          </div>
          <span className={styles.levelChip}>{topic.level}</span>
        </div>

        <p className={styles.summary}>{topic.summary}</p>

        <div className={styles.preview}>
          <span className={styles.previewTag}>نمونه</span>
          <p className={styles.previewEn} dir="ltr">
            {topic.preview.en}
          </p>
          <p className={styles.previewFa}>{topic.preview.fa}</p>
        </div>

        <div className={styles.cardFoot}>
          <span className={styles.footMeta}>
            {topic.cards} کارت · مرور فاصله‌دار
          </span>
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
        </div>
      </Link>
    </li>
  );
}

export default function GrammarPage() {
  const { ready, profile } = useRequireProfile();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={ui.eyebrow}>گرامر</span>
        <h1 className={styles.title}>چه قاعده‌ای را مرور کنیم؟</h1>
        <p className={styles.lead}>
          هر موضوع یک دستهٔ کارت کوتاه است. یک بار می‌خوانی، چند بار در
          فاصله‌های رو به افزایش مرور می‌کنی، و قاعده در حافظهٔ بلندمدت می‌نشیند.
        </p>
        <p className={styles.count}>
          {grammarTopics.length} موضوع · حدود {totalCards} کارت
        </p>
      </header>

      {grammarGroups.map((group) => {
        const items = grammarTopics.filter((topic) => topic.group === group);
        if (items.length === 0) return null;

        return (
          <section key={group} className={styles.group} aria-labelledby={group}>
            <h2 id={group} className={styles.groupTitle}>
              {groupLabel[group]}
              <span className={styles.groupCount}>{items.length}</span>
            </h2>
            <ul className={styles.list}>
              {items.map((topic) => (
                <TopicCard key={topic.slug} topic={topic} />
              ))}
            </ul>
          </section>
        );
      })}

      <p className={styles.note}>
        محتوای درس‌ها هنوز نوشته نشده؛ این فهرست ساختار کار را نشان می‌دهد.
      </p>
    </div>
  );
}
