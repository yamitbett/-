import { Food } from '../data/foods';

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const EMPTY_MACROS: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

export function macrosFor(food: Food, grams: number): Macros {
  const k = grams / 100;
  return {
    calories: Math.round(food.per100.calories * k),
    protein: round1(food.per100.protein * k),
    carbs: round1(food.per100.carbs * k),
    fat: round1(food.per100.fat * k),
  };
}

export function sumMacros(list: Macros[]): Macros {
  return list.reduce<Macros>(
    (acc, m) => ({
      calories: acc.calories + m.calories,
      protein: acc.protein + m.protein,
      carbs: acc.carbs + m.carbs,
      fat: acc.fat + m.fat,
    }),
    { ...EMPTY_MACROS },
  );
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** חישוב BMR לפי נוסחת Mifflin-St Jeor */
export function bmr(opts: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
}): number {
  const base = 10 * opts.weightKg + 6.25 * opts.heightCm - 5 * opts.age;
  if (opts.gender === 'male') return base + 5;
  if (opts.gender === 'female') return base - 161;
  return base - 78;
}

export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'יושבני', hint: 'מעט מאוד פעילות' },
  { value: 1.375, label: 'קל', hint: '1-3 אימונים בשבוע' },
  { value: 1.55, label: 'בינוני', hint: '3-5 אימונים בשבוע' },
  { value: 1.725, label: 'גבוה', hint: '6-7 אימונים בשבוע' },
  { value: 1.9, label: 'מאוד גבוה', hint: 'ספורטאי / עבודה פיזית' },
] as const;

export const GOAL_OPTIONS = [
  { value: 'lose', label: 'ירידה במשקל', delta: -0.18, emoji: '🔥' },
  { value: 'maintain', label: 'שמירה', delta: 0, emoji: '⚖️' },
  { value: 'gain', label: 'עלייה במסה', delta: 0.12, emoji: '💪' },
] as const;

export type GoalValue = (typeof GOAL_OPTIONS)[number]['value'];

/**
 * חישוב יעדים יומיים אוטומטי:
 * קלוריות לפי TDEE ויעד, חלבון לפי משקל גוף, שומן כ־25% מהקלוריות, השאר פחמימות.
 */
export function calcTargets(opts: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
  activity: number;
  goal: GoalValue;
}): Macros {
  const tdee = bmr(opts) * opts.activity;
  const goalOpt = GOAL_OPTIONS.find((g) => g.value === opts.goal)!;
  const calories = Math.round((tdee * (1 + goalOpt.delta)) / 10) * 10;

  const proteinPerKg = opts.goal === 'lose' ? 2.2 : opts.goal === 'gain' ? 1.9 : 1.8;
  const protein = Math.round(opts.weightKg * proteinPerKg);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbs, fat };
}

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'ארוחת בוקר', emoji: '🌅' },
  { id: 'lunch', label: 'ארוחת צהריים', emoji: '☀️' },
  { id: 'dinner', label: 'ארוחת ערב', emoji: '🌙' },
  { id: 'snacks', label: 'נשנושים', emoji: '🍎' },
] as const;

export type MealType = (typeof MEAL_TYPES)[number]['id'];
