/** תאריך בפורמט YYYY-MM-DD לפי שעון מקומי */
export function toKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key: string, delta: number): string {
  const d = fromKey(key);
  d.setDate(d.getDate() + delta);
  return toKey(d);
}

export const DAY_NAMES = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
export const DAY_NAMES_LONG = [
  'ראשון',
  'שני',
  'שלישי',
  'רביעי',
  'חמישי',
  'שישי',
  'שבת',
];
export const MONTH_NAMES = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
];

export function humanDate(key: string): string {
  const today = toKey();
  if (key === today) return 'היום';
  if (key === addDays(today, -1)) return 'אתמול';
  if (key === addDays(today, 1)) return 'מחר';
  const d = fromKey(key);
  return `יום ${DAY_NAMES_LONG[d.getDay()]}, ${d.getDate()} ב${MONTH_NAMES[d.getMonth()]}`;
}

export function shortDate(key: string): string {
  const d = fromKey(key);
  return `${d.getDate()}.${d.getMonth() + 1}`;
}

/** מחזיר את שבעת הימים האחרונים (הישן ביותר ראשון) */
export function lastNDays(n: number, from: string = toKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(from, -(n - 1 - i)));
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${`${m}`.padStart(2, '0')}:${`${s}`.padStart(2, '0')}`;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${`${s}`.padStart(2, '0')}`;
}
