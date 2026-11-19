"use client";

import { useState } from "react";
import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Reveal } from "@/components/ui/Reveal";
import styles from "./Companion.module.css";

/* هر نقش می‌تواند تصویر مخصوص خودش را داشته باشد.
   نقش‌هایی که هنوز عکسی ندارند، تصویر پیش‌فرض (گارسون) را نشان می‌دهند. */
const roles = [
  {
    name: "گارسون کافه",
    desc: "سفارش غذا و نوشیدنی",
    image: "/images/leo-barista.png",
    alt: "لئو با پیش‌بند گارسون کافه",
    width: 1230,
    height: 1278,
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
    image: "/images/leo-barista.png",
    alt: "لئو با پیش‌بند گارسون کافه",
    width: 1230,
    height: 1278,
  },
  {
    name: "پزشک",
    desc: "توضیح علائم و شکایت",
    image: "/images/leo-barista.png",
    alt: "لئو با پیش‌بند گارسون کافه",
    width: 1230,
    height: 1278,
  },
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
  const [active, setActive] = useState(0);
  const current = roles[active];

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
                    onClick={() => setActive(index)}
                    onMouseEnter={() => setActive(index)}
                    onFocus={() => setActive(index)}
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
              {/* تصویرهای دیگر از قبل بارگذاری می‌شوند تا لحظهٔ کلیک
                  روی «مصاحبه‌گر» تصویر خالی نماند. */}
              {roles
                .filter((role) => role.image !== current.image)
                .map((role) => (
                  <Image
                    key={`pre-${role.name}`}
                    src={assetPath(role.image)}
                    alt=""
                    width={role.width}
                    height={role.height}
                    sizes="1px"
                    aria-hidden="true"
                    className={styles.preload}
                  />
                ))}

              {/* کلید روی نام نقش است تا با هر تغییر، تصویر دوباره
                  ساخته شود و انتقال محو انجام شود. */}
              <Image
                key={current.image + current.name}
                src={assetPath(current.image)}
                alt={current.alt}
                width={current.width}
                height={current.height}
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
