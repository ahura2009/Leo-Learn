import type { Phrase } from "../lib/types";
import { SpeakButton } from "./SpeakButton";
import styles from "./PhraseCard.module.css";

export function PhraseCard({ phrase }: { phrase: Phrase }) {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <p className={styles.en} dir="ltr">
          {phrase.en}
        </p>
        <SpeakButton text={phrase.en} compact />
      </div>
      <p className={styles.fa}>{phrase.fa}</p>
    </div>
  );
}
