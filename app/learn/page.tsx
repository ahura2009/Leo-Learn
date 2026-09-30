"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { units, type LessonStatus, type Unit } from "@/lib/course-data";
import { useProgress } from "@/lib/progress-store";

type Skill = {
  id: string;
  name: string;
  progress: number;
  status: LessonStatus;
};

const skills: Skill[] = [
  { id: "speaking", name: "Speaking", progress: 72, status: "current" },
  { id: "listening", name: "Listening", progress: 64, status: "current" },
  { id: "vocabulary", name: "Vocabulary", progress: 81, status: "current" },
  { id: "grammar", name: "Grammar", progress: 58, status: "current" },
];

function ProgressBar({
  value,
  label,
  max = 100,
}: {
  value: number;
  label: string;
  max?: number;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value} percent`}
      className="h-2.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)]"
    >
      <div
        className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] transition-[width] duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function UnitStateBadge({ status }: { status: LessonStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[#e8f5ee] px-3 py-1.5 text-xs font-semibold text-[var(--color-success)]">
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
          <path
            d="m9.55 15.15 7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.06 0l-3.2-3.2a.75.75 0 0 1 1.06-1.06l2.67 2.67Z"
            fill="currentColor"
          />
        </svg>
        Completed
      </span>
    );
  }

  if (status === "current") {
    return (
      <span className="rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
        In progress
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--color-background)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path
          d="M12 2a5 5 0 0 0-5 5v3H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"
          fill="currentColor"
        />
      </svg>
      Locked
    </span>
  );
}

export default function LearnPage() {
  const router = useRouter();
  const { isLessonComplete, completedUnitCount, totalUnitCount, overallProgress } = useProgress();

  const [expandedUnitId, setExpandedUnitId] = useState<string>("unit-2");
  const [feedback, setFeedback] = useState("");

  // Units are locked until every lesson in the preceding unit is complete.
  const unitViews = useMemo(
    () =>
      units.map((unit, index) => {
        const previousUnitComplete =
          index === 0 ||
          units[index - 1].lessons.every((lesson) => isLessonComplete(units[index - 1].id, lesson.id));
        const lessons = unit.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          status: isLessonComplete(unit.id, lesson.id)
            ? ("complete" as LessonStatus)
            : !previousUnitComplete || lesson.baselineStatus === "locked" ||
                (lessonIndex > 0 && !isLessonComplete(unit.id, unit.lessons[lessonIndex - 1].id))
              ? ("locked" as LessonStatus)
              : lesson.baselineStatus,
        }));

        const completedCount = lessons.filter((lesson) => lesson.status === "complete").length;
        const isComplete = completedCount === lessons.length;

        const isLocked = !isComplete && !previousUnitComplete;
        const status: LessonStatus = isComplete ? "complete" : isLocked ? "locked" : "current";

        return {
          unit,
          lessons,
          status,
          completedCount,
          progress: Math.round((completedCount / lessons.length) * 100),
          nextLesson: lessons.find((lesson) => lesson.status !== "complete" && lesson.status !== "locked" && lesson.exercises.length > 0),
        };
      }),
    [isLessonComplete],
  );

  const toggleUnit = (unit: Unit, isLocked: boolean, title: string) => {
    if (isLocked) {
      setFeedback(`${title} unlocks when you finish the earlier units.`);
      window.setTimeout(() => setFeedback(""), 2600);
      return;
    }

    setExpandedUnitId((current) => (current === unit.id ? "" : unit.id));
    setFeedback("");
  };

  return (
    <AppShell
      activeNavigationItem="Learn"
      topNavigation={<TopNavigation title="Learn" />}
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-5"
    >
      <div className="space-y-6">
        <section aria-labelledby="learn-heading" className="space-y-4">
          <Typography variant="h1" as="h1" id="learn-heading">
            Your learning path
          </Typography>

          <Card variant="hero" className="border-[var(--color-navy-tint)] shadow-sm shadow-[#001a4d]/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography variant="caption" className="font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-navy)]">
                  Current level
                </Typography>
                <Typography variant="h2" as="h2" className="mt-1">
                  B1 · Intermediate
                </Typography>
              </div>
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                {totalUnitCount} units
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <Typography variant="label" className="text-[var(--color-text-secondary)]">
                  Path progress
                </Typography>
                <Typography variant="label" className="text-[var(--color-primary-navy)]">
                  {overallProgress}%
                </Typography>
              </div>
              <ProgressBar value={overallProgress} label="Overall learning progress" />
              <Typography variant="caption">
                {completedUnitCount} of {totalUnitCount} units complete
              </Typography>
            </div>
          </Card>

          <div className="space-y-2.5">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className={`rounded-[var(--radius-md)] border-[var(--card-standard-border)] bg-[var(--color-white)] p-[var(--card-standard-padding)] transition-colors ${
                  feedback === skill.name ? "border-[var(--color-primary-navy)] bg-[var(--color-navy-tint)]" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFeedback(`${skill.name} practice opens with the next unit.`);
                    window.setTimeout(() => setFeedback(""), 2400);
                  }}
                  className="w-full text-left transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]"
                  aria-label={`${skill.name}, ${skill.progress} percent mastered`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <Typography variant="label" className="text-[var(--color-text-primary)]">
                      {skill.name}
                    </Typography>
                    <Typography variant="label" className="text-[var(--color-text-secondary)]">
                      {skill.progress}%
                    </Typography>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={skill.progress} label={`${skill.name} mastery`} />
                  </div>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="units-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Typography variant="h2" as="h2" id="units-heading">
              Your units
            </Typography>
            <Typography variant="caption">Complete units in order</Typography>
          </div>

          {unitViews.map(({ unit, lessons, status, progress, nextLesson }) => {
            const isLocked = status === "locked";
            const isCurrent = status === "current";
            const isExpanded = expandedUnitId === unit.id;

            return (
              <Card
                key={unit.id}
                variant="hero"
                className={`overflow-hidden p-0 transition-shadow ${
                  isCurrent ? "border-[var(--color-primary-navy)] shadow-md shadow-[#001a4d]/[0.08]" : ""
                } ${isLocked ? "bg-[var(--color-background)]" : ""}`}
              >
                <button
                  type="button"
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) {
                      toggleUnit(unit, true, unit.title);
                      return;
                    }

                    router.push(`/learn/${unit.id}`);
                  }}
                  aria-label={
                    isLocked ? `${unit.title}, locked` : `Open ${unit.title} unit`
                  }
                  className={`flex w-full items-start gap-4 px-[var(--card-hero-padding)] pt-[var(--card-hero-padding)] pb-[var(--space-3)] text-left transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-inset ${
                    isLocked ? "cursor-not-allowed opacity-70" : "hover:opacity-90"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-md)] ${
                      isCurrent
                        ? "bg-[var(--color-primary-navy)] text-[var(--color-white)]"
                        : status === "complete"
                          ? "bg-[#e8f5ee] text-[var(--color-success)]"
                          : "bg-[var(--color-background)] text-[var(--color-text-muted)]"
                    }`}
                  >
                    {status === "complete" ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="m9.55 15.15 7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.06 0l-3.2-3.2a.75.75 0 0 1 1.06-1.06l2.67 2.67Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : isLocked ? (
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="M12 2a5 5 0 0 0-5 5v3H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"
                          fill="currentColor"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          d="M7 4.5A2.5 2.5 0 0 1 9.5 2H21v18H9.5A2.5 2.5 0 0 0 7 22.5v-18Zm2.5-.5A.5.5 0 0 0 9 4.5v13.05c.16-.03.33-.05.5-.05H19V4H9.5Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <Typography variant="h3" as="span" className="text-base">
                        {unit.title}
                      </Typography>
                      <span className="shrink-0 pt-0.5">
                        <UnitStateBadge status={status} />
                      </span>
                    </span>
                    <Typography variant="caption" className="mt-1 block">
                      {unit.focus}
                    </Typography>
                    <span className="mt-3 flex items-center justify-between gap-2">
                      <Typography variant="label" as="span" className="text-[var(--color-text-secondary)]">
                        {unit.lessons.length} lessons · {unit.minutes} min
                      </Typography>
                      <Typography variant="label" as="span" className="text-[var(--color-primary-navy)]">
                        {progress}%
                      </Typography>
                    </span>
                    <span className="mt-2 block">
                      <ProgressBar value={progress} label={`${unit.title} progress`} />
                    </span>
                  </span>
                </button>

                {!isLocked ? (
                  <div className="flex justify-end px-[var(--card-hero-padding)] pb-[var(--card-hero-padding)] pt-0">
                    <button
                      type="button"
                      onClick={() => toggleUnit(unit, false, unit.title)}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? "Hide" : "Show"} lesson details for ${unit.title}`}
                      className="inline-flex min-h-9 items-center gap-1.5 rounded-[var(--radius-pill)] px-3 text-xs font-semibold text-[var(--color-primary-navy)] transition-colors hover:bg-[var(--color-navy-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]"
                    >
                      {isExpanded ? "Hide details" : "Lesson details"}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <path d="M7 10 12 15 17 10Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                ) : null}

                {isExpanded && !isLocked ? (
                  <div className="border-t border-[var(--color-border)] px-[var(--card-hero-padding)] pb-[var(--card-hero-padding)] pt-4">
                    {isCurrent && nextLesson ? (
                      <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] p-4">
                        <Typography variant="caption" className="font-semibold uppercase tracking-[0.1em] text-[var(--color-primary-navy)]">
                          Up next
                        </Typography>
                        <Typography variant="h3" as="h3" className="mt-1 text-base">
                          {nextLesson.title}
                        </Typography>
                        <Typography variant="caption" as="p" className="mt-1">
                          {nextLesson.objective}
                        </Typography>
                        <Link href={`/learn/${unit.id}`} className="mt-4 block">
                          <Button className="w-full">
                            Open unit
                            <span aria-hidden="true" className="ml-2 text-lg leading-none">→</span>
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="mb-4 rounded-[var(--radius-md)] bg-[#e8f5ee] p-4">
                        <Typography variant="caption" className="font-semibold uppercase tracking-[0.1em] text-[var(--color-success)]">
                          {isCurrent ? "Demo preview" : "Recapped"}
                        </Typography>
                        <Typography variant="body" className="mt-1">
                          {isCurrent ? "More exercises are coming later. Explore the lesson previews or check your progress." : "Nice work — you finished every lesson in this unit."}
                        </Typography>
                        <Link href={`/learn/${unit.id}`} className="mt-4 block">
                          <Button variant="secondary" className="w-full">
                            {isCurrent ? "Open unit" : "Review unit"}
                          </Button>
                        </Link>
                      </div>
                    )}

                    <ol className="space-y-2">
                      {lessons.map((lesson, index) => {
                        const lessonIsComplete = lesson.status === "complete";
                        const lessonIsLocked = lesson.status === "locked";

                        return (
                          <li key={lesson.id}>
                            <button
                              type="button"
                              disabled={lessonIsLocked}
                              onClick={() => router.push(`/learn/${unit.id}#${lesson.id}`)}
                              aria-label={
                                lessonIsLocked
                                  ? `${lesson.title}, locked`
                                  : `Open lesson ${index + 1}: ${lesson.title}`
                              }
                              className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-inset ${
                                lessonIsLocked
                                  ? "cursor-not-allowed opacity-60"
                                  : "hover:bg-[var(--color-navy-tint)]"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-xs font-semibold ${
                                  lessonIsComplete
                                    ? "bg-[#e8f5ee] text-[var(--color-success)]"
                                    : "bg-[var(--color-navy-tint)] text-[var(--color-primary-navy)]"
                                }`}
                              >
                                {lessonIsComplete ? (
                                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                                    <path
                                      d="m9.55 15.15 7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.06 0l-3.2-3.2a.75.75 0 0 1 1.06-1.06l2.67 2.67Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                ) : (
                                  index + 1
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <Typography variant="label" as="span" className="block text-[var(--color-text-primary)]">
                                  {lesson.title}
                                </Typography>
                                <Typography variant="caption" as="span" className="block">
                                  {lesson.detail}
                                </Typography>
                              </span>
                              {lessonIsLocked ? (
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]">
                                  <path
                                    d="M12 2a5 5 0 0 0-5 5v3H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              ) : lesson.id === nextLesson?.id && isCurrent ? (
                                <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-white)]">
                                  Next
                                </span>
                              ) : null}
                            </button>
                          </li>
                        );
                      })}
                    </ol>

                    <Link href={`/learn/${unit.id}`} className="mt-4 block">
                      <Button variant={isCurrent ? "secondary" : "primary"} className="w-full">
                        Open unit details
                      </Button>
                    </Link>
                  </div>
                ) : null}

                {isLocked ? (
                  <div className="border-t border-[var(--color-border)] px-[var(--card-hero-padding)] py-4">
                    <Typography variant="caption" as="p" className="text-[var(--color-text-muted)]">
                      Finish the earlier units to unlock this one.
                    </Typography>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </section>

        <div aria-live="polite" role="status" className="sr-only">
          {feedback}
        </div>
        {feedback ? (
          <div className="fixed inset-x-0 bottom-32 z-40 flex justify-center px-[var(--space-4)]">
            <Typography
              variant="label"
              as="p"
              className="max-w-[390px] rounded-[var(--radius-pill)] bg-[var(--color-dark-navy)] px-4 py-2 text-center text-[var(--color-white)] shadow-lg"
            >
              {feedback}
            </Typography>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
