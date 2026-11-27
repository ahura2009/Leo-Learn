import cafeOrder from "@/app/App/data/scenarios/cafe-order.json";
import type { Level, Scenario } from "./types";

/* رجیستری سناریوها. هر فایل JSON که نوشته شود اینجا اضافه می‌شود.
   هر بیست موقعیت در «تمرین» فهرست می‌شوند؛ تا وقتی محتوای یک سناریو
   نوشته نشده، کارتش فقط نمایشی است و به درس وصل نمی‌شود. */

export type Category = "daily" | "travel" | "work" | "services" | "social";

export const categories: Category[] = [
  "daily",
  "travel",
  "work",
  "services",
  "social",
];

export const categoryLabel: Record<Category, string> = {
  daily: "روزمره",
  travel: "سفر",
  work: "کار",
  services: "سلامت و خدمات",
  social: "روابط",
};

export const categoryHint: Record<Category, string> = {
  daily: "کارهایی که هر روز تکرار می‌شوند",
  travel: "از فرودگاه تا رزرو اتاق",
  work: "جلسه، همکار و مصاحبه",
  services: "پزشک، بانک، خانه و تعمیر",
  social: "گفت‌وگو با آدم‌های اطراف",
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
  /* ---------- روزمره ---------- */
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
    slug: "clothing",
    title: "پرو در فروشگاه لباس",
    summary: "اندازه گرفتن، پرسیدن رنگ دیگر و تصمیم دربارهٔ خرید.",
    category: "daily",
    level: "A2",
    minutes: 9,
    photo: "/images/scenarios/clothing.webp",
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

  /* ---------- سفر ---------- */
  {
    slug: "airport",
    title: "در فرودگاه",
    summary: "تحویل بار، سؤال دربارهٔ گیت و گذر از کنترل بلیت.",
    category: "travel",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/airport.webp",
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
    slug: "taxi",
    title: "گرفتن تاکسی",
    summary: "گفتن مقصد، پرسیدن کرایه و هماهنگ کردن مسیر.",
    category: "travel",
    level: "A1",
    minutes: 8,
    photo: "/images/scenarios/taxi.webp",
    available: false,
  },
  {
    slug: "address",
    title: "پرسیدن آدرس",
    summary: "نشانی را بپرس، جهت‌ها را بفهم و مسیر را تکرار کن.",
    category: "travel",
    level: "A1",
    minutes: 9,
    photo: "/images/scenarios/address.webp",
    available: false,
  },

  /* ---------- کار ---------- */
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
  {
    slug: "meeting-room",
    title: "هماهنگی یک جلسه",
    summary: "پیشنهاد زمان، جمع‌بندی تصمیم‌ها و تقسیم کارها.",
    category: "work",
    level: "B2",
    minutes: 13,
    photo: "/images/scenarios/meeting-room.webp",
    available: false,
  },
  {
    slug: "colleague",
    title: "گفت‌وگو با همکار",
    summary: "کمک خواستن، توضیح یک مشکل و تشکر از همکاری.",
    category: "work",
    level: "B1",
    minutes: 11,
    photo: "/images/scenarios/colleague.webp",
    available: false,
  },

  /* ---------- سلامت و خدمات ---------- */
  {
    slug: "doctor",
    title: "مراجعه به پزشک",
    summary: "شرح دادن علائم، شنیدن توصیه و پرسیدن دارو.",
    category: "services",
    level: "A2",
    minutes: 12,
    photo: "/images/scenarios/doctor.webp",
    available: false,
  },
  {
    slug: "pharmacy",
    title: "خرید از داروخانه",
    summary: "نسخه دادن، پرسیدن نحوهٔ مصرف و مقدار دوز.",
    category: "services",
    level: "A1",
    minutes: 8,
    photo: "/images/scenarios/pharmacy.webp",
    available: false,
  },
  {
    slug: "bank",
    title: "کارهای بانکی",
    summary: "باز کردن حساب، کارت گم‌شده و پیگیری پرداخت.",
    category: "services",
    level: "B1",
    minutes: 12,
    photo: "/images/scenarios/bank.webp",
    available: false,
  },
  {
    slug: "repair",
    title: "پیگیری تعمیر",
    summary: "توضیح خرابی، پرسیدن هزینه و گرفتن وقت تحویل.",
    category: "services",
    level: "B2",
    minutes: 11,
    photo: "/images/scenarios/repair.webp",
    available: false,
  },
  {
    slug: "apartment",
    title: "اجارهٔ خانه",
    summary: "پرسیدن اجاره، بازدید خانه و مذاکرهٔ شرایط.",
    category: "services",
    level: "B2",
    minutes: 14,
    photo: "/images/scenarios/apartment.webp",
    available: false,
  },

  /* ---------- روابط ---------- */
  {
    slug: "family",
    title: "گفت‌وگو با خانواده",
    summary: "تعریف کردن از روز، پرسیدن حال و برنامهٔ آخر هفته.",
    category: "social",
    level: "A2",
    minutes: 10,
    photo: "/images/scenarios/family.webp",
    available: false,
  },
  {
    slug: "first-meeting",
    title: "آشنایی با یک نفر تازه",
    summary: "شروع گفت‌وگو، معرفی خودت و پرسیدن چند سؤال ساده.",
    category: "social",
    level: "A1",
    minutes: 10,
    photo: "/images/scenarios/meeting.webp",
    available: false,
  },
  {
    slug: "misunderstanding",
    title: "رفع سوءتفاهم",
    summary: "عذرخواهی، توضیح منظور و بازگرداندن گفت‌وگو به مسیر.",
    category: "social",
    level: "B1",
    minutes: 13,
    photo: "/images/scenarios/misunderstanding.webp",
    available: false,
  },
  {
    slug: "complaint",
    title: "اعتراض و شکایت",
    summary: "مؤدبانه اعتراض کن، دلیل بیاور و راه‌حل بخواه.",
    category: "social",
    level: "B2",
    minutes: 12,
    photo: "/images/scenarios/protest.webp",
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

/** سناریوی بعدی در ترتیب تمرین (حتی اگر محتوایش نوشته نشده باشد). */
export function nextScenario(slug: string): ScenarioMeta | null {
  const index = scenarioMeta.findIndex((item) => item.slug === slug);
  if (index === -1) return null;
  return scenarioMeta[index + 1] ?? null;
}
