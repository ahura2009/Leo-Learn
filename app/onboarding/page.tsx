import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col px-[var(--space-6)] py-[var(--space-8)]">
        <section
          aria-labelledby="onboarding-title"
          className="flex min-h-full flex-1 flex-col"
        >
          <div
            aria-label="Onboarding progress, step 1 of 3"
            className="flex gap-[var(--space-2)]"
          >
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-border)]" />
            <div className="h-2 flex-1 rounded-[var(--radius-pill)] bg-[var(--color-border)]" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <Image
              src={assetPath("/images/leo-character.png")}
              alt="Leo, the English learning companion"
              width={220}
              height={220}
              priority
              className="mb-[var(--space-10)] h-auto w-[220px] object-contain"
            />

            <div className="space-y-[var(--space-4)]">
              <Typography id="onboarding-title" variant="display" as="h1">
                Learn through real situations.
              </Typography>
              <Typography
                variant="bodyLarge"
                className="text-[var(--color-text-secondary)]"
              >
                Practice English in the situations you actually experience —
                with lessons that adapt to you.
              </Typography>
            </div>
          </div>

          <div className="flex w-full flex-col gap-[var(--space-3)] pt-[var(--space-8)]">
            <form action={assetPath("/onboarding/level")} className="w-full">
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
            <form action={assetPath("/onboarding/level")} className="w-full">
              <Button type="submit" variant="ghost" className="w-full">
                Skip
              </Button>
            </form>
          </div>
        </section>
      </Container>
    </main>
  );
}
