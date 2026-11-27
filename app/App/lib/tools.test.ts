import assert from "node:assert/strict";
import { test } from "node:test";
import {
  analyzeText,
  countSyllables,
  dueWords,
  gradeWord,
  isDue,
  readingTimeLabel,
  reviewDueDate,
  reviewQueue,
  searchGlossary,
  STARTER_PACK,
  type WordRecord,
} from "./tools.ts";

const NOW = new Date("2026-11-27T10:00:00.000Z");
const DAY = 24 * 60 * 60 * 1000;

function record(seen: number, lastSeenAt: Date): WordRecord {
  return { fa: "معنی", seen, lastSeenAt: lastSeenAt.toISOString() };
}

/* ---------- هجا ---------- */

test("شمارش هجا برای واژه‌های ساده درست است", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("make"), 1);
  assert.equal(countSyllables("table"), 2);
  assert.equal(countSyllables("beautiful"), 3);
  assert.equal(countSyllables("recommended"), 4);
  assert.equal(countSyllables(""), 0);
});

/* ---------- بررسی متن ---------- */

test("متن خالی همه‌چیز صفر می‌دهد", () => {
  const result = analyzeText("");
  assert.equal(result.words, 0);
  assert.equal(result.sentences, 0);
  assert.equal(result.uniqueWords, 0);
  assert.equal(result.flesch, 0);
  assert.equal(result.readingSeconds, 0);
  assert.deepEqual(result.longWords, []);
});

test("شمردن واژه و جمله و واژهٔ یکتا", () => {
  const result = analyzeText("I like tea. I like coffee too!");
  assert.equal(result.words, 7);
  assert.equal(result.sentences, 2);
  assert.equal(result.uniqueWords, 5);
  assert.equal(result.wordsPerSentence, 3.5);
});

test("متن ساده آسان‌تر از متن سخت تخمین زده می‌شود", () => {
  const easy = analyzeText("I go home. I eat food. I see a cat.");
  const hard = analyzeText(
    "Consequently, the administration's preliminary assessment " +
      "of the environmental implications was substantially inconclusive.",
  );
  assert.ok(
    easy.flesch > hard.flesch,
    `آسان ${easy.flesch} باید بیشتر از سخت ${hard.flesch} باشد`,
  );
  assert.ok(["A1", "A2"].includes(easy.level));
  assert.ok(["C1", "C2", "B2"].includes(hard.level));
});

test("واژه‌های بلند پرتکرار اول می‌آیند", () => {
  const result = analyzeText(
    "The recommendation was clear. Another recommendation arrived.",
  );
  assert.ok(result.longWords.some((item) => item.word === "recommendation"));
  assert.equal(result.longWords[0].word, "recommendation");
  assert.equal(result.longWords[0].count, 2);
});

test("زمان خواندن با تعداد واژه بالا می‌رود", () => {
  const short = analyzeText("Hello.");
  const long = analyzeText("one two three four five six seven eight nine ten");
  assert.ok(long.readingSeconds > short.readingSeconds);
});

/* ---------- مرور فاصله‌دار ---------- */

test("واژهٔ تازه همان لحظه سررسید است", () => {
  const entry = record(0, NOW);
  assert.equal(isDue(entry, NOW), true);
  assert.equal(reviewDueDate(entry).getTime(), NOW.getTime());
});

test("بعد از یک بار «بلدم» یک روز عقب می‌افتد", () => {
  const entry = gradeWord(record(0, NOW), true, NOW);
  assert.equal(entry.seen, 1);
  assert.equal(reviewDueDate(entry).getTime(), NOW.getTime() + DAY);
  assert.equal(isDue(entry, NOW), false);
  assert.equal(isDue(entry, new Date(NOW.getTime() + DAY)), true);
});

test("فاصله‌ها تا سقف ۳۵ روز بالا می‌روند و بیشتر نمی‌شوند", () => {
  const far = record(20, NOW);
  assert.equal(reviewDueDate(far).getTime(), NOW.getTime() + 35 * DAY);
});

test("«دوباره» واژه را به ابتدای صف برمی‌گرداند", () => {
  const entry = gradeWord(record(4, NOW), false, NOW);
  assert.equal(entry.seen, 0);
  assert.equal(isDue(entry, NOW), true);
});

test("صف مرور فقط واژه‌های سررسیده را با محدودیت برمی‌گرداند", () => {
  const words: Record<string, WordRecord> = {
    fresh: record(0, NOW),
    later: record(1, NOW),
    ready: record(1, new Date(NOW.getTime() - 2 * DAY)),
    oldest: record(2, new Date(NOW.getTime() - 10 * DAY)),
  };

  const due = dueWords(words, NOW);
  assert.deepEqual(due, ["oldest", "ready", "fresh"]);

  const limited = reviewQueue({ ...words, more: record(0, NOW) }, NOW, 2);
  assert.equal(limited.length, 2);
  assert.deepEqual(limited, ["oldest", "ready"]);
});

/* ---------- دیکشنری ---------- */

test("جست‌وجوی انگلیسی از ابتدای واژه اول می‌آید", () => {
  const results = searchGlossary("hom");
  assert.equal(results[0].en, "home");
  assert.ok(results.some((entry) => entry.en === "home"));
});

test("جست‌وجوی فارسی هم کار می‌کند", () => {
  const results = searchGlossary("خانه");
  assert.equal(results[0].en, "home");
});

test("جست‌وجوی خالی یا بی‌نتیجه فهرست خالی می‌دهد", () => {
  assert.deepEqual(searchGlossary("   "), []);
  assert.deepEqual(searchGlossary("zzzznotaword"), []);
});

test("بستهٔ شروع بیست واژهٔ یکتا دارد", () => {
  assert.equal(STARTER_PACK.length, 20);
  assert.equal(new Set(STARTER_PACK.map((entry) => entry.en)).size, 20);
});

/* ---------- برچسب زمان ---------- */

test("برچسب زمان خواندن", () => {
  assert.equal(readingTimeLabel(0), "—");
  assert.equal(readingTimeLabel(30), "30 ثانیه");
  assert.equal(readingTimeLabel(120), "2 دقیقه");
  assert.equal(readingTimeLabel(150), "2 دقیقه و 30 ثانیه");
});
