import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart, LineChart } from '../../src/components/LineChart';
import { Button, Card, EmptyState, SectionHeader } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { useApp } from '../../src/store/AppStore';
import { ROW, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { DAY_NAMES, humanDate, lastNDays, shortDate, toKey } from '../../src/utils/date';

export default function ProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state, logWeight, streak } = useApp();
  const [weightInput, setWeightInput] = useState('');
  const [chartWidth, setChartWidth] = useState(300);

  const finished = useMemo(
    () => state.sessions.filter((s) => s.finishedAt),
    [state.sessions],
  );

  const totals = useMemo(() => {
    let volume = 0;
    let sets = 0;
    let minutes = 0;
    finished.forEach((s) => {
      minutes += ((s.finishedAt ?? s.startedAt) - s.startedAt) / 60000;
      s.exercises.forEach((e) =>
        e.sets.forEach((x) => {
          if (x.done) {
            sets += 1;
            volume += (x.weight ?? 0) * (x.reps ?? 0);
          }
        }),
      );
    });
    return { volume, sets, minutes: Math.round(minutes), count: finished.length };
  }, [finished]);

  const weekVolume = useMemo(() => {
    const days = lastNDays(7);
    return days.map((d) => {
      const vol = finished
        .filter((s) => s.date === d)
        .reduce(
          (sum, s) =>
            sum +
            s.exercises.reduce(
              (a, e) =>
                a +
                e.sets.reduce(
                  (b, x) => b + (x.done ? (x.weight ?? 0) * (x.reps ?? 0) : 0),
                  0,
                ),
              0,
            ),
          0,
        );
      return { label: DAY_NAMES[new Date(d).getDay()], value: vol };
    });
  }, [finished]);

  const weightPoints = state.weights.map((w) => ({
    label: shortDate(w.date),
    value: w.kg,
  }));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.md,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.h1, rtlText]}>ההתקדמות שלי</Text>

      <View style={{ flexDirection: ROW, gap: spacing.md, marginTop: spacing.lg }}>
        <Stat icon="barbell" label="אימונים" value={`${totals.count}`} />
        <Stat icon="flame" label="ימים ברצף" value={`${streak()}`} />
        <Stat icon="time-outline" label="דקות" value={`${totals.minutes}`} />
      </View>

      <SectionHeader title="נפח אימון שבועי" />
      <Card
        onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - spacing.lg * 2)}
        style={{ gap: spacing.md }}
      >
        <Text style={[styles.cardSub, rtlText]}>
          סה"כ {Math.round(totals.volume).toLocaleString('he-IL')} ק"ג הורמו ב־
          {totals.sets} סטים
        </Text>
        <BarChart points={weekVolume} width={chartWidth} />
      </Card>

      <SectionHeader title="מעקב משקל גוף" />
      <Card style={{ gap: spacing.md }}>
        <View style={{ flexDirection: ROW, gap: spacing.md, alignItems: 'flex-end' }}>
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[styles.cardSub, rtlText]}>המשקל שלי היום (ק"ג)</Text>
            <TextInput
              value={weightInput}
              onChangeText={(t) => setWeightInput(t.replace(/[^0-9.]/g, ''))}
              placeholder={`${state.profile.weightKg}`}
              placeholderTextColor={colors.textFaint}
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>
          <Button
            title="שמור"
            icon="save-outline"
            style={{ flex: 1 }}
            onPress={() => {
              const n = parseFloat(weightInput);
              if (Number.isFinite(n) && n > 20 && n < 400) {
                logWeight(n, toKey());
                setWeightInput('');
              }
            }}
          />
        </View>

        {weightPoints.length >= 2 ? (
          <LineChart width={chartWidth} points={weightPoints} suffix=' ק"ג' color={colors.info} />
        ) : (
          <Text style={[styles.hint, rtlText]}>
            שקלו את עצמכם באותה שעה, לפחות פעמיים, כדי לראות גרף מגמה.
          </Text>
        )}
      </Card>

      <SectionHeader title="היסטוריית אימונים" />
      {finished.length === 0 ? (
        <Card>
          <EmptyState
            icon="calendar-outline"
            title="עוד לא סיימת אימון"
            text="כשתשלימו אימון הוא יופיע כאן עם כל הנתונים."
          />
        </Card>
      ) : (
        <View style={{ gap: spacing.sm }}>
          {finished.slice(0, 20).map((s) => {
            const done = s.exercises.flatMap((e) => e.sets.filter((x) => x.done));
            const vol = done.reduce((a, x) => a + (x.weight ?? 0) * (x.reps ?? 0), 0);
            return (
              <Pressable
                key={s.id}
                onPress={() => router.push(`/workout/summary?id=${s.id}`)}
                style={({ pressed }) => [
                  styles.histCard,
                  { flexDirection: ROW },
                  pressed && { opacity: 0.75 },
                ]}
              >
                <View style={styles.histIcon}>
                  <Ionicons name="barbell" size={18} color={colors.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.histName, rtlText]}>{s.name}</Text>
                  <Text style={[styles.histMeta, rtlText]}>
                    {humanDate(s.date)} · {done.length} סטים ·{' '}
                    {Math.round(vol).toLocaleString('he-IL')} ק"ג
                  </Text>
                  <Text style={[styles.histEx, rtlText]} numberOfLines={1}>
                    {s.exercises
                      .map((e) => EXERCISE_BY_ID[e.exerciseId]?.name)
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Ionicons name="chevron-back" size={16} color={colors.textFaint} />
              </Pressable>
            );
          })}
        </View>
      )}
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
    <Card style={{ flex: 1, alignItems: 'center', gap: 4, padding: spacing.md }}>
      <Ionicons name={icon} size={18} color={colors.lime} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  h1: { fontSize: 28, fontWeight: '900', color: colors.text },
  statValue: { fontSize: 20, fontWeight: '900', color: colors.text },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  cardSub: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.textFaint, lineHeight: 18 },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  histCard: {
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  histIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  histName: { fontSize: 15, fontWeight: '800', color: colors.text },
  histMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  histEx: { fontSize: 11, color: colors.textFaint, marginTop: 3 },
});
