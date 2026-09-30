import type { ButtonHTMLAttributes, ReactNode } from "react";

const variantClasses = {
  primary:
    "border-transparent bg-[var(--button-primary-background)] text-[var(--button-primary-text)] hover:bg-[var(--color-dark-navy)] active:bg-[var(--color-dark-navy)]",
  secondary:
    "border-transparent bg-[var(--button-secondary-background)] text-[var(--button-secondary-text)] hover:bg-[#e2eaff] active:bg-[#d5e0ff]",
  outline:
    "border-[var(--button-outline-border)] bg-[var(--button-outline-background)] text-[var(--button-outline-text)] hover:bg-[var(--color-navy-tint)] active:bg-[#e2eaff]",
  ghost:
    "border-transparent bg-[var(--button-ghost-background)] text-[var(--button-ghost-text)] hover:bg-[var(--color-navy-tint)] active:bg-[#e2eaff]",
} as const;

type ButtonVariant = keyof typeof variantClasses;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-[var(--button-height)] items-center justify-center rounded-[var(--button-radius)] border px-5 text-center font-[var(--text-button-weight)] text-[length:var(--text-button-size)] leading-[var(--text-button-line-height)] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export type { ButtonProps, ButtonVariant };
