"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useApp } from "../../components/AppProvider";
import { analyzeText, readingTimeLabel, SAMPLE_TEXT } from "../../lib/tools";
import { levelLabel } from "../../lib/types";
import styles from "./tools-ui.module.css";

/* بررسی متن — همه‌چیز در مرورگر و در همان لحظهٔ تایپ.
   سطح، تخمینی از نمرهٔ خوانایی فلش است؛ نه آزمون سطح. */
export function TextCheck() {
  const { progress } = useApp();
  const [text, setText] = useState("");

  const analysis = useMemo(() => analyzeText(text), [text]);
  const ready = analysis.words > 0;

  return (
    <div className={styles.tool}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="text-check-input">
          متن انگلیسی
        </label>
        <textarea
          id="text-check-input"
          dir="ltr"
          className={styles.textarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste or type your English text here…"
          rows={8}
          spellCheck
        />
      </div>

      <div className={styles.rowBetween}>
        <div className={styles.row}>
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => setText(SAMPLE_TEXT)}
          >
            یک نمونه
          </button>
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => setText("")}
            disabled={!text}
          >
            پاک کردن
          </button>
        </div>
        <span className={styles.counter}>
          {text.length.toLocaleString("fa-IR")} نویسه
        </span>
      </div>

      {!ready ? (
        <p className={styles.hint}>
          با تایپ اولین واژه، تحلیل همین پایین ساخته می‌شود.
        </p>
      ) : (
        <>
          <div className={styles.metrics}>
            <Metric label="واژه" value={analysis.words.toLocaleString("fa-IR")} />
            <Metric
              label="جمله"
              value={analysis.sentences.toLocaleString("fa-IR")}
            />
            <Metric
              label="واژهٔ یکتا"
              value={analysis.uniqueWords.toLocaleString("fa-IR")}
            />
            <Metric
              label="زمان خواندن"
              value={readingTimeLabel(analysis.readingSeconds)}
            />
          </div>

          <div className={styles.levelCard}>
            <div className={styles.levelTop}>
              <span className={styles.levelBadge}>{analysis.level}</span>
              <div className={styles.levelText}>
                <p className={styles.levelName}>
                  {levelLabel[analysis.level]}
                </p>
                <p className={styles.levelHint}>سطح تقریبی متن</p>
              </div>
              <span className={styles.score}>
                {analysis.flesch.toLocaleString("fa-IR")}
                <small>/۱۰۰</small>
              </span>
            </div>

            <div className={styles.bar} aria-hidden="true">
              <span
                className={styles.barFill}
                style={{ width: `${analysis.flesch}%` }}
              />
            </div>

            <p className={styles.levelNote}>
              نمرهٔ خوانایی فلش از طول جمله‌ها و هجاهای هر واژه ساخته می‌شود؛
              بالاتر یعنی متن ساده‌تر. میانگین جمله‌هایت{" "}
              {analysis.wordsPerSentence.toLocaleString("fa-IR")} واژه است.
            </p>
          </div>

          {analysis.longWords.length > 0 ? (
            <section className={styles.sub}>
              <h2 className={styles.subTitle}>واژه‌های بلند متن</h2>
              <p className={styles.subHint}>
                واژه‌های هشت حرفی و بیشتر، پرتکرارترها اول. هر کدام را باز کن
                تا در دیکشنری دنبالش بگردی.
              </p>
              <ul className={styles.chips}>
                {analysis.longWords.map(({ word, count }) => {
                  const known =
                    progress.words[word] ?? progress.words[word.toLowerCase()];

                  return (
                    <li key={word}>
                      <Link
                        href={`/App/tools/dictionary?q=${encodeURIComponent(word)}`}
                        className={`${styles.chip} ${
                          known ? styles.chipKnown : ""
                        }`}
                      >
                        <span className={styles.chipEn} dir="ltr">
                          {word}
                        </span>
                        {count > 1 ? (
                          <span className={styles.chipCount}>×{count}</span>
                        ) : null}
                        {known ? (
                          <span className={styles.chipTag}>در دفتر تو</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}
