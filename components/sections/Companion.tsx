"use client";

import { useCallback, useEffect, useState } from "react";
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
    image: "/images/Leo/leo-barista.webp",
    alt: "لئو با پیش‌بند گارسون کافه",
    width: 1235,
    height: 1274,
  },
  {
    name: "مصاحبه‌گر",
    desc: "مصاحبهٔ شغلی و معرفی خود",
    image: "/images/Leo/leo-interview.webp",
    alt: "لئو در نقش مصاحبه‌گر شغلی",
    width: 1254,
    height: 1254,
  },
  {
    name: "همکار جدید",
    desc: "گفت‌وگوی روزمرهٔ محیط کار",
    image: "/images/Leo/leo-colleague.webp",
    alt: "لئو در نقش همکار جدید",
    width: 1235,
    height: 1274,
  },
  {
    name: "پزشک",
    desc: "توضیح علائم و شکایت",
    image: "/images/Leo/leo-doctor.webp",
    alt: "لئو در نقش پزشک",
    width: 1235,
    height: 1274,
  },
];

const COUNT = roles.length;
/** زاویهٔ هر کارت روی حلقه */
const STEP_DEG = 360 / COUNT;

const ROTATE_MS = 2000;
/** مدت انتقال در CSS — باید با transition در Companion.module.css یکی باشد */
const MOVE_MS = 1250;

/* هر کارت روی حلقه می‌چرخد و هم‌زمان در جای خودش کمی برمی‌گردد تا رو به
   دوربین بماند. اگر پادچرخش را کامل بدهیم کارت هیچ‌وقت زاویه نمی‌گیرد
   و سه‌بعدی دیده نمی‌شود؛ اگر ندهیم، کارت مثل وجه استوانه از ۹۰ درجه
   می‌گذرد و پشتش ظاهر می‌شود. راه میانه: زاویهٔ هر کارت را از سینوس
   موقعیتش بگیر — جلو و ته صفر، دو طرف در بیشترین حد. این‌طور زاویه
   همیشه در این بازه می‌ماند، متقارن است، و با حرکت حلقه پیوسته عوض
   می‌شود. */
const TURN = 32;

/** بلندشدن کارت پشتی — معادل کج‌بودن جزئی محور حلقه (درصدِ بلندی کارت) */
const LIFT = 17;

