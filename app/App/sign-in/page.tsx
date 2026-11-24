"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthBanner } from "../components/auth/AuthBanner";
import { PhoneField } from "../components/auth/PhoneField";
import { PasswordField } from "../components/auth/PasswordField";
import {
  ServiceNotice,
  SubmitButton,
} from "../components/auth/ui-kit";
import { authApi } from "../lib/auth/client";
import {
  getDemoUser,
  isDemoLogin,
  startDemoSession,
} from "../lib/auth/demo";
import { setAuthUser } from "../lib/auth/session";
import { messageFor, AuthApiError } from "../lib/auth/types";
import { destinationFor } from "../lib/auth/user";
import { usePhoneField } from "../lib/auth/usePhoneField";
import { useSignedInRedirect } from "../hooks/useRequireProfile";
import styles from "../components/auth/auth.module.css";

export default function SignInPage() {
  const router = useRouter();
  useSignedInRedirect();

  const phone = usePhoneField();
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: typeof errors = {};
    if (!phone.national.trim()) {
      nextErrors.phone = "شمارهٔ موبایل را وارد کن.";
    } else if (!phone.result.ok) {
      nextErrors.phone = "این شماره معتبر نیست. کد کشور و شماره را بررسی کن.";
    }
    if (!password) nextErrors.password = "رمز عبور را وارد کن.";

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0 || !phone.result.ok) return;

    /* حساب نمایشی — بدون بک‌اند و فقط همین یک ورود. */
    if (isDemoLogin(phone.result.e164, password)) {
      startDemoSession();
      setAuthUser(getDemoUser());
      router.replace("/App");
      return;
    }

    setSubmitting(true);
    try {
      const user = await authApi.signIn({
        phone: phone.result.e164,
        password,
      });
      setAuthUser(user);
      router.replace(destinationFor(user));
    } catch (caught) {
      if (caught instanceof AuthApiError && caught.code === "PHONE_INVALID") {
        setErrors({ phone: "این شماره معتبر نیست." });
      }
      setFormError(messageFor(caught));
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen>
      <p className={styles.kicker}>ورود</p>
      <h1 className={styles.title}>خوش برگشتی</h1>
      <p className={styles.subtitle}>
        با شمارهٔ موبایل و رمز عبورت وارد شو تا از همان‌جایی که ماندی ادامه
        بدهی.
      </p>

      <form className={styles.form} onSubmit={submit} noValidate>
        <ServiceNotice />

        <PhoneField
          country={phone.country}
          national={phone.national}
          onCountryChange={(code) => {
            phone.setCountry(code);
            if (errors.phone) {
              setErrors((current) => ({ ...current, phone: undefined }));
            }
          }}
          onNationalChange={(value) => {
            phone.setNational(value);
            if (errors.phone) {
              setErrors((current) => ({ ...current, phone: undefined }));
            }
          }}
          error={errors.phone}
          disabled={submitting}
          autoFocus
        />

        <PasswordField
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) setErrors((current) => ({ ...current, password: undefined }));
          }}
          label="رمز عبور"
          autoComplete="current-password"
          error={errors.password}
          disabled={submitting}
        />

        <div className={styles.linksRow}>
          <Link href="/App/forgot-password" className={styles.linkInline}>
            رمز عبور را فراموش کردی؟
          </Link>
        </div>

        {formError ? <AuthBanner variant="error">{formError}</AuthBanner> : null}

        <SubmitButton pending={submitting}>
          {submitting ? "در حال ورود…" : "ورود"}
        </SubmitButton>
      </form>

      <p className={styles.footerText}>
        هنوز حساب نداری؟{" "}
        <Link href="/App/sign-up" className={styles.linkInline}>
          ثبت‌نام کن
        </Link>
      </p>
    </AuthScreen>
  );
}
