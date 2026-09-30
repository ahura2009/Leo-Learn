"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  allLessonKeys,
  baselineCompletedKeys,
  learner,
  lessonKey,
  lessonWords,
  totalLessonCount,
  units,
} from "./course-data";

const STORAGE_KEY = "leo-learn:progress";

type ProgressState = {
  completedLessonKeys: string[];
  wordsLearned: number;
  streak: number;
  // ISO date (YYYY-MM-DD) of the last day a practice counted toward the streak.
  lastPracticeDate: string | null;
};

type ProgressContextValue = {
  completedLessonKeys: string[];
  completedLessonCount: number;
  totalLessonCount: number;
  completedUnitCount: number;
  totalUnitCount: number;
  overallProgress: number;
  wordsLearned: number;
  streak: number;
  practicedToday: boolean;
  isHydrated: boolean;
  isLessonComplete: (unitId: string, lessonId: string) => boolean;
  completeLesson: (unitId: string, lessonId: string) => void;
  recordPractice: () => void;
  resetProgress: () => void;
};

const baselineState: ProgressState = {
  completedLessonKeys: baselineCompletedKeys,
  wordsLearned: learner.baselineWords,
  streak: learner.baselineStreak,
  // Seeded to today so the first practice in this session does not double-count.
  lastPracticeDate: null,
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const todayKey = () => dateKey(new Date());
const yesterdayKey = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dateKey(yesterday);
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function readStoredState(): ProgressState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ProgressState>;

    if (!Array.isArray(parsed.completedLessonKeys)) {
      return null;
    }

    return {
      completedLessonKeys: parsed.completedLessonKeys.filter(
        (key): key is string => typeof key === "string" && allLessonKeys.includes(key),
      ),
      wordsLearned:
        typeof parsed.wordsLearned === "number" ? parsed.wordsLearned : learner.baselineWords,
      streak: typeof parsed.streak === "number" ? parsed.streak : baselineState.streak,
      lastPracticeDate:
        typeof parsed.lastPracticeDate === "string" ? parsed.lastPracticeDate : null,
    };
  } catch {
    return null;
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(baselineState);
  const [isHydrated, setIsHydrated] = useState(false);

  // Read persisted progress after mount so server and client render the same baseline.
  useEffect(() => {
    const stored = readStoredState();

    if (stored) {
      // Hydrate browser-only progress after the server baseline has rendered.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(stored);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage can be unavailable (private mode, quota). Progress stays in memory.
    }
  }, [state, isHydrated]);

  const completeLesson = useCallback((unitId: string, lessonId: string) => {
    const key = lessonKey(unitId, lessonId);

    setState((current) => {
      if (current.completedLessonKeys.includes(key)) {
        return current;
      }

      // Finishing a lesson is also a practice, so it counts toward the streak
      // under the same once-per-day rule.
      const today = todayKey();
      const countsForStreak = current.lastPracticeDate !== today;

      return {
        ...current,
        completedLessonKeys: [...current.completedLessonKeys, key],
        wordsLearned: current.wordsLearned + lessonWords(unitId, lessonId),
        streak: countsForStreak
          ? current.lastPracticeDate === null || current.lastPracticeDate === yesterdayKey()
            ? current.streak + 1
            : 1
          : current.streak,
        lastPracticeDate: countsForStreak ? today : current.lastPracticeDate,
      };
    });
  }, []);

  const recordPractice = useCallback(() => {
    setState((current) => {
      const today = todayKey();

      // One practice per calendar day counts toward the streak.
      if (current.lastPracticeDate === today) {
        return current;
      }

      return {
        ...current,
        streak: current.lastPracticeDate === null || current.lastPracticeDate === yesterdayKey()
          ? current.streak + 1
          : 1,
        lastPracticeDate: today,
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState(baselineState);
  }, []);

  const value = useMemo<ProgressContextValue>(() => {
    const completedLessonKeys = state.completedLessonKeys;
    const uniqueCompleted = new Set(completedLessonKeys);
    const completedLessons = allLessonKeys.filter((key) => uniqueCompleted.has(key)).length;

    const completedUnits = units.filter((unit) =>
      unit.lessons.every((lesson) => uniqueCompleted.has(lessonKey(unit.id, lesson.id))),
    ).length;

    // Fractional credit for a partially finished unit keeps the number moving
    // between whole-unit milestones.
    const partialCredit = units.reduce((sum, unit) => {
      const completedInUnit = unit.lessons.filter((lesson) =>
        uniqueCompleted.has(lessonKey(unit.id, lesson.id)),
      ).length;
      const ratio = completedInUnit / unit.lessons.length;
      return sum + (ratio === 1 ? 0 : ratio);
    }, 0);

    const overallProgress = Math.round(
      ((completedUnits + partialCredit) / units.length) * 100,
    );

    return {
      completedLessonKeys,
      completedLessonCount: completedLessons,
      totalLessonCount,
      completedUnitCount: completedUnits,
      totalUnitCount: units.length,
      overallProgress,
      wordsLearned: state.wordsLearned,
      streak: state.streak,
      practicedToday: isHydrated && state.lastPracticeDate === todayKey(),
      isHydrated,
      isLessonComplete: (unitId, lessonId) =>
        uniqueCompleted.has(lessonKey(unitId, lessonId)),
      completeLesson,
      recordPractice,
      resetProgress,
    };
  }, [state, isHydrated, completeLesson, recordPractice, resetProgress]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error("useProgress must be used inside a ProgressProvider");
  }

  return context;
}
