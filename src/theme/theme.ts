/**
 * ערכת העיצוב של FitBuddy – כהה עם הדגשות ליים.
 */
export const colors = {
  bg: '#0B0D0F',
  bgElevated: '#14171A',
  card: '#1A1E22',
  cardAlt: '#22272C',
  border: '#2A3037',
  borderSoft: '#20262C',

  lime: '#C6F432',
  limeDim: '#9BC221',
  limeSoft: 'rgba(198, 244, 50, 0.12)',

  text: '#FFFFFF',
  textMuted: '#9AA4AE',
  textFaint: '#5F6B76',

  danger: '#FF5A5A',
  dangerSoft: 'rgba(255, 90, 90, 0.12)',
  warn: '#FFB020',
  info: '#4FA8FF',
  purple: '#A78BFA',

  protein: '#C6F432',
  carbs: '#4FA8FF',
  fat: '#FFB020',
  calories: '#FF7A59',
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const font = {
  h1: { fontSize: 28, fontWeight: '800' as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: '800' as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '500' as const, color: colors.text },
  small: { fontSize: 13, fontWeight: '500' as const, color: colors.textMuted },
  tiny: { fontSize: 11, fontWeight: '600' as const, color: colors.textFaint },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
};
