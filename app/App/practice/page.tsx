"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRequireProfile } from "../hooks/useRequireProfile";
import {
  categories,
  categoryHint,
  categoryLabel,
  scenarioMeta,
  type Category,
  type ScenarioMeta,
} from "../lib/scenarios";
import { LEVELS, levelLabel, type Level } from "../lib/types";
import { assetPath } from "@/lib/asset-path";
import ui from "../components/Ui.module.css";
import styles from "./practice.module.css";

/* فهرست تمرین — بیست موقعیت، دسته‌بندی‌شده و فیلترشدنی.
   هیچ سناریویی هنوز محتوای درس ندارد، پس کارت‌ها فقط نمایشی‌اند
   و به جای باز کردن درس، موقعیت را معرفی می‌کنند. */

const countOf = (category: Category) =>
  scenarioMeta.filter((item) => item.category === category).length;

const levels = LEVELS.filter((level) =>
  scenarioMeta.some((item) => item.level === level),
);

function CategoryIcon({ name }: { name: Category | "all" }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "all") {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="6.4" height="6.4" rx="1.8" />
        <rect x="13.6" y="4" width="6.4" height="6.4" rx="1.8" />
        <rect x="4" y="13.6" width="6.4" height="6.4" rx="1.8" />
        <rect x="13.6" y="13.6" width="6.4" height="6.4" rx="1.8" />
      </svg>
    );
  }

  if (name === "daily") {
    return (
      <svg {...common}>
        <path d="M5 9.5h10.5v4.6a4.4 4.4 0 0 1-4.4 4.4H9.4A4.4 4.4 0 0 1 5 14.1z" />
        <path d="M15.5 10.5h1.6a2.4 2.4 0 0 1 0 4.8h-1.6" />
        <path d="M8 6.5V5M11.5 6.5V4.5" />
      </svg>
    );
  }

  if (name === "travel") {
    return (
      <svg {...common}>
        <path d="M10.3 4.4c.4-1 1.9-1 2.3 0l1.5 4 4.9 2.6c.6.3.9.9.9 1.6v1.2l-5.6-1.5-.6 3.5 1.9 1.4v1.6l-2.9-.7-2.9.7v-1.6l1.9-1.4-.6-3.5L5 13.8v-1.2c0-.7.3-1.3.9-1.6l4.9-2.6z" />
      </svg>
    );
  }

  if (name === "work") {
    return (
      <svg {...common}>
        <rect x="3.6" y="7.4" width="16.8" height="12" rx="2.4" />
        <path d="M9 7.4V6a1.8 1.8 0 0 1 1.8-1.8h2.4A1.8 1.8 0 0 1 15 6v1.4" />
        <path d="M3.6 12.4h16.8" />
        <path d="M10.6 12.4v1.5h2.8v-1.5" />
      </svg>
    );
  }

  if (name === "services") {
    return (
      <svg {...common}>
        <path d="M12 20.2s-7.2-4.4-7.2-9.2A4.1 4.1 0 0 1 12 8.1a4.1 4.1 0 0 1 7.2 2.9c0 4.8-7.2 9.2-7.2 9.2z" />
        <path d="M7 12.6h2.2l1.2-2.1 1.8 3.8 1.2-2h2.6" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M4.4 6.8a2.2 2.2 0 0 1 2.2-2.2h3.1a2.2 2.2 0 0 1 2.2 2.2v2.4a2.2 2.2 0 0 1-2.2 2.2H8.2l-3.8 2.6z" />
      <path d="M11.7 9.4h3.7a2.2 2.2 0 0 1 2.2 2.2v1.9a2.2 2.2 0 0 1-2.2 2.2H14l-3.4 2.3" />
    </svg>
  );
}

function ScenarioCard({
  item,
  eager,
}: {
  item: ScenarioMeta;
  eager?: boolean;
}) {
  return (
    <li className={`${styles.item} ${styles[item.category]}`}>
      <article className={styles.card}>
        <div className={styles.media}>
          {item.photo ? (
            <Image
              src={assetPath(item.photo)}
              alt=""
              width={480}
              height={300}
              sizes="(max-width: 640px) 100vw, (max-width: 1080px) 50vw, 340px"
              loading={eager ? "eager" : "lazy"}
              className={styles.image}
            />
          ) : null}
          <span className={styles.level}>{item.level}</span>
          <span className={styles.minutes}>{item.minutes} دقیقه</span>
        </div>

        <div className={styles.body}>
          <h3 className={styles.name}>{item.title}</h3>
          <p className={styles.summary}>{item.summary}</p>

          <div className={styles.foot}>
            <span className={styles.categoryTag}>
              {categoryLabel[item.category]}
            </span>
            <span className={styles.previewTag}>
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.6 12S6 5.8 12 5.8 21.4 12 21.4 12 18 18.2 12 18.2 2.6 12 2.6 12z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
              فقط نمایش
            </span>
          </div>
        </div>
      </article>
    </li>
  );
}

