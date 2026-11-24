"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../components/AuthProvider";
import { useApp } from "../components/AppProvider";
import { destinationFor } from "../lib/auth/user";

/**
 * دروازهٔ ورود: نشست واقعی را می‌سنجد، نه localStorage.
 * صفحه‌هایی که فقط به احراز هویت نیاز دارند (onboarding) همین را می‌گیرند.
 */
export function useRequireAuth() {
  const { status, user, error, refresh, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "anonymous") router.replace("/App/sign-in");
  }, [status, router]);

  return {
    /** فقط وقتی کاربر واقعاً وارد شده است */
    ready: status === "authenticated",
    status,
    user,
    authError: error,
    refresh,
    signOut,
  };
}

/**
 * دروازهٔ صفحه‌های اپ: اول ورود، بعد onboarding.
 * پروفایل فقط بعد از اتمام onboarding مقدار دارد.
 */
export function useRequireProfile() {
  const { ready: appReady, profile } = useApp();
  const { status, user } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || !user) return;
    if (!user.onboardedAt) router.replace("/App/onboarding");
  }, [status, user, router]);

  return {
    ready: appReady && status === "authenticated" && profile !== null,
    profile,
    user,
  };
}

/** صفحه‌های ورود/ثبت‌نام: کاربر واردشده مستقیم به مقصد خودش می‌رود. */
export function useSignedInRedirect() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && user) {
      router.replace(destinationFor(user));
    }
  }, [status, user, router]);
}
