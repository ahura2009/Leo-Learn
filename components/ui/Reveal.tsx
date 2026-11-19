"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "./Reveal.module.css";

type RevealProps = {
  children: ReactNode;
  /** تأخیر به میلی‌ثانیه — برای پلکانی کردن فرزندان یک ردیف */
  delay?: number;
  /** کلاس اضافی برای چیدمان (grid، flex و…) */
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // اگر کاربر حرکت را کم کرده، بدون انیمیشن نشان بده
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // هر بار که وارد دید شد روشن، و وقتی کامل بیرون رفت خاموش می‌شود
        // تا با اسکرول به بالا هم دوباره ظاهر شود.
        setVisible(entry.isIntersecting);
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // visible === null یعنی هنوز اندازه‌گیری نشده: نامرئی بمان
  const state =
    visible === null ? "" : visible ? styles.visible : styles.hidden;

  return (
    <div
      ref={ref}
      className={`${styles.reveal} ${state} ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