export default function PracticePage() {
  const { ready, profile } = useRequireProfile();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");

  const filtered = useMemo(() => {
    const text = query.trim();
    return scenarioMeta.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (level !== "all" && item.level !== level) return false;
      if (!text) return true;
      return item.title.includes(text) || item.summary.includes(text);
    });
  }, [query, category, level]);

  const groups = useMemo(
    () =>
      categories
        .map((name) => ({
          name,
          items: filtered.filter((item) => item.category === name),
        }))
        .filter((group) => group.items.length > 0),
    [filtered],
  );

  const hasFilters = query.trim() !== "" || category !== "all" || level !== "all";

  function resetFilters() {
    setQuery("");
    setCategory("all");
    setLevel("all");
  }

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headText}>
          <span className={ui.eyebrow}>تمرین</span>
          <h1 className={styles.title}>کدام موقعیت را تمرین کنیم؟</h1>
          <p className={styles.lead}>
            بیست موقعیت واقعی، از سفارش قهوه تا مصاحبهٔ کاری. دسته را انتخاب
            کن و ببین چه موقعیتی منتظرت است — محتوای درس‌ها کمکم اضافه می‌شود.
          </p>
        </div>

        <div className={styles.heroStat}>
          <span className={styles.heroNumber}>{scenarioMeta.length}</span>
          <span className={styles.heroLabel}>موقعیت</span>
        </div>
      </header>

      {/* ---------- نوار دسته‌بندی و فیلتر ---------- */}
      <div className={styles.filters}>
        <div className={styles.railRow}>
          <div
            className={styles.rail}
            role="group"
            aria-label="دسته‌بندی موقعیت‌ها"
          >
            <button
              type="button"
              className={`${styles.tab} ${styles.all} ${
                category === "all" ? styles.tabActive : ""
              }`}
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
            >
              <span className={styles.tabIcon}>
                <CategoryIcon name="all" />
              </span>
              <span className={styles.tabLabel}>همه</span>
              <span className={styles.tabCount}>{scenarioMeta.length}</span>
            </button>

            {categories.map((name) => (
              <button
                key={name}
                type="button"
                className={`${styles.tab} ${styles[name]} ${
                  category === name ? styles.tabActive : ""
                }`}
                onClick={() => setCategory(name)}
                aria-pressed={category === name}
              >
                <span className={styles.tabIcon}>
                  <CategoryIcon name={name} />
                </span>
                <span className={styles.tabLabel}>{categoryLabel[name]}</span>
                <span className={styles.tabCount}>{countOf(name)}</span>
              </button>
            ))}
          </div>

          <span className={styles.railHint}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M7 12h10M10 18h4" />
            </svg>
            فیلتر بر اساس دسته
          </span>
        </div>

        <div className={styles.tools}>
          <label className={styles.search}>
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
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="جست‌وجوی موقعیت…"
              aria-label="جست‌وجوی موقعیت"
            />
          </label>

          <label className={styles.select}>
            <span className={styles.srOnly}>سطح</span>
            <select
              value={level}
              onChange={(event) =>
                setLevel(event.target.value as Level | "all")
              }
            >
              <option value="all">همهٔ سطوح</option>
              {levels.map((item) => (
                <option key={item} value={item}>
                  {item} · {levelLabel[item]}
                </option>
              ))}
            </select>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </label>

          {hasFilters ? (
            <button
              type="button"
              className={styles.clear}
              onClick={resetFilters}
            >
              پاک کردن
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.resultRow}>
        <span className={styles.resultCount}>
          {filtered.length === 0
            ? "نتیجه‌ای نیست"
            : filtered.length === 1
              ? "یک موقعیت"
              : `${filtered.length} موقعیت`}
        </span>
        <span className={styles.resultNote}>
          همهٔ کارت‌ها نمایشی‌اند؛ محتوای درس‌ها در راه است.
        </span>
      </div>

      {/* ---------- گروه‌های دسته‌بندی ---------- */}
      {groups.length === 0 ? (
        <div className={ui.empty}>
          <p>چیزی با این فیلتر پیدا نشد.</p>
          <button type="button" className={ui.ghost} onClick={resetFilters}>
            پاک کردن فیلترها
          </button>
        </div>
      ) : (
        groups.map((group, groupIndex) => (
          <section
            key={group.name}
            className={`${styles.group} ${styles[group.name]}`}
            aria-labelledby={`group-${group.name}`}
          >
            <header className={styles.groupHead}>
              <span className={styles.groupIcon}>
                <CategoryIcon name={group.name} />
              </span>
              <div className={styles.groupText}>
                <h2 id={`group-${group.name}`} className={styles.groupTitle}>
                  {categoryLabel[group.name]}
                </h2>
                <p className={styles.groupHint}>
                  {categoryHint[group.name]}
                </p>
              </div>
              <span className={styles.groupCount}>{group.items.length}</span>
            </header>

            <ul className={styles.grid}>
              {group.items.map((item, index) => (
                <ScenarioCard
                  key={item.slug}
                  item={item}
                  eager={groupIndex === 0 && index < 3}
                />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
