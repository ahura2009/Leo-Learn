import type { Level } from "./types";

/* منطق خالص ابزارها — بدون React و بدون دسترسی به مرورگر.
   چهار ابزار: بررسی متن، دیکشنری، فلش‌کارت و تلفظ.
   همه‌چیز روی دستگاه خود کاربر اجرا می‌شود؛ هیچ متنی جایی فرستاده نمی‌شود. */

export type ToolSlug = "text" | "dictionary" | "cards" | "pronounce";

export type ToolMeta = {
  slug: ToolSlug;
  name: string;
  en: string;
  summary: string;
};

export const tools: ToolMeta[] = [
  {
    slug: "text",
    name: "بررسی متن",
    en: "Text check",
    summary:
      "متن انگلیسی‌ات را بچسبان؛ شمار واژه‌ها، سختی جمله‌ها و سطح تقریبی‌اش را می‌بینی.",
  },
  {
    slug: "dictionary",
    name: "دیکشنری",
    en: "Dictionary",
    summary:
      "انگلیسی یا فارسی جست‌وجو کن، معنی و تلفظ را ببین و واژه را به فلش‌کارت‌ها اضافه کن.",
  },
  {
    slug: "cards",
    name: "فلش‌کارت",
    en: "Flashcards",
    summary:
      "واژه‌های دفترت را در فاصله‌های رو به افزایش مرور کن تا در حافظه بمانند.",
  },
  {
    slug: "pronounce",
    name: "تلفظ",
    en: "Pronunciation",
    summary:
      "واژه یا جمله را در سه سرعت بشنو و واژه‌به‌واژه تکرار کن.",
  },
];

export function getTool(slug: string): ToolMeta | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/* ---------- ۱. بررسی متن ---------- */

export type TextAnalysis = {
  words: number;
  sentences: number;
  uniqueWords: number;
  chars: number;
  /** میانگین واژه در هر جمله */
  wordsPerSentence: number;
  /** میانگین هجا در هر واژه */
  syllablesPerWord: number;
  /** نمرهٔ خوانایی فلش (۰ تا ۱۰۰، بالاتر یعنی آسان‌تر) */
  flesch: number;
  /** سطح تخمینی متن بر پایهٔ همان نمره */
  level: Level;
  /** ثانیه؛ با سرعت خواندن آهستهٔ یک زبان‌آموز */
  readingSeconds: number;
  /** واژه‌های بلندِ متن، پرتکرارترها اول */
  longWords: { word: string; count: number }[];
};

const WORD_PATTERN = /[a-z]+(?:['’][a-z]+)?/g;
const SENTENCE_PATTERN = /[^.!?]+[.!?]*/g;
const READING_WORDS_PER_MINUTE = 140;

/** تخمین هجا با گروه‌های واکه — برای یک تحلیل تقریبی کافی است. */
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length === 0) return 0;
  if (clean.length <= 3) return 1;

  const groups = clean.match(/[aeiouy]+/g)?.length ?? 0;
  const silentE = clean.endsWith("e") && !clean.endsWith("le") ? 1 : 0;
  return Math.max(1, groups - silentE);
}

function levelFromFlesch(score: number): Level {
  if (score >= 85) return "A1";
  if (score >= 75) return "A2";
  if (score >= 65) return "B1";
  if (score >= 52) return "B2";
  if (score >= 35) return "C1";
  return "C2";
}

export function analyzeText(text: string): TextAnalysis {
  const tokens = (text.toLowerCase().match(WORD_PATTERN) ?? []).filter(
    (word) => word.length > 0,
  );
  const words = tokens.length;

  const sentenceParts = (text.match(SENTENCE_PATTERN) ?? [])
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  const sentences = Math.max(sentenceParts.length, words > 0 ? 1 : 0);

  const uniqueWords = new Set(tokens).size;
  const syllables = tokens.reduce((sum, word) => sum + countSyllables(word), 0);

  const wordsPerSentence = sentences > 0 ? words / sentences : 0;
  const syllablesPerWord = words > 0 ? syllables / words : 0;

  const flesch =
    words > 0 && sentences > 0
      ? Math.round(
          Math.min(
            100,
            Math.max(
              0,
              206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord,
            ),
          ),
        )
      : 0;

  const counts = new Map<string, number>();
  for (const word of tokens) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const longWords = [...counts.entries()]
    .filter(([word]) => word.replace(/[^a-z]/g, "").length >= 8)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0].length - a[0].length;
    })
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    words,
    sentences,
    uniqueWords,
    chars: text.length,
    wordsPerSentence: Math.round(wordsPerSentence * 10) / 10,
    syllablesPerWord: Math.round(syllablesPerWord * 100) / 100,
    flesch,
    level: levelFromFlesch(flesch),
    readingSeconds:
      words > 0
        ? Math.max(1, Math.round((words / READING_WORDS_PER_MINUTE) * 60))
        : 0,
    longWords,
  };
}

