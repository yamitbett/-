import { I18nManager, TextStyle, ViewStyle } from 'react-native';

/**
 * האפליקציה כולה בעברית ולכן הפריסה תמיד מימין לשמאל.
 * כדי שזה יעבוד גם כשהמכשיר מוגדר לאנגלית וגם כשהוא כבר במצב RTL,
 * אנחנו מחשבים את כיוון השורה לפי המצב בפועל במקום להסתמך על מראה אוטומטי.
 */
export const isRTL = I18nManager.isRTL;

/** שורה שנקראת מימין לשמאל (הפריט הראשון בקוד יופיע מימין) */
export const ROW: ViewStyle['flexDirection'] = isRTL ? 'row' : 'row-reverse';

/** שורה שנקראת משמאל לימין (למשל מספרים או גרפים) */
export const ROW_LTR: ViewStyle['flexDirection'] = isRTL ? 'row-reverse' : 'row';

/** יישור טקסט עברי */
export const rtlText: TextStyle = {
  textAlign: 'right',
  writingDirection: 'rtl',
};

/** מבקש מהמערכת לעבור למצב RTL בהפעלה הבאה (משפר התנהגות של שדות קלט) */
export function enableRTL() {
  try {
    I18nManager.allowRTL(true);
    if (!I18nManager.isRTL) I18nManager.forceRTL(true);
  } catch {
    // לא קריטי – הפריסה שלנו לא תלויה בזה
  }
}
