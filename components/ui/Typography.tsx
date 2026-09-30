import type { ElementType, HTMLAttributes, ReactNode } from "react";

const variantClasses = {
  display:
    "font-[var(--text-display-weight)] text-[length:var(--text-display-size)] leading-[var(--text-display-line-height)] tracking-[-0.02em] text-[var(--color-text-primary)]",
  h1: "font-[var(--text-h1-weight)] text-[length:var(--text-h1-size)] leading-[var(--text-h1-line-height)] tracking-[-0.01em] text-[var(--color-text-primary)]",
  h2: "font-[var(--text-h2-weight)] text-[length:var(--text-h2-size)] leading-[var(--text-h2-line-height)] tracking-[-0.01em] text-[var(--color-text-primary)]",
  h3: "font-[var(--text-h3-weight)] text-[length:var(--text-h3-size)] leading-[var(--text-h3-line-height)] text-[var(--color-text-primary)]",
  bodyLarge:
    "font-[var(--text-body-large-weight)] text-[length:var(--text-body-large-size)] leading-[var(--text-body-large-line-height)] text-[var(--color-text-primary)]",
  body: "font-[var(--text-body-weight)] text-[length:var(--text-body-size)] leading-[var(--text-body-line-height)] text-[var(--color-text-primary)]",
  caption:
    "font-[var(--text-caption-weight)] text-[length:var(--text-caption-size)] leading-[var(--text-caption-line-height)] text-[var(--color-text-secondary)]",
  button:
    "font-[var(--text-button-weight)] text-[length:var(--text-button-size)] leading-[var(--text-button-line-height)] text-[var(--color-text-primary)]",
  label:
    "font-[var(--text-label-weight)] text-[length:var(--text-label-size)] leading-[var(--text-label-line-height)] text-[var(--color-text-primary)]",
} as const;

const defaultElements = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  bodyLarge: "p",
  body: "p",
  caption: "p",
  button: "span",
  label: "span",
} as const;

type TypographyVariant = keyof typeof variantClasses;

type TypographyProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children: ReactNode;
  variant?: TypographyVariant;
};

export function Typography({
  as,
  children,
  className = "",
  variant = "body",
  ...props
}: TypographyProps) {
  const Component = as ?? defaultElements[variant];

  return (
    <Component className={`${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </Component>
  );
}

export type { TypographyProps, TypographyVariant };
