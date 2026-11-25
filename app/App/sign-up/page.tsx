"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthScreen } from "../components/auth/AuthScreen";
import { AuthBanner } from "../components/auth/AuthBanner";
import { PhoneField } from "../components/auth/PhoneField";
import { PasswordField } from "../components/auth/PasswordField";
import {
  SubmitButton,
  TermsModal,
} from "../components/auth/ui-kit";
import { authApi } from "../lib/auth/client";
import { savePending } from "../lib/auth/pending";
import { AuthApiError, messageFor } from "../lib/auth/types";
import { usePhoneField } from "../lib/auth/usePhoneField";
import {
  checkName,
  isPasswordValid,
  nameIssueLabel,
} from "../lib/auth/validation";
import { useSignedInRedirect } from "../hooks/useRequireProfile";
import styles from "../components/auth/auth.module.css";

type FieldErrors = {
  name?: string;
  phone?: string;
  password?: string;
  confirm?: string;
  terms?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  useSignedInRedirect();

  const phone = usePhoneField();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: FieldErrors = {};
    const nameIssue = checkName(name);
    if (nameIssue) nextErrors.name = nameIssueLabel[nameIssue];

    if (!phone.national.trim()) {
      nextErrors.phone = "شمارهٔ موبایل را وارد کن.";
    } else if (!phone.result.ok) {
      nextErrors.phone = "این شماره معتبر نیست. کد کشور و شماره را بررسی کن.";
    }

    const phoneForPassword = phone.result.ok ? phone.result.e164 : undefined;
    if (!password) nextErrors.password = "رمز عبور را انتخاب کن.";
    else if (!isPasswordValid(password, phoneForPassword)) {
      nextErrors.password = "رمز باید حداقل ۸ کاراکتر و شامل حرف و رقم باشد.";
    }

    if (!confirm) nextErrors.confirm = "رمز را دوباره وارد کن.";
    else if (confirm !== password) nextErrors.confirm = "دو رمز یکسان نیستند.";

    if (!accepted) nextErrors.terms = "برای ادامه، قوانین را بپذیر.";

    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0 || !phone.result.ok) return;

    setSubmitting(true);
    try {
      const challenge = await authApi.startSignUp({
        name: name.trim(),
        phone: phone.result.e164,
        password,
      });
      savePending({
        challenge,
        resendAt: Date.now() + challenge.resendAfterSeconds * 1000,
      });
      router.push("/App/verify");
    } catch (caught) {
      if (caught instanceof AuthApiError && caught.code === "PHONE_TAKEN") {
        setErrors({ phone: "این شماره قبلاً ثبت‌نام کرده است." });
      }
      if (caught instanceof AuthApiError && caught.code === "PASSWORD_INVALID") {
        setErrors({ password: "رمز عبور از نظر سرور قابل‌قبول نیست." });
      }
      setFormError(messageFor(caught));
      setSubmitting(false);
    }
  };

  return (
    <AuthScreen aside={false}>
      <h1 className={styles.srOnly}>ثبت‌نام در Leo Learn</h1>
      <form className={`${styles.form} ${styles.formFlush}`} onSubmit={submit} noValidate>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="signup-name">
            نام
          </label>
          <input
            id="signup-name"
            className={`${styles.input} ${errors.name ? styles.invalid : ""}`}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (errors.name) {
                setErrors((current) => ({ ...current, name: undefined }));
              }
            }}
            placeholder="مثلاً سارا"
            autoComplete="given-name"
            maxLength={24}
            autoFocus
            disabled={submitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "signup-name-error" : undefined}
          />
          {errors.name ? (
            <p id="signup-name-error" className={styles.error} role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

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
        />

        <PasswordField
          value={password}
          onChange={(value) => {
            setPassword(value);
            if (errors.password) {
              setErrors((current) => ({ ...current, password: undefined }));
            }
          }}
          label="رمز عبور"
          autoComplete="new-password"
          showRules
          showStrength
          phone={phone.result.ok ? phone.result.e164 : undefined}
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
          label="تکرار رمز عبور"
          autoComplete="new-password"
          error={errors.confirm}
          disabled={submitting}
        />

        <div className={styles.field}>
          <label className={styles.checkRow} htmlFor="signup-terms">
            <input
              id="signup-terms"
              type="checkbox"
              className={styles.checkbox}
              checked={accepted}
              onChange={(event) => {
                setAccepted(event.target.checked);
                if (errors.terms) {
                  setErrors((current) => ({ ...current, terms: undefined }));
                }
              }}
              disabled={submitting}
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={errors.terms ? "signup-terms-error" : undefined}
            />
            <span>
              قوانین و شرایط و سیاست دادهٔ Leo Learn را خوانده‌ام و می‌پذیرم.
            </span>
          </label>
          <button
            type="button"
            className={`${styles.linkButton} ${styles.termsLink}`}
            onClick={() => setTermsOpen(true)}
          >
            خواندن قوانین و شرایط
          </button>
          {errors.terms ? (
            <p id="signup-terms-error" className={styles.error} role="alert">
              {errors.terms}
            </p>
          ) : null}
        </div>

        {formError ? <AuthBanner variant="error">{formError}</AuthBanner> : null}

        <SubmitButton pending={submitting}>
          {submitting ? "در حال ارسال کد…" : "ادامه و دریافت کد"}
        </SubmitButton>

        <p className={styles.hint}>
          با انتخاب «ادامه»، یک کد ۶ رقمی به شماره‌ات پیامک می‌شود.
        </p>
      </form>

      <p className={styles.footerText}>
        قبلاً ثبت‌نام کرده‌ای؟{" "}
        <Link href="/App/sign-in" className={styles.linkInline}>
          وارد شو
        </Link>
      </p>

      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </AuthScreen>
  );
}
