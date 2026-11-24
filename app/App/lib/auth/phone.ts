import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

/* شمارهٔ موبایل — یک منبع حقیقت برای کل کلاینت.
   اعتبارسنجی با فرادادهٔ libphonenumber انجام می‌شود، نه با الگوی
   دستی؛ بنابراین شماره‌های بین‌المللی هم درست بررسی می‌شوند. */

export const DEFAULT_COUNTRY: CountryCode = "IR";

export const POPULAR_COUNTRIES: CountryCode[] = [
  "IR",
  "DE",
  "US",
  "GB",
  "CA",
  "AU",
  "TR",
  "AE",
  "SE",
  "NL",
  "FR",
  "AT",
  "IT",
  "ES",
  "DK",
  "NO",
  "CH",
  "BE",
  "QA",
  "KW",
  "OM",
  "SA",
  "IQ",
  "AF",
];

export type CountryOption = {
  code: CountryCode;
  dial: string;
  nameFa: string;
  nameEn: string;
};

function regionNames(locale: string): Intl.DisplayNames | null {
  try {
    return new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    return null;
  }
}

function buildCountries(): CountryOption[] {
  const fa = regionNames("fa");
  const en = regionNames("en");
  const all = getCountries().map((code) => ({
    code,
    dial: `+${getCountryCallingCode(code)}`,
    nameFa: fa?.of(code) ?? code,
    nameEn: en?.of(code) ?? code,
  }));

  const rank = new Map(POPULAR_COUNTRIES.map((code, index) => [code, index]));

  return all.sort((a, b) => {
    const ra = rank.get(a.code);
    const rb = rank.get(b.code);
    if (ra !== undefined || rb !== undefined) {
      return (ra ?? Number.MAX_SAFE_INTEGER) - (rb ?? Number.MAX_SAFE_INTEGER);
    }
    return a.nameFa.localeCompare(b.nameFa, "fa");
  });
}

export const countries: CountryOption[] = buildCountries();

const byCode = new Map(countries.map((item) => [item.code, item]));

export function countryOption(code: CountryCode): CountryOption {
  return (
    byCode.get(code) ?? {
      code,
      dial: `+${getCountryCallingCode(code)}`,
      nameFa: code,
      nameEn: code,
    }
  );
}

export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x06f0),
    )
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - 0x0660),
    );
}

/** فقط ارقام لاتین را نگه می‌دارد تا ورودی‌های فارسی/عربی هم پذیرفته شوند. */
export function digitsOnly(value: string): string {
  return toLatinDigits(value).replace(/\D/g, "");
}

export type PhoneResult =
  | { ok: true; e164: string; country: CountryCode; national: string }
  | { ok: false; error: "empty" | "invalid" };

/**
 * شمارهٔ ملی (یا کامل با +) را به E.164 تبدیل می‌کند.
 * اگر ورودی با + شروع شود، کد کشور داخل آن مقدم است.
 */
export function normalizePhone(
  input: string,
  country: CountryCode = DEFAULT_COUNTRY,
): PhoneResult {
  const raw = toLatinDigits(input).trim();
  if (!raw) return { ok: false, error: "empty" };

  const compact = raw.replace(/[\s().-]/g, "");
  const parsed = compact.startsWith("+")
    ? parsePhoneNumberFromString(compact)
    : parsePhoneNumberFromString(compact, country);

  if (!parsed || !parsed.isValid() || !parsed.country) {
    return { ok: false, error: "invalid" };
  }

  return {
    ok: true,
    e164: parsed.number,
    country: parsed.country,
    national: parsed.nationalNumber,
  };
}

/** اگر کاربر شمارهٔ کامل بین‌المللی بچسباند، کشور و شمارهٔ ملی را جدا می‌کند. */
export function splitInternational(input: string): {
  country: CountryCode;
  national: string;
} | null {
  const compact = toLatinDigits(input).replace(/[\s().-]/g, "");
  if (!compact.startsWith("+")) return null;

  const parsed = parsePhoneNumberFromString(compact);
  if (!parsed || !parsed.country) return null;

  return { country: parsed.country, national: parsed.nationalNumber };
}

/** نمایش حین تایپ — فاصله‌گذاری ملی همان کشور.
   برای ایران صفر ابتدای شمارهٔ ملی نمایش داده نمی‌شود (۰۹۱۲ → 912). */
export function formatNational(national: string, country: CountryCode): string {
  const digits = digitsOnly(national);
  if (!digits) return "";

  const parsed = parsePhoneNumberFromString(digits, country);
  const formatted = parsed?.isValid()
    ? parsed.formatNational()
    : new AsYouType(country).input(digits);

  if (country === "IR" && formatted.startsWith("0")) {
    return formatted.slice(1).trimStart();
  }

  return formatted;
}

/** نمایش عمومی: +98 912 ••• 67 */
export function maskPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) return e164;

  const national = parsed.nationalNumber;
  const head = national.slice(0, 3);
  const tail = national.slice(-2);
  return `+${parsed.countryCallingCode} ${head} ••• ${tail}`;
}

/** نمایش کامل و خوانا در صفحهٔ پروفایل: +98 912 123 4567 */
export function displayPhone(e164: string): string {
  const parsed = parsePhoneNumberFromString(e164);
  if (!parsed) return e164;
  return `+${parsed.countryCallingCode} ${new AsYouType(parsed.country).input(
    parsed.nationalNumber,
  )}`;
}

export function phoneExample(country: CountryCode): string {
  if (country === "IR") return "912 123 4567";
  if (country === "US" || country === "CA") return "(202) 555-0123";
  if (country === "DE") return "0151 23456789";
  if (country === "GB") return "07400 123456";
  return "شمارهٔ موبایل";
}
