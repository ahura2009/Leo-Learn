"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { useAuth } from "../components/AuthProvider";
import { AuthBanner } from "../components/auth/AuthBanner";
import { Avatar } from "../components/Avatar";
import { displayPhone } from "../lib/auth/phone";
import { messageFor } from "../lib/auth/types";
import { AVATARS } from "../lib/avatars";
import {
  GOALS,
  LEVELS,
  goalLabel,
  levelLabel,
  type Goal,
  type Level,
} from "../lib/types";
import ui from "../components/Ui.module.css";
import styles from "./profile.module.css";

const dailyChoices = [5, 10, 15, 30];
const BIO_MAX = 60;

type Draft = {
  name: string;
  bio: string;
  avatar: string;
  level: Level;
  goal: Goal;
  dailyMinutes: number;
};

export default function ProfilePage() {
  const router = useRouter();
  const { ready, profile, user } = useRequireProfile();
  const { progress, saveProfile, resetAll } = useApp();
  const { signOut } = useAuth();

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saved, setSaved] = useState(false);
  const [examNotice, setExamNotice] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !profile || !user) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const form: Draft = draft ?? {
    name: profile.name,
    bio: profile.bio,
    avatar: profile.avatar,
    level: profile.level,
    goal: profile.goal,
    dailyMinutes: profile.dailyMinutes,
  };

  const edit = (patch: Partial<Draft>) => {
    setDraft({ ...form, ...patch });
    setSaved(false);
    setError(null);
  };

  const changes = {
    name: form.name.trim() !== profile.name ? form.name.trim() : undefined,
    bio: form.bio.trim() !== profile.bio ? form.bio.trim() : undefined,
    avatar: form.avatar !== profile.avatar ? form.avatar : undefined,
    level: form.level !== profile.level ? form.level : undefined,
    goal: form.goal !== profile.goal ? form.goal : undefined,
    dailyMinutes:
      form.dailyMinutes !== profile.dailyMinutes
        ? form.dailyMinutes
        : undefined,
  };

  const changed = Object.values(changes).some((value) => value !== undefined);
  const lessons = Object.values(progress.scenarios).filter(
    (item) => item.completedAt,
  ).length;

  const save = async () => {
    if (!changed || busy) return;

    if (changes.name !== undefined && changes.name.length < 2) {
      setError("نام نمایشی باید حداقل ۲ حرف باشد.");
      return;
    }

    const patch = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    );

    setBusy(true);
    setError(null);
    try {
      await saveProfile(patch);
      setDraft(null);
      setSaved(true);
    } catch (caught) {
      setError(messageFor(caught));
    } finally {
      setBusy(false);
    }
  };

  const discard = () => {
    setDraft(null);
    setSaved(false);
    setError(null);
  };

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await signOut();
      router.replace("/App/sign-in");
    } catch (caught) {
      setError(messageFor(caught));
      setBusy(false);
    }
  };

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <span className={ui.eyebrow}>پروفایل</span>
        <h1 className={ui.title}>پروفایل من</h1>
      </header>

      {error ? <AuthBanner variant="error">{error}</AuthBanner> : null}

      {/* ---------- نمای پروفایل ---------- */}
      <section className={`${ui.card} ${styles.hero}`}>
        <Avatar id={form.avatar} name={form.name} size={92} />

        <div className={styles.heroBody}>
          <p className={styles.heroName}>{form.name || profile.name}</p>
          <p className={form.bio ? styles.heroBio : styles.heroBioEmpty}>
            {form.bio || "یک خط دربارهٔ خودت بنویس تا پروفایلت شخصی شود."}
          </p>

          <div className={styles.chips}>
            <span className={styles.chip}>
              {form.level} · {levelLabel[form.level]}
            </span>
            <span className={styles.chip}>هدف: {goalLabel[form.goal]}</span>
            <span className={styles.chipGold}>
              {form.dailyMinutes} دقیقه در روز
            </span>
          </div>
        </div>
      </section>

      {/* ---------- آزمون تعیین سطح ---------- */}
      <section className={`${ui.card} ${styles.examCard}`}>
        <div className={styles.examBody}>
          <p className={ui.cardTitle}>مطمئن نیستی در چه سطحی هستی؟</p>
          <p className={ui.muted}>
            یک آزمون کوتاه مشخص می‌کند از کجا شروع کنی و سطح پروفایلت را
            خودکار تنظیم می‌کند.
          </p>
          {examNotice ? (
            <p className={styles.examSoon}>آزمون تعیین سطح به‌زودی فعال می‌شود.</p>
          ) : null}
        </div>

        <button
          type="button"
          className={styles.examButton}
          onClick={() => setExamNotice(true)}
        >
          شروع آزمون تعیین سطح
        </button>
      </section>

      {/* ---------- شخصی‌سازی ---------- */}
      <section className={ui.card}>
        <p className={ui.cardTitle}>شخصی‌سازی</p>

        <div className={ui.stack}>
          <div className={styles.group}>
            <span className={ui.meta}>آواتار</span>
            <div className={styles.avatarRow}>
              {AVATARS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.avatarPick} ${
                    form.avatar === item.id ? styles.avatarPickActive : ""
                  }`}
                  onClick={() => edit({ avatar: item.id })}
                  disabled={busy}
                  aria-pressed={form.avatar === item.id}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Avatar id={item.id} name={form.name} size={52} />
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span className={ui.meta}>نام نمایشی</span>
            <input
              className={styles.input}
              value={form.name}
              maxLength={24}
              disabled={busy}
              onChange={(event) => edit({ name: event.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.labelRow}>
              <span className={ui.meta}>دربارهٔ من</span>
              <span className={styles.counter}>
                {form.bio.length}/{BIO_MAX}
              </span>
            </span>
            <textarea
              className={styles.textarea}
              value={form.bio}
              maxLength={BIO_MAX}
              rows={2}
              disabled={busy}
              placeholder="مثلاً: دارم برای سفر به استانبول انگلیسی تمرین می‌کنم."
              onChange={(event) => edit({ bio: event.target.value })}
            />
          </label>

          <div className={styles.group}>
            <span className={ui.meta}>سطح</span>
            <div className={styles.pills}>
              {LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`${styles.pill} ${
                    form.level === level ? styles.active : ""
                  }`}
                  onClick={() => edit({ level })}
                  disabled={busy}
                  aria-pressed={form.level === level}
                >
                  {level} · {levelLabel[level]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={ui.meta}>هدف یادگیری</span>
            <div className={styles.pills}>
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={`${styles.pill} ${
                    form.goal === goal ? styles.active : ""
                  }`}
                  onClick={() => edit({ goal })}
                  disabled={busy}
                  aria-pressed={form.goal === goal}
                >
                  {goalLabel[goal]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={ui.meta}>هدف روزانه</span>
            <div className={styles.pills}>
              {dailyChoices.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`${styles.pill} ${
                    form.dailyMinutes === minutes ? styles.active : ""
                  }`}
                  onClick={() => edit({ dailyMinutes: minutes })}
                  disabled={busy}
                  aria-pressed={form.dailyMinutes === minutes}
                >
                  {minutes} دقیقه
                </button>
              ))}
            </div>
          </div>

          {/* نوار ذخیره */}
          <div className={styles.saveBar}>
            <button
              type="button"
              className={styles.saveButton}
              onClick={() => void save()}
              disabled={!changed || busy}
            >
              {busy ? "در حال ذخیره…" : "ذخیرهٔ تغییرات"}
            </button>

            {changed ? (
              <button
                type="button"
                className={ui.ghost}
                onClick={discard}
                disabled={busy}
              >
                بازگردانی
              </button>
            ) : null}

            <span className={styles.saveHint}>
              {changed
                ? "تغییرهای ذخیره‌نشده داری."
                : saved
                  ? "تغییرات ذخیره شد ✓"
                  : "همه‌چیز ذخیره شده است."}
            </span>
          </div>
        </div>
      </section>

      {/* ---------- حساب ---------- */}
      <section className={ui.card}>
        <div className={styles.accountRow}>
          <div>
            <p className={ui.meta}>شمارهٔ موبایل</p>
            <p className={styles.phone} dir="ltr">
              {displayPhone(user.phone)}
            </p>
          </div>
          <div>
            <p className={ui.meta}>عضو از</p>
            <p className={styles.lessons}>
              {new Date(profile.createdAt).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </div>

        <div className={styles.accountRow}>
          <div>
            <p className={ui.meta}>درس‌های انجام‌شده</p>
            <p className={styles.lessons}>{lessons}</p>
          </div>
          <button
            type="button"
            className={ui.ghost}
            onClick={() => void handleSignOut()}
            disabled={busy}
          >
            خروج از حساب
          </button>
        </div>
      </section>

      {/* ---------- خطر ---------- */}
      <section className={`${ui.card} ${styles.danger}`}>
        <p className={ui.cardTitle}>پاک کردن پیشرفت</p>
        <p className={ui.muted}>
          همهٔ درس‌ها، واژه‌ها و زنجیرهٔ روزهای پیوستهٔ این حساب پاک می‌شود، ولی
          حساب و شمارهٔ موبایل سر جایشان می‌مانند. این کار برگشت‌پذیر نیست.
        </p>

        {confirming ? (
          <div className={styles.confirm}>
            <button
              type="button"
              className={styles.dangerButton}
              onClick={() => {
                resetAll();
                setConfirming(false);
              }}
            >
              بله، پیشرفت را پاک کن
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
