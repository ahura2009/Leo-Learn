import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkName,
  checkPassword,
  isOtpCode,
  isPasswordValid,
  passwordStrength,
} from "./validation.ts";

test("رمز کوتاه، بدون حرف یا بدون رقم رد می‌شود", () => {
  assert.ok(checkPassword("Ab1").includes("short"));
  assert.ok(checkPassword("12345678").includes("no-letter"));
  assert.ok(checkPassword("abcdefgh").includes("no-digit"));
});

test("رمز هم‌سان با شمارهٔ موبایل رد می‌شود", () => {
  const issues = checkPassword("09123456789", "+989123456789");
  assert.ok(issues.includes("same-as-phone"));
  assert.equal(isPasswordValid("09123456789", "+989123456789"), false);
});

test("رمز مناسب پذیرفته می‌شود", () => {
  assert.equal(isPasswordValid("Salam1234", "+989123456789"), true);
  assert.equal(checkPassword("Salam1234", "+989123456789").length, 0);
});

test("قدرت رمز افزایشی است", () => {
  assert.equal(passwordStrength("").score, 0);
  assert.equal(passwordStrength("Salam1234").score, 2);
  assert.equal(passwordStrength("Salam1234!").score, 3);
});

test("نام‌ها بر اساس طول و کاراکترها بررسی می‌شوند", () => {
  assert.equal(checkName(""), "empty");
  assert.equal(checkName("س"), "short");
  assert.equal(checkName("سارا"), null);
  assert.equal(checkName("Sara Smith"), null);
  assert.equal(checkName("Sara123"), "chars");
});

test("کد شش‌رقمی", () => {
  assert.equal(isOtpCode("123456"), true);
  assert.equal(isOtpCode("12345"), false);
  assert.equal(isOtpCode("12345a"), false);
});
