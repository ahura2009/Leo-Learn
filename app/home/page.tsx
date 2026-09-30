"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Typography } from "@/components/ui/Typography";
import { useProgress } from "@/lib/progress-store";

const practices = {
  cafe: {
    eyebrow: "EVERYDAY ENGLISH · 2 MIN",
    title: "Ordering at a café",
    context: "You're at a café with a friend. What would you say to ask for a table?",
    options: [
      "Could we have a table for two, please?",
      "I have two tables, please.",
      "Where is the table for tomorrow?",
    ],
    correctIndex: 0,
    explanation: "“Could we have…” is a polite, natural way to make a request.",
  },
  words: {
    eyebrow: "WORD PRACTICE · 1 MIN",
    title: "A useful new word",
    context: "Your server says, “I'll bring the menu shortly.” What does “shortly” mean?",
    options: ["In a little while", "Very slowly", "At the end of the day"],
    correctIndex: 0,
    explanation: "“Shortly” means soon, or in a little while.",
  },
} as const;

type PracticeKey = keyof typeof practices;

export default function HomePage() {
  const router = useRouter();
  const { streak, recordPractice, practicedToday } = useProgress();
  const [activePractice, setActivePractice] = useState<PracticeKey | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const completed = practicedToday;
  const practiceRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (activePractice) {
      practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      practiceRef.current?.focus({ preventScroll: true });
    }
  }, [activePractice]);

  const openPractice = (practice: PracticeKey) => {
    setSelectedAnswer(null);
    setChecked(false);
    setActivePractice(practice);
    requestAnimationFrame(() => practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const closePractice = () => {
    setActivePractice(null);
    setSelectedAnswer(null);
    setChecked(false);
  };

  const currentPractice = activePractice ? practices[activePractice] : null;
  const isCorrect = currentPractice && selectedAnswer === currentPractice.correctIndex;

  return (
    <AppShell
      activeNavigationItem="Home"
      topNavigation={
        <header className="border-b border-[var(--color-border)] bg-[var(--color-white)]">
          <Container className="flex max-w-[640px] items-center justify-between py-3">
            <div className="flex items-center gap-2.5">
              <Image src={assetPath("/images/leo-app-icon.png")} alt="" width={36} height={36} className="h-9 w-9 rounded-[var(--radius-sm)]" />
              <Typography as="span" variant="h3" className="text-[var(--color-primary-navy)]">
                Leo Learn
              </Typography>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[#fff6d9] px-3 py-2 text-xs font-semibold text-[var(--color-dark-navy)]" aria-label={`${streak} day learning streak`}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-[var(--color-warning)]">
                <path d="M13.2 2.4c.7 3.3-.6 4.6-1.8 6.1-.8 1-1.2 1.7-1.1 2.6-1.4-.5-2.4-1.5-2.7-2.8C5.5 10.7 4.5 13 4.5 15.2a7.5 7.5 0 0 0 15 0c0-4-2.4-7.6-6.3-12.8ZM12 20a4 4 0 0 1-4-4c0-1.1.5-2.2 1.4-3.2.5 1 1.3 1.6 2.4 1.9-.1-1.2.5-2.2 1.2-3.1 1.7 1.4 3 3.2 3 4.4a4 4 0 0 1-4 4Z" />
              </svg>
              {streak} days
            </span>
          </Container>
        </header>
      }
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-6"
    >
      <div className="space-y-6">
        <div>
          <Typography variant="caption" className="font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-navy)]">
            YOUR LEARNING SPACE
          </Typography>
          <Typography variant="h1" as="h1" className="mt-1">
            Ready for today?
          </Typography>
          <Typography variant="body" className="mt-1 text-[var(--color-text-secondary)]">
            A little practice goes a long way. Let’s get speaking.
          </Typography>
        </div>

        <Card variant="hero" className="relative overflow-hidden border-0 bg-[var(--color-primary-navy)] p-5 text-white shadow-[0_12px_28px_rgba(0,37,111,0.16)]">
          <div aria-hidden="true" className="absolute -right-14 -top-20 h-52 w-52 rounded-full border-[30px] border-white/5" />
          <div className="relative flex min-h-[172px] items-start">
            <div className="relative z-10 max-w-[70%] pb-16">
              <Typography variant="label" className="uppercase tracking-[0.12em] text-[var(--color-gold)]">
                TODAY’S LESSON
              </Typography>
              <Typography variant="h2" as="h2" className="mt-3 text-white">
                English for real life
              </Typography>
              <Typography variant="body" className="mt-2 text-white/80">
                Start with a conversation you could have today.
              </Typography>
            </div>
            <Image src={assetPath("/images/leo-character.png")} alt="" width={156} height={156} priority className="absolute -bottom-3 -right-5 h-auto w-[142px] max-w-[48%] object-contain" />
          </div>
          <Button onClick={() => router.push("/learn/unit-2#lesson-2")} className="relative z-10 mt-1 w-full border-0 bg-[var(--color-gold)] text-[var(--color-dark-navy)] hover:bg-[#ffcf3e] active:bg-[#e7ae00]">
            Start today’s lesson
            <span aria-hidden="true" className="ml-2 text-lg leading-none">→</span>
          </Button>
        </Card>

        <section aria-labelledby="goal-heading">
          <Card className="border-[var(--color-navy-tint)] shadow-sm shadow-[#001a4d]/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography id="goal-heading" variant="h3" as="h2">Your daily goal</Typography>
                <Typography variant="caption" className="mt-1">Complete one practice to keep your momentum.</Typography>
              </div>
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                {completed ? "1 of 1" : "0 of 1"}
              </span>
            </div>
            <div role="progressbar" aria-label="Daily practice goal" aria-valuemin={0} aria-valuemax={1} aria-valuenow={completed ? 1 : 0} className="mt-5 h-2.5 overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)]">
              <div className={`h-full rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] transition-[width] duration-300 ${completed ? "w-full" : "w-0"}`} />
            </div>
            <Typography variant="caption" className="mt-2 text-[var(--color-text-secondary)]">
              {completed ? "Goal reached! Nice work showing up today." : "One small step today. You’ve got this."}
            </Typography>
          </Card>
        </section>

        {currentPractice && (
          <section ref={practiceRef} tabIndex={-1} aria-labelledby="practice-heading" className="scroll-mt-5 rounded-[var(--radius-lg)] outline-none">
            <Card variant="hero" className="border-[var(--color-primary-navy)] bg-[var(--color-white)] shadow-md shadow-[#001a4d]/[0.06]">
              <div className="flex items-start justify-between gap-3">
                <Typography variant="label" className="uppercase tracking-[0.1em] text-[var(--color-primary-navy)]">{currentPractice.eyebrow}</Typography>
                <Button variant="ghost" onClick={closePractice} aria-label="Close practice" className="-mr-2 -mt-3 h-10 min-h-10 w-10 px-0 text-xl">×</Button>
              </div>
              <Typography id="practice-heading" variant="h2" as="h2" className="mt-2">{currentPractice.title}</Typography>
              <Typography variant="body" className="mt-3 text-[var(--color-text-secondary)]">{currentPractice.context}</Typography>
              <fieldset className="mt-5 space-y-2.5" disabled={checked}>
                <legend className="sr-only">Choose your answer</legend>
                {currentPractice.options.map((option, index) => (
                  <label key={option} className="block cursor-pointer">
                    <input type="radio" name="practice-answer" checked={selectedAnswer === index} onChange={() => setSelectedAnswer(index)} className="peer sr-only" />
                    <span className="flex min-h-[56px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors peer-checked:border-[var(--color-primary-navy)] peer-checked:bg-[var(--color-navy-tint)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-gold)]">
                      <span aria-hidden="true" className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selectedAnswer === index ? "border-[var(--color-primary-navy)]" : "border-[var(--color-text-muted)]"}`}>
                        {selectedAnswer === index && <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary-navy)]" />}
                      </span>
                      {option}
                    </span>
                  </label>
                ))}
              </fieldset>
              {checked && (
                <div role="status" aria-live="polite" className={`mt-4 rounded-[var(--radius-md)] p-4 ${isCorrect ? "bg-[#e8f5ee]" : "bg-[#fff6e6]"}`}>
                  <Typography variant="button" className="font-semibold">{isCorrect ? "That’s right!" : "Not quite — keep going."}</Typography>
                  <Typography variant="body" className="mt-1">{isCorrect ? currentPractice.explanation : "Try another answer. Think about what sounds natural in this situation."}</Typography>
                </div>
              )}
              <Button
                className="mt-5 w-full"
                disabled={selectedAnswer === null || (checked && !!isCorrect)}
                onClick={() => {
                  if (checked && !isCorrect) {
                    setSelectedAnswer(null);
                    setChecked(false);
                    return;
                  }
                  if (isCorrect) {
                    // This warm-up counts toward today's goal, not course lesson completion.
                    recordPractice();
                  }
                  setChecked(true);
                }}
              >
                {checked && isCorrect ? "Practice complete" : checked ? "Try again" : "Check answer"}
              </Button>
            </Card>
          </section>
        )}

        <section aria-labelledby="next-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Typography id="next-heading" variant="h2" as="h2">Pick up a skill</Typography>
            <Typography variant="caption">Made for everyday moments</Typography>
          </div>
          <Card className="flex items-center gap-4 shadow-sm shadow-[#001a4d]/[0.03]">
            <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] text-2xl">☕</div>
            <div className="min-w-0 flex-1">
              <Typography variant="h3" as="h3" className="text-base">Ordering at a café</Typography>
              <Typography variant="caption" className="mt-0.5">Speaking · Everyday English</Typography>
            </div>
            <Button variant="secondary" onClick={() => openPractice("cafe")} aria-label="Practice ordering at a café" className="min-h-10 shrink-0 px-3">Try it</Button>
          </Card>
          <Card className="flex items-center gap-4 shadow-sm shadow-[#001a4d]/[0.03]">
            <div aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[#fff6d9] text-2xl">✦</div>
            <div className="min-w-0 flex-1">
              <Typography variant="h3" as="h3" className="text-base">A useful new word</Typography>
              <Typography variant="caption" className="mt-0.5">Vocabulary · 1 min</Typography>
            </div>
            <Button variant="secondary" onClick={() => openPractice("words")} aria-label="Practice a useful new word" className="min-h-10 shrink-0 px-3">Try it</Button>
          </Card>
        </section>

        <Card className="flex items-center gap-4 border-0 bg-[var(--color-navy-tint)]">
          <Image src={assetPath("/images/leo-character.png")} alt="" width={68} height={68} className="h-auto w-[68px] shrink-0 object-contain" />
          <div>
            <Typography variant="h3" as="h2" className="text-base">A note from Leo</Typography>
            <Typography variant="body" className="mt-1 text-[var(--color-text-secondary)]">
              “The best way to learn a language is to use it, one little moment at a time.”
            </Typography>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
