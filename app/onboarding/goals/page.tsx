"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assetPath } from "@/lib/asset-path";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

const goals = ["Speaking", "Vocabulary", "Listening", "Grammar", "Everything"] as const;

type GoalValue = (typeof goals)[number];

export default function GoalsOnboardingPage() {
  const router = useRouter();
  const [selectedGoals, setSelectedGoals] = useState<GoalValue[]>([]);

  const handleGoalChange = (goal: GoalValue) => {
    setSelectedGoals((currentGoals) => {
      const isSelected = currentGoals.includes(goal);

      if (goal === "Everything") {
        return isSelected ? [] : ["Everything"];
      }

      const goalsWithoutEverything = currentGoals.filter(
        (currentGoal) => currentGoal !== "Everything",
      );

      if (isSelected) {
        return goalsWithoutEverything.filter((currentGoal) => currentGoal !== goal);
      }

      return [...goalsWithoutEverything, goal];
    });
  };

  const handleContinue = () => {
    if (selectedGoals.length === 0) {
      return;
    }

    router.push("/onboarding/motivation");
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col px-[var(--space-6)] py-[var(--space-8)]">
        <section
          aria-labelledby="goals-title"
          className="flex min-h-full flex-1 flex-col"
        >
          <div
            aria-label="Onboarding progress, step 3 of 3"
            className="flex gap-[var(--space-2)]"
          >
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
          </div>

          <div className="pt-[var(--space-10)]">
            <Typography id="goals-title" variant="display" as="h1">
              What do you want to improve?
            </Typography>
            <Typography
              variant="bodyLarge"
              className="mt-[var(--space-4)] text-[var(--color-text-secondary)]"
            >
              Choose the skills you want Leo to focus on.
            </Typography>
          </div>

          <fieldset className="mt-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
            <legend className="sr-only">Learning goals</legend>
            {goals.map((goal) => {
              const isSelected = selectedGoals.includes(goal);

              return (
                <label key={goal} className="block cursor-pointer">
                  <input
                    type="checkbox"
                    name="learning-goals"
                    value={goal}
                    checked={isSelected}
                    onChange={() => handleGoalChange(goal)}
                    className="sr-only"
                  />
                  <Card
                    className={`flex min-h-[68px] items-center justify-between transition-colors duration-150 ease-out ${
                      isSelected
                        ? "border-[var(--color-primary-navy)] bg-[var(--color-navy-tint)] ring-2 ring-[var(--color-primary-navy)]/10"
                        : "hover:border-[var(--color-primary-navy)] hover:bg-[var(--color-navy-tint)]"
                    }`}
                  >
                    <Typography variant="h3" as="span">
                      {goal}
                    </Typography>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] border ${
                        isSelected
                          ? "border-[var(--color-primary-navy)] bg-[var(--color-primary-navy)]"
                          : "border-[var(--color-border)] bg-[var(--color-white)]"
                      }`}
                    >
                      {isSelected ? (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-[var(--color-white)]"
                        >
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
              disabled={selectedGoals.length === 0}
              onClick={handleContinue}
            >
              Continue
            </Button>
            <form action={assetPath("/onboarding/level")} className="w-full">
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
