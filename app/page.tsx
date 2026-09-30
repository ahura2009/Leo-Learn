import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";

export default function SplashPage() {
  return (
    <main className="min-h-screen bg-[var(--color-dark-navy)] text-[var(--color-white)]">
      <Container className="flex min-h-screen max-w-[390px] flex-col items-center justify-center px-[var(--space-6)] py-[var(--space-10)]">
        <section
          aria-labelledby="splash-title"
          aria-describedby="splash-tagline splash-status"
          className="flex w-full flex-col items-center text-center"
        >
          <Image
            src="/images/leo-app-icon.png"
            alt="Leo Learn app icon"
            width={132}
            height={132}
            priority
            className="h-[132px] w-[132px]"
          />

          <div className="mt-[var(--space-8)] space-y-[var(--space-3)]">
            <Typography
              id="splash-title"
              variant="display"
              as="h1"
              className="text-[var(--color-white)]"
            >
              Leo Learn
            </Typography>
            <Typography
              id="splash-tagline"
              variant="bodyLarge"
              className="text-white/80"
            >
              Learn English. Live English.
            </Typography>
          </div>

          <div className="mt-[var(--space-12)] flex flex-col items-center gap-[var(--space-5)]">
            <div
              aria-hidden="true"
              className="h-2 w-24 overflow-hidden rounded-[var(--radius-pill)] bg-white/15"
            >
              <div className="h-full w-1/2 rounded-[var(--radius-pill)] bg-[var(--color-gold)]" />
            </div>
            <Typography
              id="splash-status"
              variant="caption"
              role="status"
              aria-live="polite"
              className="text-white/65"
            >
              Preparing your learning space
            </Typography>
          </div>

          <Link href="/welcome" className="mt-[var(--space-12)] w-full">
            <Button variant="secondary" className="w-full">
              Continue to Welcome
            </Button>
          </Link>
        </section>
      </Container>
    </main>
  );
}
