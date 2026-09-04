import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ExerciseDemo } from '../../src/components/ExerciseDemo';
import { RestTimer } from '../../src/components/RestTimer';
import { Button, Card, EmptyState } from '../../src/components/ui';
import { EXERCISE_BY_ID } from '../../src/data/exercises';
import { useApp } from '../../src/store/AppStore';
import { LoggedExercise } from '../../src/store/types';
import { ROW, ROW_LTR, rtlText } from '../../src/theme/rtl';
import { colors, radius, spacing } from '../../src/theme/theme';
import { formatDuration } from '../../src/utils/date';

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId: string; added?: string }>();
  const {
    state,
    activeSession,
    updateSet,
    addSet,
    removeSet,
    addExerciseToSession,
    removeExerciseFromSession,
    replaceExerciseInSession,
    finishWorkout,
    cancelWorkout,
    personalRecord,
  } = useApp();

  const session =
    activeSession ?? state.sessions.find((s) => s.id === params.sessionId) ?? null;
  const readOnly = !!session?.finishedAt;

  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!session || readOnly) return;
    const t = setInterval(() => setElapsed(Date.now() - session.startedAt), 1000);
    setElapsed(Date.now() - session.startedAt);
    return () => clearInterval(t);
  }, [session, readOnly]);

  // קליטת תרגיל שנבחר במסך הבחירה
  useEffect(() => {
    const picked = params.added;
    if (!picked || readOnly) return;
    if (replaceIndex != null) {
      replaceExerciseInSession(replaceIndex, picked);
      setReplaceIndex(null);
    } else {
      addExerciseToSession(picked);
    }
    router.setParams({ added: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.added]);

  const stats = useMemo(() => {
    if (!session) return { done: 0, total: 0, volume: 0 };
    let done = 0;
    let total = 0;
    let volume = 0;
    session.exercises.forEach((e) =>
      e.sets.forEach((s) => {
        total += 1;
        if (s.done) {
          done += 1;
          volume += (s.weight ?? 0) * (s.reps ?? 0);
        }
      }),
    );
    return { done, total, volume };
  }, [session]);

  const onToggleSet = useCallback(
    (exIndex: number, setIndex: number, ex: LoggedExercise) => {
      const set = ex.sets[setIndex];
      const nextDone = !set.done;
      updateSet(exIndex, setIndex, { done: nextDone });
      if (nextDone) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        }
        setRest({ seconds: ex.restSeconds, key: Date.now() });
      }
    },
    [updateSet],
  );

  if (!session) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 60 }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="האימון לא נמצא"
          text="ייתכן שהאימון בוטל או נמחק."
        />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <Button title="חזרה" onPress={() => router.replace('/(tabs)/home')} />
        </View>
      </View>
    );
  }

  const confirmFinish = () => {
    if (stats.done === 0) {
      Alert.alert('לא סומנו סטים', 'סיימו לפחות סט אחד לפני סיום האימון.');
      return;
    }
    Alert.alert('לסיים את האימון?', `השלמת ${stats.done} מתוך ${stats.total} סטים.`, [
      { text: 'המשך להתאמן', style: 'cancel' },
      {
        text: 'סיים',
        style: 'default',
        onPress: () => {
          const finished = finishWorkout();
          router.replace(
            finished ? `/workout/summary?id=${finished.id}` : '/(tabs)/home',
          );
        },
      },
    ]);
  };

  const confirmCancel = () => {
    Alert.alert('לבטל את האימון?', 'כל מה שתיעדת באימון הזה יימחק.', [
      { text: 'לא', style: 'cancel' },
      {
        text: 'בטל אימון',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          router.replace('/(tabs)/home');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* כותרת עליונה */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={{ flexDirection: ROW, alignItems: 'center' }}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerBtn}>
            <Ionicons name="chevron-forward" size={22} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerTitle}>{session.name}</Text>
            <Text style={styles.headerSub}>
              {readOnly
                ? 'אימון שהושלם'
                : `${formatDuration(elapsed)} · ${stats.done}/${stats.total} סטים`}
            </Text>
          </View>
          <Pressable onPress={confirmCancel} hitSlop={10} style={styles.headerBtn}>
            {!readOnly ? (
              <Ionicons name="trash-outline" size={19} color={colors.danger} />
            ) : (
              <View style={{ width: 19 }} />
            )}
          </Pressable>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${stats.total ? (stats.done / stats.total) * 100 : 0}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl * 2,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {session.exercises.length === 0 ? (
          <Card>
            <EmptyState
              icon="add-circle-outline"
              title="האימון ריק"
              text="הוסיפו תרגילים מספריית התרגילים כדי להתחיל."
            />
          </Card>
        ) : null}

        {session.exercises.map((ex, i) => {
          const meta = EXERCISE_BY_ID[ex.exerciseId];
          const pr = personalRecord(ex.exerciseId);
          if (!meta) return null;
          return (
            <Card key={`${ex.exerciseId}-${i}`} style={styles.exCard}>
              <ExerciseDemo exercise={meta} height={190} />

              <View style={{ gap: 4 }}>
                <Text style={[styles.exName, rtlText]}>{meta.name}</Text>
                <Text style={[styles.exTarget, rtlText]}>
                  {ex.sets.length} סטים · {ex.targetReps} חזרות
                  {pr ? ` · שיא: ${pr.weight} ק"ג × ${pr.reps}` : ''}
                </Text>
                {ex.note ? (
                  <Text style={[styles.exNote, rtlText]}>💡 {ex.note}</Text>
                ) : null}
              </View>

              {/* פעולות על התרגיל */}
              <View style={{ flexDirection: ROW, gap: spacing.sm }}>
                <ActionBtn
                  icon="swap-horizontal"
                  label="החלפה"
                  disabled={readOnly}
                  onPress={() => {
                    setReplaceIndex(i);
                    router.push(
                      `/exercise/picker?mode=replace&muscle=${meta.muscle}&sessionId=${session.id}`,
                    );
                  }}
                />
                <ActionBtn
                  icon="stats-chart"
                  label="היסטוריה"
                  color={colors.info}
                  onPress={() => router.push(`/exercise/${meta.id}?tab=history`)}
                />
                <ActionBtn
                  icon="help-circle-outline"
                  label="הסבר"
                  color={colors.purple}
                  onPress={() => router.push(`/exercise/${meta.id}`)}
                />
                <ActionBtn
                  icon="trash-outline"
                  label="הסרה"
                  color={colors.danger}
                  disabled={readOnly}
                  onPress={() => removeExerciseFromSession(i)}
                />
              </View>

              {/* טבלת הסטים */}
              <View style={{ gap: spacing.sm }}>
                <View style={[styles.setHeader, { flexDirection: ROW }]}>
                  <Text style={[styles.setHeadCell, { width: 28 }]}>#</Text>
                  <Text style={[styles.setHeadCell, { flex: 1 }]}>משקל (ק"ג)</Text>
                  <Text style={[styles.setHeadCell, { flex: 1 }]}>חזרות</Text>
                  <Text style={[styles.setHeadCell, { width: 40 }]}>✓</Text>
                </View>

                {ex.sets.map((set, j) => (
                  <View
                    key={j}
                    style={[
                      styles.setRow,
                      { flexDirection: ROW },
                      set.done && styles.setRowDone,
                    ]}
                  >
                    <Text style={styles.setIndex}>{j + 1}</Text>

                    <NumField
                      value={set.weight}
                      placeholder="0"
                      editable={!readOnly}
                      onChange={(v) => updateSet(i, j, { weight: v })}
                    />
                    <NumField
                      value={set.reps}
                      placeholder={ex.targetReps.replace(/[^0-9-]/g, '') || '0'}
                      editable={!readOnly}
                      onChange={(v) => updateSet(i, j, { reps: v })}
                    />

                    <Pressable
                      disabled={readOnly}
                      onPress={() => onToggleSet(i, j, ex)}
                      style={[styles.check, set.done && styles.checkDone]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={17}
                        color={set.done ? '#0B0D0F' : colors.textFaint}
                      />
                    </Pressable>
                  </View>
                ))}

                {!readOnly ? (
                  <View style={{ flexDirection: ROW, gap: spacing.sm }}>
                    <Pressable style={styles.setBtn} onPress={() => addSet(i)}>
                      <Ionicons name="add" size={15} color={colors.lime} />
                      <Text style={styles.setBtnText}>סט נוסף</Text>
                    </Pressable>
                    {ex.sets.length > 1 ? (
                      <Pressable style={styles.setBtn} onPress={() => removeSet(i)}>
                        <Ionicons name="remove" size={15} color={colors.textMuted} />
                        <Text style={[styles.setBtnText, { color: colors.textMuted }]}>
                          הסר סט
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            </Card>
          );
        })}

        {!readOnly ? (
          <Button
            title="הוסף תרגיל"
            icon="add"
            variant="secondary"
            onPress={() => {
              setReplaceIndex(null);
              router.push(`/exercise/picker?mode=add&sessionId=${session.id}`);
            }}
          />
        ) : null}
      </ScrollView>

      {/* טיימר מנוחה */}
      {rest && !readOnly ? (
        <RestTimer
          key={rest.key}
          seconds={rest.seconds}
          onClose={() => setRest(null)}
        />
      ) : null}

      {/* סרגל תחתון */}
      {!readOnly ? (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={{ flexDirection: ROW, alignItems: 'center', gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerLabel}>נפח אימון</Text>
              <Text style={[styles.footerValue, { flexDirection: ROW_LTR }]}>
                {Math.round(stats.volume).toLocaleString('he-IL')} ק"ג
              </Text>
            </View>
            <Button
              title="סיים אימון"
              icon="checkmark-done"
              style={{ flex: 1.4 }}
              onPress={confirmFinish}
            />
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

function ActionBtn({
  icon,
  label,
  onPress,
  color = colors.textMuted,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionBtn,
        { flexDirection: ROW },
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 },
      ]}
    >
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.actionText, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function NumField({
  value,
  onChange,
  placeholder,
  editable = true,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  placeholder: string;
  editable?: boolean;
}) {
  const [text, setText] = useState(value != null ? String(value) : '');

  useEffect(() => {
    setText(value != null ? String(value) : '');
  }, [value]);

  return (
    <TextInput
      value={text}
      editable={editable}
      onChangeText={(t) => {
        const clean = t.replace(/[^0-9.]/g, '');
        setText(clean);
        const n = parseFloat(clean);
        onChange(Number.isFinite(n) ? n : null);
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      keyboardType="decimal-pad"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.bgElevated,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: colors.text },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 4,
    backgroundColor: colors.cardAlt,
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.lime, borderRadius: 2 },
  exCard: { gap: spacing.md, padding: spacing.md },
  exName: { fontSize: 18, fontWeight: '900', color: colors.text },
  exTarget: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  exNote: { fontSize: 12, color: colors.warn, fontWeight: '600' },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { fontSize: 11, fontWeight: '800' },
  setHeader: { paddingHorizontal: 4, gap: spacing.sm, alignItems: 'center' },
  setHeadCell: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textFaint,
    textAlign: 'center',
  },
  setRow: {
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgElevated,
    borderRadius: radius.md,
    padding: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  setRowDone: {
    borderColor: colors.lime,
    backgroundColor: 'rgba(198,244,50,0.06)',
  },
  setIndex: {
    width: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: colors.textFaint,
  },
  input: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '800',
    color: colors.lime,
  },
  check: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.cardAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.lime },
  setBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  setBtnText: { fontSize: 12, fontWeight: '800', color: colors.lime },
  footer: {
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  footerLabel: { fontSize: 11, fontWeight: '700', color: colors.textFaint },
  footerValue: { fontSize: 18, fontWeight: '900', color: colors.text },
});
