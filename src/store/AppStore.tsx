import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { EXERCISE_BY_ID } from '../data/exercises';
import { Food } from '../data/foods';
import { findDay, PROGRAM_BY_ID, WorkoutDay } from '../data/programs';
import { toKey } from '../utils/date';
import {
  calcTargets,
  Macros,
  macrosFor,
  MealType,
  sumMacros,
} from '../utils/nutrition';
import {
  AppState,
  LoggedExercise,
  MealEntry,
  Profile,
  WorkoutSession,
} from './types';

const STORAGE_KEY = 'fitbuddy:state:v1';

const DEFAULT_PROFILE: Profile = {
  name: '',
  gender: 'male',
  age: 28,
  heightCm: 175,
  weightKg: 75,
  goal: 'gain',
  activity: 1.55,
  programId: null,
  targets: { calories: 2400, protein: 180, carbs: 250, fat: 70 },
  autoTargets: true,
  waterTargetMl: 3000,
  onboarded: false,
};

const INITIAL_STATE: AppState = {
  profile: DEFAULT_PROFILE,
  sessions: [],
  activeSessionId: null,
  meals: [],
  weights: [],
  water: {},
  favoriteFoods: [],
  customExerciseIds: [],
  version: 1,
};

const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

interface AppStoreValue {
  state: AppState;
  hydrated: boolean;
  // פרופיל
  updateProfile: (patch: Partial<Profile>) => void;
  recalcTargets: (override?: Partial<Profile>) => void;
  resetAll: () => void;
  // אימונים
  activeSession: WorkoutSession | null;
  startWorkout: (programId: string, dayId: string) => WorkoutSession;
  startEmptyWorkout: (name?: string) => WorkoutSession;
  updateSet: (
    exerciseIndex: number,
    setIndex: number,
    patch: Partial<{ weight: number | null; reps: number | null; done: boolean }>,
  ) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number) => void;
  addExerciseToSession: (exerciseId: string) => void;
  removeExerciseFromSession: (exerciseIndex: number) => void;
  replaceExerciseInSession: (exerciseIndex: number, newExerciseId: string) => void;
  finishWorkout: () => WorkoutSession | null;
  cancelWorkout: () => void;
  // תזונה
  addMeal: (input: {
    date: string;
    meal: MealType;
    food?: Food;
    grams: number;
    customName?: string;
    customMacros?: Macros;
  }) => void;
  removeMeal: (id: string) => void;
  toggleFavoriteFood: (foodId: string) => void;
  mealsFor: (date: string) => MealEntry[];
  macrosFor: (date: string) => Macros;
  // מים ומשקל
  addWater: (date: string, ml: number) => void;
  logWeight: (kg: number, date?: string) => void;
  // סטטיסטיקה
  historyFor: (exerciseId: string) => {
    date: string;
    best: { weight: number; reps: number } | null;
    volume: number;
  }[];
  personalRecord: (exerciseId: string) => { weight: number; reps: number } | null;
  streak: () => number;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

/**
 * מנקה אימון פעיל שנפתח ולא תועד בו אף סט, כדי שלא יצטברו אימונים ריקים
 * כשמתחילים אימון חדש מבלי לסיים את הקודם.
 */
function dropEmptyActive(state: AppState): WorkoutSession[] {
  if (!state.activeSessionId) return state.sessions;
  return state.sessions.filter((s) => {
    if (s.id !== state.activeSessionId) return true;
    return s.exercises.some((e) => e.sets.some((x) => x.done));
  });
}

