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
import { goalLabel, levelLabel, type Goal, type Level } from "../lib/types";
import ui from "../components/Ui.module.css";
import styles from "./profile.module.css";

const levels: Level[] = ["A1", "A2", "B1"];
const goals: Goal[] = ["travel", "work", "daily"];
const dailyChoices = [5, 10, 15, 30];
const BIO_MAX = 60;

export default function ProfilePage() {
  const router = useRouter();
  const { ready, profile, user } = useRequireProfile();
  const { progress, saveProfile, resetAll } = useApp();
  const { signOut } = useAuth();

  const [name, setName] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!ready || !profile || !user) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const displayName = name ?? profile.name;
  const bioText = bio ?? profile.bio;
  const lessons = Object.values(progress.scenarios).filter(
    (item) => item.completedAt,
  ).length;

  const update = async (patch: Parameters<typeof saveProfile>[0]) => {
    setBusy(true);
    setError(null);
    try {
      await saveProfile(patch);
      return true;
    } catch (caught) {
      setError(messageFor(caught));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const commitName = async () => {
    const clean = displayName.trim();
    if (clean === profile.name) {
      setName(null);
      return;
    }
    if (clean.length < 2) {
      setName(profile.name);
      return;
    }
    await update({ name: clean });
    setName(null);
  };

  const commitBio = async () => {
    const clean = bioText.trim();
    if (clean === profile.bio) {
      setBio(null);
      return;
    }
    await update({ bio: clean });
    setBio(null);
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
        <Avatar id={profile.avatar} name={displayName} size={92} />

        <div className={styles.heroBody}>
          <p className={styles.heroName}>{displayName}</p>
          <p className={bioText ? styles.heroBio : styles.heroBioEmpty}>
            {bioText || "یک خط دربارهٔ خودت بنویس تا پروفایلت شخصی شود."}
          </p>

          <div className={styles.chips}>
            <span className={styles.chip}>
              {profile.level} · {levelLabel[profile.level]}
            </span>
            <span className={styles.chip}>هدف: {goalLabel[profile.goal]}</span>
            <span className={styles.chipGold}>
              {profile.dailyMinutes} دقیقه در روز
            </span>
          </div>
        </div>
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
                    profile.avatar === item.id ? styles.avatarPickActive : ""
                  }`}
                  onClick={() => void update({ avatar: item.id })}
                  disabled={busy}
                  aria-pressed={profile.avatar === item.id}
                  aria-label={item.label}
                  title={item.label}
                >
                  <Avatar id={item.id} name={displayName} size={52} />
                </button>
              ))}
            </div>
          </div>

          <label className={styles.field}>
            <span className={ui.meta}>نام نمایشی</span>
            <input
              className={styles.input}
              value={displayName}
              maxLength={24}
              disabled={busy}
              onChange={(event) => setName(event.target.value)}
              onBlur={() => void commitName()}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.labelRow}>
              <span className={ui.meta}>دربارهٔ من</span>
              <span className={styles.counter}>
                {bioText.length}/{BIO_MAX}
              </span>
            </span>
            <textarea
              className={styles.textarea}
              value={bioText}
              maxLength={BIO_MAX}
              rows={2}
              disabled={busy}
              placeholder="مثلاً: دارم برای سفر به استانبول انگلیسی تمرین می‌کنم."
              onChange={(event) => setBio(event.target.value)}
              onBlur={() => void commitBio()}
            />
          </label>

          <div className={styles.group}>
            <span className={ui.meta}>هدف روزانه</span>
            <div className={styles.pills}>
              {dailyChoices.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  className={`${styles.pill} ${
                    profile.dailyMinutes === minutes ? styles.active : ""
                  }`}
                  onClick={() => void update({ dailyMinutes: minutes })}
                  disabled={busy}
                  aria-pressed={profile.dailyMinutes === minutes}
                >
                  {minutes} دقیقه
                </button>
              ))}
            </div>
          </div>

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
                  onClick={() => void update({ level })}
                  disabled={busy}
                  aria-pressed={profile.level === level}
                >
                  {level} · {levelLabel[level]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <span className={ui.meta}>هدف یادگیری</span>
            <div className={styles.pills}>
              {goals.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className={`${styles.pill} ${
                    profile.goal === goal ? styles.active : ""
                  }`}
                  onClick={() => void update({ goal })}
                  disabled={busy}
                  aria-pressed={profile.goal === goal}
                >
                  {goalLabel[goal]}
                </button>
              ))}
            </div>
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
