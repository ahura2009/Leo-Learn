"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { goalLabel, levelLabel, type Goal, type Level } from "../lib/types";
import ui from "../components/Ui.module.css";
import styles from "./profile.module.css";

const levels: Level[] = ["A1", "A2", "B1"];
const goals: Goal[] = ["travel", "work", "daily"];

export default function ProfilePage() {
  const router = useRouter();
  const { ready, profile } = useRequireProfile();
  const { progress, saveProfile, resetAll } = useApp();

  const [name, setName] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const displayName = name ?? profile.name;
  const lessons = Object.values(progress.scenarios).filter(
    (item) => item.completedAt,
  ).length;

  const update = (patch: Partial<{ level: Level; goal: Goal }>) => {
    saveProfile({ ...profile, ...patch });
  };

  const commitName = () => {
    const clean = displayName.trim();
    if (clean.length < 2) {
      setName(profile.name);
      return;
    }
    saveProfile({ ...profile, name: clean });
    setName(clean);
  };

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <span className={ui.eyebrow}>پروفایل</span>
        <h1 className={ui.title}>تنظیمات تمرین</h1>
      </header>

      <section className={ui.card}>
        <div className={ui.stack}>
          <label className={styles.field}>
            <span className={ui.meta}>نام</span>
            <input
              className={styles.input}
              value={displayName}
              maxLength={24}
              onChange={(event) => setName(event.target.value)}
              onBlur={commitName}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
          </label>

          <div className={styles.group}>
            <span className={ui.meta}>سطح</span>
            <div className={styles.pills}>
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.pill} ${
                    profile.level === level ? styles.active : ""
                  }`}
                  onClick={() => update({ level })}
                >
                  {level} · {levelLabel[level]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={ui.meta}>هدف</span>
            <div className={styles.pills}>
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={`${styles.pill} ${
                    profile.goal === goal ? styles.active : ""
                  }`}
                  onClick={() => update({ goal })}
                >
                  {goalLabel[goal]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={ui.card}>
        <div className={ui.row}>
          <div>
            <p className={ui.meta}>درس‌های انجام‌شده</p>
            <p className={styles.lessons}>{lessons}</p>
          </div>
          <div>
            <p className={ui.meta}>عضو از</p>
            <p className={styles.lessons}>
              {new Date(profile.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>
      </section>

      <section className={`${ui.card} ${styles.danger}`}>
        <p className={ui.cardTitle}>پاک کردن پیشرفت</p>
        <p className={ui.muted}>
          همهٔ درس‌ها، واژه‌ها و زنجیرهٔ روزهای پیوسته حذف می‌شود و به onboarding
          برمی‌گردی. این کار برگشت‌پذیر نیست.
        </p>

        {confirming ? (
          <div className={styles.confirm}>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => {
                resetAll();
                router.replace("/App/onboarding");
              }}
            >
              بله، همه را پاک کن
            </button>
            <button
              type="button"
              className={ui.ghost}
              onClick={() => setConfirming(false)}
            >
              انصراف
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.dangerGhost}
            onClick={() => setConfirming(true)}
          >
            پاک کردن پیشرفت
          </button>
        )}
      </section>
    </div>
  );
}
