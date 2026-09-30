"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

const levels = [
  { value: "A1", label: "Beginner" },
  { value: "A2", label: "Elementary" },
  { value: "B1", label: "Intermediate" },
  { value: "B2", label: "Upper Intermediate" },
  { value: "C1", label: "Advanced" },
] as const;

type LevelValue = (typeof levels)[number]["value"];

export default function LevelOnboardingPage() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<LevelValue | "">("");

  const handleContinue = () => {
    if (!selectedLevel) {
      return;
    }

    router.push("/onboarding/goals");
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col px-[var(--space-6)] py-[var(--space-8)]">
        <section
          aria-labelledby="level-title"
          className="flex min-h-full flex-1 flex-col"
        >
          <div
            aria-label="Onboarding progress, step 2 of 3"
            className="flex gap-[var(--space-2)]"
          >
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-border)]" />
          </div>

          <div className="pt-[var(--space-10)]">
            <Typography id="level-title" variant="display" as="h1">
              What’s your English level?
            </Typography>
            <Typography
              variant="bodyLarge"
              className="mt-[var(--space-4)] text-[var(--color-text-secondary)]"
            >
              Choose the level that feels closest to where you are today.
            </Typography>
          </div>

          <fieldset className="mt-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
            <legend className="sr-only">English level</legend>
            {levels.map((level) => {
              const isSelected = selectedLevel === level.value;

              return (
                <label key={level.value} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="english-level"
                    value={level.value}
                    checked={isSelected}
                    onChange={() => setSelectedLevel(level.value)}
                    className="sr-only"
                  />
                  <Card
                    className={`flex min-h-[72px] items-center justify-between transition-colors duration-150 ease-out ${
                      isSelected
                        ? "border-[var(--color-primary-navy)] bg-[var(--color-navy-tint)] ring-2 ring-[var(--color-primary-navy)]/10"
                        : "hover:border-[var(--color-primary-navy)] hover:bg-[var(--color-navy-tint)]"
                    }`}
                  >
                    <span className="flex items-center gap-[var(--space-4)]">
                      <span
                        className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-pill)] font-[var(--text-button-weight)] text-[length:var(--text-button-size)] leading-[var(--text-button-line-height)] ${
                          isSelected
                            ? "bg-[var(--color-primary-navy)] text-[var(--color-white)]"
                            : "bg-[var(--color-background)] text-[var(--color-primary-navy)]"
                        }`}
                      >
                        {level.value}
                      </span>
                      <Typography variant="h3" as="span">
                        {level.label}
                      </Typography>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] border ${
                        isSelected
                          ? "border-[var(--color-primary-navy)] bg-[var(--color-primary-navy)]"
                          : "border-[var(--color-border)] bg-[var(--color-white)]"
                      }`}
                    >
                      {isSelected ? (
                        <svg viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-white)]">
                          <path
                            d="m9.55 15.15 7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.06 0l-3.2-3.2a.75.75 0 0 1 1.06-1.06l2.67 2.67Z"
                            fill="currentColor"
                          />
                        </svg>
                      ) : null}
                    </span>
                  </Card>
                </label>
              );
            })}
          </fieldset>

          <div className="mt-auto flex w-full flex-col gap-[var(--space-3)] pt-[var(--space-8)]">
            <Button
              type="button"
              className="w-full"
              disabled={!selectedLevel}
              onClick={handleContinue}
            >
              Continue
            </Button>
            <form action="/onboarding" className="w-full">
              <Button type="submit" variant="ghost" className="w-full">
                Back
              </Button>
            </form>
          </div>
        </section>
      </Container>
    </main>
  );
}
