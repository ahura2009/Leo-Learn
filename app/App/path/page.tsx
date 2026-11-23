"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireProfile } from "../hooks/useRequireProfile";
import { useApp } from "../components/AppProvider";
import { scenarioMeta } from "../lib/scenarios";
import { levelLabel } from "../lib/types";
import { assetPath } from "@/lib/asset-path";
import ui from "../components/Ui.module.css";
import styles from "./path.module.css";

export default function PathPage() {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={ui.page}>
      <header className={ui.head}>
        <span className={ui.eyebrow}>مسیر</span>
        <h1 className={ui.title}>از کافه تا مصاحبهٔ کاری</h1>
        <p className={ui.lead}>
          شش سناریو، به ترتیب سختی. هر کدام که تمام شود، بعدی باز می‌شود.
        </p>
      </header>

      <ul className={styles.list}>
        {scenarioMeta.map((item, index) => {
          const saved = progress.scenarios[item.slug];
          const status = saved?.completedAt
            ? "تمام‌شده"
            : saved
              ? "نصفه"
              : item.available
                ? "شروع‌نشده"
                : "به‌زودی";

          const body = (
            <>
              <div className={styles.thumb}>
                {item.photo ? (
                  <Image
                    src={assetPath(item.photo)}
                    alt=""
                    width={140}
                    height={140}
                    className={styles.thumbImage}
                  />
                ) : (
                  <span className={styles.thumbFallback}>{item.level}</span>
                )}
              </div>

              <div className={styles.info}>
                <span className={styles.order}>{index + 1}</span>
                <div>
                  <p className={styles.name}>{item.title}</p>
                  <p className={ui.meta}>
                    {levelLabel[item.level]} · {item.level} · {item.minutes} دقیقه
                  </p>
                </div>
              </div>

              <span
                className={`${styles.status} ${
                  status === "تمام‌شده"
                    ? styles.done
                    : status === "نصفه"
                      ? styles.half
                      : status === "به‌زودی"
                        ? styles.soon
                        : ""
                }`}
              >
                {status}
              </span>
            </>
          );

          return (
            <li key={item.slug}>
              {item.available ? (
                <Link
                  href={`/App/scenario/${item.slug}`}
                  className={styles.row}
                >
                  {body}
                </Link>
              ) : (
                <div className={`${styles.row} ${styles.disabled}`} aria-disabled>
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
