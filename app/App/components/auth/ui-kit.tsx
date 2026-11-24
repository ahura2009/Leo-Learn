"use client";

import { useEffect, useRef, useState } from "react";
import { authServiceConfigured } from "../../lib/auth/client";
import { messageFor } from "../../lib/auth/types";
import { useAuth } from "../AuthProvider";
import { AuthBanner } from "./AuthBanner";
import styles from "./auth.module.css";

/** اگر سرویس احراز هویت تنظیم/در دسترس نباشد، صادقانه اعلام می‌کند. */
export function ServiceNotice() {
  const { status, error, refresh } = useAuth();

  if (!authServiceConfigured) {
    return (
      <AuthBanner variant="warning">
        سرور احراز هویت برای این نسخه تنظیم نشده است. تا اتصال بک‌اند Leo Learn
        و تنظیم <span dir="ltr">NEXT_PUBLIC_AUTH_API_URL</span>، ورود و ثبت‌نام
        فعال نمی‌شود. کد نمایشی هم ارائه نمی‌کنیم.
      </AuthBanner>
    );
  }

  if (status === "unavailable") {
    return (
      <AuthBanner
        variant="error"
        action={
          <button type="button" className={styles.bannerRetry} onClick={refresh}>
            تلاش دوباره
          </button>
        }
      >
        {messageFor(error)}
      </AuthBanner>
    );
  }

  return null;
}

export function SubmitButton({
  children,
  pending,
  disabled,
}: {
  children: React.ReactNode;
  pending: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className={styles.submit}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? <span className={styles.spinner} aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** شمارش معکوس ارسال دوباره — با زمان مطلق تا رفرش صفحه هم درست بماند. */
export function useCountdown(targetAt: number | null): number {
  const [now, setNow] = useState(() => Date.now());
  const absent = targetAt === null;

  useEffect(() => {
    if (absent) return;

    /* به‌روزرسانی اولیه در تیک صفر، نه در بدنهٔ خود effect. */
    const immediate = window.setTimeout(() => setNow(Date.now()), 0);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(immediate);
      window.clearInterval(timer);
    };
  }, [targetAt, absent]);

  if (targetAt === null) return 0;
  return Math.max(0, Math.ceil((targetAt - now) / 1000));
}

export function TermsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-title"
      >
        <div className={styles.modalHead}>
          <h2 id="terms-title" className={styles.modalTitle}>
            قوانین و شرایط
          </h2>
          <button
            ref={closeRef}
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="بستن"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <ul className={styles.modalList}>
          <li>
            شمارهٔ موبایلت فقط برای ورود، تأیید هویت و اطلاع‌رسانی‌های ضروری
            حساب استفاده می‌شود.
          </li>
          <li>
            رمز عبورت به شکل هش‌شده در سرور نگه داشته می‌شود و هیچ‌جا به
            شکل متن ساده ذخیره نمی‌شود.
          </li>
          <li>
            کد یک‌بارمصرف فقط چند دقیقه اعتبار دارد و تعداد تلاش برای واردکردن
            آن محدود است.
          </li>
          <li>
            پیشرفت تمرین‌ها فعلاً روی همین مرورگر نگه داشته می‌شود و با پاک‌کردن
            دادهٔ مرورگر از بین می‌رود.
          </li>
          <li>
            برای حذف حساب یا هر پرسشی دربارهٔ داده‌هایت می‌توانی با پشتیبانی Leo
            Learn در تماس باشی.
          </li>
        </ul>
      </div>
    </div>
  );
}
