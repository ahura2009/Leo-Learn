import type { Turn } from "./types";

/* منطق لئو در نسخهٔ ۱ — تابع خالص، بدون شبکه و بدون مدل.
   خروجی: accept | close | off  */

export type Verdict = "accept" | "close" | "off";

/** حروف کوچک، حذف علائم، یکسان‌سازی آپاستروف، فشرده‌کردن فاصله‌ها. */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9'\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(input: string): string[] {
  const text = normalize(input);
  return text ? text.split(" ") : [];
}

/** نسبت توکن‌های مشترکِ پاسخ هدف که در ورودی آمده‌اند. */
export function similarity(input: string, target: string): number {
  const targetTokens = tokens(target);
  if (targetTokens.length === 0) return 0;

  const inputTokens = new Set(tokens(input));
  const common = targetTokens.filter((token) => inputTokens.has(token)).length;

  return common / targetTokens.length;
}

export function judge(input: string, turn: Turn): Verdict {
  const text = normalize(input);
  if (!text) return "off";

  /* ۱ — هر کلیدواژهٔ پذیرفته‌شده کافی است */
  if (turn.accept.some((keyword) => text.includes(normalize(keyword)))) {
    return "accept";
  }

  /* ۲ و ۳ — شباهت توکنی با پاسخ هدف */
  const score = similarity(input, turn.target);
  if (score >= 0.6) return "accept";
  if (score >= 0.25) return "close";
  return "off";
}
