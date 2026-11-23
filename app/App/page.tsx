"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireProfile } from "./hooks/useRequireProfile";
import { useApp } from "./components/AppProvider";
import { currentStreak } from "./lib/storage";
import { getScenario, scenarioMeta } from "./lib/scenarios";
import { assetPath } from "@/lib/asset-path";
import ui from "./components/Ui.module.css";
import styles from "./today.module.css";

export default function TodayPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const scenario = getScenario("cafe-order");
  const saved = progress.scenarios["cafe-order"];
  const totalSteps = scenario ? scenario.steps.length + 1 : 5;
  const doneSteps = saved ? Math.min(saved.stepIndex, totalSteps - 1) : 0;
  const percent = Math.round((doneSteps / (totalSteps - 1)) * 100);
  const streak = currentStreak(progress);
  const finished = Boolean(saved?.completedAt);

  const isNew = !saved;
  const nextMeta = scenarioMeta[1];

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <span className={ui.eyebrow}>امروز</span>
        <h1 className={ui.title}>سلام {profile.name}، آماده‌ای؟</h1>
        <p className={ui.lead}>
          {streak > 0
            ? `${streak} روز پیوسته تمرین کرده‌ای. یک سناریوی کوتاه، همان چیزی است که امروز لازم داری.`
            : "اولین قدم را امروز بردار — یک سناریوی یازده‌دقیقه‌ای کافی است."}
        </p>
      </header>

      <div className={styles.layout}>
        <section className={ui.cardRaised} aria-labelledby="today-card">
          <div className={styles.cardTop}>
            <div>
              <p className={styles.cardKicker}>
                {isNew ? "اولین سناریو" : finished ? "تکمیل‌شده" : "نصفه"}
              </p>
              <h2 id="today-card" className={ui.cardTitle}>
                {scenario?.title ?? "سفارش در کافه"}
              </h2>
              <p className={ui.muted}>
                {scenario?.setting} · {scenario?.minutes} دقیقه · سطح{" "}
                {scenario?.level}
              </p>
            </div>

            <div className={styles.thumb}>
              <Image
                src={assetPath("/images/scenarios/cafe.webp")}
                alt=""
                width={160}
                height={160}
                className={styles.thumbImage}
              />
            </div>
          </div>

          <div className={styles.progressRow}>
            <div className={ui.bar} aria-hidden="true">
              <span
                className={ui.barFill}
                style={{ width: `${finished ? 100 : percent}%` }}
              />
            </div>
            <span className={ui.meta}>
              {finished ? "همهٔ مراحل" : `مرحلهٔ ${doneSteps + 1} از ${totalSteps - 1}`}
            </span>
          </div>

          <div className={styles.actions}>
            <Link
              href="/App/scenario/cafe-order/lesson"
              className={`${ui.button} ${ui.block}`}
            >
              {isNew
                ? "اولین سناریو را شروع کن"
                : finished
                  ? "یک‌بار دیگر تمرین کن"
                  : "ادامه بده"}
            </Link>
            <Link
              href="/App/scenario/cafe-order"
              className={`${ui.ghost} ${ui.block}`}
            >
              پیش‌نمایش سناریو
            </Link>
          </div>
        </section>

        <aside className={ui.stack}>
          <div className={ui.card}>
            <p className={ui.meta}>قدم بعدی</p>
            <p className={styles.nextTitle}>{nextMeta.title}</p>
            <p className={ui.muted}>
              سطح {nextMeta.level} · {nextMeta.minutes} دقیقه
            </p>
            <p className={styles.soon}>به‌زودی</p>
          </div>

          <div className={ui.card}>
            <p className={ui.meta}>امروز</p>
            <div className={styles.stats}>
              <div>
                <span className={styles.statValue}>{streak}</span>
                <span className={ui.meta}>روز پیوسته</span>
              </div>
              <div>
                <span className={styles.statValue}>
                  {Object.keys(progress.scenarios).filter(
                    (slug) => progress.scenarios[slug].completedAt,
                  ).length}
                </span>
                <span className={ui.meta}>سناریوی تمام‌شده</span>
              </div>
              <div>
                <span className={styles.statValue}>
                  {Object.keys(progress.words).length}
                </span>
                <span className={ui.meta}>واژه</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
