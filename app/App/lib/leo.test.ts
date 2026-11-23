import assert from "node:assert/strict";
import { test } from "node:test";
import { judge, normalize, similarity } from "./leo.ts";
import type { Turn } from "./types.ts";

const turn: Turn = {
  leo: "Hi! What can I get for you?",
  leoFa: "سلام! چی براتون بیارم؟",
  target: "Can I get a latte please",
  accept: ["latte", "can i get", "how much"],
  nudges: ["اول قیمت را بپرس.", "بگو: Can I get a latte, please?"],
};

test("یک کلمهٔ تنهایی فقط با کلیدواژه پذیرفته می‌شود", () => {
  /* رابط، پیام کوتاه‌تر از دو کلمه را قبل از judge می‌گیرد؛
     اما خود تابع با کلیدواژه «latte» پاسخ را می‌پذیرد. */
  assert.equal(judge("latte", turn), "accept");
});

test("جملهٔ کامل سفارش پذیرفته می‌شود", () => {
  assert.equal(judge("can i get a latte", turn), "accept");
});

test("پرسیدن قیمت هم کلیدواژهٔ پذیرفته‌شده است", () => {
  assert.equal(judge("how much is it", turn), "accept");
});

test("جملهٔ بی‌ربط off می‌شود", () => {
  assert.equal(judge("the weather is nice today", turn), "off");
});

test("جملهٔ نیمه‌کاره close می‌شود", () => {
  assert.equal(judge("i would like a tea", turn), "close");
});

test("نرمال‌سازی آپاستروف و علائم را پاک می‌کند", () => {
  assert.equal(normalize("  I’d  like a LATTE!! "), "i'd like a latte");
});

test("شباهت توکنی نسبت درست می‌دهد", () => {
  /* پاسخ هدف شش توکن است؛ ورودی پنج‌تایی پنج‌تایش را دارد */
  assert.equal(similarity("can i get a latte", turn.target), 5 / 6);
  assert.equal(similarity("latte", turn.target), 1 / 6);
});
