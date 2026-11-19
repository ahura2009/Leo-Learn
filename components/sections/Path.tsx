import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Path.module.css";

const stats = [
  { label: "سناریوی تصویری", value: "+۵۰" },
  { label: "موقعیت", value: "+۱۲۰" },
  { label: "سطح", value: "۶" },
];

export function Path() {
  return (
    <section className={styles.path} aria-labelledby="path-title">
      <div className={styles.inner}>
        {/* تریلر — چپ */}
        <Reveal className={styles.media}>
          <span className={styles.mediaGlow} aria-hidden="true" />
          <div className={styles.mediaFrame}>
            <ImagePlaceholder
              label="تریلر مسیر یادگیری"
              detail="ویدیوی کوتاه یا مجموعه‌ای از مینی‌داستان‌های تصویری. افقی ۹۶۰×۶۴۰، با دکمهٔ پلی طلایی روی کاور"
            />
          </div>
        </Reveal>

        {/* متن — راست */}
        <Reveal className={styles.content} delay={120}>
          <span className={styles.badge}>مسیر یادگیری</span>

          <h2 id="path-title" className={styles.title}>
            از A1 تا <span className={styles.titleAccent}>C2</span>، با لئو
          </h2>

          <p className={styles.text}>
            وقتی لئو کنارته دیگر سردرگم نیستی. هر موقعیت با یک انیمیشن کوتاه
            آغاز می‌شود و بعدش می‌توانی خودت شخصیت داستان باشی!
          </p>

          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
