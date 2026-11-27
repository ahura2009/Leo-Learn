import type { Level } from "./types";

/* فهرست موضوع‌های گرامر — فعلاً فقط شناسنامهٔ هر موضوع.
   محتوای درس (کارت‌های مرور) در گام بعد اضافه می‌شود؛ تا آن موقع
   هر ردیف فقط نام، سطح، یک توضیح کوتاه و یک نمونهٔ کاربرد دارد. */

export type GrammarGroup = "tenses" | "structure";

export type GrammarTopic = {
  slug: string;
  /** نام انگلیسی قاعده — همان چیزی که کاربر در منابع می‌بیند */
  name: string;
  /** نام فارسی */
  fa: string;
  level: Level;
  group: GrammarGroup;
  /** توضیح یک‌خطی: قاعده به زبان ساده */
  summary: string;
  /** نمونهٔ کاربرد — پیش‌نمایش درس */
  preview: { en: string; fa: string };
  /** تعداد کارت‌های مرور که این موضوع خواهد داشت */
  cards: number;
  /** آیا محتوای درس نوشته شده است */
  ready: boolean;
};

export const groupLabel: Record<GrammarGroup, string> = {
  tenses: "زمان‌ها",
  structure: "ساختار جمله",
};

export const grammarGroups: GrammarGroup[] = ["tenses", "structure"];

export const grammarTopics: GrammarTopic[] = [
  {
    slug: "past-simple",
    name: "Past Simple",
    fa: "گذشتهٔ ساده",
    level: "A1",
    group: "tenses",
    summary: "کاری که در گذشته تمام شد، با زمانی که مشخص است.",
    preview: {
      en: "I walked to school yesterday.",
      fa: "دیروز پیاده به مدرسه رفتم.",
    },
    cards: 14,
    ready: false,
  },
  {
    slug: "present-continuous",
    name: "Present Continuous",
    fa: "حال استمراری",
    level: "A1",
    group: "tenses",
    summary: "کاری که همین حالا در جریان است، یا قرار است به‌زودی بیاید.",
    preview: {
      en: "She is reading a book right now.",
      fa: "او همین حالا دارد کتاب می‌خواند.",
    },
    cards: 12,
    ready: false,
  },
  {
    slug: "present-perfect",
    name: "Present Perfect",
    fa: "حال کامل",
    level: "A2",
    group: "tenses",
    summary: "اتفاقی در گذشته که نتیجه‌اش به حالا می‌رسد؛ زمانش مهم نیست.",
    preview: {
      en: "I have lost my keys.",
      fa: "کلیدهایم را گم کرده‌ام.",
    },
    cards: 16,
    ready: false,
  },
  {
    slug: "past-perfect",
    name: "Past Perfect",
    fa: "گذشتهٔ کامل",
    level: "B1",
    group: "tenses",
    summary: "کاری که پیش از یک اتفاق گذشتهٔ دیگر تمام شده بود.",
    preview: {
      en: "The train had left before we arrived.",
      fa: "قطار قبل از رسیدن ما رفته بود.",
    },
    cards: 10,
    ready: false,
  },
  {
    slug: "conditionals",
    name: "Conditionals",
    fa: "جملات شرطی",
    level: "B1",
    group: "structure",
    summary: "اگر… آن‌وقت… — از شرط واقعی تا فرضیِ محال.",
    preview: {
      en: "If it rains, we will stay home.",
      fa: "اگر باران بیاید، خانه می‌مانیم.",
    },
    cards: 18,
    ready: false,
  },
  {
    slug: "modals",
    name: "Modals",
    fa: "افعال وجهی",
    level: "A2",
    group: "structure",
    summary: "can، must، should — برای توانایی، اجبار و توصیه.",
    preview: {
      en: "You should see a doctor.",
      fa: "بهتر است پیش دکتر بروی.",
    },
    cards: 12,
    ready: false,
  },
  {
    slug: "articles",
    name: "Articles",
    fa: "حرف تعریف a / an / the",
    level: "A1",
    group: "structure",
    summary: "کِی a می‌آید، کِی the، و کِی هیچ‌کدام لازم نیست.",
    preview: {
      en: "I saw a dog. The dog was brown.",
      fa: "یک سگ دیدم. آن سگ قهوه‌ای بود.",
    },
    cards: 15,
    ready: false,
  },
];

export function getGrammarTopic(slug: string): GrammarTopic | null {
  return grammarTopics.find((topic) => topic.slug === slug) ?? null;
}

export const totalCards = grammarTopics.reduce(
  (sum, topic) => sum + topic.cards,
  0,
);