/** متن نمونه برای دکمهٔ «یک نمونه» در بررسی متن. */
export const SAMPLE_TEXT =
  "Last weekend I took the train to a small town near the coast. " +
  "The weather was perfect, so I walked along the beach and stopped at a little cafe for lunch. " +
  "I ordered a sandwich and a cup of coffee, and the waiter recommended a local dessert that was surprisingly delicious. " +
  "On the way back, I realized I had forgotten my umbrella, but fortunately it didn't rain.";

/* ---------- ۲. فلش‌کارت — مرور فاصله‌دار ---------- */

export type WordRecord = { fa: string; seen: number; lastSeenAt: string };

/* فاصلهٔ مرور بر حسب روز؛ با هر بار «بلدم» یک پله بالا می‌رود. */
export const REVIEW_DAYS = [0, 1, 3, 7, 16, 35];
const DAY_MS = 24 * 60 * 60 * 1000;

export function reviewDueDate(entry: WordRecord): Date {
  const index = Math.min(
    Math.max(Math.floor(entry.seen), 0),
    REVIEW_DAYS.length - 1,
  );
  const base = new Date(entry.lastSeenAt).getTime();
  return new Date((Number.isNaN(base) ? 0 : base) + REVIEW_DAYS[index] * DAY_MS);
}

export function isDue(entry: WordRecord, now = new Date()): boolean {
  return reviewDueDate(entry).getTime() <= now.getTime();
}

/** ثبت نتیجهٔ مرور: «بلدم» یک پله بالا، «دوباره» برمی‌گردد به اول صف. */
export function gradeWord(
  entry: WordRecord,
  remembered: boolean,
  now = new Date(),
): WordRecord {
  return {
    fa: entry.fa,
    seen: remembered ? entry.seen + 1 : 0,
    lastSeenAt: now.toISOString(),
  };
}

/** واژه‌های سررسیده، قدیمی‌ترین اول. */
export function dueWords(
  words: Record<string, WordRecord>,
  now = new Date(),
): string[] {
  return Object.entries(words)
    .filter(([, entry]) => isDue(entry, now))
    .sort((a, b) => {
      const diff =
        reviewDueDate(a[1]).getTime() - reviewDueDate(b[1]).getTime();
      return diff !== 0 ? diff : a[0].localeCompare(b[0]);
    })
    .map(([en]) => en);
}

export const REVIEW_LIMIT = 12;

export function reviewQueue(
  words: Record<string, WordRecord>,
  now = new Date(),
  limit = REVIEW_LIMIT,
): string[] {
  return dueWords(words, now).slice(0, limit);
}

/* ---------- ۳. دیکشنری ---------- */

export type Theme = "daily" | "food" | "travel" | "work" | "feeling" | "verb";

export const themeLabel: Record<Theme, string> = {
  daily: "روزمره",
  food: "غذا و نوشیدنی",
  travel: "سفر",
  work: "کار",
  feeling: "احساس",
  verb: "فعل",
};

export type GlossaryEntry = {
  en: string;
  fa: string;
  level: Level;
  theme: Theme;
};

/* واژه‌نامهٔ پایه — پرکاربردترین واژه‌های روزمره برای یک فارسی‌زبان.
   دیکشنری وقتی هم واژه‌های درس‌ها و دفتر کاربر را جست‌وجو می‌کند. */
