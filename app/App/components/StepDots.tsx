import styles from "./StepDots.module.css";

type StepDotsProps = {
  /** ۴ مرحلهٔ درس + نتیجه */
  total: number;
  current: number;
};

export function StepDots({ total, current }: StepDotsProps) {
  return (
    <div className={styles.dots} aria-hidden="true">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`${styles.dot} ${index === current ? styles.active : ""} ${
            index < current ? styles.done : ""
          }`}
        />
      ))}
    </div>
  );
}
