"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

const motivations = [
  "Build confidence",
  "Prepare for work",
  "Travel easily",
  "Study better",
  "Speak naturally",
] as const;

type MotivationValue = (typeof motivations)[number];

export default function MotivationOnboardingPage() {
  const router = useRouter();
  const [selectedMotivation, setSelectedMotivation] =
    useState<MotivationValue | "">("");

  const handleContinue = () => {
    if (!selectedMotivation) {
      return;
    }

    router.push("/home");
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col px-[var(--space-6)] py-[var(--space-8)]">
        <section
          aria-labelledby="motivation-title"
          className="flex min-h-full flex-1 flex-col"
        >
          <div className="flex items-center justify-between gap-[var(--space-4)]">
            <div>
              <Typography variant="caption" className="text-[var(--color-primary-navy)]">
                Motivation
              </Typography>
              <Typography
                id="motivation-title"
                variant="display"
                as="h1"
                className="mt-[var(--space-2)]"
              >
                What keeps you going?
              </Typography>
            </div>
            <Image
              src={assetPath("/images/leo-character.png")}
              alt="Leo, the English learning companion"
              width={92}
              height={92}
              priority
              className="h-auto w-[92px] shrink-0 object-contain"
            />
          </div>

          <Typography
            variant="bodyLarge"
            className="mt-[var(--space-4)] text-[var(--color-text-secondary)]"
          >
            Choose what you want Leo to help you stay focused on.
          </Typography>

          <fieldset className="mt-[var(--space-8)] flex flex-col gap-[var(--space-3)]">
            <legend className="sr-only">Learning motivation</legend>
            {motivations.map((motivation) => {
              const isSelected = selectedMotivation === motivation;

              return (
                <label key={motivation} className="block cursor-pointer">
                  <input
                    type="radio"
                    name="learning-motivation"
                    value={motivation}
                    checked={isSelected}
                    onChange={() => setSelectedMotivation(motivation)}
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
                      {motivation}
                    </Typography>
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 items-center justify-center rounded-[var(--radius-pill)] border ${
                        isSelected
                          ? "border-[var(--color-primary-navy)] bg-[var(--color-primary-navy)]"
                          : "border-[var(--color-border)] bg-[var(--color-white)]"
                      }`}
                    >
                      {isSelected ? (
                        <span className="h-2.5 w-2.5 rounded-[var(--radius-pill)] bg-[var(--color-white)]" />
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
              disabled={!selectedMotivation}
              onClick={handleContinue}
            >
              Continue
            </Button>
            <form action={assetPath("/onboarding/goals")} className="w-full">
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
