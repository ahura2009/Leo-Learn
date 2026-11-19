import { Reveal } from "@/components/ui/Reveal";
import styles from "./Why.module.css";

const cards = [
  {
    title: "از دانستن تا گفتن",
    text: "جمله‌ای که بلدی را باید با صدای خودت به کار ببری.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    title: "فرصت تمرین بیشتر",
    text: "همیشه کسی نیست که برای چند دقیقه گفت‌وگو در دسترس باشد.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "فضای امن برای اشتباه",
    text: "تمرین بدون نگرانی از قضاوت، شروع صحبت را آسان‌تر می‌کند.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    title: "مسیر روشن",
    text: "بدانی امروز چه تمرینی انجام دهی و بعد سراغ چه چیزی بروی.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 18h4a2 2 0 0 0 2-2v-4a2 2 0 0 1 2-2h6" />
        <path d="m13 6 4 4-4 4" />
      </svg>
    ),
  },
];

export function Why() {
  return (
    <section id="features" className={styles.why} aria-labelledby="why-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <h2 id="why-title" className={styles.title}>
            کلی کتاب خوندی،
            <br />
            ولی نمی‌تونی حرف بزنی؟
          </h2>

          <p className={styles.subtitle}>
            دانستن واژه و گرامر کافی نیست؛ برای صحبت کردن باید فرصت تمرین داشته
            باشی.
          </p>
        </Reveal>

        <div className={styles.cards}>
          {cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 90}>
              <article className={styles.card}>
                <span className={styles.cardIcon}>{card.icon}</span>
                <h3 className={styles.cardTitle}>{card.title}</h3>
                <p className={styles.cardText}>{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