function buildExercisesFromDay(day: WorkoutDay): LoggedExercise[] {
  return day.exercises.map((pe) => ({
    exerciseId: pe.exerciseId,
    targetReps: pe.reps,
    restSeconds: pe.restSeconds,
    note: pe.note,
    sets: Array.from({ length: pe.sets }, () => ({
      weight: null,
      reps: null,
      done: false,
    })),
  }));
}

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // טעינה מהאחסון המקומי
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          setState((prev) => ({
            ...prev,
            ...parsed,
            profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
          }));
        }
      } catch {
        // מתעלמים – נתחיל ממצב ריק
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // שמירה עם השהיה קצרה כדי לא לכתוב על כל הקלדה
  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 350);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const activeSession = useMemo(
    () => state.sessions.find((s) => s.id === state.activeSessionId) ?? null,
    [state.sessions, state.activeSessionId],
  );

  const mutateActive = useCallback(
    (fn: (s: WorkoutSession) => WorkoutSession) => {
      setState((prev) => {
        if (!prev.activeSessionId) return prev;
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === prev.activeSessionId ? fn(s) : s,
          ),
        };
      });
    },
    [],
  );

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((prev) => {
      const profile = { ...prev.profile, ...patch };
      if (profile.autoTargets) {
        profile.targets = calcTargets({
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          age: profile.age,
          gender: profile.gender,
          activity: profile.activity,
          goal: profile.goal,
        });
      }
      return { ...prev, profile };
    });
  }, []);

  const recalcTargets = useCallback((override: Partial<Profile> = {}) => {
    setState((prev) => {
      const p = { ...prev.profile, ...override };
      return {
        ...prev,
        profile: {
          ...p,
          targets: calcTargets({
            weightKg: p.weightKg,
            heightCm: p.heightCm,
            age: p.age,
            gender: p.gender,
            activity: p.activity,
            goal: p.goal,
          }),
        },
      };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState(INITIAL_STATE);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, []);

  const startWorkout = useCallback((programId: string, dayId: string) => {
    const program = PROGRAM_BY_ID[programId];
    const day = findDay(programId, dayId);
    const session: WorkoutSession = {
      id: uid(),
      date: toKey(),
      programId,
      dayId,
      name: day?.name ?? 'אימון',
      subtitle: day?.subtitle ?? program?.name ?? '',
      startedAt: Date.now(),
      finishedAt: null,
      exercises: day ? buildExercisesFromDay(day) : [],
    };
    setState((prev) => ({
      ...prev,
      sessions: [session, ...dropEmptyActive(prev)],
      activeSessionId: session.id,
    }));
    return session;
  }, []);

  const startEmptyWorkout = useCallback((name = 'אימון חופשי') => {
    const session: WorkoutSession = {
      id: uid(),
      date: toKey(),
      programId: null,
      dayId: null,
      name,
      subtitle: 'אימון שבניתם בעצמכם',
      startedAt: Date.now(),
      finishedAt: null,
      exercises: [],
    };
    setState((prev) => ({
      ...prev,
      sessions: [session, ...dropEmptyActive(prev)],
      activeSessionId: session.id,
    }));
    return session;
  }, []);

  const updateSet: AppStoreValue['updateSet'] = useCallback(
    (exerciseIndex, setIndex, patch) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e, i) =>
          i !== exerciseIndex
            ? e
            : {
                ...e,
                sets: e.sets.map((set, j) =>
                  j !== setIndex ? set : { ...set, ...patch },
                ),
              },
        ),
      }));
    },
    [mutateActive],
  );

  const addSet = useCallback(
    (exerciseIndex: number) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e, i) =>
          i !== exerciseIndex
            ? e
            : {
                ...e,
                sets: [
                  ...e.sets,
                  {
                    weight: e.sets[e.sets.length - 1]?.weight ?? null,
                    reps: null,
                    done: false,
                  },
                ],
              },
        ),
      }));
    },
    [mutateActive],
  );

  const removeSet = useCallback(
    (exerciseIndex: number) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e, i) =>
          i !== exerciseIndex || e.sets.length <= 1
            ? e
            : { ...e, sets: e.sets.slice(0, -1) },
        ),
      }));
    },
    [mutateActive],
  );

  const addExerciseToSession = useCallback(
    (exerciseId: string) => {
      const meta = EXERCISE_BY_ID[exerciseId];
      mutateActive((s) => ({
        ...s,
        exercises: [
          ...s.exercises,
          {
            exerciseId,
            targetReps: meta?.defaultReps ?? '10-12',
            restSeconds: meta?.rest ?? 90,
            sets: Array.from({ length: meta?.defaultSets ?? 3 }, () => ({
              weight: null,
              reps: null,
              done: false,
            })),
          },
        ],
      }));
    },
    [mutateActive],
  );

  const removeExerciseFromSession = useCallback(
    (exerciseIndex: number) => {
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.filter((_, i) => i !== exerciseIndex),
      }));
    },
    [mutateActive],
  );

  const replaceExerciseInSession = useCallback(
    (exerciseIndex: number, newExerciseId: string) => {
      const meta = EXERCISE_BY_ID[newExerciseId];
      mutateActive((s) => ({
        ...s,
        exercises: s.exercises.map((e, i) =>
          i !== exerciseIndex
            ? e
            : {
                ...e,
                exerciseId: newExerciseId,
                targetReps: meta?.defaultReps ?? e.targetReps,
                restSeconds: meta?.rest ?? e.restSeconds,
                sets: e.sets.map(() => ({ weight: null, reps: null, done: false })),
              },
        ),
      }));
    },
    [mutateActive],
  );

  const finishWorkout = useCallback(() => {
    let finished: WorkoutSession | null = null;
    setState((prev) => {
      if (!prev.activeSessionId) return prev;
      const sessions = prev.sessions.map((s) => {
        if (s.id !== prev.activeSessionId) return s;
        finished = { ...s, finishedAt: Date.now() };
        return finished;
      });
      return { ...prev, sessions, activeSessionId: null };
    });
    return finished;
  }, []);

  const cancelWorkout = useCallback(() => {
    setState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== prev.activeSessionId),
      activeSessionId: null,
    }));
  }, []);

  const addMeal: AppStoreValue['addMeal'] = useCallback((input) => {
    const macros =
      input.customMacros ??
      (input.food ? macrosFor(input.food, input.grams) : null);
    if (!macros) return;
    const entry: MealEntry = {
      id: uid(),
      date: input.date,
      meal: input.meal,
      foodId: input.food?.id ?? null,
      name: input.customName ?? input.food?.name ?? 'פריט',
      emoji: input.food?.emoji ?? '🍽️',
      grams: input.grams,
      macros,
      createdAt: Date.now(),
    };
    setState((prev) => ({ ...prev, meals: [entry, ...prev.meals] }));
  }, []);

  const removeMeal = useCallback((id: string) => {
    setState((prev) => ({ ...prev, meals: prev.meals.filter((m) => m.id !== id) }));
  }, []);

  const toggleFavoriteFood = useCallback((foodId: string) => {
    setState((prev) => ({
      ...prev,
      favoriteFoods: prev.favoriteFoods.includes(foodId)
        ? prev.favoriteFoods.filter((f) => f !== foodId)
        : [...prev.favoriteFoods, foodId],
    }));
  }, []);

  const mealsForDate = useCallback(
    (date: string) => state.meals.filter((m) => m.date === date),
    [state.meals],
  );

  const macrosForDate = useCallback(
    (date: string) => sumMacros(mealsForDate(date).map((m) => m.macros)),
    [mealsForDate],
  );

  const addWater = useCallback((date: string, ml: number) => {
    setState((prev) => ({
      ...prev,
      water: {
        ...prev.water,
        [date]: Math.max(0, (prev.water[date] ?? 0) + ml),
      },
    }));
  }, []);

  const logWeight = useCallback((kg: number, date: string = toKey()) => {
    setState((prev) => {
      const others = prev.weights.filter((w) => w.date !== date);
      const weights = [...others, { date, kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const profile = { ...prev.profile, weightKg: kg };
      if (profile.autoTargets) {
        profile.targets = calcTargets({
          weightKg: profile.weightKg,
          heightCm: profile.heightCm,
          age: profile.age,
          gender: profile.gender,
          activity: profile.activity,
          goal: profile.goal,
        });
      }
      return { ...prev, weights, profile };
    });
  }, []);

  const historyFor = useCallback(
    (exerciseId: string) => {
      return state.sessions
        .filter((s) => s.finishedAt)
        .map((s) => {
          const ex = s.exercises.find((e) => e.exerciseId === exerciseId);
          if (!ex) return null;
          const done = ex.sets.filter((x) => x.done && x.weight != null && x.reps != null);
          if (done.length === 0) return null;
          const best = done.reduce(
            (acc, x) =>
              !acc || (x.weight ?? 0) > acc.weight
                ? { weight: x.weight ?? 0, reps: x.reps ?? 0 }
                : acc,
            null as { weight: number; reps: number } | null,
          );
          const volume = done.reduce(
            (sum, x) => sum + (x.weight ?? 0) * (x.reps ?? 0),
            0,
          );
          return { date: s.date, best, volume };
        })
        .filter(Boolean) as { date: string; best: { weight: number; reps: number } | null; volume: number }[];
    },
    [state.sessions],
  );

  const personalRecord = useCallback(
    (exerciseId: string) => {
      const all = historyFor(exerciseId)
        .map((h) => h.best)
        .filter(Boolean) as { weight: number; reps: number }[];
      if (all.length === 0) return null;
      return all.reduce((a, b) => (b.weight > a.weight ? b : a));
    },
    [historyFor],
  );

  const streak = useCallback(() => {
    const done = new Set(
      state.sessions.filter((s) => s.finishedAt).map((s) => s.date),
    );
    if (done.size === 0) return 0;
    let count = 0;
    const d = new Date();
    // מתחילים מהיום; אם היום אין אימון, בודקים מאתמול
    if (!done.has(toKey(d))) d.setDate(d.getDate() - 1);
    for (;;) {
      if (done.has(toKey(d))) {
        count += 1;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return count;
  }, [state.sessions]);

  const value: AppStoreValue = {
    state,
    hydrated,
    updateProfile,
    recalcTargets,
    resetAll,
    activeSession,
    startWorkout,
    startEmptyWorkout,
    updateSet,
    addSet,
    removeSet,
    addExerciseToSession,
    removeExerciseFromSession,
    replaceExerciseInSession,
    finishWorkout,
    cancelWorkout,
    addMeal,
    removeMeal,
    toggleFavoriteFood,
    mealsFor: mealsForDate,
    macrosFor: macrosForDate,
    addWater,
    logWeight,
    historyFor,
    personalRecord,
    streak,
  };

  return (
    <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
  );
}

export function useApp(): AppStoreValue {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useApp חייב לרוץ בתוך AppStoreProvider');
  return ctx;
}
