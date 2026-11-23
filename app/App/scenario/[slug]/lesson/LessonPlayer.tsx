"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireProfile } from "../../../hooks/useRequireProfile";
import { useApp } from "../../../components/AppProvider";
import { StepDots } from "../../../components/StepDots";
import { ListenStep } from "./ListenStep";
import { ChooseStep } from "./ChooseStep";
import { BuildStep } from "./BuildStep";
import { RoleplayStep } from "./RoleplayStep";
import { ResultStep } from "./ResultStep";
import type { Scenario, ScenarioProgress } from "../../../lib/types";
import styles from "./lesson.module.css";

const stepLabels = ["گوش کن", "انتخاب کن", "بساز", "گفت‌وگو", "نتیجه"];

export function LessonPlayer({ scenario }: { scenario: Scenario }) {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={styles.loading}>در حال آماده‌سازی…</div>;
  }

  /* کلید روی stepIndex ذخیره‌شده: بازیکن یک بار با همان مقدار ساخته می‌شود */
  return (
    <LessonRunner
      scenario={scenario}
      saved={progress.scenarios[scenario.slug]}
    />
  );
}

function LessonRunner({
  scenario,
  saved,
}: {
  scenario: Scenario;
  saved: ScenarioProgress | undefined;
}) {
  const { patchScenario, completeScenario } = useApp();
  const totalSteps = scenario.steps.length + 1; // + نتیجه

  const [stepIndex, setStepIndex] = useState(() =>
    Math.min(
      saved && !saved.completedAt ? saved.stepIndex : 0,
      totalSteps - 1,
    ),
  );

  /* ثبت شروع سناریو — نوشتن در store بیرونی، نه setState */
  useEffect(() => {
    if (saved) return;
    patchScenario(scenario.slug, (current) => current);
  }, [saved, patchScenario, scenario.slug]);

  /* رسیدن به نتیجه = تمام‌شدن درس؛ واژه‌ها همین‌جا ثبت می‌شوند */
  useEffect(() => {
    if (stepIndex !== totalSteps - 1) return;
    completeScenario(scenario.slug, scenario.words);
  }, [stepIndex, totalSteps, completeScenario, scenario.slug, scenario.words]);

  const goTo = (index: number) => {
    const next = Math.min(index, totalSteps - 1);
    setStepIndex(next);
    patchScenario(scenario.slug, (current) => ({ ...current, stepIndex: next }));
  };

  const restart = () => {
    patchScenario(scenario.slug, (current) => ({
      ...current,
      stepIndex: 0,
      completedAt: undefined,
    }));
    setStepIndex(0);
  };

  const step = scenario.steps[stepIndex];

  let body: React.ReactNode;
  if (!step) {
    body = <ResultStep scenario={scenario} onRestart={restart} />;
  } else if (step.type === "listen") {
    body = (
      <ListenStep
        key={stepIndex}
        lines={step.lines}
        onDone={() => goTo(stepIndex + 1)}
      />
    );
  } else if (step.type === "choose") {
    body = (
      <ChooseStep
        key={stepIndex}
        step={step}
        onDone={() => goTo(stepIndex + 1)}
      />
    );
  } else if (step.type === "build") {
    body = (
      <BuildStep
        key={stepIndex}
        step={step}
        onDone={() => goTo(stepIndex + 1)}
      />
    );
  } else {
    body = (
      <RoleplayStep
        key={stepIndex}
        turns={step.turns}
        saved={saved?.turns ?? []}
        onTurnDone={(turnIndex) => {
          patchScenario(scenario.slug, (current) => {
            const turns = [...current.turns];
            turns[turnIndex] = { turnIndex, attempts: 1, done: true };
            return { ...current, turns };
          });
        }}
        onDone={() => goTo(stepIndex + 1)}
      />
    );
  }

  return (
    <div className={styles.screen}>
      <header className={styles.top}>
        <Link
          href={`/App/scenario/${scenario.slug}`}
          className={styles.exit}
          aria-label="خروج از درس"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        <StepDots total={totalSteps} current={stepIndex} />

        <span className={styles.counter}>
          {stepLabels[stepIndex]} · {stepIndex + 1}/{totalSteps}
        </span>
      </header>

      <div className={styles.card}>{body}</div>
    </div>
  );
}
