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
/** مدت انتقال در CSS — باید با transition در Companion.module.css یکی باشد */
const MOVE_MS = 1250;

/** فاصلهٔ هر نقش از نقش فعال، روی حلقه (۰ = جلو) */
function ringOffset(index: number, activeIndex: number, total: number) {
  return ((index - activeIndex) % total + total) % total;
}

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
  // نقش فعالِ قبلی — برای ترتیب لایه‌ها در طول حرکت لازم است
  const [prevActive, setPrevActive] = useState(0);
  // آیا حرکت تازه تمام شده؟ تا تمام نشود، لایه‌ها جابه‌جا نمی‌شوند
  const [settled, setSettled] = useState(true);
  // با هر انتخاب کاربر، شمارنده بالا می‌رود و تایمر از نو شروع می‌شود
  const [tick, setTick] = useState(0);
  /* وقتی کاربر نقشی را انتخاب می‌کند که چند خانه دورتر است، به‌جای
     پرش مستقیم، خانه‌به‌خانه دور حلقه می‌چرخیم. تا رسیدن به هدف،
     این مقدار شمارش معکوس گام‌های باقی‌مانده است. */
  const [stepsLeft, setStepsLeft] = useState(0);

  /* چرخش خودکار. کلیک کاربر آن را متوقف نمی‌کند — فقط از نقش
     انتخاب‌شده ادامه می‌دهد، به همین دلیل tick در وابستگی‌هاست.
     وقتی در حال گام‌برداشتن به سمت هدف هستیم، تایمر خودکار
     دخالت نمی‌کند. */
  useEffect(() => {
    if (stepsLeft > 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = setInterval(() => {
      setPrevActive(active);
      setActive((prev) => (prev + 1) % roles.length);
      setSettled(false);
    }, ROTATE_MS);

    return () => clearInterval(id);
  }, [active, tick, stepsLeft]);

  /* گام‌های انتخاب کاربر — یکی‌یکی، با همان سرعت حرکت عادی */
  useEffect(() => {
    if (stepsLeft <= 0) return;

    const id = setTimeout(() => {
      setPrevActive(active);
      setActive((prev) => (prev + 1) % roles.length);
      setSettled(false);
      setStepsLeft((n) => n - 1);
    }, MOVE_MS);

    return () => clearTimeout(id);
  }, [stepsLeft, active]);

  /* بعد از پایان حرکت، لایه‌ها به ترتیب نهایی مرتب می‌شوند.
     بین گام‌ها عجله نداریم — تا گام آخر صبر می‌کنیم. */
  useEffect(() => {
    if (settled || stepsLeft > 0) return;
    const id = setTimeout(() => setSettled(true), MOVE_MS);
    return () => clearTimeout(id);
  }, [settled, active, stepsLeft]);

  /* کلیک روی نقش.
     اگر نقش یکی جلوتر است، یک گام. اگر چند خانه دورتر است،
     همان تعداد گام دور حلقه — نه پرش مستقیم. این‌طور لئوی
     پشتی با همان حرکت دایره‌ای می‌آید جلو، نه با ظاهر شدن
     ناگهانی. */
  const select = (index: number) => {
    if (index === active) return;

    // چند گام رو به جلو لازم است تا به این نقش برسیم
    const distance =
      ((index - active) % roles.length + roles.length) % roles.length;

    setPrevActive(active);
    setStepsLeft(distance - 1);
    setActive((prev) => (prev + 1) % roles.length);
    setSettled(false);
    setTick((t) => t + 1);
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
            <div className={styles.mediaStage}>
              <span className={styles.floorGlow} aria-hidden="true" />

              <div className={styles.mediaRing}>
                {roles.map((role, index) => {
                  const offset = ringOffset(index, active, roles.length);

                  // زاویه روی حلقه: ۰ = جلو، π = ته
                  const theta = (offset / roles.length) * Math.PI * 2;
                  const cos = Math.cos(theta);
                  const sin = Math.sin(theta);
                  const depth = (1 - cos) / 2; // ۰ جلو، ۱ ته

                  /* ترتیب لایه‌ها.
                     اگر مستقیم از عمق گرفته شود، لئوی تازه انتخاب‌شده
                     همان لحظهٔ اول روی همه می‌پرد و بعد حرکت می‌کند —
                     همان «لایه‌ها روی هم می‌آیند» که دیده می‌شد.
                     راه‌حل: در طول حرکت، بزرگ‌ترین لایهٔ دو حالت (قبل و
                     بعد) را نگه می‌داریم. این‌طور هیچ لئویی روی دیگری
                     نمی‌پرد؛ فقط بعد از رسیدن، یک عنصر — همان که از جلو
                     می‌رود — عقب می‌نشیند. */
                  const zNow = roles.length - offset;
                  const zBefore =
                    roles.length -
                    ringOffset(index, prevActive, roles.length);
                  const z = settled ? zNow : Math.max(zNow, zBefore);

                  const r = (n: number) => Math.round(n * 100) / 100;

                  /* حلقهٔ پهن و کم‌ارتفاع: فاصلهٔ افقی زیاد است تا
                     لئوی چپ و راست روی لئوی وسط نیفتند، و فاصلهٔ
                     عمودی کم تا لئوی پشتی بالای جلویی بماند.
                     اندازهٔ کناری‌ها هم کوچک‌تر است تا کنار هم جا
                     شوند بدون هم‌پوشانی. */
                  const style = {
                    "--x": `${r(sin * 170)}px`,
                    "--y": `${r(depth * -72)}px`,
                    "--scale": `${r(1 - depth * 0.5)}`,
                    "--blur": `${r(depth * 1.6)}px`,
                    "--layer": `${z}`,
                  } as React.CSSProperties;

                  return (
                    <Image
                      key={role.name}
                      src={assetPath(role.image)}
                      alt={offset === 0 ? role.alt : ""}
                      width={role.width}
                      height={role.height}
                      sizes="360px"
                      aria-hidden={offset !== 0}
                      priority
                      className={`${styles.mediaImage} ${
                        offset === 0 ? styles.mediaImageActive : ""
                      }`}
                      style={style}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
