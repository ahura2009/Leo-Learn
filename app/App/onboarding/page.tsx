"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "../components/AppProvider";
import { levelLabel, goalLabel, type Goal, type Level } from "../lib/types";
import ui from "../components/Ui.module.css";
import styles from "./onboarding.module.css";

const levels: { value: Level; title: string; hint: string }[] = [
  { value: "A1", title: "مبتدی", hint: "کم‌وبیش صفر؛ با جمله‌های کوتاه شروع می‌کنم" },
  { value: "A2", title: "پیش‌متوسط", hint: "چیزهایی می‌فهمم ولی در حرف زدن گیر می‌کنم" },
  { value: "B1", title: "متوسط", hint: "می‌توانم گفت‌وگو کنم، دنبال روانی هستم" },
];

const goals: { value: Goal; title: string; hint: string }[] = [
  { value: "travel", title: "سفر", hint: "فرودگاه، هتل، رستوران" },
  { value: "work", title: "کار", hint: "جلسه، ایمیل، مصاحبه" },
  { value: "daily", title: "روزمره", hint: "کافه، خرید، آشنایی" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, profile, saveProfile } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const canContinue =
    (step === 0 && name.trim().length >= 2) ||
    (step === 1 && level !== null) ||
    (step === 2 && goal !== null);

  const finish = (finalGoal: Goal) => {
    const now = new Date().toISOString();
    saveProfile({
      name: name.trim(),
      level: level ?? "A1",
      goal: finalGoal,
      createdAt: profile?.createdAt ?? now,
      onboardedAt: now,
    });
    router.replace("/App");
  };

  const next = () => {
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    if (goal) finish(goal);
  };

  if (!ready) {
    return <div className={styles.shell}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressFill}
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>

        <p className={styles.kicker}>خوش آمدی</p>

        {step === 0 && (
          <section className={styles.stage}>
            <h1 className={styles.title}>اسمت را چه صدا کنیم؟</h1>
            <p className={styles.hint}>
              لئو در طول تمرین با همین اسم صدایت می‌زند. بدون رمز و ایمیل.
            </p>
            <label className={styles.field}>
              <span>نام</span>
              <input
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canContinue) next();
                }}
                placeholder="مثلاً سارا"
                autoFocus
                maxLength={24}
              />
            </label>
          </section>
        )}

        {step === 1 && (
          <section className={styles.stage}>
            <h1 className={styles.title}>الان کجای مسیری؟</h1>
            <p className={styles.hint}>یک انتخاب کافی است؛ بعداً قابل تغییر است.</p>
            <div className={styles.options}>
              {levels.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.option} ${
                    level === item.value ? styles.selected : ""
                  }`}
                  onClick={() => setLevel(item.value)}
                  aria-pressed={level === item.value}
                >
                  <span className={styles.optionTitle}>
                    {item.title}
                    <span className={ui.levelChip}>{levelLabel[item.value]}</span>
                  </span>
                  <span className={styles.optionHint}>{item.hint}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className={styles.stage}>
            <h1 className={styles.title}>برای چه تمرین می‌کنی؟</h1>
            <p className={styles.hint}>سناریوها را براساس همین هدف می‌چینیم.</p>
            <div className={styles.options}>
              {goals.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.option} ${
                    goal === item.value ? styles.selected : ""
                  }`}
                  onClick={() => setGoal(item.value)}
                  aria-pressed={goal === item.value}
                >
                  <span className={styles.optionTitle}>{item.title}</span>
                  <span className={styles.optionHint}>{item.hint}</span>
                </button>
              ))}
            </div>
            <p className={styles.summary}>
              {name.trim()} · {level ? levelLabel[level] : ""} ·{" "}
              {goal ? goalLabel[goal] : ""}
            </p>
          </section>
        )}

        <div className={styles.actions}>
          {step > 0 ? (
            <button
              type="button"
              className={ui.ghost}
              onClick={() => setStep(step - 1)}
            >
              قبلی
            </button>
          ) : null}
          <button
            type="button"
            className={`${ui.button} ${styles.next}`}
            disabled={!canContinue}
            onClick={next}
          >
            {step === 2 ? "شروع کن" : "بعدی"}
          </button>
        </div>
      </div>
    </div>
  );
}
