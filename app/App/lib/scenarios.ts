import cafeOrder from "@/app/App/data/scenarios/cafe-order.json";
import type { Level, Scenario } from "./types";

/* رجیستری سناریوها. هر فایل JSON که نوشته شود اینجا اضافه می‌شود.
   سناریوهای بدون محتوا در «مسیر» با برچسب «به‌زودی» دیده می‌شوند. */

export type Category = "daily" | "travel" | "work";

export const categoryLabel: Record<Category, string> = {
  daily: "روزمره",
  travel: "سفر",
  work: "کار",
};

export type ScenarioMeta = {
  slug: string;
  title: string;
  /** یک خط برای کارت انتخاب درس */
  summary: string;
  category: Category;
  level: Level;
  minutes: number;
  photo?: string;
  available: boolean;
};

export const scenarioMeta: ScenarioMeta[] = [
  {
    slug: "cafe-order",
    title: "سفارش در کافه",
    summary: "نوشیدنی سفارش بده، اندازه را بگو و قیمت را بپرس.",
    category: "daily",
    level: "A1",
    minutes: 11,
    photo: "/images/scenarios/cafe.webp",
    available: true,
  },
  {
    slug: "supermarket",
    title: "خرید در سوپرمارکت",
    summary: "پیدا کردن اجناس، پرسیدن جای قفسه و پرداخت در صندوق.",
    category: "daily",
    level: "A1",
    minutes: 10,
    photo: "/images/scenarios/supermarket.webp",
    available: false,
  },
  {
    slug: "first-meeting",
    title: "آشنایی با یک نفر تازه",
    summary: "شروع گفت‌وگو، معرفی خودت و پرسیدن چند سؤال ساده.",
    category: "daily",
    level: "A1",
    minutes: 10,
    photo: "/images/scenarios/meeting.webp",
    available: false,
  },
  {
    slug: "hotel-booking",
    title: "رزرو هتل",
    summary: "رزرو اتاق، پرسیدن امکانات و تأیید تاریخ‌ها.",
    category: "travel",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/hotel.webp",
    available: false,
  },
  {
    slug: "phone-call",
    title: "تماس تلفنی",
    summary: "جواب دادن به تلفن، وصل کردن تماس و پیغام گرفتن.",
    category: "daily",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/phone.webp",
    available: false,
  },
  {
    slug: "job-interview",
    title: "مصاحبهٔ کاری",
    summary: "معرفی تجربه، پاسخ به سؤال‌های رایج و پرسیدن دربارهٔ نقش.",
    category: "work",
    level: "B1",
    minutes: 14,
    photo: "/images/scenarios/interview.webp",
    available: false,
  },
];

const content: Record<string, Scenario> = {
  "cafe-order": cafeOrder as Scenario,
};

export function getScenario(slug: string): Scenario | null {
  return content[slug] ?? null;
}

export function getScenarioMeta(slug: string): ScenarioMeta | null {
  return scenarioMeta.find((item) => item.slug === slug) ?? null;
}

/** سناریوی بعدی در ترتیب مسیر (حتی اگر هنوز نوشته نشده باشد). */
export function nextScenario(slug: string): ScenarioMeta | null {
  const index = scenarioMeta.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  return scenarioMeta[index + 1] ?? null;
}
