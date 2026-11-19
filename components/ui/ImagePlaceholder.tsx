import styles from "./ImagePlaceholder.module.css";

type ImagePlaceholderProps = {
  /** چه تصویری اینجا باید باشد — یک جملهٔ کوتاه و مشخص */
  label: string;
  /** جزئیات بیشتر: اندازه، حالت، چه چیزی در تصویر باشد */
  detail?: string;
};

export function ImagePlaceholder({ label, detail }: ImagePlaceholderProps) {
  return (
    <div className={styles.placeholder}>
      <span className={styles.icon}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
      </span>

      <p className={styles.label}>{label}</p>
      {detail ? <p className={styles.detail}>{detail}</p> : null}
    </div>
  );
}
