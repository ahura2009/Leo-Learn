import type { Progress } from "./types";

/* هستهٔ منطق داشبورد — بدون وابستگی اجرایی، تا تنها باشد و مستقیم تست شود.
   تاریخ و زنجیره را آداپتور (dashboard.ts) از storage می‌دهد. */

const stepNames = ["گوش دادن", "انتخاب کردن", "ساختن جمله", "گفت‌وگو", "دیدن نتیجه"];

/** کمینهٔ چیزی که داشبورد از یک سناریو لازم دارد. */
export type LessonMeta = {
  slug: string;
  title: string;
  level: "A1" | "A2" | "B1";
  minutes: number;
  photo?: string;
  available: boolean;
};

export type LessonState = {
  meta: LessonMeta;
  /** صفر تا یک */
  progress: number;
  stepIndex: number;
  totalSteps: number;
  finished: boolean;
  started: boolean;
  /** برچسب فارسی مرحلهٔ بعدی، برای جملهٔ لئو */
  nextStep: string;
  lastActiveAt: string | null;
};

export function lessonState(
  meta: LessonMeta,
  progress: Progress,
  totalSteps: number,
): LessonState {
  const saved = progress.scenarios[meta.slug];
  const stepIndex = saved ? Math.min(saved.stepIndex, totalSteps - 1) : 0;
  const finished = Boolean(saved?.completedAt);
  const started = Boolean(saved) && !finished;

  return {
    meta,
    progress: finished ? 1 : stepIndex / (totalSteps - 1),
    stepIndex,
    totalSteps,
    finished,
    started,
    nextStep: stepNames[stepIndex] ?? stepNames[0],
    lastActiveAt: saved?.updatedAt ?? saved?.completedAt ?? saved?.startedAt ?? null,
  };
}

/** درسی که کاربر آخر از همه سراغش رفته؛ اگر هیچ درسی نبود، اولی. */
export function pickLastLesson(
  metas: LessonMeta[],
  progress: Progress,
  totalStepsFor: (slug: string) => number,
): LessonState {
  const states = metas.map((meta) =>
    lessonState(meta, progress, totalStepsFor(meta.slug)),
  );

  const touched = states.filter((state) => progress.scenarios[state.meta.slug]);
  if (touched.length === 0) return states[0];

  return touched.reduce((best, state) =>
    (state.lastActiveAt ?? "") > (best.lastActiveAt ?? "") ? state : best,
  );
}

/** درس نصفه‌ای غیر از درس جاری — برای میان‌بر «ادامه بده». */
export function pickResumeTarget(
  states: LessonState[],
  current: LessonState,
): LessonState | null {
  if (!current.finished) return null;
  return (
    states.find(
      (state) =>
        state.meta.available &&
        state.meta.slug !== current.meta.slug &&
        state.started,
    ) ?? null
  );
}

export type Suggestion = {
  kind: "continue" | "review" | "listen" | "start";
  title: string;
  body: string;
  href: string;
  cta: string;
  minutes: number;
};

/** تمرین پیشنهادی روز — بین گزینه‌های معقولِ همان حالت می‌چرخد. */
export function pickSuggestion(
  progress: Progress,
  lesson: LessonState,
  date = new Date(),
): Suggestion {
  const wordCount = Object.keys(progress.words).length;
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );

  const options: Suggestion[] = [];

  /* درس نیمه‌کاره همیشه اولویت دارد — پیشنهاد باید آن را تمام کند،
     نه اینکه بعضی روزها جایش را به گوش‌دادن بدهد. */
  if (lesson.started) {
    return {
      kind: "continue",
      title: "ادامهٔ درس نیمه‌کاره",
      body: `از مرحلهٔ «${lesson.nextStep}» ادامه بده — چند دقیقه بیشتر نمی‌برد.`,
      href: `/App/scenario/${lesson.meta.slug}/lesson`,
      cta: "ادامه بده",
      minutes: 4,
    };
  }

  if (wordCount > 0) {
    options.push({
      kind: "review",
      title: `مرور ${Math.min(wordCount, 5)} واژه`,
      body: "واژه‌های درس قبل را یک بار بشنو و معنی‌شان را یادت بیاور.",
      href: "/App/progress",
      cta: "مرور واژه‌ها",
      minutes: 3,
    });
  }

  options.push({
    kind: "listen",
    title: "یک دیالوگ را گوش کن",
    body: "بدون فشار؛ فقط گوش بده و بعد همان جمله‌ها را بلند تکرار کن.",
    href: `/App/scenario/${lesson.meta.slug}/lesson`,
    cta: "گوش دادن",
    minutes: 2,
  });

  if (!lesson.started) {
    options.push({
      kind: "start",
      title: "شروع اولین سناریو",
      body: "سفارش در کافه — سفارش دادن و پرسیدن قیمت، در یازده دقیقه.",
      href: `/App/scenario/${lesson.meta.slug}/lesson`,
      cta: "شروع کن",
      minutes: 11,
    });
  }

  return options[dayNumber % options.length];
}

export type TodayState = {
  practiced: boolean;
  streak: number;
  /** جملهٔ لئو برای بالای داشبورد */
  leoLine: string;
};

export function pickTodayState(
  stats: { practiced: boolean; streak: number },
  lesson: LessonState,
  name: string,
): TodayState {
  const { practiced, streak } = stats;

  let leoLine: string;
  if (!lesson.started && !lesson.finished) {
    leoLine = `${name}، من لئو هستم. برای شروع، کافه را برات آماده کرده‌ام — یازده دقیقه.`;
  } else if (lesson.started) {
    leoLine = `دیشب کجا ماندیم؟ مرحلهٔ «${lesson.nextStep}» منتظرت است.`;
  } else if (practiced) {
    leoLine = "امروز کارت را انجام دادی. یک مرور کوتاه واژه‌ها بدجوری می‌چسبد.";
  } else {
    leoLine = "درس قبلی را تمام کردی. امروز یک مرور کوتاه، همان را سرِ جا نگه می‌دارد.";
  }

  return {
    practiced,
    streak,
    leoLine,
  };
}
