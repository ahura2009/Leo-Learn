import type { AuthUser } from "./types";
import type { Profile } from "../types";

/** پروفایل اپ فقط وقتی ساخته می‌شود که onboarding تمام شده باشد. */
export function profileFromUser(user: AuthUser | null): Profile | null {
  if (!user || !user.name || !user.onboardedAt) return null;

  return {
    name: user.name,
    level: user.level ?? "A1",
    goal: user.goal ?? "daily",
    createdAt: user.createdAt,
    onboardedAt: user.onboardedAt,
  };
}

/** مقصد بعد از ورود: کاربر قدیمی به داشبورد، کاربر تازه به onboarding. */
export function destinationFor(user: AuthUser): "/App" | "/App/onboarding" {
  return user.onboardedAt ? "/App" : "/App/onboarding";
}
