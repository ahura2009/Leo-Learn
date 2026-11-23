"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import {
  categoryLabel,
  getScenario,
  scenarioMeta,
  type Category,
  type ScenarioMeta,
} from "../lib/scenarios";
import { levelLabel, type Level } from "../lib/types";
import { assetPath } from "@/lib/asset-path";
import ui from "../components/Ui.module.css";
import styles from "./path.module.css";

const categories: Category[] = ["daily", "travel", "work"];
const levels: Level[] = ["A1", "A2", "B1"];

type Status = "todo" | "active" | "done" | "soon";

function statusOf(item: ScenarioMeta, saved?: { completedAt?: string }): Status {
  if (saved?.completedAt) return "done";
  if (saved) return "active";
  return item.available ? "todo" : "soon";
}

const statusLabel: Record<Status, string> = {
  todo: "شروع‌نشده",
  active: "در حال انجام",
  done: "تکمیل‌شده",
  soon: "به‌زودی",
};

export default function PathPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");

  /* درس نیمه‌کاره — بالای صفحه، یک‌کلیک تا ادامه */
  const activeLesson = useMemo(() => {
    return scenarioMeta.find(
      (item) =>
        progress.scenarios[item.slug] &&
        !progress.scenarios[item.slug].completedAt,
    );
  }, [progress]);

  /* پیشنهاد: اول درس نیمه‌کاره، بعد اولین سناریوی آمادهٔ شروع‌نشده */
  const suggestedSlug = useMemo(() => {
    if (activeLesson) return activeLesson.slug;
    const fresh = scenarioMeta.find(
      (item) => item.available && !progress.scenarios[item.slug],
    );
    return fresh?.slug ?? scenarioMeta[0]?.slug;
  }, [activeLesson, progress]);

  const filtered = useMemo(() => {
    const text = query.trim();
    return scenarioMeta.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (level !== "all" && item.level !== level) return false;
      if (!text) return true;
      return item.title.includes(text) || item.summary.includes(text);
    });
  }, [query, category, level]);

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const activeSaved = activeLesson ? progress.scenarios[activeLesson.slug] : null;
  const activeScenario = activeLesson ? getScenario(activeLesson.slug) : null;
  const activeTotal = activeScenario ? activeScenario.steps.length + 1 : 5;
  const activeStep = activeSaved
    ? Math.min(activeSaved.stepIndex + 1, activeTotal - 1)
    : 0;
  const doneCount = Object.values(progress.scenarios).filter(
    (item) => item.completedAt,
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div>
          <span className={ui.eyebrow}>دروس</span>
          <h1 className={styles.title}>کدام موقعیت را تمرین کنیم؟</h1>
        </div>
        <span className={styles.count}>
          {doneCount} از {scenarioMeta.length} تمام‌شده
        </span>
      </header>

      {activeLesson ? (
        <Link
          href={`/App/scenario/${activeLesson.slug}/lesson`}
          className={styles.resume}
        >
          <span className={styles.resumeText}>
            <span className={styles.resumeKicker}>ادامهٔ آخرین درس</span>
            <span className={styles.resumeTitle}>{activeLesson.title}</span>
            <span className={styles.resumeMeta}>
              مرحلهٔ {activeStep} از {activeTotal - 1}
            </span>
          </span>
          <span className={styles.resumeCta}>
            ادامه
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
        </Link>
      ) : null}

      {/* ---------- جست‌وجو و فیلتر ---------- */}
      <div className={styles.controls}>
        <label className={styles.search}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.2-3.2" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="جست‌وجوی سناریو…"
            aria-label="جست‌وجوی سناریو"
          />
        </label>

        <label className={styles.levelSelect}>
          <span className={styles.srOnly}>سطح</span>
          <select
            value={level}
            onChange={(event) =>
              setLevel(event.target.value as Level | "all")
            }
          >
            <option value="all">همهٔ سطوح</option>
            {levels.map((item) => (
              <option key={item} value={item}>
                {item} · {levelLabel[item]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className={styles.chips} role="group" aria-label="دسته‌بندی">
        <button
          type="button"
          className={`${styles.chip} ${category === "all" ? styles.chipActive : ""}`}
          onClick={() => setCategory("all")}
          aria-pressed={category === "all"}
        >
          همه
        </button>
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            className={`${styles.chip} ${category === item ? styles.chipActive : ""}`}
            onClick={() => setCategory(item)}
            aria-pressed={category === item}
          >
            {categoryLabel[item]}
          </button>
        ))}
      </div>

      {/* ---------- فهرست، گروه‌بندی‌شده ---------- */}
      {filtered.length === 0 ? (
        <div className={ui.empty}>
          <p>چیزی با این فیلتر پیدا نشد.</p>
          <button
            type="button"
            className={ui.ghost}
            onClick={() => {
              setQuery("");
              setCategory("all");
              setLevel("all");
            }}
          >
            پاک کردن فیلترها
          </button>
        </div>
      ) : (
        categories.map((group) => {
          const items = filtered.filter((item) => item.category === group);
          if (items.length === 0) return null;

          return (
            <section key={group} className={styles.group}>
              <h2 className={styles.groupTitle}>
                {categoryLabel[group]}
                <span className={styles.groupCount}>{items.length}</span>
              </h2>

              <ul className={styles.list}>
                {items.map((item) => {
                  const saved = progress.scenarios[item.slug];
                  const status = statusOf(item, saved);
                  const scenario = getScenario(item.slug);
                  const total = scenario ? scenario.steps.length + 1 : 5;
                  const percent = saved?.completedAt
                    ? 100
                    : saved
                      ? Math.round((saved.stepIndex / (total - 1)) * 100)
                      : 0;
                  const isSuggested = item.slug === suggestedSlug;

                  const inner = (
                    <>
                      <div className={styles.thumb}>
                        {item.photo ? (
                          <Image
                            src={assetPath(item.photo)}
                            alt=""
                            width={120}
                            height={120}
                            sizes="72px"
                            className={styles.thumbImage}
                          />
                        ) : (
                          <span className={styles.thumbFallback}>
                            {item.level}
                          </span>
                        )}
                      </div>

                      <div className={styles.body}>
                        <div className={styles.titleRow}>
                          <p className={styles.name}>{item.title}</p>
                          {isSuggested && item.available ? (
                            <span className={styles.suggested}>پیشنهادی</span>
                          ) : null}
                        </div>

                        <p className={styles.summary}>{item.summary}</p>

                        <div className={styles.metaRow}>
                          <span className={styles.levelChip}>{item.level}</span>
                          <span className={styles.dot} aria-hidden="true" />
                          <span>{item.minutes} دقیقه</span>
                          <span className={styles.dot} aria-hidden="true" />
                          <span className={`${styles.status} ${styles[status]}`}>
                            {statusLabel[status]}
                          </span>
                        </div>

                        {status === "active" ? (
                          <div className={styles.bar} aria-hidden="true">
                            <span
                              className={styles.barFill}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        ) : null}
                      </div>

                      {item.available ? (
                        <span className={styles.chevron} aria-hidden="true">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M15 18l-6-6 6-6" />
                          </svg>
                        </span>
                      ) : null}
                    </>
                  );

                  return (
                    <li key={item.slug}>
                      {item.available ? (
                        <Link
                          href={`/App/scenario/${item.slug}`}
                          className={`${styles.row} ${
                            isSuggested ? styles.rowSuggested : ""
                          }`}
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className={`${styles.row} ${styles.locked}`}>
                          {inner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
