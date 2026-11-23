"use client";

import { useState } from "react";
import type { Step } from "../../../lib/types";
import { SpeakButton } from "../../../components/SpeakButton";
import styles from "./lessonSteps.module.css";

type ChooseData = Extract<Step, { type: "choose" }>;

export function ChooseStep({
  step,
  onDone,
}: {
  step: ChooseData;
  onDone: () => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  const correct = picked !== null && picked === step.answer;

  const pick = (index: number) => {
    if (correct) return;
    setPicked(index);
    if (index === step.answer) setSolved(true);
  };

  return (
    <div className={styles.step}>
      <p className={styles.kicker}>۲ · انتخاب کن</p>
      <h2 className={styles.title}>{step.promptFa}</h2>

      <div className={styles.options}>
        {step.options.map((option, index) => {
          const isPicked = picked === index;
          const isAnswer = index === step.answer;
          const state = solved && isAnswer
            ? styles.optionRight
            : isPicked && !correct
              ? styles.optionWrong
              : "";

          return (
            <button
              key={option}
              type="button"
              className={`${styles.option} ${state}`}
              onClick={() => pick(index)}
              disabled={solved}
            >
              <span dir="ltr" className={styles.optionEn}>
                {option}
              </span>
              <SpeakButton text={option} compact />
            </button>
          );
        })}
      </div>

      {picked !== null && step.noteFa ? (
        <p className={`${styles.note} ${correct ? styles.noteGood : ""}`}>
          {step.noteFa}
        </p>
      ) : null}

      <div className={styles.actions}>
        {picked !== null && !correct ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setPicked(null)}
          >
            دوباره
          </button>
        ) : null}
        <button
          type="button"
          className={styles.primary}
          disabled={!solved}
          onClick={onDone}
        >
          ادامه
        </button>
      </div>
    </div>
  );
}
