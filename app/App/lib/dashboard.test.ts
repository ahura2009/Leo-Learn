import assert from "node:assert/strict";
import { test } from "node:test";
import {
  lessonState,
  pickLastLesson,
  pickResumeTarget,
  pickSuggestion,
  pickTodayState,
  type LessonMeta,
} from "./dashboard-core.ts";
import { currentStreak, todayKey } from "./storage.ts";
import type { Progress } from "./types.ts";

function empty(): Progress {
  return { version: 2, scenarios: {}, words: {}, days: [], streak: 0 };
}

const metas: LessonMeta[] = [
  {
    slug: "cafe-order",
    title: "سفارش در کافه",
    level: "A1",
    minutes: 11,
    photo: "/images/scenarios/cafe.webp",
    available: true,
  },
  {
    slug: "supermarket",
    title: "خرید در سوپرمارکت",
    level: "A1",
    minutes: 10,
    available: true,
  },
];

const totalSteps = () => 5;
const DAY = new Date("2026-11-24T09:00:00.000Z");

test("کاربر تازه: سناریوی اول، شروع‌نشده", () => {
  const lesson = pickLastLesson(metas, empty(), totalSteps);
  assert.equal(lesson.meta.slug, "cafe-order");
  assert.equal(lesson.started, false);
  assert.equal(lesson.finished, false);
  assert.equal(lesson.progress, 0);
});

test("آخرین درس بر اساس updatedAt انتخاب می‌شود", () => {
  const progress = empty();
  progress.scenarios["cafe-order"] = {
    stepIndex: 1,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-20T10:00:00.000Z",
    updatedAt: "2026-11-20T10:05:00.000Z",
  };

  const lesson = pickLastLesson(metas, progress, totalSteps);
  assert.equal(lesson.meta.slug, "cafe-order");
  assert.equal(lesson.started, true);
  assert.ok(lesson.progress > 0 && lesson.progress < 1);
});

test("درس تازه‌تر جای درس قدیمی‌تر را می‌گیرد", () => {
  const progress = empty();
  progress.scenarios["cafe-order"] = {
    stepIndex: 3,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-20T10:00:00.000Z",
    updatedAt: "2026-11-20T10:05:00.000Z",
  };
  progress.scenarios["supermarket"] = {
    stepIndex: 1,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-23T10:00:00.000Z",
    updatedAt: "2026-11-23T10:05:00.000Z",
  };

  assert.equal(pickLastLesson(metas, progress, totalSteps).meta.slug, "supermarket");
});

test("درس تمام‌شده کامل علامت می‌خورد", () => {
  const progress = empty();
  progress.scenarios["cafe-order"] = {
    stepIndex: 4,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-22T10:00:00.000Z",
    completedAt: "2026-11-22T10:12:00.000Z",
  };

  const lesson = pickLastLesson(metas, progress, totalSteps);
  assert.equal(lesson.finished, true);
  assert.equal(lesson.progress, 1);
});

test("میان‌بر ادامه فقط درس نصفهٔ دیگر را برمی‌دارد", () => {
  const progress = empty();
  progress.scenarios["cafe-order"] = {
    stepIndex: 4,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-22T10:00:00.000Z",
    completedAt: "2026-11-22T10:12:00.000Z",
  };
  progress.scenarios["supermarket"] = {
    stepIndex: 2,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-23T10:00:00.000Z",
    updatedAt: "2026-11-23T10:06:00.000Z",
  };

  const current = lessonState(metas[0], progress, 5);
  const resume = pickResumeTarget(
    metas.map((meta) => lessonState(meta, progress, 5)),
    current,
  );
  assert.equal(resume?.meta.slug, "supermarket");
});

test("پیشنهاد درس نصفه، «ادامه» است", () => {
  const progress = empty();
  progress.scenarios["cafe-order"] = {
    stepIndex: 2,
    chooseAnswers: {},
    buildAnswer: {},
    turns: [],
    startedAt: "2026-11-23T10:00:00.000Z",
    updatedAt: "2026-11-23T10:06:00.000Z",
  };

  const lesson = pickLastLesson(metas, progress, totalSteps);
  const suggestion = pickSuggestion(progress, lesson, DAY);
  assert.equal(suggestion.kind, "continue");
  assert.match(suggestion.href, /cafe-order\/lesson$/);
});

test("پیشنهاد روز قطعی است", () => {
  const lesson = pickLastLesson(metas, empty(), totalSteps);
  const first = pickSuggestion(empty(), lesson, DAY);
  const second = pickSuggestion(empty(), lesson, DAY);
  assert.equal(first.kind, second.kind);
  assert.equal(first.title, second.title);
});

test("مرور واژه در چرخهٔ پیشنهادها می‌آید", () => {
  const progress = empty();
  progress.words["please"] = {
    fa: "لطفاً",
    seen: 1,
    lastSeenAt: "2026-11-23T10:00:00.000Z",
  };

  const lesson = pickLastLesson(metas, progress, totalSteps);
  const kinds = new Set<string>();
  for (let day = 0; day < 7; day += 1) {
    const date = new Date(DAY.getTime() + day * 86_400_000);
    kinds.add(pickSuggestion(progress, lesson, date).kind);
  }
  assert.ok(kinds.has("review"));
});

test("وضعیت امروز: تمرین امروز و زنجیرهٔ واقعی", () => {
  const progress = empty();
  progress.days = ["2026-11-23", "2026-11-24"];
  progress.streak = 2;

  const today = pickTodayState(
    { practiced: progress.days.includes("2026-11-24"), streak: 2 },
    pickLastLesson(metas, progress, totalSteps),
    "سارا",
  );
  assert.equal(today.practiced, true);
  assert.equal(today.streak, 2);
  assert.match(today.leoLine, /سارا|مرور|کافه/);
});

test("زنجیرهٔ کهنه صفر نمایش داده می‌شود", () => {
  const progress = empty();
  progress.days = ["2026-11-10"];
  progress.streak = 4;

  /* همان قاعده‌ای که آداپتور استفاده می‌کند */
  assert.equal(currentStreak(progress, DAY), 0);
  assert.equal(todayKey(DAY), "2026-11-24");
});
