"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRequireAuth } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { AuthBanner } from "../components/auth/AuthBanner";
import { messageFor } from "../lib/auth/types";
import { levelLabel, goalLabel, type Goal, type Level } from "../lib/types";
import ui from "../components/Ui.module.css";
import styles from "./onboarding.module.css";

const levels: { value: Level; title: string; hint: string }[] = [
  { value: "A1", title: "مبتدی", hint: "کم‌وبیش صفر؛ با جمله‌های کوتاه شروع می‌کنم" },
  { value: "A2", title: "پیش‌متوسط", hint: "چیزهایی می‌فهمم ولی در حرف زدن گیر می‌کنم" },
  { value: "B1", title: "متوسط", hint: "می‌توانم گفت‌وگو کنم، دنبال روانی هستم" },
  { value: "B2", title: "متوسط بالا", hint: "راحت حرف می‌زنم، دنبال دقت و اصطلاحاتم" },
  { value: "C1", title: "پیشرفته", hint: "تقریباً روانم؛ می‌خواهم طبیعی‌تر صحبت کنم" },
  { value: "C2", title: "مسلط", hint: "در سطح نزدیک به زبان مادری؛ برای نگه‌داشتن تمرین" },
];

const goals: { value: Goal; title: string; hint: string }[] = [
  { value: "travel", title: "سفر", hint: "فرودگاه، هتل، رستوران" },
  { value: "work", title: "کار", hint: "جلسه، ایمیل، مصاحبه" },
  { value: "daily", title: "روزمره", hint: "کافه، خرید، آشنایی" },
  { value: "study", title: "تحصیل", hint: "کلاس، دانشگاه، مقاله" },
  { value: "immigration", title: "مهاجرت", hint: "اداری، خانه، زندگی روزمره" },
  { value: "exam", title: "آزمون", hint: "آیلتس، تافل و آزمون‌های مشابه" },
  { value: "media", title: "فیلم و پادکست", hint: "سریال بدون زیرنویس، اخبار" },
  { value: "family", title: "خانواده و دوستان", hint: "گفت‌وگوی گرم و صمیمی" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, user } = useRequireAuth();
  const { saveProfile } = useApp();

  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<Level | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* کاربر واردشده و آمادهٔ onboarding نباید دوباره این صفحه را ببیند */
  useEffect(() => {
    if (ready && user?.onboardedAt) router.replace("/App");
  }, [ready, user, router]);

  const canContinue =
    (step === 0 && level !== null) || (step === 1 && goal !== null);

  const finish = async (finalGoal: Goal) => {
    if (!level || saving) return;
    setSaving(true);
    setError(null);

    try {
      await saveProfile({ level, goal: finalGoal });
      router.replace("/App");
    } catch (caught) {
      setError(messageFor(caught));
      setSaving(false);
    }
  };

  const next = () => {
    if (step < 1) {
      setStep(step + 1);
      return;
    }
    if (goal) void finish(goal);
  };

  if (!ready || !user) {
    return <div className={styles.shell}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.shell}>
      <div className={styles.panel}>
        <div className={styles.progress} aria-hidden="true">
          <span
            className={styles.progressFill}
            style={{ width: `${((step + 1) / 2) * 100}%` }}
          />
        </div>

        <p className={styles.kicker}>سلام {user.name ?? "رفیق"}</p>

        {step === 0 && (
          <section className={styles.stage}>
            <h1 className={styles.title}>الان کجای مسیری؟</h1>
            <p className={styles.hint}>
              یک انتخاب کافی است؛ بعداً از پروفایل قابل تغییر است.
            </p>
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

        {step === 1 && (
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
              {user.name ?? ""} · {level ? levelLabel[level] : ""} ·{" "}
              {goal ? goalLabel[goal] : ""}
            </p>
          </section>
        )}

        {error ? <AuthBanner variant="error">{error}</AuthBanner> : null}

        <div className={styles.actions}>
          {step > 0 ? (
            <button
              type="button"
              className={ui.ghost}
              onClick={() => setStep(step - 1)}
              disabled={saving}
            >
              قبلی
            </button>
          ) : null}
          <button
            type="button"
            className={`${ui.button} ${styles.next}`}
            disabled={!canContinue || saving}
            onClick={next}
          >
            {saving ? "در حال ذخیره…" : step === 1 ? "شروع کن" : "بعدی"}
          </button>
        </div>
      </div>
    </div>
  );
}
