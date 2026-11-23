import {
  lessonState,
  pickLastLesson,
  pickResumeTarget,
  pickSuggestion,
  pickTodayState,
  type LessonState,
} from "./dashboard-core";
import { getScenario, scenarioMeta } from "./scenarios";
import { currentStreak, todayKey } from "./storage";
import type { Progress } from "./types";

/* آداپتور داشبورد روی رجیستری سناریوها — تصمیم‌ها در dashboard-core است. */

export type { LessonState, Suggestion, TodayState } from "./dashboard-core";

function totalStepsFor(slug: string): number {
  const scenario = getScenario(slug);
  return (scenario ? scenario.steps.length : 4) + 1; // + نتیجه
}

export function lastLesson(progress: Progress): LessonState {
  return pickLastLesson(scenarioMeta, progress, totalStepsFor);
}

export function resumeTarget(
  progress: Progress,
  current: LessonState,
): LessonState | null {
  const states = scenarioMeta.map((meta) =>
    lessonState(meta, progress, totalStepsFor(meta.slug)),
  );
  return pickResumeTarget(states, current);
}

export const dailySuggestion = pickSuggestion;

export function todayState(
  progress: Progress,
  lesson: LessonState,
  name: string,
  date = new Date(),
) {
  return pickTodayState(
    {
      practiced: progress.days.includes(todayKey(date)),
      /* زنجیره نسبت به امروز سنجیده می‌شود، نه عدد قدیمی ذخیره‌شده */
      streak: currentStreak(progress, date),
    },
    lesson,
    name,
  );
}
