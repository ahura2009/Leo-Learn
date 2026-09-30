"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { unitById, units, type Exercise, type Lesson, type LessonStatus } from "@/lib/course-data";
import { useProgress } from "@/lib/progress-store";

type ExerciseKind = "multipleChoice" | "response" | "completion";

const statusCopy: Record<LessonStatus, { label: string; badge: string }> = {
  complete: { label: "Completed", badge: "bg-[#e8f5ee] text-[var(--color-success)]" },
  current: { label: "Current", badge: "bg-[var(--color-navy-tint)] text-[var(--color-primary-navy)]" },
  next: { label: "Next up", badge: "bg-[var(--color-navy-tint)] text-[var(--color-primary-navy)]" },
  locked: { label: "Locked", badge: "bg-[var(--color-background)] text-[var(--color-text-muted)]" },
};

function ProgressBar({ value, label, valueText }: { value: number; label: string; valueText?: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-valuetext={valueText ?? `${value} percent`}
      className="h-2.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)]"
    >
      <div
        className="h-full rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] transition-[width] duration-500 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function LessonBadge({ status }: { status: LessonStatus }) {
  const copy = statusCopy[status];

  return (
    <span className={`shrink-0 rounded-[var(--radius-pill)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${copy.badge}`}>
      {copy.label}
    </span>
  );
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/[.,!?;:]/g, "").replace(/\s+/g, " ").trim();
}

function isCompletionCorrect(exercise: Exercise, answer: string) {
  const normalized = normalizeAnswer(answer);
  return (exercise.accepted ?? []).some((accepted) => normalizeAnswer(accepted) === normalized);
}

type Screen = "unit" | "preview" | "practice" | "complete";

