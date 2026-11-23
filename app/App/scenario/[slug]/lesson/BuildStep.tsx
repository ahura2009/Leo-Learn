"use client";

import { useMemo, useState } from "react";
import type { Step } from "../../../lib/types";
import styles from "./lessonSteps.module.css";

type BuildData = Extract<Step, { type: "build" }>;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function BuildStep({
  step,
  onDone,
}: {
  step: BuildData;
  onDone: () => void;
}) {
  /* کاشی‌ها با شناسه، چون ممکن است یک کلمه دو بار بیاید */
  const pool = useMemo(
    () => step.tiles.map((text, index) => ({ id: index, text })),
    [step.tiles],
  );
  const [used, setUsed] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);

  const sentence = used.map((id) => pool[id].text).join(" ");
  const isCorrect = normalize(sentence) === normalize(step.answer);
  const canCheck = used.length > 0;

  const add = (id: number) => {
    if (checked) return;
    setUsed((current) => [...current, id]);
  };

  const removeLast = () => {
    if (checked) return;
    setUsed((current) => current.slice(0, -1));
  };

  return (
    <div className={styles.step}>
      <p className={styles.kicker}>۳ · بساز</p>
      <h2 className={styles.title}>{step.promptFa}</h2>

      <div
        className={`${styles.builder} ${checked && !isCorrect ? styles.builderWrong : ""}`}
        dir="ltr"
      >
        {used.length === 0 ? (
          <span className={styles.builderHint}>tap the tiles below</span>
        ) : (
          used.map((id) => (
            <span key={id} className={styles.tileUsed}>
              {pool[id].text}
            </span>
          ))
        )}
      </div>

      <div className={styles.tiles} dir="ltr">
        {pool.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={styles.tile}
            onClick={() => add(tile.id)}
            disabled={used.includes(tile.id) || checked}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {checked && !isCorrect && step.noteFa ? (
        <p className={styles.note}>{step.noteFa}</p>
      ) : null}

      <div className={styles.actions}>
        {!checked ? (
          <>
            <button
              type="button"
              className={styles.secondary}
              onClick={removeLast}
              disabled={used.length === 0}
            >
              برگردان
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={!canCheck}
              onClick={() => setChecked(true)}
            >
              بررسی
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setChecked(false);
                setUsed([]);
              }}
            >
              دوباره
            </button>
            <button
              type="button"
              className={styles.primary}
              disabled={!isCorrect}
              onClick={onDone}
            >
              ادامه
            </button>
          </>
        )}
      </div>
    </div>
  );
}
