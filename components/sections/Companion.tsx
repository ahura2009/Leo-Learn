"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Companion.module.css";

/* هر نقش تصویر خودش را دارد. چرخه هر ۲ ثانیه یک‌بار جلو می‌رود
   و بعد از نقش چهارم به اولی برمی‌گردد. */
const roles = [
  {
    name: "گارسون کافه",
    desc: "سفارش غذا و نوشیدنی",
    image: "/images/leo-barista.png",
    alt: "لئو با پیش‌بند گارسون کافه",
    width: 1235,
    height: 1274,
  },
  {
    name: "مصاحبه‌گر",
    desc: "مصاحبهٔ شغلی و معرفی خود",
    image: "/images/leo-interview.png",
    alt: "لئو در نقش مصاحبه‌گر شغلی",
    width: 1254,
    height: 1254,
  },
  {
    name: "همکار جدید",
    desc: "گفت‌وگوی روزمرهٔ محیط کار",
    image: "/images/leo-colleague.png",
    alt: "لئو در نقش همکار جدید",
    width: 1235,
    height: 1274,
  },
  {
    name: "پزشک",
    desc: "توضیح علائم و شکایت",
    image: "/images/leo-doctor.png",
    alt: "لئو در نقش پزشک",
    width: 1235,
    height: 1274,
  },
];

const ROTATE_MS = 2000;

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
  const [active, setActive] = useState(0);
  // وقتی کاربر خودش نقشی را انتخاب می‌کند، چرخش خودکار متوقف می‌شود
  const [manual, setManual] = useState(false);
  const current = roles[active];

  useEffect(() => {
    if (manual) return;

    // کاربرانی که حرکت را کم می‌خواهند، چرخش خودکار نبینند
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % roles.length);
    }, ROTATE_MS);

    return () => clearInterval(id);
  }, [manual]);

  const select = (index: number) => {
    setActive(index);
    setManual(true);
  };

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
              {roles.map((role, index) => (
                <li key={role.name}>
                  <button
                    type="button"
                    onClick={() => select(index)}
                    aria-pressed={active === index}
                    className={`${styles.role} ${
                      active === index ? styles.roleActive : ""
                    }`}
                  >
                    <span className={styles.roleAvatar}>
                      <PersonIcon />
                    </span>
                    <span className={styles.roleBody}>
                      <span className={styles.roleName}>{role.name}</span>
                      <span className={styles.roleDesc}>{role.desc}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* تصویر — چپ */}
          <div className={styles.media}>
            <span className={styles.mediaGlow} aria-hidden="true" />
            <div className={styles.mediaFrame}>
              {/* هر چهار تصویر رندر می‌شوند و فقط تصویر فعال دیده
                  می‌شود. این‌طور همه از قبل بارگذاری شده‌اند و هیچ
                  تعویضی خالی نمی‌ماند. */}
              {roles.map((role, index) => (
                <Image
                  key={role.name}
                  src={assetPath(role.image)}
                  alt={index === active ? role.alt : ""}
                  width={role.width}
                  height={role.height}
                  sizes="440px"
                  aria-hidden={index !== active}
                  priority
                  className={`${styles.mediaImage} ${
                    index === active ? styles.mediaImageActive : ""
                  }`}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
