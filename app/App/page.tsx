"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireProfile } from "./hooks/useRequireProfile";
import { useApp } from "./components/AppProvider";
import {
  dailySuggestion,
  lastLesson,
  resumeTarget,
  todayState,
} from "./lib/dashboard";
import { scenarioMeta } from "./lib/scenarios";
import { levelLabel } from "./lib/types";
import { assetPath } from "@/lib/asset-path";
import ui from "./components/Ui.module.css";
import styles from "./today.module.css";

/* اولویت صفحه: ۱) لئو و حالت امروز ۲) آخرین درس ۳) تمرین پیشنهادی
   ۴) دسترسی سریع. آمار اضافه نمایش داده نمی‌شود. */

export default function TodayPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const lesson = lastLesson(progress);
  const resume = resumeTarget(progress, lesson);
  const suggestion = dailySuggestion(progress, lesson);
  const today = todayState(progress, lesson, profile.name);
  const wordCount = Object.keys(progress.words).length;
  const availableCount = scenarioMeta.filter((item) => item.available).length;
  const lessonHref = `/App/scenario/${lesson.meta.slug}`;

  return (
    <div className={styles.dashboard}>
      {/* ---------- ۱. لئو و امروز ---------- */}
      <section className={styles.greeting} aria-label="سلام لئو">
        <div className={styles.leoRow}>
          <span className={styles.leoAvatar}>
            <Image
              src={assetPath("/images/leo-avatar.webp")}
              alt=""
              width={200}
              height={200}
              className={styles.leoImage}
              priority
            />
          </span>

          <div className={styles.leoBubble}>
            <p className={styles.leoName}>لئو</p>
            <p className={styles.leoText}>{today.leoLine}</p>
          </div>
        </div>

        <div className={styles.dayStrip}>
          <span
            className={`${styles.dayPill} ${today.practiced ? styles.dayDone : ""}`}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {today.practiced ? (
                <path d="m4 12.5 5 5L20 6.5" />
              ) : (
                <>
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 8v4.5l3 1.8" />
                </>
              )}
            </svg>
            {today.practiced ? "امروز تمرین کرده‌ای" : "امروز هنوز شروع نکرده‌ای"}
          </span>

          {today.streak > 0 ? (
            <span className={styles.dayPill}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3s5 4.2 5 9a5 5 0 0 1-10 0c0-1.6.7-2.9 1.5-3.9C9 9.8 10 11 10 12c0-3 2-5.5 2-9z" />
              </svg>
              {today.streak} روز پیوسته
            </span>
          ) : null}
        </div>
      </section>

      {/* ---------- ۲. آخرین درس ---------- */}
      <section className={styles.lessonCard} aria-labelledby="last-lesson">
        <div className={styles.lessonMedia}>
          {lesson.meta.photo ? (
            <Image
              src={assetPath(lesson.meta.photo)}
              alt=""
              width={640}
              height={360}
              sizes="(max-width: 720px) 100vw, 560px"
              className={styles.lessonImage}
              priority
            />
          ) : null}
          <span className={styles.lessonLevel}>
            {levelLabel[lesson.meta.level]}
          </span>
        </div>

        <div className={styles.lessonBody}>
          <p className={styles.kicker}>
            {lesson.finished
              ? "آخرین درس — تمام‌شده"
              : lesson.started
                ? "آخرین درس — نیمه‌کاره"
                : "اولین درس تو"}
          </p>

          <h1 id="last-lesson" className={styles.lessonTitle}>
            {lesson.meta.title}
          </h1>

          <p className={styles.lessonMeta}>
            {lesson.meta.minutes} دقیقه · مرحلهٔ {Math.min(lesson.stepIndex + 1, lesson.totalSteps - 1)} از{" "}
            {lesson.totalSteps - 1} · {lesson.nextStep}
          </p>

          <div className={styles.lessonProgress} aria-hidden="true">
            <span
              className={styles.lessonProgressFill}
              style={{ width: `${Math.round(lesson.progress * 100)}%` }}
            />
          </div>

          <div className={styles.lessonActions}>
            <Link
              href={`${lessonHref}/lesson`}
              className={`${ui.button} ${styles.lessonCta}`}
            >
              {lesson.finished
                ? "دوباره تمرین کن"
                : lesson.started
                  ? "ادامه بده"
                  : "شروع کن"}
            </Link>
            <Link href={lessonHref} className={styles.lessonLink}>
              پیش‌نمایش
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- ۳. تمرین پیشنهادی امروز ---------- */}
      <section className={styles.suggestion} aria-labelledby="suggestion">
        <div className={styles.suggestionHead}>
          <span className={styles.suggestionLabel}>تمرین پیشنهادی امروز</span>
          <span className={styles.suggestionMinutes}>
            {suggestion.minutes} دقیقه
          </span>
        </div>
        <h2 id="suggestion" className={styles.suggestionTitle}>
          {suggestion.title}
        </h2>
        <p className={styles.suggestionBody}>{suggestion.body}</p>
        <Link href={suggestion.href} className={styles.suggestionCta}>
          {suggestion.cta}
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
      </section>

      {/* ---------- ۴. دسترسی سریع ---------- */}
      <section className={styles.quick} aria-labelledby="quick">
        <h2 id="quick" className={styles.quickTitle}>
          دسترسی سریع
        </h2>

        <div className={styles.quickGrid}>
          <Link href="/App/path" className={styles.quickCard}>
            <span className={styles.quickIcon} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 4v9a4 4 0 0 0 4 4h10" />
                <path d="m15 13 4 4-4 4" />
              </svg>
            </span>
            <span className={styles.quickName}>سناریوها</span>
            <span className={styles.quickHint}>
              {availableCount} آماده · {scenarioMeta.length} در مسیر
            </span>
          </Link>

          <Link href="/App/progress" className={styles.quickCard}>
            <span className={styles.quickIcon} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
                <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
              </svg>
            </span>
            <span className={styles.quickName}>مرور لغات</span>
            <span className={styles.quickHint}>
              {wordCount > 0 ? `${wordCount} واژه` : "بعد از اولین درس"}
            </span>
          </Link>

          {resume ? (
            <Link
              href={`/App/scenario/${resume.meta.slug}/lesson`}
              className={`${styles.quickCard} ${styles.quickWide}`}
            >
              <span className={styles.quickIcon} aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className={styles.quickName}>{resume.meta.title}</span>
              <span className={styles.quickHint}>درس نیمه‌کاره — ادامه بده</span>
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  );
}
