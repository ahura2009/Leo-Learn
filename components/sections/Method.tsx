import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Method.module.css";

const steps = [
  {
    letter: "S",
    title: "موقعیت",
    question: "کجا هستم؟",
    text: "یک موقعیت واقعی را وارد شو: سفارش غذا، آشنایی با یک نفر تازه، مصاحبهٔ کاری. هدف روشن است — در این لحظه باید چه چیزی بگویی.",
    image: "صحنهٔ کافه با میز و گارسون",
    imageDetail: "عکس واقعی، افقی ۸۰۰×۶۰۰ — موقعیتی که کاربر داخلش قرار می‌گیرد",
  },
  {
    letter: "R",
    title: "واقعی",
    question: "در زندگی واقعی چه می‌شود؟",
    text: "به‌جای دیالوگ‌های کتابی، انگلیسی طبیعی را می‌بینی: اصطلاح‌های رایج، جواب‌های واقعی و همان لحنی که مردم در کوچه و بازار استفاده می‌کنند.",
    image: "نمای نزدیک گفت‌وگوی واقعی",
    imageDetail: "عکس افقی ۸۰۰×۶۰۰ — دو نفر در حال حرف زدن، نه پوز عکاسی",
  },
  {
    letter: "C",
    title: "زمینه",
    question: "کِی و کجا به کارش می‌برم؟",
    text: "یاد می‌گیری هر جمله کجا، با چه کسی و در چه حال‌وهوایی درست است. «چه خبر؟» برای دوست، «چطور هستید؟» برای محیط رسمی.",
    image: "مقایسهٔ دو موقعیت: دوستانه و رسمی",
    imageDetail: "عکس افقی ۸۰۰×۶۰۰ — یا دو تصویر کنار هم با فاصلهٔ روشن",
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
                  <ImagePlaceholder
                    label={step.image}
                    detail={step.imageDetail}
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