export const glossary: GlossaryEntry[] = [
  /* روزمره */
  { en: "home", fa: "خانه", level: "A1", theme: "daily" },
  { en: "room", fa: "اتاق", level: "A1", theme: "daily" },
  { en: "door", fa: "در", level: "A1", theme: "daily" },
  { en: "window", fa: "پنجره", level: "A1", theme: "daily" },
  { en: "key", fa: "کلید", level: "A1", theme: "daily" },
  { en: "light", fa: "نور", level: "A1", theme: "daily" },
  { en: "table", fa: "میز", level: "A1", theme: "daily" },
  { en: "chair", fa: "صندلی", level: "A1", theme: "daily" },
  { en: "bed", fa: "تخت", level: "A1", theme: "daily" },
  { en: "kitchen", fa: "آشپزخانه", level: "A1", theme: "daily" },
  { en: "bathroom", fa: "حمام", level: "A1", theme: "daily" },
  { en: "street", fa: "خیابان", level: "A1", theme: "daily" },
  { en: "shop", fa: "فروشگاه", level: "A1", theme: "daily" },
  { en: "market", fa: "بازار", level: "A1", theme: "daily" },
  { en: "money", fa: "پول", level: "A1", theme: "daily" },
  { en: "price", fa: "قیمت", level: "A1", theme: "daily" },
  { en: "cheap", fa: "ارزان", level: "A2", theme: "daily" },
  { en: "expensive", fa: "گران", level: "A1", theme: "daily" },
  { en: "buy", fa: "خریدن", level: "A1", theme: "daily" },
  { en: "sell", fa: "فروختن", level: "A2", theme: "daily" },
  { en: "pay", fa: "پرداختن", level: "A2", theme: "daily" },
  { en: "bag", fa: "کیف", level: "A1", theme: "daily" },
  { en: "phone", fa: "تلفن", level: "A1", theme: "daily" },
  { en: "message", fa: "پیام", level: "A2", theme: "daily" },
  { en: "call", fa: "تماس گرفتن", level: "A2", theme: "daily" },
  { en: "address", fa: "نشانی", level: "A2", theme: "daily" },
  { en: "city", fa: "شهر", level: "A1", theme: "daily" },
  { en: "car", fa: "ماشین", level: "A1", theme: "daily" },
  { en: "bus", fa: "اتوبوس", level: "A1", theme: "daily" },
  { en: "station", fa: "ایستگاه", level: "A2", theme: "daily" },
  { en: "ticket", fa: "بلیت", level: "A1", theme: "daily" },
  { en: "road", fa: "جاده", level: "A2", theme: "daily" },
  { en: "day", fa: "روز", level: "A1", theme: "daily" },
  { en: "week", fa: "هفته", level: "A1", theme: "daily" },
  { en: "month", fa: "ماه", level: "A2", theme: "daily" },
  { en: "year", fa: "سال", level: "A1", theme: "daily" },
  { en: "today", fa: "امروز", level: "A1", theme: "daily" },
  { en: "tomorrow", fa: "فردا", level: "A1", theme: "daily" },
  { en: "yesterday", fa: "دیروز", level: "A2", theme: "daily" },
  { en: "morning", fa: "صبح", level: "A1", theme: "daily" },
  { en: "evening", fa: "عصر", level: "A1", theme: "daily" },
  { en: "night", fa: "شب", level: "A1", theme: "daily" },
  { en: "hour", fa: "ساعت", level: "A1", theme: "daily" },
  { en: "minute", fa: "دقیقه", level: "A1", theme: "daily" },

  /* غذا و نوشیدنی */
  { en: "food", fa: "غذا", level: "A1", theme: "food" },
  { en: "water", fa: "آب", level: "A1", theme: "food" },
  { en: "tea", fa: "چای", level: "A1", theme: "food" },
  { en: "coffee", fa: "قهوه", level: "A1", theme: "food" },
  { en: "milk", fa: "شیر", level: "A1", theme: "food" },
  { en: "bread", fa: "نان", level: "A1", theme: "food" },
  { en: "rice", fa: "برنج", level: "A1", theme: "food" },
  { en: "meat", fa: "گوشت", level: "A2", theme: "food" },
  { en: "chicken", fa: "مرغ", level: "A1", theme: "food" },
  { en: "fish", fa: "ماهی", level: "A1", theme: "food" },
  { en: "egg", fa: "تخم‌مرغ", level: "A1", theme: "food" },
  { en: "fruit", fa: "میوه", level: "A1", theme: "food" },
  { en: "apple", fa: "سیب", level: "A1", theme: "food" },
  { en: "orange", fa: "پرتقال", level: "A1", theme: "food" },
  { en: "banana", fa: "موز", level: "A1", theme: "food" },
  { en: "sugar", fa: "شکر", level: "A1", theme: "food" },
  { en: "salt", fa: "نمک", level: "A1", theme: "food" },
  { en: "sweet", fa: "شیرین", level: "A2", theme: "food" },
  { en: "hungry", fa: "گرسنه", level: "A1", theme: "food" },
  { en: "thirsty", fa: "تشنه", level: "A1", theme: "food" },
  { en: "breakfast", fa: "صبحانه", level: "A1", theme: "food" },
  { en: "lunch", fa: "ناهار", level: "A1", theme: "food" },
  { en: "dinner", fa: "شام", level: "A1", theme: "food" },
  { en: "restaurant", fa: "رستوران", level: "A1", theme: "food" },
  { en: "menu", fa: "منو", level: "A2", theme: "food" },
  { en: "order", fa: "سفارش دادن", level: "A2", theme: "food" },
  { en: "bill", fa: "صورت‌حساب", level: "A2", theme: "food" },
  { en: "waiter", fa: "پیشخدمت", level: "A2", theme: "food" },
  { en: "delicious", fa: "خوشمزه", level: "A2", theme: "food" },

  /* سفر */
  { en: "travel", fa: "سفر کردن", level: "A2", theme: "travel" },
  { en: "trip", fa: "سفر", level: "A2", theme: "travel" },
  { en: "hotel", fa: "هتل", level: "A2", theme: "travel" },
  { en: "airport", fa: "فرودگاه", level: "A2", theme: "travel" },
  { en: "plane", fa: "هواپیما", level: "A1", theme: "travel" },
  { en: "flight", fa: "پرواز", level: "A2", theme: "travel" },
  { en: "passport", fa: "گذرنامه", level: "A2", theme: "travel" },
  { en: "luggage", fa: "چمدان", level: "A2", theme: "travel" },
  { en: "map", fa: "نقشه", level: "A2", theme: "travel" },
  { en: "beach", fa: "ساحل", level: "A2", theme: "travel" },
  { en: "mountain", fa: "کوه", level: "A2", theme: "travel" },
  { en: "weather", fa: "هوا", level: "A2", theme: "travel" },
  { en: "rain", fa: "باران", level: "A1", theme: "travel" },
  { en: "sunny", fa: "آفتابی", level: "A2", theme: "travel" },
  { en: "cold", fa: "سرد", level: "A1", theme: "travel" },
  { en: "hot", fa: "گرم", level: "A1", theme: "travel" },
  { en: "summer", fa: "تابستان", level: "A1", theme: "travel" },
  { en: "winter", fa: "زمستان", level: "A1", theme: "travel" },
  { en: "arrive", fa: "رسیدن", level: "A2", theme: "travel" },
  { en: "leave", fa: "ترک کردن", level: "A2", theme: "travel" },
  { en: "stay", fa: "ماندن", level: "A2", theme: "travel" },

  /* کار */
  { en: "work", fa: "کار", level: "A1", theme: "work" },
  { en: "job", fa: "شغل", level: "A2", theme: "work" },
  { en: "office", fa: "دفتر", level: "A2", theme: "work" },
  { en: "meeting", fa: "جلسه", level: "A2", theme: "work" },
  { en: "boss", fa: "رئیس", level: "A2", theme: "work" },
  { en: "team", fa: "تیم", level: "A2", theme: "work" },
  { en: "project", fa: "پروژه", level: "A2", theme: "work" },
  { en: "email", fa: "ایمیل", level: "A2", theme: "work" },
  { en: "computer", fa: "کامپیوتر", level: "A1", theme: "work" },
  { en: "question", fa: "سؤال", level: "A1", theme: "work" },
  { en: "answer", fa: "پاسخ", level: "A1", theme: "work" },
  { en: "problem", fa: "مشکل", level: "A2", theme: "work" },
  { en: "help", fa: "کمک", level: "A1", theme: "work" },
  { en: "ready", fa: "آماده", level: "A2", theme: "work" },
  { en: "busy", fa: "مشغول", level: "A2", theme: "work" },
  { en: "free", fa: "آزاد", level: "A2", theme: "work" },
  { en: "start", fa: "شروع کردن", level: "A1", theme: "work" },
  { en: "finish", fa: "تمام کردن", level: "A2", theme: "work" },
  { en: "plan", fa: "برنامه", level: "A2", theme: "work" },
  { en: "important", fa: "مهم", level: "A2", theme: "work" },
  { en: "easy", fa: "آسان", level: "A1", theme: "work" },
  { en: "difficult", fa: "سخت", level: "A2", theme: "work" },

  /* احساس */
  { en: "happy", fa: "خوشحال", level: "A1", theme: "feeling" },
  { en: "sad", fa: "غمگین", level: "A1", theme: "feeling" },
  { en: "tired", fa: "خسته", level: "A1", theme: "feeling" },
  { en: "angry", fa: "عصبانی", level: "A2", theme: "feeling" },
  { en: "afraid", fa: "ترسیده", level: "A2", theme: "feeling" },
  { en: "excited", fa: "هیجان‌زده", level: "A2", theme: "feeling" },
  { en: "worried", fa: "نگران", level: "B1", theme: "feeling" },
  { en: "surprised", fa: "شگفت‌زده", level: "A2", theme: "feeling" },
  { en: "enjoy", fa: "لذت بردن", level: "A2", theme: "feeling" },
  { en: "hope", fa: "امیدوار بودن", level: "A2", theme: "feeling" },
  { en: "lonely", fa: "تنها", level: "A2", theme: "feeling" },
  { en: "calm", fa: "آرام", level: "A2", theme: "feeling" },
  { en: "beautiful", fa: "زیبا", level: "A1", theme: "feeling" },
  { en: "friendly", fa: "خوش‌برخورد", level: "A2", theme: "feeling" },

  /* فعل‌های پرکاربرد */
  { en: "go", fa: "رفتن", level: "A1", theme: "verb" },
  { en: "come", fa: "آمدن", level: "A1", theme: "verb" },
  { en: "get", fa: "گرفتن", level: "A1", theme: "verb" },
  { en: "make", fa: "ساختن", level: "A1", theme: "verb" },
  { en: "take", fa: "بردن", level: "A1", theme: "verb" },
  { en: "give", fa: "دادن", level: "A1", theme: "verb" },
  { en: "see", fa: "دیدن", level: "A1", theme: "verb" },
  { en: "look", fa: "نگاه کردن", level: "A1", theme: "verb" },
  { en: "watch", fa: "تماشا کردن", level: "A1", theme: "verb" },
  { en: "hear", fa: "شنیدن", level: "A1", theme: "verb" },
  { en: "listen", fa: "گوش دادن", level: "A1", theme: "verb" },
  { en: "speak", fa: "صحبت کردن", level: "A1", theme: "verb" },
  { en: "talk", fa: "حرف زدن", level: "A1", theme: "verb" },
  { en: "say", fa: "گفتن", level: "A1", theme: "verb" },
  { en: "tell", fa: "گفتن به کسی", level: "A1", theme: "verb" },
  { en: "ask", fa: "پرسیدن", level: "A1", theme: "verb" },
  { en: "know", fa: "دانستن", level: "A1", theme: "verb" },
  { en: "think", fa: "فکر کردن", level: "A1", theme: "verb" },
  { en: "want", fa: "خواستن", level: "A1", theme: "verb" },
  { en: "need", fa: "نیاز داشتن", level: "A1", theme: "verb" },
  { en: "find", fa: "پیدا کردن", level: "A1", theme: "verb" },
  { en: "lose", fa: "گم کردن", level: "A2", theme: "verb" },
  { en: "open", fa: "باز کردن", level: "A1", theme: "verb" },
  { en: "close", fa: "بستن", level: "A1", theme: "verb" },
  { en: "wait", fa: "منتظر ماندن", level: "A1", theme: "verb" },
  { en: "try", fa: "تلاش کردن", level: "A2", theme: "verb" },
  { en: "learn", fa: "یاد گرفتن", level: "A1", theme: "verb" },
  { en: "teach", fa: "یاد دادن", level: "A2", theme: "verb" },
  { en: "read", fa: "خواندن", level: "A1", theme: "verb" },
  { en: "write", fa: "نوشتن", level: "A1", theme: "verb" },
  { en: "cook", fa: "آشپزی کردن", level: "A2", theme: "verb" },
  { en: "eat", fa: "خوردن", level: "A1", theme: "verb" },
  { en: "drink", fa: "نوشیدن", level: "A1", theme: "verb" },
  { en: "sleep", fa: "خوابیدن", level: "A1", theme: "verb" },
  { en: "walk", fa: "پیاده رفتن", level: "A1", theme: "verb" },
  { en: "run", fa: "دویدن", level: "A1", theme: "verb" },
  { en: "drive", fa: "رانندگی کردن", level: "A1", theme: "verb" },
  { en: "play", fa: "بازی کردن", level: "A1", theme: "verb" },
  { en: "live", fa: "زندگی کردن", level: "A1", theme: "verb" },
  { en: "feel", fa: "احساس کردن", level: "A2", theme: "verb" },
  { en: "remember", fa: "به یاد آوردن", level: "A2", theme: "verb" },
  { en: "forget", fa: "فراموش کردن", level: "A2", theme: "verb" },
  { en: "choose", fa: "انتخاب کردن", level: "A2", theme: "verb" },
  { en: "change", fa: "تغییر دادن", level: "A2", theme: "verb" },
  { en: "believe", fa: "باور داشتن", level: "A2", theme: "verb" },
];

