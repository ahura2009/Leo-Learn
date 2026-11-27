"use client";

import Link from "next/link";
import { useState } from "react";
import { useApp } from "../../components/AppProvider";
import { SpeakButton } from "../../components/SpeakButton";
import {
  dueWords,
  gradeWord,
  REVIEW_LIMIT,
  reviewDueDate,
  reviewQueue,
  STARTER_PACK,
} from "../../lib/tools";
import styles from "./tools-ui.module.css";

/* فلش‌کارت — واژه‌های دفتر کاربر با فاصله‌های رو به افزایش.
   «بلدم» یک پله جلو می‌برد، «دوباره» واژه را به آخر همین جلسه می‌فرستد. */
export function Flashcards() {
  const { progress, updateProgress } = useApp();

  const [queue, setQueue] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ remembered: 0, again: 0 });

  const allWords = Object.keys(progress.words);
  const due = dueWords(progress.words);
  const total = allWords.length;

  const start = (words: string[]) => {
    setQueue(words);
    setIndex(0);
    setRevealed(false);
    setScore({ remembered: 0, again: 0 });
  };

  const addStarterPack = () => {
    const now = new Date().toISOString();

    updateProgress((current) => {
      const words = { ...current.words };
      for (const entry of STARTER_PACK) {
        if (!words[entry.en]) {
          words[entry.en] = { fa: entry.fa, seen: 0, lastSeenAt: now };
        }
      }
      return { ...current, words };
    });

    start(STARTER_PACK.map((entry) => entry.en));
  };

  /* ---------- دفتر خالی ---------- */
  if (total === 0) {
    return (
      <div className={styles.tool}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>دفتر واژه‌هایت خالی است.</p>
          <p className={styles.subHint}>
            با تمام‌کردن یک درس، واژه‌هایش خودکار اینجا می‌آیند. می‌توانی از
            دیکشنری هم اضافه کنی یا با یک بستهٔ آماده شروع کنی.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={addStarterPack}
            >
              {STARTER_PACK.length.toLocaleString("fa-IR")} واژهٔ پرکاربرد را اضافه کن
            </button>
            <Link href="/App/tools/dictionary" className={styles.secondary}>
              رفتن به دیکشنری
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- جلسهٔ مرور ---------- */
  if (queue) {
    if (index >= queue.length) {
      return (
        <div className={styles.tool}>
          <div className={styles.doneCard}>
            <span className={styles.doneBadge}>مرور تمام شد</span>
            <p className={styles.doneScore}>
              {score.remembered.toLocaleString("fa-IR")}
            </p>
            <p className={styles.doneText}>
              واژه را بلد بودی
              {score.again > 0
                ? `؛ ${score.again.toLocaleString("fa-IR")} بار هم دوباره دیدی.`
                : "."}
            </p>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.primary}
                onClick={() => start(queue)}
              >
                مرور دوباره
              </button>
              <button
                type="button"
                className={styles.secondary}
                onClick={() => setQueue(null)}
              >
                برگشت
              </button>
            </div>

            <p className={styles.subHint}>
              این واژه‌ها بر اساس پاسخ‌هایت زمان‌بندی شدند؛ سر وقتشان دوباره
              همین‌جا می‌آیند.
            </p>
          </div>
        </div>
      );
    }

    const current = queue[index];
    const entry = progress.words[current];
    const progressRatio = Math.round((index / queue.length) * 100);

    const rate = (remembered: boolean) => {
      const now = new Date();

      updateProgress((state) => ({
        ...state,
        words: {
          ...state.words,
          [current]: gradeWord(
            state.words[current] ?? {
              fa: entry?.fa ?? "",
              seen: 0,
              lastSeenAt: now.toISOString(),
            },
            remembered,
            now,
          ),
        },
      }));

      setQueue((previous) =>
        previous && !remembered ? [...previous, current] : previous,
      );
      setScore((previous) =>
        remembered
          ? { ...previous, remembered: previous.remembered + 1 }
          : { ...previous, again: previous.again + 1 },
      );
      setIndex((previous) => previous + 1);
      setRevealed(false);
    };

    return (
      <div className={styles.tool}>
        <div className={styles.sessionTop}>
          <span className={styles.sessionCount}>
            {Math.min(index + 1, queue.length).toLocaleString("fa-IR")} از{" "}
            {queue.length.toLocaleString("fa-IR")}
          </span>
          <div className={styles.bar} aria-hidden="true">
            <span
              className={styles.barFill}
              style={{ width: `${progressRatio}%` }}
            />
          </div>
        </div>

        <div key={`${current}-${index}`} className={styles.flashCard}>
          <span className={styles.flashHint}>این واژه را می‌شناسی؟</span>
          <p className={styles.flashEn} dir="ltr">
            {current}
          </p>

          {revealed ? (
            <p className={styles.flashFa}>{entry?.fa ?? "معنی ثبت نشده"}</p>
          ) : (
            <p className={styles.flashPlaceholder}>اول خودت به یادش بیاور…</p>
          )}

          <SpeakButton text={current} label="شنیدن" />
        </div>

        {revealed ? (
          <div className={styles.rateRow}>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => rate(false)}
            >
              دوباره ببینم
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={() => rate(true)}
            >
              بلدم
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`${styles.primary} ${styles.block}`}
            onClick={() => setRevealed(true)}
          >
            نمایش معنی
          </button>
        )}
      </div>
    );
  }

  /* ---------- شروع ---------- */
  const nearestMs = Object.values(progress.words).reduce(
    (min, item) => Math.min(min, reviewDueDate(item).getTime()),
    Number.POSITIVE_INFINITY,
  );
  const nearestLabel = Number.isFinite(nearestMs)
    ? new Date(nearestMs).toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <div className={styles.tool}>
      <div className={styles.metrics}>
        <div className={styles.metric}>
          <span className={styles.metricValue}>
            {total.toLocaleString("fa-IR")}
          </span>
          <span className={styles.metricLabel}>واژه در دفتر</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricValue}>
            {due.length.toLocaleString("fa-IR")}
          </span>
          <span className={styles.metricLabel}>آمادهٔ مرور</span>
        </div>
      </div>

      {due.length > 0 ? (
        <>
          <p className={styles.subHint}>
            جلسهٔ کوتاه: حداکثر {REVIEW_LIMIT.toLocaleString("fa-IR")} واژه.
            هر بار که «بلدم» بزنی، فاصلهٔ مرور بعدی بیشتر می‌شود.
          </p>
          <button
            type="button"
            className={`${styles.primary} ${styles.block}`}
            onClick={() => start(reviewQueue(progress.words))}
          >
            شروع مرور
          </button>
        </>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>برای امروز مروری نمانده.</p>
          <p className={styles.subHint}>
            {nearestLabel
              ? `مرور بعدی: ${nearestLabel}.`
              : "همهٔ واژه‌ها زمان‌بندی شده‌اند."}{" "}
            اگر دوست داری می‌توانی همه را یک بار دیگر ببینی.
          </p>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() =>
                start(Object.keys(progress.words).slice(0, REVIEW_LIMIT))
              }
            >
              مرور همین حالا
            </button>
            <Link href="/App/tools/dictionary" className={styles.secondary}>
              افزودن واژه
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
