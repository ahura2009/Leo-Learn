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
import { SubmitButton, useCountdown } from "../components/auth/ui-kit";
import { authApi } from "../lib/auth/client";
import {
  clearPending,
  getPendingServerSnapshot,
  getSignupPending,
  savePending,
  subscribePending,
} from "../lib/auth/pending";
import { setAuthUser } from "../lib/auth/session";
import { AuthApiError, messageFor } from "../lib/auth/types";
import { destinationFor } from "../lib/auth/user";
import { maskPhone } from "../lib/auth/phone";
import { useSignedInRedirect } from "../hooks/useRequireProfile";
import styles from "../components/auth/auth.module.css";

export default function VerifyPage() {
  const router = useRouter();
  useSignedInRedirect();

  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const busy = useRef(false);
  /** بعد از تأیید موفق، نبودِ چالش نباید کاربر را به ثبت‌نام برگرداند. */
  const finished = useRef(false);

  const pending = useSyncExternalStore(
    subscribePending,
    getSignupPending,
    getPendingServerSnapshot,
  );

  const secondsLeft = useCountdown(pending?.resendAt ?? null);

  useEffect(() => {
    if (pending === null && !finished.current) router.replace("/App/sign-up");
  }, [pending, router]);

  const submitCode = async (value: string) => {
    if (!pending || busy.current) return;
    if (value.length !== pending.challenge.codeLength) {
      setCodeError("کد باید ۶ رقم باشد.");
      return;
    }

    busy.current = true;
    setSubmitting(true);
    setCodeError(null);
    setFormError(null);
    setNotice(null);

    try {
      const user = await authApi.verifySignUp({
        challengeId: pending.challenge.challengeId,
        code: value,
      });
      finished.current = true;
      clearPending("signup");
      setAuthUser(user);
      router.replace(destinationFor(user));
    } catch (caught) {
      const error =
        caught instanceof AuthApiError ? caught : new AuthApiError("UNKNOWN");

      if (error.code === "CODE_INVALID") {
        setCodeError(
          error.attemptsLeft !== undefined
            ? `کد درست نیست؛ ${error.attemptsLeft} تلاش دیگر باقی مانده است.`
            : "کد واردشده درست نیست.",
        );
      } else if (error.code === "CODE_EXPIRED") {
        setCodeError("این کد منقضی شده است. کد تازه بگیر.");
      } else if (error.code === "TOO_MANY_ATTEMPTS") {
        setCodeError("تعداد تلاش‌های اشتباه زیاد شد. کد تازه بگیر.");
      } else if (error.code === "CHALLENGE_NOT_FOUND") {
        clearPending("signup");
        setCodeError("این درخواست معتبر نیست. از ثبت‌نام دوباره شروع کن.");
      } else {
        setFormError(messageFor(error));
      }

      setCode("");
      busy.current = false;
      setSubmitting(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void submitCode(code);
  };

  const resend = async () => {
    if (!pending || secondsLeft > 0 || resending) return;

    setResending(true);
    setFormError(null);
    setCodeError(null);
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
    clearPending("signup");
    router.push("/App/sign-up");
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
      <h1 className={styles.srOnly}>تأیید شمارهٔ موبایل</h1>

      <form className={`${styles.form} ${styles.formFlush}`} onSubmit={submit} noValidate>
        <p className={styles.hint}>
          کد {pending.challenge.codeLength} رقمی به{" "}
          <span dir="ltr">{maskPhone(pending.challenge.phone)}</span> پیامک شد.
        </p>

        <OtpField
          value={code}
          onChange={(value) => {
            setCode(value);
            if (codeError) setCodeError(null);
          }}
          length={pending.challenge.codeLength}
          invalid={Boolean(codeError)}
          disabled={submitting}
          autoFocus
          onComplete={(value) => void submitCode(value)}
        />

        {codeError ? (
          <p className={styles.error} role="alert">
            {codeError}
          </p>
        ) : null}

        {notice ? <AuthBanner variant="success">{notice}</AuthBanner> : null}
        {formError ? <AuthBanner variant="error">{formError}</AuthBanner> : null}

        <SubmitButton pending={submitting}>تأیید و ساخت حساب</SubmitButton>

        <div className={styles.resendRow}>
          {secondsLeft > 0 ? (
            <>
              <span>ارسال دوبارهٔ کد تا</span>
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
      </form>

      <div className={styles.linksRow} style={{ marginTop: 22, justifyContent: "center" }}>
        <button type="button" className={styles.linkButton} onClick={changePhone}>
          شماره را اشتباه وارد کردی؟ تغییر شماره
        </button>
      </div>

      <p className={styles.footerText}>
        حساب داری؟{" "}
        <Link href="/App/sign-in" className={styles.linkInline}>
          وارد شو
        </Link>
      </p>
    </AuthScreen>
  );
}
