import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MacroBar, MacroRing } from '../../src/components/MacroRing';
import { Badge, Button, Card, EmptyState, SectionHeader } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { PROGRAM_BY_ID } from '../../src/data/programs';
import { useApp } from '../../src/store/AppStore';
import { ROW, ROW_LTR, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { DAY_NAMES, lastNDays, toKey } from '../../src/utils/date';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    state,
    activeSession,
    macrosFor,
    startWorkout,
    addWater,
    streak,
  } = useApp();

  const today = toKey();
  const { profile, water, sessions } = state;
  const eaten = macrosFor(today);
  const targets = profile.targets;
  const program = profile.programId ? PROGRAM_BY_ID[profile.programId] : null;

  // בוחרים את האימון הבא בתוכנית לפי מה שכבר בוצע
  const nextDay = useMemo(() => {
    if (!program) return null;
    const doneIds = sessions
      .filter((s) => s.finishedAt && s.programId === program.id)
      .map((s) => s.dayId);
    const lastDone = doneIds[0];
    if (!lastDone) return program.days[0];
    const idx = program.days.findIndex((d) => d.id === lastDone);
    return program.days[(idx + 1) % program.days.length];
  }, [program, sessions]);

  const week = useMemo(() => {
    const days = lastNDays(7);
    const doneDates = new Set(
      sessions.filter((s) => s.finishedAt).map((s) => s.date),
    );
    return days.map((d) => ({
      key: d,
      done: doneDates.has(d),
      dayName: DAY_NAMES[new Date(d).getDay()],
      isToday: d === today,
    }));
  }, [sessions, today]);

  const waterMl = water[today] ?? 0;
  const greeting = greetingByHour();
  const currentStreak = streak();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* כותרת */}
      <View style={[styles.header, { flexDirection: ROW }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, rtlText]}>{greeting}</Text>
          <Text style={[styles.name, rtlText]}>
            {profile.name?.trim() || 'מתאמן'} 👋
          </Text>
        </View>
        {currentStreak > 0 ? (
          <View style={[styles.streak, { flexDirection: ROW }]}>
            <Ionicons name="flame" size={16} color={colors.lime} />
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
        ) : null}
      </View>

      {/* אימון פעיל */}
      {activeSession ? (
        <Pressable onPress={() => router.push(`/workout/${activeSession.id}`)}>
          <LinearGradient
            colors={[colors.lime, colors.limeDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.activeCard}
          >
            <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
              <View style={styles.activeIcon}>
                <Ionicons name="barbell" size={22} color={colors.lime} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.activeTitle, rtlText]}>אימון פעיל</Text>
                <Text style={[styles.activeSub, rtlText]}>
                  {activeSession.name} · {activeSession.exercises.length} תרגילים
                </Text>
              </View>
              <Ionicons name="chevron-back" size={22} color="#0B0D0F" />
            </View>
          </LinearGradient>
        </Pressable>
      ) : null}

      {/* האימון של היום */}
      <SectionHeader
        title="האימון של היום"
        action={program ? 'החלף תוכנית' : undefined}
        onAction={() => router.push('/(tabs)/workouts')}
      />

      {nextDay && program ? (
        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: ROW, alignItems: 'flex-start', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, rtlText]}>{nextDay.name}</Text>
              <Text style={[styles.cardSub, rtlText]}>{nextDay.subtitle}</Text>
            </View>
            <Badge label={program.name} />
          </View>

          <View style={{ flexDirection: ROW, gap: spacing.lg }}>
            <Meta icon="list-outline" text={`${nextDay.exercises.length} תרגילים`} />
            <Meta icon="time-outline" text={`~${nextDay.estimatedMinutes} דק'`} />
            <Meta
              icon="repeat-outline"
              text={`${nextDay.exercises.reduce((s, e) => s + e.sets, 0)} סטים`}
            />
          </View>

          <View style={styles.exPreview}>
            {nextDay.exercises.slice(0, 3).map((pe) => (
              <Text key={pe.exerciseId} style={[styles.exPreviewText, rtlText]}>
                • {EXERCISE_BY_ID[pe.exerciseId]?.name ?? pe.exerciseId}
              </Text>
            ))}
            {nextDay.exercises.length > 3 ? (
              <Text style={[styles.exPreviewMore, rtlText]}>
                ועוד {nextDay.exercises.length - 3} תרגילים...
              </Text>
            ) : null}
          </View>

          <Button
            title={activeSession ? 'המשך אימון' : 'התחל אימון'}
            icon="play"
            onPress={() => {
              if (activeSession) {
                router.push(`/workout/${activeSession.id}`);
                return;
              }
              const s = startWorkout(program.id, nextDay.id);
              router.push(`/workout/${s.id}`);
            }}
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon="barbell-outline"
            title="עוד לא בחרת תוכנית אימונים"
            text="בחרו תוכנית שמתאימה לכם והאפליקציה תדע בכל יום מה האימון הבא."
          />
          <Button
            title="בחר תוכנית"
            icon="albums-outline"
            onPress={() => router.push('/(tabs)/workouts')}
          />
        </Card>
      )}

      {/* תזונה */}
      <SectionHeader
        title="התזונה של היום"
        action="הוסף ארוחה"
        onAction={() => router.push('/food/search')}
      />
      <Card>
        <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.lg }}>
          <MacroRing
            value={eaten.calories}
            target={targets.calories}
            label="קלוריות"
            sublabel={`מתוך ${targets.calories}`}
            size={118}
            color={colors.calories}
          />
          <View style={{ flex: 1, gap: spacing.md }}>
            <MacroBar
              label="חלבון"
              value={eaten.protein}
              target={targets.protein}
              color={colors.protein}
            />
            <MacroBar
              label="פחמימות"
              value={eaten.carbs}
              target={targets.carbs}
              color={colors.carbs}
            />
            <MacroBar
              label="שומן"
              value={eaten.fat}
              target={targets.fat}
              color={colors.fat}
            />
          </View>
        </View>
      </Card>

      {/* מים */}
      <SectionHeader title="שתיית מים" />
      <Card>
        <View style={{ flexDirection: ROW, alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={[styles.waterValue, rtlText]}>
              {(waterMl / 1000).toFixed(1)}
              <Text style={styles.waterUnit}> ליטר</Text>
            </Text>
            <Text style={[styles.cardSub, rtlText]}>
              יעד: {(profile.waterTargetMl / 1000).toFixed(1)} ליטר
            </Text>
          </View>
          <View style={{ flexDirection: ROW, gap: spacing.sm }}>
            <WaterBtn label="+250" onPress={() => addWater(today, 250)} />
            <WaterBtn label="+500" onPress={() => addWater(today, 500)} />
            <WaterBtn
              label="-250"
              muted
              onPress={() => addWater(today, -250)}
            />
          </View>
        </View>
        <View style={styles.waterTrack}>
          <View
            style={[
              styles.waterFill,
              {
                width: `${Math.min(100, (waterMl / profile.waterTargetMl) * 100)}%`,
              },
            ]}
          />
        </View>
      </Card>

      {/* השבוע שלי */}
      <SectionHeader title="השבוע שלי" />
      <Card>
        <View style={{ flexDirection: ROW_LTR, justifyContent: 'space-between' }}>
          {week.map((d) => (
            <View key={d.key} style={{ alignItems: 'center', gap: 6 }}>
              <Text style={styles.weekDay}>{d.dayName}</Text>
              <View
                style={[
                  styles.weekDot,
                  d.done && styles.weekDotDone,
                  d.isToday && !d.done && styles.weekDotToday,
                ]}
              >
                {d.done ? (
                  <Ionicons name="checkmark" size={14} color="#0B0D0F" />
                ) : null}
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* פעולות מהירות */}
      <SectionHeader title="קיצורי דרך" />
      <View style={{ flexDirection: ROW, gap: spacing.md }}>
        <QuickAction
          icon="search"
          label="ספריית תרגילים"
          onPress={() => router.push('/exercise/picker?mode=browse')}
        />
        <QuickAction
          icon="add-circle"
          label="אימון חופשי"
          onPress={() => router.push('/(tabs)/workouts')}
        />
        <QuickAction
          icon="scale-outline"
          label="שקילה"
          onPress={() => router.push('/(tabs)/progress')}
        />
      </View>
    </ScrollView>
  );
}

function greetingByHour(): string {
  const h = new Date().getHours();
  if (h < 5) return 'לילה טוב';
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}

function Meta({
  icon,
  text,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
}) {
  return (
    <View style={{ flexDirection: ROW, alignItems: 'center', gap: 5 }}>
      <Ionicons name={icon} size={14} color={colors.textFaint} />
      <Text style={styles.metaText}>{text}</Text>
    </View>
  );
}

function WaterBtn({
  label,
  onPress,
  muted,
}: {
  label: string;
  onPress: () => void;
  muted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.waterBtn,
        muted && { backgroundColor: colors.cardAlt },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[styles.waterBtnText, muted && { color: colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, pressed && { opacity: 0.75 }]}
    >
      <Ionicons name={icon} size={20} color={colors.lime} />
      <Text style={styles.quickText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: 0 },
  header: { alignItems: 'center', marginBottom: spacing.lg },
  greeting: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  name: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 2 },
  streak: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.limeSoft,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  streakText: { color: colors.lime, fontWeight: '900', fontSize: 14 },
  activeCard: { borderRadius: radius.lg, padding: spacing.lg },
  activeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#0B0D0F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTitle: { fontSize: 12, fontWeight: '800', color: 'rgba(11,13,15,0.7)' },
  activeSub: { fontSize: 16, fontWeight: '900', color: '#0B0D0F', marginTop: 1 },
  cardTitle: { fontSize: 19, fontWeight: '900', color: colors.text },
  cardSub: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textFaint, fontWeight: '700' },
  exPreview: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  exPreviewText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  exPreviewMore: { fontSize: 12, color: colors.textFaint, fontWeight: '600' },
  waterValue: { fontSize: 26, fontWeight: '900', color: colors.info },
  waterUnit: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  waterBtn: {
    backgroundColor: 'rgba(79,168,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  waterBtnText: { color: colors.info, fontWeight: '800', fontSize: 13 },
  waterTrack: {
    height: 8,
    backgroundColor: colors.cardAlt,
    borderRadius: 4,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  waterFill: { height: '100%', backgroundColor: colors.info, borderRadius: 4 },
  weekDay: { fontSize: 11, color: colors.textFaint, fontWeight: '700' },
  weekDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDotDone: { backgroundColor: colors.lime },
  weekDotToday: { borderWidth: 2, borderColor: colors.lime },
  quick: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 8,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textAlign: 'center',
  },
});
