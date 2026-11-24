import type { Goal, Level } from "../types";

/* قرارداد auth با بک‌اند واقعی.
   هیچ کد یا توکنی سمت کلاینت نگه داشته نمی‌شود؛ نشست در کوکی
   HttpOnly سرور می‌ماند و این‌جا فقط کاربرِ برنگشته می‌نشیند. */

export type AuthUser = {
  id: string;
  /** شمارهٔ یکسان‌شده به شکل E.164، مثل +989121234567 */
  phone: string;
  name: string | null;
  level: Level | null;
  goal: Goal | null;
  createdAt: string;
  /** تا وقتی onboarding تمام نشده، null است */
  onboardedAt: string | null;
};

export type ChallengePurpose = "signup" | "reset";

export type Challenge = {
  challengeId: string;
  purpose: ChallengePurpose;
  phone: string;
  /** ISO — کد تا این لحظه معتبر است */
  expiresAt: string;
  /** چند ثانیه تا ارسال دوباره مجاز شود */
  resendAfterSeconds: number;
  codeLength: number;
};

export type AuthErrorCode =
  | "NOT_CONFIGURED"
  | "NETWORK"
  | "UNAVAILABLE"
  | "BAD_REQUEST"
  | "PHONE_INVALID"
  | "PHONE_TAKEN"
  | "PASSWORD_INVALID"
  | "CODE_INVALID"
  | "CODE_EXPIRED"
  | "TOO_MANY_ATTEMPTS"
  | "RATE_LIMITED"
  | "CHALLENGE_NOT_FOUND"
  | "INVALID_CREDENTIALS"
  | "ACCOUNT_LOCKED"
  | "SERVER_ERROR"
  | "UNKNOWN";

export class AuthApiError extends Error {
  code: AuthErrorCode;
  status: number;
  retryAfterSeconds?: number;
  attemptsLeft?: number;

  constructor(
    code: AuthErrorCode,
    status = 0,
    options: { retryAfterSeconds?: number; attemptsLeft?: number; message?: string } = {},
  ) {
    super(options.message ?? defaultMessage(code));
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = options.retryAfterSeconds;
    this.attemptsLeft = options.attemptsLeft;
  }
}

export function messageFor(error: unknown): string {
  if (error instanceof AuthApiError) return defaultMessage(error.code);
  return defaultMessage("UNKNOWN");
}

export function defaultMessage(code: AuthErrorCode): string {
  switch (code) {
    case "NOT_CONFIGURED":
      return "سرور احراز هویت برای این نسخه تنظیم نشده است. برای فعال‌کردن ورود، بک‌اند Leo Learn باید مستقر و NEXT_PUBLIC_AUTH_API_URL تنظیم شود.";
    case "NETWORK":
      return "ارتباط با سرور برقرار نشد. اتصال اینترنت را بررسی کن و دوباره امتحان کن.";
    case "UNAVAILABLE":
      return "سرور احراز هویت فعلاً پاسخ نمی‌دهد. کمی بعد دوباره امتحان کن.";
    case "PHONE_INVALID":
      return "شمارهٔ موبایل معتبر نیست. شماره را با کد کشور درست وارد کن.";
    case "PHONE_TAKEN":
      return "این شماره قبلاً ثبت‌نام کرده است. وارد شو یا رمزت را بازیابی کن.";
    case "PASSWORD_INVALID":
      return "رمز عبور با قوانین امنیتی نمی‌خواند.";
    case "CODE_INVALID":
      return "کد واردشده درست نیست. دوباره بررسی کن.";
    case "CODE_EXPIRED":
      return "کد منقضی شده است. کد تازه بگیر.";
    case "TOO_MANY_ATTEMPTS":
      return "تعداد تلاش‌های اشتباه زیاد شده است. کد تازه بگیر.";
    case "RATE_LIMITED":
      return "درخواست‌ها زیاد شده‌اند. کمی صبر کن و دوباره تلاش کن.";
    case "CHALLENGE_NOT_FOUND":
      return "این درخواست معتبر نیست یا منقضی شده است. از اول شروع کن.";
    case "INVALID_CREDENTIALS":
      return "شمارهٔ موبایل یا رمز عبور درست نیست.";
    case "ACCOUNT_LOCKED":
      return "به دلیل تلاش‌های ناموفق، ورود موقتاً قفل شده است. کمی بعد دوباره تلاش کن.";
    case "SERVER_ERROR":
      return "خطایی در سرور پیش آمد. لطفاً دوباره تلاش کن.";
    default:
      return "خطای غیرمنتظره‌ای رخ داد. دوباره تلاش کن.";
  }
}
