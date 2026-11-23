import Image from "next/image";
import Link from "next/link";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Hero.module.css";

const bubbles = [
  "تمرین رایگان",
  "سناریوهای آماده",
  "تعیین سطح",
  "متد اختصاصی",
];

export function Hero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.inner}>
        {/* متن — سمت راست */}
        <div className={styles.content}>
          <Reveal>
            <span className={styles.badge}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3l1.9 5.3L19 10l-5.1 1.7L12 17l-1.9-5.3L5 10l5.1-1.7L12 3z" />
              </svg>
              همراه هوشمند یادگیری زبان
            </span>
          </Reveal>

          <Reveal delay={100}>
            <h1 id="hero-title" className={styles.title}>
              برای هر موقعیت،
              <br />
              <span className={styles.accent}>آماده باش</span>
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className={styles.subtitle}>
              از سفارش در کافه تا مصاحبهٔ کاری، با لئو انگلیسی حرف بزن. بازخورد
              فارسی بگیر و با تمرین‌های متناسب با سطحت ادامه بده.
            </p>
          </Reveal>

          <Reveal delay={260}>
            <div className={styles.actions}>
              <Link href="/App/onboarding" className={styles.primary}>
                رایگان شروع کن!
              </Link>
              <Link href="#how" className={styles.secondary}>
                روش آموزشی
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Leo + ابرهای فکری — سمت چپ */}
        <div className={styles.media}>
          <div className={styles.leoWrap}>
            <Image
              src={assetPath("/images/leo-hero.webp")}
              alt="لئو، همراه یادگیری زبان انگلیسی"
              width={1254}
              height={1254}
              priority
              sizes="(max-width: 1100px) 90vw, 750px"
              className={styles.mediaImage}
            />

            <ul className={styles.bubbles}>
              {bubbles.map((text, index) => (
                <li
                  key={text}
                  className={`${styles.bubble} ${styles[`bubble${index}`]}`}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
