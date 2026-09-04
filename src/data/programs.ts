import { MuscleGroup } from './types';

export interface ProgramExercise {
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number;
  note?: string;
}

export interface WorkoutDay {
  id: string;
  name: string;
  /** תת־כותרת, למשל "חזה + יד אחורית" */
  subtitle: string;
  focus: MuscleGroup[];
  estimatedMinutes: number;
  exercises: ProgramExercise[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  daysPerWeek: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  goal: 'muscle' | 'strength' | 'fat_loss' | 'fitness';
  days: WorkoutDay[];
}

const ex = (
  exerciseId: string,
  sets: number,
  reps: string,
  restSeconds = 90,
  note?: string,
): ProgramExercise => ({ exerciseId, sets, reps, restSeconds, note });

export const PROGRAMS: Program[] = [
  {
    id: 'full_body_3',
    name: 'גוף מלא – 3 אימונים בשבוע',
    description:
      'תוכנית מושלמת למתחילים: כל אימון עובר על כל הגוף, עם דגש על תרגילי בסיס. שלושה אימונים בשבוע עם יום מנוחה ביניהם.',
    daysPerWeek: 3,
    level: 'beginner',
    goal: 'fitness',
    days: [
      {
        id: 'fb_a',
        name: 'אימון A',
        subtitle: 'גוף מלא – דגש דחיפה',
        focus: ['legs', 'chest', 'shoulders'],
        estimatedMinutes: 55,
        exercises: [
          ex('squat_barbell', 3, '8-10', 150),
          ex('bench_press_dumbbell', 3, '10-12', 90),
          ex('seated_cable_row', 3, '10-12', 90),
          ex('seated_db_press', 3, '10-12', 75),
          ex('plank', 3, '45 שניות', 45),
        ],
      },
      {
        id: 'fb_b',
        name: 'אימון B',
        subtitle: 'גוף מלא – דגש משיכה',
        focus: ['back', 'legs', 'biceps'],
        estimatedMinutes: 55,
        exercises: [
          ex('romanian_deadlift', 3, '8-10', 120),
          ex('lat_pulldown_wide', 3, '10-12', 90),
          ex('leg_press', 3, '10-12', 120),
          ex('db_curl', 3, '10-12', 60),
          ex('triceps_pushdown', 3, '12-15', 60),
        ],
      },
      {
        id: 'fb_c',
        name: 'אימון C',
        subtitle: 'גוף מלא – מכונות ובידוד',
        focus: ['chest', 'back', 'legs'],
        estimatedMinutes: 50,
        exercises: [
          ex('machine_chest_press', 3, '10-12', 75),
          ex('one_arm_db_row', 3, '10-12', 75),
          ex('leg_extension', 3, '12-15', 60),
          ex('lying_leg_curl', 3, '10-12', 75),
          ex('lateral_raise', 3, '12-15', 60),
          ex('crunches', 3, '15-20', 45),
        ],
      },
    ],
  },
  {
    id: 'ppl_6',
    name: 'דחיפה / משיכה / רגליים',
    description:
      'תוכנית קלאסית לבניית מסת שריר. שישה אימונים בשבוע (או שלושה במחזור אחד), חלוקה לפי דפוסי תנועה.',
    daysPerWeek: 6,
    level: 'intermediate',
    goal: 'muscle',
    days: [
      {
        id: 'push',
        name: 'דחיפה',
        subtitle: 'חזה, כתפיים ויד אחורית',
        focus: ['chest', 'shoulders', 'triceps'],
        estimatedMinutes: 65,
        exercises: [
          ex('bench_press_barbell', 4, '8-10', 120),
          ex('incline_press_dumbbell', 3, '10-12', 90),
          ex('shoulder_press_barbell', 3, '8-10', 120),
          ex('lateral_raise', 4, '12-15', 60),
          ex('cable_crossover', 3, '12-15', 60),
          ex('rope_pushdown', 3, '12-15', 60),
          ex('overhead_triceps_ext', 3, '10-12', 60),
        ],
      },
      {
        id: 'pull',
        name: 'משיכה',
        subtitle: 'גב ויד קדמית',
        focus: ['back', 'biceps'],
        estimatedMinutes: 65,
        exercises: [
          ex('deadlift', 3, '5-6', 180, 'רק באימון הראשון בשבוע'),
          ex('lat_pulldown_wide', 4, '10-12', 90),
          ex('barbell_row', 4, '8-10', 120),
          ex('seated_cable_row', 3, '10-12', 90),
          ex('face_pull', 3, '15-20', 60),
          ex('barbell_curl', 3, '10-12', 75),
          ex('hammer_curl', 3, '10-12', 60),
        ],
      },
      {
        id: 'legs',
        name: 'רגליים',
        subtitle: 'ארבע ראשי, המסטרינג וישבן',
        focus: ['legs', 'core'],
        estimatedMinutes: 70,
        exercises: [
          ex('squat_barbell', 4, '8-10', 150),
          ex('romanian_deadlift', 3, '8-10', 120),
          ex('leg_press', 3, '10-12', 120),
          ex('lying_leg_curl', 3, '10-12', 75),
          ex('leg_extension', 3, '12-15', 60),
          ex('standing_calf_raise', 4, '15-20', 45),
          ex('hanging_leg_raise', 3, '10-15', 60),
        ],
      },
    ],
  },
  {
    id: 'upper_lower_4',
    name: 'פלג גוף עליון / תחתון',
    description:
      'ארבעה אימונים בשבוע בחלוקה לעליון ותחתון – איזון מצוין בין תדירות לנפח אימון.',
    daysPerWeek: 4,
    level: 'intermediate',
    goal: 'muscle',
    days: [
      {
        id: 'upper_a',
        name: 'עליון A',
        subtitle: 'דגש כוח',
        focus: ['chest', 'back', 'shoulders'],
        estimatedMinutes: 60,
        exercises: [
          ex('bench_press_barbell', 4, '6-8', 150),
          ex('barbell_row', 4, '6-8', 150),
          ex('shoulder_press_barbell', 3, '8-10', 120),
          ex('lat_pulldown_close', 3, '10-12', 90),
          ex('close_grip_bench', 3, '8-10', 90),
          ex('barbell_curl', 3, '10-12', 75),
        ],
      },
      {
        id: 'lower_a',
        name: 'תחתון A',
        subtitle: 'דגש סקוואט',
        focus: ['legs', 'core'],
        estimatedMinutes: 60,
        exercises: [
          ex('squat_barbell', 4, '6-8', 180),
          ex('romanian_deadlift', 3, '8-10', 120),
          ex('walking_lunge', 3, '12 לכל רגל', 90),
          ex('seated_leg_curl', 3, '12-15', 75),
          ex('standing_calf_raise', 4, '15-20', 45),
          ex('cable_crunch', 3, '12-15', 60),
        ],
      },
      {
        id: 'upper_b',
        name: 'עליון B',
        subtitle: 'דגש נפח והיפרטרופיה',
        focus: ['chest', 'back', 'biceps', 'triceps'],
        estimatedMinutes: 60,
        exercises: [
          ex('incline_bench_barbell', 4, '10-12', 90),
          ex('seated_cable_row', 4, '10-12', 90),
          ex('dumbbell_flyes', 3, '12-15', 60),
          ex('lateral_raise', 4, '12-15', 60),
          ex('incline_curl', 3, '10-12', 60),
          ex('rope_pushdown', 3, '12-15', 60),
        ],
      },
      {
        id: 'lower_b',
        name: 'תחתון B',
        subtitle: 'דגש ישבן והמסטרינג',
        focus: ['legs'],
        estimatedMinutes: 55,
        exercises: [
          ex('hip_thrust', 4, '10-12', 120),
          ex('leg_press', 4, '10-12', 120),
          ex('lying_leg_curl', 3, '10-12', 75),
          ex('dumbbell_lunges', 3, '10 לכל רגל', 90),
          ex('seated_calf_raise', 3, '15-20', 45),
        ],
      },
    ],
  },
  {
    id: 'home_bodyweight',
    name: 'אימון בית – משקל גוף',
    description:
      'בלי ציוד, בלי חדר כושר. תוכנית קצרה ויעילה לבית או לחופשה, מבוססת על תרגילי משקל גוף.',
    daysPerWeek: 3,
    level: 'beginner',
    goal: 'fitness',
    days: [
      {
        id: 'home_a',
        name: 'בית A',
        subtitle: 'פלג גוף עליון וליבה',
        focus: ['chest', 'triceps', 'core'],
        estimatedMinutes: 35,
        exercises: [
          ex('pushups', 4, '12-20', 60),
          ex('bench_dips', 3, '12-15', 60),
          ex('plank', 3, '45 שניות', 45),
          ex('mountain_climbers', 3, '40 שניות', 45),
          ex('russian_twist', 3, '20', 45),
        ],
      },
      {
        id: 'home_b',
        name: 'בית B',
        subtitle: 'רגליים וישבן',
        focus: ['legs', 'core'],
        estimatedMinutes: 35,
        exercises: [
          ex('dumbbell_lunges', 3, '12 לכל רגל', 60),
          ex('glute_bridge', 4, '15', 45),
          ex('air_bike', 3, '20', 45),
          ex('crunches', 3, '20', 45),
        ],
      },
      {
        id: 'home_c',
        name: 'בית C',
        subtitle: 'גוף מלא מהיר',
        focus: ['chest', 'legs', 'core'],
        estimatedMinutes: 30,
        exercises: [
          ex('pushups', 3, '15', 45),
          ex('glute_bridge', 3, '20', 45),
          ex('mountain_climbers', 4, '40 שניות', 40),
          ex('plank', 3, '60 שניות', 45),
        ],
      },
    ],
  },
  {
    id: 'fat_loss_4',
    name: 'חיטוב ושריפת שומן',
    description:
      'שילוב של אימוני התנגדות עם זמני מנוחה קצרים ואירובי – לשמירה על מסת שריר במהלך גירעון קלורי.',
    daysPerWeek: 4,
    level: 'intermediate',
    goal: 'fat_loss',
    days: [
      {
        id: 'fl_upper',
        name: 'עליון + אירובי',
        subtitle: 'מנוחות קצרות',
        focus: ['chest', 'back', 'shoulders'],
        estimatedMinutes: 50,
        exercises: [
          ex('bench_press_dumbbell', 3, '12-15', 60),
          ex('lat_pulldown_wide', 3, '12-15', 60),
          ex('seated_db_press', 3, '12-15', 60),
          ex('rope_pushdown', 3, '15', 45),
          ex('db_curl', 3, '15', 45),
          ex('rowing_machine', 1, '10 דקות', 60),
        ],
      },
      {
        id: 'fl_lower',
        name: 'תחתון + אירובי',
        subtitle: 'מנוחות קצרות',
        focus: ['legs', 'core'],
        estimatedMinutes: 50,
        exercises: [
          ex('leg_press', 3, '15', 75),
          ex('romanian_deadlift', 3, '12', 75),
          ex('walking_lunge', 3, '15 לכל רגל', 60),
          ex('standing_calf_raise', 3, '20', 40),
          ex('mountain_climbers', 3, '45 שניות', 40),
        ],
      },
      {
        id: 'fl_full',
        name: 'גוף מלא מטבולי',
        subtitle: 'מעגלים',
        focus: ['chest', 'back', 'legs', 'core'],
        estimatedMinutes: 45,
        exercises: [
          ex('squat_barbell', 3, '15', 75),
          ex('pushups', 3, '15', 45),
          ex('seated_cable_row', 3, '15', 60),
          ex('russian_twist', 3, '20', 40),
          ex('plank', 3, '45 שניות', 40),
        ],
      },
      {
        id: 'fl_cardio',
        name: 'אירובי וליבה',
        subtitle: 'יום קל',
        focus: ['cardio', 'core'],
        estimatedMinutes: 40,
        exercises: [
          ex('rowing_machine', 1, '20 דקות', 60),
          ex('hanging_leg_raise', 3, '12', 60),
          ex('cable_crunch', 3, '15', 60),
          ex('oblique_crunch', 3, '15 לכל צד', 45),
        ],
      },
    ],
  },
];

export const PROGRAM_BY_ID: Record<string, Program> = Object.fromEntries(
  PROGRAMS.map((p) => [p.id, p]),
);

export function findDay(programId: string, dayId: string): WorkoutDay | undefined {
  return PROGRAM_BY_ID[programId]?.days.find((d) => d.id === dayId);
}

export const GOAL_LABEL: Record<Program['goal'], string> = {
  muscle: 'בניית מסה',
  strength: 'כוח',
  fat_loss: 'חיטוב',
  fitness: 'כושר כללי',
};
