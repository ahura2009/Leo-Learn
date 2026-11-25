"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthBanner } from "../components/auth/AuthBanner";
import { OtpField } from "../components/auth/OtpField";
import { PasswordField } from "../components/auth/PasswordField";
import {
  SubmitButton,
  useCountdown,
} from "../components/auth/ui-kit";
import { authApi } from "../lib/auth/client";
import {
  clearPending,
  getPendingServerSnapshot,
  getResetPending,
  savePending,
  subscribePending,
} from "../lib/auth/pending";
import { setAuthUser } from "../lib/auth/session";
import { AuthApiError, messageFor } from "../lib/auth/types";
import { destinationFor } from "../lib/auth/user";
import { maskPhone } from "../lib/auth/phone";
import { isPasswordValid } from "../lib/auth/validation";
import { useSignedInRedirect } from "../hooks/useRequireProfile";
import styles from "../components/auth/auth.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  useSignedInRedirect();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    code?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const busy = useRef(false);
  /** بعد از ذخیرهٔ موفق، نبودِ چالش نباید کاربر را به فراموشی رمز برگرداند. */
  const finished = useRef(false);

  const pending = useSyncExternalStore(
    subscribePending,
    getResetPending,
    getPendingServerSnapshot,
  );

  const secondsLeft = useCountdown(pending?.resendAt ?? null);

  useEffect(() => {
    if (pending === null && !finished.current) {
      router.replace("/App/forgot-password");
    }
  }, [pending, router]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!pending || busy.current) return;

    const length = pending.challenge.codeLength;
    const nextErrors: typeof errors = {};
    if (code.length !== length) nextErrors.code = `کد باید ${length} رقم باشد.`;
    if (!password) nextErrors.password = "رمز تازه را وارد کن.";
    else if (!isPasswordValid(password, pending.challenge.phone)) {
      nextErrors.password = "رمز باید حداقل ۸ کاراکتر و شامل حرف و رقم باشد.";
    }
    if (!confirm) nextErrors.confirm = "رمز را دوباره وارد کن.";
    else if (confirm !== password) nextErrors.confirm = "دو رمز یکسان نیستند.";

    setErrors(nextErrors);
    setFormError(null);
    setNotice(null);
    if (Object.keys(nextErrors).length > 0) return;

    busy.current = true;
    setSubmitting(true);

    try {
      const user = await authApi.resetPassword({
        challengeId: pending.challenge.challengeId,
        code,
        password,
      });
      finished.current = true;
      clearPending("reset");
      setAuthUser(user);
      router.replace(destinationFor(user));
    } catch (caught) {
      const error =
        caught instanceof AuthApiError ? caught : new AuthApiError("UNKNOWN");

      if (error.code === "CODE_INVALID") {
        setErrors({
          code:
            error.attemptsLeft !== undefined
              ? `کد درست نیست؛ ${error.attemptsLeft} تلاش دیگر باقی مانده است.`
              : "کد واردشده درست نیست.",
        });
      } else if (error.code === "CODE_EXPIRED") {
        setErrors({ code: "این کد منقضی شده است. کد تازه بگیر." });
      } else if (error.code === "TOO_MANY_ATTEMPTS") {
        setErrors({ code: "تعداد تلاش‌های اشتباه زیاد شد. کد تازه بگیر." });
      } else if (error.code === "PASSWORD_INVALID") {
        setErrors({ password: "این رمز از نظر سرور قابل‌قبول نیست." });
      } else if (error.code === "CHALLENGE_NOT_FOUND") {
        clearPending("reset");
        setErrors({ code: "این درخواست معتبر نیست. از اول شروع کن." });
      } else {
        setFormError(messageFor(error));
      }

      setCode("");
      busy.current = false;
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!pending || secondsLeft > 0 || resending) return;
    setResending(true);
    setFormError(null);
    setErrors({});
    setNotice(null);

    try {
      const challenge = await authApi.resend(pending.challenge.challengeId);
      savePending({
        challenge,
        resendAt: Date.now() + challenge.resendAfterSeconds * 1000,
      });
      setCode("");
      setNotice("کد تازه به شماره‌ات پیامک شد.");
    } catch (caught) {
      const error = caught instanceof AuthApiError ? caught : null;
      if (error?.retryAfterSeconds && pending) {
        savePending({
          challenge: pending.challenge,
          resendAt: Date.now() + error.retryAfterSeconds * 1000,
        });
      }
      setFormError(messageFor(caught));
    } finally {
      setResending(false);
    }
  };

  const changePhone = () => {
    clearPending("reset");
    router.push("/App/forgot-password");
  };

  if (pending === undefined) {
    return (
      <AuthScreen aside={false}>
        <p className={styles.hint}>در حال آماده‌سازی…</p>
      </AuthScreen>
    );
  }

  if (pending === null) return null;

  return (
    <AuthScreen aside={false}>
      <h1 className={styles.srOnly}>گذاشتن رمز تازه</h1>

      <form className={`${styles.form} ${styles.formFlush}`} onSubmit={submit} noValidate>
        <p className={styles.hint}>
          کد تأیید به{" "}
          <span dir="ltr">{maskPhone(pending.challenge.phone)}</span> پیامک شد؛
          همراه رمز تازه واردش کن.
        </p>

        <div className={styles.field}>
          <span className={styles.label}>کد تأیید</span>
          <OtpField
            value={code}
            onChange={(value) => {
              setCode(value);
              if (errors.code) {
                setErrors((current) => ({ ...current, code: undefined }));
              }
            }}
            length={pending.challenge.codeLength}
            invalid={Boolean(errors.code)}
            disabled={submitting}
            autoFocus
          />
          {errors.code ? (
            <p className={styles.error} role="alert">
              {errors.code}
            </p>
          ) : null}

          <div className={styles.resendRow}>
            {secondsLeft > 0 ? (
              <>
                <span>ارسال دوباره تا</span>
                <span className={styles.timer} dir="ltr">
                  {Math.floor(secondsLeft / 60)}:
                  {String(secondsLeft % 60).padStart(2, "0")}
                </span>
                <span>دیگر</span>
              </>
            ) : (
              <button
                type="button"
                className={styles.resendButton}
                onClick={() => void resend()}
                disabled={resending || submitting}
              >
                {resending ? "در حال ارسال…" : "ارسال دوبارهٔ کد"}
              </button>
            )}
          </div>
        </div>

        <PasswordField
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          label="رمز عبور تازه"
          autoComplete="new-password"
          showRules
          showStrength
          phone={pending.challenge.phone}
          error={errors.password}
          disabled={submitting}
        />

        <PasswordField
          value={confirm}
          onChange={(value) => {
            setConfirm(value);
            if (errors.confirm) {
              setErrors((current) => ({ ...current, confirm: undefined }));
            }
          }}
          label="تکرار رمز تازه"
          autoComplete="new-password"
          error={errors.confirm}
          disabled={submitting}
        />

        {notice ? <AuthBanner variant="success">{notice}</AuthBanner> : null}
        {formError ? <AuthBanner variant="error">{formError}</AuthBanner> : null}

        <SubmitButton pending={submitting}>
          {submitting ? "در حال ذخیره…" : "ذخیرهٔ رمز تازه و ورود"}
        </SubmitButton>
      </form>

      <div
        className={styles.linksRow}
        style={{ marginTop: 22, justifyContent: "center" }}
      >
        <button type="button" className={styles.linkButton} onClick={changePhone}>
          شماره را عوض کن
        </button>
      </div>

      <p className={styles.footerText}>
        رمزت را یادت آمد؟{" "}
        <Link href="/App/sign-in" className={styles.linkInline}>
          برگرد به ورود
        </Link>
      </p>
    </AuthScreen>
  );
}
