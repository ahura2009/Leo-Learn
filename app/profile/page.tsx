"use client";

import Image from "next/image";
import { assetPath } from "@/lib/asset-path";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TopNavigation } from "@/components/layout/TopNavigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { learner } from "@/lib/course-data";
import { useProgress } from "@/lib/progress-store";

type Goal = {
  id: string;
  label: string;
  detail: string;
};

type SettingsRow = {
  id: string;
  label: string;
  detail: string;
  type: "toggle" | "select";
  value: string;
  options?: string[];
};

// Goals chosen during onboarding, kept consistent with /onboarding/goals and /onboarding/motivation.
const goals: Goal[] = [
  { id: "goal-speaking", label: "Speaking", detail: "Primary focus" },
  { id: "goal-vocabulary", label: "Vocabulary", detail: "Strongest skill" },
  { id: "goal-listening", label: "Listening", detail: "Improving fastest" },
];

const motivation = "Build confidence";

const settingsRows: SettingsRow[] = [
  {
    id: "notifications",
    label: "Daily reminders",
    detail: "A gentle nudge at 7:30 PM",
    type: "toggle",
    value: "on",
  },
  {
    id: "appearance",
    label: "Appearance",
    detail: "Light theme across the app",
    type: "select",
    value: "Light",
    options: ["Light", "Dark", "System"],
  },
  {
    id: "language",
    label: "Explanation language",
    detail: "Used for hints and translations",
    type: "select",
    value: "English",
    options: ["English", "Persian", "Arabic"],
  },
  {
    id: "help",
    label: "Help & support",
    detail: "Guides, FAQs, and contact",
    type: "select",
    value: "Open",
    options: [],
  },
];

function LevelPill() {
  return (
    <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-navy-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary-navy)]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5">
        <path
          d="M12 2 3 6.5v5c0 5 3.8 9.2 9 10.5 5.2-1.3 9-5.5 9-10.5v-5L12 2Z"
          fill="currentColor"
        />
      </svg>
      B1 · Intermediate
    </span>
  );
}

