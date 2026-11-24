"use client";

import type { Phrase, Progress, ScenarioProgress } from "./types";
import {
  clearLegacyStorage,
  clearProgress,
  emptyProgress,
  markPracticed,
  readProgress,
  writeProgress,
} from "./storage";

/* یک store بیرونی کوچک روی localStorage.
   کامپوننت‌ها با useSyncExternalStore به آن وصل می‌شوند تا خواندن
   localStorage خارج از رندر و بدون setState داخل effect انجام شود.
   پیشرفت با شناسهٔ کاربر جاری فعال می‌شود؛ AuthProvider بالاتر از
   AppProvider نشسته و این فعال‌سازی را با تغییر نشست هماهنگ می‌کند. */

export type Snapshot = {
  ready: boolean;
  progress: Progress;
};

const SERVER_SNAPSHOT: Snapshot = {
  ready: false,
  progress: { version: 2, scenarios: {}, words: {}, days: [], streak: 0 },
};

let snapshot: Snapshot = SERVER_SNAPSHOT;
let activeUserId: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSnapshot(): Snapshot {
  return snapshot;
}

export function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

/** از طرف AppProvider بعد از روشن‌شدن وضعیت نشست صدا زده می‌شود. */
export function activateUser(userId: string | null) {
  if (activeUserId === userId && snapshot.ready) return;

  activeUserId = userId;
  snapshot = {
    ready: true,
    progress: userId ? readProgress(userId) : emptyProgress(),
  };
  emit();
}

export function updateProgress(updater: (current: Progress) => Progress) {
  if (!activeUserId) return;

  const next = updater(snapshot.progress);
  writeProgress(activeUserId, next);
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
      scenarios: {
        ...current.scenarios,
        [slug]: { ...updater(previous), updatedAt: new Date().toISOString() },
      },
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

/** پاک‌کردن پیشرفت همین حساب — نه حذف حساب. */
export function resetProgress() {
  if (!activeUserId) return;
  clearProgress(activeUserId);
  clearLegacyStorage();
  snapshot = { ready: true, progress: emptyProgress() };
  emit();
}
