"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useApp } from "../components/AppProvider";

/**
 * دروازهٔ ورود اپ: هر صفحهٔ /App اگر پروفایل نداشته باشد به onboarding می‌رود.
 * onboarding خودش از این هوک استفاده نمی‌کند.
 */
export function useRequireProfile() {
  const { ready, profile } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (profile) return;
    if (pathname.includes("/App/onboarding")) return;
    router.replace("/App/onboarding");
  }, [ready, profile, pathname, router]);

  return { ready, profile };
}
