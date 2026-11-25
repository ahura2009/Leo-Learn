"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthBanner } from "../components/auth/AuthBanner";
import { PhoneField } from "../components/auth/PhoneField";
import { SubmitButton } from "../components/auth/ui-kit";
import { authApi } from "../lib/auth/client";
import { savePending } from "../lib/auth/pending";
import { AuthApiError, messageFor } from "../lib/auth/types";
import { usePhoneField } from "../lib/auth/usePhoneField";
import { useSignedInRedirect } from "../hooks/useRequireProfile";
import styles from "../components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  useSignedInRedirect();

  const phone = usePhoneField();
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    if (!phone.national.trim()) {
      setPhoneError("شمارهٔ موبایل را وارد کن.");
      return;
    }
    if (!phone.result.ok) {
      setPhoneError("این شماره معتبر نیست. کد کشور و شماره را بررسی کن.");
      return;
    }

    setPhoneError(null);
    setFormError(null);
    setSubmitting(true);

    try {
      const challenge = await authApi.forgotPassword(phone.result.e164);
      savePending({
        challenge,
        resendAt: Date.now() + challenge.resendAfterSeconds * 1000,
      });
      router.push("/App/reset-password");
    } catch (caught) {
      if (caught instanceof AuthApiError && caught.code === "PHONE_INVALID") {
        setPhoneError("این شماره معتبر نیست.");
      }
      setFormError(messageFor(caught));
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen aside={false}>
      <h1 className={styles.srOnly}>بازیابی رمز عبور</h1>

      <form className={`${styles.form} ${styles.formFlush}`} onSubmit={submit} noValidate>
        <PhoneField
          country={phone.country}
          national={phone.national}
          onCountryChange={(code) => {
            phone.setCountry(code);
            if (phoneError) setPhoneError(null);
          }}
          onNationalChange={(value) => {
            phone.setNational(value);
            if (phoneError) setPhoneError(null);
          }}
          error={phoneError}
          disabled={submitting}
          autoFocus
        />

        {formError ? <AuthBanner variant="error">{formError}</AuthBanner> : null}

        <SubmitButton pending={submitting}>
          {submitting ? "در حال ارسال کد…" : "دریافت کد بازیابی"}
        </SubmitButton>

        <p className={styles.hint}>
          برای حفظ امنیت، هیچ‌جا اعلام نمی‌کنیم این شماره ثبت شده است یا نه.
        </p>
      </form>

      <p className={styles.footerText}>
        یادت آمد؟{" "}
        <Link href="/App/sign-in" className={styles.linkInline}>
          برگرد به ورود
        </Link>
      </p>
    </AuthScreen>
  );
}
