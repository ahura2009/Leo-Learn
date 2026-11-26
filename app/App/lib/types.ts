/* تایپ‌های مشترک اپ — مطابق بخش ۲ و ۳ سند ساخت */

export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Goal =
  | "travel"
  | "work"
  | "daily"
  | "study"
  | "immigration"
  | "exam"
  | "media"
  | "family";

export type Phrase = { en: string; fa: string };
export type Line = { who: "leo" | "you"; en: string; fa: string };

export type Turn = {
  leo: string;
  leoFa: string;
  target: string;
  accept: string[];
  nudges: string[];
};

export type Step =
  | { type: "listen"; lines: Line[] }
  | {
      type: "choose";
      promptFa: string;
      options: string[];
      answer: number;
      noteFa?: string;
    }
  | {
      type: "build";
      promptFa: string;
      tiles: string[];
      answer: string;
      noteFa?: string;
    }
  | { type: "roleplay"; turns: Turn[] };

export type Scenario = {
  slug: string;
  level: Level;
  title: string;
  minutes: number;
  setting: string;
  story: string;
  goal: string;
  goalFa: string;
  phras: Phrase[];
  words: Phrase[];
  steps: Step[];
};

export type Profile = {
  name: string;
  level: Level;
  goal: Goal;
  avatar: string;
  bio: string;
  dailyMinutes: number;
  createdAt: string;
  onboardedAt: string;
};

export type ScenarioProgress = {
  stepIndex: number;
  chooseAnswers: Record<number, number>;
  buildAnswer: Record<number, string>;
  turns: { turnIndex: number; attempts: number; done: boolean }[];
  startedAt: string;
  /** آخرین فعالیت در این سناریو — مبنای «آخرین درس» در داشبورد */
  updatedAt?: string;
  completedAt?: string;
};

export type Progress = {
  version: 2;
  scenarios: Record<string, ScenarioProgress>;
  words: Record<string, { fa: string; seen: number; lastSeenAt: string }>;
  days: string[];
  streak: number;
};

/** همهٔ سطح‌های CEFR، از مبتدی تا مسلط */
export const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const levelLabel: Record<Level, string> = {
  A1: "مبتدی",
  A2: "پیش‌متوسط",
  B1: "متوسط",
  B2: "متوسط بالا",
  C1: "پیشرفته",
  C2: "مسلط",
};

export const GOALS: Goal[] = [
  "travel",
  "work",
  "daily",
  "study",
  "immigration",
  "exam",
  "media",
  "family",
];

export const goalLabel: Record<Goal, string> = {
  travel: "سفر",
  work: "کار",
  daily: "روزمره",
  study: "تحصیل",
  immigration: "مهاجرت",
  exam: "آزمون",
  media: "فیلم و پادکست",
  family: "خانواده و دوستان",
};
