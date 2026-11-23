import cafeOrder from "@/app/App/data/scenarios/cafe-order.json";
import type { Level, Scenario } from "./types";

/* رجیستری سناریوها. هر فایل JSON که نوشته شود اینجا اضافه می‌شود.
   سناریوهای بدون محتوا در «مسیر» با برچسب «به‌زودی» دیده می‌شوند. */

export type ScenarioMeta = {
  slug: string;
  title: string;
  level: Level;
  minutes: number;
  photo?: string;
  available: boolean;
};

export const scenarioMeta: ScenarioMeta[] = [
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
    photo: "/images/scenarios/supermarket.webp",
    available: false,
  },
  {
    slug: "first-meeting",
    title: "آشنایی با یک نفر تازه",
    level: "A1",
    minutes: 10,
    photo: "/images/scenarios/meeting.webp",
    available: false,
  },
  {
    slug: "hotel-booking",
    title: "رزرو هتل",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/hotel.webp",
    available: false,
  },
  {
    slug: "phone-call",
    title: "تماس تلفنی",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/phone.webp",
    available: false,
  },
  {
    slug: "job-interview",
    title: "مصاحبهٔ کاری",
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
