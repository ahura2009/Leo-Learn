"use client";

import Link from "next/link";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { SpeakButton } from "../components/SpeakButton";
import { currentStreak } from "../lib/storage";
import { getScenario, getScenarioMeta } from "../lib/scenarios";
import ui from "../components/Ui.module.css";
import styles from "./progress.module.css";

export default function ProgressPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const completed = Object.entries(progress.scenarios).filter(
    ([, value]) => value.completedAt,
  );
  const words = Object.entries(progress.words);
  const streak = currentStreak(progress);

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <span className={ui.eyebrow}>پیشرفت</span>
        <h1 className={ui.title}>آنچه تا حالا ساخته‌ای</h1>
      </header>

      <div className={ui.grid3}>
        <div className={ui.card}>
          <span className={styles.statValue}>{completed.length}</span>
          <p className={ui.meta}>سناریوی تمام‌شده</p>
        </div>
        <div className={ui.card}>
          <span className={styles.statValue}>{words.length}</span>
          <p className={ui.meta}>واژهٔ تمرین‌شده</p>
        </div>
        <div className={ui.card}>
          <span className={styles.statValue}>{streak}</span>
          <p className={ui.meta}>روز پیوسته</p>
        </div>
      </div>

      <section className={ui.stack}>
        <h2 className={ui.cardTitle}>سناریوهای تمام‌شده</h2>
        {completed.length === 0 ? (
          <div className={ui.empty}>
            <p>هنوز هیچ سناریویی کامل نشده.</p>
            <Link href="/App/practice" className={ui.ghost}>
              رفتن به تمرین‌ها
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {completed.map(([slug, value]) => {
              const meta = getScenarioMeta(slug);
              const scenario = getScenario(slug);
              return (
                <li key={slug} className={styles.row}>
                  <div>
                    <p className={styles.name}>
                      {scenario?.title ?? meta?.title ?? slug}
                    </p>
                    <p className={ui.meta}>
                      {meta ? `سطح ${meta.level}` : ""} ·{" "}
                      {new Date(value.completedAt ?? "").toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <Link href={`/App/scenario/${slug}`} className={styles.link}>
                    مرور
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={ui.stack}>
        <h2 className={ui.cardTitle}>واژه‌ها</h2>
        {words.length === 0 ? (
          <div className={ui.empty}>واژه‌ها بعد از تمام‌کردن اولین درس اینجا می‌آیند.</div>
        ) : (
          <ul className={styles.wordList}>
            {words.map(([en, value]) => (
              <li key={en} className={styles.word}>
                <span dir="ltr" className={styles.wordEn}>
                  {en}
                </span>
                <span className={ui.meta}>{value.fa}</span>
                <SpeakButton text={en} compact />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
