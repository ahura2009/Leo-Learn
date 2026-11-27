"use client";

import Link from "next/link";
import type { Scenario } from "../../../lib/types";
import { nextScenario } from "../../../lib/scenarios";
import { PhraseCard } from "../../../components/PhraseCard";
import ui from "../../../components/Ui.module.css";
import styles from "./lessonSteps.module.css";

export function ResultStep({
  scenario,
  onRestart,
}: {
  scenario: Scenario;
  onRestart: () => void;
}) {
  const next = nextScenario(scenario.slug);

  return (
    <div className={styles.step}>
      <p className={styles.kicker}>۵ · نتیجه</p>
      <h2 className={styles.title}>درس را تمام کردی</h2>
      <p className={styles.hint}>
        حالا می‌توانی در کافه سفارش بدهی و قیمت را بپرسی — همان هدفی که از اول
        داشتی.
      </p>

      <section className={styles.resultSection}>
        <h3 className={styles.sectionTitle}>جمله‌هایی که یاد گرفتی</h3>
        <div className={styles.phraseList}>
          {scenario.phras.map((phrase) => (
            <PhraseCard key={phrase.en} phrase={phrase} />
          ))}
        </div>
      </section>

      <section className={styles.resultSection}>
        <h3 className={styles.sectionTitle}>واژه‌ها</h3>
        <ul className={styles.wordList}>
          {scenario.words.map((word) => (
            <li key={word.en} className={styles.word}>
              <span dir="ltr">{word.en}</span>
              <span className={styles.wordFa}>{word.fa}</span>
            </li>
          ))}
        </ul>
      </section>

      {next ? (
        <Link href="/App/practice" className={styles.nextCard}>
          <span className={styles.nextKicker}>سناریوی بعدی</span>
          <span className={styles.nextTitle}>{next.title}</span>
          <span className={styles.nextMeta}>
            سطح {next.level} · {next.minutes} دقیقه ·{" "}
            {next.available ? "آماده" : "به‌زودی"}
          </span>
        </Link>
      ) : null}

      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={onRestart}>
          تمرین دوباره
        </button>
        <Link href="/App" className={`${ui.button} ${styles.primaryLink}`}>
          خانه
        </Link>
      </div>
    </div>
  );
}
