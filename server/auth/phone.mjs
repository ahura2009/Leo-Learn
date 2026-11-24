import { parsePhoneNumberFromString } from "libphonenumber-js";

/** شمارهٔ ورودی API را به E.164 یکسان می‌کند. */
export function normalizePhone(input, defaultCountry = "IR") {
  if (typeof input !== "string") return null;

  const trimmed = input.trim().replace(/[\s().-]/g, "");
  if (!trimmed) return null;

  const parsed = trimmed.startsWith("+")
    ? parsePhoneNumberFromString(trimmed)
    : parsePhoneNumberFromString(trimmed, defaultCountry);

  if (!parsed || !parsed.isValid()) return null;
  return parsed.number;
}
