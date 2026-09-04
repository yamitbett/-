import { GoalValue, Macros, MealType } from '../utils/nutrition';

export interface Profile {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  heightCm: number;
  weightKg: number;
  goal: GoalValue;
  activity: number;
  programId: string | null;
  /** יעדי מאקרו יומיים */
  targets: Macros;
  /** האם היעדים מחושבים אוטומטית מהפרופיל */
  autoTargets: boolean;
  waterTargetMl: number;
  onboarded: boolean;
}

export interface SetLog {
  weight: number | null;
  reps: number | null;
  done: boolean;
}

export interface LoggedExercise {
  exerciseId: string;
  targetReps: string;
  restSeconds: number;
  sets: SetLog[];
  note?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  programId: string | null;
  dayId: string | null;
  name: string;
  subtitle: string;
  startedAt: number;
  finishedAt: number | null;
  exercises: LoggedExercise[];
}

export interface MealEntry {
  id: string;
  date: string;
  meal: MealType;
  foodId: string | null;
  name: string;
  emoji: string;
  grams: number;
  macros: Macros;
  createdAt: number;
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface AppState {
  profile: Profile;
  sessions: WorkoutSession[];
  activeSessionId: string | null;
  meals: MealEntry[];
  weights: WeightEntry[];
  /** כמות מים בליטרים לפי תאריך */
  water: Record<string, number>;
  favoriteFoods: string[];
  /** תרגילים מותאמים אישית שנוספו על ידי המשתמש */
  customExerciseIds: string[];
  version: number;
}
