#!/usr/bin/env node
/**
 * בונה את גרסת ה-PWA של FitBuddy לפריסה ב-GitHub Pages.
 *
 * הרצה:  node scripts/build-pwa.js [--base /-]
 *
 * מה הסקריפט עושה:
 *  1. מריץ `expo export` לווב עם נתיב בסיס מתאים (GitHub Pages מגיש מתת-נתיב).
 *  2. מעתיק את תמונות ההדגמה מ-web-assets/demos לתוך האתר.
 *  3. מוסיף manifest, אייקונים, תגיות מטא ל-iOS ו-service worker לעבודה אופליין.
 *  4. יוצר 404.html זהה ל-index.html כדי שניתוב צד-לקוח יעבוד בכל נתיב.
 *  5. יוצר .nojekyll כדי ש-GitHub Pages לא יתעלם מתיקיית _expo.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'dist');

const baseArg = process.argv.indexOf('--base');
// נתיב הבסיס שבו האתר מוגש. שם הריפו הוא "-" ולכן ברירת המחדל היא "/-".
const BASE = (baseArg > -1 ? process.argv[baseArg + 1] : '/-').replace(/\/$/, '');
const withBase = (p) => `${BASE}/${p.replace(/^\//, '')}`;

function rmrf(p) {
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let n = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) n += copyDir(s, d);
    else {
      fs.copyFileSync(s, d);
      n++;
    }
  }
  return n;
}

function walk(dir, prefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}/${entry.name}`;
    if (entry.isDirectory()) files.push(...walk(path.join(dir, entry.name), rel));
    else files.push(rel);
  }
  return files;
}

// ---------- 1. ייצוא הווב ----------
console.log(`בונה את גרסת הווב (base: ${BASE})...`);
rmrf(OUT);
execFileSync(
  'npx',
  ['expo', 'export', '--platform', 'web', '--output-dir', 'dist', '--clear'],
  {
    cwd: ROOT,
    stdio: 'inherit',
    env: {
      ...process.env,
      FITBUDDY_BASE_URL: BASE,
      EXPO_PUBLIC_DEMO_BASE: withBase('demos'),
    },
  },
);

// ---------- 2. תמונות ההדגמה ----------
const demoCount = copyDir(path.join(ROOT, 'web-assets/demos'), path.join(OUT, 'demos'));
console.log(`הועתקו ${demoCount} תמונות הדגמה`);

const iconCount = copyDir(path.join(ROOT, 'web-assets/icons'), path.join(OUT, 'icons'));
console.log(`הועתקו ${iconCount} אייקונים`);

// ---------- 3. manifest ----------
const manifest = {
  name: 'FitBuddy – המאמן האישי שלך',
  short_name: 'FitBuddy',
  description: 'אימונים ותזונה בעברית: תוכניות אימון, הדגמות תרגילים ומעקב מאקרו.',
  lang: 'he',
  dir: 'rtl',
  start_url: `${BASE}/`,
  scope: `${BASE}/`,
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0B0D0F',
  theme_color: '#0B0D0F',
  icons: [
    { src: withBase('icons/icon-192.png'), sizes: '192x192', type: 'image/png' },
    { src: withBase('icons/icon-512.png'), sizes: '512x512', type: 'image/png' },
    {
      src: withBase('icons/icon-maskable-512.png'),
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    },
  ],
};
fs.writeFileSync(path.join(OUT, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

// ---------- 4. service worker ----------
// מרשימת הקבצים שנבנו בפועל, כדי שהאפליקציה תעבוד אופליין אחרי ביקור ראשון.
const VECTOR_FONTS = '/assets/node_modules/@expo/vector-icons/';
const precache = walk(OUT)
  .filter((f) => !f.endsWith('.map') && f !== '/metadata.json')
  // מהגופנים של ספריית האייקונים נדרש רק Ionicons; אין טעם להוריד את השאר
  .filter((f) => !f.startsWith(VECTOR_FONTS) || f.includes('/Ionicons.'))
  .map((f) => withBase(f));
precache.unshift(`${BASE}/`);

const CACHE = `fitbuddy-${Date.now()}`;
const sw = `// Service worker של FitBuddy – מאפשר עבודה אופליין אחרי הטעינה הראשונה.
const CACHE = '${CACHE}';
const PRECACHE = ${JSON.stringify([...new Set(precache)], null, 0)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // מוסיפים קובץ-קובץ כדי שכישלון בודד לא יפיל את כל ההתקנה
      Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => {})))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// מעטפת האפליקציה מהמטמון – נקודת הנפילה לכל ניווט שלא הצליח ברשת
function shell() {
  return caches
    .match('${BASE}/index.html')
    .then((r) => r || caches.match('${BASE}/'))
    .then((r) => r || Response.error());
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // ניווטים: מהרשת קודם כדי שעדכונים ייתפסו מהר, ובכל כישלון –
  // גם שגיאת רשת וגם תשובת שגיאה כמו 404 – מגישים את מעטפת האפליקציה
  // מהמטמון, והניתוב בצד הלקוח ימשיך מכאן.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => (res && res.ok ? res : shell()))
        .catch(() => shell())
    );
    return;
  }

  // שאר הבקשות: מהמטמון קודם
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
`;
fs.writeFileSync(path.join(OUT, 'sw.js'), sw);

// ---------- 5. תגיות ב-index.html ----------
const indexPath = path.join(OUT, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

const head = `
    <meta name="application-name" content="FitBuddy" />
    <meta name="theme-color" content="#0B0D0F" />
    <meta name="description" content="אימונים ותזונה בעברית: תוכניות אימון, הדגמות תרגילים ומעקב מאקרו." />
    <link rel="manifest" href="${withBase('manifest.webmanifest')}" />
    <link rel="apple-touch-icon" href="${withBase('icons/apple-touch-icon.png')}" />
    <link rel="icon" type="image/png" sizes="192x192" href="${withBase('icons/icon-192.png')}" />
    <!-- פתיחה במסך מלא אחרי "הוספה למסך הבית" באייפון -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="apple-mobile-web-app-title" content="FitBuddy" />
    <style>
      /* מונע זום כפול-הקשה ובחירת טקסט מקרית באפליקציה */
      body { touch-action: manipulation; -webkit-user-select: none; user-select: none; }
      input, textarea { -webkit-user-select: text; user-select: text; }
    </style>
`;

// רק שפה, בלי dir="rtl": הפריסה של האפליקציה כבר בנויה מימין לשמאל
// בעצמה, וכיוון ברמת המסמך היה הופך אותה בחזרה.
html = html.replace('<html lang="en">', '<html lang="he">');
html = html.replace(
  /<meta name="viewport"[^>]*>/,
  '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, shrink-to-fit=no" />',
);
html = html.replace('</head>', `${head}  </head>`);
html = html.replace(
  '</body>',
  `  <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('${withBase('sw.js')}', { scope: '${BASE}/' })
            .catch(function () { /* אופליין לא יעבוד, האפליקציה כן */ });
        });
      }
    </script>
  </body>`,
);
fs.writeFileSync(indexPath, html);

// ---------- 6. קבצי GitHub Pages ----------
// כל נתיב לא מוכר מקבל את אותו עמוד, כדי שהניתוב בצד הלקוח יטפל בו
fs.copyFileSync(indexPath, path.join(OUT, '404.html'));
// בלי הקובץ הזה GitHub Pages מתעלם מתיקיות שמתחילות בקו תחתון (_expo)
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

const total = walk(OUT).length;
console.log(`\nהאתר מוכן ב-dist/ (${total} קבצים, ${precache.length} במטמון האופליין)`);
