import { useRouter } from 'expo-router';

type AppRouter = ReturnType<typeof useRouter>;

/**
 * חזרה בטוחה: אם אין מסך קודם בערימת הניווט (למשל כשנכנסים
 * לאפליקציה ישירות דרך קישור), עוברים למסך ברירת מחדל.
 */
export function goBack(router: AppRouter, fallback: string) {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}
