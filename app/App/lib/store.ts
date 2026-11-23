"use client";

import type { Phrase, Profile, Progress, ScenarioProgress } from "./types";
import {
  clearStorage,
  emptyProgress,
  markPracticed,
  readProfile,
  readProgress,
  writeProfile,
  writeProgress,
} from "./storage";

/* یک store بیرونی کوچک روی localStorage.
   کامپوننت‌ها با useSyncExternalStore به آن وصل می‌شوند تا خواندن
   localStorage خارج از رندر و بدون setState داخل effect انجام شود. */

export type Snapshot = {
  ready: boolean;
  profile: Profile | null;
  progress: Progress;
};

const SERVER_SNAPSHOT: Snapshot = {
  ready: false,
  profile: null,
  progress: { version: 2, scenarios: {}, words: {}, days: [], streak: 0 },
};

let snapshot: Snapshot = SERVER_SNAPSHOT;
let started = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function ensureStarted() {
  if (started || typeof window === "undefined") return;
  started = true;
  /* اینجا emit نمی‌کنیم: getSnapshot ممکن است وسط رندر صدا زده شود و
     emit در آن لحظه یعنی به‌روزرسانی کامپوننت در حال رندر. */
  snapshot = {
    ready: true,
    profile: readProfile(),
    progress: readProgress(),
  };
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  ensureStarted();
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Snapshot {
  ensureStarted();
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

export function saveProfile(profile: Profile) {
  writeProfile(profile);
  snapshot = { ...snapshot, profile };
  emit();
}

export function updateProgress(updater: (current: Progress) => Progress) {
  const next = updater(snapshot.progress);
  writeProgress(next);
  snapshot = { ...snapshot, progress: next };
  emit();
}

export function patchScenario(
  slug: string,
  updater: (current: ScenarioProgress) => ScenarioProgress,
) {
  updateProgress((current) => {
    const previous = current.scenarios[slug] ?? {
      stepIndex: 0,
      chooseAnswers: {},
      buildAnswer: {},
      turns: [],
      startedAt: new Date().toISOString(),
    };
    return {
      ...current,
      scenarios: { ...current.scenarios, [slug]: updater(previous) },
    };
  });
}

export function completeScenario(slug: string, words: Phrase[]) {
  const now = new Date().toISOString();

  updateProgress((current) => {
    const previous = current.scenarios[slug];
    /* رفرش صفحهٔ نتیجه نباید واژه‌ها را دوباره ثبت کند */
    if (previous?.completedAt) return current;

    const base = previous ?? {
      stepIndex: 0,
      chooseAnswers: {},
      buildAnswer: {},
      turns: [],
      startedAt: now,
    };

    const wordMap = { ...current.words };
    for (const word of words) {
      const existing = wordMap[word.en];
      wordMap[word.en] = {
        fa: word.fa,
        seen: (existing?.seen ?? 0) + 1,
        lastSeenAt: now,
      };
    }

    return markPracticed({
      ...current,
      scenarios: {
        ...current.scenarios,
        [slug]: { ...base, completedAt: now },
      },
      words: wordMap,
    });
  });
}

export function resetAll() {
  clearStorage();
  snapshot = {
    ready: true,
    profile: null,
    progress: emptyProgress(),
  };
  emit();
}