const REDUCED = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return window.matchMedia(REDUCED).matches;
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
  /* شمارندهٔ گام‌ها. هیچ‌وقت به صفر برنمی‌گردد و فقط بالا می‌رود، تا
     زاویهٔ حلقه پیوسته بماند و کارت‌ها دور بزنند، نه اینکه از یک لبهٔ
     صفحه به لبهٔ دیگر بپرند. همیشه با active هم‌ارز است (mod ۴). */
  const [phase, setPhase] = useState(0);
  /* وقتی کاربر نقشی را انتخاب می‌کند که چند خانه دورتر است، به‌جای
     پرش مستقیم، خانه‌به‌خانه دور حلقه می‌چرخیم. تا رسیدن به هدف،
     این مقدار شمارش معکوس گام‌های باقی‌مانده است. */
  const [stepsLeft, setStepsLeft] = useState(0);
  // با هر انتخاب کاربر، شمارنده بالا می‌رود و تایمر خودکار از نو شروع می‌شود
  const [tick, setTick] = useState(0);

  const step = useCallback(() => {
    setPhase((p) => p + 1);
    setActive((a) => (a + 1) % COUNT);
  }, []);

  /* چرخش خودکار. کلیک کاربر آن را متوقف نمی‌کند — فقط از نقش
     انتخاب‌شده ادامه می‌دهد، به همین دلیل tick در وابستگی‌هاست.
     وقتی در حال گام‌برداشتن به سمت هدف هستیم، تایمر خودکار
     دخالت نمی‌کند. */
  useEffect(() => {
    if (stepsLeft > 0) return;
    if (prefersReducedMotion()) return;

    const id = setInterval(step, ROTATE_MS);
    return () => clearInterval(id);
  }, [phase, tick, stepsLeft, step]);

  /* گام‌های انتخاب کاربر — یکی‌یکی، با همان سرعت حرکت عادی */
  useEffect(() => {
    if (stepsLeft <= 0) return;

    const id = setTimeout(() => {
      step();
      setStepsLeft((n) => n - 1);
    }, MOVE_MS);

    return () => clearTimeout(id);
  }, [stepsLeft, phase, step]);

  /* کلیک روی نقش.
     اگر نقش یکی جلوتر است، یک گام. اگر چند خانه دورتر است،
     همان تعداد گام دور حلقه — نه پرش مستقیم. این‌طور لئوی پشتی با
     همان چرخش حلقه می‌آید جلو، نه با ظاهر شدن ناگهانی. */
  const select = (index: number) => {
    if (index === active) return;

    // چند گام رو به جلو لازم است تا به این نقش برسیم
    const distance = ((index - active) % COUNT + COUNT) % COUNT;

    if (prefersReducedMotion()) {
      setPhase((p) => p + distance);
      setActive(index);
      setStepsLeft(0);
    } else {
      setStepsLeft(distance - 1);
      step();
    }
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
                  /* موقعیت کارت روی حلقه. با هر گام ۹۰ درجه کم می‌شود،
                     پس زاویه همیشه پیوسته است و کارت مسیر کمانی را
                     طی می‌کند، نه خط راست. */
                  const posDeg = (index - phase) * STEP_DEG;

                  // زاویهٔ نرمال‌شده در بازهٔ ‎-۱۸۰..۱۸۰‎ برای محاسبهٔ عمق
                  const norm = (((posDeg % 360) + 540) % 360) - 180;
                  const rad = (norm * Math.PI) / 180;
                  const depth = (1 - Math.cos(rad)) / 2; // ۰ جلو، ۱ ته
                  /* زاویهٔ کارت دور محور خودش. از --pos کم می‌شود تا
                     موقعیت کارت روی حلقه عوض نشود؛ فقط سرِ جای خودش
                     می‌گردد. */
                  const turnDeg = TURN * Math.sin(rad);

                  const r = (n: number) => Math.round(n * 1000) / 1000;
                  const style = {
                    "--pos": `${r(posDeg)}deg`,
                    "--psi": `${r(turnDeg - posDeg)}deg`,
                    "--lift": `${r(-depth * LIFT)}%`,
                    "--scale": `${r(1 - depth * 0.4)}`,
                    "--blur": `${r(depth * 3.2)}px`,
                    /* عمق با تیره‌شدن نشان داده می‌شود، نه شفافیت. با
                       شفافیت، کارت‌های لایه‌های پشتی از روی هم دیده
                       می‌شدند و وسط حرکت تصویر گِل می‌شد. */
                    "--alpha": `${r(1 - depth * 0.18)}`,
                    "--dim": `${r(1 - depth * 0.42)}`,
                    /* ترتیب لایه‌ها از عمق می‌آید، نه از ترتیب DOM. بدون
                       این، لئوی پشتی روی لئوی جلو نقاشی می‌شود. مقدار
                       اعشاری نیست (z-index صحیح می‌خواهد) و با همان مدت
                       حرکت میان‌یابی می‌شود تا وسط راه نپرد. */
                    "--z": `${Math.round(160 - depth * 120)}`,
                  } as React.CSSProperties;

                  return (
                    <Image
                      key={role.name}
                      src={assetPath(role.image)}
                      alt={index === active ? role.alt : ""}
                      width={role.width}
                      height={role.height}
                      sizes="min(62vw, 400px)"
                      aria-hidden={index !== active}
                      loading="eager"
                      preload={index === 0}
                      className={`${styles.mediaImage} ${
                        index === active ? styles.mediaImageActive : ""
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