export default function ProfilePage() {
  const { completedLessonCount, totalLessonCount, wordsLearned, streak } = useProgress();
  const stats = [
    { id: "stat-lessons", label: "Lessons", value: completedLessonCount, detail: `of ${totalLessonCount}` },
    { id: "stat-words", label: "Words learned", value: wordsLearned, detail: "this level" },
    { id: "stat-streak", label: "Day streak", value: streak, detail: `best: ${Math.max(learner.bestStreak, streak)}` },
  ];
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("Alex Morgan");
  const [draftName, setDraftName] = useState("Alex Morgan");
  const [feedback, setFeedback] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notifications: true,
  });
  const [selects, setSelects] = useState<Record<string, string>>({
    appearance: "Light",
    language: "English",
  });
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSaveName = () => {
    const trimmed = draftName.trim();

    if (!trimmed) {
      return;
    }

    setName(trimmed);
    setIsEditing(false);
    setFeedback("Profile updated.");
    window.setTimeout(() => setFeedback(""), 2400);
  };

  const handleSelect = (row: SettingsRow) => {
    const options = row.options ?? [];

    if (options.length === 0) {
      setFeedback(`${row.label} opens in the full app.`);
      window.setTimeout(() => setFeedback(""), 2400);
      return;
    }

    const currentIndex = options.indexOf(selects[row.id] ?? row.value);
    const nextValue = options[(currentIndex + 1) % options.length];

    setSelects((current) => ({ ...current, [row.id]: nextValue }));
    setFeedback(`${row.label}: ${nextValue}`);
    window.setTimeout(() => setFeedback(""), 2400);
  };

  return (
    <AppShell
      activeNavigationItem="Profile"
      topNavigation={<TopNavigation title="Profile" />}
      contentClassName="[&>div]:max-w-[640px] [&>div]:py-5"
    >
      <div className="space-y-6">
        <section aria-labelledby="profile-heading">
          <Card variant="hero" className="shadow-sm shadow-[#001a4d]/[0.04]">
            <div className="flex items-center gap-4">
              <span
                aria-hidden="true"
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-primary-navy)] font-[var(--text-h2-weight)] text-[length:var(--text-h2-size)] text-[var(--color-white)]"
              >
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <Typography id="profile-heading" variant="h2" as="h2" className="truncate">
                  {name}
                </Typography>
                <Typography variant="caption" as="p" className="mt-0.5">
                  Learning since August 2026
                </Typography>
                <div className="mt-2.5">
                  <LevelPill />
                </div>
              </div>
            </div>

            {isEditing ? (
              <div className="mt-5 rounded-[var(--radius-md)] bg-[var(--color-navy-tint)] p-4">
                <label htmlFor="profile-name" className="block text-xs font-semibold text-[var(--color-primary-navy)]">
                  Display name
                </label>
                <input
                  id="profile-name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="mt-2 min-h-[48px] w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] px-4 text-sm text-[var(--color-text-primary)] focus-visible:border-[var(--color-primary-navy)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    className="min-h-11 flex-1 text-xs"
                    disabled={draftName.trim().length === 0}
                    onClick={handleSaveName}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1 text-xs"
                    onClick={() => {
                      setDraftName(name);
                      setIsEditing(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="secondary"
                className="mt-5 w-full"
                onClick={() => {
                  setDraftName(name);
                  setIsEditing(true);
                }}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                  <path
                    d="M4 20h4l10.5-10.5a2.12 2.12 0 0 0-3-3L5 17v3Zm12.5-11.5 1-1a.7.7 0 0 0-1-1l-1 1 1 1Z"
                    fill="currentColor"
                  />
                </svg>
                Edit profile
              </Button>
            )}
          </Card>
        </section>

        <section aria-labelledby="goals-heading">
          <Card className="space-y-4">
            <div>
              <Typography id="goals-heading" variant="h3" as="h2">Your goals</Typography>
              <Typography variant="caption" as="p" className="mt-1">
                Chosen during setup · motivation: {motivation.toLowerCase()}
              </Typography>
            </div>
            <ul className="flex flex-wrap gap-2">
              {goals.map((goal) => (
                <li key={goal.id}>
                  <span className="inline-flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-white)] px-3.5 py-2.5">
                    <Typography variant="label" as="span" className="text-[var(--color-text-primary)]">
                      {goal.label}
                    </Typography>
                    <Typography variant="caption" as="span" className="mt-0.5 text-[var(--color-text-muted)]">
                      {goal.detail}
                    </Typography>
                  </span>
                </li>
              ))}
            </ul>
            <Button variant="ghost" className="min-h-11 px-0 text-xs">
              Update goals
            </Button>
          </Card>
        </section>

        <section aria-labelledby="stats-heading" className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <Typography id="stats-heading" variant="h2" as="h2">Your learning</Typography>
            <Typography variant="caption">All time</Typography>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <Card key={stat.id} className="p-3.5">
                <Typography variant="caption" as="p">{stat.label}</Typography>
                <p className="mt-1.5 font-[var(--text-h2-weight)] text-[length:var(--text-h2-size)] leading-[var(--text-h2-line-height)] text-[var(--color-primary-navy)]">
                  {stat.value}
                </p>
                <Typography variant="caption" as="p" className="mt-0.5 text-[var(--color-text-muted)]">
                  {stat.detail}
                </Typography>
              </Card>
            ))}
          </div>
        </section>

        <section aria-labelledby="settings-heading" className="space-y-3">
          <Typography id="settings-heading" variant="h2" as="h2">Preferences</Typography>
          <Card className="p-0">
            <ul>
              {settingsRows.map((row, index) => {
                const isToggle = row.type === "toggle";
                const isOn = toggles[row.id] ?? false;

                return (
                  <li key={row.id} className={index > 0 ? "border-t border-[var(--color-border)]" : ""}>
                    <div className="flex items-center gap-3 p-[var(--card-standard-padding)]">
                      <div className="min-w-0 flex-1">
                        <Typography variant="label" as="p" className="text-[var(--color-text-primary)]">
                          {row.label}
                        </Typography>
                        <Typography variant="caption" as="p" className="mt-0.5">{row.detail}</Typography>
                      </div>

                      {isToggle ? (
                        <button
                          type="button"
                          role="switch"
                          aria-checked={isOn}
                          aria-label={row.label}
                          onClick={() =>
                            setToggles((current) => ({ ...current, [row.id]: !isOn }))
                          }
                          className={`relative h-7 w-12 shrink-0 rounded-[var(--radius-pill)] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-white)] ${
                            isOn ? "bg-[var(--color-primary-navy)]" : "bg-[var(--color-border)]"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`absolute top-1 h-5 w-5 rounded-[var(--radius-pill)] bg-[var(--color-white)] shadow transition-[left] duration-200 ${
                              isOn ? "left-6" : "left-1"
                            }`}
                          />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSelect(row)}
                          className="flex shrink-0 items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 transition-colors hover:bg-[var(--color-navy-tint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)]"
                        >
                          <Typography variant="label" as="span" className="text-[var(--color-primary-navy)]">
                            {selects[row.id] ?? row.value}
                          </Typography>
                          {(row.options ?? []).length > 0 ? (
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[var(--color-text-muted)]">
                              <path d="M7 10 12 15 17 10Z" fill="currentColor" />
                            </svg>
                          ) : (
                            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 text-[var(--color-text-muted)]">
                              <path
                                d="M9.3 5.3a.75.75 0 0 1 1.06 0l5.72 5.72a.75.75 0 0 1 0 1.06L10.36 17.8a.75.75 0 0 1-1.06-1.06L14.36 12 9.3 6.36a.75.75 0 0 1 0-1.06Z"
                                fill="currentColor"
                              />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </section>

        <Card className="flex items-center gap-4 border-0 bg-[var(--color-navy-tint)]">
          <Image
            src={assetPath("/images/leo-character.png")}
            alt=""
            width={64}
            height={64}
            className="h-auto w-16 shrink-0 object-contain"
          />
          <div>
            <Typography variant="h3" as="h2" className="text-base">Leo Learn</Typography>
            <Typography variant="caption" as="p" className="mt-1">
              Version 0.1.0 · Prototype build
            </Typography>
          </div>
        </Card>

        <section aria-labelledby="account-heading" className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-border)]" />
            <Typography id="account-heading" variant="caption" as="h2" className="text-[var(--color-text-muted)]">
              Account
            </Typography>
            <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <Card className="border-[#f3d9d9]">
            {isSignOutOpen ? (
              <div>
                <Typography variant="label" as="p" className="text-[var(--color-error)]">
                  Sign out of Leo Learn?
                </Typography>
                <Typography variant="caption" as="p" className="mt-1">
                  This is a prototype — sign-out is not connected to a real account.
                </Typography>
                <div className="mt-4 flex gap-2">
                  <Button
                    className="min-h-11 flex-1 border-transparent bg-[var(--color-error)] text-xs text-[var(--color-white)] hover:bg-[#bf3a3a] active:bg-[#a83232]"
                    onClick={() => {
                      setIsSignOutOpen(false);
                      setFeedback("Sign-out is disabled in this prototype.");
                      window.setTimeout(() => setFeedback(""), 2600);
                    }}
                  >
                    Sign out
                  </Button>
                  <Button
                    variant="outline"
                    className="min-h-11 flex-1 text-xs"
                    onClick={() => setIsSignOutOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Typography variant="label" as="p" className="text-[var(--color-text-primary)]">
                    Sign out
                  </Typography>
                  <Typography variant="caption" as="p" className="mt-0.5">
                    You are signed in as {name.toLowerCase().replace(" ", ".")}@example.com
                  </Typography>
                </div>
                <Button
                  variant="outline"
                  className="min-h-10 shrink-0 px-3 text-xs"
                  onClick={() => setIsSignOutOpen(true)}
                >
                  Sign out
                </Button>
              </div>
            )}
          </Card>
        </section>

        <div aria-live="polite" role="status" className="sr-only">
          {feedback}
        </div>
        {feedback ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-32 z-40 flex justify-center px-[var(--space-4)]">
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
