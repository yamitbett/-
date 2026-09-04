export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'core'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'bands'
  | 'kettlebell';

export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  /** מזהה פנימי */
  id: string;
  /** מזהה במאגר ההדגמות הציבורי (free-exercise-db) – משמש לתמונות ההדגמה */
  demoId: string | null;
  name: string;
  nameEn: string;
  muscle: MuscleGroup;
  secondary: MuscleGroup[];
  equipment: Equipment;
  level: Level;
  /** הסבר טכניקה שלב אחר שלב */
  steps: string[];
  /** טיפים למתאמן */
  tips: string[];
  /** טעויות נפוצות */
  mistakes: string[];
  defaultSets: number;
  defaultReps: string;
  /** זמן מנוחה מומלץ בשניות */
  rest: number;
  /** תרגיל שמבוצע לזמן (פלאנק, קרדיו) ולא לחזרות */
  timeBased?: boolean;
  /** כתובת וידאו ישירה (mp4/hls) – ניתן להזרים לנגן המובנה */
  videoUrl?: string;
  /** מזהה סרטון יוטיוב להטמעה */
  youtubeId?: string;
}

export const MUSCLE_LABEL: Record<MuscleGroup, string> = {
  chest: 'חזה',
  back: 'גב',
  legs: 'רגליים',
  shoulders: 'כתפיים',
  biceps: 'יד קדמית',
  triceps: 'יד אחורית',
  core: 'בטן וליבה',
  cardio: 'אירובי',
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barbell: 'מוט',
  dumbbell: 'משקולות',
  machine: 'מכונה',
  cable: 'כבלים',
  bodyweight: 'משקל גוף',
  bands: 'גומיות',
  kettlebell: 'קטלבל',
};

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'מתחיל',
  intermediate: 'מתקדם',
  advanced: 'מנוסה',
};
