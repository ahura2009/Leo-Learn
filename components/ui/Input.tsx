import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  label: ReactNode;
  id?: string;
  helperText?: ReactNode;
  errorText?: ReactNode;
  containerClassName?: string;
};

export function Input({
  className = "",
  containerClassName = "",
  disabled,
  errorText,
  helperText,
  id,
  label,
  type = "text",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = errorText ? `${inputId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex w-full flex-col gap-2 ${containerClassName}`}>
      <label
        htmlFor={inputId}
        className="font-[var(--text-label-weight)] text-[length:var(--text-label-size)] leading-[var(--text-label-line-height)] text-[var(--color-text-primary)]"
      >
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        disabled={disabled}
        aria-invalid={errorText ? true : undefined}
        aria-describedby={describedBy}
        className={`min-h-[52px] w-full rounded-[var(--radius-md)] border bg-[var(--color-white)] px-4 font-[var(--text-body-weight)] text-[length:var(--text-body-size)] leading-[var(--text-body-line-height)] text-[var(--color-text-primary)] outline-none transition-colors duration-150 ease-out placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary-navy)] focus:ring-2 focus:ring-[var(--color-gold)] focus:ring-offset-2 focus:ring-offset-[var(--color-background)] disabled:cursor-not-allowed disabled:bg-[var(--color-background)] disabled:text-[var(--color-text-muted)] ${
          errorText
            ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
            : "border-[var(--color-border)]"
        } ${className}`}
        {...props}
      />
      {errorText ? (
        <p
          id={errorId}
          className="font-[var(--text-caption-weight)] text-[length:var(--text-caption-size)] leading-[var(--text-caption-line-height)] text-[var(--color-error)]"
        >
          {errorText}
        </p>
      ) : null}
      {helperText ? (
        <p
          id={helperId}
          className="font-[var(--text-caption-weight)] text-[length:var(--text-caption-size)] leading-[var(--text-caption-line-height)] text-[var(--color-text-secondary)]"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

export type { InputProps };
