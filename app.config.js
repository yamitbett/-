/**
 * הגדרות דינמיות מעל app.json.
 *
 * GitHub Pages מגיש את האתר מתת-נתיב (למשל /-/), ולכן בבניית ה-PWA
 * מועבר FITBUDDY_BASE_URL כדי שכל הנכסים ייטענו מהנתיב הנכון.
 * באפליקציה הניידת ובפיתוח מקומי אין בסיס והמשתנה פשוט לא מוגדר.
 */
module.exports = ({ config }) => {
  const baseUrl = process.env.FITBUDDY_BASE_URL;
  if (!baseUrl) return config;

  return {
    ...config,
    experiments: { ...(config.experiments ?? {}), baseUrl },
  };
};
