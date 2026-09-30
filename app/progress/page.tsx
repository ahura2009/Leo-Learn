"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { useProgress } from "@/lib/progress-store";
import { lessonKey, units } from "@/lib/course-data";
import Link from "next/link";

type Skill = {
  id: string;
  name: string;
  progress: number;
  weeklyDelta: number;
  note: string;
};

type Activity = {
  id: string;
  icon: string;
  tint: string;
  title: string;
  detail: string;
  when: string;
};

// B1 · Intermediate — kept consistent with the learner state used in /learn.
const learnerLevel = "B1 · Intermediate";

const skills: Skill[] = [
  {
    id: "speaking",
    name: "Speaking",
    progress: 72,
    weeklyDelta: 3,
    note: "Your strongest skill. Keep practising open questions.",
  },
  {
    id: "listening",
    name: "Listening",
    progress: 64,
    weeklyDelta: 5,
    note: "Fastest improvement this week. Try audio without subtitles.",
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    progress: 81,
    weeklyDelta: 2,
    note: "Highest overall. 46 words learned in this unit.",
  },
  {
    id: "grammar",
    name: "Grammar",
    progress: 58,
    weeklyDelta: -1,
    note: "Needs the most attention — past tenses are still shaky.",
  },
];

const weeklyActivity = [
  { id: "mon", label: "M", minutes: 12, isToday: false },
  { id: "tue", label: "T", minutes: 18, isToday: false },
  { id: "wed", label: "W", minutes: 0, isToday: false },
  { id: "thu", label: "T", minutes: 24, isToday: false },
  { id: "fri", label: "F", minutes: 15, isToday: true },
  { id: "sat", label: "S", minutes: 0, isToday: false },
  { id: "sun", label: "S", minutes: 0, isToday: false },
];


