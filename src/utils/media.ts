/**
 * הדגמות ויזואליות לתרגילים.
 *
 * התמונות מגיעות ממאגר free-exercise-db (רישיון Public Domain / Unlicense).
 * לכל תרגיל יש שני פריימים – התחלה וסיום – שאותם אנחנו מנפישים במסך התרגיל
 * כדי לקבל לולאת הדגמה של התנועה.
 */
/**
 * ברירת המחדל טוענת את ההדגמות מהמאגר הציבורי.
 * בבניית גרסת הווב (PWA) מוגדר EXPO_PUBLIC_DEMO_BASE לתיקייה מקומית,
 * כך שההדגמות נארזות עם האתר ועובדות גם בלי חיבור לרשת.
 */
const BASE =
  process.env.EXPO_PUBLIC_DEMO_BASE ??
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export function demoFrames(demoId: string | null): string[] {
  if (!demoId) return [];
  return [`${BASE}/${demoId}/0.jpg`, `${BASE}/${demoId}/1.jpg`];
}

export function demoThumb(demoId: string | null): string | null {
  if (!demoId) return null;
  return `${BASE}/${demoId}/0.jpg`;
}

/** קישור לחיפוש סרטוני הדגמה ביוטיוב עבור התרגיל */
export function youtubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&playsinline=1`;
}
