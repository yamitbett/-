import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { formatDuration, humanDate } from '../../src/utils/date';

export default function WorkoutSummary() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, streak } = useApp();

  const session = state.sessions.find((s) => s.id === id);

  if (!session) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 80, paddingHorizontal: spacing.lg }]}>
        <Text style={[styles.title, rtlText]}>האימון לא נמצא</Text>
        <Button title="לדף הבית" onPress={() => router.replace('/(tabs)/home')} />
      </View>
    );
  }

  const doneSets = session.exercises.flatMap((e) => e.sets.filter((s) => s.done));
  const volume = doneSets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
  const reps = doneSets.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const duration = (session.finishedAt ?? Date.now()) - session.startedAt;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.xl,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.xxl,
        gap: spacing.lg,
      }}
    >
      <LinearGradient
        colors={[colors.lime, colors.limeDim]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroIcon}>
          <Ionicons name="trophy" size={30} color={colors.lime} />
        </View>
        <Text style={styles.heroTitle}>כל הכבוד!</Text>
        <Text style={styles.heroSub}>
          סיימת את {session.name} · {humanDate(session.date)}
        </Text>
      </LinearGradient>

      <View style={{ flexDirection: ROW, gap: spacing.md }}>
        <Stat icon="time-outline" label="משך" value={formatDuration(duration)} />
        <Stat icon="checkmark-done" label="סטים" value={`${doneSets.length}`} />
        <Stat icon="repeat" label="חזרות" value={`${reps}`} />
      </View>

      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: ROW, justifyContent: 'space-between' }}>
          <Text style={[styles.cardTitle, rtlText]}>נפח אימון כולל</Text>
          <Text style={styles.volume}>
            {Math.round(volume).toLocaleString('he-IL')} ק"ג
          </Text>
        </View>
        <Text style={[styles.hint, rtlText]}>
          נפח = משקל × חזרות, סכום כל הסטים שסימנת. זה המדד הכי טוב למעקב אחרי
          העמסה מתקדמת לאורך זמן.
        </Text>
      </Card>

      <Card style={{ gap: spacing.md }}>
        <Text style={[styles.cardTitle, rtlText]}>פירוט התרגילים</Text>
        {session.exercises.map((e, i) => {
          const meta = EXERCISE_BY_ID[e.exerciseId];
          const done = e.sets.filter((s) => s.done);
          const best = done.reduce<{ weight: number; reps: number } | null>(
            (acc, s) =>
              !acc || (s.weight ?? 0) > acc.weight
                ? { weight: s.weight ?? 0, reps: s.reps ?? 0 }
                : acc,
            null,
          );
          return (
            <View key={i} style={[styles.exRow, { flexDirection: ROW }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exName, rtlText]}>{meta?.name ?? e.exerciseId}</Text>
                <Text style={[styles.exSub, rtlText]}>
                  {done.length}/{e.sets.length} סטים
                  {best ? ` · הכי כבד: ${best.weight} ק"ג × ${best.reps}` : ''}
                </Text>
              </View>
              <Ionicons
                name={done.length === e.sets.length ? 'checkmark-circle' : 'ellipse-outline'}
                size={20}
                color={done.length === e.sets.length ? colors.lime : colors.textFaint}
              />
            </View>
          );
        })}
      </Card>

      <Card style={{ alignItems: 'center', gap: 6 }}>
        <Ionicons name="flame" size={26} color={colors.lime} />
        <Text style={styles.streakValue}>{streak()} ימים ברצף</Text>
        <Text style={[styles.hint, { textAlign: 'center' }]}>
          המשיכו ככה – עקביות היא מה שמייצר תוצאות.
        </Text>
      </Card>

      <Button
        title="חזרה לדף הבית"
        icon="home"
        onPress={() => router.replace('/(tabs)/home')}
      />
    </ScrollView>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', gap: 5, padding: spacing.md }}>
      <Ionicons name={icon} size={18} color={colors.lime} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, marginBottom: spacing.lg },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: 8,
  },
  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#0B0D0F',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heroTitle: { fontSize: 26, fontWeight: '900', color: '#0B0D0F' },
  heroSub: { fontSize: 14, fontWeight: '700', color: 'rgba(11,13,15,0.75)' },
  statValue: { fontSize: 18, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  cardTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  volume: { fontSize: 18, fontWeight: '900', color: colors.lime },
  hint: { fontSize: 12, color: colors.textFaint, lineHeight: 18 },
  exRow: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  exName: { fontSize: 14, fontWeight: '700', color: colors.text },
  exSub: { fontSize: 12, color: colors.textFaint, marginTop: 2 },
  streakValue: { fontSize: 18, fontWeight: '900', color: colors.text },
});