function ProgressBar({
  value,
  label,
  valueText,
  tone = "primary",
}: {
  value: number;
  label: string;
  valueText?: string;
  tone?: "primary" | "gold" | "success";
}) {
  const fillClass =
    tone === "gold"
      ? "bg-[var(--color-gold)]"
      : tone === "success"
        ? "bg-[var(--color-success)]"
        : "bg-[var(--color-primary-navy)]";

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
        className={`h-full rounded-[var(--radius-pill)] transition-[width] duration-500 ease-out ${fillClass}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function WeekBars({
  expandedId,
  onSelectDay,
}: {
  expandedId: string | null;
  onSelectDay: (dayId: string) => void;
}) {
  const maxMinutes = Math.max(...weeklyActivity.map((day) => day.minutes), 1);

  return (
    <div className="mt-4 flex h-28 items-end gap-2">
      {weeklyActivity.map((day, index) => {
        const isActive = expandedId === day.id;
        const isDark = isActive || day.isToday;
        const height = day.minutes === 0 ? 4 : Math.round((day.minutes / maxMinutes) * 92);

        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDay(day.id)}
            aria-pressed={isActive}
            aria-label={
              day.minutes === 0
                ? `No learning on day ${index + 1}`
                : `${day.minutes} minutes on day ${index + 1}`
            }
            className="group flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-[var(--radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)]"
          >
            <span
              className={`w-full rounded-t-[6px] rounded-b-[2px] transition-colors duration-300 ${
                day.minutes === 0
                  ? "bg-[var(--color-border)]"
                  : isDark
                    ? "bg-[var(--color-primary-navy)]"
                    : "bg-[#9db2e0] group-hover:bg-[var(--color-primary-navy)]/80"
              }`}
              style={{ height: `${height}px` }}
            />
            <Typography variant="label" as="span" className={isDark ? "text-[var(--color-primary-navy)]" : "text-[var(--color-text-muted)]"}>
              {day.label}
            </Typography>
          </button>
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const {
    overallProgress,
    completedUnitCount,
    totalUnitCount,
    completedLessonCount,
    totalLessonCount,
    wordsLearned,
    streak,
    completedLessonKeys,
  } = useProgress();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>("fri");

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 650);
    return () => window.clearTimeout(timeout);
  }, []);

  const selectedDay = weeklyActivity.find((day) => day.id === selectedDayId);
  const totalMinutes = weeklyActivity.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = weeklyActivity.filter((day) => day.minutes > 0).length;
  const recentActivity: Activity[] = completedLessonKeys.slice(-4).reverse().flatMap((key) => {
    const unit = units.find((item) => item.lessons.some((lesson) => lessonKey(item.id, lesson.id) === key));
    const lesson = unit?.lessons.find((item) => lessonKey(unit.id, item.id) === key);
    return unit && lesson ? [{
      id: key,
      icon: "✓",
      tint: "#e8f5ee",
      title: lesson.title,
      detail: `Lesson complete · ${unit.title}`,
      when: "Completed",
    }] : [];
  });

  if (isLoading) {
    return (
      <AppShell
        activeNavigationItem="Progress"
        topNavigation={<TopNavigation title="Progress" />}
        contentClassName="[&>div]:max-w-[640px] [&>div]:py-5"
      >
        <div role="status" aria-live="polite" className="space-y-4">
          <span className="sr-only">Loading your progress</span>
          <div aria-hidden="true" className="space-y-4">
            <div className="h-[168px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-navy-tint)]" />
            <div className="h-[128px] animate-pulse rounded-[var(--radius-lg)] bg-[var(--color-navy-tint)]" />
            <div className="space-y-3">
              <div className="h-[72px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-navy-tint)]" />
              <div className="h-[72px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-navy-tint)]" />
              <div className="h-[72px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-navy-tint)]" />
              <div className="h-[72px] animate-pulse rounded-[var(--radius-md)] bg-[var(--color-navy-tint)]" />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      activeNavigationItem="Progress"
      topNavigation={<TopNavigation title="Progress" />}
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-5"
    >
      <div className="space-y-6">
        <section aria-labelledby="streak-heading">
          <Card variant="hero" className="relative overflow-hidden border-0 bg-[var(--color-primary-navy)] p-5 text-white shadow-[0_12px_28px_rgba(0,37,111,0.16)]">
            <div aria-hidden="true" className="absolute -right-16 -top-24 h-56 w-56 rounded-full border-[32px] border-white/5" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography id="streak-heading" variant="label" className="uppercase tracking-[0.12em] text-[var(--color-gold)]">
                    CURRENT STREAK
                  </Typography>
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="font-[var(--text-display-weight)] text-[length:var(--text-display-size)] leading-[var(--text-display-line-height)] text-[var(--color-white)]">
                      {streak}
                    </span>
                    <span className="text-sm font-semibold text-white/80">day streak</span>
                  </p>
                  <Typography variant="body" className="mt-2 max-w-[240px] text-white/80">
                    Your completed lessons are saved on this device. The weekly chart below is sample data.
                  </Typography>
                </div>
                <span aria-hidden="true" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-white/10">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[var(--color-gold)]">
                    <path d="M13.2 2.4c.7 3.3-.6 4.6-1.8 6.1-.8 1-1.2 1.7-1.1 2.6-1.4-.5-2.4-1.5-2.7-2.8C5.5 10.7 4.5 13 4.5 15.2a7.5 7.5 0 0 0 15 0c0-4-2.4-7.6-6.3-12.8ZM12 20a4 4 0 0 1-4-4c0-1.1.5-2.2 1.4-3.2.5 1 1.3 1.6 2.4 1.9-.1-1.2.5-2.2 1.2-3.1 1.7 1.4 3 3.2 3 4.4a4 4 0 0 1-4 4Z" />
                  </svg>
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-white/60">Sample week</dt>
                  <dd className="mt-1 text-base font-semibold text-white">{totalMinutes} min</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-white/60">Sample days</dt>
                  <dd className="mt-1 text-base font-semibold text-white">{activeDays} of 7</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wide text-white/60">Level</dt>
                  <dd className="mt-1 text-base font-semibold text-white">{learnerLevel}</dd>
                </div>
              </dl>
            </div>
          </Card>
        </section>

        <section aria-labelledby="weekly-heading">
          <Card className="border-[var(--color-navy-tint)] shadow-sm shadow-[#001a4d]/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography id="weekly-heading" variant="h3" as="h2">Sample weekly activity</Typography>
                <Typography variant="caption" className="mt-1">Illustrative minutes, not tracked practice</Typography>
              </div>
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                {totalMinutes} min
              </span>
            </div>

            <WeekBars expandedId={selectedDayId} onSelectDay={setSelectedDayId} />

            <div className="mt-4 flex flex-wrap gap-2">
              {weeklyActivity.map((day, index) => (
                <Button
                  key={day.id}
                  variant={selectedDayId === day.id ? "primary" : "secondary"}
                  onClick={() => setSelectedDayId(day.id)}
                  aria-pressed={selectedDayId === day.id}
                  className="min-h-9 px-3 text-xs"
                >
                  {day.minutes === 0 ? `Day ${index + 1}: rest` : `${day.minutes} min`}
                </Button>
              ))}
            </div>

            <div aria-live="polite" className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] p-4">
              <Typography variant="label" as="p" className="text-[var(--color-primary-navy)]">
                {selectedDay
                  ? selectedDay.minutes === 0
                    ? "No practice logged that day"
                    : `${selectedDay.minutes} minutes practised`
                  : "Select a day"}
              </Typography>
              <Typography variant="body" as="p" className="mt-1 text-[var(--color-text-secondary)]">
                {selectedDay
                  ? selectedDay.minutes === 0
                    ? "Rest days are fine — your streak pauses instead of breaking."
                    : selectedDay.isToday
                      ? "Example practice day — your actual lesson progress is shown below."
                      : "Consistency beats long sessions. Short, regular practice sticks best."
                  : "Tap a day to see what happened."}
              </Typography>
            </div>
          </Card>
        </section>

        <section aria-labelledby="overall-heading">
          <Card className="shadow-sm shadow-[#001a4d]/[0.03]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Typography id="overall-heading" variant="h3" as="h2">Overall progress</Typography>
                <Typography variant="caption" className="mt-1">Your path through B1 · Intermediate</Typography>
              </div>
              <span className="shrink-0 rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                {overallProgress}%
              </span>
            </div>

            <div className="mt-5">
              <ProgressBar
                value={overallProgress}
                label="Overall B1 path progress"
                valueText={`${overallProgress} percent of the B1 path complete`}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-[var(--radius-md)] bg-[var(--color-background)] p-3">
                <Typography variant="caption" as="p">Units done</Typography>
                <Typography variant="h3" as="p" className="mt-1">{completedUnitCount} of {totalUnitCount}</Typography>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-background)] p-3">
                <Typography variant="caption" as="p">Lessons</Typography>
                <Typography variant="h3" as="p" className="mt-1">{completedLessonCount} of {totalLessonCount}</Typography>
              </div>
              <div className="rounded-[var(--radius-md)] bg-[var(--color-background)] p-3">
                <Typography variant="caption" as="p">Words</Typography>
                <Typography variant="h3" as="p" className="mt-1">{wordsLearned}</Typography>
              </div>
            </div>
          </Card>
        </section>

        <section aria-labelledby="skills-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Typography id="skills-heading" variant="h2" as="h2">Sample skill estimates</Typography>
            <Typography variant="caption">Illustrative only · lesson completion above is saved progress</Typography>
          </div>

          {skills.map((skill) => {
            const isExpanded = expandedActivityId === skill.id;
            const isDeclining = skill.weeklyDelta < 0;

            return (
              <Card key={skill.id} className="p-0">
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setExpandedActivityId(isExpanded ? null : skill.id)}
                  className="w-full rounded-[var(--radius-md)] p-[var(--card-standard-padding)] text-left transition-colors hover:bg-[var(--color-navy-tint)]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-inset"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <Typography variant="h3" as="span" className="text-base">{skill.name}</Typography>
                    <span className="flex shrink-0 items-baseline gap-2">
                      <Typography
                        variant="label"
                        as="span"
                        className={isDeclining ? "text-[var(--color-error)]" : "text-[var(--color-success)]"}
                      >
                        {isDeclining ? "−1" : `+${skill.weeklyDelta}`} this week
                      </Typography>
                      <Typography variant="label" as="span" className="text-[var(--color-primary-navy)]">
                        {skill.progress}%
                      </Typography>
                    </span>
                  </span>
                  <span className="mt-3 block">
                    <ProgressBar
                      value={skill.progress}
                      label={`${skill.name} mastery`}
                      tone={isDeclining ? "gold" : "primary"}
                    />
                  </span>
                </button>

                {isExpanded ? (
                  <div className="border-t border-[var(--color-border)] px-[var(--card-standard-padding)] py-4">
                    <Typography variant="body" as="p" className="text-[var(--color-text-secondary)]">
                      {skill.note}
                    </Typography>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
                        {skill.progress >= 75 ? "Strong" : skill.progress >= 65 ? "On track" : "Needs focus"}
                      </span>
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-background)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)]">
                        B1 target: 80%
                      </span>
                    </div>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </section>

        <section aria-labelledby="recent-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Typography id="recent-heading" variant="h2" as="h2">Recent activity</Typography>
            <Typography variant="caption">Last 4 sessions</Typography>
          </div>

          <Card className="p-0">
            <ul>
          {recentActivity.length > 0 ? recentActivity.map((item, index) => (
                <li
                  key={item.id}
                  className={index > 0 ? "border-t border-[var(--color-border)]" : ""}
                >
                  <div className="flex items-center gap-3.5 p-[var(--card-standard-padding)]">
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-lg"
                      style={{ backgroundColor: item.tint }}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Typography variant="label" as="p" className="text-[var(--color-text-primary)]">
                        {item.title}
                      </Typography>
                      <Typography variant="caption" as="p" className="mt-0.5">{item.detail}</Typography>
                    </div>
                    <Typography variant="caption" as="p" className="shrink-0 text-[var(--color-text-muted)]">
                      {item.when}
                    </Typography>
                  </div>
                </li>
          )) : (
            <li className="p-[var(--card-standard-padding)]"><Typography variant="body" className="text-[var(--color-text-secondary)]">Complete a lesson to see it here.</Typography></li>
          )}
            </ul>
          </Card>
        </section>

        <Card className="border-0 bg-[var(--color-navy-tint)]">
          <Typography variant="h3" as="h2" className="text-base">What to work on next</Typography>
          <Typography variant="body" as="p" className="mt-1 text-[var(--color-text-secondary)]">
            Grammar is your lowest skill at 58%, and past tenses slipped slightly this week.
            One focused lesson would move the needle.
          </Typography>
          <Link href="/leo" className="mt-4 block">
            <Button variant="secondary" className="w-full">Practise grammar with Leo</Button>
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}
