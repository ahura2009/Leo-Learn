import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Companion.module.css";

const roles = [
  { name: "گارسون کافه", desc: "سفارش غذا و نوشیدنی" },
  { name: "مصاحبه‌گر", desc: "مصاحبهٔ شغلی و معرفی خود" },
  { name: "همکار جدید", desc: "گفت‌وگوی روزمرهٔ محیط کار" },
  { name: "پزشک", desc: "توضیح علائم و شکایت" },
];

/** آیکون سادهٔ آدم — هم‌اندازه برای همهٔ نقش‌ها */
function PersonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2" />
    </svg>
  );
}

export function Companion() {
  return (
    <section
      id="leo"
      className={styles.companion}
      aria-labelledby="companion-title"
    >
      <div className={styles.inner}>
        <Reveal className={styles.panel}>
          {/* متن — راست */}
          <div className={styles.content}>
            <span className={styles.badge}>یک همراه، هزار نقش</span>

            <h2 id="companion-title" className={styles.title}>
              لئو نقش <span className={styles.titleAccent}>طرف مقابل</span>
              <br />
              را بازی می‌کند
            </h2>

            <p className={styles.text}>
              هر موقعیتی یک آدم می‌خواهد. لئو همان آدم می‌شود — گارسون،
              مصاحبه‌گر، همکار یا پزشک — و انگلیسی جواب می‌دهد تا تو در امنیت
              کامل تمرین کنی.
            </p>

            <ul className={styles.roles}>
              {roles.map((role) => (
                <li key={role.name} className={styles.role}>
                  <span className={styles.roleAvatar}>
                    <PersonIcon />
                  </span>
                  <div>
                    <div className={styles.roleName}>{role.name}</div>
                    <div className={styles.roleDesc}>{role.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* تصویر — چپ */}
          <div className={styles.media}>
            <span className={styles.mediaGlow} aria-hidden="true" />
            <div className={styles.mediaFrame}>
              <Image
                src={assetPath("/images/leo-barista.png")}
                alt="لئو با پیش‌بند گارسون کافه"
                width={1230}
                height={1278}
                sizes="440px"
                className={styles.mediaImage}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
