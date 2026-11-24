import assert from "node:assert/strict";
import { test } from "node:test";
import {
  digitsOnly,
  formatNational,
  maskPhone,
  normalizePhone,
  splitInternational,
  toLatinDigits,
} from "./phone.ts";

test("شمارهٔ ایرانی با صفر ابتدایی به E.164 تبدیل می‌شود", () => {
  const result = normalizePhone("0912 345 6789", "IR");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.e164, "+989123456789");
    assert.equal(result.country, "IR");
  }
});

test("ارقام فارسی پذیرفته و به لاتین تبدیل می‌شوند", () => {
  assert.equal(toLatinDigits("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789");
  assert.equal(digitsOnly("۰۹۱۲-۳۴۵"), "0912345");

  const result = normalizePhone("۰۹۱۲۳۴۵۶۷۸۹", "IR");
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.e164, "+989123456789");
});

test("شمارهٔ کوتاه یا نامعتبر رد می‌شود", () => {
  assert.equal(normalizePhone("", "IR").ok, false);
  assert.equal(normalizePhone("0912", "IR").ok, false);
  assert.equal(normalizePhone("0000000000", "IR").ok, false);
});

test("شمارهٔ بین‌المللی با + کد کشور خودش را حفظ می‌کند", () => {
  const result = normalizePhone("+49 151 23456789", "IR");
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.country, "DE");
    assert.equal(result.e164, "+4915123456789");
  }

  const split = splitInternational("+1 202 555 0123");
  assert.deepEqual(split, { country: "US", national: "2025550123" });
});

test("نمایش و ماسک شماره", () => {
  assert.equal(formatNational("9123456789", "IR"), "0912 345 6789");
  assert.equal(maskPhone("+989123456789"), "+98 912 ••• 89");
});