/* بیست واژه برای «شروع سریع» دفتر خالی — از واژه‌نامه، روزمره‌ترین‌ها. */
export const STARTER_PACK: GlossaryEntry[] = glossary.slice(0, 20);

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

/** جست‌وجو در واژه‌نامه بر اساس انگلیسی یا فارسی. */
export function searchGlossary(query: string): GlossaryEntry[] {
  const needle = normalize(query);
  if (!needle) return [];

  const starts: GlossaryEntry[] = [];
  const contains: GlossaryEntry[] = [];

  for (const entry of glossary) {
    const en = normalize(entry.en);
    const fa = normalize(entry.fa);

    if (en.startsWith(needle) || fa.startsWith(needle)) starts.push(entry);
    else if (en.includes(needle) || fa.includes(needle)) contains.push(entry);
  }

  return [...starts, ...contains];
}

/** ثانیه را به زمان خواندن خوانا تبدیل می‌کند. */
export function readingTimeLabel(seconds: number): string {
  if (seconds <= 0) return "—";
  if (seconds < 60) return `${seconds} ثانیه`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest > 0 ? `${minutes} دقیقه و ${rest} ثانیه` : `${minutes} دقیقه`;
}

/* ---------- ۴. تلفظ ---------- */

export type PracticePhrase = {
  text: string;
  fa: string;
  focus: string;
  level: Level;
};