export default function UnitPage() {
  const params = useParams<{ unit: string }>();
  const router = useRouter();
  const unitId = typeof params?.unit === "string" ? params.unit : "unit-2";
  const unit = unitById(unitId) ?? unitById("unit-2")!;

  const { completeLesson, isLessonComplete } = useProgress();
  const unitIndex = units.findIndex((item) => item.id === unit.id);
  const isUnitLocked = unitIndex > 0 && !units[unitIndex - 1].lessons.every((lesson) =>
    isLessonComplete(units[unitIndex - 1].id, lesson.id),
  );

  const [screen, setScreen] = useState<Screen>("unit");
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [completionAnswer, setCompletionAnswer] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const practiceRef = useRef<HTMLDivElement>(null);

  const lessons = useMemo(
    () =>
      unit.lessons.map((lesson, index) => ({
        ...lesson,
        status: isLessonComplete(unit.id, lesson.id)
          ? ("complete" as LessonStatus)
          : isUnitLocked || lesson.baselineStatus === "locked" ||
              (index > 0 && !isLessonComplete(unit.id, unit.lessons[index - 1].id))
            ? ("locked" as LessonStatus)
            : lesson.baselineStatus,
      })),
    [unit, isLessonComplete, isUnitLocked],
  );

  const currentLesson = lessons.find(
    (lesson) => lesson.status !== "complete" && lesson.status !== "locked" && lesson.exercises.length > 0,
  );

  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? null;
  const completedCount = lessons.filter((lesson) => lesson.status === "complete").length;
  const unitProgress = Math.round((completedCount / lessons.length) * 100);
  const isUnitComplete = completedCount === lessons.length;

  useEffect(() => {
    const lessonId = decodeURIComponent(window.location.hash.slice(1));
    const lesson = lessons.find((item) => item.id === lessonId && item.status !== "locked");
    if (lesson) {
      // Hash navigation selects a lesson after the initial route render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedLessonId(lesson.id);
      setScreen("preview");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [lessons]);

  useEffect(() => {
    if (screen === "practice") {
      practiceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [screen, exerciseIndex]);

  const resetExerciseState = () => {
    setSelectedAnswer(null);
    setCompletionAnswer("");
    setIsChecked(false);
  };

  const startPractice = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    setExerciseIndex(0);
    setCorrectCount(0);
    resetExerciseState();
    setScreen(lesson.exercises.length > 0 ? "practice" : "preview");
  };

  const openPreview = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
    resetExerciseState();
    setScreen("preview");
  };

  const activeExercise = selectedLesson?.exercises[exerciseIndex] ?? null;
  const exerciseCount = selectedLesson?.exercises.length ?? 0;
  const isLastExercise = exerciseIndex === exerciseCount - 1;

  const hasAnswer = activeExercise
    ? activeExercise.kind === "completion"
      ? completionAnswer.trim().length > 0
      : selectedAnswer !== null
    : false;

  const currentIsCorrect = activeExercise
    ? activeExercise.kind === "completion"
      ? isCompletionCorrect(activeExercise, completionAnswer)
      : selectedAnswer === activeExercise.correctIndex
    : false;

  const handleCheck = () => {
    if (!activeExercise) {
      return;
    }

    if (isChecked) {
      // "Try again" — clear the answer and let the learner retry.
      if (!currentIsCorrect) {
        resetExerciseState();
        return;
      }

      // Correct — advance or finish.
      if (isLastExercise) {
        if (selectedLesson) {
          completeLesson(unit.id, selectedLesson.id);
        }
        setScreen("complete");
        return;
      }

      setExerciseIndex((index) => index + 1);
      resetExerciseState();
      return;
    }

    setIsChecked(true);
    if (currentIsCorrect) {
      setCorrectCount((count) => count + 1);
    }
  };

  const exitPractice = () => {
    resetExerciseState();
    setScreen("unit");
  };

  const continueToNextLesson = () => {
    const nextLesson = lessons.find(
      (lesson) => lesson.status !== "complete" && lesson.status !== "locked" && lesson.exercises.length > 0,
    );
    resetExerciseState();
    if (nextLesson) {
      setSelectedLessonId(nextLesson.id);
      setScreen("preview");
      return;
    }
    router.push("/progress");
  };

  const buttonLabel = !isChecked
    ? "Check answer"
    : currentIsCorrect
      ? isLastExercise
        ? "Finish lesson"
        : "Next exercise"
      : "Try again";

  return (
    <AppShell
      activeNavigationItem="Learn"
      hideBottomNavigation={screen === "practice"}
      topNavigation={
        <TopNavigation
          title={screen === "unit" ? unit.title : screen === "practice" ? "Lesson practice" : screen === "complete" ? "Lesson complete" : "Lesson preview"}
          onBack={() => {
            if (screen === "unit") {
              router.push("/learn");
              return;
            }
            if (screen === "complete") {
              setScreen("unit");
              return;
            }
            exitPractice();
          }}
        />
      }
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-5"
    >
      {screen === "unit" ? (
        isUnitLocked ? (
          <Card variant="hero">
            <Typography variant="h2" as="h1">This unit is locked</Typography>
            <Typography variant="body" as="p" className="mt-2">Finish the previous unit to unlock these lessons.</Typography>
            <Link href="/learn" className="mt-4 block"><Button className="w-full">Back to learning path</Button></Link>
          </Card>
        ) : <div className="space-y-6">
          <section aria-labelledby="unit-heading" className="space-y-4">
            <div>
              <Typography variant="caption" className="font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-navy)]">
                {unit.eyebrow}
              </Typography>
              <Typography id="unit-heading" variant="h1" as="h1" className="mt-1">
                {unit.title}
              </Typography>
              <Typography variant="body" as="p" className="mt-2 text-[var(--color-text-secondary)]">
                {unit.description}
              </Typography>
            </div>

            <Card variant="hero" className="border-[var(--color-navy-tint)] shadow-sm shadow-[#001a4d]/[0.04]">
              <div className="flex items-baseline justify-between gap-3">
                <Typography variant="h3" as="h2">Unit progress</Typography>
                <Typography variant="label" className="text-[var(--color-primary-navy)]">{unitProgress}%</Typography>
              </div>
              <div className="mt-3">
                <ProgressBar
                  value={unitProgress}
                  label={`${unit.title} progress`}
                  valueText={`${completedCount} of ${lessons.length} lessons complete`}
                />
              </div>
              <Typography variant="caption" as="p" className="mt-2">
                {completedCount} of {lessons.length} lessons complete · {unit.minutes} min total
              </Typography>

              <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                <Typography variant="label" as="p" className="text-[var(--color-text-secondary)]">
                  Skills covered
                </Typography>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {unit.skills.map((skill) => (
                    <li key={skill}>
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </section>

          <section aria-labelledby="lessons-heading" className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <Typography id="lessons-heading" variant="h2" as="h2">Lessons</Typography>
              <Typography variant="caption">Complete them in order</Typography>
            </div>

            {lessons.map((lesson, index) => {
              const isLocked = lesson.status === "locked";
              const isHighlighted = lesson.status === "current" || lesson.status === "next";

              return (
                <Card
                  key={lesson.id}
                  variant="hero"
                  className={`p-0 ${isHighlighted ? "border-[var(--color-primary-navy)] shadow-md shadow-[#001a4d]/[0.07]" : ""} ${
                    isLocked ? "bg-[var(--color-background)]" : ""
                  }`}
                >
                  <button
                    type="button"
                    disabled={isLocked}
                    onClick={() => openPreview(lesson)}
                    aria-label={
                      isLocked
                        ? `${lesson.title}, locked`
                        : `Open lesson ${index + 1}: ${lesson.title}`
                    }
                    className={`flex w-full items-start gap-4 p-[var(--card-hero-padding)] text-left transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-inset ${
                      isLocked ? "cursor-not-allowed opacity-60" : "hover:opacity-90"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-pill)] text-xs font-semibold ${
                        lesson.status === "complete"
                          ? "bg-[#e8f5ee] text-[var(--color-success)]"
                          : isHighlighted
                            ? "bg-[var(--color-primary-navy)] text-[var(--color-white)]"
                            : "bg-[var(--color-background)] text-[var(--color-text-muted)]"
                      }`}
                    >
                      {lesson.status === "complete" ? (
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
                      <span className="flex items-start justify-between gap-3">
                        <Typography variant="h3" as="span" className="text-base">{lesson.title}</Typography>
                        <LessonBadge status={lesson.status} />
                      </span>
                      <Typography variant="caption" as="span" className="mt-1 block">{lesson.detail}</Typography>
                      <Typography variant="caption" as="span" className="mt-2 block text-[var(--color-text-muted)]">
                        {lesson.objective}
                      </Typography>
                    </span>
                  </button>
                </Card>
              );
            })}
          </section>

          {currentLesson ? (
            <Button className="w-full" onClick={() => openPreview(currentLesson)}>
              Preview: {currentLesson.title}
              <span aria-hidden="true" className="ml-2 text-lg leading-none">→</span>
            </Button>
          ) : isUnitComplete ? (
            <Card className="border-0 bg-[#e8f5ee]">
              <Typography variant="h3" as="h2" className="text-base text-[var(--color-success)]">
                Unit complete
              </Typography>
              <Typography variant="body" as="p" className="mt-1 text-[var(--color-text-secondary)]">
                You finished every lesson in {unit.title}. Unit 3 is next on the path.
              </Typography>
              <Link href="/learn" className="mt-4 block">
                <Button className="w-full">Back to learning path</Button>
              </Link>
            </Card>
          ) : (
            <Card className="bg-[var(--color-navy-tint)]">
              <Typography variant="h3" as="h2">You’re caught up with the demo</Typography>
              <Typography variant="body" as="p" className="mt-1">The remaining lessons are previews; more exercises are coming later.</Typography>
              <Link href="/progress" className="mt-4 block"><Button className="w-full">See your progress</Button></Link>
            </Card>
          )}
        </div>
      ) : null}

      {screen === "preview" && selectedLesson ? (
        <div className="space-y-6">
          <div>
            <Typography variant="caption" className="font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-navy)]">
              LESSON {lessons.findIndex((lesson) => lesson.id === selectedLesson.id) + 1} OF {lessons.length}
            </Typography>
            <Typography id="preview-heading" variant="h1" as="h1" className="mt-1">
              {selectedLesson.title}
            </Typography>
          </div>

          <Card variant="hero" className="shadow-sm shadow-[#001a4d]/[0.04]">
            <Typography variant="label" as="p" className="text-[var(--color-text-secondary)]">
              What you’ll learn
            </Typography>
            <Typography variant="bodyLarge" as="p" className="mt-1.5">
              {selectedLesson.objective}
            </Typography>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Estimated time</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {selectedLesson.minutes} minutes
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Exercises</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {selectedLesson.exercises.length > 0 ? `${selectedLesson.exercises.length} questions` : "Preview only"}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <Typography variant="label" as="p" className="text-[var(--color-text-secondary)]">
                Skills practised
              </Typography>
              <ul className="mt-2 flex flex-wrap gap-2">
                {selectedLesson.skills.map((skill) => (
                  <li key={skill}>
                    <span className="rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                      {skill}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {selectedLesson.exercises.length > 0 ? (
            <Button className="w-full" onClick={() => startPractice(selectedLesson)}>
              Start lesson
              <span aria-hidden="true" className="ml-2 text-lg leading-none">→</span>
            </Button>
          ) : (
            <Card className="border-0 bg-[var(--color-navy-tint)]">
              <Typography variant="label" as="p" className="text-[var(--color-primary-navy)]">
                Coming next in the prototype
              </Typography>
              <Typography variant="body" as="p" className="mt-1 text-[var(--color-text-secondary)]">
                {selectedLesson.id === "lesson-4"
                  ? "This unit check-in unlocks once “Asking for directions” is finished."
                  : "This lesson’s exercises haven’t been built yet — it’s here so the path stays complete."}
              </Typography>
            </Card>
          )}
        </div>
      ) : null}

      {screen === "practice" && selectedLesson && activeExercise ? (
        <div ref={practiceRef} className="space-y-5">
          <div>
            <div className="flex items-baseline justify-between gap-3">
              <Typography variant="caption" className="font-semibold uppercase tracking-[0.12em] text-[var(--color-primary-navy)]">
                {selectedLesson.title}
              </Typography>
              <Typography variant="label" className="text-[var(--color-text-secondary)]">
                {exerciseIndex + 1} / {exerciseCount}
              </Typography>
            </div>
            <div className="mt-2">
              <ProgressBar
                value={Math.round(((exerciseIndex + (isChecked ? 1 : 0)) / exerciseCount) * 100)}
                label="Lesson progress"
                valueText={`Exercise ${exerciseIndex + 1} of ${exerciseCount}`}
              />
            </div>
          </div>

          <Card variant="hero" className="shadow-sm shadow-[#001a4d]/[0.04]">
            <Typography variant="label" as="p" className="uppercase tracking-[0.1em] text-[var(--color-primary-navy)]">
              {activeExercise.label}
            </Typography>
            <Typography variant="h2" as="h2" className="mt-2">
              {activeExercise.question}
            </Typography>
            <Typography variant="body" as="p" className="mt-2 text-[var(--color-text-secondary)]">
              {activeExercise.helper}
            </Typography>

            {activeExercise.kind === "response" && activeExercise.situation ? (
              <div className="mt-5 flex items-end gap-3 rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] p-4">
                <Image src={assetPath("/images/leo-character.png")} alt="" width={44} height={44} className="mb-0.5 h-11 w-11 shrink-0 object-contain" />
                <div>
                  <Typography variant="caption" as="p" className="font-semibold text-[var(--color-primary-navy)]">
                    {activeExercise.speaker}
                  </Typography>
                  <Typography variant="bodyLarge" as="p" className="mt-0.5">
                    {activeExercise.situation}
                  </Typography>
                </div>
              </div>
            ) : null}

            {activeExercise.kind === "completion" ? (
              <div className="mt-5">
                <Typography variant="body" as="p" className="text-[var(--color-text-secondary)]">
                  {activeExercise.prompt}
                </Typography>
                <label htmlFor="completion-answer" className="sr-only">
                  Complete the sentence
                </label>
                <div className="mt-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] p-3">
                  <span className="text-sm text-[var(--color-text-secondary)]">{activeExercise.before}</span>
                  <input
                    id="completion-answer"
                    value={completionAnswer}
                    onChange={(event) => setCompletionAnswer(event.target.value)}
                    disabled={isChecked}
                    autoComplete="off"
                    aria-label="Missing words"
                    className="min-h-[44px] min-w-[110px] flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] disabled:opacity-70"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{activeExercise.after}</span>
                </div>
              </div>
            ) : (
              <fieldset className="mt-5 space-y-2.5" disabled={isChecked}>
                <legend className="sr-only">Choose your answer</legend>
                {(activeExercise.options ?? []).map((option, index) => (
                  <label key={option} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="exercise-answer"
                      checked={selectedAnswer === index}
                      onChange={() => setSelectedAnswer(index)}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[56px] items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] transition-colors peer-checked:border-[var(--color-primary-navy)] peer-checked:bg-[var(--color-navy-tint)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-gold)] peer-disabled:opacity-80">
                      <span
                        aria-hidden="true"
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selectedAnswer === index ? "border-[var(--color-primary-navy)]" : "border-[var(--color-text-muted)]"
                        }`}
                      >
                        {selectedAnswer === index ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary-navy)]" />
                        ) : null}
                      </span>
                      {option}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </Card>

          {isChecked ? (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-[var(--radius-md)] p-4 ${currentIsCorrect ? "bg-[#e8f5ee]" : "bg-[#fff6e6]"}`}
            >
              <Typography variant="button" as="p" className="font-semibold">
                {currentIsCorrect ? "That’s right!" : "Not quite — keep going."}
              </Typography>
              <Typography variant="body" as="p" className="mt-1">
                {currentIsCorrect
                  ? activeExercise.explanation
                  : activeExercise.kind === "completion"
                    ? "Try a different word or phrase. Think about what you’d say out loud in this situation."
                    : "Try another answer. Think about what sounds natural in this situation."}
              </Typography>
              {!currentIsCorrect && activeExercise.sampleAnswer ? (
                <Typography variant="caption" as="p" className="mt-2 text-[var(--color-text-secondary)]">
                  One natural answer: {activeExercise.sampleAnswer}
                </Typography>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Button
              className="w-full"
              disabled={!hasAnswer}
              onClick={handleCheck}
            >
              {buttonLabel}
            </Button>
            <Button variant="ghost" className="w-full" onClick={exitPractice}>
              Exit lesson
            </Button>
          </div>

          <div aria-live="polite" className="sr-only">
            {isChecked ? (currentIsCorrect ? "Correct answer" : "Incorrect answer") : ""}
          </div>
        </div>
      ) : null}

      {screen === "complete" && selectedLesson ? (
        <div className="space-y-6">
          <Card variant="hero" className="border-0 bg-[var(--color-primary-navy)] p-5 text-white shadow-[0_12px_28px_rgba(0,37,111,0.16)]">
            <div className="flex items-center gap-4">
              <Image src={assetPath("/images/leo-character.png")} alt="" width={72} height={72} className="h-auto w-[72px] shrink-0 object-contain" />
              <div>
                <Typography variant="label" as="p" className="uppercase tracking-[0.12em] text-[var(--color-gold)]">
                  LESSON COMPLETE
                </Typography>
                <Typography variant="h2" as="h2" className="mt-1 text-white">
                  Nice work!
                </Typography>
                <Typography variant="body" as="p" className="mt-1 text-white/80">
                  You finished {selectedLesson.title}.
                </Typography>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm shadow-[#001a4d]/[0.03]">
            <Typography variant="h3" as="h2">What you learned</Typography>
            <Typography variant="body" as="p" className="mt-1.5 text-[var(--color-text-secondary)]">
              {selectedLesson.objective}
            </Typography>
            <ul className="mt-4 space-y-2">
              {(selectedLesson.exercises.length > 0
                ? selectedLesson.exercises.map((exercise) => exercise.label.toLowerCase())
                : selectedLesson.skills
              ).map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]">
                    <path
                      d="m9.55 15.15 7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.6 7.6a.75.75 0 0 1-1.06 0l-3.2-3.2a.75.75 0 0 1 1.06-1.06l2.67 2.67Z"
                      fill="currentColor"
                    />
                  </svg>
                  <Typography variant="body" as="span" className="capitalize">{item}</Typography>
                </li>
              ))}
            </ul>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Answers correct</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                  {correctCount} of {exerciseCount}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)]">Unit progress</dt>
                <dd className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">{unitProgress}%</dd>
              </div>
            </dl>
            <div className="mt-4">
              <ProgressBar
                value={unitProgress}
                label={`${unit.title} progress`}
                valueText={`${completedCount} of ${lessons.length} lessons complete`}
              />
            </div>
            <Typography variant="caption" as="p" className="mt-2">
              {completedCount} of {lessons.length} lessons complete in this unit
            </Typography>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={continueToNextLesson}>
              {currentLesson ? "Continue learning" : "See your progress"}
              <span aria-hidden="true" className="ml-2 text-lg leading-none">→</span>
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setScreen("unit")}>
              Back to unit
            </Button>
            <Link href="/learn" className="w-full">
              <Button variant="ghost" className="w-full">Back to learning path</Button>
            </Link>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
