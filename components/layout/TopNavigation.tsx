"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

type TopNavigationProps = {
  title: string;
  rightAction?: ReactNode;
  onBack?: () => void;
  className?: string;
};

export function TopNavigation({
  className = "",
  onBack,
  rightAction,
  title,
}: TopNavigationProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    window.history.back();
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/95 py-[var(--space-3)] backdrop-blur ${className}`}
    >
      <Container className="grid min-h-[52px] grid-cols-[52px_1fr_52px] items-center gap-[var(--space-3)]">
        <Button
          aria-label="Go back"
          className="h-[52px] w-[52px] px-0"
          onClick={handleBack}
          variant="ghost"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
            <path
              d="M15.78 5.22a.75.75 0 0 1 0 1.06L10.06 12l5.72 5.72a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z"
              fill="currentColor"
            />
          </svg>
        </Button>
        <Typography variant="h3" as="h1" className="truncate text-center">
          {title}
        </Typography>
        <div className="flex min-h-[52px] items-center justify-end">{rightAction}</div>
      </Container>
    </header>
  );
}

export type { TopNavigationProps };