/* جمله‌های تمرینی با یک نکتهٔ مشخص — برای شنیدن و تکرار. */
export const practicePhrases: PracticePhrase[] = [
  {
    text: "I think this is the third time.",
    fa: "فکر می‌کنم این سومین بار است.",
    focus: "صدای th در think و third",
    level: "A2",
  },
  {
    text: "She sells fresh fish at the shop.",
    fa: "او در مغازه ماهی تازه می‌فروشد.",
    focus: "صدای sh و f",
    level: "A2",
  },
  {
    text: "Could you pass me the water, please?",
    fa: "می‌شود لطفاً آب را به من بدهید؟",
    focus: "لحن مؤدبانه و اتصال could you",
    level: "A1",
  },
  {
    text: "The weather is getting better this week.",
    fa: "هوا این هفته دارد بهتر می‌شود.",
    focus: "صدای th در the، weather، this و صامت آخر week",
    level: "B1",
  },
  {
    text: "I would have called you if I had known.",
    fa: "اگر می‌دانستم زنگ می‌زدم.",
    focus: "شکل کوتاه I'd و I'd've",
    level: "B2",
  },
  {
    text: "Right, let's get started with the meeting.",
    fa: "بسیار خب، جلسه را شروع کنیم.",
    focus: "صدای t در started و ریتم جمله",
    level: "B1",
  },
];
