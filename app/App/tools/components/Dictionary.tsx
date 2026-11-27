"use client";

import { useMemo, useState } from "react";
import { useApp } from "../../components/AppProvider";
import { SpeakButton } from "../../components/SpeakButton";
import { getScenario, scenarioMeta } from "../../lib/scenarios";
import { glossary, searchGlossary } from "../../lib/tools";
import type { Level } from "../../lib/types";
import styles from "./tools-ui.module.css";

/* دیکشنری — جست‌وجوی دوزبانه در واژه‌نامهٔ اپ، واژه‌های درس‌ها و دفتر
   خود کاربر. واژهٔ تازه را می‌شود با معنی دلخواه به فلش‌کارت‌ها اضافه کرد. */

type Source = "yours" | "lesson" | "glossary";

type Entry = {
  en: string;
  fa: string;
  level?: Level;
  source: Source;
};

const sourceLabel: Record<Source, string> = {
  yours: "دفتر تو",
  lesson: "از درس‌ها",
  glossary: "واژه‌نامه",
};

const MAX_RESULTS = 40;

function normalize(value: string) {
  return value.trim().toLowerCase();
}

/** واژه‌های درس‌هایی که محتوایشان نوشته شده. */
function lessonEntries(): Entry[] {
  const entries: Entry[] = [];

  for (const meta of scenarioMeta) {
    if (!meta.available) continue;
    const scenario = getScenario(meta.slug);
    if (!scenario) continue;

    for (const word of scenario.words) {
      entries.push({
        en: word.en,
        fa: word.fa,
        level: meta.level,
        source: "lesson",
      });
    }
  }

  return entries;
}

export function Dictionary() {
  const { progress, updateProgress } = useApp();

  /* دیکشنری فقط بعد از ورود و در سمت کلاینت سوار می‌شود، پس خواندن
     query از نشانی هنگام ساخت حالت امن است و ناهم‌خوانی hydration ندارد. */
  const [query, setQuery] = useState(() =>
    typeof window === "undefined"
      ? ""
      : (new URLSearchParams(window.location.search).get("q") ?? ""),
  );
  const [customFa, setCustomFa] = useState("");

  const lessons = useMemo(() => lessonEntries(), []);
  const needle = normalize(query);

  const results = useMemo(() => {
    if (!needle) return [];

    const found: Entry[] = [];
    const seen = new Set<string>();
    const push = (entry: Entry) => {
      const key = normalize(entry.en);
      if (seen.has(key)) return;
      seen.add(key);
      found.push(entry);
    };

    /* اول واژه‌های خود کاربر، بعد درس‌ها، بعد واژه‌نامه. */
    for (const [en, value] of Object.entries(progress.words)) {
      if (normalize(en).includes(needle) || normalize(value.fa).includes(needle)) {
        push({ en, fa: value.fa, source: "yours" });
      }
    }

    for (const entry of lessons) {
      if (
        normalize(entry.en).includes(needle) ||
        normalize(entry.fa).includes(needle)
      ) {
        push(entry);
      }
    }

    for (const entry of searchGlossary(query)) {
      push({ en: entry.en, fa: entry.fa, level: entry.level, source: "glossary" });
    }

    return found.slice(0, MAX_RESULTS);
  }, [needle, query, progress.words, lessons]);

  const inBank = (en: string) =>
    Boolean(progress.words[en] ?? progress.words[en.toLowerCase()]);

  const addWord = (en: string, fa: string) => {
    updateProgress((current) => ({
      ...current,
      words: {
        ...current.words,
        [en]: {
          fa,
          seen: 0,
          lastSeenAt: new Date().toISOString(),
        },
      },
    }));
  };

  const submitCustom = (event: React.FormEvent) => {
    event.preventDefault();
    const en = query.trim();
    const fa = customFa.trim();
    if (!en || !fa) return;

    addWord(en, fa);
    setCustomFa("");
  };

  return (
    <div className={styles.tool}>
      <div className={styles.searchWrap}>
        <svg
          className={styles.searchIcon}
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" />
        </svg>

        <input
          type="search"
          dir="auto"
          className={styles.search}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="انگلیسی یا فارسی… مثلاً home یا خانه"
          aria-label="جست‌وجوی واژه"
        />

        {query ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setQuery("")}
            aria-label="پاک کردن جست‌وجو"
          >
            ×
          </button>
        ) : null}
      </div>

      {!needle ? (
        <div className={styles.sub}>
          <h2 className={styles.subTitle}>چند واژه برای شروع</h2>
          <p className={styles.subHint}>
            واژه‌نامه، واژه‌های درس‌ها و واژه‌های دفترت را با هم می‌گردد.
          </p>
          <ul className={styles.chips}>
            {glossary.slice(0, 12).map((entry) => (
              <li key={entry.en}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => setQuery(entry.en)}
                >
                  <span className={styles.chipEn} dir="ltr">
                    {entry.en}
                  </span>
                  <span className={styles.chipFa}>{entry.fa}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>
            «{query.trim()}» در واژه‌نامه پیدا نشد.
          </p>
          <p className={styles.subHint}>
            می‌توانی معنی‌اش را خودت بنویسی تا به فلش‌کارت‌ها اضافه شود.
          </p>

          <form className={styles.addForm} onSubmit={submitCustom}>
            <div className={styles.addHead}>
              <span className={styles.wordEn} dir="ltr">
                {query.trim()}
              </span>
              <SpeakButton text={query.trim()} compact />
            </div>
            <div className={styles.addRow}>
              <input
                className={styles.input}
                value={customFa}
                onChange={(event) => setCustomFa(event.target.value)}
                placeholder="معنی به فارسی"
                aria-label="معنی فارسی"
              />
              <button
                type="submit"
                className={styles.primary}
                disabled={!customFa.trim()}
              >
                افزودن
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <p className={styles.resultCount}>
            {results.length.toLocaleString("fa-IR")} نتیجه
          </p>

          <ul className={styles.wordList}>
            {results.map((entry) => {
              const added = inBank(entry.en);

              return (
                <li key={`${entry.source}-${entry.en}`} className={styles.wordRow}>
                  <div className={styles.wordMain}>
                    <div className={styles.wordHead}>
                      <span className={styles.wordEn} dir="ltr">
                        {entry.en}
                      </span>
                      {entry.level ? (
                        <span className={styles.levelTag}>{entry.level}</span>
                      ) : null}
                      <span className={styles.sourceTag}>
                        {sourceLabel[entry.source]}
                      </span>
                    </div>
                    <p className={styles.wordFa}>{entry.fa}</p>
                  </div>

                  <div className={styles.wordActions}>
                    <SpeakButton text={entry.en} compact />
                    {added ? (
                      <span className={styles.inBank}>در فلش‌کارت‌ها</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.smallButton}
                        onClick={() => addWord(entry.en, entry.fa)}
                      >
                        + فلش‌کارت
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
