import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col items-center justify-center px-[var(--space-6)] py-[var(--space-10)]">
        <section
          aria-labelledby="welcome-title"
          className="flex w-full flex-col items-center text-center"
        >
          <div className="mb-[var(--space-10)] flex justify-center">
            <Image
              src={assetPath("/images/leo-character.png")}
              alt="Leo, the English learning companion"
              width={220}
              height={220}
              priority
              className="h-auto w-[220px] object-contain"
            />
          </div>

          <div className="space-y-[var(--space-4)]">
            <Typography id="welcome-title" variant="display" as="h1">
              Meet Leo. Your English Learning Companion.
            </Typography>
            <Typography
              variant="bodyLarge"
              className="text-[var(--color-text-secondary)]"
            >
              Practice real English, get personalized feedback, and build
              confidence every day.
            </Typography>
          </div>

          <div className="mt-[var(--space-12)] flex w-full flex-col gap-[var(--space-3)]">
            <form action={assetPath("/onboarding")} className="w-full">
              <Button type="submit" className="w-full">
                Get Started
              </Button>
            </form>
            <form action={assetPath("/home")} className="w-full">
              <Button type="submit" variant="ghost" className="w-full">
                Explore the demo
              </Button>
            </form>
          </div>
        </section>
      </Container>
    </main>
  );
}
