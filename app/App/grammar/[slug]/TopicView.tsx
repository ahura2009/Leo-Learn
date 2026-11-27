"use client";

import Link from "next/link";
import { useRequireProfile } from "../../hooks/useRequireProfile";
import { groupLabel, type GrammarTopic } from "../../lib/grammar";
import { levelLabel } from "../../lib/types";
import ui from "../../components/Ui.module.css";
import styles from "./topic.module.css";

/* بدنهٔ صفحهٔ موضوع — سمت کلاینت، چون دروازهٔ پروفایل همین‌جاست.
   متن درس هنوز نوشته نشده؛ هیچ کارت آموزشی جعلی‌ای ساخته نمی‌شود. */

const steps = [
  {
    title: "کارت را می‌بینی",
    body: "یک جملهٔ کوتاه با جای خالی یا یک سؤال. قاعده از قبل خوانده شده.",
  },
  {
    title: "قبل از دیدن جواب، خودت می‌گویی",
    body: "یادآوری فعال؛ همین سختیِ کوچک است که قاعده را نگه می‌دارد.",
  },
  {
    title: "زمان مرور بعدی تعیین می‌شود",
    body: "درست جواب دادی، دیرتر برمی‌گردد. اشتباه کردی، فردا دوباره.",
  },
];

export function TopicView({ topic }: { topic: GrammarTopic }) {
  const { ready, profile } = useRequireProfile();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.page}>
      <Link href="/App/grammar" className={styles.back}>
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
          <path d="M9 18l6-6-6-6" />
        </svg>
        همهٔ موضوع‌ها
      </Link>

      <header className={styles.head}>
        <div className={styles.titleRow}>
          <h1 className={styles.title} dir="ltr">
            {topic.name}
          </h1>
          <span className={styles.levelChip}>{topic.level}</span>
        </div>
        <p className={styles.subtitle}>
          {topic.fa} · {levelLabel[topic.level]} · {groupLabel[topic.group]}
        </p>
        <p className={styles.summary}>{topic.summary}</p>
      </header>

      <section className={styles.sample} aria-labelledby="sample">
        <span id="sample" className={styles.sampleTag}>
          نمونهٔ کاربرد
        </span>
        <p className={styles.sampleEn} dir="ltr">
          {topic.preview.en}
        </p>
        <p className={styles.sampleFa}>{topic.preview.fa}</p>
      </section>

      <section className={styles.method} aria-labelledby="method">
        <h2 id="method" className={styles.methodTitle}>
          چطور مرور می‌شود
        </h2>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNo}>{index + 1}</span>
              <div className={styles.stepBody}>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepText}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.pending} aria-labelledby="pending">
        <h2 id="pending" className={styles.pendingTitle}>
          درس این موضوع هنوز نوشته نشده
        </h2>
        <p className={styles.pendingText}>
          برای {topic.fa} حدود {topic.cards} کارت در نظر گرفته شده. به‌محض
          آماده شدن، از همین صفحه قابل شروع است.
        </p>
        <button type="button" className={ui.button} disabled>
          شروع مرور
        </button>
      </section>
    </div>
  );
}
