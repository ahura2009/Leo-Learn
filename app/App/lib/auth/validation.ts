import { digitsOnly } from "./phone.ts";

/* قوانین رمز و نام — همان قوانینی که سرور هم اعمال می‌کند.
   کلاینت فقط برای بازخورد سریع است؛ اعتبار نهایی با سرور است. */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
export const NAME_MIN = 2;
export const NAME_MAX = 24;
export const OTP_LENGTH = 6;

export type PasswordIssue =
  | "short"
  | "long"
  | "no-letter"
  | "no-digit"
  | "same-as-phone";

export const passwordIssueLabel: Record<PasswordIssue, string> = {
  short: `حداقل ${PASSWORD_MIN} کاراکتر`,
  long: `حداکثر ${PASSWORD_MAX} کاراکتر`,
  "no-letter": "حداقل یک حرف",
  "no-digit": "حداقل یک رقم",
  "same-as-phone": "شبیه شمارهٔ موبایل نباشد",
};

export function checkPassword(password: string, phone?: string): PasswordIssue[] {
  const issues: PasswordIssue[] = [];
  if (password.length < PASSWORD_MIN) issues.push("short");
  if (password.length > PASSWORD_MAX) issues.push("long");
  if (!/\p{L}/u.test(password)) issues.push("no-letter");
  if (!/[0-9]/.test(password)) issues.push("no-digit");

  if (phone) {
    const phoneDigits = digitsOnly(phone).replace(/^0+/, "");
    const passwordDigits = digitsOnly(password).replace(/^0+/, "");
    if (
      phoneDigits.length >= 7 &&
      passwordDigits.length >= 7 &&
      (phoneDigits.endsWith(passwordDigits) ||
        passwordDigits.endsWith(phoneDigits))
    ) {
      issues.push("same-as-phone");
    }
  }

  return issues;
}

export function isPasswordValid(password: string, phone?: string): boolean {
  return checkPassword(password, phone).length === 0;
}

export function passwordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
} {
  if (!password) return { score: 0, label: "خالی" };

  let points = 0;
  if (password.length >= PASSWORD_MIN) points += 1;
  if (/\p{L}/u.test(password) && /[0-9]/.test(password)) points += 1;
  if (
    password.length >= 12 ||
    /[^A-Za-z0-9؀-ۿ]/u.test(password)
  ) {
    points += 1;
  }

  const score = Math.min(points, 3) as 0 | 1 | 2 | 3;
  const label = ["خیلی ضعیف", "ضعیف", "خوب", "قوی"][score];
  return { score, label };
}

export function checkName(name: string): "empty" | "short" | "long" | "chars" | null {
  const value = name.trim();
  if (!value) return "empty";
  if (value.length < NAME_MIN) return "short";
  if (value.length > NAME_MAX) return "long";
  if (!/^[\p{L}\s'.-]+$/u.test(value)) return "chars";
  return null;
}

export const nameIssueLabel: Record<
  "empty" | "short" | "long" | "chars",
  string
> = {
  empty: "نام را وارد کن",
  short: `نام حداقل ${NAME_MIN} حرف باشد`,
  long: `نام حداکثر ${NAME_MAX} حرف باشد`,
  chars: "نام فقط شامل حروف و فاصله باشد",
};

export function isOtpCode(code: string): boolean {
  return new RegExp(`^\\d{${OTP_LENGTH}}$`).test(code);
}
