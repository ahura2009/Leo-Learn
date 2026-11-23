"use client";

import { useEffect, useState } from "react";
import type { Line } from "../../../lib/types";
import { SpeakButton } from "../../../components/SpeakButton";
import { speak } from "../../../lib/tts";
import styles from "./lessonSteps.module.css";

export function ListenStep({
  lines,
  onDone,
}: {
  lines: Line[];
  onDone: () => void;
}) {
  const [revealed, setRevealed] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  /* خطوط یکی‌یکی با تأخیر ۶۰۰ms */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = reduce ? 0 : 600;

    if (revealed >= lines.length) return;

    const timer = window.setTimeout(
      () => setRevealed((count) => count + 1),
      revealed === 0 ? 0 : delay,
    );
    return () => window.clearTimeout(timer);
  }, [revealed, lines.length]);

  const finished = revealed >= lines.length;

  return (
    <div className={styles.step}>
      <p className={styles.kicker}>۱ · گوش کن</p>
      <h2 className={styles.title}>در کافه چه می‌گذرد؟</h2>
      <p className={styles.hint}>
        روی هر خط بزن تا معنی‌اش باز شود. با «پخش»، کل دیالوگ را می‌شنوی.
      </p>

      <div className={styles.dialog}>
        {lines.slice(0, revealed).map((line, index) => (
          <button
            key={`${line.en}-${index}`}
            type="button"
            className={`${styles.bubbleRow} ${
              line.who === "you" ? styles.mine : styles.leo
            }`}
            onClick={() => setOpen(open === index ? null : index)}
            aria-expanded={open === index}
          >
            <span className={styles.bubble}>
              <span className={styles.bubbleEn} dir="ltr">
                {line.en}
              </span>
              {open === index ? (
                <span className={styles.bubbleFa}>{line.fa}</span>
              ) : null}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={() =>
            lines.forEach((line, index) =>
              window.setTimeout(() => speak(line.en), index * 1400),
            )
          }
        >
          پخش دیالوگ
        </button>

        <button
          type="button"
          className={styles.primary}
          disabled={!finished}
          onClick={onDone}
        >
          ادامه
        </button>
      </div>
    </div>
  );
}
