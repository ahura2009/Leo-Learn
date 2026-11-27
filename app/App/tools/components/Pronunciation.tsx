"use client";

import { useState } from "react";
import { speak, useTtsSupported } from "../../lib/tts";
import { practicePhrases } from "../../lib/tools";
import styles from "./tools-ui.module.css";

/* تلفظ — پخش انگلیسی با موتور صدای مرورگر، در سه سرعت و واژه‌به‌واژه.
   ضبط صدا و مقایسهٔ تلفظ در نسخهٔ بعدی می‌آید. */

const speeds = [
  { rate: 0.6, label: "آهسته" },
  { rate: 0.92, label: "طبیعی" },
  { rate: 1.15, label: "تند" },
];

const DEFAULT_TEXT = "Could you pass me the water, please?";

export function Pronunciation() {
  const supported = useTtsSupported();
  const [text, setText] = useState(DEFAULT_TEXT);
  const [rate, setRate] = useState(0.92);

  const words = text
    .split(/\s+/)
    .map((word) => word.replace(/[^A-Za-z'’-]/g, ""))
    .filter((word) => word.length > 0);

  if (!supported) {
    return (
      <div className={styles.tool}>
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>
            مرورگرت صدای انگلیسی پخش نمی‌کند.
          </p>
          <p className={styles.subHint}>
            این ابزار از موتور صدای خود مرورگر استفاده می‌کند. با کروم، اج یا
            سافاری دوباره امتحان کن.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tool}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="pronounce-input">
          واژه، عبارت یا جمله
        </label>
        <textarea
          id="pronounce-input"
          dir="ltr"
          className={styles.textarea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          spellCheck={false}
        />
      </div>

      <div className={styles.speedRow} role="group" aria-label="سرعت پخش">
        {speeds.map((speed) => (
          <button
            key={speed.rate}
            type="button"
            className={`${styles.speed} ${
              rate === speed.rate ? styles.speedActive : ""
            }`}
            onClick={() => setRate(speed.rate)}
            aria-pressed={rate === speed.rate}
          >
            {speed.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`${styles.primary} ${styles.block}`}
        onClick={() => text.trim() && speak(text.trim(), rate)}
        disabled={!text.trim()}
      >
        <svg
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
          <path d="M11 5 6 9H3v6h3l5 4V5z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
        پخش
      </button>

      {words.length > 0 ? (
        <section className={styles.sub}>
          <h2 className={styles.subTitle}>واژه‌به‌واژه</h2>
          <p className={styles.subHint}>
            روی هر واژه بزن تا تنها همان شنیده شود؛ برای جاهایی که یک واژه
            سخت را نمی‌فهمی.
          </p>
          <ul className={styles.chips}>
            {words.map((word, position) => (
              <li key={`${word}-${position}`}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => speak(word, rate)}
                >
                  <span className={styles.chipEn} dir="ltr">
                    {word}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.sub}>
        <h2 className={styles.subTitle}>جمله‌های تمرینی</h2>
        <p className={styles.subHint}>
          هر جمله یک صدا یا ریتم مشخص را تمرین می‌دهد.
        </p>
        <ul className={styles.phraseList}>
          {practicePhrases.map((phrase) => (
            <li key={phrase.text}>
              <button
                type="button"
                className={styles.phraseButton}
                onClick={() => {
                  setText(phrase.text);
                  speak(phrase.text, rate);
                }}
              >
                <span className={styles.phraseTop}>
                  <span className={styles.phraseEn} dir="ltr">
                    {phrase.text}
                  </span>
                  <span className={styles.levelTag}>{phrase.level}</span>
                </span>
                <span className={styles.phraseFa}>{phrase.fa}</span>
                <span className={styles.phraseFocus}>{phrase.focus}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className={styles.note}>
        صدا از موتور گفتار خود مرورگر می‌آید و به کیفیت صدای نصب‌شده روی
        دستگاهت بستگی دارد. ضبط صدا و مقایسهٔ تلفظ در نسخهٔ بعدی اضافه می‌شود.
      </p>
    </div>
  );
}
