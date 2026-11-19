import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Scenarios.module.css";

type Level = "easy" | "medium" | "hard";

const levelLabel: Record<Level, string> = {
  easy: "آسان",
  medium: "متوسط",
  hard: "پیشرفته",
};

const scenarios: {
  title: string;
  level: Level;
  image: string;
  photo?: string;
}[] = [
  { title: "سفارش در کافه", level: "easy", image: "کافه با میز و فنجان", photo: "/images/scenarios/cafe.jpg" },
  { title: "خرید در سوپرمارکت", level: "easy", image: "قفسه‌های سوپرمارکت" },
  { title: "آشنایی با یک نفر تازه", level: "easy", image: "دست دادن دو نفر", photo: "/images/scenarios/meeting.jpg" },
  { title: "گرفتن آدرس", level: "easy", image: "خیابان با تابلو" },
  { title: "رزرو هتل", level: "medium", image: "لابی هتل", photo: "/images/scenarios/hotel.jpg" },
  { title: "تماس تلفنی", level: "medium", image: "گوشی در دست", photo: "/images/scenarios/phone.jpg" },
  { title: "خرید لباس", level: "medium", image: "اتاق پرو" },
  { title: "سفارش تاکسی", level: "easy", image: "تاکسی در خیابان" },
  { title: "صحبت دربارهٔ خانواده", level: "easy", image: "خانواده دور میز" },
  { title: "رفتن به داروخانه", level: "medium", image: "قفسهٔ داروخانه" },
  { title: "مصاحبهٔ کاری", level: "hard", image: "میز مصاحبه" },
  { title: "جلسهٔ کاری", level: "hard", image: "اتاق جلسه" },
  { title: "مراجعه به پزشک", level: "medium", image: "اتاق معاینه" },
  { title: "گشتن برای خانه", level: "medium", image: "نمای آپارتمان" },
  { title: "باز کردن حساب بانکی", level: "hard", image: "باجهٔ بانک", photo: "/images/scenarios/bank.jpg" },
  { title: "گفت‌وگو با همکار", level: "medium", image: "آشپزخانهٔ اداره" },
  { title: "سفر به فرودگاه", level: "medium", image: "سالن فرودگاه" },
  { title: "اعتراض به یک مشکل", level: "hard", image: "گفت‌وگوی جدی" },
  { title: "تشخیص خدمات و تعمیر", level: "medium", image: "کارگاه تعمیر" },
  { title: "توضیح یک سوءتفاهم", level: "hard", image: "دو نفر در حال توضیح" },
];

function ThumbIcon() {
  return (
    <svg
      className={styles.thumbIcon}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

export function Scenarios() {
  return (
    <section
      id="scenarios"
      className={styles.scenarios}
      aria-labelledby="scenarios-title"
    >
      <Reveal className={styles.head}>
        <span className={styles.badge}>سناریوها</span>

        <h2 id="scenarios-title" className={styles.title}>
          قبل از موقعیت واقعی، تمرینش کن
        </h2>

        <p className={styles.subtitle}>
          بیست موقعیت از زندگی روزمره — از سفارش در کافه تا مصاحبهٔ کاری. هر
          کدام یک داستان تصویری دارد و با لئو تمرین می‌شود.
        </p>
      </Reveal>

      <div className={styles.carousel}>
        <div className={styles.track}>
          {/* فهرست دو بار پشت هم می‌آید تا حلقه بی‌پایان بدون پرش ببندد.
              نسخهٔ دوم از دید screen reader پنهان است. */}
          {[0, 1].map((copy) =>
            scenarios.map((item) => (
              <Link
                key={`${copy}-${item.title}`}
                href="#scenarios"
                className={styles.card}
                aria-hidden={copy === 1}
                tabIndex={copy === 1 ? -1 : undefined}
                aria-label={`سناریوی ${item.title} — ${
                  levelLabel[item.level]
                }`}
              >
                {item.photo ? (
                  <Image
                    src={assetPath(item.photo)}
                    alt={item.title}
                    fill
                    sizes="176px"
                    className={styles.photo}
                  />
                ) : (
                  <div className={styles.thumb}>
                    <ThumbIcon />
                    <span className={styles.thumbText}>{item.image}</span>
                  </div>
                )}

                <span className={`${styles.level} ${styles[item.level]}`}>
                  {levelLabel[item.level]}
                </span>

                <h3 className={styles.cardTitle}>{item.title}</h3>
              </Link>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
