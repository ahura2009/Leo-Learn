"use client";

import Image from "next/image";
import Link from "next/link";
import { useRequireProfile } from "../../hooks/useRequireProfile";
import { useApp } from "../../components/AppProvider";
import { PhraseCard } from "../../components/PhraseCard";
import { getScenarioMeta } from "../../lib/scenarios";
import { levelLabel, type Scenario } from "../../lib/types";
import { assetPath } from "@/lib/asset-path";
import ui from "../../components/Ui.module.css";
import styles from "./preview.module.css";

export function ScenarioPreview({ scenario }: { scenario: Scenario }) {
  const { ready, profile } = useRequireProfile();
  const { progress } = useApp();

  if (!ready || !profile) {
    return <div className={ui.empty}>در حال آماده‌سازی…</div>;
  }

  const meta = getScenarioMeta(scenario.slug);
  const saved = progress.scenarios[scenario.slug];
  const started = Boolean(saved) && !saved?.completedAt;
  const finished = Boolean(saved?.completedAt);
  const totalSteps = scenario.steps.length + 1;
  const currentStep = Math.min((saved?.stepIndex ?? 0) + 1, totalSteps);

  return (
    <div className={ui.page}>
      <Link href="/App/practice" className={styles.back}>
        ← بازگشت به تمرین‌ها
      </Link>

      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.chips}>
            <span className={ui.levelChip}>
              {scenario.level} · {levelLabel[scenario.level]}
            </span>
            <span className={ui.chip}>{scenario.minutes} دقیقه</span>
            <span className={ui.chip}>{scenario.setting}</span>
          </div>

          <h1 className={ui.title}>{scenario.title}</h1>
          <p className={ui.lead}>{scenario.story}</p>

          <div className={styles.goal}>
            <span className={styles.goalLabel}>بعد از این درس</span>
            <p className={styles.goalText}>{scenario.goalFa}</p>
            <p className={styles.goalEn} dir="ltr">
              {scenario.goal}
            </p>
          </div>
        </div>

        {meta?.photo ? (
          <div className={styles.heroImage}>
            <Image
              src={assetPath(meta.photo)}
              alt=""
              width={640}
              height={440}
              className={styles.heroImg}
              priority
            />
          </div>
        ) : null}
      </div>

      <section className={ui.stack} aria-labelledby="phrases-title">
        <div className={ui.row}>
          <h2 id="phrases-title" className={ui.cardTitle}>
            جمله‌هایی که با خودت می‌بری
          </h2>
          <span className={ui.meta}>سه عبارت کلیدی</span>
        </div>
        <div className={ui.grid3}>
          {scenario.phras.map((phrase) => (
            <PhraseCard key={phrase.en} phrase={phrase} />
          ))}
        </div>
      </section>

      <div className={styles.cta}>
        {started ? (
          <p className={ui.meta}>
            از مرحلهٔ {currentStep} از {totalSteps - 1} ادامه می‌دهی.
          </p>
        ) : null}
        <Link
          href={`/App/scenario/${scenario.slug}/lesson`}
          className={`${ui.button} ${ui.block}`}
        >
          {finished
            ? "یک‌بار دیگر تمرین کن"
            : started
              ? "ادامه بده"
              : "شروع درس"}
        </Link>
      </div>
    </div>
  );
}
