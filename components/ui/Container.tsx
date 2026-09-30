import type { HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Container({
  children,
  className = "",
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-[var(--space-4)] sm:px-[var(--space-6)] lg:px-[var(--space-8)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export type { ContainerProps };
