import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Method.module.css";

const steps = [
  {
    letter: "S",
    title: "موقعیت",
    question: "کجا هستم؟",
    text: "یک موقعیت واقعی را وارد شو: سفارش غذا، آشنایی با یک نفر تازه، مصاحبهٔ کاری. هدف روشن است — در این لحظه باید چه چیزی بگویی.",
    photo: "/images/SRC/situation.webp",
    alt: "گارسون کافه در حال گرفتن سفارش",
  },
  {
    letter: "R",
    title: "واقعی",
    question: "در زندگی واقعی چه می‌شود؟",
    text: "به‌جای دیالوگ‌های کتابی، انگلیسی طبیعی را می‌بینی: اصطلاح‌های رایج، جواب‌های واقعی و همان لحنی که مردم در کوچه و بازار استفاده می‌کنند.",
    photo: "/images/SRC/real.webp",
    alt: "نمای نزدیک دو نفر در حال گفت‌وگوی طبیعی",
  },
  {
    letter: "C",
    title: "زمینه",
    question: "کِی و کجا به کارش می‌برم؟",
    text: "یاد می‌گیری هر جمله کجا، با چه کسی و در چه حال‌وهوایی درست است. «چه خبر؟» برای دوست، «چطور هستید؟» برای محیط رسمی.",
    photo: "/images/SRC/context.webp",
    alt: "سلام دوستانه در برابر احوال‌پرسی رسمی",
  },
];

export function Method() {
  return (
    <section id="how" className={styles.method} aria-labelledby="method-title">
      <div className={styles.inner}>
        <Reveal className={styles.head}>
          <span className={styles.badge}>روش لئو</span>

          <h2 id="method-title" className={styles.title}>
            روش <span>SRC</span> — سه قدم تا حرف زدن
          </h2>

          <p className={styles.subtitle}>
            یادگیری سنتی از گرامر شروع می‌شود. SRC از موقعیت شروع می‌کند:
            موقعیتی که در آن قرار می‌گیری، انگلیسی‌ای که واقعاً گفته می‌شود، و
            زمینه‌ای که آن جمله را درست می‌کند.
          </p>
        </Reveal>

        <div className={styles.cards}>
          {steps.map((step, index) => (
            <Reveal key={step.letter} delay={index * 120}>
              <article className={styles.card}>
                <div className={styles.frame}>
                  <Image
                    src={assetPath(step.photo)}
                    alt={step.alt}
                    width={800}
                    height={600}
                    sizes="(max-width: 900px) 90vw, 400px"
                    className={styles.frameImage}
                  />
                </div>

                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{step.title}</h3>
                  <p className={styles.cardQuestion}>{step.question}</p>
                  <p className={styles.cardText}>{step.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
