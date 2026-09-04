// Service worker של FitBuddy – מאפשר עבודה אופליין אחרי הטעינה הראשונה.
const CACHE = 'fitbuddy-1788531139367';
const PRECACHE = ["/-/","/-/_expo/static/js/web/entry-fce2e0d8f24b5bdecb0eaf757ea13b7d.js","/-/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf","/-/assets/node_modules/expo-router/assets/arrow_down.017bc6ba3fc25503e5eb5e53826d48a8.png","/-/assets/node_modules/expo-router/assets/error.d1ea1496f9057eb392d5bbf3732a61b7.png","/-/assets/node_modules/expo-router/assets/file.19eeb73b9593a38f8e9f418337fc7d10.png","/-/assets/node_modules/expo-router/assets/forward.d8b800c443b8972542883e0b9de2bdc6.png","/-/assets/node_modules/expo-router/assets/pkg.ab19f4cbc543357183a20571f68380a3.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon-mask.0a328cd9c1afd0afe8e3b1ec5165b1b4.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/back-icon.35ba0eaec5a4f5ed12ca16fabeae451d.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@2x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@3x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/clear-icon.c94f6478e7ae0cdd9f15de1fcb9e5e55@4x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@2x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@3x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/close-icon.808e1b1b9b53114ec2838071a7e6daa7@4x.png","/-/assets/node_modules/expo-router/assets/react-navigation/elements/search-icon.286d67d3f74808a60a78d3ebf1a5fb57.png","/-/assets/node_modules/expo-router/assets/sitemap.412dd9275b6b48ad28f5e3d81bb1f626.png","/-/assets/node_modules/expo-router/assets/unmatched.20e71bdf79e3a97bf55fd9e164041578.png","/-/demos/Air_Bike/0.jpg","/-/demos/Air_Bike/1.jpg","/-/demos/Barbell_Bench_Press_-_Medium_Grip/0.jpg","/-/demos/Barbell_Bench_Press_-_Medium_Grip/1.jpg","/-/demos/Barbell_Curl/0.jpg","/-/demos/Barbell_Curl/1.jpg","/-/demos/Barbell_Deadlift/0.jpg","/-/demos/Barbell_Deadlift/1.jpg","/-/demos/Barbell_Glute_Bridge/0.jpg","/-/demos/Barbell_Glute_Bridge/1.jpg","/-/demos/Barbell_Hip_Thrust/0.jpg","/-/demos/Barbell_Hip_Thrust/1.jpg","/-/demos/Barbell_Incline_Bench_Press_-_Medium_Grip/0.jpg","/-/demos/Barbell_Incline_Bench_Press_-_Medium_Grip/1.jpg","/-/demos/Barbell_Shoulder_Press/0.jpg","/-/demos/Barbell_Shoulder_Press/1.jpg","/-/demos/Barbell_Shrug/0.jpg","/-/demos/Barbell_Shrug/1.jpg","/-/demos/Barbell_Squat/0.jpg","/-/demos/Barbell_Squat/1.jpg","/-/demos/Barbell_Walking_Lunge/0.jpg","/-/demos/Barbell_Walking_Lunge/1.jpg","/-/demos/Bench_Dips/0.jpg","/-/demos/Bench_Dips/1.jpg","/-/demos/Bent_Over_Barbell_Row/0.jpg","/-/demos/Bent_Over_Barbell_Row/1.jpg","/-/demos/Cable_Crossover/0.jpg","/-/demos/Cable_Crossover/1.jpg","/-/demos/Cable_Crunch/0.jpg","/-/demos/Cable_Crunch/1.jpg","/-/demos/Cable_Hammer_Curls_-_Rope_Attachment/0.jpg","/-/demos/Cable_Hammer_Curls_-_Rope_Attachment/1.jpg","/-/demos/Chin-Up/0.jpg","/-/demos/Chin-Up/1.jpg","/-/demos/Close-Grip_Barbell_Bench_Press/0.jpg","/-/demos/Close-Grip_Barbell_Bench_Press/1.jpg","/-/demos/Close-Grip_Front_Lat_Pulldown/0.jpg","/-/demos/Close-Grip_Front_Lat_Pulldown/1.jpg","/-/demos/Crunches/0.jpg","/-/demos/Crunches/1.jpg","/-/demos/Decline_Barbell_Bench_Press/0.jpg","/-/demos/Decline_Barbell_Bench_Press/1.jpg","/-/demos/Dips_-_Triceps_Version/0.jpg","/-/demos/Dips_-_Triceps_Version/1.jpg","/-/demos/Dumbbell_Bench_Press/0.jpg","/-/demos/Dumbbell_Bench_Press/1.jpg","/-/demos/Dumbbell_Bicep_Curl/0.jpg","/-/demos/Dumbbell_Bicep_Curl/1.jpg","/-/demos/Dumbbell_Flyes/0.jpg","/-/demos/Dumbbell_Flyes/1.jpg","/-/demos/Dumbbell_Lunges/0.jpg","/-/demos/Dumbbell_Lunges/1.jpg","/-/demos/Face_Pull/0.jpg","/-/demos/Face_Pull/1.jpg","/-/demos/Front_Barbell_Squat/0.jpg","/-/demos/Front_Barbell_Squat/1.jpg","/-/demos/Front_Dumbbell_Raise/0.jpg","/-/demos/Front_Dumbbell_Raise/1.jpg","/-/demos/Hammer_Curls/0.jpg","/-/demos/Hammer_Curls/1.jpg","/-/demos/Hanging_Leg_Raise/0.jpg","/-/demos/Hanging_Leg_Raise/1.jpg","/-/demos/Incline_Dumbbell_Press/0.jpg","/-/demos/Incline_Dumbbell_Press/1.jpg","/-/demos/Incline_Hammer_Curls/0.jpg","/-/demos/Incline_Hammer_Curls/1.jpg","/-/demos/Leg_Extensions/0.jpg","/-/demos/Leg_Extensions/1.jpg","/-/demos/Leg_Press/0.jpg","/-/demos/Leg_Press/1.jpg","/-/demos/Lying_Leg_Curls/0.jpg","/-/demos/Lying_Leg_Curls/1.jpg","/-/demos/Lying_Triceps_Press/0.jpg","/-/demos/Lying_Triceps_Press/1.jpg","/-/demos/Machine_Bench_Press/0.jpg","/-/demos/Machine_Bench_Press/1.jpg","/-/demos/Mountain_Climbers/0.jpg","/-/demos/Mountain_Climbers/1.jpg","/-/demos/Oblique_Crunches/0.jpg","/-/demos/Oblique_Crunches/1.jpg","/-/demos/One-Arm_Dumbbell_Row/0.jpg","/-/demos/One-Arm_Dumbbell_Row/1.jpg","/-/demos/Plank/0.jpg","/-/demos/Plank/1.jpg","/-/demos/Preacher_Curl/0.jpg","/-/demos/Preacher_Curl/1.jpg","/-/demos/Pullups/0.jpg","/-/demos/Pullups/1.jpg","/-/demos/Pushups/0.jpg","/-/demos/Pushups/1.jpg","/-/demos/Reverse_Flyes/0.jpg","/-/demos/Reverse_Flyes/1.jpg","/-/demos/Romanian_Deadlift/0.jpg","/-/demos/Romanian_Deadlift/1.jpg","/-/demos/Rowing_Stationary/0.jpg","/-/demos/Rowing_Stationary/1.jpg","/-/demos/Russian_Twist/0.jpg","/-/demos/Russian_Twist/1.jpg","/-/demos/Seated_Cable_Rows/0.jpg","/-/demos/Seated_Cable_Rows/1.jpg","/-/demos/Seated_Calf_Raise/0.jpg","/-/demos/Seated_Calf_Raise/1.jpg","/-/demos/Seated_Dumbbell_Press/0.jpg","/-/demos/Seated_Dumbbell_Press/1.jpg","/-/demos/Seated_Leg_Curl/0.jpg","/-/demos/Seated_Leg_Curl/1.jpg","/-/demos/Side_Lateral_Raise/0.jpg","/-/demos/Side_Lateral_Raise/1.jpg","/-/demos/Standing_Calf_Raises/0.jpg","/-/demos/Standing_Calf_Raises/1.jpg","/-/demos/Standing_Dumbbell_Triceps_Extension/0.jpg","/-/demos/Standing_Dumbbell_Triceps_Extension/1.jpg","/-/demos/Standing_Dumbbell_Upright_Row/0.jpg","/-/demos/Standing_Dumbbell_Upright_Row/1.jpg","/-/demos/Standing_Military_Press/0.jpg","/-/demos/Standing_Military_Press/1.jpg","/-/demos/Triceps_Pushdown/0.jpg","/-/demos/Triceps_Pushdown/1.jpg","/-/demos/Triceps_Pushdown_-_Rope_Attachment/0.jpg","/-/demos/Triceps_Pushdown_-_Rope_Attachment/1.jpg","/-/demos/Wide-Grip_Lat_Pulldown/0.jpg","/-/demos/Wide-Grip_Lat_Pulldown/1.jpg","/-/favicon.ico","/-/icons/apple-touch-icon.png","/-/icons/icon-192.png","/-/icons/icon-512.png","/-/icons/icon-maskable-512.png","/-/index.html","/-/manifest.webmanifest"];

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
    .match('/-/index.html')
    .then((r) => r || caches.match('/-/'))
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
