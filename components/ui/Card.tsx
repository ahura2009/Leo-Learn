import type { HTMLAttributes, ReactNode } from "react";

const variantClasses = {
  standard:
    "rounded-[var(--card-standard-radius)] border border-[var(--color-border)] bg-[var(--card-standard-background)] p-[var(--card-standard-padding)]",
  hero: "rounded-[var(--card-hero-radius)] border border-[var(--color-border)] bg-[var(--card-hero-background)] p-[var(--card-hero-padding)]",
} as const;

type CardVariant = keyof typeof variantClasses;

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  variant?: CardVariant;
};

export function Card({
  children,
  className = "",
  variant = "standard",
  ...props
}: CardProps) {
  return (
    <div className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export type { CardProps, CardVariant };
