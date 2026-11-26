"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { avatarById } from "../lib/avatars";
import styles from "./Avatar.module.css";

/* آواتار کاربر: تصویر لئو یا حرف اول نام روی گرادیان انتخابی. */
export function Avatar({
  id,
  name,
  size = 88,
}: {
  id: string | null | undefined;
  name: string;
  size?: number;
}) {
  const avatar = avatarById(id);
  const style = {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.32),
  };

  if (avatar.id === "leo") {
    return (
      <span className={styles.leo} style={style}>
        <Image
          src={assetPath("/images/leo-avatar.webp")}
          alt=""
          width={200}
          height={200}
          className={styles.image}
        />
      </span>
    );
  }

  return (
    <span
      className={styles.swatch}
      style={{
        ...style,
        background: `linear-gradient(150deg, ${avatar.from}, ${avatar.to})`,
      }}
      role="img"
      aria-label={`آواتار ${avatar.label} برای ${name}`}
    >
      <Glyph id={avatar.id} size={Math.round(size * 0.46)} />
    </span>
  );
}

/* نشانهٔ ساده و یکتا برای هر آواتار — بدون ایموجی تا در هر سیستمی یکی باشد. */
function Glyph({ id, size }: { id: string; size: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "rgba(11, 18, 32, 0.78)",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (id === "sun") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
      </svg>
    );
  }
  if (id === "sky") {
    return (
      <svg {...common}>
        <path d="M7 18h9a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.6 1.2A3 3 0 0 0 7 18z" />
      </svg>
    );
  }
  if (id === "mint") {
    return (
      <svg {...common}>
        <path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14" />
        <path d="M5 19c3-4 6-6 10-7" />
      </svg>
    );
  }
  if (id === "rose") {
    return (
      <svg {...common}>
        <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3.5l2.3 5 5.2.7-3.8 3.8.9 5.4-4.6-2.6-4.6 2.6.9-5.4L4.5 9.2l5.2-.7z" />
    </svg>
  );
}
